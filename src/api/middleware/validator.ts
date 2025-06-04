/**
 * Middleware для валидации данных с Zod в функциональном стиле
 */

import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema, ZodError } from 'zod';
import { MiddlewareFunction, ValidationResult } from '../types';
import { ValidationError } from './error-handler';
import { logger } from './logger';

// Типы для валидации
export interface ValidationSchemas {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
  headers?: ZodSchema;
}

export interface ValidationOptions {
  stripUnknown?: boolean;
  abortEarly?: boolean;
  allowUnknown?: boolean;
}

// Функция для преобразования Zod ошибок в читаемый формат
const formatZodError = (error: ZodError): ValidationResult => {
  const errors = error.errors.map(err => ({
    field: err.path.join('.'),
    message: err.message,
    value: 'received' in err ? (err as any).received : undefined,
  }));

  return {
    isValid: false,
    errors,
  };
};

// Функция для валидации данных
const validateData = <T>(
  schema: ZodSchema<T>,
  data: any,
  _options: ValidationOptions = {}
): ValidationResult & { data?: T } => {
  try {
    const validatedData = schema.parse(data);
    return {
      isValid: true,
      errors: [],
      data: validatedData,
    };
  } catch (error) {
    if (error instanceof ZodError) {
      return formatZodError(error);
    }

    return {
      isValid: false,
      errors: [{
        field: 'unknown',
        message: 'Неизвестная ошибка валидации',
        value: undefined,
      }],
    };
  }
};

// Основной middleware для валидации
export const createValidationMiddleware = (
  schemas: ValidationSchemas,
  options: ValidationOptions = {}
): MiddlewareFunction => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const errors: any[] = [];

    // Валидация body
    if (schemas.body) {
      const result = validateData(schemas.body, req.body, options);
      if (!result.isValid) {
        errors.push(...result.errors.map(err => ({ ...err, location: 'body' })));
      } else {
        req.body = result.data;
      }
    }

    // Валидация query
    if (schemas.query) {
      const result = validateData(schemas.query, req.query, options);
      if (!result.isValid) {
        errors.push(...result.errors.map(err => ({ ...err, location: 'query' })));
      } else {
        req.query = result.data;
      }
    }

    // Валидация params
    if (schemas.params) {
      const result = validateData(schemas.params, req.params, options);
      if (!result.isValid) {
        errors.push(...result.errors.map(err => ({ ...err, location: 'params' })));
      } else {
        req.params = result.data;
      }
    }

    // Валидация headers
    if (schemas.headers) {
      const result = validateData(schemas.headers, req.headers, options);
      if (!result.isValid) {
        errors.push(...result.errors.map(err => ({ ...err, location: 'headers' })));
      }
    }

    // Если есть ошибки валидации
    if (errors.length > 0) {
      logger.warn('Validation failed', {
        requestId: req.headers['x-request-id'] as string,
        method: req.method,
        path: req.path,
        errors,
        timestamp: new Date().toISOString(),
      });

      const errorMessage = `Ошибка валидации: ${errors.length} ошибок`;
      throw new ValidationError(errorMessage, errors);
    }

    next();
  };
};

// Утилиты для создания валидационных middleware
export const validate = {
  // Валидация только body
  body: <T>(schema: ZodSchema<T>, options?: ValidationOptions) =>
    createValidationMiddleware({ body: schema }, options),

  // Валидация только query
  query: <T>(schema: ZodSchema<T>, options?: ValidationOptions) =>
    createValidationMiddleware({ query: schema }, options),

  // Валидация только params
  params: <T>(schema: ZodSchema<T>, options?: ValidationOptions) =>
    createValidationMiddleware({ params: schema }, options),

  // Валидация только headers
  headers: <T>(schema: ZodSchema<T>, options?: ValidationOptions) =>
    createValidationMiddleware({ headers: schema }, options),

  // Комбинированная валидация
  all: (schemas: ValidationSchemas, options?: ValidationOptions) =>
    createValidationMiddleware(schemas, options),
};

