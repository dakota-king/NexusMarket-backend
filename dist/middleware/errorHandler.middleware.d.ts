import { Request, Response, NextFunction } from 'express';
export interface AppError extends Error {
    status?: number;
    isOperational?: boolean;
}
export declare const errorHandlerMiddleware: (error: AppError, req: Request, res: Response, _next: NextFunction) => void;
export declare class OperationalError extends Error implements AppError {
    status: number;
    isOperational: boolean;
    constructor(message: string, status?: number);
}
export declare class ValidationError extends OperationalError {
    constructor(message: string);
}
export declare class AuthenticationError extends OperationalError {
    constructor(message?: string);
}
export declare class AuthorizationError extends OperationalError {
    constructor(message?: string);
}
export declare class NotFoundError extends OperationalError {
    constructor(message?: string);
}
export declare class ConflictError extends OperationalError {
    constructor(message?: string);
}
export declare class RateLimitError extends OperationalError {
    constructor(message?: string);
}
export declare const asyncHandler: (fn: Function) => (req: Request, res: Response, next: NextFunction) => void;
//# sourceMappingURL=errorHandler.middleware.d.ts.map