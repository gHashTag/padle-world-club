/**
 * Валидаторы для площадок (Venue)
 */

import { z } from 'zod';
import { commonSchemas, paginationSchemas, sortingSchemas, searchSchemas } from './common';

// Базовая схема площадки (полная)
export const venueSchema = z.object({
  id: commonSchemas.uuid,
  name: z.string()
    .min(1, 'Название площадки обязательно')
    .max(255, 'Название площадки не должно превышать 255 символов')
    .trim(),
  address: z.string()
    .min(1, 'Адрес обязателен')
    .max(1000, 'Адрес не должен превышать 1000 символов')
    .trim(),
  city: z.string()
    .min(1, 'Город обязателен')
    .max(100, 'Название города не должно превышать 100 символов')
    .trim(),
  country: z.string()
    .min(1, 'Страна обязательна')
    .max(100, 'Название страны не должно превышать 100 символов')
    .trim(),
  phoneNumber: z.string()
    .regex(/^\+?[1-9]\d{6,14}$/, 'Неверный формат телефона (минимум 7 цифр)')
    .max(50, 'Телефон не должен превышать 50 символов')
    .optional()
    .nullable(),
  email: commonSchemas.email.optional().nullable(),
  isActive: z.boolean().default(true),
  gCalResourceId: z.string()
    .max(255, 'Google Calendar Resource ID не должен превышать 255 символов')
    .optional()
    .nullable(),
  createdAt: commonSchemas.dateString,
  updatedAt: commonSchemas.dateString,
});

// Схема для создания площадки
export const createVenueSchema = venueSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Схема для обновления площадки
export const updateVenueSchema = venueSchema.omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).partial();

// Схема для запросов списка площадок (query parameters)
export const venueQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  city: z.string().max(100).optional(),
  status: z.string().optional(),
  sortBy: z.enum(['name', 'city', 'createdAt', 'updatedAt']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

// Схема для поиска площадок по геолокации (query parameters)
export const venueLocationSearchSchema = z.object({
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().min(0.1).max(100).default(10),
});

// Схема для обновления статуса площадки
export const venueStatusUpdateSchema = z.object({
  status: z.enum(['active', 'inactive', 'maintenance']),
  reason: z.string().max(500).optional(),
});

// Схема для поиска площадок
export const searchVenuesSchema = z.object({
  ...paginationSchemas.basic.shape,
  ...sortingSchemas.withFields([
    'name', 'city', 'country', 'isActive', 'createdAt', 'updatedAt'
  ]).shape,
  ...searchSchemas.basic.shape,

  // Фильтры
  city: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  isActive: z.boolean().optional(),

  // Диапазон дат
  createdAfter: commonSchemas.dateString.optional(),
  createdBefore: commonSchemas.dateString.optional(),
}).refine(
  data => !data.createdAfter || !data.createdBefore ||
    new Date(data.createdAfter) <= new Date(data.createdBefore),
  {
    message: 'Дата начала должна быть меньше даты окончания',
    path: ['createdBefore'],
  }
);

// Схема для получения статистики площадки
export const venueStatsSchema = z.object({
  period: z.enum(['day', 'week', 'month', 'year']).default('month'),
  startDate: commonSchemas.dateString.optional(),
  endDate: commonSchemas.dateString.optional(),
  includeBookings: z.boolean().default(true),
  includeCourts: z.boolean().default(true),
  includeRevenue: z.boolean().default(false),
});

// Схема для активации/деактивации площадки
export const toggleVenueStatusSchema = z.object({
  isActive: z.boolean(),
  reason: z.string()
    .max(500, 'Причина не должна превышать 500 символов')
    .optional(),
});

// Схема для поиска площадок по геолокации
export const searchVenuesByLocationSchema = z.object({
  latitude: commonSchemas.latitude,
  longitude: commonSchemas.longitude,
  radius: z.number()
    .min(0.1, 'Радиус должен быть больше 0.1 км')
    .max(100, 'Радиус не должен превышать 100 км')
    .default(10),
  unit: z.enum(['km', 'miles']).default('km'),
  ...paginationSchemas.basic.shape,
});

// Схема для экспорта данных площадок
export const exportVenuesSchema = z.object({
  format: z.enum(['csv', 'xlsx', 'json']).default('csv'),
  fields: z.array(z.enum([
    'id', 'name', 'address', 'city', 'country', 'phoneNumber',
    'email', 'isActive', 'createdAt', 'updatedAt'
  ])).optional(),
  filters: z.object({
    search: z.string().optional(),
    city: z.string().max(100).optional(),
    country: z.string().max(100).optional(),
    isActive: z.boolean().optional(),
    createdAfter: commonSchemas.dateString.optional(),
    createdBefore: commonSchemas.dateString.optional(),
  }).optional(),
});

// Схема для массового обновления площадок
export const bulkUpdateVenuesSchema = z.object({
  venueIds: z.array(commonSchemas.uuid)
    .min(1, 'Необходимо выбрать хотя бы одну площадку')
    .max(100, 'Можно обновить максимум 100 площадок за раз'),
  updates: updateVenueSchema.omit({
    name: true, // Название нельзя менять массово
  }),
});

// ===== ПАРАМЕТРЫ URL =====

// Параметры для площадки
export const venueParamsSchema = z.object({
  venueId: commonSchemas.uuid,
});

// Параметры для поиска по slug
export const venueSlugParamsSchema = z.object({
  slug: z.string()
    .min(1, 'Slug не может быть пустым')
    .max(100, 'Slug не должен превышать 100 символов')
    .regex(/^[a-z0-9-]+$/, 'Slug может содержать только строчные буквы, цифры и дефисы'),
});

// ===== ЭКСПОРТ ВСЕХ ВАЛИДАТОРОВ =====

export const VenueValidators = {
  // Основные схемы площадки
  venue: venueSchema,
  createVenue: createVenueSchema,
  updateVenue: updateVenueSchema,
  searchVenues: searchVenuesSchema,
  venueStats: venueStatsSchema,

  // Дополнительные операции
  toggleVenueStatus: toggleVenueStatusSchema,
  searchVenuesByLocation: searchVenuesByLocationSchema,
  exportVenues: exportVenuesSchema,
  bulkUpdateVenues: bulkUpdateVenuesSchema,

  // Параметры URL
  venueParams: venueParamsSchema,
  venueSlugParams: venueSlugParamsSchema,
};
