/**
 * Конфигурация Express API сервера
 */

import { ApiConfig } from '../types';

// Получение переменных окружения с значениями по умолчанию
const getEnv = (key: string, defaultValue: string): string => 
  process.env[key] || defaultValue;

const getEnvNumber = (key: string, defaultValue: number): number => 
  parseInt(process.env[key] || String(defaultValue), 10);

const getEnvBoolean = (key: string, defaultValue: boolean): boolean => 
  process.env[key] === 'true' || (process.env[key] === undefined && defaultValue);

// Основная конфигурация API
export const config: ApiConfig = {
  server: {
    port: getEnvNumber('API_PORT', 3000),
    host: getEnv('API_HOST', '0.0.0.0'),
    cors: {
      origin: getEnv('CORS_ORIGIN', '*').split(','),
      credentials: getEnvBoolean('CORS_CREDENTIALS', true),
    },
    rateLimit: {
      windowMs: getEnvNumber('RATE_LIMIT_WINDOW_MS', 15 * 60 * 1000), // 15 минут
      max: getEnvNumber('RATE_LIMIT_MAX', 100), // 100 запросов на окно
    },
    compression: getEnvBoolean('COMPRESSION_ENABLED', true),
    helmet: getEnvBoolean('HELMET_ENABLED', true),
  },
  database: {
    url: getEnv('DATABASE_URL', 'postgresql://localhost:5432/padle_world_club'),
    ssl: getEnvBoolean('DATABASE_SSL', true),
    poolSize: getEnvNumber('DATABASE_POOL_SIZE', 10),
    timeout: getEnvNumber('DATABASE_TIMEOUT', 30000),
  },
  swagger: {
    enabled: getEnvBoolean('SWAGGER_ENABLED', true),
    path: getEnv('SWAGGER_PATH', '/api/docs'),
    title: getEnv('SWAGGER_TITLE', 'Padle World Club API'),
    version: getEnv('SWAGGER_VERSION', '1.0.0'),
    description: getEnv('SWAGGER_DESCRIPTION', 'REST API для системы управления падел-клубом'),
  },
  logging: {
    level: (getEnv('LOG_LEVEL', 'info') as 'error' | 'warn' | 'info' | 'debug'),
    format: (getEnv('LOG_FORMAT', 'json') as 'json' | 'simple'),
  },
};

// Валидация конфигурации
export const validateConfig = (): void => {
  const requiredEnvVars = ['DATABASE_URL'];
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Обязательная переменная окружения ${envVar} не установлена`);
    }
  }

  if (config.server.port < 1 || config.server.port > 65535) {
    throw new Error(`Неверный порт: ${config.server.port}. Должен быть от 1 до 65535`);
  }

  if (config.database.poolSize < 1) {
    throw new Error(`Неверный размер пула БД: ${config.database.poolSize}. Должен быть больше 0`);
  }
};

// Экспорт отдельных конфигураций для удобства
export const serverConfig = config.server;
export const databaseConfig = config.database;
export const swaggerConfig = config.swagger;
export const loggingConfig = config.logging;
