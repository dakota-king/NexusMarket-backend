import { Router } from 'express'
import adminRoutes from './admin.routes'
import authRoutes from './auth.routes'
import productsRoutes from './products.routes'
import categoriesRoutes from './categories.routes'
import vendorsRoutes from './vendors.routes'
import ordersRoutes from './orders.routes'
import cartRoutes from './cart.routes'
import reviewsRoutes from './reviews.routes'
import analyticsRoutes from './analytics.routes'
import webhooksRoutes from './webhooks.routes'

const router: Router = Router()

// Health check
router.get('/health', (_req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  })
})

// API info
router.get('/', (_req, res) => {
  res.json({
    name: 'NexusMarket API',
    version: '1.0.0',
    status: 'running'
  })
})

// Mount route modules
router.use('/admin', adminRoutes)
router.use('/auth', authRoutes)
router.use('/products', productsRoutes)
router.use('/categories', categoriesRoutes)
router.use('/vendors', vendorsRoutes)
router.use('/orders', ordersRoutes)
router.use('/cart', cartRoutes)
router.use('/reviews', reviewsRoutes)
router.use('/analytics', analyticsRoutes)
router.use('/webhooks', webhooksRoutes)

export default router
