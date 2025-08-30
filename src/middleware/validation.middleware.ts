import { Request, Response, NextFunction } from 'express'
import { validationResult } from 'express-validator'
import { logger } from '../lib/logger'

// Main validation middleware
export const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req)
  
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.type === 'field' ? error.path : 'unknown',
      message: error.msg,
      value: error.type === 'field' ? error.value : undefined
    }))

    logger.warn('Validation failed', {
      path: req.path,
      method: req.method,
      errors: formattedErrors,
      ip: req.ip
    })

    res.status(400).json({
      error: 'Validation failed',
      details: formattedErrors
    })
    return
  }

  next()
}

// Custom validation for specific data types
export const validateObjectId = (paramName: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const id = req.params[paramName]
    
    if (!id || !/^[a-zA-Z0-9]{24,}$/.test(id)) {
      res.status(400).json({
        error: 'Invalid ID format',
        field: paramName,
        value: id
      })
      return
    }

    next()
  }
}

export const validateEmail = (fieldName: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const email = req.body[fieldName]
    
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      res.status(400).json({
        error: 'Invalid email format',
        field: fieldName,
        value: email
      })
      return
    }

    next()
  }
}

export const validatePhoneNumber = (fieldName: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const phone = req.body[fieldName]
    
    if (phone && !/^[\+]?[1-9][\d]{0,15}$/.test(phone.replace(/[\s\-\(\)]/g, ''))) {
      res.status(400).json({
        error: 'Invalid phone number format',
        field: fieldName,
        value: phone
      })
      return
    }

    next()
  }
}

export const validateUrl = (fieldName: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const url = req.body[fieldName]
    
    if (url) {
      try {
        new URL(url)
      } catch {
        res.status(400).json({
          error: 'Invalid URL format',
          field: fieldName,
          value: url
        })
        return
      }
    }

    next()
  }
}

export const validateDate = (fieldName: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const date = req.body[fieldName]
    
    if (date && isNaN(Date.parse(date))) {
      res.status(400).json({
        error: 'Invalid date format',
        field: fieldName,
        value: date
      })
      return
    }

    next()
  }
}

export const validateNumericRange = (fieldName: string, min: number, max: number) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const value = req.body[fieldName]
    
    if (value !== undefined && (isNaN(value) || value < min || value > max)) {
      res.status(400).json({
        error: `Value must be between ${min} and ${max}`,
        field: fieldName,
        value: value,
        min: min,
        max: max
      })
      return
    }

    next()
  }
}

export const validateArrayLength = (fieldName: string, minLength: number, maxLength: number) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const array = req.body[fieldName]
    
    if (array && (!Array.isArray(array) || array.length < minLength || array.length > maxLength)) {
      res.status(400).json({
        error: `Array must have between ${minLength} and ${maxLength} items`,
        field: fieldName,
        length: array?.length,
        minLength: minLength,
        maxLength: maxLength
      })
      return
    }

    next()
  }
}

export const validateFileSize = (fieldName: string, maxSizeBytes: number) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const file = req.file
    
    if (file && file.size > maxSizeBytes) {
      res.status(400).json({
        error: `File size exceeds maximum allowed size of ${Math.round(maxSizeBytes / 1024 / 1024)}MB`,
        field: fieldName,
        fileSize: file.size,
        maxSize: maxSizeBytes
      })
      return
    }

    next()
  }
}

export const validateFileType = (fieldName: string, allowedTypes: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const file = req.file
    
    if (file && !allowedTypes.includes(file.mimetype)) {
      res.status(400).json({
        error: `File type not allowed. Allowed types: ${allowedTypes.join(', ')}`,
        field: fieldName,
        fileType: file.mimetype,
        allowedTypes: allowedTypes
      })
      return
    }

    next()
  }
}

// Sanitization middleware
export const sanitizeInput = (_req: Request, _res: Response, next: NextFunction): void => {
  // Sanitize input data
  // This is a placeholder for input sanitization logic
  next()
}

// Custom validation for business logic
export const validateBusinessRules = (rules: Array<(req: Request) => string | null>) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    for (const rule of rules) {
      const error = rule(req)
      if (error) {
        res.status(400).json({
          error: error
        })
        return
      }
    }

    next()
  }
}

// Rate limit validation (placeholder for now)
export const validateRateLimit = () => {
  return (_req: Request, _res: Response, next: NextFunction): void => {
    // Rate limiting logic would go here
    next()
  }
}

export default validateRequest
