/**
 * Financial Goals API Routes (Phase 1)
 * 
 * Manages user savings goals and tracks deterministic timeline progress.
 */

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authCheck = require('../middleware/authCheck');
const financialService = require('../services/financialAnalysisService');

const prisma = new PrismaClient();
router.use(authCheck);

/**
 * GET /api/goals
 * List all financial goals with progress calculations
 */
router.get('/', async (req, res) => {
    try {
        const { organizationId, id: userId } = req.user;

        const goals = await financialService.getGoalProgress(prisma, organizationId, userId);
        res.json(goals);
    } catch (error) {
        console.error('[Goals] GET error:', error);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
});

/**
 * POST /api/goals
 * Create a new savings goal
 */
router.post('/', async (req, res) => {
    try {
        const { organizationId, id: userId } = req.user;
        const {
            title,
            targetAmount,
            currentAmount = 0,
            targetDate,
            category,
            icon = 'Target'
        } = req.body;

        if (!title || !title.trim()) {
            return res.status(400).json({ error: 'Validation Error', message: 'Goal title is required' });
        }

        const parsedTarget = parseFloat(targetAmount);
        if (isNaN(parsedTarget) || parsedTarget <= 0) {
            return res.status(400).json({ error: 'Validation Error', message: 'Target amount must be a positive number' });
        }

        if (!targetDate) {
            return res.status(400).json({ error: 'Validation Error', message: 'Target date is required' });
        }

        const goal = await prisma.financialGoal.create({
            data: {
                organizationId,
                userId,
                title: title.trim(),
                targetAmount: parsedTarget,
                currentAmount: parseFloat(currentAmount) || 0,
                targetDate: new Date(targetDate),
                category: category ? category.trim() : null,
                icon,
                status: 'ACTIVE'
            }
        });

        res.status(201).json({
            id: goal.id,
            title: goal.title,
            targetAmount: Number(goal.targetAmount),
            currentAmount: Number(goal.currentAmount),
            targetDate: goal.targetDate,
            status: goal.status,
            icon: goal.icon
        });
    } catch (error) {
        console.error('[Goals] POST error:', error);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
});

/**
 * PUT /api/goals/:id
 * Update a savings goal (e.g. deposit funds, change target)
 */
router.put('/:id', async (req, res) => {
    try {
        const { organizationId, id: userId } = req.user;
        const { id } = req.params;
        const {
            title,
            targetAmount,
            currentAmount,
            targetDate,
            category,
            status,
            icon
        } = req.body;

        const existing = await prisma.financialGoal.findFirst({
            where: { id, organizationId, userId }
        });

        if (!existing) {
            return res.status(404).json({ error: 'Not Found', message: 'Goal not found or access denied' });
        }

        const updateData = {};
        if (title !== undefined) updateData.title = title.trim();
        if (targetAmount !== undefined) {
            const parsed = parseFloat(targetAmount);
            if (isNaN(parsed) || parsed <= 0) {
                return res.status(400).json({ error: 'Validation Error', message: 'Target amount must be a positive number' });
            }
            updateData.targetAmount = parsed;
        }
        if (currentAmount !== undefined) {
            const parsed = parseFloat(currentAmount);
            if (isNaN(parsed) || parsed < 0) {
                return res.status(400).json({ error: 'Validation Error', message: 'Current amount cannot be negative' });
            }
            updateData.currentAmount = parsed;
        }
        if (targetDate !== undefined) updateData.targetDate = new Date(targetDate);
        if (category !== undefined) updateData.category = category ? category.trim() : null;
        if (status !== undefined) updateData.status = status;
        if (icon !== undefined) updateData.icon = icon;

        const updated = await prisma.financialGoal.update({
            where: { id },
            data: updateData
        });

        res.json({
            id: updated.id,
            title: updated.title,
            targetAmount: Number(updated.targetAmount),
            currentAmount: Number(updated.currentAmount),
            targetDate: updated.targetDate,
            status: updated.status,
            icon: updated.icon
        });
    } catch (error) {
        console.error('[Goals] PUT error:', error);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
});

/**
 * DELETE /api/goals/:id
 * Delete a savings goal
 */
router.delete('/:id', async (req, res) => {
    try {
        const { organizationId, id: userId } = req.user;
        const { id } = req.params;

        const existing = await prisma.financialGoal.findFirst({
            where: { id, organizationId, userId }
        });

        if (!existing) {
            return res.status(404).json({ error: 'Not Found', message: 'Goal not found or access denied' });
        }

        await prisma.financialGoal.delete({ where: { id } });

        res.json({ success: true, message: 'Goal deleted successfully' });
    } catch (error) {
        console.error('[Goals] DELETE error:', error);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
});

module.exports = router;
