/**
 * Схема таблицы class_schedule для Drizzle ORM
 * Соответствует модели ClassSchedule из MAIN_MODEL.mdc
 */
import { pgTable, uuid, timestamp, integer, } from "drizzle-orm/pg-core";
import { classScheduleStatusEnum } from "./enums";
import { classDefinitions } from "./classDefinition";
import { venues } from "./venue";
import { users } from "./user";
import { courts } from "./court";
import { bookings } from "./booking";
export const classSchedules = pgTable("class_schedule", {
    id: uuid("id").defaultRandom().primaryKey(),
    classDefinitionId: uuid("class_definition_id")
        .notNull()
        .references(() => classDefinitions.id, { onDelete: "restrict" }),
    venueId: uuid("venue_id")
        .notNull()
        .references(() => venues.id, { onDelete: "restrict" }),
    instructorId: uuid("instructor_id")
        .notNull()
        .references(() => users.id, { onDelete: "restrict" }),
    startTime: timestamp("start_time", { withTimezone: true }).notNull(),
    endTime: timestamp("end_time", { withTimezone: true }).notNull(),
    courtId: uuid("court_id")
        .notNull()
        .references(() => courts.id, { onDelete: "restrict" }),
    maxParticipants: integer("max_participants").notNull(),
    currentParticipants: integer("current_participants").notNull().default(0),
    status: classScheduleStatusEnum("status").notNull(),
    relatedBookingId: uuid("related_booking_id")
        .references(() => bookings.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
});
