/**
 * Receipt & Bank Transfer Parser & Automatic Transaction Creator Service
 * 
 * Analyzes AI responses from receipt image scans and bank transfer screenshots,
 * extracts structured financial details, and automatically persists verified transactions into the Montera database.
 */

const { PrismaClient } = require('@prisma/client');
const financialRadarService = require('./financialRadarService');
const prisma = new PrismaClient();

/**
 * Extract structured transaction details from AI response text or JSON
 */
function parseTransactionDetailsFromAI(aiText) {
    if (!aiText || typeof aiText !== 'string') return null;

    // 0. Safeguard: If the AI explicitly says it did not see or could not read an attached image, do NOT parse any fallback numbers
    const noImageVisible = /(?:don't see|do not see|cannot see|can't see|unable to see|no attached image|no attached receipt|didn't see|did not see|could not see|please upload the image|please attach|can't independently read the image)/i.test(aiText);

    // 1. Try to find a JSON block in the AI response: ```json ... ``` or raw JSON
    const jsonMatch = aiText.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || aiText.match(/(\{[\s\S]*"amount"[\s\S]*\})/);
    if (jsonMatch) {
        try {
            const rawJson = JSON.parse(jsonMatch[1]);
            if (rawJson.amount !== undefined && rawJson.amount !== null) {
                const amt = parseFloat(rawJson.amount);
                if (!isNaN(amt) && amt > 0) {
                    const type = (rawJson.type && String(rawJson.type).toUpperCase() === 'INCOME') ? 'INCOME' : 'EXPENSE';
                    return {
                        amount: amt,
                        currency: rawJson.currency || 'USD',
                        type,
                        merchant: rawJson.merchant || rawJson.vendor || rawJson.store || rawJson.recipient || rawJson.sender || rawJson.businessName || null,
                        date: rawJson.date || rawJson.transactionDate || null,
                        time: rawJson.time || null,
                        category: rawJson.category || rawJson.expenseCategory || null,
                        paymentMethod: rawJson.paymentMethod || (type === 'INCOME' ? 'BANK_TRANSFER' : 'CARD'),
                        bank: rawJson.bank || rawJson.paymentProvider || rawJson.service || null,
                        referenceId: rawJson.referenceId || rawJson.transactionId || rawJson.referenceNumber || null,
                        description: rawJson.description || rawJson.items?.join(', ') || rawJson.note || null
                    };
                }
            }
        } catch (e) {
            // Fall back
        }
    }

    // If the AI indicated no image was visible or all JSON fields were null, abort immediately
    if (noImageVisible) {
        return null;
    }

    let extracted = {
        amount: null,
        currency: 'USD',
        type: 'EXPENSE',
        merchant: null,
        date: null,
        time: null,
        category: null,
        paymentMethod: 'CARD',
        bank: null,
        referenceId: null,
        description: null
    };

    // 2. Regex Parsing for Amount
    const amountPatterns = [
        /(?:total\s*(?:amount)?|grand\s*total|amount(?:\s*due)?|net\s*total|transferred\s*amount)[\s:]*[\$€£]?\s*([0-9]+(?:[.,][0-9]{2})?)/i,
        /[\$€£]\s*([0-9]+(?:[.,][0-9]{2}))/,
        /([0-9]+(?:[.,][0-9]{2}))\s*(?:EGP|USD|EUR|GBP|SAR|AED)/i,
        /(?:amount|total)[\s:]*([0-9]+(?:\.[0-9]{1,2})?)/i
    ];

    for (const pattern of amountPatterns) {
        const match = aiText.match(pattern);
        if (match && match[1]) {
            const parsed = parseFloat(match[1].replace(',', '.'));
            if (!isNaN(parsed) && parsed > 0) {
                extracted.amount = parsed;
                break;
            }
        }
    }

    // If no valid positive amount could be found, return null
    if (!extracted.amount) {
        return null;
    }

    // 3. Currency detection
    const currencyMatch = aiText.match(/\b(EGP|USD|EUR|GBP|SAR|AED|CAD|AUD)\b/i);
    if (currencyMatch) {
        extracted.currency = currencyMatch[1].toUpperCase();
    } else if (aiText.includes('€')) {
        extracted.currency = 'EUR';
    } else if (aiText.includes('£')) {
        extracted.currency = 'GBP';
    } else if (aiText.includes('$')) {
        extracted.currency = 'USD';
    }

    // 4. Type detection (INCOME vs EXPENSE)
    if (/received\s*from|incoming\s*transfer|deposit|salary|refund|credited|money\s*in/i.test(aiText)) {
        extracted.type = 'INCOME';
    } else {
        extracted.type = 'EXPENSE';
    }

    // 5. Merchant / Recipient / Sender Parsing
    const merchantPatterns = [
        /(?:merchant|store|vendor|business|establishment)[\s:]+([^\n\r,\.]+)/i,
        /(?:recipient|paid\s*to|sent\s*to|transfer\s*to|beneficiary)[\s:]+([^\n\r,\.]+)/i,
        /(?:sender|received\s*from|from)[\s:]+([^\n\r,\.]+)/i,
        /(?:at)\s+([A-Z0-9][A-Za-z0-9\s&'-]{2,25})/
    ];

    for (const pattern of merchantPatterns) {
        const match = aiText.match(pattern);
        if (match && match[1]) {
            let clean = match[1].trim().replace(/\s+(?:on|for|at|dated)\s+.*$/i, '').trim();
            if (clean.length >= 2 && !clean.toLowerCase().includes('receipt') && !clean.toLowerCase().includes('transaction')) {
                extracted.merchant = clean;
                break;
            }
        }
    }

    // 6. Bank / Payment Provider
    const bankMatch = aiText.match(/\b(Instapay|CIB|NBE|QNB|Banque Misr|Vodafone Cash|Orange Money|Etisalat Cash|Fawry|Apple Pay|Google Pay|PayPal|Stripe|Chase|Bank of America|Wells Fargo|Revolut|Monzo)\b/i);
    if (bankMatch) {
        extracted.bank = bankMatch[1];
    }

    // 7. Reference / Transaction ID
    const refMatch = aiText.match(/(?:reference(?:\s*no|\s*id|\s*number)?|transaction\s*id|txn\s*id|ref\s*#)[\s:]+([A-Za-z0-9\-_]{5,30})/i);
    if (refMatch) {
        extracted.referenceId = refMatch[1];
    }

    // 8. Date Parsing
    const datePatterns = [
        /(?:date)[\s:]+([0-9]{4}[-/][0-9]{1,2}[-/][0-9]{1,2})/i,
        /(?:date)[\s:]+([0-9]{1,2}[-/][0-9]{1,2}[-/][0-9]{4})/i,
        /([0-9]{4}[-/][0-9]{2}[-/][0-9]{2})/
    ];

    for (const pattern of datePatterns) {
        const match = aiText.match(pattern);
        if (match && match[1]) {
            extracted.date = match[1].trim();
            break;
        }
    }

    // 9. Category Parsing
    const categoryPatterns = [
        /(?:category)[\s:]+([^\n\r,\.]+)/i
    ];

    for (const pattern of categoryPatterns) {
        const match = aiText.match(pattern);
        if (match && match[1]) {
            extracted.category = match[1].trim();
            break;
        }
    }

    // 10. Payment Method
    if (extracted.bank && /instapay|vodafone\s*cash|orange\s*money|etisalat\s*cash|fawry|apple\s*pay|google\s*pay|paypal/i.test(extracted.bank)) {
        extracted.paymentMethod = 'E_WALLET';
    } else if (/cash/i.test(aiText)) {
        extracted.paymentMethod = 'CASH';
    } else if (/bank\s*transfer|wire|instapay|iban/i.test(aiText)) {
        extracted.paymentMethod = 'BANK_TRANSFER';
    } else if (/e-wallet|wallet|apple\s*pay|google\s*pay/i.test(aiText)) {
        extracted.paymentMethod = 'E_WALLET';
    } else {
        extracted.paymentMethod = 'CARD';
    }

    return extracted;
}

/**
 * Resolve or create a Category in the database for the given organization and type
 */
async function resolveCategory(organizationId, categoryName, type = 'EXPENSE') {
    const txType = (type === 'INCOME') ? 'INCOME' : 'EXPENSE';

    if (!categoryName) {
        // Find existing default or any category for this type
        const defaultCat = await prisma.category.findFirst({
            where: { organizationId, type: txType },
            orderBy: { isDefault: 'desc' }
        });
        if (defaultCat) return defaultCat;

        // Create fallback category
        const fallbackName = txType === 'INCOME' ? 'General Income' : 'General Expense';
        return await prisma.category.create({
            data: {
                organizationId,
                name: fallbackName,
                type: txType,
                color: '#2AAB91',
                icon: txType === 'INCOME' ? 'TrendingUp' : 'Receipt',
                isDefault: true
            }
        });
    }

    const cleanName = categoryName.trim();

    // Check for existing case-insensitive match
    const existing = await prisma.category.findFirst({
        where: {
            organizationId,
            type: txType,
            name: { equals: cleanName, mode: 'insensitive' }
        }
    });

    if (existing) return existing;

    // Map common names to clean labels
    let mappedName = cleanName;
    let icon = txType === 'INCOME' ? 'TrendingUp' : 'Receipt';
    let color = '#2AAB91';

    const lower = cleanName.toLowerCase();
    if (lower.includes('food') || lower.includes('dining') || lower.includes('restaurant') || lower.includes('cafe')) {
        mappedName = 'Food & Dining';
        icon = 'Utensils';
        color = '#1F8180';
    } else if (lower.includes('grocer') || lower.includes('supermarket')) {
        mappedName = 'Groceries';
        icon = 'ShoppingCart';
        color = '#2AAB91';
    } else if (lower.includes('shop') || lower.includes('retail')) {
        mappedName = 'Shopping';
        icon = 'ShoppingBag';
        color = '#0D5254';
    } else if (lower.includes('transport') || lower.includes('gas') || lower.includes('fuel') || lower.includes('uber')) {
        mappedName = 'Transportation';
        icon = 'Car';
        color = '#1F8180';
    } else if (lower.includes('utilit') || lower.includes('bill') || lower.includes('electricity') || lower.includes('water') || lower.includes('mobile') || lower.includes('recharge') || lower.includes('telecom')) {
        mappedName = 'Utilities';
        icon = 'Zap';
        color = '#003F46';
    } else if (lower.includes('health') || lower.includes('pharmacy') || lower.includes('medical')) {
        mappedName = 'Healthcare';
        icon = 'Heart';
        color = '#2AAB91';
    } else if (lower.includes('transfer') || lower.includes('wire')) {
        mappedName = txType === 'INCOME' ? 'Transfer In' : 'Transfer Out';
        icon = 'ArrowRightLeft';
        color = '#1F8180';
    } else if (lower.includes('salary') || lower.includes('payroll')) {
        mappedName = 'Salary';
        icon = 'DollarSign';
        color = '#2AAB91';
    }

    // Try finding mapped category
    const mappedExisting = await prisma.category.findFirst({
        where: {
            organizationId,
            type: txType,
            name: { equals: mappedName, mode: 'insensitive' }
        }
    });

    if (mappedExisting) return mappedExisting;

    // Create new category
    try {
        return await prisma.category.create({
            data: {
                organizationId,
                name: mappedName,
                type: txType,
                color,
                icon,
                isDefault: false
            }
        });
    } catch (e) {
        // Fallback in case of race condition
        return await prisma.category.findFirst({
            where: { organizationId, type: txType }
        });
    }
}

/**
 * Automatically create a transaction in Montera database if receipt details were extracted
 */
async function processAndCreateReceiptTransaction(aiResponseText, auth, receiptDataUrl = null) {
    if (!auth || !auth.userId || !auth.organizationId) {
        console.warn('⚠️ Cannot create transaction: missing auth identity');
        return null;
    }

    const details = parseTransactionDetailsFromAI(aiResponseText);
    if (!details || !details.amount || isNaN(details.amount) || details.amount <= 0) {
        return null;
    }

    try {
        const txType = details.type || 'EXPENSE';
        const category = await resolveCategory(auth.organizationId, details.category, txType);

        let txDate = new Date();
        if (details.date) {
            const parsed = new Date(details.date);
            if (!isNaN(parsed.getTime())) {
                txDate = parsed;
            }
        }

        const merchantName = details.merchant || (txType === 'INCOME' ? 'Incoming Transfer' : (details.bank ? `${details.bank} Payment` : 'Receipt Merchant'));
        
        let descParts = [];
        if (details.description) descParts.push(details.description);
        if (details.bank) descParts.push(`Bank/Service: ${details.bank}`);
        if (details.referenceId) descParts.push(`Ref: ${details.referenceId}`);
        const description = descParts.length > 0 ? descParts.join(' | ') : `Auto-scanned ${txType.toLowerCase()} from image`;

        const createdTx = await prisma.transaction.create({
            data: {
                organizationId: auth.organizationId,
                userId: auth.userId,
                amount: details.amount,
                type: txType,
                categoryId: category.id,
                merchant: merchantName,
                date: txDate,
                paymentMethod: details.paymentMethod || 'CARD',
                description,
                receiptUrl: receiptDataUrl ? 'receipt_attached' : null
            },
            include: { category: true }
        });

        console.log(`✅ [Receipt Auto-Created Transaction]: [${txType}] $${details.amount} at ${merchantName} (${category.name}) - ID: ${createdTx.id}`);

        // Run Financial Radar in background safely without blocking
        financialRadarService.runRadarForUser(auth.organizationId, auth.userId).catch(err => {
            console.error('[Radar Receipt Auto-Check Error]:', err.message);
        });

        return {
            id: createdTx.id,
            amount: Number(createdTx.amount),
            currency: details.currency || 'USD',
            type: createdTx.type,
            categoryId: createdTx.categoryId,
            categoryName: createdTx.category?.name || category.name,
            categoryColor: createdTx.category?.color || '#2AAB91',
            merchant: createdTx.merchant,
            date: createdTx.date.toISOString().split('T')[0],
            paymentMethod: createdTx.paymentMethod,
            bank: details.bank || null,
            referenceId: details.referenceId || null,
            description: createdTx.description,
            createdAt: createdTx.createdAt
        };
    } catch (error) {
        console.error('❌ Failed to auto-create transaction from receipt:', error);
        return null;
    }
}

module.exports = {
    parseTransactionDetailsFromAI,
    resolveCategory,
    processAndCreateReceiptTransaction
};
