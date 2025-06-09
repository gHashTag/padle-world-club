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
// Константы для статусов заказов
export const ORDER_STATUSES = {
    PENDING: "pending",
    COMPLETED: "completed",
    CANCELLED: "cancelled",
    REFUNDED: "refunded",
};
