/**
 * Схема таблицы booking для Drizzle ORM
 * Соответствует модели Booking из MAIN_MODEL.mdc
 */
import { pgTable, uuid, timestamp, integer, numeric, varchar, text, } from "drizzle-orm/pg-core";
import { bookingStatusEnum, bookingPurposeEnum } from "./enums";
import { courts } from "./court";
import { users } from "./user";
export const bookings = pgTable("booking", {
    id: uuid("id").defaultRandom().primaryKey(),
    courtId: uuid("court_id")
        .notNull()
        .references(() => courts.id, { onDelete: "restrict" }),
    startTime: timestamp("start_time", { withTimezone: true }).notNull(),
    endTime: timestamp("end_time", { withTimezone: true }).notNull(),
    durationMinutes: integer("duration_minutes").notNull(),
    status: bookingStatusEnum("status").notNull(),
    totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull(),
    bookedByUserId: uuid("booked_by_user_id")
        .notNull()
        .references(() => users.id, { onDelete: "restrict" }),
    bookingPurpose: bookingPurposeEnum("booking_purpose").notNull(),
    // Полиморфная ссылка на ClassSchedule, GameSession, TournamentMatch
    relatedEntityId: uuid("related_entity_id"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
});
