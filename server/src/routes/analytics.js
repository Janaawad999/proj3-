/**
 * Analytics API Routes (Phase 1 Foundation)
 * 
 * Basic deterministic financial metrics and aggregations.
 * Pure database calculations without external LLM estimations.
 */

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authCheck = require('../middleware/authCheck');
const financialService = require('../services/financialAnalysisService');

const prisma = new PrismaClient();
router.use(authCheck);

/**
 * GET /api/analytics/overview
 * Returns high-level financial KPIs (Income, Expenses, Net Savings, Savings Rate, Balance)
 */
router.get('/overview', async (req, res) => {
    try {
        const { organizationId, id: userId } = req.user;
        const { month, year } = req.query;

        const targetMonth = month ? parseInt(month, 10) : undefined;
        const targetYear = year ? parseInt(year, 10) : undefined;

        const overview = await financialService.getOverview(
            prisma,
            organizationId,
            userId,
            { month: targetMonth, year: targetYear }
        );

        res.json(overview);
    } catch (error) {
        console.error('[Analytics] Overview error:', error);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
});

/**
 * GET /api/analytics/categories
 * Returns category spending breakdown for the current/selected month with deltas
 */
router.get('/categories', async (req, res) => {
    try {
        const { organizationId, id: userId } = req.user;
        const { month, year } = req.query;

        const targetMonth = month ? parseInt(month, 10) : undefined;
        const targetYear = year ? parseInt(year, 10) : undefined;

        const breakdown = await financialService.getCategoryBreakdown(
            prisma,
            organizationId,
            userId,
            { month: targetMonth, year: targetYear }
        );

        res.json(breakdown);
    } catch (error) {
        console.error('[Analytics] Categories error:', error);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
});

/**
 * GET /api/analytics/trends
 * Returns 6-month historical monthly cash flow trends
 */
router.get('/trends', async (req, res) => {
    try {
        const { organizationId, id: userId } = req.user;
        const { months = 6 } = req.query;

        const monthsCount = Math.min(24, Math.max(1, parseInt(months, 10)));
        const trends = await financialService.getMonthlyTrends(
            prisma,
            organizationId,
            userId,
            monthsCount
        );

        res.json(trends);
    } catch (error) {
        console.error('[Analytics] Trends error:', error);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
});

/**
 * GET /api/analytics/recent
 * Returns recent transactions for the dashboard
 */
router.get('/recent', async (req, res) => {
    try {
        const { organizationId, id: userId } = req.user;
        const { limit = 8 } = req.query;

        const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
        const recent = await financialService.getRecentTransactions(
            prisma,
            organizationId,
            userId,
            limitNum
        );

        res.json(recent);
    } catch (error) {
        console.error('[Analytics] Recent error:', error);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
});

module.exports = router;
