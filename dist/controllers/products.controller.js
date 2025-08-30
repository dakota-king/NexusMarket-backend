import { prisma } from '../lib/database';
import { logger } from '../lib/logger';
import { CacheService } from '../lib/redis';
import { getAnalyticsQueue } from '../lib/queue';
import { CreateProductSchema, UpdateProductSchema, ProductSearchSchema, BulkUploadSchema, CreateProductReviewSchema } from '../lib/validation/product.schema';
import { generateProductSlug, generateSKU } from '../utils/product.utils';
export async function getProducts(req, res) {
    try {
        const { page = 1, limit = 20, search, category, minPrice, maxPrice, vendorId, sortBy = 'createdAt', sortOrder = 'desc', minRating } = ProductSearchSchema.parse(req.query);
        const skip = (page - 1) * limit;
        // Build where clause
        const where = {
            isActive: true,
            status: 'ACTIVE',
            ...(search && {
                OR: [
                    { title: { contains: search, mode: 'insensitive' } },
                    { description: { contains: search, mode: 'insensitive' } },
                    { tags: { hasSome: search.split(' ') } }
                ]
            }),
            ...(category && { categoryId: category }),
            ...(vendorId && { vendorId }),
            ...(minRating && { rating: { gte: minRating } }),
            ...(minPrice || maxPrice) && {
                OR: [
                    { basePrice: { ...(minPrice && { gte: minPrice }), ...(maxPrice && { lte: maxPrice }) } },
                    { variants: { some: { price: { ...(minPrice && { gte: minPrice }), ...(maxPrice && { lte: maxPrice }) } } } }
                ]
            }
        };
        // Check cache first
        const cacheKey = `products:${JSON.stringify({ page, limit, search, category, minPrice, maxPrice, vendorId, sortBy, sortOrder, minRating })}`;
        const cached = await CacheService.getCachedSearchResults(cacheKey);
        if (cached) {
            res.json(cached);
            return;
        }
        const [products, totalCount] = await Promise.all([
            prisma.product.findMany({
                where,
                include: {
                    vendor: {
                        select: {
                            id: true,
                            storeName: true,
                            rating: true,
                            slug: true
                        }
                    },
                    category: {
                        select: { name: true, slug: true }
                    },
                    images: {
                        where: { isActive: true },
                        orderBy: { order: 'asc' },
                        take: 1
                    },
                    variants: {
                        where: { isActive: true },
                        orderBy: { price: 'asc' },
                        select: {
                            id: true,
                            name: true,
                            price: true,
                            stock: true,
                            attributes: true
                        }
                    },
                    _count: {
                        select: {
                            reviews: true,
                            variants: true
                        }
                    }
                },
                orderBy: { [sortBy]: sortOrder },
                skip,
                take: limit
            }),
            prisma.product.count({ where })
        ]);
        const totalPages = Math.ceil(totalCount / limit);
        const response = {
            success: true,
            data: products,
            pagination: {
                page,
                limit,
                totalCount,
                totalPages,
                hasNext: page < totalPages,
                hasPrev: page > 1
            }
        };
        // Cache the results
        await CacheService.cacheSearchResults(cacheKey, response);
        // Track search analytics
        if (search) {
            const analyticsQueue = getAnalyticsQueue();
            if (analyticsQueue) {
                analyticsQueue.add('update-search-analytics', {
                    type: 'update-search-analytics',
                    data: { search, resultsCount: products.length }
                });
            }
        }
        res.json(response);
    }
    catch (error) {
        logger.error('Error fetching products:', error);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
}
export async function getProduct(req, res) {
    try {
        const { id } = req.params;
        // Check cache first
        const cached = await CacheService.getCachedProduct(id);
        if (cached) {
            res.json(cached);
            return;
        }
        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                vendor: {
                    select: {
                        id: true,
                        storeName: true,
                        rating: true,
                        slug: true,
                        description: true,
                        logo: true
                    }
                },
                category: {
                    select: { name: true, slug: true, description: true }
                },
                images: {
                    where: { isActive: true },
                    orderBy: { order: 'asc' }
                },
                variants: {
                    where: { isActive: true },
                    orderBy: { price: 'asc' }
                },
                reviews: {
                    where: { isVerified: true },
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                    include: {
                        user: {
                            select: { firstName: true, lastName: true, avatarUrl: true }
                        }
                    }
                },
                _count: {
                    select: {
                        reviews: true,
                        variants: true
                    }
                }
            }
        });
        if (!product) {
            res.status(404).json({ error: 'Product not found' });
            return;
        }
        // Update view count
        const analyticsQueue = getAnalyticsQueue();
        if (analyticsQueue) {
            analyticsQueue.add('update-product-views', {
                type: 'update-product-views',
                data: { productId: id }
            });
        }
        const response = {
            success: true,
            data: product
        };
        // Cache the product
        await CacheService.cacheProduct(id, response);
        res.json(response);
    }
    catch (error) {
        logger.error('Error fetching product:', error);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
}
export async function createProduct(req, res) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }
        const productData = CreateProductSchema.parse(req.body);
        // Verify user is a vendor
        const vendor = await prisma.vendor.findUnique({
            where: { userId }
        });
        if (!vendor || !vendor.isApproved) {
            res.status(403).json({ error: 'Vendor access required' });
            return;
        }
        const product = await prisma.$transaction(async (tx) => {
            const newProduct = await tx.product.create({
                data: {
                    ...productData,
                    vendorId: vendor.id,
                    slug: generateProductSlug(productData.title)
                }
            });
            // Create product variants
            if (productData.variants?.length) {
                await tx.productVariant.createMany({
                    data: productData.variants.map((variant) => ({
                        ...variant,
                        productId: newProduct.id,
                        sku: generateSKU(newProduct.id, variant.name)
                    }))
                });
            }
            // Create product images
            if (productData.images?.length) {
                await tx.productImage.createMany({
                    data: productData.images.map((image, index) => ({
                        productId: newProduct.id,
                        url: image.url,
                        altText: image.altText || productData.title,
                        order: image.order || index
                    }))
                });
            }
            return newProduct;
        });
        // Clear relevant caches
        await CacheService.invalidateVendorCache(vendor.id);
        await CacheService.invalidateCategoryCache(productData.categoryId);
        logger.info(`Product created: ${product.id} by vendor: ${vendor.id}`);
        res.status(201).json({
            success: true,
            data: product,
            message: 'Product created successfully'
        });
    }
    catch (error) {
        logger.error('Product creation error:', error);
        res.status(500).json({ error: 'Failed to create product' });
    }
}
export async function updateProduct(req, res) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }
        const { id } = req.params;
        const productData = UpdateProductSchema.parse(req.body);
        // Verify user owns this product or is admin
        const product = await prisma.product.findUnique({
            where: { id },
            include: { vendor: true }
        });
        if (!product) {
            res.status(404).json({ error: 'Product not found' });
            return;
        }
        if (product.vendor.userId !== userId && req.user?.role !== 'ADMIN') {
            res.status(403).json({ error: 'Access denied' });
            return;
        }
        const updatedProduct = await prisma.product.update({
            where: { id },
            data: {
                ...Object.fromEntries(Object.entries(productData).filter(([_, value]) => value !== undefined)),
                ...(productData.title && { slug: generateProductSlug(productData.title) }),
                updatedAt: new Date()
            }
        });
        // Clear caches
        await CacheService.invalidateProductCache(id);
        await CacheService.invalidateVendorCache(product.vendorId);
        if (productData.categoryId) {
            await CacheService.invalidateCategoryCache(productData.categoryId);
        }
        logger.info(`Product updated: ${id} by user: ${userId}`);
        res.json({
            success: true,
            data: updatedProduct,
            message: 'Product updated successfully'
        });
    }
    catch (error) {
        logger.error('Product update error:', error);
        res.status(500).json({ error: 'Failed to update product' });
    }
}
export async function deleteProduct(req, res) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }
        const { id } = req.params;
        // Verify user owns this product or is admin
        const product = await prisma.product.findUnique({
            where: { id },
            include: { vendor: true }
        });
        if (!product) {
            res.status(404).json({ error: 'Product not found' });
            return;
        }
        if (product.vendor.userId !== userId && req.user?.role !== 'ADMIN') {
            res.status(403).json({ error: 'Access denied' });
            return;
        }
        // Soft delete
        await prisma.product.update({
            where: { id },
            data: {
                isActive: false,
                status: 'ARCHIVED',
                updatedAt: new Date()
            }
        });
        // Clear caches
        await CacheService.invalidateProductCache(id);
        await CacheService.invalidateVendorCache(product.vendorId);
        logger.info(`Product deleted: ${id} by user: ${userId}`);
        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    }
    catch (error) {
        logger.error('Product deletion error:', error);
        res.status(500).json({ error: 'Failed to delete product' });
    }
}
export async function bulkUploadProducts(req, res) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }
        const { products } = BulkUploadSchema.parse(req.body);
        // Verify user is a vendor
        const vendor = await prisma.vendor.findUnique({
            where: { userId }
        });
        if (!vendor || !vendor.isApproved) {
            res.status(403).json({ error: 'Vendor access required' });
            return;
        }
        const results = await prisma.$transaction(async (tx) => {
            const createdProducts = [];
            for (const productData of products) {
                const product = await tx.product.create({
                    data: {
                        ...productData,
                        vendorId: vendor.id,
                        slug: generateProductSlug(productData.title)
                    }
                });
                // Create variants
                if (productData.variants?.length) {
                    await tx.productVariant.createMany({
                        data: productData.variants.map((variant) => ({
                            ...variant,
                            productId: product.id,
                            sku: generateSKU(product.id, variant.name)
                        }))
                    });
                }
                // Create images
                if (productData.images?.length) {
                    await tx.productImage.createMany({
                        data: productData.images.map((image, index) => ({
                            productId: product.id,
                            url: image.url,
                            altText: image.altText || productData.title,
                            order: image.order || index
                        }))
                    });
                }
                createdProducts.push(product);
            }
            return createdProducts;
        });
        // Clear caches
        await CacheService.invalidateVendorCache(vendor.id);
        logger.info(`Bulk upload completed: ${results.length} products by vendor: ${vendor.id}`);
        res.status(201).json({
            success: true,
            data: results,
            message: `${results.length} products created successfully`
        });
    }
    catch (error) {
        logger.error('Bulk upload error:', error);
        res.status(500).json({ error: 'Failed to upload products' });
    }
}
export async function getProductAnalytics(req, res) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }
        const { id } = req.params;
        const { startDate, endDate } = req.query;
        // Verify user owns this product or is admin
        const product = await prisma.product.findUnique({
            where: { id },
            include: { vendor: true }
        });
        if (!product) {
            res.status(404).json({ error: 'Product not found' });
            return;
        }
        if (product.vendor.userId !== userId && req.user?.role !== 'ADMIN') {
            res.status(403).json({ error: 'Access denied' });
            return;
        }
        // Get analytics data
        const analytics = await prisma.productAnalytics.findMany({
            where: {
                productId: id,
                ...(startDate && { date: { gte: new Date(startDate) } }),
                ...(endDate && { date: { lte: new Date(endDate) } })
            },
            orderBy: { date: 'asc' }
        });
        // Get review statistics
        const reviewStats = await prisma.review.aggregate({
            where: { productId: id },
            _avg: { rating: true },
            _count: { rating: true }
        });
        // Get order statistics
        const orderStats = await prisma.orderItem.aggregate({
            where: { productId: id },
            _sum: { quantity: true, totalPrice: true },
            _count: { orderId: true }
        });
        const response = {
            success: true,
            data: {
                analytics,
                reviewStats: {
                    averageRating: reviewStats._avg.rating || 0,
                    totalReviews: reviewStats._count.rating
                },
                orderStats: {
                    totalQuantity: orderStats._sum.quantity || 0,
                    totalRevenue: orderStats._sum.totalPrice || 0,
                    totalOrders: orderStats._count.orderId
                }
            }
        };
        res.json(response);
    }
    catch (error) {
        logger.error('Product analytics error:', error);
        res.status(500).json({ error: 'Failed to get product analytics' });
    }
}
export async function createProductReview(req, res) {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: 'User not authenticated' });
            return;
        }
        const { id } = req.params;
        const reviewData = CreateProductReviewSchema.parse(req.body);
        // Check if user has already reviewed this product
        const existingReview = await prisma.review.findUnique({
            where: {
                userId_productId: {
                    userId,
                    productId: id
                }
            }
        });
        if (existingReview) {
            res.status(400).json({ error: 'You have already reviewed this product' });
            return;
        }
        // Create review
        const review = await prisma.review.create({
            data: {
                ...reviewData,
                userId,
                productId: id
            },
            include: {
                user: {
                    select: { firstName: true, lastName: true, avatarUrl: true }
                }
            }
        });
        // Update product rating
        await updateProductRating(id);
        // Clear product cache
        await CacheService.invalidateProductCache(id);
        logger.info(`Review created for product: ${id} by user: ${userId}`);
        res.status(201).json({
            success: true,
            data: review,
            message: 'Review created successfully'
        });
    }
    catch (error) {
        logger.error('Review creation error:', error);
        res.status(500).json({ error: 'Failed to create review' });
    }
}
async function updateProductRating(productId) {
    try {
        const ratingStats = await prisma.review.aggregate({
            where: { productId },
            _avg: { rating: true },
            _count: { rating: true }
        });
        await prisma.product.update({
            where: { id: productId },
            data: {
                rating: ratingStats._avg.rating || 0,
                totalReviews: ratingStats._count.rating
            }
        });
    }
    catch (error) {
        logger.error('Error updating product rating:', error);
    }
}
//# sourceMappingURL=products.controller.js.map