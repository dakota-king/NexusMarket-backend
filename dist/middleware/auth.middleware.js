import jwt from 'jsonwebtoken';
import { prisma } from '../lib/database';
import { logger } from '../lib/logger';
export const authMiddleware = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'Access token required' });
            return;
        }
        const token = authHeader.substring(7);
        if (!process.env.JWT_SECRET) {
            logger.error('JWT_SECRET not configured');
            res.status(500).json({ error: 'Server configuration error' });
            return;
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (!decoded || !decoded.userId) {
            res.status(401).json({ error: 'Invalid token' });
            return;
        }
        // Get user from database
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                role: true,
                clerkId: true,
                isActive: true
            }
        });
        if (!user || !user.isActive) {
            res.status(401).json({ error: 'User not found or inactive' });
            return;
        }
        req.user = user;
        next();
    }
    catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({ error: 'Invalid token' });
            return;
        }
        if (error instanceof jwt.TokenExpiredError) {
            res.status(401).json({ error: 'Token expired' });
            return;
        }
        logger.error('Auth middleware error:', error);
        res.status(500).json({ error: 'Authentication failed' });
        return;
    }
};
// Role-based access control middleware
export const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }
        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({ error: 'Insufficient permissions' });
            return;
        }
        next();
    };
};
// Vendor access control
export const requireVendor = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
    }
    if (req.user.role !== 'VENDOR') {
        res.status(403).json({ error: 'Vendor access required' });
        return;
    }
    next();
};
// Admin access control
export const requireAdmin = (req, res, next) => {
    if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
    }
    if (req.user.role !== 'ADMIN') {
        res.status(403).json({ error: 'Admin access required' });
        return;
    }
    next();
};
// Optional authentication middleware
export const optionalAuth = async (req, _res, next) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            next();
            return;
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded) {
            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                select: { id: true, email: true, role: true, clerkId: true }
            });
            if (user) {
                req.user = user;
            }
        }
        next();
    }
    catch (error) {
        // Token is invalid, but we continue without authentication
        next();
    }
};
// Resource ownership validation middleware
export const requireResourceOwnership = (resourceType, getResourceOwnerId) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Authentication required' });
                return;
            }
            const resourceOwnerId = await getResourceOwnerId(req);
            if (req.user.role === 'ADMIN') {
                next(); // Admins can access all resources
                return;
            }
            if (req.user.id !== resourceOwnerId) {
                res.status(403).json({ error: 'Access denied to this resource' });
                return;
            }
            next();
        }
        catch (error) {
            logger.error(`Resource ownership validation error for ${resourceType}:`, error);
            res.status(500).json({ error: 'Resource validation failed' });
            return;
        }
    };
};
// Vendor resource ownership validation
export const requireVendorResourceOwnership = (getVendorId) => {
    return async (req, res, next) => {
        try {
            if (!req.user) {
                res.status(401).json({ error: 'Authentication required' });
                return;
            }
            if (req.user.role !== 'VENDOR') {
                res.status(403).json({ error: 'Vendor access required' });
                return;
            }
            const resourceVendorId = await getVendorId(req);
            // Get user's vendor ID
            const vendor = await prisma.vendor.findUnique({
                where: { userId: req.user.id },
                select: { id: true }
            });
            if (!vendor || vendor.id !== resourceVendorId) {
                res.status(403).json({ error: 'Access denied to this vendor resource' });
                return;
            }
            next();
        }
        catch (error) {
            logger.error('Vendor resource ownership validation error:', error);
            res.status(500).json({ error: 'Resource validation failed' });
            return;
        }
    };
};
// Rate limiting for authentication endpoints
export const authRateLimit = (maxAttempts = 5, windowMs = 15 * 60 * 1000) => {
    const attempts = new Map();
    return (req, res, next) => {
        const key = req.ip || 'unknown';
        const now = Date.now();
        const attempt = attempts.get(key);
        if (attempt && now < attempt.resetTime) {
            if (attempt.count >= maxAttempts) {
                res.status(429).json({
                    error: 'Too many authentication attempts',
                    retryAfter: Math.ceil((attempt.resetTime - now) / 1000)
                });
                return;
            }
            attempt.count++;
        }
        else {
            attempts.set(key, { count: 1, resetTime: now + windowMs });
        }
        next();
    };
};
//# sourceMappingURL=auth.middleware.js.map