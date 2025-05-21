import { z } from "zod";

/**
 * Схема для пользователя.
 * Соответствует usersTable из src/db/schema.ts (в будущем, если будет DB)
 */
export const UserSchema = z.object({
  id: z.string().uuid(),
  authId: z.string().nullable().optional(),
  email: z.string().email().nullable().optional(),
  name: z.string().nullable().optional(),
  avatarUrl: z.string().url().nullable().optional(),
  telegram_id: z.number().int(),
  username: z.string().optional().nullable(),
  first_name: z.string().optional().nullable(),
  last_name: z.string().optional().nullable(),
  language_code: z.string().optional().nullable(),
  is_bot: z.boolean().optional(),
  subscription_level: z.string().default("free"),
  subscription_expires_at: z.date().nullable().optional(),
  last_active_at: z
    .date()
    .optional()
    .default(() => new Date()),
  created_at: z
    .string()
    .datetime()
    .optional()
    .default(() => new Date().toISOString()),
  updated_at: z
    .string()
    .datetime()
    .optional()
    .default(() => new Date().toISOString()),
});

/**
 * Тип пользователя, выведенный из схемы Zod
 */
export type User = z.infer<typeof UserSchema>;

/**
 * Схема для проекта
 */
export const ProjectSchema = z.object({
  id: z.string().uuid(),
  user_id: z.string().uuid(), // Связь с User.id
  name: z.string().min(1),
  description: z.string().nullable().optional(),
  created_at: z
    .string()
    .datetime()
    .default(() => new Date().toISOString()),
  updated_at: z
    .string()
    .datetime()
    .default(() => new Date().toISOString()),
  is_active: z.boolean().optional().default(true),
});

/**
 * Тип проекта, выведенный из схемы Zod
 */
export type Project = z.infer<typeof ProjectSchema>;

/**
 * Схема для хештега
 */
export const HashtagSchema = z.object({
  id: z.number(),
  project_id: z.number(),
  hashtag: z.string(),
  created_at: z.string(),
  is_active: z.boolean().default(true),
});

/**
 * Тип хештега, выведенный из схемы Zod
 */
export type Hashtag = z.infer<typeof HashtagSchema>;

/**
 * Схема для контента Reel
 */
export const ReelContentSchema = z.object({
  id: z.number().optional(),
  project_id: z.number(),
  source_type: z.enum(["competitor", "hashtag"]),
  source_id: z.string(),
  instagram_id: z.string(),
  url: z.string(),
  caption: z.string().nullable().optional(),
  author_username: z.string().nullable().optional(),
  author_id: z.string().nullable().optional(),
  views: z.number().optional(),
  likes: z.number().optional(),
  comments_count: z.number().optional(),
  duration: z.number().nullable().optional(),
  thumbnail_url: z.string().nullable().optional(),
  music_title: z.string().nullable().optional(),
  published_at: z.string(),
  fetched_at: z.string().optional(),
  is_processed: z.boolean().optional(),
  processing_status: z.string().nullable().optional(),
  processing_result: z.string().nullable().optional(),

  // Маркетинговые данные
  engagement_rate_video: z.number().nullable().optional(), // Коэффициент вовлеченности для видео
  engagement_rate_all: z.number().nullable().optional(), // Коэффициент вовлеченности для всех типов контента
  view_to_like_ratio: z.number().nullable().optional(), // Отношение просмотров к лайкам
  comments_to_likes_ratio: z.number().nullable().optional(), // Отношение комментариев к лайкам
  recency: z.number().nullable().optional(), // Свежесть поста
  marketing_score: z.number().nullable().optional(), // Общий балл поста
  days_since_published: z.number().nullable().optional(), // Количество дней с момента публикации

  // Данные расшифровки видео
  transcript: z.string().nullable().optional(), // Текстовая расшифровка видео
  transcript_status: z
    .enum(["pending", "processing", "completed", "failed"])
    .nullable()
    .optional(), // Статус расшифровки
  transcript_updated_at: z.string().nullable().optional(), // Дата и время последнего обновления расшифровки
});

/**
 * Тип контента Reel, выведенный из схемы Zod
 */
export type ReelContent = z.infer<typeof ReelContentSchema>;

