import express from 'express'
import cluster from 'cluster'
import os from 'os'
import { createServer } from 'http'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import { rateLimitMiddleware } from './middleware/rateLimiting.middleware'
import { errorHandlerMiddleware } from './middleware/errorHandler.middleware'
import { requestTimingMiddleware } from './middleware/requestTiming.middleware'
import apiRoutes from './routes'
import { socketServer } from './lib/socket'
import { queue, initializeQueues, initializeWorkers } from './lib/queue'
import { logger } from './lib/logger'
import { checkDatabaseConnection } from './lib/database'
import { redis } from './lib/redis'

const PORT = process.env.PORT || 3001
const numCPUs = os.cpus().length

// Cluster setup for production
if (cluster.isPrimary && process.env.NODE_ENV === 'production') {
  logger.info(`Master ${process.pid} is running`)

  // Fork workers
  for (let i = 0; i < numCPUs; i++) {
    cluster.fork()
  }

  cluster.on('exit', (worker) => {
    logger.warn(`Worker ${worker.process.pid} died`)
    cluster.fork()
  })
} else {
  // Worker processes
  startServer()
}

async function startServer() {
  try {
    // Check database connection
    const dbConnected = await checkDatabaseConnection()
    if (!dbConnected) {
      logger.warn('⚠️  Database connection failed - server will start without database access')
      logger.warn('   Some API endpoints may not work properly')
    }

    // Check Redis connection
    if (redis) {
      try {
        await redis.ping()
        logger.info('✅ Redis connected successfully')
      } catch (error) {
        logger.warn('⚠️  Redis connection failed - server will start without Redis access')
        logger.warn('   Some features like caching and queues may not work properly')
        logger.warn('   For development, you can install and start Redis:')
        logger.warn('   1. Install Redis (https://redis.io/download)')
        logger.warn('   2. Start Redis server: redis-server')
        logger.warn('   3. Or use Docker: docker run -d -p 6379:6379 redis:alpine')
      }
    } else {
      logger.warn('⚠️  Redis not configured - server will start without Redis access')
      logger.warn('   Some features like caching and queues may not work properly')
    }

    const app = express()
    const server = createServer(app)

    // Initialize Socket.io
    socketServer(server)

    // Initialize queues and workers (will handle Redis connection failures gracefully)
    initializeQueues()
    initializeWorkers()

    // Middleware
    app.use(helmet())
    app.use(cors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
      credentials: true
    }))
    app.use(compression())
    app.use(express.json({ limit: '10mb' }))
    app.use(express.urlencoded({ extended: true, limit: '10mb' }))

    // Logging
    if (process.env.NODE_ENV === 'development') {
      app.use((req, _res, next) => {
        logger.info(`${req.method} ${req.url}`)
        next()
      })
    }

    // Request timing
    app.use(requestTimingMiddleware)

    // Rate limiting
    app.use(rateLimitMiddleware({ windowMs: 60000, max: 100 }))

    // Health check
    app.get('/health', (_req, res) => {
      res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version || '1.0.0',
        uptime: process.uptime(),
        worker: process.pid
      })
    })

    // API routes
    app.use('/api', apiRoutes)

    // Error handling
    app.use(errorHandlerMiddleware)

    // Start server
    server.listen(PORT, () => {
      logger.info(`🚀 Worker ${process.pid} started on port ${PORT}`)
      logger.info(`📊 Environment: ${process.env.NODE_ENV || 'development'}`)
      logger.info(`🔗 Health check: http://localhost:${PORT}/health`)
    })

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`Received ${signal}, shutting down gracefully...`)
      
      server.close(async () => {
        try {
          // Close database connection
          const { disconnectDatabase } = await import('./lib/database')
          await disconnectDatabase()
          
          // Close Redis connection
          if (redis) {
            await redis.quit()
          }
          
          // Close queue connections
          const queueClosePromises = [
            queue.email?.close(),
            queue.analytics?.close(),
            queue.inventory?.close(),
            queue.payment?.close(),
            queue.notification?.close()
          ].filter((promise): promise is Promise<void> => promise !== undefined)
          
          if (queueClosePromises.length > 0) {
            await Promise.all(queueClosePromises)
          }
          
          logger.info('✅ Graceful shutdown completed')
          process.exit(0)
        } catch (error) {
          logger.error('❌ Error during graceful shutdown:', error)
          process.exit(1)
        }
      })

      // Force exit after 30 seconds
      setTimeout(() => {
        logger.error('❌ Forced shutdown after timeout')
        process.exit(1)
      }, 30000)
    }

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'))
    process.on('SIGINT', () => gracefulShutdown('SIGINT'))
    process.on('SIGUSR2', () => gracefulShutdown('SIGUSR2')) // For nodemon

  } catch (error) {
    logger.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}
