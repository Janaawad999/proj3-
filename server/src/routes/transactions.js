/**
 * Transactions API Routes (Phase 1)
 * 
 * Strict multi-tenant & user ownership isolation.
 * Every operation enforces organizationId and userId from JWT context.
 */

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authCheck = require('../middleware/authCheck');
const financialRadarService = require('../services/financialRadarService');

const prisma = new PrismaClient();
router.use(authCheck);

/**
 * GET /api/transactions
 * List transactions with filtering, search, pagination, and sorting
 */
router.get('/', async (req, res) => {
    try {
        const { organizationId, id: userId } = req.user;
        const {
            page = 1,
            limit = 20,
            type,
            categoryId,
            paymentMethod,
            merchant,
            startDate,
            endDate,
            search,
            sortBy = 'date',
            sortOrder = 'desc'
        } = req.query;

        const pageNum = Math.max(1, parseInt(page, 10));
        const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10)));
        const skip = (pageNum - 1) * limitNum;

        // Build where filter with strict tenant & user scoping
        const where = {
            organizationId,
            userId
        };

        if (type && (type === 'INCOME' || type === 'EXPENSE')) {
            where.type = type;
        }

        if (categoryId) {
            where.categoryId = categoryId;
        }

        if (paymentMethod) {
            where.paymentMethod = paymentMethod;
        }

        if (merchant) {
            where.merchant = { contains: merchant, mode: 'insensitive' };
        }

        if (startDate || endDate) {
            where.date = {};
            if (startDate) where.date.gte = new Date(startDate);
            if (endDate) where.date.lte = new Date(endDate);
        }

        if (search) {
            where.OR = [
                { merchant: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } }
            ];
        }

        // Validate sort field
        const validSortFields = ['date', 'amount', 'merchant', 'createdAt'];
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'date';
        const order = sortOrder === 'asc' ? 'asc' : 'desc';

        const [transactions, total] = await Promise.all([
            prisma.transaction.findMany({
                where,
                include: { category: true },
                orderBy: { [sortField]: order },
                skip,
                take: limitNum
            }),
            prisma.transaction.count({ where })
        ]);

        const formatted = transactions.map(tx => ({
            id: tx.id,
            amount: Number(tx.amount),
            type: tx.type,
            categoryId: tx.categoryId,
            categoryName: tx.category?.name || 'Uncategorized',
            categoryIcon: tx.category?.icon || 'Tag',
            categoryColor: tx.category?.color || '#E0AA3E',
            merchant: tx.merchant || '',
            date: tx.date.toISOString(),
            paymentMethod: tx.paymentMethod,
            description: tx.description || '',
            isRecurring: tx.isRecurring,
            recurringPeriod: tx.recurringPeriod,
            createdAt: tx.createdAt
        }));

        res.json({
            data: formatted,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                totalPages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error('[Transactions] GET error:', error);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
});

/**
 * GET /api/transactions/:id
 * Retrieve a single transaction
 */
router.get('/:id', async (req, res) => {
    try {
        const { organizationId, id: userId } = req.user;
        const { id } = req.params;

        const transaction = await prisma.transaction.findFirst({
            where: { id, organizationId, userId },
            include: { category: true }
        });

        if (!transaction) {
            return res.status(404).json({ error: 'Not Found', message: 'Transaction not found or access denied' });
        }

        res.json({
            id: transaction.id,
            amount: Number(transaction.amount),
            type: transaction.type,
            categoryId: transaction.categoryId,
            categoryName: transaction.category?.name,
            categoryIcon: transaction.category?.icon,
            categoryColor: transaction.category?.color,
            merchant: transaction.merchant,
            date: transaction.date.toISOString(),
            paymentMethod: transaction.paymentMethod,
            description: transaction.description,
            isRecurring: transaction.isRecurring,
            recurringPeriod: transaction.recurringPeriod,
            createdAt: transaction.createdAt
        });
    } catch (error) {
        console.error('[Transactions] GET :id error:', error);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
});

/**
 * POST /api/transactions
 * Create a new transaction
 */
router.post('/', async (req, res) => {
    try {
        const { organizationId, id: userId } = req.user;
        const {
            amount,
            type = 'EXPENSE',
            categoryId,
            merchant,
            date,
            paymentMethod = 'CARD',
            description,
            isRecurring = false,
            recurringPeriod
        } = req.body;

        // Validation
        const parsedAmount = parseFloat(amount);
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            return res.status(400).json({ error: 'Validation Error', message: 'Amount must be a positive number' });
        }

        if (!categoryId) {
            return res.status(400).json({ error: 'Validation Error', message: 'Category is required' });
        }

        // Verify category belongs to user's organization
        const category = await prisma.category.findFirst({
            where: { id: categoryId, organizationId }
        });

        if (!category) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'Selected category does not exist or does not belong to your organization'
            });
        }

        const txDate = date ? new Date(date) : new Date();

        const transaction = await prisma.transaction.create({
            data: {
                organizationId,
                userId,
                amount: parsedAmount,
                type: type === 'INCOME' ? 'INCOME' : 'EXPENSE',
                categoryId,
                merchant: merchant ? merchant.trim() : null,
                date: txDate,
                paymentMethod,
                description: description ? description.trim() : null,
                isRecurring: Boolean(isRecurring),
                recurringPeriod: isRecurring ? recurringPeriod : null
            },
            include: { category: true }
        });

        // Run Financial Radar in background safely without blocking or failing transaction response
        financialRadarService.runRadarForUser(organizationId, userId).catch(err => {
            console.error('[Radar Auto-Check Error]:', err.message);
        });

        res.status(201).json({
            id: transaction.id,
            amount: Number(transaction.amount),
            type: transaction.type,
            categoryId: transaction.categoryId,
            categoryName: transaction.category?.name,
            categoryIcon: transaction.category?.icon,
            categoryColor: transaction.category?.color,
            merchant: transaction.merchant,
            date: transaction.date.toISOString(),
            paymentMethod: transaction.paymentMethod,
            description: transaction.description,
            isRecurring: transaction.isRecurring,
            createdAt: transaction.createdAt
        });
    } catch (error) {
        console.error('[Transactions] POST error:', error);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
});

