/**
 * Middleware для обработки ошибок в функциональном стиле
 */

import { Request, Response, NextFunction } from 'express';
import { ErrorCode, MiddlewareFunction } from '../types';
import { ApiResponse } from '../utils/response';
import { logger } from './logger';

// Базовые классы ошибок
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly isOperational: boolean;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number = 500,
    code: ErrorCode = ErrorCode.INTERNAL_ERROR,
    isOperational: boolean = true,
    details?: any
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, ErrorCode.VALIDATION_ERROR, true, details);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Ресурс не найден') {
    super(message, 404, ErrorCode.NOT_FOUND, true);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Требуется авторизация') {
    super(message, 401, ErrorCode.UNAUTHORIZED, true);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Доступ запрещен') {
    super(message, 403, ErrorCode.FORBIDDEN, true);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Конфликт данных') {
    super(message, 409, ErrorCode.CONFLICT, true);
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Превышен лимит запросов') {
    super(message, 429, ErrorCode.RATE_LIMIT_EXCEEDED, true);
  }
}

// Функции для создания ошибок в функциональном стиле
export const createError = {
  validation: (message: string, details?: any) => new ValidationError(message, details),
  notFound: (message?: string) => new NotFoundError(message),
  unauthorized: (message?: string) => new UnauthorizedError(message),
  forbidden: (message?: string) => new ForbiddenError(message),
  conflict: (message?: string) => new ConflictError(message),
  rateLimit: (message?: string) => new RateLimitError(message),
  internal: (message: string, details?: any) => new AppError(message, 500, ErrorCode.INTERNAL_ERROR, true, details),
};

// Функция для определения типа ошибки
const getErrorType = (error: any): { statusCode: number; code: ErrorCode; isOperational: boolean } => {
  // Если это наша кастомная ошибка
  if (error instanceof AppError) {
    return {
      statusCode: error.statusCode,
      code: error.code,
      isOperational: error.isOperational,
    };
  }

  // Ошибки валидации Zod
  if (error.name === 'ZodError') {
    return {
      statusCode: 400,
      code: ErrorCode.VALIDATION_ERROR,
      isOperational: true,
    };
  }

  // Ошибки базы данных
  if (error.code === '23505') { // PostgreSQL unique violation
    return {
      statusCode: 409,
      code: ErrorCode.CONFLICT,
      isOperational: true,
    };
  }

  if (error.code === '23503') { // PostgreSQL foreign key violation
    return {
      statusCode: 400,
      code: ErrorCode.VALIDATION_ERROR,
      isOperational: true,
    };
  }

  // Ошибки JSON парсинга
  if (error.type === 'entity.parse.failed') {
    return {
      statusCode: 400,
      code: ErrorCode.BAD_REQUEST,
      isOperational: true,
    };
  }

  // Ошибки размера запроса
  if (error.type === 'entity.too.large') {
    return {
      statusCode: 413,
      code: ErrorCode.BAD_REQUEST,
      isOperational: true,
    };
  }

  // По умолчанию - внутренняя ошибка
  return {
    statusCode: 500,
    code: ErrorCode.INTERNAL_ERROR,
    isOperational: false,
  };
};

// Функция для форматирования деталей ошибки
const formatErrorDetails = (error: any): any => {
  // Ошибки Zod
  if (error.name === 'ZodError') {
    return error.errors.map((err: any) => ({
      field: err.path.join('.'),
      message: err.message,
      value: err.received,
    }));
  }

  // Ошибки базы данных
  if (error.code && error.detail) {
    return {
      code: error.code,
      detail: error.detail,
      constraint: error.constraint,
    };
  }

  // Если есть details в кастомной ошибке
  if (error instanceof AppError && error.details) {
    return error.details;
  }

  return undefined;
};

// Основной middleware для обработки ошибок
export const errorHandlerMiddleware = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const { statusCode, code, isOperational } = getErrorType(error);
  const details = formatErrorDetails(error);

  // Логируем ошибку
  if (!isOperational || statusCode >= 500) {
    logger.error('Application error occurred', error, {
      requestId: req.headers['x-request-id'] as string,
      method: req.method,
      path: req.path,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      timestamp: new Date().toISOString(),
    });
  } else {
    logger.warn('Operational error occurred', {
      requestId: req.headers['x-request-id'] as string,
      method: req.method,
      path: req.path,
      message: error.message,
      code,
      timestamp: new Date().toISOString(),
    });
  }

  // Если ответ уже отправлен, передаем ошибку дальше
  if (res.headersSent) {
    return next(error);
  }

  // Формируем сообщение об ошибке
  let message = error.message || 'Внутренняя ошибка сервера';

  // В продакшене не показываем детали внутренних ошибок
  if (!isOperational && process.env.NODE_ENV === 'production') {
    message = 'Внутренняя ошибка сервера';
  }

  // Отправляем ошибку клиенту
  ApiResponse.error(res, req, message, statusCode, details);
};

// Middleware для обработки 404 ошибок
export const notFoundMiddleware: MiddlewareFunction = (req: Request, _res: Response, next: NextFunction) => {
  const error = new NotFoundError(`Маршрут ${req.method} ${req.originalUrl} не найден`);
  next(error);
};

// Middleware для обработки необработанных Promise rejections
export const unhandledRejectionHandler = (reason: any, promise: Promise<any>) => {
  logger.error('Unhandled Promise Rejection', reason, {
    promise: promise.toString(),
    timestamp: new Date().toISOString(),
  });

  // В продакшене можно завершить процесс
  if (process.env.NODE_ENV === 'production') {
    process.exit(1);
  }
};

// Middleware для обработки необработанных исключений
export const uncaughtExceptionHandler = (error: Error) => {
  logger.error('Uncaught Exception', error, {
    timestamp: new Date().toISOString(),
  });

  // Завершаем процесс при необработанном исключении
  process.exit(1);
};

// Функция для настройки глобальных обработчиков ошибок
export const setupGlobalErrorHandlers = (): void => {
  process.on('unhandledRejection', unhandledRejectionHandler);
  process.on('uncaughtException', uncaughtExceptionHandler);
};

// Функция для создания async wrapper
export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// Функция для валидации и создания ошибки
export const validateAndThrow = (condition: boolean, errorFactory: () => AppError): void => {
  if (!condition) {
    throw errorFactory();
  }
};

// Утилиты для работы с ошибками
export const errorUtils = {
  // Проверка является ли ошибка операционной
  isOperationalError: (error: any): boolean => {
    return error instanceof AppError && error.isOperational;
  },

  // Извлечение стека вызовов
  getStackTrace: (error: Error): string[] => {
    return error.stack ? error.stack.split('\n').slice(1) : [];
  },

  // Создание краткого описания ошибки
  getErrorSummary: (error: any): string => {
    return `${error.name}: ${error.message}`;
  },

  // Проверка нужно ли перезапускать сервер
  shouldRestart: (error: any): boolean => {
    return !errorUtils.isOperationalError(error);
  },
};

// Экспорт всех утилит
export const ErrorHandler = {
  middleware: errorHandlerMiddleware,
  notFound: notFoundMiddleware,
  asyncHandler,
  createError,
  setupGlobal: setupGlobalErrorHandlers,
  utils: errorUtils,
  validateAndThrow,
  errors: {
    AppError,
    ValidationError,
    NotFoundError,
    UnauthorizedError,
    ForbiddenError,
    ConflictError,
    RateLimitError,
  },
};
