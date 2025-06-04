/**
 * Схема для модели Task (Задачи)
 * Содержит определение таблицы task и связанных типов
 */
import { pgTable, uuid, varchar, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./user";
import { venues } from "./venue";
// Enum для статусов задач
export const taskStatusEnum = pgEnum("task_status", [
    "open",
    "in_progress",
    "completed",
    "blocked"
]);
// Enum для приоритетов задач
export const taskPriorityEnum = pgEnum("task_priority", [
    "low",
    "medium",
    "high",
    "urgent"
]);
// Таблица задач
export const tasks = pgTable("task", {
    id: uuid("id").defaultRandom().primaryKey(),
    assignedToUserId: uuid("assigned_to_user_id")
        .references(() => users.id, { onDelete: "set null" }),
    createdByUserId: uuid("created_by_user_id")
        .notNull()
        .references(() => users.id, { onDelete: "restrict" }),
    venueId: uuid("venue_id")
        .references(() => venues.id, { onDelete: "set null" }),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    dueDate: timestamp("due_date", { withTimezone: true }),
    status: taskStatusEnum("status").notNull(),
    priority: taskPriorityEnum("priority").notNull(),
    // Полиморфные связи
    relatedEntityId: uuid("related_entity_id"),
    relatedEntityType: varchar("related_entity_type", { length: 50 }),
    createdAt: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
});
// Константы для статусов задач
export const TASK_STATUSES = {
    OPEN: "open",
    IN_PROGRESS: "in_progress",
    COMPLETED: "completed",
    BLOCKED: "blocked",
};
// Константы для приоритетов задач
export const TASK_PRIORITIES = {
    LOW: "low",
    MEDIUM: "medium",
    HIGH: "high",
    URGENT: "urgent",
};
// Константы для типов связанных сущностей
export const RELATED_ENTITY_TYPES = {
    BOOKING: "booking",
    USER: "user",
    COURT: "court",
    VENUE: "venue",
    TOURNAMENT: "tournament",
    CLASS_SCHEDULE: "class_schedule",
    GAME_SESSION: "game_session",
    ORDER: "order",
    PAYMENT: "payment",
    PRODUCT: "product",
};
