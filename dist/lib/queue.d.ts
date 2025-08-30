import { Queue } from 'bullmq';
export declare function initializeQueues(): void;
export declare const getEmailQueue: () => Queue<any, any, string, any, any, string> | null;
export declare const getAnalyticsQueue: () => Queue<any, any, string, any, any, string> | null;
export declare const getInventoryQueue: () => Queue<any, any, string, any, any, string> | null;
export declare const getPaymentQueue: () => Queue<any, any, string, any, any, string> | null;
export declare const getNotificationQueue: () => Queue<any, any, string, any, any, string> | null;
export declare const queue: {
    email: Queue | null;
    analytics: Queue | null;
    inventory: Queue | null;
    payment: Queue | null;
    notification: Queue | null;
};
export declare function initializeWorkers(): void;
export default queue;
//# sourceMappingURL=queue.d.ts.map