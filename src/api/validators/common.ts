/**
 * Общие схемы валидации для API
 */

import { z } from 'zod';

// Базовые типы данных
export const commonSchemas = {
  // UUID валидация
  uuid: z.string().uuid('Должен быть валидным UUID'),

  // Email валидация
  email: z.string()
    .email('Неверный формат email')
    .max(255, 'Email не должен превышать 255 символов'),

  // Телефон валидация
  phone: z.string()
    .regex(/^\+?[1-9]\d{1,14}$/, 'Неверный формат телефона')
    .optional(),

  // URL валидация
  url: z.string()
    .url('Неверный формат URL')
    .max(2048, 'URL не должен превышать 2048 символов')
    .optional(),

  // Пароль валидация
  password: z.string()
    .min(8, 'Пароль должен содержать минимум 8 символов')
    .max(128, 'Пароль не должен превышать 128 символов')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Пароль должен содержать строчные, заглавные буквы и цифры'
    ),

  // Имя пользователя
  username: z.string()
    .min(3, 'Имя пользователя должно содержать минимум 3 символа')
    .max(30, 'Имя пользователя не должно превышать 30 символов')
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      'Имя пользователя может содержать только буквы, цифры, дефисы и подчеркивания'
    ),

  // Имена (имя, фамилия)
  name: z.string()
    .min(2, 'Имя должно содержать минимум 2 символа')
    .max(50, 'Имя не должно превышать 50 символов')
    .regex(
      /^[a-zA-Zа-яА-Я\s-']+$/,
      'Имя может содержать только буквы, пробелы, дефисы и апострофы'
    ),

  // Денежные суммы
  money: z.number()
    .positive('Сумма должна быть положительной')
    .multipleOf(0.01, 'Сумма должна быть с точностью до копеек')
    .max(999999.99, 'Сумма не должна превышать 999,999.99'),

  // Валюта (ISO 4217)
  currency: z.string()
    .length(3, 'Код валюты должен содержать 3 символа')
    .regex(/^[A-Z]{3}$/, 'Код валюты должен содержать только заглавные буквы')
    .default('USD'),

  // Координаты
  latitude: z.number()
    .min(-90, 'Широта должна быть от -90 до 90')
    .max(90, 'Широта должна быть от -90 до 90'),

  longitude: z.number()
    .min(-180, 'Долгота должна быть от -180 до 180')
    .max(180, 'Долгота должна быть от -180 до 180'),

  // Даты
  dateString: z.string()
    .datetime('Неверный формат даты (ISO 8601)'),

  dateOnly: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Неверный формат даты (YYYY-MM-DD)'),

  timeOnly: z.string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Неверный формат времени (HH:MM)'),

  // Описания и тексты
  shortText: z.string()
    .max(255, 'Текст не должен превышать 255 символов')
    .optional(),

  mediumText: z.string()
    .max(1000, 'Текст не должен превышать 1000 символов')
    .optional(),

  longText: z.string()
    .max(5000, 'Текст не должен превышать 5000 символов')
    .optional(),

  // Массивы строк
  stringArray: z.array(z.string())
    .max(100, 'Массив не должен содержать более 100 элементов')
    .optional(),

  // Массивы UUID
  uuidArray: z.array(z.string().uuid())
    .max(100, 'Массив не должен содержать более 100 элементов')
    .optional(),
};

// Схемы для пагинации
export const paginationSchemas = {
  // Базовая пагинация
  basic: z.object({
    page: z.string()
      .optional()
      .transform(val => val ? parseInt(val, 10) : 1)
      .refine(val => val > 0, 'Страница должна быть больше 0'),

    limit: z.string()
      .optional()
      .transform(val => val ? parseInt(val, 10) : 10)
      .refine(val => val > 0 && val <= 100, 'Лимит должен быть от 1 до 100'),
  }),

  // Пагинация с offset
  offset: z.object({
    offset: z.string()
      .optional()
      .transform(val => val ? parseInt(val, 10) : 0)
      .refine(val => val >= 0, 'Offset должен быть больше или равен 0'),

    limit: z.string()
      .optional()
      .transform(val => val ? parseInt(val, 10) : 10)
      .refine(val => val > 0 && val <= 100, 'Лимит должен быть от 1 до 100'),
  }),

  // Курсорная пагинация
  cursor: z.object({
    cursor: z.string().optional(),
    limit: z.string()
      .optional()
      .transform(val => val ? parseInt(val, 10) : 10)
      .refine(val => val > 0 && val <= 100, 'Лимит должен быть от 1 до 100'),
  }),
};

// Схемы для сортировки
export const sortingSchemas = {
  // Базовая сортировка
  basic: z.object({
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
  }),

  // Сортировка с ограниченными полями
  withFields: (allowedFields: string[]) => z.object({
    sortBy: z.enum(allowedFields as [string, ...string[]]).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
  }),

  // Множественная сортировка
  multiple: z.object({
    sort: z.array(z.object({
      field: z.string(),
      order: z.enum(['asc', 'desc']).default('asc'),
    })).max(5, 'Можно сортировать максимум по 5 полям').optional(),
  }),
};

