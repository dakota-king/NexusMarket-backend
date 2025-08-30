import express from 'express'
import { rateLimitMiddleware } from '../middleware/rateLimiting.middleware'

const router: express.Router = express.Router()

// Stripe webhook
router.post('/stripe',
  rateLimitMiddleware({ windowMs: 60000, max: 1000 }),
  async (_req, res) => {
    // TODO: Implement Stripe webhook
    res.status(501).json({ error: 'Not implemented yet' })
  }
)

// Clerk webhook (moved to auth routes)
router.post('/clerk',
  rateLimitMiddleware({ windowMs: 60000, max: 1000 }),
  async (_req, res) => {
    // TODO: Implement Clerk webhook
    res.status(501).json({ error: 'Not implemented yet' })
  }
)

export default router
