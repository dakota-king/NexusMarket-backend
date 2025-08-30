/**
 * Generate a URL-friendly slug from a product title
 * @param title - The product title
 * @returns A URL-friendly slug
 */
export declare function generateProductSlug(title: string): string;
/**
 * Generate a unique SKU for a product variant
 * @param productId - The product ID
 * @param variantName - The variant name
 * @returns A unique SKU
 */
export declare function generateSKU(productId: string, variantName: string): string;
/**
 * Generate a simple SKU (alternative method)
 * @param prefix - SKU prefix
 * @param sequence - Sequence number
 * @returns A simple SKU
 */
export declare function generateSimpleSKU(prefix: string, sequence: number): string;
/**
 * Validate product slug format
 * @param slug - The slug to validate
 * @returns True if valid, false otherwise
 */
export declare function isValidProductSlug(slug: string): boolean;
/**
 * Validate SKU format
 * @param sku - The SKU to validate
 * @returns True if valid, false otherwise
 */
export declare function isValidSKU(sku: string): boolean;
/**
 * Generate a product code
 * @param category - Product category
 * @param sequence - Sequence number
 * @returns A product code
 */
export declare function generateProductCode(category: string, sequence: number): string;
/**
 * Generate a barcode
 * @param productId - The product ID
 * @returns A barcode string
 */
export declare function generateBarcode(productId: string): string;
/**
 * Calculate product weight in different units
 * @param weight - Weight in grams
 * @param unit - Target unit
 * @returns Weight in the specified unit
 */
export declare function convertWeight(weight: number, unit: 'g' | 'kg' | 'lb' | 'oz'): number;
/**
 * Calculate shipping weight based on product weight and packaging
 * @param productWeight - Product weight in grams
 * @param packagingWeight - Packaging weight in grams
 * @returns Total shipping weight
 */
export declare function calculateShippingWeight(productWeight: number, packagingWeight?: number): number;
/**
 * Generate product tags from title and description
 * @param title - Product title
 * @param description - Product description
 * @returns Array of relevant tags
 */
export declare function generateProductTags(title: string, description: string): string[];
/**
 * Calculate product rating from reviews
 * @param reviews - Array of review ratings
 * @returns Average rating rounded to 2 decimal places
 */
export declare function calculateProductRating(reviews: number[]): number;
/**
 * Format product price with currency
 * @param price - Price in cents
 * @param currency - Currency code
 * @returns Formatted price string
 */
export declare function formatProductPrice(price: number, currency?: string): string;
/**
 * Calculate discount percentage
 * @param originalPrice - Original price
 * @param salePrice - Sale price
 * @returns Discount percentage
 */
export declare function calculateDiscountPercentage(originalPrice: number, salePrice: number): number;
/**
 * Validate product dimensions
 * @param dimensions - Product dimensions object
 * @returns True if valid, false otherwise
 */
export declare function validateProductDimensions(dimensions: any): boolean;
/**
 * Calculate product volume
 * @param dimensions - Product dimensions
 * @returns Volume in cubic centimeters
 */
export declare function calculateProductVolume(dimensions: any): number;
/**
 * Generate product metadata for SEO
 * @param product - Product object
 * @returns SEO metadata object
 */
export declare function generateProductMetadata(product: any): any;
//# sourceMappingURL=product.utils.d.ts.map