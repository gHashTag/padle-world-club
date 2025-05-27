/**
 * Валидаторы для API уведомлений
 * Содержит схемы валидации для всех операций с уведомлениями
 */

import { z } from "zod";

// Базовые enum'ы для валидации
export const notificationTypeSchema = z.enum([
  "booking_reminder",
  "game_invite",
  "tournament_update",
  "payment_confirmation",
  "package_expiration",
  "custom_message",
  "stock_alert",
]);

export const notificationChannelSchema = z.enum([
  "whatsapp",
  "telegram",
  "email",
  "app_push",
]);

export const relatedEntityTypeSchema = z.enum([
  "booking",
  "user",
  "court",
  "venue",
  "tournament",
  "class_schedule",
  "game_session",
  "order",
  "payment",
  "product",
  "training_package",
  "task",
]);

// Схема для создания уведомления
export const createNotificationSchema = z.object({
  userId: z.string().uuid("Invalid user ID format"),
  type: notificationTypeSchema,
  message: z
    .string()
    .min(1, "Message is required")
    .max(1000, "Message too long"),
  channel: notificationChannelSchema,
  relatedEntityId: z
    .string()
    .uuid("Invalid related entity ID format")
    .optional(),
  relatedEntityType: relatedEntityTypeSchema.optional(),
});

// Схема для обновления уведомления
export const updateNotificationSchema = z.object({
  message: z
    .string()
    .min(1, "Message is required")
    .max(1000, "Message too long")
    .optional(),
  channel: notificationChannelSchema.optional(),
  isRead: z.boolean().optional(),
  isSent: z.boolean().optional(),
  relatedEntityId: z
    .string()
    .uuid("Invalid related entity ID format")
    .optional(),
  relatedEntityType: relatedEntityTypeSchema.optional(),
});

// Схема для массового создания уведомлений
export const bulkCreateNotificationSchema = z.object({
  notifications: z
    .array(createNotificationSchema)
    .min(1, "At least one notification required")
    .max(100, "Too many notifications"),
});

// Схема для массового обновления статуса
export const bulkUpdateStatusSchema = z.object({
  notificationIds: z
    .array(z.string().uuid())
    .min(1, "At least one notification ID required")
    .max(100, "Too many notification IDs"),
  isRead: z.boolean().optional(),
  isSent: z.boolean().optional(),
});

// Схема для отправки уведомления
export const sendNotificationSchema = z.object({
  notificationId: z.string().uuid("Invalid notification ID format"),
  externalMessageId: z.string().optional(), // ID сообщения во внешней системе
  deliveryStatus: z.enum(["sent", "delivered", "failed"]).optional(),
  errorMessage: z.string().optional(),
});

// Схема для массовой отправки
export const bulkSendNotificationSchema = z.object({
  notificationIds: z
    .array(z.string().uuid())
    .min(1, "At least one notification ID required")
    .max(50, "Too many notification IDs"),
  channel: notificationChannelSchema.optional(),
});

// Схема для поиска уведомлений
export const searchNotificationsSchema = z.object({
  userId: z.string().uuid("Invalid user ID format").optional(),
  type: notificationTypeSchema.optional(),
  channel: notificationChannelSchema.optional(),
  isRead: z.boolean().optional(),
  isSent: z.boolean().optional(),
  relatedEntityType: relatedEntityTypeSchema.optional(),
  relatedEntityId: z
    .string()
    .uuid("Invalid related entity ID format")
    .optional(),
  message: z.string().min(1, "Search term required").optional(),
  startDate: z.string().datetime("Invalid start date format").optional(),
  endDate: z.string().datetime("Invalid end date format").optional(),
  page: z.coerce.number().int().min(1, "Page must be at least 1").default(1),
  limit: z.coerce
    .number()
    .int()
    .min(1, "Limit must be at least 1")
    .max(100, "Limit cannot exceed 100")
    .default(20),
});

// Схема для получения статистики
export const getStatsSchema = z.object({
  userId: z.string().uuid("Invalid user ID format").optional(),
  days: z.coerce
    .number()
    .int()
    .min(1, "Days must be at least 1")
    .max(365, "Days cannot exceed 365")
    .default(30),
  groupBy: z.enum(["type", "channel", "user", "date"]).optional(),
});

