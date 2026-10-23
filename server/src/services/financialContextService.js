/**
 * Financial Context Service for Montera AI Co-Pilot
 * 
 * Retrieves verified database financial data before dispatching queries to MicroMind.
 * Grounded Financial AI: All calculations are deterministic and database-backed.
 */

const { PrismaClient } = require('@prisma/client');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

/**
 * Extract date range from user natural language query
 * Supports: YYYY-MM-DD, DD-MM-YYYY, DD/MM/YYYY, "this month", "today", "yesterday", etc.
 */
function extractDateRangeFromQuery(question) {
    if (!question || typeof question !== 'string') return null;

    const normalized = question.trim().toLowerCase();

    // 1. Match ISO date format: YYYY-MM-DD or YYYY/MM/DD (e.g. 2026-08-30)
    const isoMatch = normalized.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
    if (isoMatch) {
        const year = parseInt(isoMatch[1], 10);
        const month = parseInt(isoMatch[2], 10) - 1; // 0-indexed
        const day = parseInt(isoMatch[3], 10);

        const startDate = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
        const endDate = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        return {
            type: 'exact_date',
            label: dateStr,
            startDate,
            endDate
        };
    }

    // 2. Match European date format: DD-MM-YYYY or DD/MM/YYYY (e.g. 30-08-2026)
    const euMatch = normalized.match(/(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
    if (euMatch) {
        const day = parseInt(euMatch[1], 10);
        const month = parseInt(euMatch[2], 10) - 1;
        const year = parseInt(euMatch[3], 10);

        const startDate = new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
        const endDate = new Date(Date.UTC(year, month, day, 23, 59, 59, 999));
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        return {
            type: 'exact_date',
            label: dateStr,
            startDate,
            endDate
        };
    }

    // 3. Match "this month" or "current month"
    if (normalized.includes('this month') || normalized.includes('current month')) {
        const now = new Date();
        const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
        const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999));
        return {
            type: 'month',
            label: `Month of ${now.toLocaleString('default', { month: 'long', year: 'numeric' })}`,
            startDate: start,
            endDate: end
        };
    }

    // 4. Match "last month"
    if (normalized.includes('last month')) {
        const now = new Date();
        const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1, 0, 0, 0, 0));
        const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 0, 23, 59, 59, 999));
        return {
            type: 'month',
            label: 'Last Month',
            startDate: start,
            endDate: end
        };
    }

    // 5. Match "today"
    if (normalized.includes('today')) {
        const now = new Date();
        const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
        const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 23, 59, 59, 999));
        return {
            type: 'exact_date',
            label: 'Today',
            startDate: start,
            endDate: end
        };
    }

    return null;
}

/**
 * Resolve user and organization ID from request headers or environment token
 */
async function resolveAuthIdentity(req) {
    // 1. From active req.user (if authCheck middleware applied)
    if (req.user && req.user.id && req.user.organizationId) {
        return {
            userId: req.user.id,
            organizationId: req.user.organizationId,
            displayName: req.user.displayName || req.user.email
        };
    }

    // 2. From Authorization header
    const authHeader = req.headers?.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        try {
            const token = authHeader.substring(7);
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (decoded && decoded.id && decoded.organizationId) {
                return {
                    userId: decoded.id,
                    organizationId: decoded.organizationId,
                    displayName: decoded.displayName || decoded.email
                };
            }
        } catch (e) {
            console.warn('⚠️ Token verification warning in AI proxy:', e.message);
        }
    }

    // 3. Fallback: Parse AI_API_KEY from .env (which is a valid test user token)
    const envToken = process.env.AI_API_KEY;
    if (envToken) {
        try {
            const decoded = jwt.verify(envToken, process.env.JWT_SECRET);
            if (decoded && decoded.id && decoded.organizationId) {
                return {
                    userId: decoded.id,
                    organizationId: decoded.organizationId,
                    displayName: decoded.displayName || 'Montera User'
                };
            }
        } catch (e) {}
    }

    // 4. Fallback: Query first active user in database
    try {
        const firstUser = await prisma.user.findFirst({
            select: { id: true, organizationId: true, displayName: true, email: true }
        });
        if (firstUser) {
            return {
                userId: firstUser.id,
                organizationId: firstUser.organizationId,
                displayName: firstUser.displayName || firstUser.email
            };
        }
    } catch (e) {
        console.warn('⚠️ Could not query fallback user from database:', e.message);
    }

    return {
        userId: 'default_user',
        organizationId: 'default_org',
        displayName: 'Montera User'
    };
}

/**
 * Fetch and construct verified financial context for the given user and question
 */
