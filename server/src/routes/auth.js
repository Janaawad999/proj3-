/**
 * Authentication Routes
 * 
 * Concrete implementation of auth endpoints using Prisma + bcrypt + JWT.
 * Extends the SDK AuthController pattern with direct route handlers.
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
/**
 * POST /api/auth/register
 */
router.post('/register', async (req, res) => {
    try {
        const { email: rawEmail, password, name } = req.body;

        if (!rawEmail || !password || !name) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Name, email and password are required'
            });
        }

        const email = rawEmail.trim().toLowerCase();

        // Check if user already exists (case-insensitive)
        const existingUser = await prisma.user.findFirst({
            where: {
                email: { equals: email, mode: 'insensitive' }
            }
        });

        if (existingUser) {
            return res.status(409).json({
                error: 'User already exists',
                message: 'An account with this email already exists'
            });
        }

        // Hash password with standard bcrypt 10 rounds
        const passwordHash = await bcrypt.hash(password, 10);

        // Find default personal finance organization or create one
        let org = await prisma.organization.findFirst({
            where: { slug: 'acme-corp' }
        });

        if (!org) {
            org = await prisma.organization.create({
                data: {
                    name: 'Montera Personal Finance',
                    slug: `montera-${Date.now()}`,
                    settings: { currency: 'EGP' }
                }
            });
        }

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                passwordHash,
                displayName: name.trim(),
                role: 'USER',
                active: true,
                currentOrganizationId: org.id,
                currency: 'EGP'
            }
        });

        // Link user to organization
        await prisma.organizationMember.create({
            data: {
                organizationId: org.id,
                userId: user.id,
                role: 'MEMBER'
            }
        }).catch(() => {});

        // Generate JWT
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role,
                displayName: user.displayName,
                organizationId: org.id
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || '7d'
            }
        );

        return res.status(201).json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.displayName,
                displayName: user.displayName,
                role: user.role,
                organizationId: org.id,
                organizationName: org.name
            }
        });

    } catch (error) {
        console.error('[Auth] Registration error:', error);

        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'Registration failed'
        });
    }
});

/**
 * POST /api/auth/login
 * 
 * Accepts { username, password } or { email, password }.
 * Returns { token, user } on success.
 */
router.post('/login', async (req, res) => {
    try {
        const { username, password, email: bodyEmail } = req.body;
        const rawEmail = bodyEmail || username;

        if (!rawEmail || !password) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Email and password are required'
            });
        }

        const email = rawEmail.trim();

        // Find user by email (case-insensitive)
        const user = await prisma.user.findFirst({
            where: {
                email: { equals: email, mode: 'insensitive' }
            },
            include: {
                memberships: {
                    include: {
                        organization: true
                    }
                }
            }
        });

        if (!user) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Invalid credentials'
            });
        }

        // Check if user is active
        if (!user.active) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Account is deactivated'
            });
        }

        // Verify password using bcrypt
        const validPassword = await bcrypt.compare(password, user.passwordHash);
        if (!validPassword) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Invalid credentials'
            });
        }

        // Resolve primary organization ID and name
        let organizationId = user.currentOrganizationId;
        let organizationName = null;

        if (user.memberships && user.memberships.length > 0) {
            const primaryMembership = user.memberships[0];
            organizationId = organizationId || primaryMembership.organizationId;
            organizationName = primaryMembership.organization?.name || null;
        }

        // Fallback: If user has no organization linked yet, link to primary org
        if (!organizationId) {
            const fallbackOrg = await prisma.organization.findFirst({
                where: { slug: 'acme-corp' }
            });
            if (fallbackOrg) {
                organizationId = fallbackOrg.id;
                organizationName = fallbackOrg.name;
                await prisma.organizationMember.upsert({
                    where: { organizationId_userId: { organizationId: fallbackOrg.id, userId: user.id } },
                    update: {},
                    create: { organizationId: fallbackOrg.id, userId: user.id, role: 'MEMBER' }
                }).catch(() => {});
                await prisma.user.update({
                    where: { id: user.id },
                    data: { currentOrganizationId: fallbackOrg.id }
                }).catch(() => {});
            }
        }

        // Generate JWT token
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role,
                displayName: user.displayName,
                organizationId: organizationId || null
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        // Return success
        return res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.displayName,
                displayName: user.displayName,
                role: user.role,
                organizationId: organizationId || null,
                organizationName: organizationName
            }
        });

    } catch (error) {
        console.error('[Auth] Login error:', error);
        return res.status(500).json({
            error: 'Internal Server Error',
            message: 'Login failed'
        });
    }
});

/**
 * POST /api/auth/logout
 */
router.post('/logout', (req, res) => {
    res.json({ message: 'Logout successful' });
});

/**
 * GET /api/auth/me
 * Returns current user from JWT token
 */
router.get('/me', async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                email: true,
                displayName: true,
                role: true,
                active: true,
                currentOrganizationId: true
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        return res.json({
            id: user.id,
            email: user.email,
            name: user.displayName,
            displayName: user.displayName,
            role: user.role,
            organizationId: user.currentOrganizationId
        });

    } catch (error) {
        console.error('[Auth] Me error:', error);
        return res.status(401).json({ error: 'Invalid token' });
    }
});

module.exports = router;
