/**
 * Схема для модели Order (Заказы)
 * Содержит определение таблиц order и order_item и связанных типов
 */
export declare const orderStatusEnum: import("drizzle-orm/pg-core").PgEnum<["pending", "completed", "cancelled", "refunded"]>;
export declare const orders: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "order";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "order";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        userId: import("drizzle-orm/pg-core").PgColumn<{
            name: "user_id";
            tableName: "order";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        orderDate: import("drizzle-orm/pg-core").PgColumn<{
            name: "order_date";
            tableName: "order";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        totalAmount: import("drizzle-orm/pg-core").PgColumn<{
            name: "total_amount";
            tableName: "order";
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
            tableName: "order";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        status: import("drizzle-orm/pg-core").PgColumn<{
            name: "status";
            tableName: "order";
            dataType: "string";
            columnType: "PgEnumColumn";
            data: "cancelled" | "completed" | "pending" | "refunded";
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: ["pending", "completed", "cancelled", "refunded"];
            baseColumn: never;
        }, {}, {}>;
        paymentId: import("drizzle-orm/pg-core").PgColumn<{
            name: "payment_id";
            tableName: "order";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        createdAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_at";
            tableName: "order";
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
            tableName: "order";
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
export declare const orderItems: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "order_item";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "order_item";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        orderId: import("drizzle-orm/pg-core").PgColumn<{
            name: "order_id";
            tableName: "order_item";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        productId: import("drizzle-orm/pg-core").PgColumn<{
            name: "product_id";
            tableName: "order_item";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        quantity: import("drizzle-orm/pg-core").PgColumn<{
            name: "quantity";
            tableName: "order_item";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        unitPriceAtSale: import("drizzle-orm/pg-core").PgColumn<{
            name: "unit_price_at_sale";
            tableName: "order_item";
            dataType: "string";
            columnType: "PgNumeric";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        createdAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_at";
            tableName: "order_item";
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
            tableName: "order_item";
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
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;
export type UpdateOrder = Partial<Omit<NewOrder, "id" | "createdAt" | "updatedAt">>;
export type UpdateOrderItem = Partial<Omit<NewOrderItem, "id" | "createdAt" | "updatedAt">>;
export type OrderWithItems = Order & {
    items: OrderItem[];
};
export type OrderWithDetails = Order & {
    user: {
        username: string;
        firstName: string;
        lastName: string;
        email: string;
    };
    items: Array<OrderItem & {
        product: {
            name: string;
            description: string | null;
            imageUrl: string | null;
        };
    }>;
    payment?: {
        status: string;
        paymentMethod: string;
        gatewayTransactionId: string | null;
    } | null;
};
export type OrderStats = {
    totalOrders: number;
    pendingOrders: number;
    completedOrders: number;
    cancelledOrders: number;
    refundedOrders: number;
    totalRevenue: number;
    averageOrderValue: number;
    totalItemsSold: number;
    averageItemsPerOrder: number;
};
export type OrderGroupedByStatus = {
    status: string;
    ordersCount: number;
    totalRevenue: number;
    averageOrderValue: number;
};
export type OrderGroupedByDate = {
    date: string;
    ordersCount: number;
    totalRevenue: number;
    averageOrderValue: number;
};
export type OrderGroupedByUser = {
    userId: string;
    username: string;
    firstName: string;
    lastName: string;
    ordersCount: number;
    totalSpent: number;
    averageOrderValue: number;
    lastOrderDate: Date | null;
};
export type TopSellingProduct = {
    productId: string;
    productName: string;
    totalQuantitySold: number;
    totalRevenue: number;
    ordersCount: number;
    averageQuantityPerOrder: number;
};
export type OrderSummary = {
    orderId: string;
    orderDate: Date;
    status: string;
    totalAmount: number;
    currency: string;
    itemsCount: number;
    customerName: string;
    customerEmail: string;
};
export declare const ORDER_STATUSES: {
    readonly PENDING: "pending";
    readonly COMPLETED: "completed";
    readonly CANCELLED: "cancelled";
    readonly REFUNDED: "refunded";
};
export type OrderStatus = typeof ORDER_STATUSES[keyof typeof ORDER_STATUSES];
