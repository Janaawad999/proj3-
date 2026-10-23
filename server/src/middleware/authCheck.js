/**
 * JWT Authentication & Strict Ownership Middleware
 * 
 * Extracts authenticated user context (id, email, organizationId, role) from Bearer token.
 * Rejects requests without valid tokens or missing organization context.
 */

const jwt = require('jsonwebtoken');

const authCheck = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'No authorization token provided'
            });
        }

        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded || !decoded.id || !decoded.organizationId) {
            return res.status(401).json({
                error: 'Unauthorized',
                message: 'Invalid token payload: missing user or organization identity'
            });
        }

        req.user = {
            id: decoded.id,
            email: decoded.email,
            role: decoded.role,
            displayName: decoded.displayName,
            organizationId: decoded.organizationId
        };

        next();
    } catch (error) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Session expired or invalid token'
        });
    }
};

module.exports = authCheck;
