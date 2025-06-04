/**
 * Middleware для аутентификации и авторизации в функциональном стиле
 */

import { Request, Response, NextFunction } from 'express';
import { MiddlewareFunction } from '../types';
import { UnauthorizedError, ForbiddenError } from './error-handler';
import { logger } from './logger';

// Типы для аутентификации
export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
  isActive: boolean;
  lastLoginAt?: Date;
}

export enum UserRole {
  ADMIN = 'admin',
  COACH = 'coach',
  PLAYER = 'player',
  GUEST = 'guest',
}

export enum Permission {
  // Пользователи
  USER_READ = 'user:read',
  USER_WRITE = 'user:write',
  USER_DELETE = 'user:delete',

  // Площадки
  VENUE_READ = 'venue:read',
  VENUE_WRITE = 'venue:write',
  VENUE_DELETE = 'venue:delete',

  // Корты
  COURT_READ = 'court:read',
  COURT_WRITE = 'court:write',
  COURT_DELETE = 'court:delete',

  // Бронирования
  BOOKING_READ = 'booking:read',
  BOOKING_WRITE = 'booking:write',
  BOOKING_DELETE = 'booking:delete',
  BOOKING_READ_ALL = 'booking:read:all',

  // Платежи
  PAYMENT_READ = 'payment:read',
  PAYMENT_WRITE = 'payment:write',
  PAYMENT_READ_ALL = 'payment:read:all',

  // Турниры
  TOURNAMENT_READ = 'tournament:read',
  TOURNAMENT_WRITE = 'tournament:write',
  TOURNAMENT_DELETE = 'tournament:delete',

  // Администрирование
  ADMIN_PANEL = 'admin:panel',
  SYSTEM_CONFIG = 'system:config',
}

// Расширение типа Request для добавления пользователя
declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}

// Роли и их разрешения
const rolePermissions: Record<UserRole, Permission[]> = {
  [UserRole.ADMIN]: [
    // Все разрешения
    ...Object.values(Permission),
  ],
  [UserRole.COACH]: [
    Permission.USER_READ,
    Permission.VENUE_READ,
    Permission.COURT_READ,
    Permission.BOOKING_READ,
    Permission.BOOKING_WRITE,
    Permission.BOOKING_READ_ALL,
    Permission.PAYMENT_READ,
    Permission.TOURNAMENT_READ,
    Permission.TOURNAMENT_WRITE,
  ],
  [UserRole.PLAYER]: [
    Permission.USER_READ,
    Permission.VENUE_READ,
    Permission.COURT_READ,
    Permission.BOOKING_READ,
    Permission.BOOKING_WRITE,
    Permission.PAYMENT_READ,
    Permission.TOURNAMENT_READ,
  ],
  [UserRole.GUEST]: [
    Permission.VENUE_READ,
    Permission.COURT_READ,
    Permission.TOURNAMENT_READ,
  ],
};

// Функция для получения разрешений по роли
const getPermissionsByRole = (role: UserRole): Permission[] => {
  return rolePermissions[role] || [];
};

// Функция для проверки разрешения
const hasPermission = (user: AuthUser, permission: Permission): boolean => {
  return user.permissions.includes(permission);
};

// Функция для проверки роли
const hasRole = (user: AuthUser, role: UserRole): boolean => {
  return user.role === role;
};

// Функция для проверки нескольких ролей
const hasAnyRole = (user: AuthUser, roles: UserRole[]): boolean => {
  return roles.includes(user.role);
};

// Заглушка для извлечения пользователя из токена
// В реальном приложении здесь будет JWT или другая система аутентификации
const extractUserFromToken = async (token: string): Promise<AuthUser | null> => {
  // Заглушка - в реальности здесь будет проверка JWT токена
  if (token === 'admin-token') {
    return {
      id: '1',
      username: 'admin',
      email: 'admin@example.com',
      role: UserRole.ADMIN,
      permissions: getPermissionsByRole(UserRole.ADMIN),
      isActive: true,
      lastLoginAt: new Date(),
    };
  }

  if (token === 'player-token') {
    return {
      id: '2',
      username: 'player',
      email: 'player@example.com',
      role: UserRole.PLAYER,
      permissions: getPermissionsByRole(UserRole.PLAYER),
      isActive: true,
      lastLoginAt: new Date(),
    };
  }

  // Для E2E тестов: поддержка mock-jwt-token с данными пользователя
  if (token.startsWith('mock-jwt-token:')) {
    // Парсим токен формата: mock-jwt-token:userId:userRole
    const parts = token.split(':');
    if (parts.length >= 3) {
      const userId = parts[1];
      const userRole = parts[2] as UserRole;

      return {
        id: userId,
        username: `user-${userId}`,
        email: `user-${userId}@test.com`,
        role: userRole,
        permissions: getPermissionsByRole(userRole),
        isActive: true,
        lastLoginAt: new Date(),
      };
    }
  }

  // Для E2E тестов: поддержка старого формата mock-jwt-token
  if (token === 'mock-jwt-token') {
    // Возвращаем пользователя с правами admin для E2E тестов
    // Используем валидный UUID формат
    return {
      id: '00000000-0000-0000-0000-000000000001',
      username: 'mock-user',
      email: 'mock@test.com',
      role: UserRole.ADMIN,
      permissions: getPermissionsByRole(UserRole.ADMIN),
      isActive: true,
      lastLoginAt: new Date(),
    };
  }

  return null;
};

