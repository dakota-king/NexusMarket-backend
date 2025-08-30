import express from 'express'
import { authMiddleware, requireRole } from '../middleware/auth.middleware'
import { validateRequest } from '../middleware/validation.middleware'
import { rateLimitMiddleware } from '../middleware/rateLimiting.middleware'
import { body, param, query } from 'express-validator'

const router: express.Router = express.Router()

// Get categories (public)
router.get('/',
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('parentId').optional().isString(),
  validateRequest,
  rateLimitMiddleware({ windowMs: 60000, max: 200 }),
  async (_req, res) => {
    // TODO: Implement get categories
    res.status(501).json({ error: 'Not implemented yet' })
  }
)

// Get category by ID (public)
router.get('/:id',
  param('id').isString(),
  rateLimitMiddleware({ windowMs: 60000, max: 500 }),
  async (_req, res) => {
    // TODO: Implement get category
    res.status(501).json({ error: 'Not implemented yet' })
  }
)

// Create category (admin only)
router.post('/',
  authMiddleware,
  requireRole(['ADMIN']),
  body('name').isString().isLength({ min: 1, max: 100 }),
  body('description').optional().isString().isLength({ max: 1000 }),
  body('parentId').optional().isString(),
  body('sortOrder').optional().isInt({ min: 0 }),
  validateRequest,
  rateLimitMiddleware({ windowMs: 60000, max: 20 }),
  async (_req, res) => {
    // TODO: Implement create category
    res.status(501).json({ error: 'Not implemented yet' })
  }
)

// Update category (admin only)
router.put('/:id',
  authMiddleware,
  requireRole(['ADMIN']),
  param('id').isString(),
  body('name').optional().isString().isLength({ min: 1, max: 100 }),
  body('description').optional().isString().isLength({ max: 1000 }),
  body('parentId').optional().isString(),
  body('sortOrder').optional().isInt({ min: 0 }),
  body('isActive').optional().isBoolean(),
  validateRequest,
  rateLimitMiddleware({ windowMs: 60000, max: 30 }),
  async (_req, res) => {
    // TODO: Implement update category
    res.status(501).json({ error: 'Not implemented yet' })
  }
)

export default router
