import winston from 'winston'
import path from 'path'

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
}

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
}

// Tell winston that you want to link the colors
winston.addColors(colors)

// Define which level to log based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development'
  const isDevelopment = env === 'development'
  return isDevelopment ? 'debug' : 'warn'
}

// Define different log formats
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}`,
  ),
)

// Define transports
const transports = [
  // Console transport
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }),
  
  // File transport for errors
  new winston.transports.File({
    filename: path.join(process.cwd(), 'logs', 'error.log'),
    level: 'error',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  }),
  
  // File transport for all logs
  new winston.transports.File({
    filename: path.join(process.cwd(), 'logs', 'combined.log'),
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    )
  })
]

// Create the logger
export const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
  exitOnError: false
})

// Create a stream object for Morgan HTTP logging
export const stream = {
  write: (message: string) => {
    logger.http(message.trim())
  }
}

// Custom logger methods
export class LoggerService {
  static info(message: string, meta?: any) {
    if (meta) {
      logger.info(`${message} ${JSON.stringify(meta)}`)
    } else {
      logger.info(message)
    }
  }

  static error(message: string, error?: any) {
    if (error) {
      logger.error(`${message} ${error.stack || error.message || JSON.stringify(error)}`)
    } else {
      logger.error(message)
    }
  }

  static warn(message: string, meta?: any) {
    if (meta) {
      logger.warn(`${message} ${JSON.stringify(meta)}`)
    } else {
      logger.warn(message)
    }
  }

  static debug(message: string, meta?: any) {
    if (meta) {
      logger.debug(`${message} ${JSON.stringify(meta)}`)
    } else {
      logger.debug(message)
    }
  }

  static http(message: string, meta?: any) {
    if (meta) {
      logger.http(`${message} ${JSON.stringify(meta)}`)
    } else {
      logger.http(message)
    }
  }

  // Log database operations
  static logDatabaseOperation(operation: string, model: string, duration: number, success: boolean) {
    const message = `DB ${operation} on ${model} took ${duration}ms`
    
    if (success) {
      logger.info(message)
    } else {
      logger.error(message)
    }
  }

  // Log API requests
  static logApiRequest(method: string, path: string, statusCode: number, duration: number, userId?: string) {
    const level = statusCode >= 400 ? 'warn' : 'info'
    const message = `API ${method} ${path} ${statusCode} ${duration}ms${userId ? ` User: ${userId}` : ''}`
    
    logger[level](message)
  }

  // Log authentication events
  static logAuthEvent(event: string, userId: string, success: boolean, ip?: string) {
    const level = success ? 'info' : 'warn'
    const message = `AUTH ${event} User: ${userId}${ip ? ` IP: ${ip}` : ''}`
    
    logger[level](message)
  }

  // Log payment events
  static logPaymentEvent(event: string, orderId: string, amount: number, success: boolean) {
    const level = success ? 'info' : 'error'
    const message = `PAYMENT ${event} Order: ${orderId} Amount: $${amount}`
    
    logger[level](message)
  }

  // Log inventory changes
  static logInventoryChange(productId: string, oldStock: number, newStock: number, userId: string) {
    const message = `INVENTORY Product: ${productId} Stock: ${oldStock} → ${newStock} User: ${userId}`
    logger.info(message)
  }

  // Log order status changes
  static logOrderStatusChange(orderId: string, oldStatus: string, newStatus: string, userId: string) {
    const message = `ORDER ${orderId} Status: ${oldStatus} → ${newStatus} User: ${userId}`
    logger.info(message)
  }

  // Log performance metrics
  static logPerformance(operation: string, duration: number, metadata?: any) {
    const level = duration > 1000 ? 'warn' : 'info'
    const message = `PERFORMANCE ${operation} took ${duration}ms${metadata ? ` ${JSON.stringify(metadata)}` : ''}`
    
    logger[level](message)
  }

  // Log security events
  static logSecurityEvent(event: string, userId?: string, ip?: string, details?: any) {
    const message = `SECURITY ${event}${userId ? ` User: ${userId}` : ''}${ip ? ` IP: ${ip}` : ''}${details ? ` ${JSON.stringify(details)}` : ''}`
    logger.warn(message)
  }
}

export default logger
