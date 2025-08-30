# NexusMarket Backend

A robust, scalable backend API for a multi-vendor e-commerce platform built with TypeScript, Express.js, Prisma ORM, and modern Node.js patterns.

## 🚀 Features

- **Multi-Vendor Architecture**: Support for multiple vendors with individual stores
- **Real-time Updates**: Socket.io integration for live notifications and updates
- **Payment Processing**: Stripe Connect integration for vendor payouts
- **Background Jobs**: BullMQ for scalable job processing
- **Authentication**: Clerk webhook integration with JWT support
- **Caching**: Redis-based caching for performance optimization
- **Rate Limiting**: Advanced rate limiting with Redis storage
- **Database**: PostgreSQL with Prisma ORM and Supabase optimization
- **Logging**: Comprehensive logging with Winston
- **Validation**: Request validation with Zod and express-validator
- **Testing**: Jest setup for unit and integration testing
- **Production Ready**: Cluster mode, graceful shutdown, health checks

## 🏗️ Architecture

```
src/
├── controllers/          # Request handlers
├── middleware/           # Express middleware
├── routes/              # API route definitions
├── services/            # Business logic layer
├── lib/                 # Core libraries and configurations
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
├── jobs/                # Background job definitions
└── config/              # Configuration files
```

## 🛠️ Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis
- **Queue**: BullMQ
- **Real-time**: Socket.io
- **Payment**: Stripe
- **Authentication**: Clerk
- **Validation**: Zod, express-validator
- **Logging**: Winston
- **Testing**: Jest, Supertest

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- Redis 6+
- npm or yarn

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone <repository-url>
cd nexusmarket-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment setup

Copy the environment file and configure your variables:

```bash
cp env.example .env
```

Update `.env` with your configuration:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/nexusmarket"
DIRECT_URL="postgresql://username:password@localhost:5432/nexusmarket"

# Server
PORT=3001
NODE_ENV=development

# Authentication
CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_WEBHOOK_SECRET=your_clerk_webhook_secret
JWT_SECRET=your_jwt_secret_key

# Redis
REDIS_URL=redis://localhost:6379

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Frontend
FRONTEND_URL=http://localhost:3000
```

### 4. Database setup

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# (Optional) Run migrations
npm run db:migrate
```

### 5. Start the server

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

## 📚 API Documentation

### Base URL
```
http://localhost:3001/api
```

### Authentication
All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

### Endpoints

#### Products
- `GET /products` - List products with filtering and pagination
- `GET /products/:id` - Get product details
- `POST /products` - Create new product (Vendor/Admin only)
- `PUT /products/:id` - Update product (Owner/Admin only)
- `DELETE /products/:id` - Delete product (Owner/Admin only)
- `POST /products/bulk-upload` - Bulk upload products (Vendor/Admin only)

#### Orders
- `GET /orders` - List user orders
- `GET /orders/:id` - Get order details
- `POST /orders` - Create order from cart
- `PUT /orders/:id/status` - Update order status

#### Cart
- `GET /cart` - Get user cart
- `POST /cart/items` - Add item to cart
- `PUT /cart/items/:id` - Update cart item
- `DELETE /cart/items/:id` - Remove item from cart

#### Vendors
- `GET /vendors` - List vendors
- `GET /vendors/:id` - Get vendor details
- `POST /vendors` - Create vendor account
- `PUT /vendors/:id` - Update vendor profile

#### Authentication
- `GET /auth/profile` - Get current user profile
- `PUT /auth/profile` - Update user profile
- `GET /auth/addresses` - Get user addresses
- `POST /auth/addresses` - Add new address

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server with nodemon
npm run build           # Build TypeScript to JavaScript
npm start               # Start production server

# Database
npm run db:generate     # Generate Prisma client
npm run db:push         # Push schema to database
npm run db:migrate      # Run database migrations
npm run db:studio       # Open Prisma Studio

# Testing
npm test                # Run tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run tests with coverage

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint errors
npm run format          # Format code with Prettier
```

### Project Structure

```
├── src/
│   ├── controllers/    # Request handlers
│   │   ├── auth.controller.ts
│   │   ├── products.controller.ts
│   │   └── ...
│   ├── middleware/     # Express middleware
│   │   ├── auth.middleware.ts
│   │   ├── validation.middleware.ts
│   │   └── rateLimiting.middleware.ts
│   ├── routes/         # API routes
│   │   ├── index.ts
│   │   ├── products.routes.ts
│   │   └── ...
│   ├── services/       # Business logic
│   │   ├── order.service.ts
│   │   ├── payment.service.ts
│   │   └── ...
│   ├── lib/            # Core libraries
│   │   ├── database.ts
│   │   ├── redis.ts
│   │   ├── socket.ts
│   │   └── queue.ts
│   ├── types/          # TypeScript types
│   ├── utils/          # Utility functions
│   └── server.ts       # Main server file
├── prisma/
│   └── schema.prisma   # Database schema
├── tests/              # Test files
├── package.json
├── tsconfig.json
└── README.md
```

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- products.test.ts
```

### Test Structure

```
tests/
├── unit/               # Unit tests
├── integration/        # Integration tests
├── fixtures/           # Test data
└── utils/              # Test utilities
```

## 🚀 Deployment

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Environment Variables

Ensure all required environment variables are set in production:

- `NODE_ENV=production`
- `DATABASE_URL` - Production database URL
- `REDIS_URL` - Production Redis URL
- `JWT_SECRET` - Strong JWT secret
- `CLERK_SECRET_KEY` - Clerk production secret
- `STRIPE_SECRET_KEY` - Stripe production secret

### Docker (Optional)

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3001

CMD ["npm", "start"]
```

## 📊 Monitoring & Health Checks

### Health Endpoint

```
GET /health
```

Returns server status, uptime, and memory usage.

### Logging

The application uses Winston for structured logging with different levels:
- `error` - Application errors
- `warn` - Warning messages
- `info` - General information
- `debug` - Debug information (development only)

### Performance Monitoring

- Database query performance monitoring
- Redis connection health checks
- Queue job monitoring
- Rate limiting analytics

## 🔒 Security Features

- **Authentication**: JWT-based authentication with Clerk integration
- **Authorization**: Role-based access control (Customer, Vendor, Admin)
- **Rate Limiting**: Redis-based rate limiting with configurable limits
- **Input Validation**: Request validation with Zod and express-validator
- **CORS**: Configurable CORS policies
- **Helmet**: Security headers with Helmet middleware
- **SQL Injection Protection**: Prisma ORM with parameterized queries

## 🔄 Background Jobs

The application uses BullMQ for background job processing:

- **Email Jobs**: Order confirmations, notifications, etc.
- **Analytics Jobs**: Data processing and reporting
- **Inventory Jobs**: Stock management and alerts
- **Payment Jobs**: Payment processing and refunds

## 📡 Real-time Features

Socket.io integration provides real-time capabilities:

- Order status updates
- Inventory changes
- Vendor notifications
- Customer chat support
- Live analytics updates

## 🗄️ Database Schema

The Prisma schema includes models for:

- Users (Customers, Vendors, Admins)
- Products and Variants
- Orders and Order Items
- Cart and Wishlist
- Reviews and Ratings
- Categories and Tags
- Analytics and Metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the documentation
- Review the API endpoints

## 🔮 Roadmap

- [ ] GraphQL API support
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Mobile app API endpoints
- [ ] Webhook management system
- [ ] Advanced search with Elasticsearch
- [ ] Microservices architecture
- [ ] Kubernetes dent support

---

Built with ❤️ by the NexusMarket team
