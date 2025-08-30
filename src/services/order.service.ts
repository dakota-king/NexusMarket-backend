import { prisma } from '../lib/database'
import { OrderStatus, PaymentStatus } from '../types'
import { logger } from '../lib/logger'
import { InventoryService } from './inventory.service'
import { PaymentService } from './payment.service'

export class OrderService {
  // Get cart items for a user
  static async getCartItems(userId: string) {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: { product: true }
    })
    return cartItems
  }

  // Calculate order total with tax and shipping
  static calculateOrderTotal(cartItems: any[], shippingCost: number = 0) {
    const subtotal = cartItems.reduce((sum: number, item: any) => {
      return sum + Number(item.product.basePrice) * item.quantity
    }, 0)
    
    const tax = subtotal * 0.1 // 10% tax
    const total = subtotal + shippingCost + tax
    
    return {
      subtotal,
      shipping: shippingCost,
      tax,
      total
    }
  }

  // Create order from cart
  static async createOrder(userId: string) {
    const cartItems = await this.getCartItems(userId)
    
    if (cartItems.length === 0) {
      throw new Error('Cart is empty')
    }

    const orderTotal = this.calculateOrderTotal(cartItems as any[])
    
    // Reserve stock for all items
    for (const item of cartItems) {
      await InventoryService.reserveStock(item.productId, item.quantity)
    }

    try {
      const order = await prisma.order.create({
        data: {
          orderNumber: await this.generateOrderNumber(),
          userId,
          vendorId: cartItems[0].product.vendorId, // Assuming single vendor for now
          status: OrderStatus.PENDING,
          paymentStatus: PaymentStatus.PENDING,
          subtotal: orderTotal.subtotal,
          shippingCost: orderTotal.shipping,
          tax: orderTotal.tax,
          total: orderTotal.total,
          items: {
            create: cartItems.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.product.basePrice,
              totalPrice: Number(item.product.basePrice) * item.quantity
            }))
          }
        },
        include: {
          items: true,
          vendor: true
        }
      })

      // Clear cart
      await prisma.cartItem.deleteMany({
        where: { userId }
      })

      logger.info(`Order created: ${order.id} for user: ${userId}`)
      return order
    } catch (error) {
      // Restore stock if order creation fails
      for (const item of cartItems) {
        await InventoryService.restoreStock(item.productId, item.quantity)
      }
      throw error
    }
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

  // Get order by ID
  static async getOrder(orderId: string, userId: string) {
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        OR: [
          { userId },
          { vendor: { userId } }
        ]
      },
      include: {
        items: { include: { product: true } },
        vendor: true,
        user: true
      }
    })

    if (!order) {
      throw new Error('Order not found')
    }

    return order
  }

  // Get user orders
  static async getUserOrders(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId },
        include: {
          items: { include: { product: true } },
          vendor: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.order.count({ where: { userId } })
    ])

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  }

  // Get vendor orders
  static async getVendorOrders(vendorId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { vendorId },
        include: {
          items: { include: { product: true } },
          user: true
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.order.count({ where: { vendorId } })
    ])

    return {
      orders,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  }

  // Update order status
  static async updateOrderStatus(orderId: string, newStatus: OrderStatus, userId: string) {
    const order = await this.getOrder(orderId, userId)
    
    if (order.vendor.userId !== userId && order.userId !== userId) {
      throw new Error('Access denied')
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: { status: newStatus }
    })

    await this.handleStatusChange(updatedOrder, newStatus, userId)
    
    logger.info(`Order status updated: ${orderId} to ${newStatus}`)
    return updatedOrder
  }

  // Cancel order
  static async cancelOrder(orderId: string, userId: string) {
    const order = await this.getOrder(orderId, userId)
    
    if (order.status !== OrderStatus.PENDING) {
      throw new Error('Order cannot be cancelled')
    }

    // Restore stock
    for (const item of order.items) {
      await InventoryService.restoreStock(item.productId, item.quantity)
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.CANCELLED,
        updatedAt: new Date()
      }
    })

    // Process refund if payment was made
    if (order.paymentStatus === PaymentStatus.COMPLETED && order.stripePaymentIntentId) {
      await PaymentService.processRefund(order.stripePaymentIntentId, Number(order.total))
    }

    logger.info(`Order cancelled: ${orderId} by user: ${userId}`)
    return updatedOrder
  }

  // Get order analytics
  static async getOrderAnalytics(vendorId: string, startDate: Date, endDate: Date) {
    const analytics = await prisma.order.aggregate({
      where: {
        vendorId,
        createdAt: {
          gte: startDate,
          lte: endDate
        },
        status: { not: OrderStatus.CANCELLED }
      },
      _count: { id: true },
      _sum: { total: true }
    })

    return {
      totalOrders: analytics._count.id,
      totalRevenue: analytics._sum.total || 0,
      averageOrderValue: analytics._count.id > 0 ? Number(analytics._sum.total || 0) / analytics._count.id : 0,
      period: { startDate, endDate }
    }
  }

  // Get order statistics
  static async getOrderStats(vendorId: string) {
    const [totalOrders, pendingOrders, completedOrders, totalRevenue] = await Promise.all([
      prisma.order.count({ where: { vendorId } }),
      prisma.order.count({ where: { vendorId, status: OrderStatus.PENDING } }),
      prisma.order.count({ where: { vendorId, status: OrderStatus.DELIVERED } }),
      prisma.order.aggregate({
        where: { vendorId, status: { not: OrderStatus.CANCELLED } },
        _sum: { total: true }
      })
    ])

    return {
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue: totalRevenue._sum.total || 0
    }
  }

  // Process order fulfillment
  static async processFulfillment(orderId: string, trackingNumber: string, userId: string) {
    const order = await this.getOrder(orderId, userId)
    
    if (order.vendor.userId !== userId) {
      throw new Error('Access denied')
    }

    if (order.status !== OrderStatus.PROCESSING) {
      throw new Error('Order is not in processing status')
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.SHIPPED,
        updatedAt: new Date()
      }
    })

    logger.info(`Order shipped: ${orderId} with tracking: ${trackingNumber}`)
    return updatedOrder
  }

  // Mark order as delivered
  static async markAsDelivered(orderId: string, userId: string) {
    const order = await this.getOrder(orderId, userId)
    
    if (order.userId !== userId) {
      throw new Error('Access denied')
    }

    if (order.status !== OrderStatus.SHIPPED) {
      throw new Error('Order is not shipped')
    }

    const updatedOrder = await prisma.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.DELIVERED,
        deliveredAt: new Date(),
        updatedAt: new Date()
      }
    })

    logger.info(`Order delivered: ${orderId}`)
    return updatedOrder
  }

  // Handle order status changes
  private static async handleStatusChange(order: any, newStatus: OrderStatus, _userId?: string) {
    // TODO: Implement status change notifications
    logger.info(`Order ${order.id} status changed to ${newStatus}`)
  }
}
