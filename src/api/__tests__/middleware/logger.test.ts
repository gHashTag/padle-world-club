/**
 * Тесты для middleware логирования
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import {
  requestIdMiddleware,
  requestLoggerMiddleware,
  errorLoggerMiddleware,
  logger,
  logUtils
} from '../../middleware/logger';

// Мокаем консоль
const mockConsole = {
  log: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
};

vi.stubGlobal('console', mockConsole);

describe('Logger Middleware', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let next: NextFunction;

  beforeEach(() => {
    req = {
      headers: {},
      method: 'GET',
      path: '/test',
      ip: '127.0.0.1',
      query: {},
      body: {},
    };

    res = {
      setHeader: vi.fn(),
      send: vi.fn(),
      statusCode: 200,
      statusMessage: 'OK',
    };

    next = vi.fn();

    // Очищаем моки
    vi.clearAllMocks();
  });

  describe('requestIdMiddleware', () => {
    it('должен добавлять request ID если его нет', () => {
      requestIdMiddleware(req as Request, res as Response, next);

      expect(req.headers!['x-request-id']).toBeDefined();
      expect(typeof req.headers!['x-request-id']).toBe('string');
      expect(res.setHeader).toHaveBeenCalledWith('X-Request-ID', req.headers!['x-request-id']);
      expect(next).toHaveBeenCalled();
    });

    it('должен использовать существующий request ID', () => {
      const existingId = 'existing-request-id';
      req.headers!['x-request-id'] = existingId;

      requestIdMiddleware(req as Request, res as Response, next);

      expect(req.headers!['x-request-id']).toBe(existingId);
      expect(res.setHeader).toHaveBeenCalledWith('X-Request-ID', existingId);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('requestLoggerMiddleware', () => {
    it('должен логировать начало запроса', () => {
      req.headers!['x-request-id'] = 'test-request-id';

      requestLoggerMiddleware(req as Request, res as Response, next);

      expect(mockConsole.log).toHaveBeenCalled();
      const logCall = mockConsole.log.mock.calls[0][0];
      const logData = JSON.parse(logCall);

      expect(logData.level).toBe('info');
      expect(logData.message).toBe('Request started');
      expect(logData.context.requestId).toBe('test-request-id');
      expect(logData.context.method).toBe('GET');
      expect(logData.context.path).toBe('/test');
      expect(next).toHaveBeenCalled();
    });

    it('должен логировать завершение запроса при вызове res.send', () => {
      req.headers!['x-request-id'] = 'test-request-id';
      res.statusCode = 200;

      requestLoggerMiddleware(req as Request, res as Response, next);

      // Симулируем вызов res.send
      const originalSend = res.send as any;
      originalSend('response data');

      expect(mockConsole.log).toHaveBeenCalledTimes(2); // Начало и завершение

      const completionLogCall = mockConsole.log.mock.calls[1][0];
      const completionLogData = JSON.parse(completionLogCall);

      expect(completionLogData.level).toBe('info');
      expect(completionLogData.message).toContain('Request completed - 200');
      expect(completionLogData.context.duration).toBeDefined();
      expect(completionLogData.context.statusCode).toBe(200);
    });

    it('должен логировать ошибки для статус кодов >= 500', () => {
      req.headers!['x-request-id'] = 'test-request-id';
      res.statusCode = 500;

      requestLoggerMiddleware(req as Request, res as Response, next);

      // Симулируем вызов res.send
      const originalSend = res.send as any;
      originalSend('error response');

      expect(mockConsole.error).toHaveBeenCalled();
    });

    it('должен логировать предупреждения для статус кодов >= 400', () => {
      req.headers!['x-request-id'] = 'test-request-id';
      res.statusCode = 404;

      requestLoggerMiddleware(req as Request, res as Response, next);

      // Симулируем вызов res.send
      const originalSend = res.send as any;
      originalSend('not found');

      expect(mockConsole.warn).toHaveBeenCalled();
    });
  });

  describe('errorLoggerMiddleware', () => {
    it('должен логировать ошибки', () => {
      const error = new Error('Test error');
      req.headers!['x-request-id'] = 'test-request-id';

      errorLoggerMiddleware(error, req as Request, res as Response, next);

      expect(mockConsole.error).toHaveBeenCalled();
      const logCall = mockConsole.error.mock.calls[0][0];
      const logData = JSON.parse(logCall);

      expect(logData.level).toBe('error');
      expect(logData.message).toBe('Unhandled error occurred');
      expect(logData.error.message).toBe('Test error');
      expect(logData.context.requestId).toBe('test-request-id');
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('logger', () => {
    it('должен логировать info сообщения', () => {
      logger.info('Test info message', { requestId: 'test-id' });

      expect(mockConsole.log).toHaveBeenCalled();
      const logCall = mockConsole.log.mock.calls[0][0];
      const logData = JSON.parse(logCall);

      expect(logData.level).toBe('info');
      expect(logData.message).toBe('Test info message');
      expect(logData.context.requestId).toBe('test-id');
    });

    it('должен логировать warn сообщения', () => {
      logger.warn('Test warning', { requestId: 'test-id' });

      expect(mockConsole.warn).toHaveBeenCalled();
      const logCall = mockConsole.warn.mock.calls[0][0];
      const logData = JSON.parse(logCall);

      expect(logData.level).toBe('warn');
      expect(logData.message).toBe('Test warning');
    });

    it('должен логировать error сообщения', () => {
      const error = new Error('Test error');
      logger.error('Test error message', error, { requestId: 'test-id' });

      expect(mockConsole.error).toHaveBeenCalled();
      const logCall = mockConsole.error.mock.calls[0][0];
      const logData = JSON.parse(logCall);

      expect(logData.level).toBe('error');
      expect(logData.message).toBe('Test error message');
      expect(logData.error.message).toBe('Test error');
    });

    it('должен логировать debug сообщения только в development', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      logger.debug('Test debug message');

      expect(mockConsole.debug).toHaveBeenCalled();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe('logUtils', () => {
    it('должен логировать операции с базой данных', () => {
      logUtils.logDatabaseOperation('SELECT', 'users', 150, { requestId: 'test-id' });

      expect(mockConsole.log).toHaveBeenCalled();
      const logCall = mockConsole.log.mock.calls[0][0];
      const logData = JSON.parse(logCall);

      expect(logData.message).toContain('Database operation: SELECT on users');
      expect(logData.context.duration).toBe(150);
      expect(logData.context.operation).toBe('SELECT');
      expect(logData.context.table).toBe('users');
    });

    it('должен логировать внешние API вызовы', () => {
      logUtils.logExternalApiCall('https://api.example.com', 'GET', 200, 300);

      expect(mockConsole.log).toHaveBeenCalled();
      const logCall = mockConsole.log.mock.calls[0][0];
      const logData = JSON.parse(logCall);

      expect(logData.message).toContain('External API call: GET https://api.example.com - 200');
      expect(logData.context.duration).toBe(300);
      expect(logData.context.statusCode).toBe(200);
    });

    it('должен логировать бизнес-события', () => {
      const eventData = { userId: '123', action: 'login' };
      logUtils.logBusinessEvent('user_login', eventData);

      expect(mockConsole.log).toHaveBeenCalled();
      const logCall = mockConsole.log.mock.calls[0][0];
      const logData = JSON.parse(logCall);

      expect(logData.message).toBe('Business event: user_login');
      expect(logData.context.event).toBe('user_login');
      expect(logData.context.data).toEqual(eventData);
    });

    it('должен логировать производительность с правильным уровнем', () => {
      // Быстрая операция (debug) - в тестовой среде может не логироваться
      const originalEnv = process.env.NODE_ENV;
      const originalLogLevel = process.env.LOG_LEVEL;

      process.env.NODE_ENV = 'development';
      process.env.LOG_LEVEL = 'debug';

      logUtils.logPerformance('fast_operation', 500);
      // В тестовой среде debug может не работать, проверим что функция вызвалась без ошибок
      expect(mockConsole.debug).toHaveBeenCalledTimes(1);

      vi.clearAllMocks();

      // Медленная операция (info)
      logUtils.logPerformance('slow_operation', 2000);
      expect(mockConsole.log).toHaveBeenCalled();

      vi.clearAllMocks();

      // Очень медленная операция (warn)
      logUtils.logPerformance('very_slow_operation', 6000);
      expect(mockConsole.warn).toHaveBeenCalled();

      // Восстанавливаем переменные окружения
      process.env.NODE_ENV = originalEnv;
      process.env.LOG_LEVEL = originalLogLevel;
    });
  });
});
