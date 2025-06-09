/**
 * Схема для модели Feedback (Обратная связь)
 * Содержит определение таблицы feedback и связанных типов
 */
import { pgTable, uuid, integer, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./user";
import { venues } from "./venue";
// Enum для категорий обратной связи
export const feedbackCategoryEnum = pgEnum("feedback_category", [
    "court_quality",
    "game_experience",
    "training_quality",
    "staff_service",
    "system_suggestion",
    "other"
]);
// Enum для статусов обратной связи
export const feedbackStatusEnum = pgEnum("feedback_status", [
    "new",
    "in_review",
    "resolved",
    "archived"
]);
// Таблица обратной связи
export const feedbacks = pgTable("feedback", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
        .references(() => users.id, { onDelete: "set null" }),
    venueId: uuid("venue_id")
        .references(() => venues.id, { onDelete: "set null" }),
    category: feedbackCategoryEnum("category").notNull(),
    rating: integer("rating"), // От 1 до 5
    comment: text("comment"),
    status: feedbackStatusEnum("status").default("new").notNull(),
    resolvedByUserId: uuid("resolved_by_user_id")
        .references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
});
// Константы для категорий обратной связи
export const FEEDBACK_CATEGORIES = {
    COURT_QUALITY: "court_quality",
    GAME_EXPERIENCE: "game_experience",
    TRAINING_QUALITY: "training_quality",
    STAFF_SERVICE: "staff_service",
    SYSTEM_SUGGESTION: "system_suggestion",
    OTHER: "other",
};
// Константы для статусов обратной связи
export const FEEDBACK_STATUSES = {
    NEW: "new",
    IN_REVIEW: "in_review",
    RESOLVED: "resolved",
    ARCHIVED: "archived",
};
// Константы для рейтингов
export const FEEDBACK_RATINGS = {
    VERY_BAD: 1,
    BAD: 2,
    NEUTRAL: 3,
    GOOD: 4,
    EXCELLENT: 5,
};
