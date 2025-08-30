import { Router } from 'express'
import { rateLimitMiddleware } from '../middleware/rateLimiting.middleware'
import { handleClerkWebhook, getCurrentUser } from '../controllers/auth.controller'

const router: Router = Router()

// Clerk webhook endpoint
router.post('/webhook',
  rateLimitMiddleware({ windowMs: 60000, max: 10 }),
  handleClerkWebhook
)

// Get current user
router.get('/me',
  rateLimitMiddleware({ windowMs: 60000, max: 100 }),
  getCurrentUser
)

export default router
