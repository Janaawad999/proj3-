/**
 * Financial Alerts & Radar API Routes
 * 
 * Strict multi-tenant & user ownership isolation.
 * Scoped to req.user.organizationId and req.user.id.
 */

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authCheck = require('../middleware/authCheck');
const financialRadarService = require('../services/financialRadarService');

const prisma = new PrismaClient();
router.use(authCheck);

/**
 * GET /api/alerts
 * List all financial alerts for the authenticated user
 */
router.get('/', async (req, res) => {
    try {
        const { organizationId, id: userId } = req.user;
        const { status, limit = 20, page = 1 } = req.query;

        const pageNum = Math.max(1, parseInt(page, 10));
        const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10)));
        const skip = (pageNum - 1) * limitNum;

        const where = {
            organizationId,
            userId
        };

        if (status && (status === 'UNREAD' || status === 'READ' || status === 'DISMISSED')) {
            where.status = status;
        } else {
            // By default, exclude dismissed alerts
            where.status = { not: 'DISMISSED' };
        }

        const [alerts, total, unreadCount] = await Promise.all([
            prisma.financialAlert.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limitNum
            }),
            prisma.financialAlert.count({ where }),
            prisma.financialAlert.count({
                where: {
                    organizationId,
                    userId,
                    status: 'UNREAD'
                }
            })
        ]);

        res.json({
            success: true,
            alerts,
            unreadCount,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error('[Alerts] GET error:', error);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
});

/**
 * GET /api/alerts/:id/investigate
 * Retrieve deterministic investigation metrics and transactions for an alert
 */
router.get('/:id/investigate', async (req, res) => {
    try {
        const { organizationId, id: userId } = req.user;
        const { id } = req.params;

        const result = await financialRadarService.getInvestigationDetails(organizationId, userId, id);
        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error('[Alerts] GET /:id/investigate error:', error);
        if (error.message.includes('not found')) {
            return res.status(404).json({ error: 'Not Found', message: error.message });
        }
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
});

/**
 * POST /api/radar/check or /api/alerts/check
 * Trigger Financial Radar analysis on demand
 */
router.post('/check', async (req, res) => {
    try {
        const { organizationId, id: userId } = req.user;
        const { month, year } = req.body;

        const result = await financialRadarService.runRadarForUser(organizationId, userId, {
            month: month ? parseInt(month, 10) : undefined,
            year: year ? parseInt(year, 10) : undefined
        });

        // Fetch refreshed alerts list
        const activeAlerts = await prisma.financialAlert.findMany({
            where: {
                organizationId,
                userId,
                status: { not: 'DISMISSED' }
            },
            orderBy: { createdAt: 'desc' },
            take: 20
        });

        const unreadCount = activeAlerts.filter(a => a.status === 'UNREAD').length;

        res.json({
            success: true,
            newAlertsCount: result.newAlertsCount,
            newAlerts: result.newAlerts,
            unreadCount,
            alerts: activeAlerts
        });
    } catch (error) {
        console.error('[Radar] POST /check error:', error);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
});

/**
 * PATCH /api/alerts/:id/read
 * Mark an alert as read
 */
router.patch('/:id/read', async (req, res) => {
    try {
        const { organizationId, id: userId } = req.user;
        const { id } = req.params;

        const existing = await prisma.financialAlert.findFirst({
            where: { id, organizationId, userId }
        });

        if (!existing) {
            return res.status(404).json({ error: 'Not Found', message: 'Alert not found or access denied' });
        }

        const updated = await prisma.financialAlert.update({
            where: { id },
            data: { status: 'READ' }
        });

        const unreadCount = await prisma.financialAlert.count({
            where: { organizationId, userId, status: 'UNREAD' }
        });

        res.json({
            success: true,
            alert: updated,
            unreadCount
        });
    } catch (error) {
        console.error('[Alerts] PATCH /:id/read error:', error);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
});

/**
 * PATCH /api/alerts/read-all
 * Mark all alerts as read for the user
 */
router.patch('/read-all', async (req, res) => {
    try {
        const { organizationId, id: userId } = req.user;

        await prisma.financialAlert.updateMany({
            where: {
                organizationId,
                userId,
                status: 'UNREAD'
            },
            data: { status: 'READ' }
        });

        res.json({
            success: true,
            message: 'All alerts marked as read',
            unreadCount: 0
        });
    } catch (error) {
        console.error('[Alerts] PATCH /read-all error:', error);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
});

/**
 * DELETE /api/alerts/:id
 * Dismiss/delete an alert
 */
router.delete('/:id', async (req, res) => {
    try {
        const { organizationId, id: userId } = req.user;
        const { id } = req.params;

        const existing = await prisma.financialAlert.findFirst({
            where: { id, organizationId, userId }
        });

        if (!existing) {
            return res.status(404).json({ error: 'Not Found', message: 'Alert not found or access denied' });
        }

        await prisma.financialAlert.delete({
            where: { id }
        });

        const unreadCount = await prisma.financialAlert.count({
            where: { organizationId, userId, status: 'UNREAD' }
        });

        res.json({
            success: true,
            message: 'Alert dismissed successfully',
            id,
            unreadCount
        });
    } catch (error) {
        console.error('[Alerts] DELETE /:id error:', error);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
});

module.exports = router;
