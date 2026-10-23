/**
 * Financial Analysis Service
 * 
 * Pure deterministic financial calculation engine.
 * Computes exact monetary KPIs, period-over-period deltas, budget utilization,
 * and goal progress without LLM estimation.
 * 
 * All queries and math are strictly scoped to [organizationId, userId].
 */

/**
 * Format a number/Decimal to a rounded 2-decimal number
 */
function toCurrencyNum(val) {
    if (val === null || val === undefined) return 0;
    return Math.round(Number(val) * 100) / 100;
}

/**
 * Get date range for a given month and year (UTC based)
 */
function getMonthDateRange(year, month) {
    const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
    const end = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999));
    return { start, end };
}

/**
 * Get High-Level Overview KPIs
 */
async function getOverview(prisma, organizationId, userId, options = {}) {
    const now = new Date();
    const currentYear = options.year || now.getUTCFullYear();
    const currentMonth = options.month || (now.getUTCMonth() + 1);

    // Current period date range
    const { start: curStart, end: curEnd } = getMonthDateRange(currentYear, currentMonth);

    // Previous month date range for comparison
    const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;
    const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
    const { start: prevStart, end: prevEnd } = getMonthDateRange(prevYear, prevMonth);

    // Fetch current period transactions
    const curTransactions = await prisma.transaction.findMany({
        where: {
            organizationId,
            userId,
            date: { gte: curStart, lte: curEnd }
        },
        select: { amount: true, type: true }
    });

    // Fetch previous period transactions
    const prevTransactions = await prisma.transaction.findMany({
        where: {
            organizationId,
            userId,
            date: { gte: prevStart, lte: prevEnd }
        },
        select: { amount: true, type: true }
    });

    // Compute current period totals
    let totalIncome = 0;
    let totalExpenses = 0;
    for (const tx of curTransactions) {
        const amt = Number(tx.amount);
        if (tx.type === 'INCOME') totalIncome += amt;
        else if (tx.type === 'EXPENSE') totalExpenses += amt;
    }

    // Compute previous period totals
    let prevIncome = 0;
    let prevExpenses = 0;
    for (const tx of prevTransactions) {
        const amt = Number(tx.amount);
        if (tx.type === 'INCOME') prevIncome += amt;
        else if (tx.type === 'EXPENSE') prevExpenses += amt;
    }

    // Lifetime balance (all income - all expenses)
    const allTransactions = await prisma.transaction.findMany({
        where: { organizationId, userId },
        select: { amount: true, type: true }
    });

    let cumulativeBalance = 0;
    for (const tx of allTransactions) {
        const amt = Number(tx.amount);
        if (tx.type === 'INCOME') cumulativeBalance += amt;
        else if (tx.type === 'EXPENSE') cumulativeBalance -= amt;
    }

    const netSavings = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? Math.max(0, (netSavings / totalIncome) * 100) : 0;

    const prevNetSavings = prevIncome - prevExpenses;
    const prevSavingsRate = prevIncome > 0 ? Math.max(0, (prevNetSavings / prevIncome) * 100) : 0;

    // Income & expense deltas
    const expenseDeltaPercent = prevExpenses > 0
        ? ((totalExpenses - prevExpenses) / prevExpenses) * 100
        : 0;
    const incomeDeltaPercent = prevIncome > 0
        ? ((totalIncome - prevIncome) / prevIncome) * 100
        : 0;

    return {
        currency: 'EGP',
        currentPeriod: {
            month: currentMonth,
            year: currentYear,
            startDate: curStart.toISOString(),
            endDate: curEnd.toISOString()
        },
        totalIncome: toCurrencyNum(totalIncome),
        totalExpenses: toCurrencyNum(totalExpenses),
        netSavings: toCurrencyNum(netSavings),
        savingsRate: Math.round(savingsRate * 10) / 10,
        cumulativeBalance: toCurrencyNum(cumulativeBalance),
        transactionCount: curTransactions.length,
        comparison: {
            prevMonth,
            prevYear,
            prevIncome: toCurrencyNum(prevIncome),
            prevExpenses: toCurrencyNum(prevExpenses),
            prevNetSavings: toCurrencyNum(prevNetSavings),
            prevSavingsRate: Math.round(prevSavingsRate * 10) / 10,
            expenseDeltaPercent: Math.round(expenseDeltaPercent * 10) / 10,
            incomeDeltaPercent: Math.round(incomeDeltaPercent * 10) / 10
        }
    };
}

/**
 * Get Category Breakdown with period-over-period deltas
 */
