import Stripe from 'stripe';
export declare class PaymentService {
    static createPaymentIntent(amount: number, currency?: string, metadata?: any): Promise<Stripe.Response<Stripe.PaymentIntent>>;
    static processPayment(paymentIntentId: string, orderData: any): Promise<{
        success: boolean;
        orders: any[];
        paymentIntent: Stripe.Response<Stripe.PaymentIntent>;
    }>;
    private static createVendorOrders;
    private static generateOrderNumber;
    private static updatePaymentStatus;
    static processRefund(paymentIntentId: string, amount: number): Promise<Stripe.Response<Stripe.Refund>>;
    static getPaymentMethods(userId: string): Promise<never[]>;
    static addPaymentMethod(userId: string, paymentMethodId: string): Promise<{
        success: boolean;
    }>;
    static removePaymentMethod(paymentMethodId: string): Promise<{
        success: boolean;
    }>;
    static processVendorPayout(vendorId: string, amount: number, orderIds: string[]): Promise<Stripe.Response<Stripe.Transfer>>;
    static getTransferStatus(transferId: string): Promise<{
        id: string;
        amount: number;
        currency: string;
        status: string;
        created: number;
    }>;
    static getUserSessionData(key: string): Promise<never[]>;
}
//# sourceMappingURL=payment.service.d.ts.map