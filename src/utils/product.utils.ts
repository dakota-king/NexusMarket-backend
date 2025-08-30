import { randomBytes } from 'crypto'

/**
 * Generate a URL-friendly slug from a product title
 * @param title - The product title
 * @returns A URL-friendly slug
 */
export function generateProductSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters except hyphens
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .substring(0, 100) // Limit length
}

/**
 * Generate a unique SKU for a product variant
 * @param productId - The product ID
 * @param variantName - The variant name
 * @returns A unique SKU
 */
export function generateSKU(productId: string, variantName: string): string {
  const timestamp = Date.now().toString(36)
  const random = randomBytes(2).toString('hex')
  const variantCode = variantName
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .substring(0, 3)
  
  return `${productId.substring(0, 8)}-${variantCode}-${timestamp}-${random}`
}

/**
 * Generate a simple SKU (alternative method)
 * @param prefix - SKU prefix
 * @param sequence - Sequence number
 * @returns A simple SKU
 */
export function generateSimpleSKU(prefix: string, sequence: number): string {
  return `${prefix.toUpperCase()}-${sequence.toString().padStart(6, '0')}`
}

/**
 * Validate product slug format
 * @param slug - The slug to validate
 * @returns True if valid, false otherwise
 */
export function isValidProductSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
  return slugRegex.test(slug) && slug.length >= 3 && slug.length <= 100
}

/**
 * Validate SKU format
 * @param sku - The SKU to validate
 * @returns True if valid, false otherwise
 */
export function isValidSKU(sku: string): boolean {
  const skuRegex = /^[A-Z0-9]+(?:-[A-Z0-9]+)*$/
  return skuRegex.test(sku) && sku.length >= 5 && sku.length <= 50
}

/**
 * Generate a product code
 * @param category - Product category
 * @param sequence - Sequence number
 * @returns A product code
 */
export function generateProductCode(category: string, sequence: number): string {
  const categoryCode = category
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .substring(0, 3)
  
  const year = new Date().getFullYear().toString().substring(2)
  const month = (new Date().getMonth() + 1).toString().padStart(2, '0')
  const sequenceStr = sequence.toString().padStart(4, '0')
  
  return `${categoryCode}${year}${month}${sequenceStr}`
}

/**
 * Generate a barcode
 * @param productId - The product ID
 * @returns A barcode string
 */
export function generateBarcode(productId: string): string {
  // Simple barcode generation - in production, use a proper barcode library
  const timestamp = Date.now().toString()
  const random = Math.random().toString(36).substring(2, 8)
  
  return `${productId.substring(0, 6)}${timestamp.substring(timestamp.length - 6)}${random}`
}

/**
 * Calculate product weight in different units
 * @param weight - Weight in grams
 * @param unit - Target unit
 * @returns Weight in the specified unit
 */
export function convertWeight(weight: number, unit: 'g' | 'kg' | 'lb' | 'oz'): number {
  const weightInGrams = weight

  switch (unit) {
    case 'kg':
      return weightInGrams / 1000
    case 'lb':
      return weightInGrams / 453.592
    case 'oz':
      return weightInGrams / 28.3495
    default:
      return weightInGrams
  }
}

/**
 * Calculate shipping weight based on product weight and packaging
 * @param productWeight - Product weight in grams
 * @param packagingWeight - Packaging weight in grams
 * @returns Total shipping weight
 */
export function calculateShippingWeight(productWeight: number, packagingWeight: number = 50): number {
  return productWeight + packagingWeight
}

/**
 * Generate product tags from title and description
 * @param title - Product title
 * @param description - Product description
 * @returns Array of relevant tags
 */
export function generateProductTags(title: string, description: string): string[] {
  const text = `${title} ${description}`.toLowerCase()
  const words = text
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2)
  
  // Remove common stop words
  const stopWords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
    'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those'
  ])
  
  const filteredWords = words.filter(word => !stopWords.has(word))
  
  // Count word frequency
  const wordCount = new Map<string, number>()
  filteredWords.forEach(word => {
    wordCount.set(word, (wordCount.get(word) || 0) + 1)
  })
  
  // Return top 10 most frequent words as tags
  return Array.from(wordCount.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word)
}

/**
 * Calculate product rating from reviews
 * @param reviews - Array of review ratings
 * @returns Average rating rounded to 2 decimal places
 */
export function calculateProductRating(reviews: number[]): number {
  if (reviews.length === 0) return 0
  
  const sum = reviews.reduce((acc, rating) => acc + rating, 0)
  const average = sum / reviews.length
  
  return Math.round(average * 100) / 100
}

/**
 * Format product price with currency
 * @param price - Price in cents
 * @param currency - Currency code
 * @returns Formatted price string
 */
export function formatProductPrice(price: number, currency: string = 'USD'): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  })
  
  return formatter.format(price / 100) // Convert from cents
}

/**
 * Calculate discount percentage
 * @param originalPrice - Original price
 * @param salePrice - Sale price
 * @returns Discount percentage
 */
export function calculateDiscountPercentage(originalPrice: number, salePrice: number): number {
  if (originalPrice <= 0 || salePrice >= originalPrice) return 0
  
  const discount = ((originalPrice - salePrice) / originalPrice) * 100
  return Math.round(discount)
}

/**
 * Validate product dimensions
 * @param dimensions - Product dimensions object
 * @returns True if valid, false otherwise
 */
export function validateProductDimensions(dimensions: any): boolean {
  if (!dimensions || typeof dimensions !== 'object') return false
  
  const { length, width, height, unit } = dimensions
  
  // Check if all dimensions are positive numbers
  if (!length || !width || !height || 
      typeof length !== 'number' || typeof width !== 'number' || typeof height !== 'number' ||
      length <= 0 || width <= 0 || height <= 0) {
    return false
  }
  
  // Check if unit is valid
  const validUnits = ['cm', 'inch', 'mm', 'm']
  if (unit && !validUnits.includes(unit)) {
    return false
  }
  
  return true
}

/**
 * Calculate product volume
 * @param dimensions - Product dimensions
 * @returns Volume in cubic centimeters
 */
export function calculateProductVolume(dimensions: any): number {
  if (!validateProductDimensions(dimensions)) return 0
  
  let { length, width, height, unit } = dimensions
  
  // Convert to centimeters
  switch (unit) {
    case 'inch':
      length *= 2.54
      width *= 2.54
      height *= 2.54
      break
    case 'mm':
      length /= 10
      width /= 10
      height /= 10
      break
    case 'm':
      length *= 100
      width *= 100
      height *= 100
      break
  }
  
  return length * width * height
}

/**
 * Generate product metadata for SEO
 * @param product - Product object
 * @returns SEO metadata object
 */
export function generateProductMetadata(product: any): any {
  return {
    title: `${product.title} - ${product.vendor?.storeName || 'NexusMarket'}`,
    description: product.description.substring(0, 160),
    keywords: product.tags?.join(', ') || '',
    image: product.images?.[0]?.url || '',
    price: product.basePrice,
    currency: 'USD',
    availability: product.status === 'ACTIVE' ? 'in stock' : 'out of stock',
    brand: product.vendor?.storeName || '',
    category: product.category?.name || ''
  }
}
