/**
 * AI Service - OpenAI & AI MicroMind Integration
 * 
 * Handles AI operations including chat, completions, embeddings, and integration with AI MicroMind.
 * 
 * @module sdk/services/aiService
 */

const { Configuration, OpenAIApi } = require('openai');
const axios = require('axios');

// Initialize OpenAI
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);

// AI MicroMind configuration
const AI_MICROMIND_URL = process.env.MICROMIND_API_URL || process.env.AI_MICROMIND_API_URL || process.env.AI_API_URL || 'https://core.aimicromind.com/api/v1/prediction/75b44d00-588b-458e-ae1e-2ca79369119e';
const AI_MICROMIND_KEY = process.env.MICROMIND_API_KEY || process.env.AI_MICROMIND_API_KEY || process.env.AI_API_KEY;

/**
 * Chat completion with OpenAI GPT
 * @param {Array} messages - Array of message objects
 * @param {Object} options - Completion options
 * @returns {Promise<Object>} { content, model, tokensUsed, cost }
 */
async function chatCompletion(messages, options = {}) {
    const {
        model = 'gpt-4',
        temperature = 0.7,
        maxTokens = 2000,
        systemPrompt = null
    } = options;

    try {
        const conversationMessages = systemPrompt
            ? [{ role: 'system', content: systemPrompt }, ...messages]
            : messages;

        const response = await openai.createChatCompletion({
            model,
            messages: conversationMessages,
            temperature,
            max_tokens: maxTokens
        });

        const completion = response.data.choices[0].message;
        const tokensUsed = response.data.usage.total_tokens;

        return {
            content: completion.content,
            model,
            tokensUsed,
            cost: calculateCost(model, tokensUsed)
        };
    } catch (error) {
        console.error('[AI Service] Chat completion error:', error);
        throw error;
    }
}

/**
 * Generate embeddings for semantic search
 * @param {string} text - Text to generate embeddings for
 * @returns {Promise<Object>} { vector, model }
 */
async function generateEmbeddings(text) {
    try {
        const response = await openai.createEmbedding({
            model: 'text-embedding-ada-002',
            input: text
        });

        return {
            vector: response.data.data[0].embedding,
            model: 'text-embedding-ada-002'
        };
    } catch (error) {
        console.error('[AI Service] Embeddings error:', error);
        throw error;
    }
}

/**
 * Generate report using AI
 * @param {string} prompt - Report generation prompt
 * @param {Object} data - Data to analyze
 * @param {string} format - Output format ('markdown', 'html', 'text')
 * @returns {Promise<Object>} { report, summary, tokensUsed }
 */
async function generateReport(prompt, data, format = 'markdown') {
    const fullPrompt = `${prompt}\n\nData:\n${JSON.stringify(data, null, 2)}\n\nGenerate a ${format} report.`;

    const result = await chatCompletion([
        { role: 'user', content: fullPrompt }
    ], {
        maxTokens: 3000,
        systemPrompt: 'You are an expert data analyst. Generate clear, comprehensive reports.'
    });

    return {
        report: result.content,
        summary: result.content.substring(0, 200) + '...',
        tokensUsed: result.tokensUsed
    };
}

/**
 * Analyze document content
 * @param {string} documentContent - Document text
 * @param {string} analysisType - Type of analysis ('summary', 'sentiment', 'keywords')
 * @returns {Promise<Object>} Analysis results
 */
async function analyzeDocument(documentContent, analysisType = 'summary') {
    const prompts = {
        summary: 'Provide a concise summary of this document:',
        sentiment: 'Analyze the sentiment of this document (positive, negative, neutral):',
        keywords: 'Extract the main keywords and topics from this document:'
    };

    const result = await chatCompletion([
        { role: 'user', content: `${prompts[analysisType]}\n\n${documentContent}` }
    ], {
        maxTokens: 500
    });

    return {
        analysis: result.content,
        type: analysisType,
        tokensUsed: result.tokensUsed
    };
}

