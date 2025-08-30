export declare class InventoryService {
    static updateStock(productId: string, quantity: number, operation: 'add' | 'subtract'): Promise<{
        success: boolean;
        message: string;
    }>;
    static checkLowStock(threshold?: number): Promise<{
        success: boolean;
        message: string;
    }>;
    static reserveStock(productId: string, quantity: number): Promise<void>;
    static restoreStock(productId: string, quantity: number): Promise<void>;
}
//# sourceMappingURL=inventory.service.d.ts.map