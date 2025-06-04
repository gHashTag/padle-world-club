/**
 * Валидаторы для Courts API
 * Схемы валидации для кортов с использованием Zod
 */

import { z } from 'zod';
import { commonSchemas } from './common';

// Enum'ы для кортов (используем существующие из схемы)
const courtEnums = {
  courtType: z.enum(['paddle', 'tennis']), // Соответствует courtTypeEnum из схемы
};

// Базовая схема корта (соответствует реальной схеме БД)
const baseCourtSchema = z.object({
  name: z.string().min(1, 'Название корта обязательно').max(255, 'Название не должно превышать 255 символов'),
  venueId: commonSchemas.uuid,
  courtType: courtEnums.courtType,
  hourlyRate: z.number().min(0, 'Почасовая ставка не может быть отрицательной'),
  description: z.string().max(1000, 'Описание не должно превышать 1000 символов').optional(),
  isActive: z.boolean().default(true),
});

// Схема для создания корта
export const createCourtSchema = baseCourtSchema.omit({
  // Убираем поля, которые устанавливаются автоматически
}).strict();

// Схема для обновления корта
export const updateCourtSchema = baseCourtSchema.partial().omit({
  venueId: true, // Нельзя изменить площадку после создания
}).strict();

// Схема для параметров URL
export const courtParamsSchema = z.object({
  id: commonSchemas.uuid,
});

// Схема для параметров venue
export const venueParamsSchema = z.object({
  venueId: commonSchemas.uuid,
});

// Схема для поиска кортов (соответствует реальной схеме)
export const searchCourtsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  sortBy: z.enum(['name', 'courtType', 'hourlyRate', 'createdAt', 'updatedAt']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
  search: z.string().optional(),

  // Фильтры
  venueId: commonSchemas.uuid.optional(),
  courtType: courtEnums.courtType.optional(),
  isActive: z.coerce.boolean().optional(),

  // Диапазон цен
  minHourlyRate: z.coerce.number().min(0).optional(),
  maxHourlyRate: z.coerce.number().min(0).optional(),

  // Диапазон дат создания
  createdAfter: commonSchemas.dateString.optional(),
  createdBefore: commonSchemas.dateString.optional(),
}).refine(
  data => !data.minHourlyRate || !data.maxHourlyRate || data.minHourlyRate <= data.maxHourlyRate,
  {
    message: 'Минимальная ставка должна быть меньше максимальной',
    path: ['maxHourlyRate'],
  }
);

// Схема для проверки доступности корта
export const checkAvailabilitySchema = z.object({
  startTime: commonSchemas.dateString,
  endTime: commonSchemas.dateString,
  excludeBookingId: commonSchemas.uuid.optional(),
}).refine(
  data => new Date(data.startTime) < new Date(data.endTime),
  {
    message: 'Время начала должно быть раньше времени окончания',
    path: ['endTime'],
  }
).refine(
  data => new Date(data.startTime) >= new Date(),
  {
    message: 'Время начала не может быть в прошлом',
    path: ['startTime'],
  }
);

// Схема для получения кортов площадки с дополнительными фильтрами
export const venueCourtFiltersSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  sortBy: z.enum(['name', 'courtType', 'hourlyRate']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),

  // Фильтры специфичные для площадки
  courtType: courtEnums.courtType.optional(),
  isActive: z.coerce.boolean().optional(),

  // Доступность в определенное время
  availableFrom: commonSchemas.dateString.optional(),
  availableTo: commonSchemas.dateString.optional(),
}).refine(
  data => !data.availableFrom || !data.availableTo || new Date(data.availableFrom) < new Date(data.availableTo),
  {
    message: 'Время начала доступности должно быть раньше времени окончания',
    path: ['availableTo'],
  }
);

// Экспорт всех валидаторов
export const CourtValidators = {
  createCourt: createCourtSchema,
  updateCourt: updateCourtSchema,
  courtParams: courtParamsSchema,
  venueParams: venueParamsSchema,
  searchCourts: searchCourtsSchema,
  checkAvailability: checkAvailabilitySchema,
  venueCourtFilters: venueCourtFiltersSchema,
};

// Экспорт enum'ов для использования в других модулях
export { courtEnums };

// Типы для TypeScript
export type CreateCourtRequest = z.infer<typeof createCourtSchema>;
export type UpdateCourtRequest = z.infer<typeof updateCourtSchema>;
export type SearchCourtsQuery = z.infer<typeof searchCourtsSchema>;
export type CheckAvailabilityQuery = z.infer<typeof checkAvailabilitySchema>;
export type VenueCourtFiltersQuery = z.infer<typeof venueCourtFiltersSchema>;
