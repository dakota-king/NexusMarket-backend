import rateLimit from 'express-rate-limit';
import { logger } from '../lib/logger';
// Basic rate limiting middleware
export const rateLimitMiddleware = (options) => {
    return rateLimit({
        windowMs: options.windowMs,
        max: options.max,
        message: options.message || 'Too many requests',
        standardHeaders: true,
        legacyHeaders: false,
        skipSuccessfulRequests: options.skipSuccessfulRequests || false,
        skipFailedRequests: options.skipFailedRequests || false,
        handler: (req, res) => {
            logger.warn('Rate limit exceeded', {
                ip: req.ip,
                path: req.path,
                userAgent: req.get('User-Agent')
            });
            res.status(429).json({
                error: 'Rate limit exceeded',
                resetTime: new Date(Date.now() + options.windowMs)
            });
        }
    });
};
// Specific rate limit configurations
export const rateLimits = {
    // General API rate limiting
    general: rateLimitMiddleware({
        windowMs: 60000, // 1 minute
        max: 100 // 100 requests per minute
    }),
    // Authentication endpoints
    auth: rateLimitMiddleware({
        windowMs: 60000, // 1 minute
        max: 20, // 20 requests per minute
        message: 'Too many authentication attempts'
    }),
    // File uploads
    upload: rateLimitMiddleware({
        windowMs: 3600000, // 1 hour
        max: 10, // 10 uploads per hour
        message: 'Too many file uploads'
    }),
    // Payment endpoints
    payment: rateLimitMiddleware({
        windowMs: 60000, // 1 minute
        max: 5, // 5 payment attempts per minute
        message: 'Too many payment attempts'
    }),
    // Search endpoints
    search: rateLimitMiddleware({
        windowMs: 60000, // 1 minute
        max: 50, // 50 searches per minute
        message: 'Too many search requests'
    }),
    // Admin endpoints
    admin: rateLimitMiddleware({
        windowMs: 60000, // 1 minute
        max: 30, // 30 admin requests per minute
        message: 'Too many admin requests'
    })
};
// Dynamic rate limiting based on user role
export const dynamicRateLimit = (baseLimit = 100) => {
    return rateLimit({
        windowMs: 60000,
        max: (req) => {
            // Increase limits for authenticated users
            if (req.user) {
                switch (req.user.role) {
                    case 'ADMIN':
                        return baseLimit * 3; // 3x for admins
                    case 'VENDOR':
                        return baseLimit * 2; // 2x for vendors
                    case 'CUSTOMER':
                        return baseLimit * 1.5; // 1.5x for customers
                    default:
                        return baseLimit;
                }
            }
            return baseLimit;
        },
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
            logger.warn('Dynamic rate limit exceeded', {
                ip: req.ip,
                userId: req.user?.id,
                userRole: req.user?.role,
                path: req.path
            });
            res.status(429).json({
                error: 'Rate limit exceeded',
                resetTime: new Date(Date.now() + 60000)
            });
        }
    });
};
// IP-based rate limiting
export const ipBasedRateLimit = (maxRequests = 100, windowMs = 60000) => {
    return rateLimit({
        windowMs,
        max: maxRequests,
        keyGenerator: (req) => req.ip || 'unknown',
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
            logger.warn('IP-based rate limit exceeded', {
                ip: req.ip,
                path: req.path
            });
            res.status(429).json({
                error: 'Rate limit exceeded for this IP',
                resetTime: new Date(Date.now() + windowMs)
            });
        }
    });
};
// User-based rate limiting
export const userBasedRateLimit = (maxRequests = 200, windowMs = 60000) => {
    return rateLimit({
        windowMs,
        max: maxRequests,
        keyGenerator: (req) => req.user?.id || req.ip || 'anonymous',
        skipSuccessfulRequests: false,
        skipFailedRequests: false,
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
            logger.warn('User-based rate limit exceeded', {
                userId: req.user?.id,
                ip: req.ip,
                path: req.path
            });
            res.status(429).json({
                error: 'Rate limit exceeded for this user',
                resetTime: new Date(Date.now() + windowMs)
            });
        }
    });
};
// Burst rate limiting for short time windows
export const burstRateLimit = (maxRequests = 20, windowMs = 10000) => {
    return rateLimit({
        windowMs,
        max: maxRequests,
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res) => {
            logger.warn('Burst rate limit exceeded', {
                ip: req.ip,
                path: req.path
            });
            res.status(429).json({
                error: 'Too many requests in a short time',
                resetTime: new Date(Date.now() + windowMs)
            });
        }
    });
};
export default rateLimitMiddleware;
//# sourceMappingURL=rateLimiting.middleware.js.map