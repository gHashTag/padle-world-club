import { pgTable, uuid, timestamp, integer, text, pgEnum } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./user";
import { orders } from "./order";
import { bookings } from "./booking";

// Локальное определение enum для избежания проблем с импортом
const bonusTransactionTypeEnum = pgEnum("bonus_transaction_type", [
  "earned",      // Начислено
  "spent"        // Потрачено
]);

export const bonusTransactions = pgTable("bonus_transaction", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  transactionType: bonusTransactionTypeEnum("transaction_type").notNull(),
  pointsChange: integer("points_change").notNull(), // Положительное для начисления, отрицательное для списания
  currentBalanceAfter: integer("current_balance_after").notNull(), // Для аудита
  relatedOrderId: uuid("related_order_id").references(() => orders.id, { onDelete: "set null" }), // Для начислений/списаний за покупки
  relatedBookingId: uuid("related_booking_id").references(() => bookings.id, { onDelete: "set null" }), // Для начислений за бронирования
  description: text("description").notNull(), // Описание операции
  expiresAt: timestamp("expires_at", { withTimezone: true }), // Для начисленных бонусов
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Отношения
export const bonusTransactionsRelations = relations(bonusTransactions, ({ one }) => ({
  user: one(users, {
    fields: [bonusTransactions.userId],
    references: [users.id],
  }),
  relatedOrder: one(orders, {
    fields: [bonusTransactions.relatedOrderId],
    references: [orders.id],
  }),
  relatedBooking: one(bookings, {
    fields: [bonusTransactions.relatedBookingId],
    references: [bookings.id],
  }),
}));

// Типы для TypeScript
export type BonusTransaction = typeof bonusTransactions.$inferSelect;
export type NewBonusTransaction = typeof bonusTransactions.$inferInsert;
