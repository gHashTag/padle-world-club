/**
 * Схема таблицы booking_participant для Drizzle ORM
 * Соответствует модели BookingParticipant из MAIN_MODEL.mdc
 */
import { pgTable, uuid, timestamp, numeric, boolean, unique, } from "drizzle-orm/pg-core";
import { paymentStatusEnum, classParticipantStatusEnum } from "./enums";
import { bookings } from "./booking";
import { users } from "./user";
export const bookingParticipants = pgTable("booking_participant", {
    id: uuid("id").defaultRandom().primaryKey(),
    bookingId: uuid("booking_id")
        .notNull()
        .references(() => bookings.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "restrict" }),
    amountOwed: numeric("amount_owed", { precision: 10, scale: 2 }).notNull(),
    amountPaid: numeric("amount_paid", { precision: 10, scale: 2 }).notNull().default("0.00"),
    paymentStatus: paymentStatusEnum("payment_status").notNull().default("pending"),
    participationStatus: classParticipantStatusEnum("participation_status").notNull().default("registered"),
    isHost: boolean("is_host").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
}, (table) => ({
    // Уникальное ограничение: участник может быть в брони только один раз
    uniqueBookingUser: unique().on(table.bookingId, table.userId),
}));
