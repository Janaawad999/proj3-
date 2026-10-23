/**
 * Budgets API Routes (Phase 1)
 * 
 * Manages category-level monthly spending limits and computes actual utilization.
 */

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authCheck = require('../middleware/authCheck');
const financialService = require('../services/financialAnalysisService');

const prisma = new PrismaClient();
router.use(authCheck);

/**
 * GET /api/budgets
 * Retrieve budget status for a given month and year (defaults to current month)
 */
router.get('/', async (req, res) => {
    try {
        const { organizationId, id: userId } = req.user;
        const { month, year } = req.query;

        const targetMonth = month ? parseInt(month, 10) : undefined;
        const targetYear = year ? parseInt(year, 10) : undefined;

        const budgetStatus = await financialService.getBudgetStatus(
            prisma,
            organizationId,
            userId,
            targetMonth,
            targetYear
        );

        res.json(budgetStatus);
    } catch (error) {
        console.error('[Budgets] GET error:', error);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
});

/**
 * POST /api/budgets
 * Create or update a category budget for a specific month and year
 */
router.post('/', async (req, res) => {
    try {
        const { organizationId, id: userId } = req.user;
        const {
            categoryId,
            amount,
            month,
            year,
            alertThreshold = 0.8
        } = req.body;

        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            return res.status(400).json({ error: 'Validation Error', message: 'Budget amount must be a positive number' });
        }

        if (!categoryId) {
            return res.status(400).json({ error: 'Validation Error', message: 'Category ID is required' });
        }

        // Verify category belongs to organization
        const category = await prisma.category.findFirst({
            where: { id: categoryId, organizationId }
        });

        if (!category) {
            return res.status(400).json({ error: 'Validation Error', message: 'Category does not belong to your organization' });
        }

        const now = new Date();
        const targetMonth = month ? parseInt(month, 10) : (now.getUTCMonth() + 1);
        const targetYear = year ? parseInt(year, 10) : now.getUTCFullYear();

        const budget = await prisma.budget.upsert({
            where: {
                organizationId_userId_categoryId_month_year: {
                    organizationId,
                    userId,
                    categoryId,
                    month: targetMonth,
                    year: targetYear
                }
            },
            update: {
                amount: parsedAmount,
                alertThreshold: parseFloat(alertThreshold) || 0.8
            },
            create: {
                organizationId,
                userId,
                categoryId,
                amount: parsedAmount,
                month: targetMonth,
                year: targetYear,
                alertThreshold: parseFloat(alertThreshold) || 0.8
            },
            include: { category: true }
        });

        res.status(201).json({
            id: budget.id,
            categoryId: budget.categoryId,
            categoryName: budget.category?.name,
            amount: Number(budget.amount),
            month: budget.month,
            year: budget.year,
            alertThreshold: budget.alertThreshold
        });
    } catch (error) {
        console.error('[Budgets] POST error:', error);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
});

/**
 * DELETE /api/budgets/:id
 * Delete a budget record
 */
router.delete('/:id', async (req, res) => {
    try {
        const { organizationId, id: userId } = req.user;
        const { id } = req.params;

        const existing = await prisma.budget.findFirst({
            where: { id, organizationId, userId }
        });

        if (!existing) {
            return res.status(404).json({ error: 'Not Found', message: 'Budget not found or access denied' });
        }

        await prisma.budget.delete({ where: { id } });

        res.json({ success: true, message: 'Budget deleted successfully' });
    } catch (error) {
        console.error('[Budgets] DELETE error:', error);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
});

module.exports = router;
