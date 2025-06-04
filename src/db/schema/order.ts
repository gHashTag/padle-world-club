/**
 * Схема для модели Order (Заказы)
 * Содержит определение таблиц order и order_item и связанных типов
 */

import { pgTable, uuid, timestamp, numeric, varchar, integer, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./user";
import { products } from "./product";
import { payments } from "./payment";

// Enum для статусов заказов
export const orderStatusEnum = pgEnum("order_status", [
  "pending",
  "completed", 
  "cancelled",
  "refunded"
]);

// Таблица заказов
export const orders = pgTable("order", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  orderDate: timestamp("order_date", { withTimezone: true })
    .defaultNow()
    .notNull(),
  totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull(),
  status: orderStatusEnum("status").notNull(),
  paymentId: uuid("payment_id")
    .references(() => payments.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Таблица позиций заказа
export const orderItems = pgTable("order_item", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: uuid("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "restrict" }),
  quantity: integer("quantity").notNull(),
  unitPriceAtSale: numeric("unit_price_at_sale", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Типы TypeScript
export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;
export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;

// Дополнительные типы для удобства
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

// Константы для статусов заказов
export const ORDER_STATUSES = {
  PENDING: "pending" as const,
  COMPLETED: "completed" as const,
  CANCELLED: "cancelled" as const,
  REFUNDED: "refunded" as const,
} as const;

export type OrderStatus = typeof ORDER_STATUSES[keyof typeof ORDER_STATUSES];
