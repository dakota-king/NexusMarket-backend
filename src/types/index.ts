// User and Authentication Types
export interface User {
  id: string
  clerkId: string
  email: string
  role: UserRole
  firstName: string
  lastName: string
  avatarUrl?: string
  isActive: boolean
  lastLoginAt?: Date
  createdAt: Date
  updatedAt: Date
}

export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  VENDOR = 'VENDOR',
  ADMIN = 'ADMIN'
}

export interface Customer {
  id: string
  userId: string
  phone?: string
  dateOfBirth?: Date
  preferences: Record<string, any>
  totalSpent: number
  loyaltyPoints: number
  createdAt: Date
  updatedAt: Date
}

export interface Vendor {
  id: string
  userId: string
  storeName: string
  slug: string
  description?: string
  logo?: string
  coverImage?: string
  isApproved: boolean
  rating?: number
  totalSales: number
  stripeAccountId?: string
  businessEmail?: string
  businessPhone?: string
  address?: Address
  settings: Record<string, any>
  commissionRate: number
  createdAt: Date
  updatedAt: Date
}

// Product Types
export interface Product {
  id: string
  vendorId: string
  title: string
  slug: string
  description: string
  basePrice: number
  categoryId: string
  status: ProductStatus
  isActive: boolean
  rating?: number
  totalReviews: number
  totalSold: number
  weight?: number
  dimensions?: Dimensions
  tags: string[]
  metadata: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export enum ProductStatus {
  DRAFT = 'DRAFT',
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ARCHIVED = 'ARCHIVED'
}

export interface ProductVariant {
  id: string
  productId: string
  name: string
  sku: string
  price: number
  stock: number
  attributes: Record<string, any>
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ProductImage {
  id: string
  productId: string
  url: string
  altText?: string
  order: number
  isActive: boolean
  createdAt: Date
}

// Category Types
export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image?: string
  parentId?: string
  isActive: boolean
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

// Order Types
export interface Order {
  id: string
  orderNumber: string
  userId: string
  vendorId: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  subtotal: number
  shippingCost: number
  tax: number
  total: number
  stripePaymentIntentId?: string
  stripeTransferId?: string
  notes?: string
  estimatedDelivery?: Date
  deliveredAt?: Date
  createdAt: Date
  updatedAt: Date
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PROCESSING = 'PROCESSING',
  SHIPPED = 'SHIPPED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED'
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED'
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  variantId?: string
  quantity: number
  unitPrice: number
  totalPrice: number
  productSnapshot: Record<string, any>
  createdAt: Date
}

export interface OrderStatusHistory {
  id: string
  orderId: string
  status: OrderStatus
  notes?: string
  createdAt: Date
}

// Cart Types
export interface CartItem {
  id: string
  userId: string
  productId: string
  variantId?: string
  quantity: number
  createdAt: Date
  updatedAt: Date
}

// Review Types
export interface Review {
  id: string
  userId: string
  productId: string
  rating: number
  title?: string
  comment?: string
  isVerified: boolean
  createdAt: Date
  updatedAt: Date
}

// Address Types
export interface Address {
  id: string
  userId: string
  type: 'billing' | 'shipping'
  firstName: string
  lastName: string
  company?: string
  address1: string
  address2?: string
  city: string
  state: string
  postalCode: string
  country: string
  phone?: string
  isDefault: boolean
  createdAt: Date
  updatedAt: Date
}

// Shipping Types
export interface Shipping {
  id: string
  orderId: string
  carrier: string
  trackingNumber?: string
  method: string
  cost: number
  estimatedDays?: number
  shippedAt?: Date
  deliveredAt?: Date
  createdAt: Date
  updatedAt: Date
}

// Wishlist Types
export interface WishlistItem {
  id: string
  userId: string
  productId: string
  createdAt: Date
}

// Notification Types
export interface Notification {
  id: string
  userId: string
  type: string
  title: string
  message: string
  isRead: boolean
  data?: Record<string, any>
  createdAt: Date
}

// Analytics Types
export interface VendorAnalytics {
  id: string
  vendorId: string
  date: Date
  totalSales: number
  totalOrders: number
  totalProducts: number
  avgRating?: number
  createdAt: Date
}

export interface ProductAnalytics {
  id: string
  productId: string
  date: Date
  views: number
  clicks: number
  sales: number
  revenue: number
  createdAt: Date
}

// Payment Types
export interface PaymentIntent {
  id: string
  amount: number
  currency: string
  status: string
  client_secret: string
}

export interface StripeTransfer {
  amount: number
  currency: string
  destination: string
  transfer_group: string
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  message?: string
  error?: string
  pagination?: PaginationInfo
}

export interface PaginationInfo {
  page: number
  limit: number
  totalCount: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

// Request Types
export interface AuthenticatedRequest extends Request {
  user?: User
}

export interface CreateProductRequest {
  title: string
  description: string
  basePrice: number
  categoryId: string
  weight?: number
  dimensions?: Dimensions
  tags?: string[]
  variants?: CreateProductVariantRequest[]
  images?: CreateProductImageRequest[]
}

export interface CreateProductVariantRequest {
  name: string
  price: number
  stock: number
  attributes?: Record<string, any>
}

export interface CreateProductImageRequest {
  url: string
  altText?: string
  order?: number
}

export interface CreateOrderRequest {
  items: CreateOrderItemRequest[]
  shippingAddressId: string
  billingAddressId: string
  paymentMethodId: string
}

export interface CreateOrderItemRequest {
  productId: string
  variantId?: string
  quantity: number
}

// Search and Filter Types
export interface ProductSearchFilters {
  page?: number
  limit?: number
  search?: string
  category?: string
  minPrice?: number
  maxPrice?: number
  vendorId?: string
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  minRating?: number
  tags?: string[]
  inStock?: boolean
}

// Socket Types
export interface SocketMessage {
  type: string
  data: any
  timestamp: Date
}

export interface InventoryUpdate {
  productId: string
  stock: number
  timestamp: Date
}

export interface OrderUpdate {
  orderId: string
  status: OrderStatus
  timestamp: Date
}

// Utility Types
export interface Dimensions {
  length?: number
  width?: number
  height?: number
  unit?: 'cm' | 'inch'
}

export interface BusinessInfo {
  firstName: string
  lastName: string
  email: string
  phone?: string
  businessName: string
  businessType: string
  taxId?: string
}

// Environment Types
export interface EnvironmentConfig {
  NODE_ENV: string
  PORT: number
  DATABASE_URL: string
  REDIS_URL: string
  CLERK_SECRET_KEY: string
  CLERK_WEBHOOK_SECRET: string
  JWT_SECRET: string
  STRIPE_SECRET_KEY: string
  FRONTEND_URL: string
}

// Job Types
export interface EmailJobData {
  type: 'order-confirmation' | 'order-status-update' | 'low-stock-alert' | 'welcome-email' | 'password-reset' | 'vendor-approval' | 'bulk-notification'
  data: any
}

export interface AnalyticsJobData {
  type: 'update-product-views' | 'calculate-vendor-metrics' | 'generate-daily-report' | 'update-search-analytics' | 'calculate-revenue-metrics'
  data: any
}

export interface InventoryJobData {
  type: 'check-low-stock' | 'sync-inventory' | 'reserve-stock' | 'update-stock-levels' | 'generate-inventory-report'
  data: any
}
