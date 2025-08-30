declare let redis: any;
export { redis };
export declare class CacheService {
    static getCachedProduct(productId: string): Promise<any>;
    static cacheProduct(productId: string, data: any, ttl?: number): Promise<void>;
    static invalidateProductCache(productId: string): Promise<void>;
    static getCachedSearchResults(cacheKey: string): Promise<any>;
    static cacheSearchResults(cacheKey: string, data: any, ttl?: number): Promise<void>;
    static invalidateUserCache(userId: string): Promise<void>;
    static invalidateVendorCache(vendorId: string): Promise<void>;
    static invalidateCategoryCache(categoryId: string): Promise<void>;
    static setUserSession(sessionId: string, data: any, ttl?: number): Promise<void>;
    static removeUserSession(sessionId: string): Promise<void>;
}
export default redis;
//# sourceMappingURL=redis.d.ts.map