// Функция для извлечения токена из запроса
const extractToken = (req: Request): string | null => {
  // Проверяем Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Проверяем query параметр (не рекомендуется для продакшена)
  if (req.query.token && typeof req.query.token === 'string') {
    return req.query.token;
  }

  // Проверяем cookie (если используются)
  if (req.cookies && req.cookies.token) {
    return req.cookies.token;
  }

  return null;
};

// Основной middleware для аутентификации
export const authenticationMiddleware: MiddlewareFunction = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const token = extractToken(req);

    if (!token) {
      throw new UnauthorizedError('Токен аутентификации не предоставлен');
    }

    const user = await extractUserFromToken(token);

    if (!user) {
      throw new UnauthorizedError('Недействительный токен аутентификации');
    }

    if (!user.isActive) {
      throw new UnauthorizedError('Аккаунт пользователя деактивирован');
    }

    // Добавляем пользователя в запрос
    req.user = user;

    // Логируем успешную аутентификацию
    logger.info('User authenticated', {
      requestId: req.headers['x-request-id'] as string,
      userId: user.id,
      username: user.username,
      role: user.role,
      method: req.method,
      path: req.path,
      timestamp: new Date().toISOString(),
    });

    next();
  } catch (error) {
    next(error);
  }
};

// Middleware для проверки разрешений
export const requirePermission = (permission: Permission): MiddlewareFunction => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('Пользователь не аутентифицирован');
    }

    if (!hasPermission(req.user, permission)) {
      logger.warn('Permission denied', {
        requestId: req.headers['x-request-id'] as string,
        userId: req.user.id,
        username: req.user.username,
        role: req.user.role,
        requiredPermission: permission,
        userPermissions: req.user.permissions,
        method: req.method,
        path: req.path,
        timestamp: new Date().toISOString(),
      });

      throw new ForbiddenError(`Недостаточно прав для выполнения действия: ${permission}`);
    }

    next();
  };
};

// Middleware для проверки роли
export const requireRole = (role: UserRole): MiddlewareFunction => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('Пользователь не аутентифицирован');
    }

    if (!hasRole(req.user, role)) {
      logger.warn('Role access denied', {
        requestId: req.headers['x-request-id'] as string,
        userId: req.user.id,
        username: req.user.username,
        userRole: req.user.role,
        requiredRole: role,
        method: req.method,
        path: req.path,
        timestamp: new Date().toISOString(),
      });

      throw new ForbiddenError(`Требуется роль: ${role}`);
    }

    next();
  };
};

// Middleware для проверки нескольких ролей
export const requireAnyRole = (roles: UserRole[]): MiddlewareFunction => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError('Пользователь не аутентифицирован');
    }

    if (!hasAnyRole(req.user, roles)) {
      logger.warn('Multiple roles access denied', {
        requestId: req.headers['x-request-id'] as string,
        userId: req.user.id,
        username: req.user.username,
        userRole: req.user.role,
        requiredRoles: roles,
        method: req.method,
        path: req.path,
        timestamp: new Date().toISOString(),
      });

      throw new ForbiddenError(`Требуется одна из ролей: ${roles.join(', ')}`);
    }

    next();
  };
};

// Middleware для проверки владельца ресурса
export const requireOwnership = (getResourceOwnerId: (req: Request) => string | Promise<string>): MiddlewareFunction => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new UnauthorizedError('Пользователь не аутентифицирован');
      }

      // Администраторы могут получить доступ к любому ресурсу
      if (req.user.role === UserRole.ADMIN) {
        return next();
      }

      const resourceOwnerId = await getResourceOwnerId(req);

      if (req.user.id !== resourceOwnerId) {
        logger.warn('Ownership access denied', {
          requestId: req.headers['x-request-id'] as string,
          userId: req.user.id,
          resourceOwnerId,
          method: req.method,
          path: req.path,
          timestamp: new Date().toISOString(),
        });

        throw new ForbiddenError('Доступ разрешен только владельцу ресурса');
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

// Опциональная аутентификация (не выбрасывает ошибку если токена нет)
export const optionalAuthMiddleware: MiddlewareFunction = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const token = extractToken(req);

    if (token) {
      const user = await extractUserFromToken(token);
      if (user && user.isActive) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    // Игнорируем ошибки аутентификации для опционального middleware
    next();
  }
};

// Утилиты для работы с аутентификацией
export const authUtils = {
  hasPermission,
  hasRole,
  hasAnyRole,
  getPermissionsByRole,
  extractToken,
  extractUserFromToken,
};

// Экспорт всех утилит
export const Auth = {
  middleware: authenticationMiddleware,
  optional: optionalAuthMiddleware,
  requirePermission,
  requireRole,
  requireAnyRole,
  requireOwnership,
  utils: authUtils,
  types: {
    UserRole,
    Permission,
  },
};
