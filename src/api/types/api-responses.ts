/**
 * Типы ответов API в функциональном стиле
 */

import { Either } from './functional-types';

// Базовые типы ответов
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: ResponseMeta;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  field?: string;
}

export interface ResponseMeta {
  timestamp: string;
  requestId?: string;
  pagination?: PaginationMeta;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Типы для списков с пагинацией
export interface PaginatedResponse<T> {
  items: T[];
  meta: PaginationMeta;
}

// Функциональные типы для обработки ответов
export type ApiResult<T> = Either<ApiError, T>;

// Утилиты для создания ответов
export const createSuccessResponse = <T>(
  data: T,
  meta?: Partial<ResponseMeta>
): ApiResponse<T> => ({
  success: true,
  data,
  meta: {
    timestamp: new Date().toISOString(),
    ...meta,
  },
});

export const createErrorResponse = (
  error: ApiError,
  meta?: Partial<ResponseMeta>
): ApiResponse<never> => ({
  success: false,
  error,
  meta: {
    timestamp: new Date().toISOString(),
    ...meta,
  },
});

export const createPaginatedResponse = <T>(
  items: T[],
  pagination: PaginationMeta,
  meta?: Partial<ResponseMeta>
): ApiResponse<PaginatedResponse<T>> => ({
  success: true,
  data: {
    items,
    meta: pagination,
  },
  meta: {
    timestamp: new Date().toISOString(),
    ...meta,
  },
});

// Коды ошибок
export const ErrorCodes = {
  // Общие ошибки
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  CONFLICT: 'CONFLICT',
  
  // Ошибки пользователей
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  USER_ALREADY_EXISTS: 'USER_ALREADY_EXISTS',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  USERNAME_ALREADY_EXISTS: 'USERNAME_ALREADY_EXISTS',
  
  // Ошибки площадок
  VENUE_NOT_FOUND: 'VENUE_NOT_FOUND',
  VENUE_ALREADY_EXISTS: 'VENUE_ALREADY_EXISTS',
  
  // Ошибки бронирований
  BOOKING_NOT_FOUND: 'BOOKING_NOT_FOUND',
  BOOKING_CONFLICT: 'BOOKING_CONFLICT',
  BOOKING_CANCELLED: 'BOOKING_CANCELLED',
  
  // Ошибки аутентификации
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  REFRESH_TOKEN_INVALID: 'REFRESH_TOKEN_INVALID',
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

// Фабрики для создания стандартных ошибок
export const createApiError = (
  code: ErrorCode,
  message: string,
  details?: Record<string, any>,
  field?: string
): ApiError => ({
  code,
  message,
  details,
  field,
});

export const createValidationError = (
  field: string,
  message: string,
  details?: Record<string, any>
): ApiError => ({
  code: ErrorCodes.VALIDATION_ERROR,
  message,
  field,
  details,
});

export const createNotFoundError = (
  resource: string,
  id?: string
): ApiError => ({
  code: ErrorCodes.NOT_FOUND,
  message: `${resource} not found${id ? ` with id: ${id}` : ''}`,
  details: { resource, id },
});

export const createConflictError = (
  resource: string,
  field: string,
  value: string
): ApiError => ({
  code: ErrorCodes.CONFLICT,
  message: `${resource} with ${field} '${value}' already exists`,
  field,
  details: { resource, field, value },
});

export const createUnauthorizedError = (
  message: string = 'Unauthorized access'
): ApiError => ({
  code: ErrorCodes.UNAUTHORIZED,
  message,
});

export const createForbiddenError = (
  message: string = 'Access forbidden'
): ApiError => ({
  code: ErrorCodes.FORBIDDEN,
  message,
});

// Типы для специфичных ответов пользователей
export interface UserResponse {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  memberId: string;
  userRole: string;
  currentRating: number;
  bonusPoints: number;
  profileImageUrl?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  homeVenueId?: string | null;
  isAccountVerified: boolean;
  lastLoginAt?: string | null;
  lastActivityAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: UserResponse;
  token: string;
  refreshToken?: string;
  expiresAt: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  memberId: string;
  userRole?: string;
  gender?: string;
  dateOfBirth?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}
