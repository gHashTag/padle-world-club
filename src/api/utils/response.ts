/**
 * Утилиты для стандартизированных API ответов в функциональном стиле
 */

import { Response, Request } from 'express';
import { ApiResponse as ApiResponseType, PaginatedResponse, Result } from '../types';

// Функция для создания базового ответа
const createBaseResponse = (req: Request): Omit<ApiResponseType, 'success' | 'data' | 'error' | 'message'> => ({
  timestamp: new Date().toISOString(),
  path: req.path,
  method: req.method,
});

// Успешный ответ
export const success = <T>(
  res: Response,
  req: Request,
  data: T,
  message?: string,
  statusCode: number = 200
): Response => {
  const response: ApiResponseType<T> = {
    ...createBaseResponse(req),
    success: true,
    data,
    message,
  };

  return res.status(statusCode).json(response);
};

// Ответ с ошибкой
export const error = (
  res: Response,
  req: Request,
  message: string,
  statusCode: number = 500,
  errorDetails?: any
): Response => {
  const response: ApiResponseType = {
    ...createBaseResponse(req),
    success: false,
    message,
    error: errorDetails,
  };

  return res.status(statusCode).json(response);
};

// Ответ для пагинированных данных
export const paginated = <T>(
  res: Response,
  req: Request,
  data: T[],
  pagination: {
    page: number;
    limit: number;
    total: number;
  },
  message?: string,
  statusCode: number = 200
): Response => {
  const totalPages = Math.ceil(pagination.total / pagination.limit);

  const response: PaginatedResponse<T> = {
    ...createBaseResponse(req),
    success: true,
    data,
    message,
    pagination: {
      ...pagination,
      totalPages,
      hasNext: pagination.page < totalPages,
      hasPrev: pagination.page > 1,
    },
  };

  return res.status(statusCode).json(response);
};

// Ответ "Создано"
export const created = <T>(
  res: Response,
  req: Request,
  data: T,
  message: string = 'Ресурс успешно создан'
): Response => success(res, req, data, message, 201);

// Ответ "Обновлено"
export const updated = <T>(
  res: Response,
  req: Request,
  data: T,
  message: string = 'Ресурс успешно обновлен'
): Response => success(res, req, data, message, 200);

// Ответ "Удалено"
export const deleted = (
  res: Response,
  req: Request,
  message: string = 'Ресурс успешно удален'
): Response => success(res, req, null, message, 200);

// Ответ "Не найдено"
export const notFound = (
  res: Response,
  req: Request,
  message: string = 'Ресурс не найден'
): Response => error(res, req, message, 404);

// Ответ "Неверный запрос"
export const badRequest = (
  res: Response,
  req: Request,
  message: string = 'Неверный запрос',
  validationErrors?: any
): Response => error(res, req, message, 400, validationErrors);

// Ответ "Неавторизован"
export const unauthorized = (
  res: Response,
  req: Request,
  message: string = 'Требуется авторизация'
): Response => error(res, req, message, 401);

// Ответ "Запрещено"
export const forbidden = (
  res: Response,
  req: Request,
  message: string = 'Доступ запрещен'
): Response => error(res, req, message, 403);

// Ответ "Конфликт"
export const conflict = (
  res: Response,
  req: Request,
  message: string = 'Конфликт данных'
): Response => error(res, req, message, 409);

// Ответ "Внутренняя ошибка сервера"
export const internalError = (
  res: Response,
  req: Request,
  message: string = 'Внутренняя ошибка сервера',
  errorDetails?: any
): Response => error(res, req, message, 500, errorDetails);

// Функция для обработки Result типа
export const handleResult = <T>(
  res: Response,
  req: Request,
  result: Result<T>,
  successMessage?: string,
  successStatusCode?: number
): Response => {
  if (result.success) {
    return success(res, req, result.data, successMessage || result.message, successStatusCode);
  } else {
    // Определяем статус код на основе типа ошибки
    let statusCode = 500;
    if (typeof result.error === 'string') {
      if (result.error.includes('not found') || result.error.includes('не найден')) {
        statusCode = 404;
      } else if (result.error.includes('validation') || result.error.includes('валидация')) {
        statusCode = 400;
      } else if (result.error.includes('unauthorized') || result.error.includes('неавторизован')) {
        statusCode = 401;
      } else if (result.error.includes('forbidden') || result.error.includes('запрещено')) {
        statusCode = 403;
      } else if (result.error.includes('conflict') || result.error.includes('конфликт')) {
        statusCode = 409;
      }
    }

    return error(res, req, result.message, statusCode, result.error);
  }
};

// Функциональные композиции для цепочки ответов
export const responseComposer = {
  // Композиция для обработки асинхронных операций
  handleAsync: <T>(
    handler: () => Promise<Result<T>>
  ) => async (res: Response, req: Request): Promise<Response> => {
    try {
      const result = await handler();
      return handleResult(res, req, result);
    } catch (err) {
      return internalError(res, req, 'Неожиданная ошибка', err);
    }
  },

  // Композиция для обработки с валидацией
  withValidation: <T>(
    validator: (data: any) => Result<any>,
    handler: (validData: any) => Promise<Result<T>>
  ) => async (res: Response, req: Request): Promise<Response> => {
    const validationResult = validator(req.body);

    if (!validationResult.success) {
      return badRequest(res, req, validationResult.message, validationResult.error);
    }

    try {
      const result = await handler(validationResult.data);
      return handleResult(res, req, result);
    } catch (err) {
      return internalError(res, req, 'Неожиданная ошибка', err);
    }
  },

  // Композиция для обработки пагинации
  withPagination: <T>(
    handler: (page: number, limit: number) => Promise<{ data: T[]; total: number }>
  ) => async (res: Response, req: Request): Promise<Response> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 100); // Максимум 100 элементов

    if (page < 1 || limit < 1) {
      return badRequest(res, req, 'Параметры пагинации должны быть положительными числами');
    }

    try {
      const result = await handler(page, limit);
      return paginated(res, req, result.data, { page, limit, total: result.total });
    } catch (err) {
      return internalError(res, req, 'Ошибка при получении данных', err);
    }
  },
};

// Экспорт всех функций как объект для удобства
export const ApiResponse = {
  success,
  error,
  paginated,
  created,
  updated,
  deleted,
  notFound,
  badRequest,
  unauthorized,
  forbidden,
  conflict,
  internalError,
  handleResult,
  composer: responseComposer,
};
