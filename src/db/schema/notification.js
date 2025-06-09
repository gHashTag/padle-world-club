/**
 * Схема для модели Notification (Уведомления)
 * Содержит определение таблицы notification и связанных типов
 */
import { pgTable, uuid, text, boolean, timestamp, varchar, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./user";
import { notificationChannelEnum } from "./enums";
// Enum для типов уведомлений
export const notificationTypeEnum = pgEnum("notification_type", [
    "booking_reminder",
    "game_invite",
    "tournament_update",
    "payment_confirmation",
    "package_expiration",
    "custom_message",
    "stock_alert"
]);
// Таблица уведомлений
export const notifications = pgTable("notification", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
        .references(() => users.id, { onDelete: "cascade" }),
    type: notificationTypeEnum("type").notNull(),
    message: text("message").notNull(),
    channel: notificationChannelEnum("channel").notNull(),
    isSent: boolean("is_sent").default(false).notNull(),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    isRead: boolean("is_read").default(false).notNull(),
    readAt: timestamp("read_at", { withTimezone: true }),
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
// Константы для типов уведомлений
export const NOTIFICATION_TYPES = {
    BOOKING_REMINDER: "booking_reminder",
    GAME_INVITE: "game_invite",
    TOURNAMENT_UPDATE: "tournament_update",
    PAYMENT_CONFIRMATION: "payment_confirmation",
    PACKAGE_EXPIRATION: "package_expiration",
    CUSTOM_MESSAGE: "custom_message",
    STOCK_ALERT: "stock_alert",
};
// Константы для каналов уведомлений
export const NOTIFICATION_CHANNELS = {
    WHATSAPP: "whatsapp",
    TELEGRAM: "telegram",
    EMAIL: "email",
    APP_PUSH: "app_push",
};
// Константы для типов связанных сущностей
export const NOTIFICATION_RELATED_ENTITY_TYPES = {
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
    TRAINING_PACKAGE: "training_package",
    TASK: "task",
};
