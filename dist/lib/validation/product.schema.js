import { z } from 'zod';
// Product variant schema
export const ProductVariantSchema = z.object({
    name: z.string().min(1, 'Variant name is required'),
    price: z.number().positive('Price must be positive'),
    stock: z.number().int().min(0, 'Stock must be non-negative'),
    sku: z.string().optional(),
    attributes: z.record(z.string(), z.any()).optional()
});
// Product image schema
export const ProductImageSchema = z.object({
    url: z.string().url('Invalid image URL'),
    altText: z.string().optional(),
    order: z.number().int().min(0).optional()
});
// Product dimensions schema
export const ProductDimensionsSchema = z.object({
    unit: z.enum(['cm', 'inch']),
    length: z.number().positive().optional(),
    width: z.number().positive().optional(),
    height: z.number().positive().optional()
});
// Create product schema
export const CreateProductSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
    description: z.string().min(10, 'Description must be at least 10 characters'),
    basePrice: z.number().positive('Base price must be positive'),
    categoryId: z.string().min(1, 'Category is required'),
    weight: z.number().positive().optional(),
    dimensions: ProductDimensionsSchema.optional(),
    tags: z.array(z.string()).optional(),
    variants: z.array(ProductVariantSchema).optional(),
    images: z.array(ProductImageSchema).optional(),
    isActive: z.boolean().default(true)
});
// Update product schema
export const UpdateProductSchema = CreateProductSchema.partial();
// Product search schema
export const ProductSearchSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().optional(),
    category: z.string().optional(),
    minPrice: z.coerce.number().positive().optional(),
    maxPrice: z.coerce.number().positive().optional(),
    vendorId: z.string().optional(),
    sortBy: z.enum(['createdAt', 'price', 'rating', 'title']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    minRating: z.coerce.number().min(0).max(5).optional()
});
// Product variant create schema
export const CreateProductVariantSchema = z.object({
    name: z.string().min(1, 'Variant name is required'),
    price: z.number().positive('Price must be positive'),
    stock: z.number().int().min(0, 'Stock must be non-negative'),
    attributes: z.record(z.string(), z.any()).optional()
});
// Product variant update schema
export const UpdateProductVariantSchema = CreateProductVariantSchema.partial();
// Product review schema
export const CreateProductReviewSchema = z.object({
    rating: z.number().min(1).max(5, 'Rating must be between 1 and 5'),
    title: z.string().min(1, 'Review title is required').max(100, 'Title too long'),
    comment: z.string().min(10, 'Comment must be at least 10 characters').max(1000, 'Comment too long')
});
// Bulk upload schema
export const BulkUploadSchema = z.object({
    products: z.array(CreateProductSchema)
});
//# sourceMappingURL=product.schema.js.map