import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { validateRequest } from '../middleware/validation.middleware';
import { rateLimitMiddleware } from '../middleware/rateLimiting.middleware';
import { body, param, query } from 'express-validator';
const router = express.Router();
// Get reviews for a product (public)
router.get('/product/:productId', param('productId').isString(), query('page').optional().isInt({ min: 1 }), query('limit').optional().isInt({ min: 1, max: 100 }), query('rating').optional().isInt({ min: 1, max: 5 }), validateRequest, rateLimitMiddleware({ windowMs: 60000, max: 200 }), async (_req, res) => {
    // TODO: Implement get product reviews
    res.status(501).json({ error: 'Not implemented yet' });
});
// Create review (authenticated users only)
router.post('/', authMiddleware, body('productId').isString(), body('rating').isInt({ min: 1, max: 5 }), body('title').optional().isString().isLength({ min: 1, max: 200 }), body('comment').optional().isString().isLength({ min: 1, max: 1000 }), validateRequest, rateLimitMiddleware({ windowMs: 60000, max: 5 }), async (_req, res) => {
    // TODO: Implement create review
    res.status(501).json({ error: 'Not implemented yet' });
});
// Update review (owner only)
router.put('/:id', authMiddleware, param('id').isString(), body('rating').optional().isInt({ min: 1, max: 5 }), body('title').optional().isString().isLength({ min: 1, max: 200 }), body('comment').optional().isString().isLength({ min: 1, max: 1000 }), validateRequest, rateLimitMiddleware({ windowMs: 60000, max: 10 }), async (_req, res) => {
    // TODO: Implement update review
    res.status(501).json({ error: 'Not implemented yet' });
});
// Delete review (owner or admin only)
router.delete('/:id', authMiddleware, param('id').isString(), rateLimitMiddleware({ windowMs: 60000, max: 5 }), async (_req, res) => {
    // TODO: Implement delete review
    res.status(501).json({ error: 'Not implemented yet' });
});
export default router;
//# sourceMappingURL=reviews.routes.js.map