async function getFinancialContextForQuery(req, question) {
    const auth = await resolveAuthIdentity(req);
    const dateRange = extractDateRangeFromQuery(question);

    let whereClause = {
        organizationId: auth.organizationId,
        userId: auth.userId
    };

    if (dateRange && dateRange.startDate && dateRange.endDate) {
        whereClause.date = {
            gte: dateRange.startDate,
            lte: dateRange.endDate
        };
    }

    let transactions = [];
    let isDateFiltered = Boolean(dateRange);

    try {
        // Query transactions matching the criteria
        transactions = await prisma.transaction.findMany({
            where: whereClause,
            include: { category: true },
            orderBy: { date: 'desc' },
            take: 50
        });

        // If date-filtered query returned 0 transactions, also fetch recent transactions
        // so the AI can provide helpful context
        if (isDateFiltered && transactions.length === 0) {
            const recentTransactions = await prisma.transaction.findMany({
                where: {
                    organizationId: auth.organizationId,
                    userId: auth.userId
                },
                include: { category: true },
                orderBy: { date: 'desc' },
                take: 10
            });

            // Keep track of recent ones if exact date had none
            whereClause._fallbackRecent = recentTransactions;
        }
    } catch (dbError) {
        console.error('❌ Error querying database for AI financial context:', dbError.message);
    }

    // Map to clean structured format
    const formattedTransactions = transactions.map(tx => {
        const amountNum = Number(tx.amount);
        const dateStr = tx.date instanceof Date
            ? tx.date.toISOString().split('T')[0]
            : String(tx.date).split('T')[0];

        return {
            id: tx.id,
            amount: amountNum,
            type: tx.type,
            category: tx.category?.name || 'Uncategorized',
            merchant: tx.merchant || 'Unknown Merchant',
            description: tx.description || '',
            date: dateStr,
            paymentMethod: tx.paymentMethod || 'OTHER'
        };
    });

    // Deterministic calculations
    let totalIncome = 0;
    let totalExpenses = 0;
    const categoryTotals = {};

    formattedTransactions.forEach(t => {
        if (t.type === 'INCOME') {
            totalIncome += t.amount;
        } else {
            totalExpenses += t.amount;
            categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
        }
    });

    const netSavings = totalIncome - totalExpenses;

    // Build plain text financial summary block for LLM prompt injection
    let textSummary = '';
    if (isDateFiltered) {
        textSummary += `Date Filter: ${dateRange.label}\n`;
        textSummary += `Found ${formattedTransactions.length} transaction(s) on ${dateRange.label}:\n`;
    } else {
        textSummary += `Recent Transactions (${formattedTransactions.length} records):\n`;
    }

    if (formattedTransactions.length > 0) {
        formattedTransactions.forEach((t, i) => {
            textSummary += `${i + 1}. [${t.type}] $${t.amount.toFixed(2)} | Category: ${t.category} | Merchant: ${t.merchant} | Date: ${t.date}${t.description ? ` | Note: ${t.description}` : ''}\n`;
        });
        textSummary += `\nSummary Totals:\n`;
        textSummary += `- Total Income: $${totalIncome.toFixed(2)}\n`;
        textSummary += `- Total Expenses: $${totalExpenses.toFixed(2)}\n`;
        textSummary += `- Net Balance: ${netSavings >= 0 ? '+' : ''}$${netSavings.toFixed(2)}\n`;
    } else {
        textSummary += `No transactions recorded for this period.\n`;
        if (whereClause._fallbackRecent && whereClause._fallbackRecent.length > 0) {
            textSummary += `\nLatest recorded transactions on other dates:\n`;
            whereClause._fallbackRecent.forEach((t, i) => {
                const dStr = t.date instanceof Date ? t.date.toISOString().split('T')[0] : String(t.date).split('T')[0];
                textSummary += `- ${dStr}: [${t.type}] $${Number(t.amount).toFixed(2)} at ${t.merchant || 'Unknown'} (${t.category?.name || 'Uncategorized'})\n`;
            });
        }
    }

    return {
        user: {
            userId: auth.userId,
            organizationId: auth.organizationId,
            displayName: auth.displayName
        },
        dateFilter: dateRange ? dateRange.label : null,
        transactions: formattedTransactions,
        summary: {
            totalIncome,
            totalExpenses,
            netSavings,
            transactionCount: formattedTransactions.length,
            categoryBreakdown: categoryTotals
        },
        textSummary
    };
}

module.exports = {
    extractDateRangeFromQuery,
    resolveAuthIdentity,
    getFinancialContextForQuery
};
