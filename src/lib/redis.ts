import { Redis } from 'ioredis'

// Temporarily disable Redis connection for development
let redis: any = null

try {
  if (process.env.REDIS_URL) {
    redis = new Redis(process.env.REDIS_URL, {
      lazyConnect: true,
      keepAlive: 30000,
      connectTimeout: 10000,
      commandTimeout: 5000,
      enableOfflineQueue: false,
      maxRetriesPerRequest: null
    })
  } else {
    console.warn('⚠️  REDIS_URL not set, Redis functionality will be disabled')
  }
} catch (error) {
  console.warn('⚠️  Failed to create Redis connection:', error)
  console.warn('   Redis functionality will be disabled')
  redis = null
}

export { redis }

if (redis) {
  redis.on('connect', () => {
    console.log('✅ Redis connected successfully')
  })

  redis.on('ready', () => {
    console.log('✅ Redis is ready')
  })

  redis.on('error', (error: any) => {
    console.error('❌ Redis error:', error)
  })

  redis.on('close', () => {
    console.log('🔌 Redis connection closed')
  })

  redis.on('reconnecting', () => {
    console.log('🔄 Redis reconnecting...')
  })

  redis.on('end', () => {
    console.log('🏁 Redis connection ended')
  })
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing Redis connection...')
  if (redis) {
    await redis.quit()
  }
  process.exit(0)
})

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing Redis connection...')
  if (redis) {
    await redis.quit()
  }
  process.exit(0)
})

export class CacheService {
  static async getCachedProduct(productId: string) {
    if (!redis) return null
    try {
      const cached = await redis.get(`product:${productId}`)
      return cached ? JSON.parse(cached) : null
    } catch (error) {
      console.error('Error getting cached product:', error)
      return null
    }
  }

  static async cacheProduct(productId: string, data: any, ttl: number = 3600) {
    if (!redis) return
    try {
      await redis.setex(`product:${productId}`, ttl, JSON.stringify(data))
    } catch (error) {
      console.error('Error caching product:', error)
    }
  }

  static async invalidateProductCache(productId: string) {
    if (!redis) return
    try {
      await redis.del(`product:${productId}`)
    } catch (error) {
      console.error('Error invalidating product cache:', error)
    }
  }

  static async getCachedSearchResults(cacheKey: string) {
    try {
      const cached = await redis.get(`search:${cacheKey}`)
      return cached ? JSON.parse(cached) : null
    } catch (error) {
      console.error('Error getting cached search results:', error)
      return null
    }
  }

  static async cacheSearchResults(cacheKey: string, data: any, ttl: number = 1800) {
    if (!redis) return
    try {
      await redis.setex(`search:${cacheKey}`, ttl, JSON.stringify(data))
    } catch (error) {
      console.error('Error caching search results:', error)
    }
  }

  static async invalidateUserCache(userId: string) {
    if (!redis) return
    try {
      const keys = await redis.keys(`user:${userId}:*`)
      if (keys.length > 0) {
        await redis.del(...keys)
      }
    } catch (error) {
      console.error('Error invalidating user cache:', error)
    }
  }

  static async invalidateVendorCache(vendorId: string) {
    if (!redis) return
    try {
      const keys = await redis.keys(`vendor:${vendorId}:*`)
      if (keys.length > 0) {
        await redis.del(...keys)
      }
    } catch (error) {
      console.error('Error invalidating vendor cache:', error)
    }
  }

  static async invalidateCategoryCache(categoryId: string) {
    if (!redis) return
    try {
      const keys = await redis.keys(`category:${categoryId}:*`)
      if (keys.length > 0) {
        await redis.del(...keys)
      }
    } catch (error) {
      console.error('Error invalidating category cache:', error)
    }
  }

  static async setUserSession(sessionId: string, data: any, ttl: number = 86400) {
    if (!redis) return
    try {
      await redis.setex(`session:${sessionId}`, ttl, JSON.stringify(data))
    } catch (error) {
      console.error('Error setting user session:', error)
    }
  }

  static async removeUserSession(sessionId: string) {
    if (!redis) return
    try {
      await redis.del(`session:${sessionId}`)
    } catch (error) {
      console.error('Error removing user session:', error)
    }
  }
}

export default redis
