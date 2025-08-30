import { Server as SocketIOServer } from 'socket.io';
import jwt from 'jsonwebtoken';
import { logger } from './logger';
export class SocketService {
    io;
    constructor(server) {
        this.io = new SocketIOServer(server, {
            cors: {
                origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
                credentials: true
            }
        });
        this.setupMiddleware();
        this.setupEventHandlers();
    }
    setupMiddleware() {
        // JWT authentication middleware
        this.io.use(async (socket, next) => {
            try {
                const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
                if (!token) {
                    return next(new Error('Authentication token required'));
                }
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                socket.data.user = decoded;
                next();
            }
            catch (error) {
                next(new Error('Invalid authentication token'));
            }
        });
    }
    setupEventHandlers() {
        this.io.on('connection', (socket) => {
            logger.info(`User connected: ${socket.data.user?.id}`);
            // Join user-specific room
            if (socket.data.user?.id) {
                socket.join(`user:${socket.data.user.id}`);
                // Join vendor room if user is a vendor
                if (socket.data.user?.role === 'VENDOR') {
                    socket.join(`vendor:${socket.data.user.id}`);
                }
            }
            // Handle product view tracking
            socket.on('product:view', (data) => {
                logger.info('Product view tracked', { productId: data.productId, userId: socket.data.user?.id });
                // TODO: Queue analytics job
            });
            // Handle cart updates
            socket.on('cart:update', (data) => {
                logger.info('Cart updated', { cartId: data.cartId, userId: socket.data.user?.id });
                // TODO: Broadcast to other connected clients
            });
            // Handle order status updates
            socket.on('order:status', (data) => {
                logger.info('Order status update', { orderId: data.orderId, status: data.status });
                // TODO: Notify relevant users
            });
            // Handle vendor notifications
            socket.on('vendor:notification', (data) => {
                logger.info('Vendor notification', { type: data.type, vendorId: socket.data.user?.id });
                // TODO: Send to vendor dashboard
            });
            socket.on('disconnect', () => {
                logger.info(`User disconnected: ${socket.data.user?.id}`);
            });
        });
    }
    // Public methods for emitting events
    emitToUser(userId, event, data) {
        this.io.to(`user:${userId}`).emit(event, data);
    }
    emitToVendor(vendorId, event, data) {
        this.io.to(`vendor:${vendorId}`).emit(event, data);
    }
    emitToAll(event, data) {
        this.io.emit(event, data);
    }
    getIO() {
        return this.io;
    }
}
// Export function for server.ts
export const socketServer = (server) => {
    return new SocketService(server);
};
export default SocketService;
//# sourceMappingURL=socket.js.map