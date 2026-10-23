const express = require('express');
const router = express.Router();
const { getFinancialContextForQuery, resolveAuthIdentity } = require('../services/financialContextService');
const { processAndCreateReceiptTransaction } = require('../services/receiptParserService');

/**
 * MicroMind Core Montera Co-Pilot Prediction Endpoint
 */
const CHATFLOW_ID = process.env.AI_CHATFLOW_ID || '75b44d00-588b-458e-ae1e-2ca79369119e';
const MICROMIND_API_URL = process.env.MICROMIND_API_URL || `https://core.aimicromind.com/api/v1/prediction/${CHATFLOW_ID}`;
const AI_API_KEY = process.env.AI_API_KEY || process.env.MICROMIND_API_KEY;

/**
 * Standard Vision OCR Prompt template for receipt & payment screenshot extraction
 */
const RECEIPT_OCR_INSTRUCTIONS = `
Please read and inspect the attached image in detail. This image is a receipt, invoice, or payment / bank transfer screenshot (such as Instapay, CIB, NBE, Vodafone Cash, Apple Pay, PayPal, etc.).

Analyze all visible text and numerical details from the image:
1. Type: EXPENSE (bill payment, purchase, money sent, transfer out) or INCOME (money received, transfer in, salary, deposit).
2. Amount: Exact numerical transaction amount.
3. Currency: Currency symbol or code (e.g. EGP, USD, EUR, GBP, SAR, AED).
4. Merchant / Recipient / Sender: Name of the business, store, recipient, or sender.
5. Date: Transaction date (YYYY-MM-DD or DD-MM-YYYY).
6. Time: Time of transaction if visible.
7. Category: Appropriate category (Food & Dining, Groceries, Shopping, Transportation, Utilities, Healthcare, Salary, Bank Transfer, etc.).
8. Payment Method: CARD, CASH, BANK_TRANSFER, or E_WALLET.
9. Bank / Provider: App or network name (e.g. Instapay / IPN, CIB, NBE, Vodafone Cash) if visible.
10. Reference / Transaction ID: Any reference, transaction, or account/mobile number if visible.
11. Description / Note: Summary of the transaction or recharge note.

CRITICAL: Do NOT invent or fabricate any missing values. If a field is not visible in the image, set it to null.
Output a clear conversational summary of the transaction, and ALWAYS end your response with this exact JSON block:
\`\`\`json
{
  "amount": <number or null>,
  "currency": "<currency or null>",
  "type": "EXPENSE" | "INCOME",
  "merchant": "<merchant/recipient/sender or null>",
  "date": "<YYYY-MM-DD or null>",
  "time": "<time or null>",
  "category": "<category or null>",
  "paymentMethod": "CARD" | "CASH" | "BANK_TRANSFER" | "E_WALLET",
  "bank": "<bank or null>",
  "referenceId": "<ref or null>",
  "description": "<description or null>"
}
\`\`\`
`.trim();

/**
 * Prediction query to MicroMind Core AI workflow with injected financial context & file uploads
 */
