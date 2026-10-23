/**
 * Categories API Routes (Phase 1)
 * 
 * Manages organization-level income and expense categories.
 */

const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const authCheck = require('../middleware/authCheck');

const prisma = new PrismaClient();
router.use(authCheck);

/**
 * GET /api/categories
 * List all categories for the user's organization
 */
router.get('/', async (req, res) => {
    try {
        const { organizationId } = req.user;
        const { type } = req.query;

        const where = { organizationId };
        if (type && (type === 'INCOME' || type === 'EXPENSE')) {
            where.type = type;
        }

        const categories = await prisma.category.findMany({
            where,
            orderBy: [{ isDefault: 'desc' }, { name: 'asc' }]
        });

        res.json(categories.map(cat => ({
            id: cat.id,
            name: cat.name,
            icon: cat.icon || 'Folder',
            color: cat.color || '#E0AA3E',
            type: cat.type,
            isDefault: cat.isDefault,
            monthlyBudget: cat.monthlyBudget ? Number(cat.monthlyBudget) : null
        })));
    } catch (error) {
        console.error('[Categories] GET error:', error);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
});

/**
 * POST /api/categories
 * Create a new custom category
 */
router.post('/', async (req, res) => {
    try {
        const { organizationId } = req.user;
        const { name, icon = 'Folder', color = '#E0AA3E', type = 'EXPENSE', monthlyBudget } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Validation Error', message: 'Category name is required' });
        }

        const categoryType = type === 'INCOME' ? 'INCOME' : 'EXPENSE';

        // Check if category name + type already exists in this organization
        const existing = await prisma.category.findFirst({
            where: {
                organizationId,
                name: name.trim(),
                type: categoryType
            }
        });

        if (existing) {
            return res.status(409).json({
                error: 'Conflict',
                message: `Category '${name.trim()}' already exists as an ${categoryType} category.`
            });
        }

        const category = await prisma.category.create({
            data: {
                organizationId,
                name: name.trim(),
                icon,
                color,
                type: categoryType,
                isDefault: false,
                monthlyBudget: monthlyBudget ? parseFloat(monthlyBudget) : null
            }
        });

        res.status(201).json({
            id: category.id,
            name: category.name,
            icon: category.icon,
            color: category.color,
            type: category.type,
            isDefault: category.isDefault,
            monthlyBudget: category.monthlyBudget ? Number(category.monthlyBudget) : null
        });
    } catch (error) {
        console.error('[Categories] POST error:', error);
        res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
});

module.exports = router;