async function getCategoryBreakdown(prisma, organizationId, userId, options = {}) {
    const now = new Date();
    const year = options.year || now.getUTCFullYear();
    const month = options.month || (now.getUTCMonth() + 1);

    const { start: curStart, end: curEnd } = getMonthDateRange(year, month);

    const prevYear = month === 1 ? year - 1 : year;
    const prevMonth = month === 1 ? 12 : month - 1;
    const { start: prevStart, end: prevEnd } = getMonthDateRange(prevYear, prevMonth);

    // Fetch transactions with category
    const [curTxs, prevTxs, categories] = await Promise.all([
        prisma.transaction.findMany({
            where: {
                organizationId,
                userId,
                type: 'EXPENSE',
                date: { gte: curStart, lte: curEnd }
            },
            include: { category: true }
        }),
        prisma.transaction.findMany({
            where: {
                organizationId,
                userId,
                type: 'EXPENSE',
                date: { gte: prevStart, lte: prevEnd }
            },
            include: { category: true }
        }),
        prisma.category.findMany({
            where: { organizationId, type: 'EXPENSE' }
        })
    ]);

    const curCategoryMap = {};
    let totalExpense = 0;

    for (const tx of curTxs) {
        const catId = tx.categoryId;
        const amt = Number(tx.amount);
        totalExpense += amt;

        if (!curCategoryMap[catId]) {
            curCategoryMap[catId] = {
                categoryId: catId,
                categoryName: tx.category?.name || 'Uncategorized',
                categoryIcon: tx.category?.icon || 'Folder',
                categoryColor: tx.category?.color || '#E0AA3E',
                totalSpent: 0,
                transactionCount: 0
            };
        }
        curCategoryMap[catId].totalSpent += amt;
        curCategoryMap[catId].transactionCount += 1;
    }

    const prevCategoryMap = {};
    for (const tx of prevTxs) {
        const catId = tx.categoryId;
        const amt = Number(tx.amount);
        prevCategoryMap[catId] = (prevCategoryMap[catId] || 0) + amt;
    }

    // Format breakdown
    const breakdown = Object.values(curCategoryMap).map(item => {
        const prevSpent = prevCategoryMap[item.categoryId] || 0;
        const delta = item.totalSpent - prevSpent;
        const deltaPercent = prevSpent > 0 ? (delta / prevSpent) * 100 : 0;
        const percentageOfTotal = totalExpense > 0 ? (item.totalSpent / totalExpense) * 100 : 0;

        return {
            ...item,
            totalSpent: toCurrencyNum(item.totalSpent),
            percentageOfTotal: Math.round(percentageOfTotal * 10) / 10,
            prevMonthSpent: toCurrencyNum(prevSpent),
            deltaAmount: toCurrencyNum(delta),
            deltaPercent: Math.round(deltaPercent * 10) / 10
        };
    }).sort((a, b) => b.totalSpent - a.totalSpent);

    return {
        month,
        year,
        totalExpense: toCurrencyNum(totalExpense),
        categories: breakdown
    };
}

/**
 * Get 6-Month Monthly Trends (Income vs Expenses vs Savings)
 */
async function getMonthlyTrends(prisma, organizationId, userId, monthsCount = 6) {
    const now = new Date();
    const trends = [];

    for (let i = monthsCount - 1; i >= 0; i--) {
        const targetDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
        const year = targetDate.getUTCFullYear();
        const month = targetDate.getUTCMonth() + 1;
        const { start, end } = getMonthDateRange(year, month);

        const txs = await prisma.transaction.findMany({
            where: {
                organizationId,
                userId,
                date: { gte: start, lte: end }
            },
            select: { amount: true, type: true }
        });

        let income = 0;
        let expenses = 0;
        for (const tx of txs) {
            const amt = Number(tx.amount);
            if (tx.type === 'INCOME') income += amt;
            else if (tx.type === 'EXPENSE') expenses += amt;
        }

        const netSavings = income - expenses;
        const savingsRate = income > 0 ? Math.max(0, (netSavings / income) * 100) : 0;

        const monthName = targetDate.toLocaleString('en-US', { month: 'short', timeZone: 'UTC' });

        trends.push({
            year,
            month,
            label: `${monthName} ${year}`,
            shortLabel: monthName,
            income: toCurrencyNum(income),
            expenses: toCurrencyNum(expenses),
            netSavings: toCurrencyNum(netSavings),
            savingsRate: Math.round(savingsRate * 10) / 10,
            transactionCount: txs.length
        });
    }

    return trends;
}

/**
 * Get Category Budget Status
 */