// Схемы для поиска
export const searchSchemas = {
  // Базовый поиск
  basic: z.object({
    search: z.string()
      .min(1, 'Поисковый запрос не может быть пустым')
      .max(255, 'Поисковый запрос не должен превышать 255 символов')
      .optional(),
  }),

  // Поиск с полями
  withFields: z.object({
    search: z.string()
      .min(1, 'Поисковый запрос не может быть пустым')
      .max(255, 'Поисковый запрос не должен превышать 255 символов')
      .optional(),
    searchFields: z.array(z.string())
      .max(10, 'Можно искать максимум по 10 полям')
      .optional(),
  }),

  // Расширенный поиск
  advanced: z.object({
    search: z.string()
      .min(1, 'Поисковый запрос не может быть пустым')
      .max(255, 'Поисковый запрос не должен превышать 255 символов')
      .optional(),
    searchFields: z.array(z.string())
      .max(10, 'Можно искать максимум по 10 полям')
      .optional(),
    searchType: z.enum(['contains', 'startsWith', 'endsWith', 'exact'])
      .default('contains'),
    caseSensitive: z.boolean().default(false),
  }),
};

// Схемы для фильтрации
export const filterSchemas = {
  // Фильтрация по датам
  dateRange: z.object({
    startDate: commonSchemas.dateString.optional(),
    endDate: commonSchemas.dateString.optional(),
  }).refine(
    data => !data.startDate || !data.endDate || new Date(data.startDate) <= new Date(data.endDate),
    'Дата начала должна быть меньше даты окончания'
  ),

  // Фильтрация по числовому диапазону
  numberRange: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
  }).refine(
    data => !data.min || !data.max || data.min <= data.max,
    'Минимальное значение должно быть меньше максимального'
  ),

  // Фильтрация по статусу
  status: (allowedStatuses: string[]) => z.object({
    status: z.enum(allowedStatuses as [string, ...string[]]).optional(),
  }),

  // Фильтрация по множественным значениям
  multiValue: z.object({
    values: z.array(z.string())
      .max(50, 'Можно фильтровать максимум по 50 значениям')
      .optional(),
  }),
};

// Схемы для параметров URL
export const paramSchemas = {
  // ID параметр
  id: z.object({
    id: commonSchemas.uuid,
  }),

  // Slug параметр
  slug: z.object({
    slug: z.string()
      .min(1, 'Slug не может быть пустым')
      .max(100, 'Slug не должен превышать 100 символов')
      .regex(/^[a-z0-9-]+$/, 'Slug может содержать только строчные буквы, цифры и дефисы'),
  }),

  // Множественные ID
  ids: z.object({
    ids: z.string()
      .transform(val => val.split(','))
      .pipe(z.array(commonSchemas.uuid))
      .refine(arr => arr.length <= 100, 'Можно передать максимум 100 ID'),
  }),
};

// Комбинированные схемы
export const combinedSchemas = {
  // Полная схема для списков
  list: z.object({
    ...paginationSchemas.basic.shape,
    ...sortingSchemas.basic.shape,
    ...searchSchemas.basic.shape,
  }),

  // Расширенная схема для списков
  listAdvanced: z.object({
    ...paginationSchemas.basic.shape,
    ...sortingSchemas.basic.shape,
    ...searchSchemas.advanced.shape,
    startDate: commonSchemas.dateString.optional(),
    endDate: commonSchemas.dateString.optional(),
  }),

  // Схема для экспорта данных
  export: z.object({
    format: z.enum(['csv', 'xlsx', 'json']).default('csv'),
    fields: z.array(z.string()).optional(),
    startDate: commonSchemas.dateString.optional(),
    endDate: commonSchemas.dateString.optional(),
  }),
};

// Утилиты для создания схем
export const schemaUtils = {
  // Сделать все поля опциональными
  makeOptional: <T extends z.ZodRawShape>(schema: z.ZodObject<T>) =>
    schema.partial(),

  // Добавить пагинацию к схеме
  withPagination: <T extends z.ZodRawShape>(schema: z.ZodObject<T>) =>
    schema.merge(paginationSchemas.basic),

  // Добавить сортировку к схеме
  withSorting: <T extends z.ZodRawShape>(schema: z.ZodObject<T>, allowedFields?: string[]) =>
    schema.merge(allowedFields ? sortingSchemas.withFields(allowedFields) : sortingSchemas.basic),

  // Добавить поиск к схеме
  withSearch: <T extends z.ZodRawShape>(schema: z.ZodObject<T>) =>
    schema.merge(searchSchemas.basic),

  // Создать схему для обновления (все поля опциональные кроме ID)
  createUpdateSchema: <T extends z.ZodRawShape>(schema: z.ZodObject<T>) =>
    schema.partial(),

  // Создать схему для создания (убрать ID и timestamps)
  createCreateSchema: <T extends z.ZodRawShape>(
    schema: z.ZodObject<T>,
    excludeFields: (keyof T)[] = ['id', 'createdAt', 'updatedAt']
  ) => schema.omit(Object.fromEntries(excludeFields.map(field => [field, true])) as any),
};

// Экспорт всех схем
export const CommonValidators = {
  schemas: commonSchemas,
  pagination: paginationSchemas,
  sorting: sortingSchemas,
  search: searchSchemas,
  filter: filterSchemas,
  params: paramSchemas,
  combined: combinedSchemas,
  utils: schemaUtils,
};
