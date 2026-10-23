/**
 * Financial Radar Service
 * 
 * Proactive anomaly and pattern detection engine for Montera.
 * Scans real database transactions for the authenticated user and creates
 * verified FinancialAlert records without hardcoding or duplicate alerts.
 * 
 * Strict multi-tenant & user isolation: [organizationId, userId].
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Get date range for a given month and year (UTC)
 */
function getMonthDateRange(year, month) {
    const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
    const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
    return { start, end };
}

/**
 * Format currency number to 2 decimal places
 */
function toNum(val) {
    if (val === null || val === undefined) return 0;
    return Math.round(Number(val) * 100) / 100;
}

/**
 * Format month-year string YYYY-MM
 */
function formatPeriod(year, month) {
    return `${year}-${String(month).padStart(2, '0')}`;
}

/**
 * Run the Financial Radar anomaly detection for a specific user & organization
 * 
 * @param {string} organizationId
 * @param {string} userId
 * @param {Object} options - { month, year, minDifferenceThreshold }
 * @returns {Promise<Object>} { checkedCategories, newAlerts, activeAlerts }
 */
async function runRadarForUser(organizationId, userId, options = {}) {
    if (!organizationId || !userId) {
        throw new Error('Organization ID and User ID are required to run Financial Radar');
    }

    const now = new Date();
    const currentYear = options.year || now.getUTCFullYear();
    const currentMonth = options.month || (now.getUTCMonth() + 1);

    // Current period date range
    const { start: curStart, end: curEnd } = getMonthDateRange(currentYear, currentMonth);

    // Previous month date range for comparison
    const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
    const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const { start: prevStart, end: prevEnd } = getMonthDateRange(prevYear, prevMonth);

    const currentPeriodStr = formatPeriod(currentYear, currentMonth);
    const prevPeriodStr = formatPeriod(prevYear, prevMonth);

    // 1. Fetch current month expenses grouped by category
    const curExpenses = await prisma.transaction.findMany({
        where: {
            organizationId,
            userId,
            type: 'EXPENSE',
            date: { gte: curStart, lte: curEnd }
        },
        include: { category: true }
    });

    // 2. Fetch previous month expenses grouped by category
    const prevExpenses = await prisma.transaction.findMany({
        where: {
            organizationId,
            userId,
            type: 'EXPENSE',
            date: { gte: prevStart, lte: prevEnd }
        },
        include: { category: true }
    });

    // 3. Aggregate spending by category
    const curCatMap = new Map();
    for (const tx of curExpenses) {
        const catId = tx.categoryId;
        const catName = tx.category?.name || 'Uncategorized';
        const catIcon = tx.category?.icon || 'Receipt';
        const catColor = tx.category?.color || '#2AAB91';
        const amt = Number(tx.amount);

        if (!curCatMap.has(catId)) {
            curCatMap.set(catId, {
                categoryId: catId,
                categoryName: catName,
                categoryIcon: catIcon,
                categoryColor: catColor,
                totalAmount: 0,
                transactionCount: 0,
                transactions: []
            });
        }
        const entry = curCatMap.get(catId);
        entry.totalAmount += amt;
        entry.transactionCount += 1;
        entry.transactions.push(tx);
    }

    const prevCatMap = new Map();
    for (const tx of prevExpenses) {
        const catId = tx.categoryId;
        const amt = Number(tx.amount);

        if (!prevCatMap.has(catId)) {
            prevCatMap.set(catId, {
                totalAmount: 0,
                transactionCount: 0
            });
        }
        const entry = prevCatMap.get(catId);
        entry.totalAmount += amt;
        entry.transactionCount += 1;
    }

    // 4. Analyze each category for meaningful spending surge
    const createdAlerts = [];
    const existingAlerts = [];

    // Fetch existing unread or active alerts for this user to prevent duplication
    const currentAlerts = await prisma.financialAlert.findMany({
        where: {
            organizationId,
            userId,
            type: 'CATEGORY_SPENDING_INCREASE'
        }
    });

    for (const [catId, curData] of curCatMap.entries()) {
        const prevData = prevCatMap.get(catId) || { totalAmount: 0, transactionCount: 0 };

        const currentAmount = toNum(curData.totalAmount);
        const previousAmount = toNum(prevData.totalAmount);
        const difference = toNum(currentAmount - previousAmount);

        // Only evaluate if there is an increase
        if (difference <= 0) continue;

        let percentageIncrease = 0;
        if (previousAmount > 0) {
            percentageIncrease = toNum(((currentAmount - previousAmount) / previousAmount) * 100);
        } else if (currentAmount > 0) {
            // New category with spending this month
            percentageIncrease = 100;
        }

        // Radar Meaningful Surge Thresholds:
        // - Less than 10% increase: ignore
        // - 10% - 20% increase: only trigger if difference is >= 1,000 EGP
        // - > 20% increase: trigger if difference is >= 200 EGP (meaningful difference)
        let isMeaningful = false;
        if (percentageIncrease > 20 && difference >= 200) {
            isMeaningful = true;
        } else if (percentageIncrease >= 10 && percentageIncrease <= 20 && difference >= 1000) {
            isMeaningful = true;
        }

        if (!isMeaningful) continue;

        // 5. Duplicate Prevention Check
        // Check if an alert already exists for this category and current period
        const isDuplicate = currentAlerts.some(alert => {
            const data = alert.data || {};
            return data.categoryId === catId && data.currentPeriod === currentPeriodStr && alert.status !== 'DISMISSED';
        });

        const alertData = {
            categoryId: catId,
            categoryName: curData.categoryName,
            categoryIcon: curData.categoryIcon,
            categoryColor: curData.categoryColor,
            currentAmount,
            previousAmount,
            difference,
            percentageIncrease,
            currentPeriod: currentPeriodStr,
            previousPeriod: prevPeriodStr,
            currentTxCount: curData.transactionCount,
            previousTxCount: prevData.transactionCount,
            currency: 'EGP'
        };

        if (isDuplicate) {
            // Update the existing alert data with refreshed real amounts if changed
            const existingAlert = currentAlerts.find(alert => {
                const data = alert.data || {};
                return data.categoryId === catId && data.currentPeriod === currentPeriodStr;
            });
            if (existingAlert) {
                const updated = await prisma.financialAlert.update({
                    where: { id: existingAlert.id },
                    data: {
                        message: `Your ${curData.categoryName} spending is ${percentageIncrease}% higher than your previous month. You spent ${difference.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EGP more than usual.`,
                        data: alertData
                    }
                });
                existingAlerts.push(updated);
            }
            continue;
        }

        // 6. Create New FinancialAlert
        const severity = percentageIncrease >= 50 || difference >= 2500 ? 'WARNING' : 'INFO';
        const newAlert = await prisma.financialAlert.create({
            data: {
                organizationId,
                userId,
                type: 'CATEGORY_SPENDING_INCREASE',
                title: `🔎 I found something worth investigating`,
                message: `Your ${curData.categoryName} spending is ${percentageIncrease}% higher than your previous month. You spent ${difference.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EGP more than usual.`,
                severity,
                status: 'UNREAD',
                data: alertData
            }
        });

        createdAlerts.push(newAlert);
    }

    console.log(`📡 [Financial Radar] Scan completed for User ${userId}: ${createdAlerts.length} new alert(s), ${existingAlerts.length} updated.`);

    return {
        success: true,
        checkedCategoriesCount: curCatMap.size,
        newAlertsCount: createdAlerts.length,
        newAlerts: createdAlerts,
        updatedAlerts: existingAlerts
    };
}

