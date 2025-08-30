import { Request, Response, NextFunction } from 'express'
import { logger } from '../lib/logger'

export interface AppError extends Error {
  status?: number
  isOperational?: boolean
}

export const errorHandlerMiddleware = (
  error: AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Log the error
  logger.error('Error occurred:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  })

  // Set default status and message
  const status = error.status || 500
  const message = error.isOperational ? error.message : 'Internal server error'

  // Don't leak error details in production
  const isProduction = process.env.NODE_ENV === 'production'
  
  // Send error response
  res.status(status).json({
    success: false,
    error: message,
    ...(isProduction ? {} : { stack: error.stack })
  })
}

// Custom error class for operational errors
export class OperationalError extends Error implements AppError {
  public status: number
  public isOperational: boolean

  constructor(message: string, status: number = 500) {
    super(message)
    this.status = status
    this.isOperational = true
    
    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, OperationalError)
    }
  }
}

// Validation error
export class ValidationError extends OperationalError {
  constructor(message: string) {
    super(message, 400)
    this.name = 'ValidationError'
  }
}

// Authentication error
export class AuthenticationError extends OperationalError {
  constructor(message: string = 'Authentication required') {
    super(message, 401)
    this.name = 'AuthenticationError'
  }
}

// Authorization error
export class AuthorizationError extends OperationalError {
  constructor(message: string = 'Insufficient permissions') {
    super(message, 403)
    this.name = 'AuthorizationError'
  }
}

// Not found error
export class NotFoundError extends OperationalError {
  constructor(message: string = 'Resource not found') {
    super(message, 404)
    this.name = 'NotFoundError'
  }
}

// Conflict error
export class ConflictError extends OperationalError {
  constructor(message: string = 'Resource conflict') {
    super(message, 409)
    this.name = 'ConflictError'
  }
}

// Rate limit error
export class RateLimitError extends OperationalError {
  constructor(message: string = 'Too many requests') {
    super(message, 429)
    this.name = 'RateLimitError'
  }
}

// Async error wrapper
export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
