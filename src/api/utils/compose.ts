/**
 * Утилиты для композиции функций в функциональном стиле
 */

import { Request, Response, NextFunction } from 'express';
import { AsyncHandler, Handler, Result } from '../types';
import { Either } from '../types/functional-types';

// Базовые функции композиции
export const pipe = <T>(...fns: Array<(arg: T) => T>) => (value: T): T =>
  fns.reduce((acc, fn) => fn(acc), value);

export const compose = <T>(...fns: Array<(arg: T) => T>) => (value: T): T =>
  fns.reduceRight((acc, fn) => fn(acc), value);

// Асинхронная композиция
export const pipeAsync = <T>(...fns: Array<(arg: T) => Promise<T>>) =>
  async (value: T): Promise<T> => {
    let result = value;
    for (const fn of fns) {
      result = await fn(result);
    }
    return result;
  };

// Композиция для Express handlers
export const composeHandlers = (...handlers: Handler[]): AsyncHandler =>
  async (req: Request, res: Response, next: NextFunction) => {
    for (const handler of handlers) {
      try {
        await handler(req, res, next);
        if (res.headersSent) break; // Если ответ уже отправлен, прекращаем
      } catch (error) {
        return next(error);
      }
    }
  };

// Композиция middleware
export const composeMiddleware = (...middlewares: Array<(req: Request, res: Response, next: NextFunction) => void | Promise<void>>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    let index = 0;

    const dispatch = async (i: number): Promise<void> => {
      if (i <= index) return Promise.reject(new Error('next() called multiple times'));
      index = i;

      const middleware = middlewares[i];
      if (!middleware) return next();

      try {
        await middleware(req, res, () => dispatch(i + 1));
      } catch (error) {
        next(error);
      }
    };

    return dispatch(0);
  };

// Функция для создания безопасного обработчика
export const safeHandler = (handler: AsyncHandler): AsyncHandler =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      await handler(req, res, next);
    } catch (error) {
      next(error);
    }
  };

// Функция для создания обработчика с валидацией
export const withValidation = <T>(
  validator: (data: any) => Result<T>,
  handler: (validData: T, req: Request, res: Response, next: NextFunction) => Promise<void>
): AsyncHandler =>
  async (req: Request, res: Response, next: NextFunction) => {
    const validationResult = validator(req.body);

    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: validationResult.message,
        error: validationResult.error,
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method,
      });
    }

    try {
      return await handler(validationResult.data, req, res, next);
    } catch (error) {
      return next(error);
    }
  };

// Функция для создания обработчика с аутентификацией
export const withAuth = (
  authCheck: (req: Request) => Promise<boolean>,
  handler: AsyncHandler
): AsyncHandler =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const isAuthenticated = await authCheck(req);

      if (!isAuthenticated) {
        return res.status(401).json({
          success: false,
          message: 'Требуется авторизация',
          timestamp: new Date().toISOString(),
          path: req.path,
          method: req.method,
        });
      }

      return await handler(req, res, next);
    } catch (error) {
      return next(error);
    }
  };

// Функция для создания обработчика с логированием
export const withLogging = (
  logger: (req: Request, res: Response, duration: number) => void,
  handler: AsyncHandler
): AsyncHandler =>
  async (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();

    try {
      await handler(req, res, next);
    } finally {
      const duration = Date.now() - startTime;
      logger(req, res, duration);
    }
  };

// Функция для создания обработчика с кэшированием
export const withCache = (
  cacheKey: (req: Request) => string,
  cacheTTL: number,
  cache: Map<string, { data: any; expires: number }>,
  handler: AsyncHandler
): AsyncHandler =>
  async (req: Request, res: Response, next: NextFunction) => {
    const key = cacheKey(req);
    const cached = cache.get(key);

    if (cached && cached.expires > Date.now()) {
      return res.json(cached.data);
    }

    // Перехватываем res.json для кэширования
    const originalJson = res.json.bind(res);
    res.json = (data: any) => {
      cache.set(key, {
        data,
        expires: Date.now() + cacheTTL,
      });
      return originalJson(data);
    };

    return await handler(req, res, next);
  };

// Функция для создания обработчика с rate limiting
export const withRateLimit = (
  keyGenerator: (req: Request) => string,
  maxRequests: number,
  windowMs: number,
  store: Map<string, { count: number; resetTime: number }>,
  handler: AsyncHandler
): AsyncHandler =>
  async (req: Request, res: Response, next: NextFunction) => {
    const key = keyGenerator(req);
    const now = Date.now();
    const record = store.get(key);

    if (!record || record.resetTime <= now) {
      store.set(key, { count: 1, resetTime: now + windowMs });
      return handler(req, res, next);
    }

    if (record.count >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Превышен лимит запросов',
        retryAfter: Math.ceil((record.resetTime - now) / 1000),
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method,
      });
    }

    record.count++;
    return handler(req, res, next);
  };

// Функция для создания обработчика с трансформацией данных
export const withTransform = <T, U>(
  transformer: (data: T) => U,
  handler: (transformedData: U, req: Request, res: Response, next: NextFunction) => Promise<void>
): AsyncHandler =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const transformedData = transformer(req.body);
      await handler(transformedData, req, res, next);
    } catch (error) {
      next(error);
    }
  };

// Функция для создания обработчика с Either монадой
export const withEither = <T>(
  operation: (req: Request) => Promise<Either<Error, T>>,
  onSuccess: (data: T, req: Request, res: Response) => void,
  onError: (error: Error, req: Request, res: Response) => void
): AsyncHandler =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await operation(req);

      result.fold(
        (error) => onError(error, req, res),
        (data) => onSuccess(data, req, res)
      );
    } catch (error) {
      next(error);
    }
  };

// Утилита для создания цепочки обработчиков
export const chain = (...handlers: AsyncHandler[]): AsyncHandler =>
  async (req: Request, res: Response, next: NextFunction) => {
    let index = 0;

    const executeNext = async (): Promise<void> => {
      if (index >= handlers.length) return;

      const handler = handlers[index++];

      // Создаем новую функцию next для цепочки
      const chainNext = (error?: any) => {
        if (error) return next(error);
        return executeNext();
      };

      await handler(req, res, chainNext);
    };

    return executeNext();
  };

// Экспорт всех утилит
export const FunctionalCompose = {
  pipe,
  compose,
  pipeAsync,
  composeHandlers,
  composeMiddleware,
  safeHandler,
  withValidation,
  withAuth,
  withLogging,
  withCache,
  withRateLimit,
  withTransform,
  withEither,
  chain,
};
