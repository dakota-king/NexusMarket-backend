import Stripe from 'stripe'
import { prisma } from '../lib/database'
import { PaymentStatus, OrderStatus } from '../types'
import { logger } from '../lib/logger'
import { CacheService } from '../lib/redis'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil'
})

export class PaymentService {
  // Create payment intent
  static async createPaymentIntent(amount: number, currency: string = 'usd', metadata: any = {}) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency,
        metadata,
        automatic_payment_methods: {
          enabled: true
        }
      })

      logger.info(`Payment intent created: ${paymentIntent.id} for amount: ${amount}`)
      return paymentIntent
    } catch (error) {
      logger.error('Error creating payment intent:', error)
      throw error
    }
  }

  // Process payment
  static async processPayment(paymentIntentId: string, orderData: any) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)
      
      if (paymentIntent.status === 'succeeded') {
        // Create orders for each vendor
        const orders = await this.createVendorOrders(orderData, paymentIntentId)
        
        logger.info(`Payment successful: ${paymentIntentId}, orders created: ${orders.length}`)
        
        // Update payment status
        await this.updatePaymentStatus(paymentIntentId, PaymentStatus.COMPLETED)
        
        return {
          success: true,
          orders,
          paymentIntent
        }
      } else {
        throw new Error(`Payment not successful: ${paymentIntent.status}`)
      }
    } catch (error) {
      logger.error('Error processing payment:', error)
      throw error
    }
  }

  // Create vendor orders
  private static async createVendorOrders(orderData: any, paymentIntentId: string) {
    const vendorOrders = await Promise.all(
      orderData.vendors.map(async (vendorData: any) => {
        const order = await prisma.order.create({
          data: {
            orderNumber: await this.generateOrderNumber(),
            userId: orderData.userId,
            vendorId: vendorData.vendorId,
            status: OrderStatus.PENDING,
            paymentStatus: PaymentStatus.COMPLETED,
            subtotal: vendorData.subtotal,
            shippingCost: vendorData.shipping,
            tax: vendorData.tax,
            total: vendorData.total,
            stripePaymentIntentId: paymentIntentId,
            items: {
              create: vendorData.items.map((item: any) => ({
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: item.price,
                totalPrice: item.price * item.quantity
              }))
            }
          }
        })
        return order
      })
    )

    return vendorOrders
  }

  // Generate order number
  private static async generateOrderNumber(): Promise<string> {
    const date = new Date()
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    
    // Get count of orders for today
    const todayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    const todayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1)
    
    const orderCount = await prisma.order.count({
      where: {
        createdAt: { gte: todayStart, lt: todayEnd }
      }
    })

    const sequence = String(orderCount + 1).padStart(4, '0')
    return `ORD-${year}${month}${day}-${sequence}`
  }

  // Update payment status
  private static async updatePaymentStatus(paymentIntentId: string, status: PaymentStatus) {
    await prisma.order.updateMany({
      where: { stripePaymentIntentId: paymentIntentId },
      data: { paymentStatus: status }
    })
  }

  // Process refund
  static async processRefund(paymentIntentId: string, amount: number) {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        amount: Math.round(amount * 100) // Convert to cents
      })

      logger.info(`Refund processed: ${refund.id} for amount: ${amount}`)
      return refund
    } catch (error) {
      logger.error('Error processing refund:', error)
      throw error
    }
  }

  // Get payment methods for user (placeholder - would need stripeCustomerId field in User model)
  static async getPaymentMethods(userId: string) {
    try {
      // TODO: Implement when stripeCustomerId is added to User model
      logger.info(`Getting payment methods for user: ${userId}`)
      return []
    } catch (error) {
      logger.error('Error getting payment methods:', error)
      return []
    }
  }

  // Add payment method (placeholder - would need stripeCustomerId field in User model)
  static async addPaymentMethod(userId: string, paymentMethodId: string) {
    try {
      // TODO: Implement when stripeCustomerId is added to User model
      logger.info(`Adding payment method: ${paymentMethodId} for user: ${userId}`)
      return { success: true }
    } catch (error) {
      logger.error('Error adding payment method:', error)
      throw error
    }
  }

  // Remove payment method
  static async removePaymentMethod(paymentMethodId: string) {
    try {
      await stripe.paymentMethods.detach(paymentMethodId)
      logger.info(`Payment method removed: ${paymentMethodId}`)
      return { success: true }
    } catch (error) {
      logger.error('Error removing payment method:', error)
      throw error
    }
  }

  // Process vendor payout
  static async processVendorPayout(vendorId: string, amount: number, orderIds: string[]) {
    try {
      const vendor = await prisma.vendor.findUnique({
        where: { id: vendorId },
        select: { stripeAccountId: true }
      })

      if (!vendor?.stripeAccountId) {
        throw new Error('Vendor has no Stripe account')
      }

      const transfer = await stripe.transfers.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        destination: vendor.stripeAccountId,
        metadata: {
          vendorId,
          orderIds: orderIds.join(','),
          type: 'vendor_payout'
        }
      })

      logger.info(`Vendor payout initiated: ${transfer.id} for vendor: ${vendorId}`)
      return transfer
    } catch (error) {
      logger.error('Error processing vendor payout:', error)
      throw error
    }
  }

  // Get transfer status
  static async getTransferStatus(transferId: string) {
    try {
      const transfer = await stripe.transfers.retrieve(transferId)
      return {
        id: transfer.id,
        amount: transfer.amount / 100, // Convert from cents
        currency: transfer.currency,
        status: 'pending',
        created: transfer.created
      }
    } catch (error) {
      logger.error('Error getting transfer status:', error)
      throw error
    }
  }

  // Get user session data
  static async getUserSessionData(key: string) {
    await CacheService.setUserSession(key, [], 3600)
    return []
  }
}

