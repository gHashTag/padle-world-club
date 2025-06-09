/**
 * Базовые типы для Express API в функциональном стиле
 */

import { Request, Response, NextFunction } from "express";

// Базовые типы для функционального программирования
export type AsyncHandler<T = any> = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<T>;
export type SyncHandler<T = any> = (
  req: Request,
  res: Response,
  next: NextFunction
) => T;
export type Handler<T = any> = AsyncHandler<T> | SyncHandler<T>;

// Типы для композиции функций
export type Compose<T, U> = (value: T) => U;
export type AsyncCompose<T, U> = (value: T) => Promise<U>;

// Типы для результатов операций (Either/Result pattern)
export type Success<T> = {
  success: true;
  data: T;
  message?: string;
};

export type Failure<E = string> = {
  success: false;
  error: E;
  message: string;
};

export type Result<T, E = string> = Success<T> | Failure<E>;

// Типы для API ответов
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
  path: string;
  method: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Типы для запросов
export interface PaginationQuery {
  page?: string;
  limit?: string;
}

export interface SortQuery {
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface FilterQuery {
  [key: string]: string | string[] | undefined;
}

export interface SearchQuery {
  search?: string;
  searchFields?: string[];
}

export type QueryParams = PaginationQuery &
  SortQuery &
  FilterQuery &
  SearchQuery;

// Типы для валидации
export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  data?: any;
}

// Типы для middleware
export type MiddlewareFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => void | Promise<void>;

// Типы для конфигурации
export interface ServerConfig {
  port: number;
  host: string;
  cors: {
    origin: string | string[];
    credentials: boolean;
  };
  rateLimit: {
    windowMs: number;
    max: number;
  };
  compression: boolean;
  helmet: boolean;
}

export interface DatabaseConfig {
  url: string;
  ssl: boolean;
  poolSize: number;
  timeout: number;
}

export interface ApiConfig {
  server: ServerConfig;
  database: DatabaseConfig;
  swagger: {
    enabled: boolean;
    path: string;
    title: string;
    version: string;
    description: string;
  };
  logging: {
    level: "error" | "warn" | "info" | "debug";
    format: "json" | "simple";
  };
}

// Типы для ошибок
export enum ErrorCode {
  VALIDATION_ERROR = "VALIDATION_ERROR",
  NOT_FOUND = "NOT_FOUND",
  UNAUTHORIZED = "UNAUTHORIZED",
  FORBIDDEN = "FORBIDDEN",
  CONFLICT = "CONFLICT",
  INTERNAL_ERROR = "INTERNAL_ERROR",
  BAD_REQUEST = "BAD_REQUEST",
  RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
}

export interface ApiError {
  code: ErrorCode;
  message: string;
  details?: any;
  statusCode: number;
}

// Типы для логирования
export interface LogContext {
  requestId: string;
  userId?: string;
  method: string;
  path: string;
  userAgent?: string;
  ip: string;
  timestamp: string;
  // Дополнительные поля для расширенного логирования
  username?: string;
  duration?: number;
  statusCode?: number;
  query?: any;
  errors?: any[];
  event?: string;
  data?: any;
  operation?: string;
  table?: string;
  url?: string;
  key?: string;
  limit?: number;
  current?: number;
  resetTime?: Date;
  resourceOwnerId?: string;
  message?: string;
  promise?: string;
  role?: string;
  userRole?: string;
  code?: string;
  body?: any;
  skipSuccessful?: boolean;
  skipFailed?: boolean;
  requiredPermission?: string;
  requiredRole?: string;
  requiredRoles?: string[];
  userPermissions?: string[];
  // Дополнительные поля для ExternalSystemMapping
  mappingId?: string;
  externalSystem?: string;
  internalEntityType?: string;
  updates?: string[];
  updatedCount?: number;
  totalIds?: number;
  cleanedCount?: number;
  // Поля для external sync
  externalId?: string;
  entityType?: string;
  action?: string;
  hasData?: boolean;
  eventsCount?: number;
  stats?: any;
  systems?: any;
  overallHealth?: boolean;
  daysOld?: number;
  resolved?: boolean;
  alertId?: string;
  type?: string;
  system?: string;
  config?: any;
  removedCount?: number;
  options?: any;
  result?: any;
  internalEntityId?: string;
  total?: number;
  lastSync?: Date;
  // Поля для уведомлений
  notificationId?: string;
  channel?: string;
  resultCount?: number;
  count?: number;
  toDeleteCount?: number;
  deletedCount?: number;
}

// Функциональные типы для работы с данными
export type Predicate<T> = (value: T) => boolean;
export type Mapper<T, U> = (value: T) => U;
export type Reducer<T, U> = (accumulator: U, current: T) => U;
export type AsyncMapper<T, U> = (value: T) => Promise<U>;

// Типы для работы с репозиториями
export interface RepositoryOptions {
  include?: string[];
  exclude?: string[];
  relations?: string[];
}

export interface FindOptions extends RepositoryOptions {
  where?: Record<string, any>;
  orderBy?: Record<string, "asc" | "desc">;
  limit?: number;
  offset?: number;
}

// Экспорт всех типов
export * from "./api-types";
export * from "./functional-types";
