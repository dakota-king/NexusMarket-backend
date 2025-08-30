import winston from 'winston';
export declare const logger: winston.Logger;
export declare const stream: {
    write: (message: string) => void;
};
export declare class LoggerService {
    static info(message: string, meta?: any): void;
    static error(message: string, error?: any): void;
    static warn(message: string, meta?: any): void;
    static debug(message: string, meta?: any): void;
    static http(message: string, meta?: any): void;
    static logDatabaseOperation(operation: string, model: string, duration: number, success: boolean): void;
    static logApiRequest(method: string, path: string, statusCode: number, duration: number, userId?: string): void;
    static logAuthEvent(event: string, userId: string, success: boolean, ip?: string): void;
    static logPaymentEvent(event: string, orderId: string, amount: number, success: boolean): void;
    static logInventoryChange(productId: string, oldStock: number, newStock: number, userId: string): void;
    static logOrderStatusChange(orderId: string, oldStatus: string, newStatus: string, userId: string): void;
    static logPerformance(operation: string, duration: number, metadata?: any): void;
    static logSecurityEvent(event: string, userId?: string, ip?: string, details?: any): void;
}
export default logger;
//# sourceMappingURL=logger.d.ts.map