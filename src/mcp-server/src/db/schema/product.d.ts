/**
 * Схема для модели Product (Товары/услуги)
 * Содержит определение таблицы product и связанных типов
 */
export declare const products: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "product";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "product";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        categoryId: import("drizzle-orm/pg-core").PgColumn<{
            name: "category_id";
            tableName: "product";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        name: import("drizzle-orm/pg-core").PgColumn<{
            name: "name";
            tableName: "product";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        description: import("drizzle-orm/pg-core").PgColumn<{
            name: "description";
            tableName: "product";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        price: import("drizzle-orm/pg-core").PgColumn<{
            name: "price";
            tableName: "product";
            dataType: "string";
            columnType: "PgNumeric";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        currency: import("drizzle-orm/pg-core").PgColumn<{
            name: "currency";
            tableName: "product";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        imageUrl: import("drizzle-orm/pg-core").PgColumn<{
            name: "image_url";
            tableName: "product";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        currentStock: import("drizzle-orm/pg-core").PgColumn<{
            name: "current_stock";
            tableName: "product";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        reorderThreshold: import("drizzle-orm/pg-core").PgColumn<{
            name: "reorder_threshold";
            tableName: "product";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        isActive: import("drizzle-orm/pg-core").PgColumn<{
            name: "is_active";
            tableName: "product";
            dataType: "boolean";
            columnType: "PgBoolean";
            data: boolean;
            driverParam: boolean;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        createdAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_at";
            tableName: "product";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        updatedAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "updated_at";
            tableName: "product";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;
export type UpdateProduct = Partial<Omit<NewProduct, "id" | "createdAt" | "updatedAt">>;
export type ProductWithCategory = Product & {
    category: {
        name: string;
        description: string | null;
        type: string;
    };
};
export type ProductStats = {
    totalProducts: number;
    activeProducts: number;
    inactiveProducts: number;
    lowStockProducts: number;
    outOfStockProducts: number;
    totalStockValue: number;
    averagePrice: number;
    averageStockLevel: number;
};
export type ProductGroupedByCategory = {
    categoryId: string;
    categoryName: string;
    categoryType: string;
    productsCount: number;
    activeProductsCount: number;
    totalStockValue: number;
    averagePrice: number;
};
export type ProductStockAlert = {
    productId: string;
    productName: string;
    currentStock: number;
    reorderThreshold: number;
    stockStatus: "low_stock" | "out_of_stock";
    categoryName: string;
};
export type ProductSalesData = {
    productId: string;
    productName: string;
    totalSold: number;
    totalRevenue: number;
    averageOrderQuantity: number;
    lastSaleDate: Date | null;
    categoryName: string;
};
export type ProductPriceHistory = {
    productId: string;
    productName: string;
    currentPrice: number;
    priceChanges: Array<{
        date: Date;
        oldPrice: number;
        newPrice: number;
        changePercentage: number;
    }>;
};
export type ProductInventoryReport = {
    productId: string;
    productName: string;
    categoryName: string;
    currentStock: number;
    reorderThreshold: number;
    stockValue: number;
    lastRestockDate: Date | null;
    averageMonthlyUsage: number;
    recommendedOrderQuantity: number;
};
