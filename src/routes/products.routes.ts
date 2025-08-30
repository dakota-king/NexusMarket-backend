import express from 'express'
import { body, query } from 'express-validator'
import { 
  getProducts, 
  getProduct, 
  createProduct, 
  updateProduct, 
  deleteProduct,
  bulkUploadProducts,
  getProductAnalytics,
  createProductReview
} from '../controllers/products.controller'
import { authMiddleware, requireRole } from '../middleware/auth.middleware'
import { validateRequest } from '../middleware/validation.middleware'
import { rateLimitMiddleware } from '../middleware/rateLimiting.middleware'

const router: express.Router = express.Router()

// Public routes
router.get('/', 
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('search').optional().isString().trim(),
  query('category').optional().isString(),
  query('minPrice').optional().isNumeric(),
  query('maxPrice').optional().isNumeric(),
  query('vendorId').optional().isString(),
  query('sortBy').optional().isIn(['createdAt', 'updatedAt', 'title', 'price', 'rating', 'totalSold']),
  query('sortOrder').optional().isIn(['asc', 'desc']),
  query('minRating').optional().isNumeric(),
  query('tags').optional().isArray(),
  query('inStock').optional().isBoolean(),
  validateRequest,
  rateLimitMiddleware({ windowMs: 60000, max: 100 }),
  getProducts
)

router.get('/:id', 
  rateLimitMiddleware({ windowMs: 60000, max: 200 }),
  getProduct
)

// Protected vendor routes
router.post('/',
  authMiddleware,
  requireRole(['VENDOR', 'ADMIN']),
  body('title').isString().isLength({ min: 1, max: 200 }),
  body('description').isString().isLength({ min: 10, max: 5000 }),
  body('basePrice').isNumeric(),
  body('categoryId').isString(),
  body('weight').optional().isNumeric(),
  body('dimensions').optional().isObject(),
  body('tags').optional().isArray(),
  body('variants').optional().isArray(),
  body('images').optional().isArray(),
  validateRequest,
  rateLimitMiddleware({ windowMs: 60000, max: 20 }),
  createProduct
)

router.put('/:id',
  authMiddleware,
  requireRole(['VENDOR', 'ADMIN']),
  body('title').optional().isString().isLength({ min: 1, max: 200 }),
  body('description').optional().isString().isLength({ min: 10, max: 5000 }),
  body('basePrice').optional().isNumeric(),
  body('categoryId').optional().isString(),
  body('weight').optional().isNumeric(),
  body('dimensions').optional().isObject(),
  body('tags').optional().isArray(),
  body('status').optional().isIn(['DRAFT', 'ACTIVE', 'INACTIVE', 'ARCHIVED']),
  validateRequest,
  rateLimitMiddleware({ windowMs: 60000, max: 30 }),
  updateProduct
)

router.delete('/:id',
  authMiddleware,
  requireRole(['VENDOR', 'ADMIN']),
  rateLimitMiddleware({ windowMs: 60000, max: 10 }),
  deleteProduct
)

router.post('/bulk-upload',
  authMiddleware,
  requireRole(['VENDOR', 'ADMIN']),
  body('products').isArray({ min: 1, max: 100 }),
  validateRequest,
  rateLimitMiddleware({ windowMs: 3600000, max: 5 }), // 5 uploads per hour
  bulkUploadProducts
)

router.get('/:id/analytics',
  authMiddleware,
  requireRole(['VENDOR', 'ADMIN']),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('groupBy').optional().isIn(['day', 'week', 'month']),
  validateRequest,
  getProductAnalytics
)

// Product reviews
router.post('/:id/reviews',
  authMiddleware,
  requireRole(['CUSTOMER', 'VENDOR', 'ADMIN']),
  body('rating').isInt({ min: 1, max: 5 }),
  body('title').optional().isString().isLength({ min: 1, max: 200 }),
  body('comment').optional().isString().isLength({ min: 1, max: 1000 }),
  validateRequest,
  rateLimitMiddleware({ windowMs: 60000, max: 5 }),
  createProductReview
)

// Product variants
router.post('/:id/variants',
  authMiddleware,
  requireRole(['VENDOR', 'ADMIN']),
  body('name').isString().isLength({ min: 1, max: 100 }),
  body('price').isNumeric(),
  body('stock').isInt({ min: 0 }),
  body('attributes').optional().isObject(),
  validateRequest,
  rateLimitMiddleware({ windowMs: 60000, max: 20 }),
  async (_req, res) => {
    // TODO: Implement variant creation
    res.status(501).json({ error: 'Not implemented yet' })
  }
)

// Product images
router.post('/:id/images',
  authMiddleware,
  requireRole(['VENDOR', 'ADMIN']),
  body('url').isURL(),
  body('altText').optional().isString().isLength({ max: 200 }),
  body('order').optional().isInt({ min: 0 }),
  validateRequest,
  rateLimitMiddleware({ windowMs: 60000, max: 20 }),
  async (_req, res) => {
    // TODO: Implement image creation
    res.status(501).json({ error: 'Not implemented yet' })
  }
)

// Search suggestions
router.get('/search/suggestions',
  query('q').isString().isLength({ min: 1, max: 100 }),
  validateRequest,
  rateLimitMiddleware({ windowMs: 60000, max: 50 }),
  async (_req, res) => {
    // TODO: Implement search suggestions
    res.status(501).json({ error: 'Not implemented yet' })
  }
)

// Popular products (all categories)
router.get('/popular',
  query('limit').optional().isInt({ min: 1, max: 50 }),
  validateRequest,
  rateLimitMiddleware({ windowMs: 60000, max: 100 }),
  async (_req, res) => {
    // TODO: Implement popular products
    res.status(501).json({ error: 'Not implemented yet' })
  }
)

// Popular products by category
router.get('/popular/:category',
  query('limit').optional().isInt({ min: 1, max: 50 }),
  validateRequest,
  rateLimitMiddleware({ windowMs: 60000, max: 100 }),
  async (_req, res) => {
    // TODO: Implement popular products by category
    res.status(501).json({ error: 'Not implemented yet' })
  }
)

// Related products
router.get('/:id/related',
  query('limit').optional().isInt({ min: 1, max: 20 }),
  validateRequest,
  rateLimitMiddleware({ windowMs: 60000, max: 100 }),
  async (_req, res) => {
    // TODO: Implement related products
    res.status(501).json({ error: 'Not implemented yet' })
  }
)

export default router
