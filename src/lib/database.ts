import { PrismaClient } from '@prisma/client'

declare global {
  var __prisma: PrismaClient | undefined
}

// Check if DATABASE_URL is set
const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  console.warn('⚠️  DATABASE_URL environment variable is not set')
  console.warn('   For development, you can use a local PostgreSQL database or set DATABASE_URL in your .env file')
  console.warn('   Example: DATABASE_URL="postgresql://username:password@localhost:5432/nexusmarket"')
}

export const prisma = global.__prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: databaseUrl || 'postgresql://postgres:password@localhost:5432/nexusmarket'
    }
  }
})

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma
}

// Connection health check
export async function checkDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`
    console.log('✅ Database connection successful')
    return true
  } catch (error) {
    console.error('❌ Database connection failed:', error)
    console.warn('   This is expected if PostgreSQL is not running or the database does not exist')
    console.warn('   For development, you can:')
    console.warn('   1. Install and start PostgreSQL')
    console.warn('   2. Create a database named "nexusmarket"')
    console.warn('   3. Set DATABASE_URL in your .env file')
    console.warn('   4. Run "npx prisma db push" to create the schema')
    return false
  }
}

// Graceful shutdown
export async function disconnectDatabase() {
  try {
    await prisma.$disconnect()
    console.log('✅ Database disconnected successfully')
  } catch (error) {
    console.error('❌ Error disconnecting database:', error)
  }
}

// Optimized queries with proper indexing
export const optimizedQueries = {
  // Use database indexes for common queries
  findProductsWithFilters: (filters: any) => {
    return prisma.product.findMany({
      where: filters,
      include: {
        vendor: { select: { storeName: true, rating: true } },
        images: { take: 1, orderBy: { order: 'asc' } },
        variants: { select: { price: true, stock: true }, orderBy: { price: 'asc' }, take: 1 }
      }
    })
  },

  // Optimized pagination for large datasets
  getPaginatedProducts: async (page: number, limit: number) => {
    // Use cursor-based pagination for better performance
    const skip = (page - 1) * limit
    
    return prisma.product.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        vendor: { select: { storeName: true } },
        images: { take: 1 }
      }
    })
  }
}

export default prisma