/**
 * Get detailed investigation metrics and real transactions for a specific alert
 * 
 * @param {string} organizationId
 * @param {string} userId
 * @param {string} alertId
 * @returns {Promise<Object>}
 */
async function getInvestigationDetails(organizationId, userId, alertId) {
    const alert = await prisma.financialAlert.findFirst({
        where: { id: alertId, organizationId, userId }
    });

    if (!alert) {
        throw new Error('Alert not found or access denied');
    }

    const data = alert.data || {};
    const categoryId = data.categoryId;
    const currentPeriodStr = data.currentPeriod; // e.g. "2026-09"
    const prevPeriodStr = data.previousPeriod;   // e.g. "2026-08"

    if (!categoryId || !currentPeriodStr) {
        return {
            alert,
            investigation: null
        };
    }

    const [curYear, curMonth] = currentPeriodStr.split('-').map(Number);
    const [prevYear, prevMonth] = prevPeriodStr.split('-').map(Number);

    const { start: curStart, end: curEnd } = getMonthDateRange(curYear, curMonth);
    const { start: prevStart, end: prevEnd } = getMonthDateRange(prevYear, prevMonth);

    // Fetch real current period transactions
    const curTransactions = await prisma.transaction.findMany({
        where: {
            organizationId,
            userId,
            categoryId,
            type: 'EXPENSE',
            date: { gte: curStart, lte: curEnd }
        },
        include: { category: true },
        orderBy: { date: 'desc' }
    });

    // Fetch real previous period transactions
    const prevTransactions = await prisma.transaction.findMany({
        where: {
            organizationId,
            userId,
            categoryId,
            type: 'EXPENSE',
            date: { gte: prevStart, lte: prevEnd }
        },
        include: { category: true },
        orderBy: { date: 'desc' }
    });

    // Compute merchant distribution for current month
    const merchantMap = new Map();
    let largestTransaction = null;

    for (const tx of curTransactions) {
        const merchant = tx.merchant || 'Unspecified Merchant';
        const amt = Number(tx.amount);

        if (!largestTransaction || amt > Number(largestTransaction.amount)) {
            largestTransaction = {
                id: tx.id,
                merchant,
                amount: amt,
                date: tx.date.toISOString().split('T')[0],
                description: tx.description
            };
        }

        if (!merchantMap.has(merchant)) {
            merchantMap.set(merchant, {
                merchant,
                totalAmount: 0,
                count: 0
            });
        }
        const mEntry = merchantMap.get(merchant);
        mEntry.totalAmount += amt;
        mEntry.count += 1;
    }

    const topMerchants = Array.from(merchantMap.values())
        .sort((a, b) => b.totalAmount - a.totalAmount)
        .slice(0, 5)
        .map(m => ({
            merchant: m.merchant,
            totalAmount: toNum(m.totalAmount),
            count: m.count,
            percentageOfCategory: data.currentAmount > 0 ? toNum((m.totalAmount / data.currentAmount) * 100) : 0
        }));

    // Generate deterministic narrative
    const currentTxCount = curTransactions.length;
    const prevTxCount = prevTransactions.length;
    const avgCurrent = currentTxCount > 0 ? toNum(data.currentAmount / currentTxCount) : 0;
    const avgPrev = prevTxCount > 0 ? toNum(data.previousAmount / prevTxCount) : 0;

    const narrative = `
${data.categoryName} spending increased by ${data.percentageIncrease}%.

Previous month (${prevPeriodStr}): ${data.previousAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} EGP (${prevTxCount} transaction${prevTxCount === 1 ? '' : 's'})
Current month (${currentPeriodStr}): ${data.currentAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} EGP (${currentTxCount} transaction${currentTxCount === 1 ? '' : 's'})
Difference: +${data.difference.toLocaleString('en-US', { minimumFractionDigits: 2 })} EGP

The increase came from ${currentTxCount} transactions (average ${avgCurrent.toLocaleString('en-US', { minimumFractionDigits: 2 })} EGP per transaction), compared with ${prevTxCount} transactions last month (average ${avgPrev.toLocaleString('en-US', { minimumFractionDigits: 2 })} EGP).
`.trim();

    return {
        alert,
        investigation: {
            category: {
                id: categoryId,
                name: data.categoryName,
                icon: data.categoryIcon,
                color: data.categoryColor
            },
            summary: {
                currentAmount: data.currentAmount,
                previousAmount: data.previousAmount,
                difference: data.difference,
                percentageIncrease: data.percentageIncrease,
                currentPeriod: currentPeriodStr,
                previousPeriod: prevPeriodStr,
                currentTxCount,
                prevTxCount,
                avgCurrent,
                avgPrev,
                currency: 'EGP'
            },
            narrative,
            largestTransaction,
            topMerchants,
            currentTransactions: curTransactions.map(tx => ({
                id: tx.id,
                amount: Number(tx.amount),
                merchant: tx.merchant || 'Unspecified',
                date: tx.date.toISOString().split('T')[0],
                paymentMethod: tx.paymentMethod,
                description: tx.description
            })),
            previousTransactions: prevTransactions.map(tx => ({
                id: tx.id,
                amount: Number(tx.amount),
                merchant: tx.merchant || 'Unspecified',
                date: tx.date.toISOString().split('T')[0],
                paymentMethod: tx.paymentMethod,
                description: tx.description
            }))
        }
    };
}

module.exports = {
    runRadarForUser,
    getInvestigationDetails,
    getMonthDateRange
};