/**
 * Схема для фильтра Reels
 * Соответствует интерфейсу ReelsFilter из types.ts
 */
export const ReelsFilterSchema = z.object({
  projectId: z.number().optional(),
  sourceType: z.enum(["competitor", "hashtag"]).optional(),
  sourceId: z.union([z.string(), z.number()]).optional(),
  minViews: z.number().optional(),
  maxAgeDays: z.number().optional(), // Максимальный возраст публикации в днях
  afterDate: z.string().optional(), // ISO Timestamp, reels опубликованные после этой даты
  beforeDate: z.string().optional(), // ISO Timestamp, reels опубликованные до этой даты
  limit: z.number().optional(),
  offset: z.number().optional(),
  orderBy: z.string().optional(), // Поле для сортировки (например, 'published_at', 'views')
  orderDirection: z.enum(["ASC", "DESC"]).optional(),
  is_processed: z.boolean().optional(), // Для фильтрации по статусу обработки
});

/**
 * Тип фильтра Reels, выведенный из схемы Zod
 */
export type ReelsFilter = z.infer<typeof ReelsFilterSchema>;

/**
 * Схема для лога запуска парсинга
 * Соответствует интерфейсу ParsingRunLog из types.ts
 */
export const ParsingRunLogSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(), // Может быть UUID или автоинкремент
  run_id: z.string(), // Уникальный ID конкретного запуска парсинга (например, UUID)
  project_id: z.number(),
  source_type: z.enum(["competitor", "hashtag"]),
  source_id: z.union([z.string(), z.number()]), // ID конкурента или хэштега
  status: z.enum(["running", "completed", "failed", "partial_success"]),
  error_message: z.string().nullable().optional(),
  started_at: z.string(), // ISO Timestamp
  ended_at: z.string().nullable().optional(), // ISO Timestamp
  reels_found_count: z.number().optional(),
  reels_added_count: z.number().optional(),
  errors_count: z.number().optional(),
});

/**
 * Тип лога запуска парсинга, выведенный из схемы Zod
 */
export type ParsingRunLog = z.infer<typeof ParsingRunLogSchema>;

/**
 * Схема для данных сессии сцены (базовая)
 */
export const BotSceneSessionDataSchema = z.object({
  step: z.string().optional(), // Общий строковый шаг, конкретные шаги будут определяться в каждой сцене
  cursor: z.number().optional(), // Оставляем cursor как общий элемент
  messageIdToEdit: z.number().optional(),
  user: z.lazy(() => UserSchema.optional()), // Пользователь в сессии
  // Сюда можно добавлять другие общие поля сессии, если они понадобятся для стартер-кита
});

/**
 * Тип данных сессии сцены, выведенный из схемы Zod
 */
export type BotSceneSessionData = z.infer<typeof BotSceneSessionDataSchema>;

/**
 * Схема для настроек уведомлений пользователя.
 * Эта схема должна быть максимально простой для стартер-кита.
 */
export const NotificationSettingsSchema = z.object({
  userId: z.string().uuid(), // Связь с User.id
  enabled: z.boolean().default(true),
  daily_summary: z.boolean().default(false),
  new_content_alerts: z.boolean().default(true),
  language: z.string().default("en"), // язык уведомлений
});

/**
 * Тип настроек уведомлений, выведенный из схемы Zod
 */
export type NotificationSettings = z.infer<typeof NotificationSettingsSchema>;

/**
 * Схема для коллекции Reels
 */
export const ReelsCollectionSchema = z.object({
  id: z.number().optional(),
  project_id: z.number(),
  name: z.string(),
  description: z.string().nullable().optional(),
  filter: z.lazy(() => ReelsFilterSchema.optional()),
  reels_ids: z.array(z.string()).optional(),
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  is_processed: z.boolean().default(false),
  processing_status: z.string().nullable().optional(),
  processing_result: z.string().nullable().optional(),
  content_format: z.enum(["text", "csv", "json"]).optional(),
  content_data: z.string().nullable().optional(),
});

/**
 * Тип коллекции Reels, выведенный из схемы Zod
 */
export type ReelsCollection = z.infer<typeof ReelsCollectionSchema>;

// Можно также экспортировать другие типы или схемы отсюда
// export * from './other-schema';