async function queryMicroMind(question, financialContext, conversationContext = {}, uploads = []) {
    const chatId = conversationContext.chatId || `montera_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const hasImage = Array.isArray(uploads) && uploads.some(u => (u.mime && u.mime.startsWith('image/')) || (u.data && u.data.startsWith('data:image/')));

    let finalPrompt = question.trim();
    if (hasImage) {
        finalPrompt = `${question.trim()}\n\n${RECEIPT_OCR_INSTRUCTIONS}`;
    } else if (financialContext && financialContext.textSummary) {
        finalPrompt = `${question.trim()}\n\n[VERIFIED DATABASE FINANCIAL CONTEXT]:\n${financialContext.textSummary.trim()}`;
    }

    // Clean uploads array structure for ChatOpenRouter node in Flowise
    const formattedUploads = Array.isArray(uploads) ? uploads.map(u => ({
        data: u.data,
        type: u.type || 'file',
        name: u.name || 'image.png',
        mime: u.mime || 'image/png'
    })) : [];

    const payload = {
        question: finalPrompt,
        chatId,
        context: {
            transactions: financialContext?.transactions || [],
            summary: financialContext?.summary || {},
            dateFilter: financialContext?.dateFilter || null
        },
        vars: {
            transactions: financialContext?.transactions || [],
            summary: financialContext?.summary || {}
        },
        ...(conversationContext.history ? { history: conversationContext.history } : {}),
        ...(formattedUploads.length > 0 ? { uploads: formattedUploads } : {})
    };

    const headers = {
        'Content-Type': 'application/json'
    };
    if (AI_API_KEY) {
        headers['Authorization'] = `Bearer ${AI_API_KEY.trim()}`;
    }

    console.log('\n======================================================');
    console.log('📦 [Montera ➔ MicroMind Core JSON Payload]:');
    console.log(JSON.stringify({
        endpoint: MICROMIND_API_URL,
        chatId,
        hasUploads: formattedUploads.length > 0,
        uploadsCount: formattedUploads.length,
        uploadDetails: formattedUploads.map(u => ({ name: u.name, mime: u.mime, dataLen: u.data?.length })),
        question: question.substring(0, 100) + (question.length > 100 ? '...' : ''),
        userScoped: financialContext?.user?.userId || 'unknown',
        organizationScoped: financialContext?.user?.organizationId || 'unknown'
    }, null, 2));
    console.log('======================================================\n');

    const response = await fetch(MICROMIND_API_URL, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
    });

    const responseText = await response.text();

    let result;
    try {
        result = JSON.parse(responseText);
    } catch (e) {
        result = { text: responseText };
    }

    if (!response.ok) {
        console.error(`❌ [MicroMind Core Error ${response.status}]:`, responseText);
        const error = new Error(result.message || result.error || responseText || `MicroMind API returned status ${response.status}`);
        error.status = response.status;
        error.data = result;
        throw error;
    }

    console.log(`✅ [MicroMind Core Response Received] Status: ${response.status}`);
    result.chatId = chatId;
    return result;
}

/**
 * Main prediction handler for Montera Co-Pilot (Supports Text, Images, and Voice)
 */
async function handlePrediction(req, res) {
    let rawQuestion = req.body.question || req.body.message || req.body.query;
    const rawUploads = req.body.uploads || [];
    const imageBase64 = req.body.image;
    const audioBase64 = req.body.audio;

    const uploads = Array.isArray(rawUploads) ? [...rawUploads] : [];

    if (imageBase64 && typeof imageBase64 === 'string' && !uploads.some(u => u.data === imageBase64)) {
        const mimeMatch = imageBase64.match(/^data:([^;]+);base64,/);
        const mime = mimeMatch ? mimeMatch[1] : 'image/jpeg';
        uploads.push({
            data: imageBase64,
            type: 'file',
            name: req.body.imageName || 'receipt.jpg',
            mime
        });
    }

    if (audioBase64 && typeof audioBase64 === 'string' && !uploads.some(u => u.data === audioBase64)) {
        const mimeMatch = audioBase64.match(/^data:(audio\/[a-zA-Z+]+);base64,/);
        const mime = mimeMatch ? mimeMatch[1] : 'audio/webm';
        uploads.push({
            data: audioBase64,
            type: 'file',
            name: req.body.audioName || 'voice.webm',
            mime
        });
    }

    const hasImageUpload = uploads.some(u => (u.mime && u.mime.startsWith('image/')) || (u.data && u.data.startsWith('data:image/')));

    if ((!rawQuestion || typeof rawQuestion !== 'string' || !rawQuestion.trim()) && hasImageUpload) {
        rawQuestion = 'Please inspect this receipt or payment screenshot and extract all transaction details.';
    }

    if (!rawQuestion || typeof rawQuestion !== 'string' || !rawQuestion.trim()) {
        return res.status(400).json({
            error: 'Bad Request',
            message: 'A question or an attached file upload is required.'
        });
    }

    const cleanQuestion = rawQuestion.trim();

    try {
        // 1. Resolve authenticated user identity
        const auth = await resolveAuthIdentity(req);

        // 2. Retrieve verified financial records from database
        const financialContext = await getFinancialContextForQuery(req, cleanQuestion);

        // 3. Dispatch to MicroMind Core AI workflow
        const conversationContext = {
            chatId: req.body.chatId,
            history: req.body.history
        };

        const result = await queryMicroMind(
            cleanQuestion,
            financialContext,
            conversationContext,
            uploads
        );

        // 4. Extract text representation
        let aiText = '';
        if (typeof result === 'string') {
            aiText = result;
        } else if (result && typeof result === 'object') {
            aiText = result.text ||
                result.answer ||
                result.response ||
                result.result ||
                (result.message && typeof result.message === 'string' ? result.message : '') ||
                JSON.stringify(result);
        }

        // 5. If image was attached or receipt was analyzed, automatically persist transaction to database
        let createdTransaction = null;
        if (hasImageUpload || /"amount"|total amount|merchant|instapay|receipt/i.test(aiText)) {
            createdTransaction = await processAndCreateReceiptTransaction(
                aiText,
                auth,
                imageBase64 || (uploads[0] ? uploads[0].data : null)
            );
        }

        // 6. Return response object
        const responsePayload = {
            ...(typeof result === 'object' ? result : { text: aiText }),
            text: aiText,
            transactionCreated: createdTransaction || undefined,
            audio: result.audio || result.audioUrl || result.speech || undefined,
            speechToText: result.speechToText || undefined,
            chatId: result.chatId || conversationContext.chatId
        };

        return res.json(responsePayload);
    } catch (error) {
        console.error('❌ AI Proxy Error:', error.message);
        return res.status(error.status || 502).json({
            error: 'AI Service Error',
            message: error.message,
            data: error.data || undefined
        });
    }
}

// Routes for Montera Co-Pilot
router.post('/query', handlePrediction);
router.post('/chat', handlePrediction);
router.post('/chat/:chatflowId', handlePrediction);

/**
 * GET /api/v1/ai/health
 */
router.get('/health', (req, res) => {
    res.json({
        status: 'configured',
        endpoint: MICROMIND_API_URL,
        hasApiKey: Boolean(AI_API_KEY),
        timestamp: new Date().toISOString()
    });
});

/**
 * GET /api/v1/ai/chatflows
 */
router.get('/chatflows', (req, res) => {
    res.json([
        { id: '75b44d00-588b-458e-ae1e-2ca79369119e', name: 'Montera Financial Co-Pilot' }
    ]);
});

/**
 * GET /api/v1/ai/sessions
 */
router.get('/sessions', (req, res) => {
    res.json([]);
});

module.exports = router;
