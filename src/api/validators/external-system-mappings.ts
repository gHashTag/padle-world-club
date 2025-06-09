import { z } from "zod";

// Enum валидаторы
export const externalSystemSchema = z.enum([
  "exporta",
  "google_calendar",
  "whatsapp_api",
  "telegram_api",
  "payment_gateway_api",
  "other",
]);

export const externalEntityMappingTypeSchema = z.enum([
  "user",
  "booking",
  "court",
  "class",
  "venue",
  "class_schedule",
  "product",
  "training_package_definition",
]);

// Базовые схемы
export const createExternalSystemMappingSchema = z.object({
  externalSystem: externalSystemSchema,
  externalId: z.string().min(1).max(255),
  internalEntityType: externalEntityMappingTypeSchema,
  internalEntityId: z.string().uuid(),
  isActive: z.boolean().optional().default(true),
  syncData: z.string().optional(),
  hasConflict: z.boolean().optional().default(false),
  conflictData: z.string().optional(),
  lastError: z.string().optional(),
});

export const updateExternalSystemMappingSchema = z.object({
  externalSystem: externalSystemSchema.optional(),
  externalId: z.string().min(1).max(255).optional(),
  internalEntityType: externalEntityMappingTypeSchema.optional(),
  internalEntityId: z.string().uuid().optional(),
  isActive: z.boolean().optional(),
  syncData: z.string().optional(),
  hasConflict: z.boolean().optional(),
  conflictData: z.string().optional(),
  lastError: z.string().optional(),
});

// Схемы для специальных операций
export const updateSyncStatusSchema = z.object({
  syncData: z.string().optional(),
  hasConflict: z.boolean().optional().default(false),
  conflictData: z.string().optional(),
  lastError: z.string().optional(),
});

export const bulkUpdateSyncStatusSchema = z.object({
  ids: z.array(z.string().uuid()).min(1),
  syncData: z.string().optional(),
  hasConflict: z.boolean().optional().default(false),
});

// Query параметры
export const findByExternalIdQuerySchema = z.object({
  externalSystem: externalSystemSchema,
  externalId: z.string().min(1),
});

export const findByInternalEntityQuerySchema = z.object({
  entityType: externalEntityMappingTypeSchema,
  entityId: z.string().uuid(),
});

export const findBySystemQuerySchema = z.object({
  externalSystem: externalSystemSchema,
});

export const findOutdatedQuerySchema = z.object({
  daysOld: z.coerce.number().int().min(1).max(365).optional().default(7),
});

export const cleanupOldInactiveQuerySchema = z.object({
  daysOld: z.coerce.number().int().min(1).max(365).optional().default(30),
});

// Пагинация
export const paginationQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional().default(50),
  offset: z.coerce.number().int().min(0).optional().default(0),
});

// Параметры маршрутов
export const mappingIdParamSchema = z.object({
  id: z.string().uuid(),
});

// Типы для TypeScript
export type CreateExternalSystemMappingInput = z.infer<
  typeof createExternalSystemMappingSchema
>;
export type UpdateExternalSystemMappingInput = z.infer<
  typeof updateExternalSystemMappingSchema
>;
export type UpdateSyncStatusInput = z.infer<typeof updateSyncStatusSchema>;
export type BulkUpdateSyncStatusInput = z.infer<
  typeof bulkUpdateSyncStatusSchema
>;
export type FindByExternalIdQuery = z.infer<typeof findByExternalIdQuerySchema>;
export type FindByInternalEntityQuery = z.infer<
  typeof findByInternalEntityQuerySchema
>;
export type FindBySystemQuery = z.infer<typeof findBySystemQuerySchema>;
export type FindOutdatedQuery = z.infer<typeof findOutdatedQuerySchema>;
export type CleanupOldInactiveQuery = z.infer<
  typeof cleanupOldInactiveQuerySchema
>;
export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
export type MappingIdParam = z.infer<typeof mappingIdParamSchema>;