async function getBudgetStatus(prisma, organizationId, userId, month, year) {
    const now = new Date();
    const targetYear = year || now.getUTCFullYear();
    const targetMonth = month || (now.getUTCMonth() + 1);

    const { start, end } = getMonthDateRange(targetYear, targetMonth);

    // Fetch all budgets for this month/year
    const budgets = await prisma.budget.findMany({
        where: {
            organizationId,
            userId,
            month: targetMonth,
            year: targetYear
        },
        include: { category: true }
    });

    // Fetch actual expenses for these categories in this month
    const expenses = await prisma.transaction.findMany({
        where: {
            organizationId,
            userId,
            type: 'EXPENSE',
            date: { gte: start, lte: end }
        },
        select: { categoryId: true, amount: true }
    });

    const expenseMap = {};
    for (const tx of expenses) {
        expenseMap[tx.categoryId] = (expenseMap[tx.categoryId] || 0) + Number(tx.amount);
    }

    let totalBudgeted = 0;
    let totalSpent = 0;

    const items = budgets.map(b => {
        const limit = Number(b.amount);
        const spent = expenseMap[b.categoryId] || 0;
        const remaining = limit - spent;
        const percentageUsed = limit > 0 ? (spent / limit) * 100 : 0;
        const isOverBudget = spent > limit;
        const isNearLimit = percentageUsed >= (b.alertThreshold * 100);

        totalBudgeted += limit;
        totalSpent += spent;

        return {
            id: b.id,
            categoryId: b.categoryId,
            categoryName: b.category?.name || 'Category',
            categoryIcon: b.category?.icon || 'Folder',
            categoryColor: b.category?.color || '#E0AA3E',
            budgetAmount: toCurrencyNum(limit),
            spentAmount: toCurrencyNum(spent),
            remainingAmount: toCurrencyNum(remaining),
            percentageUsed: Math.round(percentageUsed * 10) / 10,
            isOverBudget,
            isNearLimit,
            alertThreshold: b.alertThreshold
        };
    }).sort((a, b) => b.percentageUsed - a.percentageUsed);

    const overallPercentage = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

    return {
        month: targetMonth,
        year: targetYear,
        totalBudgeted: toCurrencyNum(totalBudgeted),
        totalSpent: toCurrencyNum(totalSpent),
        totalRemaining: toCurrencyNum(totalBudgeted - totalSpent),
        overallPercentageUsed: Math.round(overallPercentage * 10) / 10,
        budgets: items
    };
}

/**
 * Get Financial Goals Progress
 */
async function getGoalProgress(prisma, organizationId, userId) {
    const goals = await prisma.financialGoal.findMany({
        where: { organizationId, userId },
        orderBy: { createdAt: 'desc' }
    });

    const now = new Date();

    const formattedGoals = goals.map(goal => {
        const target = Number(goal.targetAmount);
        const current = Number(goal.currentAmount);
        const remaining = Math.max(0, target - current);
        const percentage = target > 0 ? Math.min(100, (current / target) * 100) : 0;

        // Calculate months remaining until target date
        const targetDate = new Date(goal.targetDate);
        const diffMs = targetDate.getTime() - now.getTime();
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        const monthsRemaining = Math.max(1, Math.ceil(diffDays / 30));

        const requiredMonthlySaving = remaining > 0 ? remaining / monthsRemaining : 0;

        return {
            id: goal.id,
            title: goal.title,
            targetAmount: toCurrencyNum(target),
            currentAmount: toCurrencyNum(current),
            remainingAmount: toCurrencyNum(remaining),
            progressPercentage: Math.round(percentage * 10) / 10,
            targetDate: goal.targetDate,
            monthsRemaining,
            requiredMonthlySaving: toCurrencyNum(requiredMonthlySaving),
            status: goal.status,
            icon: goal.icon || 'Target',
            category: goal.category
        };
    });

    return formattedGoals;
}

/**
 * Get Recent Transactions
 */
async function getRecentTransactions(prisma, organizationId, userId, limit = 10) {
    const txs = await prisma.transaction.findMany({
        where: { organizationId, userId },
        include: { category: true },
        orderBy: { date: 'desc' },
        take: limit
    });

    return txs.map(tx => ({
        id: tx.id,
        amount: toCurrencyNum(tx.amount),
        type: tx.type,
        merchant: tx.merchant || 'General',
        date: tx.date.toISOString(),
        paymentMethod: tx.paymentMethod,
        description: tx.description,
        isRecurring: tx.isRecurring,
        category: {
            id: tx.category?.id,
            name: tx.category?.name || 'Uncategorized',
            icon: tx.category?.icon || 'Tag',
            color: tx.category?.color || '#E0AA3E'
        }
    }));
}

module.exports = {
    toCurrencyNum,
    getMonthDateRange,
    getOverview,
    getCategoryBreakdown,
    getMonthlyTrends,
    getBudgetStatus,
    getGoalProgress,
    getRecentTransactions
};
