import { Queue, Worker, Job } from 'bullmq'
import { redis } from './redis'
import { logger } from './logger'

// Queue configurations
const queueConfig = {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    }
  }
}

// Initialize queues lazily to handle Redis connection failures
let emailQueue: Queue | null = null
let analyticsQueue: Queue | null = null
let inventoryQueue: Queue | null = null
let paymentQueue: Queue | null = null
let notificationQueue: Queue | null = null

// Helper function to create queues safely
function createQueueSafely(name: string, config: any): Queue | null {
  try {
    return new Queue(name, config)
  } catch (error) {
    logger.warn(`⚠️  Failed to create ${name} queue:`, error)
    return null
  }
}

// Initialize queues when needed
export function initializeQueues() {
  if (!emailQueue) emailQueue = createQueueSafely('email', queueConfig)
  if (!analyticsQueue) analyticsQueue = createQueueSafely('analytics', queueConfig)
  if (!inventoryQueue) inventoryQueue = createQueueSafely('inventory', queueConfig)
  if (!paymentQueue) paymentQueue = createQueueSafely('payment', queueConfig)
  if (!notificationQueue) notificationQueue = createQueueSafely('notification', queueConfig)
}

// Getter functions for queues
export const getEmailQueue = () => emailQueue
export const getAnalyticsQueue = () => analyticsQueue
export const getInventoryQueue = () => inventoryQueue
export const getPaymentQueue = () => paymentQueue
export const getNotificationQueue = () => notificationQueue

// Export all queues with proper typing
export const queue = {
  email: emailQueue as Queue | null,
  analytics: analyticsQueue as Queue | null,
  inventory: inventoryQueue as Queue | null,
  payment: paymentQueue as Queue | null,
  notification: notificationQueue as Queue | null
}

// Worker definitions - made lazy to avoid immediate Redis connections
let emailWorker: Worker | null = null
let analyticsWorker: Worker | null = null
let inventoryWorker: Worker | null = null
let paymentWorker: Worker | null = null
let notificationWorker: Worker | null = null

// Helper function to create workers safely
function createWorkerSafely(name: string, processor: (job: Job) => Promise<void>, config: any): Worker | null {
  try {
    return new Worker(name, processor, config)
  } catch (error) {
    logger.warn(`⚠️  Failed to create ${name} worker:`, error)
    return null
  }
}

// Initialize workers when needed
export function initializeWorkers() {
  if (!emailWorker) {
    emailWorker = createWorkerSafely('email', async (job: Job) => {
      const { type, data } = job.data
      
      switch (type) {
        case 'order_confirmation':
          // TODO: Implement order confirmation email
          logger.info('Processing order confirmation email', { orderId: data.orderId })
          break
          
        case 'password_reset':
          // TODO: Implement password reset email
          logger.info('Processing password reset email', { userId: data.userId })
          break
          
        case 'welcome':
          // TODO: Implement welcome email
          logger.info('Processing welcome email', { userId: data.userId })
          break
          
        default:
          throw new Error(`Unknown email type: ${type}`)
      }
    }, queueConfig)
  }

  if (!analyticsWorker) {
    analyticsWorker = createWorkerSafely('analytics', async (job: Job) => {
      const { type, data } = job.data
      
      switch (type) {
        case 'product_view':
          // TODO: Implement product view tracking
          logger.info('Processing product view analytics', { productId: data.productId })
          break
          
        case 'order_completed':
          // TODO: Implement order completion analytics
          logger.info('Processing order completion analytics', { orderId: data.orderId })
          break
          
        case 'vendor_metrics':
          // TODO: Implement vendor metrics calculation
          logger.info('Processing vendor metrics', { vendorId: data.vendorId })
          break
          
        default:
          throw new Error(`Unknown analytics type: ${type}`)
      }
    }, queueConfig)
  }

  if (!inventoryWorker) {
    inventoryWorker = createWorkerSafely('inventory', async (job: Job) => {
      const { type, data } = job.data
      
      switch (type) {
        case 'low_stock_check':
          // TODO: Implement low stock checking
          logger.info('Processing low stock check', { vendorId: data.vendorId })
          break
          
        case 'inventory_sync':
          // TODO: Implement inventory synchronization
          logger.info('Processing inventory sync', { vendorId: data.vendorId })
          break
          
        case 'stock_reservation':
          // TODO: Implement stock reservation
          logger.info('Processing stock reservation', { orderId: data.orderId })
          break
          
        default:
          throw new Error(`Unknown inventory type: ${type}`)
      }
    }, queueConfig)
  }

  if (!paymentWorker) {
    paymentWorker = createWorkerSafely('payment', async (job: Job) => {
      const { type, data } = job.data
      
      switch (type) {
        case 'process_refund':
          // TODO: Implement refund processing
          logger.info('Processing refund', { orderId: data.orderId })
          break
          
        case 'vendor_payout':
          // TODO: Implement vendor payout
          logger.info('Processing vendor payout', { vendorId: data.vendorId })
          break
          
        case 'payment_reconciliation':
          // TODO: Implement payment reconciliation
          logger.info('Processing payment reconciliation', { date: data.date })
          break
          
        default:
          throw new Error(`Unknown payment type: ${type}`)
      }
    }, queueConfig)
  }

  if (!notificationWorker) {
    notificationWorker = createWorkerSafely('notification', async (job: Job) => {
      const { type, data } = job.data
      
      switch (type) {
        case 'order_status_update':
          // TODO: Implement order status notification
          logger.info('Processing order status notification', { orderId: data.orderId })
          break
          
        case 'low_stock_alert':
          // TODO: Implement low stock alert
          logger.info('Processing low stock alert', { productId: data.productId })
          break
          
        case 'vendor_approval':
          // TODO: Implement vendor approval notification
          logger.info('Processing vendor approval notification', { vendorId: data.vendorId })
          break
          
        default:
          throw new Error(`Unknown notification type: ${type}`)
      }
    }, queueConfig)
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, closing queues...')
  await Promise.all([
    emailQueue?.close(),
    analyticsQueue?.close(),
    inventoryQueue?.close(),
    paymentQueue?.close(),
    notificationQueue?.close()
  ].filter(Boolean))
  process.exit(0)
})

process.on('SIGINT', async () => {
  logger.info('SIGINT received, closing queues...')
  await Promise.all([
    emailQueue?.close(),
    analyticsQueue?.close(),
    inventoryQueue?.close(),
    paymentQueue?.close(),
    notificationQueue?.close()
  ].filter(Boolean))
  process.exit(0)
})

export default queue
