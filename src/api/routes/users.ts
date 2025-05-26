/**
 * Маршруты для пользователей в функциональном стиле
 */

import { Router } from 'express';
import { createUserHandlers } from '../handlers/users';
import { UserRepository } from '../../repositories/user-repository';
import { createValidationMiddleware } from '../middleware/validator';
import { authenticationMiddleware, requireAnyRole, UserRole } from '../middleware/auth';
import { UserValidators } from '../validators/users';

// Типы для конфигурации маршрутов
interface UserRoutesConfig {
  userRepository: UserRepository;
}

/**
 * Создает маршруты для пользователей
 */
export const createUserRoutes = (config: UserRoutesConfig): Router => {
  const router = Router();
  const { userRepository } = config;

  // Создание обработчиков
  const handlers = createUserHandlers({ userRepository });

  // ===== ПУБЛИЧНЫЕ МАРШРУТЫ (без аутентификации) =====

  /**
   * POST /api/auth/register
   * Регистрация нового пользователя
   */
  router.post(
    '/auth/register',
    createValidationMiddleware({
      body: UserValidators.createUser,
    }),
    handlers.register
  );

  /**
   * POST /api/auth/login
   * Вход в систему
   */
  router.post(
    '/auth/login',
    createValidationMiddleware({
      body: UserValidators.login,
    }),
    handlers.login
  );

  // ===== ЗАЩИЩЕННЫЕ МАРШРУТЫ (требуют аутентификации) =====

  /**
   * GET /api/users
   * Получение списка пользователей с фильтрацией
   * Требует аутентификации
   */
  router.get(
    '/users',
    authenticationMiddleware,
    createValidationMiddleware({
      query: UserValidators.searchUsers,
    }),
    handlers.getUsers
  );

  /**
   * POST /api/users
   * Создание нового пользователя
   * Требует роль admin или club_staff
   */
  router.post(
    '/users',
    authenticationMiddleware,
    requireAnyRole([UserRole.ADMIN]),
    createValidationMiddleware({
      body: UserValidators.createUser,
    }),
    handlers.createUser
  );

  /**
   * GET /api/users/:userId
   * Получение пользователя по ID
   * Требует аутентификации
   */
  router.get(
    '/users/:userId',
    authenticationMiddleware,
    createValidationMiddleware({
      params: UserValidators.userParams,
    }),
    handlers.getUserById
  );

  /**
   * PUT /api/users/:userId
   * Обновление пользователя
   * Требует роль admin, club_staff или быть владельцем аккаунта
   */
  router.put(
    '/users/:userId',
    authenticationMiddleware,
    createValidationMiddleware({
      params: UserValidators.userParams,
      body: UserValidators.updateUser,
    }),
    // Middleware для проверки прав доступа
    (req, res, next) => {
      const { userId } = req.params;
      const currentUser = req.user;

      // Админы могут редактировать любого пользователя
      if (currentUser?.role === UserRole.ADMIN) {
        return next();
      }

      // Пользователи могут редактировать только свой профиль
      if (currentUser?.id === userId) {
        return next();
      }

      // Иначе доступ запрещен
      res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Access denied. You can only edit your own profile.',
        },
      });
    },
    handlers.updateUser
  );

  /**
   * DELETE /api/users/:userId
   * Удаление пользователя
   * Требует роль admin
   */
  router.delete(
    '/users/:userId',
    authenticationMiddleware,
    requireAnyRole([UserRole.ADMIN]),
    createValidationMiddleware({
      params: UserValidators.userParams,
    }),
    handlers.deleteUser
  );

  // ===== ДОПОЛНИТЕЛЬНЫЕ МАРШРУТЫ =====

  /**
   * POST /api/auth/change-password
   * Смена пароля текущего пользователя
   */
  router.post(
    '/auth/change-password',
    authenticationMiddleware,
    createValidationMiddleware({
      body: UserValidators.changePassword,
    }),
    async (_req, res) => {
      // TODO: Реализовать смену пароля
      res.status(501).json({
        success: false,
        error: {
          code: 'NOT_IMPLEMENTED',
          message: 'Change password functionality not implemented yet',
        },
      });
    }
  );

  /**
   * POST /api/auth/logout
   * Выход из системы
   */
  router.post(
    '/auth/logout',
    authenticationMiddleware,
    async (_req, res) => {
      // TODO: Реализовать выход из системы (инвалидация токена)
      res.json({
        success: true,
        data: {
          message: 'Successfully logged out',
        },
      });
    }
  );

  /**
   * GET /api/auth/me
   * Получение информации о текущем пользователе
   */
  router.get(
    '/auth/me',
    authenticationMiddleware,
    async (req, res) => {
      try {
        const currentUser = req.user;
        if (!currentUser) {
          res.status(401).json({
            success: false,
            error: {
              code: 'UNAUTHORIZED',
              message: 'User not authenticated',
            },
          });
          return;
        }

        // Получаем полную информацию о пользователе из БД
        const user = await userRepository.getById(currentUser.id);
        if (!user) {
          res.status(404).json({
            success: false,
            error: {
              code: 'USER_NOT_FOUND',
              message: 'User not found',
            },
          });
          return;
        }

        // Маппинг пользователя в ответ (без пароля)
        const userResponse = {
          id: user.id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          memberId: user.memberId,
          userRole: user.userRole,
          currentRating: user.currentRating,
          bonusPoints: user.bonusPoints,
          profileImageUrl: user.profileImageUrl,
          gender: user.gender,
          dateOfBirth: user.dateOfBirth,
          homeVenueId: user.homeVenueId,
          isAccountVerified: user.isAccountVerified,
          lastLoginAt: user.lastLoginAt,
          lastActivityAt: user.lastActivityAt,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
        };

        res.json({
          success: true,
          data: userResponse,
          meta: {
            timestamp: new Date().toISOString(),
          },
        });

      } catch (error) {
        console.error('Error getting current user:', error);
        res.status(500).json({
          success: false,
          error: {
            code: 'INTERNAL_ERROR',
            message: 'Failed to get user information',
          },
        });
      }
    }
  );

  return router;
};
