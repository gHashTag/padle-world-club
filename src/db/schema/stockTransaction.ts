import { pgTable, uuid, timestamp, integer, text, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { products } from "./product";
import { orderItems } from "./order";

// Локальное определение enum для избежания проблем с импортом
const stockTransactionTypeEnum = pgEnum("stock_transaction_type", [
  "sale",        // Продажа клиенту
  "purchase",    // Закупка (пополнение склада)
  "adjustment",  // Корректировка (инвентаризация, брак)
  "return"       // Возврат товара от клиента
]);

export const stockTransactions = pgTable("stock_transaction", {
  id: uuid("id").primaryKey().defaultRandom(),
  productId: uuid("product_id").notNull().references(() => products.id, { onDelete: "restrict" }),
  transactionType: stockTransactionTypeEnum("transaction_type").notNull(),
  quantityChange: integer("quantity_change").notNull(), // Положительное для прихода, отрицательное для расхода
  currentStockAfter: integer("current_stock_after").notNull(), // Для аудита
  relatedOrderItemId: uuid("related_order_item_id").references(() => orderItems.id, { onDelete: "set null" }), // Для продаж
  notes: text("notes"), // Дополнительные заметки
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Отношения
export const stockTransactionsRelations = relations(stockTransactions, ({ one }) => ({
  product: one(products, {
    fields: [stockTransactions.productId],
    references: [products.id],
  }),
  relatedOrderItem: one(orderItems, {
    fields: [stockTransactions.relatedOrderItemId],
    references: [orderItems.id],
  }),
}));

// Типы для TypeScript
export type StockTransaction = typeof stockTransactions.$inferSelect;
export type NewStockTransaction = typeof stockTransactions.$inferInsert;
