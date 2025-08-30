import { Request, Response, NextFunction } from 'express'
import { logger } from '../lib/logger'

export const requestTimingMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const start = Date.now()
  
  // Log request start
  logger.info('Request started', {
    method: req.method,
    url: req.url,
    ip: req.ip,
    userAgent: req.get('User-Agent')
  })

  // Override res.end to capture response time
  const originalEnd = res.end
  res.end = function(chunk?: any, encoding?: any): Response {
    const duration = Date.now() - start
    
    // Log request completion
    logger.info('Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip
    })

    // Log slow requests
    if (duration > 1000) {
      logger.warn('Slow request detected', {
        method: req.method,
        url: req.url,
        duration: `${duration}ms`,
        ip: req.ip
      })
    }

    // Call original end method
    return originalEnd.call(this, chunk, encoding)
  }

  next()
}
