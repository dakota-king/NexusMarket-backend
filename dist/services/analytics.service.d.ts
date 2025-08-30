export declare class AnalyticsService {
    static generateDailyReport(_data: any): Promise<{
        success: boolean;
        message: string;
    }>;
    static calculateRevenueMetrics(_data: any): Promise<{
        success: boolean;
        message: string;
    }>;
    static trackUserBehavior(userId: string, action: string, metadata?: any): Promise<{
        success: boolean;
        message: string;
    }>;
    static generateInsights(timeframe: string, filters?: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
//# sourceMappingURL=analytics.service.d.ts.map