/**
 * PUT /api/transactions/:id
 * Update an existing transaction
 */
router.put('/:id', async (req, res) => {
    try {
        const { organizationId, id: userId } = req.user;
        const { id } = req.params;
        const {
            amount,
            type,
            categoryId,
            merchant,
            date,
            paymentMethod,
            description,
            isRecurring,
            recurringPeriod
        } = req.body;

        // Verify transaction belongs to user & organization
        const existing = await prisma.transaction.findFirst({
            where: { id, organizationId, userId }
        });

        if (!existing) {
            return res.status(404).json({ error: 'Not Found', message: 'Transaction not found or access denied' });
        }

        // If category is being updated, verify it belongs to organization
        if (categoryId && categoryId !== existing.categoryId) {
            const cat = await prisma.category.findFirst({
                where: { id: categoryId, organizationId }
            });
            if (!cat) {
                return res.status(400).json({ error: 'Validation Error', message: 'Invalid category for this organization' });
            }
        }

        const updateData = {};
        if (amount !== undefined) {
            const parsed = parseFloat(amount);
            if (isNaN(parsed) || parsed <= 0) {
                return res.status(400).json({ error: 'Validation Error', message: 'Amount must be a positive number' });
            }
            updateData.amount = parsed;
        }

        if (type !== undefined) updateData.type = type === 'INCOME' ? 'INCOME' : 'EXPENSE';
        if (categoryId !== undefined) updateData.categoryId = categoryId;
        if (merchant !== undefined) updateData.merchant = merchant ? merchant.trim() : null;
        if (date !== undefined) updateData.date = new Date(date);
        if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod;
        if (description !== undefined) updateData.description = description ? description.trim() : null;
        if (isRecurring !== undefined) updateData.isRecurring = Boolean(isRecurring);
        if (recurringPeriod !== undefined) updateData.recurringPeriod = recurringPeriod;

        const updated = await prisma.transaction.update({
            where: { id },
            data: updateData,
            include: { category: true }
        });

        res.json({
            id: updated.id,
            amount: Number(updated.amount),
            type: updated.type,
            categoryId: updated.categoryId,
            categoryName: updated.category?.name,
            categoryIcon: updated.category?.icon,
            categoryColor: updated.category?.color,
            merchant: updated.merchant,
            date: updated.date.toISOString(),
            paymentMethod: updated.paymentMethod,
            description: updated.description,
            isRecurring: updated.isRecurring,
            updatedAt: updated.updatedAt
        });
    } catch (error) {
        console.error('[Transactions] PUT error:', error);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
});

/**
 * DELETE /api/transactions/:id
 * Delete a transaction
 */
router.delete('/:id', async (req, res) => {
    try {
        const { organizationId, id: userId } = req.user;
        const { id } = req.params;

        const existing = await prisma.transaction.findFirst({
            where: { id, organizationId, userId }
        });

        if (!existing) {
            return res.status(404).json({ error: 'Not Found', message: 'Transaction not found or access denied' });
        }

        await prisma.transaction.delete({
            where: { id }
        });

        res.json({ success: true, message: 'Transaction deleted successfully', id });
    } catch (error) {
        console.error('[Transactions] DELETE error:', error);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
});

module.exports = router;
