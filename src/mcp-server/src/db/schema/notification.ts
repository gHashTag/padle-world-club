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

// Типы TypeScript
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;

// Дополнительные типы для удобства
export type UpdateNotification = Partial<Omit<NewNotification, "id" | "createdAt" | "updatedAt">>;

export type NotificationWithUser = Notification & {
  user?: {
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;
  } | null;
};

export type NotificationStats = {
  totalNotifications: number;
  sentNotifications: number;
  unsentNotifications: number;
  readNotifications: number;
  unreadNotifications: number;
  notificationsByType: Record<string, number>;
  notificationsByChannel: Record<string, number>;
  averageDeliveryTime: number; // в минутах
  deliverySuccessRate: number; // в процентах
};

export type NotificationGroupedByType = {
  type: string;
  notificationsCount: number;
  sentCount: number;
  readCount: number;
  deliveryRate: number; // в процентах
  readRate: number; // в процентах
};

export type NotificationGroupedByChannel = {
  channel: string;
  notificationsCount: number;
  sentCount: number;
  readCount: number;
  deliveryRate: number; // в процентах
  readRate: number; // в процентах
  averageDeliveryTime: number; // в минутах
};

export type NotificationGroupedByUser = {
  userId: string | null;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  notificationsCount: number;
  unreadCount: number;
  lastNotificationDate: Date | null;
  preferredChannel: string | null;
};

export type NotificationGroupedByDate = {
  date: string;
  sentCount: number;
  readCount: number;
  deliveryRate: number; // в процентах
  readRate: number; // в процентах
};

export type NotificationSummary = {
  notificationId: string;
  type: string;
  channel: string;
  message: string;
  recipientName: string | null;
  recipientEmail: string | null;
  isSent: boolean;
  isRead: boolean;
  sentAt: Date | null;
  readAt: Date | null;
  createdAt: Date;
  relatedEntityType: string | null;
  relatedEntityId: string | null;
};

export type UnsentNotification = {
  notificationId: string;
  type: string;
  channel: string;
  message: string;
  recipientName: string | null;
  recipientContact: string | null; // email, phone, etc.
  createdAt: Date;
  minutesSinceCreated: number;
  relatedEntityType: string | null;
};

export type NotificationDeliveryReport = {
  channel: string;
  totalSent: number;
  successfulDeliveries: number;
  failedDeliveries: number;
  deliveryRate: number; // в процентах
  averageDeliveryTime: number; // в минутах
  lastDeliveryAt: Date | null;
};

// Константы для типов уведомлений
export const NOTIFICATION_TYPES = {
  BOOKING_REMINDER: "booking_reminder" as const,
  GAME_INVITE: "game_invite" as const,
  TOURNAMENT_UPDATE: "tournament_update" as const,
  PAYMENT_CONFIRMATION: "payment_confirmation" as const,
  PACKAGE_EXPIRATION: "package_expiration" as const,
  CUSTOM_MESSAGE: "custom_message" as const,
  STOCK_ALERT: "stock_alert" as const,
} as const;

// Константы для каналов уведомлений
export const NOTIFICATION_CHANNELS = {
  WHATSAPP: "whatsapp" as const,
  TELEGRAM: "telegram" as const,
  EMAIL: "email" as const,
  APP_PUSH: "app_push" as const,
} as const;

// Константы для типов связанных сущностей
export const NOTIFICATION_RELATED_ENTITY_TYPES = {
  BOOKING: "booking" as const,
  USER: "user" as const,
  COURT: "court" as const,
  VENUE: "venue" as const,
  TOURNAMENT: "tournament" as const,
  CLASS_SCHEDULE: "class_schedule" as const,
  GAME_SESSION: "game_session" as const,
  ORDER: "order" as const,
  PAYMENT: "payment" as const,
  PRODUCT: "product" as const,
  TRAINING_PACKAGE: "training_package" as const,
  TASK: "task" as const,
} as const;

export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES];
export type NotificationChannel = typeof NOTIFICATION_CHANNELS[keyof typeof NOTIFICATION_CHANNELS];
export type NotificationRelatedEntityType = typeof NOTIFICATION_RELATED_ENTITY_TYPES[keyof typeof NOTIFICATION_RELATED_ENTITY_TYPES];