// Общие схемы валидации
export const commonSchemas = {
  // ID параметры
  id: z.object({
    id: z.string().uuid('ID должен быть валидным UUID'),
  }),

  // Пагинация
  pagination: z.object({
    page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1)
      .refine(val => val > 0, 'Страница должна быть больше 0'),
    limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 10)
      .refine(val => val > 0 && val <= 100, 'Лимит должен быть от 1 до 100'),
  }),

  // Сортировка
  sorting: z.object({
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).optional().default('asc'),
  }),

  // Поиск
  search: z.object({
    search: z.string().optional(),
    searchFields: z.array(z.string()).optional(),
  }),

  // Фильтрация по датам
  dateRange: z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
  }).refine(
    data => !data.startDate || !data.endDate || new Date(data.startDate) <= new Date(data.endDate),
    'Дата начала должна быть меньше даты окончания'
  ),

  // Базовые типы
  email: z.string().email('Неверный формат email'),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Неверный формат телефона'),
  url: z.string().url('Неверный формат URL'),

  // Пароль
  password: z.string()
    .min(8, 'Пароль должен содержать минимум 8 символов')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Пароль должен содержать строчные, заглавные буквы и цифры'),

  // Имена
  name: z.string()
    .min(2, 'Имя должно содержать минимум 2 символа')
    .max(50, 'Имя не должно превышать 50 символов')
    .regex(/^[a-zA-Zа-яА-Я\s-']+$/, 'Имя может содержать только буквы, пробелы, дефисы и апострофы'),

  // Денежные суммы
  money: z.number()
    .positive('Сумма должна быть положительной')
    .multipleOf(0.01, 'Сумма должна быть с точностью до копеек'),

  // Координаты
  coordinates: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
  }),
};

// Функции для создания сложных схем
export const schemaBuilders = {
  // Создание схемы с пагинацией
  withPagination: <T extends z.ZodRawShape>(baseSchema: z.ZodObject<T>) =>
    baseSchema.merge(commonSchemas.pagination),

  // Создание схемы с сортировкой
  withSorting: <T extends z.ZodRawShape>(baseSchema: z.ZodObject<T>, allowedFields: string[]) =>
    baseSchema.merge(commonSchemas.sorting.extend({
      sortBy: z.enum(allowedFields as [string, ...string[]]).optional(),
    })),

  // Создание схемы с поиском
  withSearch: <T extends z.ZodRawShape>(baseSchema: z.ZodObject<T>) =>
    baseSchema.merge(commonSchemas.search),

  // Создание схемы для обновления (все поля опциональные)
  makeOptional: <T extends z.ZodRawShape>(schema: z.ZodObject<T>) =>
    schema.partial(),

  // Создание схемы с условной валидацией
  conditional: <T>(
    condition: (data: any) => boolean,
    trueSchema: ZodSchema<T>,
    falseSchema: ZodSchema<T>
  ) => z.any().superRefine((data, ctx) => {
    const schema = condition(data) ? trueSchema : falseSchema;
    const result = schema.safeParse(data);
    if (!result.success) {
      result.error.errors.forEach(err => ctx.addIssue(err));
    }
  }),
};

// Функции для валидации без middleware
export const validateSync = {
  // Синхронная валидация данных
  data: <T>(schema: ZodSchema<T>, data: any): ValidationResult & { data?: T } =>
    validateData(schema, data),

  // Валидация с выбросом ошибки
  dataOrThrow: <T>(schema: ZodSchema<T>, data: any): T => {
    const result = validateData(schema, data);
    if (!result.isValid) {
      throw new ValidationError('Ошибка валидации данных', result.errors);
    }
    return result.data!;
  },

  // Безопасная валидация
  dataSafe: <T>(schema: ZodSchema<T>, data: any): { success: true; data: T } | { success: false; errors: any[] } => {
    const result = validateData(schema, data);
    if (result.isValid) {
      return { success: true, data: result.data! };
    }
    return { success: false, errors: result.errors };
  },
};

// Экспорт всех утилит
export const Validator = {
  middleware: createValidationMiddleware,
  validate,
  schemas: commonSchemas,
  builders: schemaBuilders,
  sync: validateSync,
  utils: {
    formatZodError,
    validateData,
  },
};
