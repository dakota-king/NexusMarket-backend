import { PrismaClient } from '@prisma/client';
declare global {
    var __prisma: PrismaClient | undefined;
}
export declare const prisma: PrismaClient<import(".prisma/client").Prisma.PrismaClientOptions, never, import("@prisma/client/runtime/library").DefaultArgs>;
export declare function checkDatabaseConnection(): Promise<boolean>;
export declare function disconnectDatabase(): Promise<void>;
export declare const optimizedQueries: {
    findProductsWithFilters: (filters: any) => import(".prisma/client").Prisma.PrismaPromise<({
        vendor: {
            rating: import("@prisma/client/runtime/library").Decimal | null;
            storeName: string;
        };
        variants: {
            price: import("@prisma/client/runtime/library").Decimal;
            stock: number;
        }[];
        images: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            order: number;
            productId: string;
            url: string;
            altText: string | null;
        }[];
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        vendorId: string;
        status: import(".prisma/client").$Enums.ProductStatus;
        rating: import("@prisma/client/runtime/library").Decimal | null;
        title: string;
        slug: string;
        description: string;
        basePrice: import("@prisma/client/runtime/library").Decimal;
        categoryId: string;
        totalReviews: number;
        totalSold: number;
        weight: import("@prisma/client/runtime/library").Decimal | null;
        dimensions: import("@prisma/client/runtime/library").JsonValue | null;
        tags: string[];
        metadata: import("@prisma/client/runtime/library").JsonValue;
    })[]>;
    getPaginatedProducts: (page: number, limit: number) => Promise<({
        vendor: {
            storeName: string;
        };
        images: {
            id: string;
            isActive: boolean;
            createdAt: Date;
            order: number;
            productId: string;
            url: string;
            altText: string | null;
        }[];
    } & {
        id: string;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
        vendorId: string;
        status: import(".prisma/client").$Enums.ProductStatus;
        rating: import("@prisma/client/runtime/library").Decimal | null;
        title: string;
        slug: string;
        description: string;
        basePrice: import("@prisma/client/runtime/library").Decimal;
        categoryId: string;
        totalReviews: number;
        totalSold: number;
        weight: import("@prisma/client/runtime/library").Decimal | null;
        dimensions: import("@prisma/client/runtime/library").JsonValue | null;
        tags: string[];
        metadata: import("@prisma/client/runtime/library").JsonValue;
    })[]>;
};
export default prisma;
//# sourceMappingURL=database.d.ts.map