/**
 * Generate SQL from natural language
 * @param {string} naturalQuery - Natural language query
 * @param {Object} schema - Database schema
 * @param {string} organizationId - Organization ID for tenant scoping
 * @returns {Promise<Object>} { sql, explanation, confidence, tenantScoped }
 */
async function textToSQL(naturalQuery, schema, organizationId) {
    const prompt = `Given this database schema:\n${JSON.stringify(schema, null, 2)}\n\nGenerate a SQL query for: "${naturalQuery}"\n\nIMPORTANT: The query MUST include WHERE organizationId = '${organizationId}' for tenant isolation.`;

    const result = await chatCompletion([
        { role: 'user', content: prompt }
    ], {
        systemPrompt: 'You are a SQL expert. Generate safe, optimized queries with tenant isolation.',
        temperature: 0.3
    });

    const sql = extractSQLFromResponse(result.content);

    return {
        sql,
        explanation: result.content,
        confidence: 0.85,
        tenantScoped: sql.toLowerCase().includes('organizationid')
    };
}

/**
 * Call AI MicroMind API
 * @param {string} endpoint - API endpoint
 * @param {Object} payload - Request payload
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Object>} API response
 */
async function callMicroMind(endpoint, payload, organizationId) {
    try {
        let targetUrl;
        if (AI_MICROMIND_URL.includes('/api/v1/prediction/')) {
            targetUrl = AI_MICROMIND_URL;
        } else {
            const cleanBase = AI_MICROMIND_URL.replace(/\/+$/, '');
            const cleanEndpoint = endpoint ? (endpoint.startsWith('/') ? endpoint : `/${endpoint}`) : '';
            targetUrl = `${cleanBase}${cleanEndpoint}`;
        }

        const headers = {
            'Content-Type': 'application/json'
        };
        if (AI_MICROMIND_KEY) {
            headers['Authorization'] = `Bearer ${AI_MICROMIND_KEY}`;
        }

        const response = await axios.post(
            targetUrl,
            {
                ...payload,
                organizationId
            },
            { headers }
        );

        return response.data;
    } catch (error) {
        console.error('[AI Service] MicroMind API error:', error);
        throw error;
    }
}

/**
 * Chat with conversation context
 * @param {string} message - User message
 * @param {string} conversationId - Conversation ID
 * @param {string} organizationId - Organization ID
 * @returns {Promise<Object>} { response, conversationId, tokensUsed }
 */
async function chatWithContext(message, conversationId, organizationId) {
    // In production, retrieve conversation history from database
    // For now, this is a simplified version

    const result = await chatCompletion([
        { role: 'user', content: message }
    ]);

    return {
        response: result.content,
        conversationId: conversationId || generateConversationId(),
        tokensUsed: result.tokensUsed,
        cost: result.cost
    };
}

/**
 * Calculate OpenAI API cost
 * @param {string} model - Model name
 * @param {number} tokens - Number of tokens
 * @returns {number} Cost in USD
 */
function calculateCost(model, tokens) {
    const pricing = {
        'gpt-4': 0.03 / 1000,
        'gpt-3.5-turbo': 0.002 / 1000,
        'text-embedding-ada-002': 0.0001 / 1000
    };

    return (pricing[model] || 0) * tokens;
}

/**
 * Extract SQL query from AI response
 */
function extractSQLFromResponse(response) {
    const sqlMatch = response.match(/```sql\n([\s\S]*?)\n```/);
    if (sqlMatch) {
        return sqlMatch[1].trim();
    }

    // Fallback: look for SELECT statement
    const selectMatch = response.match(/SELECT[\s\S]*?;/i);
    return selectMatch ? selectMatch[0] : response;
}

/**
 * Generate conversation ID
 */
function generateConversationId() {
    return `conv_${Date.now()}_${Math.random().toString(36).substring(7)}`;
}

module.exports = {
    chatCompletion,
    generateEmbeddings,
    generateReport,
    analyzeDocument,
    textToSQL,
    callMicroMind,
    chatWithContext,
    calculateCost
};
