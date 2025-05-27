import { pgTable, uuid, timestamp, integer, text, pgEnum, index } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./user";
import { orders } from "./order";
import { bookings } from "./booking";

// Локальное определение enum для избежания проблем с импортом
const bonusTransactionTypeEnum = pgEnum("bonus_transaction_type", [
  "earned",      // Начислено
  "spent"        // Потрачено
]);

export const bonusTransactions = pgTable(
  "bonus_transaction",
  {
    id: uuid("id").primaryKey().defaultRandom(),

    // Связь с пользователем
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    // Тип операции (совместимость со старой схемой)
    transactionType: bonusTransactionTypeEnum("transaction_type").notNull(),

    // Изменение баланса (положительное для начисления, отрицательное для списания)
    pointsChange: integer("points_change").notNull(),

    // Описание операции
    description: text("description").notNull(),

    // Баланс после операции (для быстрого доступа)
    currentBalanceAfter: integer("current_balance_after").notNull(),

    // Связанные сущности (совместимость со старой схемой)
    relatedOrderId: uuid("related_order_id").references(() => orders.id, { onDelete: "set null" }),
    relatedBookingId: uuid("related_booking_id").references(() => bookings.id, { onDelete: "set null" }),

    // Срок действия бонусов (для начисленных)
    expiresAt: timestamp("expires_at", { withTimezone: true }),

    // Метаданные
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    // Индексы для оптимизации запросов
    userIdIdx: index("bonus_transaction_user_id_idx").on(table.userId),
    typeIdx: index("bonus_transaction_type_idx").on(table.transactionType),
    createdAtIdx: index("bonus_transaction_created_at_idx").on(table.createdAt),
  })
);

/**
 * Связи для BonusTransaction
 */
export const bonusTransactionsRelations = relations(bonusTransactions, ({ one }) => ({
  // Пользователь, которому принадлежит транзакция
  user: one(users, {
    fields: [bonusTransactions.userId],
    references: [users.id],
  }),

  // Связанный заказ
  relatedOrder: one(orders, {
    fields: [bonusTransactions.relatedOrderId],
    references: [orders.id],
  }),

  // Связанное бронирование
  relatedBooking: one(bookings, {
    fields: [bonusTransactions.relatedBookingId],
    references: [bookings.id],
  }),
}));

/**
 * Типы для работы с BonusTransaction
 */
export type BonusTransaction = typeof bonusTransactions.$inferSelect;
export type NewBonusTransaction = typeof bonusTransactions.$inferInsert;
