export declare const rateLimitMiddleware: (options: {
    windowMs: number;
    max: number;
    message?: string;
    skipSuccessfulRequests?: boolean;
    skipFailedRequests?: boolean;
}) => import("express-rate-limit").RateLimitRequestHandler;
export declare const rateLimits: {
    general: import("express-rate-limit").RateLimitRequestHandler;
    auth: import("express-rate-limit").RateLimitRequestHandler;
    upload: import("express-rate-limit").RateLimitRequestHandler;
    payment: import("express-rate-limit").RateLimitRequestHandler;
    search: import("express-rate-limit").RateLimitRequestHandler;
    admin: import("express-rate-limit").RateLimitRequestHandler;
};
export declare const dynamicRateLimit: (baseLimit?: number) => import("express-rate-limit").RateLimitRequestHandler;
export declare const ipBasedRateLimit: (maxRequests?: number, windowMs?: number) => import("express-rate-limit").RateLimitRequestHandler;
export declare const userBasedRateLimit: (maxRequests?: number, windowMs?: number) => import("express-rate-limit").RateLimitRequestHandler;
export declare const burstRateLimit: (maxRequests?: number, windowMs?: number) => import("express-rate-limit").RateLimitRequestHandler;
export default rateLimitMiddleware;
//# sourceMappingURL=rateLimiting.middleware.d.ts.map