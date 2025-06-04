/**
 * Схема таблицы payment для Drizzle ORM
 * Соответствует модели Payment из MAIN_MODEL.mdc
 */
import { pgTable, uuid, timestamp, numeric, varchar, text, } from "drizzle-orm/pg-core";
import { paymentStatusEnum, paymentMethodEnum } from "./enums";
import { users } from "./user";
import { bookingParticipants } from "./bookingParticipant";
export const payments = pgTable("payment", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "restrict" }),
    amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull(),
    status: paymentStatusEnum("status").notNull(),
    paymentMethod: paymentMethodEnum("payment_method").notNull(),
    gatewayTransactionId: varchar("gateway_transaction_id", { length: 255 }),
    description: text("description"),
    // Полиморфные связи с источниками платежа
    relatedBookingParticipantId: uuid("related_booking_participant_id")
        .references(() => bookingParticipants.id, { onDelete: "set null" }),
    relatedOrderId: uuid("related_order_id"), // FK -> Order (будет добавлено позже)
    relatedUserTrainingPackageId: uuid("related_user_training_package_id"), // FK -> UserTrainingPackage (будет добавлено позже)
    createdAt: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
});