// Схема для настройки уведомлений пользователя
export const userNotificationPreferencesSchema = z.object({
  userId: z.string().uuid("Invalid user ID format"),
  preferences: z.object({
    channels: z
      .array(notificationChannelSchema)
      .min(1, "At least one channel required"),
    types: z.array(notificationTypeSchema).optional(),
    quietHours: z
      .object({
        enabled: z.boolean(),
        startTime: z
          .string()
          .regex(
            /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
            "Invalid time format (HH:MM)"
          )
          .optional(),
        endTime: z
          .string()
          .regex(
            /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/,
            "Invalid time format (HH:MM)"
          )
          .optional(),
      })
      .optional(),
    frequency: z
      .enum(["immediate", "hourly", "daily", "weekly"])
      .default("immediate"),
  }),
});

// Схема для создания шаблона уведомления
export const createNotificationTemplateSchema = z.object({
  name: z
    .string()
    .min(1, "Template name is required")
    .max(100, "Template name too long"),
  type: notificationTypeSchema,
  channel: notificationChannelSchema,
  subject: z
    .string()
    .min(1, "Subject is required")
    .max(200, "Subject too long")
    .optional(),
  messageTemplate: z
    .string()
    .min(1, "Message template is required")
    .max(2000, "Message template too long"),
  variables: z.array(z.string()).optional(), // Переменные для подстановки
  isActive: z.boolean().default(true),
});

// Схема для отправки уведомления по шаблону
export const sendTemplateNotificationSchema = z.object({
  templateId: z.string().uuid("Invalid template ID format"),
  userId: z.string().uuid("Invalid user ID format"),
  variables: z.record(z.string(), z.any()).optional(), // Значения переменных
  relatedEntityId: z
    .string()
    .uuid("Invalid related entity ID format")
    .optional(),
  relatedEntityType: relatedEntityTypeSchema.optional(),
  scheduledAt: z.string().datetime("Invalid scheduled date format").optional(),
});

// Схема для webhook'ов внешних систем
export const externalWebhookSchema = z.object({
  provider: z.enum(["telegram", "whatsapp", "email", "push"]),
  event: z.enum(["delivered", "read", "failed", "bounced"]),
  externalMessageId: z.string().min(1, "External message ID required"),
  notificationId: z.string().uuid("Invalid notification ID format").optional(),
  timestamp: z.string().datetime("Invalid timestamp format"),
  metadata: z.record(z.string(), z.any()).optional(),
});

// Схема для очистки старых уведомлений
export const cleanupNotificationsSchema = z.object({
  days: z.coerce
    .number()
    .int()
    .min(1, "Days must be at least 1")
    .max(365, "Days cannot exceed 365")
    .default(30),
  onlyRead: z.boolean().default(true),
  dryRun: z.boolean().default(false),
});

// Экспорт типов для использования в handlers
export type CreateNotificationRequest = z.infer<
  typeof createNotificationSchema
>;
export type UpdateNotificationRequest = z.infer<
  typeof updateNotificationSchema
>;
export type BulkCreateNotificationRequest = z.infer<
  typeof bulkCreateNotificationSchema
>;
export type BulkUpdateStatusRequest = z.infer<typeof bulkUpdateStatusSchema>;
export type SendNotificationRequest = z.infer<typeof sendNotificationSchema>;
export type BulkSendNotificationRequest = z.infer<
  typeof bulkSendNotificationSchema
>;
export type SearchNotificationsRequest = z.infer<
  typeof searchNotificationsSchema
>;
export type GetStatsRequest = z.infer<typeof getStatsSchema>;
export type UserNotificationPreferencesRequest = z.infer<
  typeof userNotificationPreferencesSchema
>;
export type CreateNotificationTemplateRequest = z.infer<
  typeof createNotificationTemplateSchema
>;
export type SendTemplateNotificationRequest = z.infer<
  typeof sendTemplateNotificationSchema
>;
export type ExternalWebhookRequest = z.infer<typeof externalWebhookSchema>;
export type CleanupNotificationsRequest = z.infer<
  typeof cleanupNotificationsSchema
>;
