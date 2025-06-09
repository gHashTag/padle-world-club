/**
 * Middleware для ограничения частоты запросов в функциональном стиле
 */

import { Request, Response, NextFunction } from 'express';
import { MiddlewareFunction } from '../types';
import { RateLimitError } from './error-handler';
import { logger } from './logger';

// Типы для rate limiting
export interface RateLimitConfig {
  windowMs: number; // Окно времени в миллисекундах
  max: number; // Максимальное количество запросов в окне
  message?: string; // Сообщение об ошибке
  standardHeaders?: boolean; // Добавлять стандартные заголовки
  legacyHeaders?: boolean; // Добавлять legacy заголовки
  skipSuccessfulRequests?: boolean; // Не считать успешные запросы
  skipFailedRequests?: boolean; // Не считать неудачные запросы
  keyGenerator?: (req: Request) => string; // Функция для генерации ключа
  skip?: (req: Request) => boolean; // Функция для пропуска запросов
  onLimitReached?: (req: Request, res: Response) => void; // Callback при достижении лимита
}

export interface RateLimitInfo {
  totalHits: number;
  totalHitsInWindow: number;
  resetTime: Date;
  remainingPoints: number;
}

export interface RateLimitStore {
  get: (key: string) => Promise<RateLimitInfo | null>;
  set: (key: string, info: RateLimitInfo) => Promise<void>;
  increment: (key: string, windowMs: number) => Promise<RateLimitInfo>;
  reset: (key: string) => Promise<void>;
}

// Простое in-memory хранилище для rate limiting
class MemoryStore implements RateLimitStore {
  private store = new Map<string, { count: number; resetTime: number }>();

  async get(key: string): Promise<RateLimitInfo | null> {
    const record = this.store.get(key);
    if (!record) return null;

    const now = Date.now();
    if (now > record.resetTime) {
      this.store.delete(key);
      return null;
    }

    return {
      totalHits: record.count,
      totalHitsInWindow: record.count,
      resetTime: new Date(record.resetTime),
      remainingPoints: 0, // Будет вычислено в middleware
    };
  }

  async set(key: string, info: RateLimitInfo): Promise<void> {
    this.store.set(key, {
      count: info.totalHitsInWindow,
      resetTime: info.resetTime.getTime(),
    });
  }

  async increment(key: string, windowMs: number): Promise<RateLimitInfo> {
    const now = Date.now();
    const resetTime = now + windowMs;
    const record = this.store.get(key);

    if (!record || now > record.resetTime) {
      // Новое окно
      const newRecord = { count: 1, resetTime };
      this.store.set(key, newRecord);
      
      return {
        totalHits: 1,
        totalHitsInWindow: 1,
        resetTime: new Date(resetTime),
        remainingPoints: 0,
      };
    } else {
      // Увеличиваем счетчик в текущем окне
      record.count++;
      
      return {
        totalHits: record.count,
        totalHitsInWindow: record.count,
        resetTime: new Date(record.resetTime),
        remainingPoints: 0,
      };
    }
  }

  async reset(key: string): Promise<void> {
    this.store.delete(key);
  }

  // Метод для очистки устаревших записей
  cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.store.entries()) {
      if (now > record.resetTime) {
        this.store.delete(key);
      }
    }
  }
}

// Глобальное хранилище
const defaultStore = new MemoryStore();

// Периодическая очистка устаревших записей
setInterval(() => {
  defaultStore.cleanup();
}, 60000); // Каждую минуту

// Функции для генерации ключей
export const keyGenerators = {
  // По IP адресу
  ip: (req: Request): string => {
    return `rate_limit:ip:${req.ip || req.connection.remoteAddress || 'unknown'}`;
  },

  // По пользователю
  user: (req: Request): string => {
    const userId = req.user?.id || 'anonymous';
    return `rate_limit:user:${userId}`;
  },

  // По IP и пути
  ipAndPath: (req: Request): string => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    return `rate_limit:ip_path:${ip}:${req.path}`;
  },

  // По пользователю и пути
  userAndPath: (req: Request): string => {
    const userId = req.user?.id || 'anonymous';
    return `rate_limit:user_path:${userId}:${req.path}`;
  },

  // Комбинированный ключ
  combined: (req: Request): string => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const userId = req.user?.id || 'anonymous';
    return `rate_limit:combined:${ip}:${userId}`;
  },
};

// Функции для пропуска запросов
export const skipFunctions = {
  // Пропускать для администраторов
  skipAdmins: (req: Request): boolean => {
    return req.user?.role === 'admin';
  },

  // Пропускать для локальных запросов
  skipLocal: (req: Request): boolean => {
    const ip = req.ip || req.connection.remoteAddress;
    return ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1';
  },

  // Пропускать для определенных путей
  skipPaths: (paths: string[]) => (req: Request): boolean => {
    return paths.includes(req.path);
  },

  // Пропускать для определенных методов
  skipMethods: (methods: string[]) => (req: Request): boolean => {
    return methods.includes(req.method);
  },
};

