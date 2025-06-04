/**
 * Валидаторы для API AI Suggestion Logs
 * Содержит Zod схемы для валидации запросов
 */

import { z } from "zod";

// Базовые схемы
export const aiSuggestionTypeSchema = z.enum([
  "game_matching",
  "court_fill_optimization",
  "demand_prediction",
  "rating_update",
]);

export const aiSuggestionStatusSchema = z.enum([
  "accepted",
  "rejected",
  "pending",
]);

// Схема для создания AI suggestion log
export const createAISuggestionLogSchema = z.object({
  suggestionType: aiSuggestionTypeSchema,
  userId: z.string().uuid().optional(),
  inputData: z.record(z.any()),
  suggestionData: z.record(z.any()),
  confidenceScore: z.number().min(0).max(1),
  executionTimeMs: z.number().positive(),
  modelVersion: z.string().min(1).max(50),
  contextData: z.record(z.any()).optional(),
});

// Схема для обновления AI suggestion log
export const updateAISuggestionLogSchema = z.object({
  status: aiSuggestionStatusSchema.optional(),
  feedback: z.string().optional(),
  contextData: z.record(z.any()).optional(),
});

// Схема для поиска AI suggestion logs
export const searchAISuggestionLogsSchema = z.object({
  suggestionType: aiSuggestionTypeSchema.optional(),
  status: aiSuggestionStatusSchema.optional(),
  userId: z.string().uuid().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

// Схема для получения статистики
export const getAISuggestionStatsSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  groupBy: z.enum(["type", "status", "date"]).optional(),
});

// Схема для очистки старых логов
export const cleanupAISuggestionLogsSchema = z.object({
  olderThanDays: z.number().min(1).max(365),
  dryRun: z.boolean().default(true),
});

// Схема для обработки обратной связи
export const processFeedbackSchema = z.object({
  feedback: z.string().min(1),
  rating: z.number().min(1).max(5).optional(),
});

// Схема для получения недавних логов
export const getRecentLogsSchema = z.object({
  limit: z.number().min(1).max(50).default(10),
  suggestionType: aiSuggestionTypeSchema.optional(),
});

// Типы для экспорта
export type CreateAISuggestionLogRequest = z.infer<
  typeof createAISuggestionLogSchema
>;
export type UpdateAISuggestionLogRequest = z.infer<
  typeof updateAISuggestionLogSchema
>;
export type SearchAISuggestionLogsRequest = z.infer<
  typeof searchAISuggestionLogsSchema
>;
export type GetAISuggestionStatsRequest = z.infer<
  typeof getAISuggestionStatsSchema
>;
export type CleanupAISuggestionLogsRequest = z.infer<
  typeof cleanupAISuggestionLogsSchema
>;
export type ProcessFeedbackRequest = z.infer<typeof processFeedbackSchema>;
export type GetRecentLogsRequest = z.infer<typeof getRecentLogsSchema>;
