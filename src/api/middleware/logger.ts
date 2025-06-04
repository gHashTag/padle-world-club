/**
 * Middleware для логирования запросов в функциональном стиле
 */

import { Request, Response, NextFunction } from 'express';
import { LogContext, MiddlewareFunction } from '../types';

// Типы для логирования
export interface LogEntry {
  level: 'info' | 'warn' | 'error' | 'debug';
  message: string;
  context: LogContext;
  timestamp: string;
  duration?: number;
  statusCode?: number;
  error?: any;
}

export interface Logger {
  info: (message: string, context?: Partial<LogContext>) => void;
  warn: (message: string, context?: Partial<LogContext>) => void;
  error: (message: string, error?: any, context?: Partial<LogContext>) => void;
  debug: (message: string, context?: Partial<LogContext>) => void;
}

// Создание контекста логирования из запроса
const createLogContext = (req: Request): LogContext => ({
  requestId: req.headers['x-request-id'] as string || generateRequestId(),
  userId: req.headers['x-user-id'] as string,
  method: req.method,
  path: req.path,
  userAgent: req.headers['user-agent'],
  ip: req.ip || req.connection.remoteAddress || 'unknown',
  timestamp: new Date().toISOString(),
});

// Генерация уникального ID запроса
const generateRequestId = (): string => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Простой консольный логгер
const createConsoleLogger = (format: 'json' | 'simple' = 'json'): Logger => ({
  info: (message: string, context?: Partial<LogContext>) => {
    const entry: LogEntry = {
      level: 'info',
      message,
      context: { ...context } as LogContext,
      timestamp: new Date().toISOString(),
    };

    if (format === 'json') {
      console.log(JSON.stringify(entry));
    } else {
      console.log(`[INFO] ${entry.timestamp} - ${message}`, context ? JSON.stringify(context) : '');
    }
  },

  warn: (message: string, context?: Partial<LogContext>) => {
    const entry: LogEntry = {
      level: 'warn',
      message,
      context: { ...context } as LogContext,
      timestamp: new Date().toISOString(),
    };

    if (format === 'json') {
      console.warn(JSON.stringify(entry));
    } else {
      console.warn(`[WARN] ${entry.timestamp} - ${message}`, context ? JSON.stringify(context) : '');
    }
  },

  error: (message: string, error?: any, context?: Partial<LogContext>) => {
    const entry: LogEntry = {
      level: 'error',
      message,
      context: { ...context } as LogContext,
      timestamp: new Date().toISOString(),
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : undefined,
    };

    if (format === 'json') {
      console.error(JSON.stringify(entry));
    } else {
      console.error(`[ERROR] ${entry.timestamp} - ${message}`, error, context ? JSON.stringify(context) : '');
    }
  },

  debug: (message: string, context?: Partial<LogContext>) => {
    if (process.env.NODE_ENV === 'development' || process.env.LOG_LEVEL === 'debug') {
      const entry: LogEntry = {
        level: 'debug',
        message,
        context: { ...context } as LogContext,
        timestamp: new Date().toISOString(),
      };

      if (format === 'json') {
        console.debug(JSON.stringify(entry));
      } else {
        console.debug(`[DEBUG] ${entry.timestamp} - ${message}`, context ? JSON.stringify(context) : '');
      }
    }
  },
});

// Глобальный логгер
export const logger = createConsoleLogger(
  (process.env.LOG_FORMAT as 'json' | 'simple') || 'json'
);

// Middleware для добавления request ID
export const requestIdMiddleware: MiddlewareFunction = (req: Request, res: Response, next: NextFunction) => {
  const requestId = req.headers['x-request-id'] as string || generateRequestId();
  req.headers['x-request-id'] = requestId;
  res.setHeader('X-Request-ID', requestId);
  next();
};

// Middleware для логирования запросов
export const requestLoggerMiddleware: MiddlewareFunction = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const context = createLogContext(req);

  // Логируем начало запроса
  logger.info('Request started', {
    ...context,
    query: req.query,
    body: req.method !== 'GET' ? req.body : undefined,
  });

  // Перехватываем завершение ответа
  const originalSend = res.send.bind(res);
  res.send = function(data: any) {
    const duration = Date.now() - startTime;
    const statusCode = res.statusCode;

    // Логируем завершение запроса
    const logLevel = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
    const message = `Request completed - ${statusCode} ${res.statusMessage || ''}`;

    if (logLevel === 'error') {
      logger.error(message, null, { ...context, duration, statusCode });
    } else if (logLevel === 'warn') {
      logger.warn(message, { ...context, duration, statusCode });
    } else {
      logger.info(message, { ...context, duration, statusCode });
    }

    return originalSend(data);
  };

  next();
};

// Middleware для логирования ошибок
export const errorLoggerMiddleware = (error: any, req: Request, res: Response, next: NextFunction) => {
  const context = createLogContext(req);

  logger.error('Unhandled error occurred', error, {
    ...context,
    statusCode: res.statusCode,
  });

  next(error);
};

// Функциональная композиция всех логирующих middleware
export const createLoggingMiddleware = (): MiddlewareFunction[] => [
  requestIdMiddleware,
  requestLoggerMiddleware,
];

// Утилиты для создания структурированных логов
export const logUtils = {
  // Логирование операций с базой данных
  logDatabaseOperation: (operation: string, table: string, duration: number, context?: Partial<LogContext>) => {
    logger.info(`Database operation: ${operation} on ${table}`, {
      ...context,
      duration,
      operation,
      table,
    });
  },

  // Логирование внешних API вызовов
  logExternalApiCall: (url: string, method: string, statusCode: number, duration: number, context?: Partial<LogContext>) => {
    const logLevel = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';
    const message = `External API call: ${method} ${url} - ${statusCode}`;

    if (logLevel === 'error') {
      logger.error(message, null, { ...context, duration, statusCode, url, method });
    } else if (logLevel === 'warn') {
      logger.warn(message, { ...context, duration, statusCode, url, method });
    } else {
      logger.info(message, { ...context, duration, statusCode, url, method });
    }
  },

  // Логирование бизнес-событий
  logBusinessEvent: (event: string, data?: any, context?: Partial<LogContext>) => {
    logger.info(`Business event: ${event}`, {
      ...context,
      event,
      data,
    });
  },

  // Логирование производительности
  logPerformance: (operation: string, duration: number, context?: Partial<LogContext>) => {
    const logLevel = duration > 5000 ? 'warn' : duration > 1000 ? 'info' : 'debug';
    const message = `Performance: ${operation} took ${duration}ms`;

    if (logLevel === 'warn') {
      logger.warn(message, { ...context, duration, operation });
    } else if (logLevel === 'info') {
      logger.info(message, { ...context, duration, operation });
    } else {
      logger.debug(message, { ...context, duration, operation });
    }
  },
};

// Экспорт всех утилит
export const LoggingMiddleware = {
  requestId: requestIdMiddleware,
  requestLogger: requestLoggerMiddleware,
  errorLogger: errorLoggerMiddleware,
  create: createLoggingMiddleware,
  utils: logUtils,
  logger,
};