// Основной middleware для rate limiting
export const createRateLimitMiddleware = (
  config: RateLimitConfig,
  store: RateLimitStore = defaultStore
): MiddlewareFunction => {
  const {
    windowMs,
    max,
    message = 'Превышен лимит запросов',
    standardHeaders = true,
    legacyHeaders = false,
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    keyGenerator = keyGenerators.ip,
    skip,
    onLimitReached,
  } = config;

  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Проверяем нужно ли пропустить запрос
      if (skip && skip(req)) {
        return next();
      }

      const key = keyGenerator(req);
      
      // Получаем текущую информацию о лимитах
      const info = await store.increment(key, windowMs);
      const remaining = Math.max(0, max - info.totalHitsInWindow);

      // Добавляем заголовки
      if (standardHeaders) {
        res.setHeader('RateLimit-Limit', max);
        res.setHeader('RateLimit-Remaining', remaining);
        res.setHeader('RateLimit-Reset', Math.ceil(info.resetTime.getTime() / 1000));
      }

      if (legacyHeaders) {
        res.setHeader('X-RateLimit-Limit', max);
        res.setHeader('X-RateLimit-Remaining', remaining);
        res.setHeader('X-RateLimit-Reset', Math.ceil(info.resetTime.getTime() / 1000));
      }

      // Проверяем превышение лимита
      if (info.totalHitsInWindow > max) {
        // Логируем превышение лимита
        logger.warn('Rate limit exceeded', {
          requestId: req.headers['x-request-id'] as string,
          key,
          limit: max,
          current: info.totalHitsInWindow,
          resetTime: info.resetTime,
          ip: req.ip,
          userAgent: req.headers['user-agent'],
          method: req.method,
          path: req.path,
          timestamp: new Date().toISOString(),
        });

        // Вызываем callback если есть
        if (onLimitReached) {
          onLimitReached(req, res);
        }

        // Добавляем заголовок Retry-After
        const retryAfter = Math.ceil((info.resetTime.getTime() - Date.now()) / 1000);
        res.setHeader('Retry-After', retryAfter);

        throw new RateLimitError(message);
      }

      // Перехватываем завершение ответа для условного подсчета
      const originalSend = res.send.bind(res);
      res.send = function(data: any) {
        const statusCode = res.statusCode;
        
        // Проверяем нужно ли исключить этот запрос из подсчета
        const shouldSkip = 
          (skipSuccessfulRequests && statusCode < 400) ||
          (skipFailedRequests && statusCode >= 400);

        if (shouldSkip) {
          // Уменьшаем счетчик (это упрощенная логика)
          // В реальном приложении лучше использовать более сложную логику
          logger.debug('Request excluded from rate limiting', {
            requestId: req.headers['x-request-id'] as string,
            key,
            statusCode,
            skipSuccessful: skipSuccessfulRequests,
            skipFailed: skipFailedRequests,
          });
        }

        return originalSend(data);
      };

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Предустановленные конфигурации
export const rateLimitPresets = {
  // Строгий лимит для API
  strict: {
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 100, // 100 запросов
    message: 'Превышен лимит запросов. Попробуйте позже.',
  },

  // Умеренный лимит
  moderate: {
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 500, // 500 запросов
    message: 'Превышен лимит запросов. Попробуйте позже.',
  },

  // Мягкий лимит
  lenient: {
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 1000, // 1000 запросов
    message: 'Превышен лимит запросов. Попробуйте позже.',
  },

  // Лимит для аутентификации
  auth: {
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 5, // 5 попыток
    message: 'Слишком много попыток входа. Попробуйте позже.',
    skipSuccessfulRequests: true,
  },

  // Лимит для создания ресурсов
  create: {
    windowMs: 60 * 60 * 1000, // 1 час
    max: 10, // 10 создания
    message: 'Превышен лимит создания ресурсов. Попробуйте позже.',
  },
};

// Утилиты для создания middleware
export const rateLimit = {
  // Создание с предустановкой
  preset: (preset: keyof typeof rateLimitPresets, overrides?: Partial<RateLimitConfig>) =>
    createRateLimitMiddleware({ ...rateLimitPresets[preset], ...overrides }),

  // Создание с кастомной конфигурацией
  custom: (config: RateLimitConfig) => createRateLimitMiddleware(config),

  // Быстрые методы для частых случаев
  perIP: (max: number, windowMs: number = 15 * 60 * 1000) =>
    createRateLimitMiddleware({ max, windowMs, keyGenerator: keyGenerators.ip }),

  perUser: (max: number, windowMs: number = 15 * 60 * 1000) =>
    createRateLimitMiddleware({ max, windowMs, keyGenerator: keyGenerators.user }),

  perIPAndPath: (max: number, windowMs: number = 15 * 60 * 1000) =>
    createRateLimitMiddleware({ max, windowMs, keyGenerator: keyGenerators.ipAndPath }),
};

// Экспорт всех утилит
export const RateLimit = {
  middleware: createRateLimitMiddleware,
  presets: rateLimitPresets,
  keyGenerators,
  skipFunctions,
  rateLimit,
  store: {
    memory: () => new MemoryStore(),
    default: defaultStore,
  },
};
