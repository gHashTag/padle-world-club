/**
 * Обработчики для пользователей в функциональном стиле
 */

import { Request, Response } from 'express';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '../../repositories/user-repository';
import { UserValidators } from '../validators/users';
import {
  createSuccessResponse,
  createErrorResponse,
  createPaginatedResponse,
  createApiError,
  createNotFoundError,
  createConflictError,
  ErrorCodes,
  UserResponse,
  AuthResponse,
  PaginationMeta
} from '../types/api-responses';


// Типы для обработчиков
interface UserHandlerDependencies {
  userRepository: UserRepository;
}

// Утилиты для работы с пользователями
const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, 12);
};

const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

const mapUserToResponse = (user: any): UserResponse => ({
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
});

// Функциональные обработчики
export const createUserHandlers = (deps: UserHandlerDependencies) => {
  const { userRepository } = deps;

  /**
   * Создание пользователя
   * POST /api/users
   */
  const createUser = async (req: Request, res: Response): Promise<void> => {
    try {
      // Валидация входных данных
      const validation = UserValidators.createUser.safeParse(req.body);
      if (!validation.success) {
        const error = createApiError(
          ErrorCodes.VALIDATION_ERROR,
          'Invalid user data',
          { issues: validation.error.issues }
        );
        res.status(400).json(createErrorResponse(error));
        return;
      }

      const userData = validation.data;

      // Проверка уникальности username
      const existingUserByUsername = await userRepository.getByUsername(userData.username);
      if (existingUserByUsername) {
        const error = createConflictError('User', 'username', userData.username);
        res.status(409).json(createErrorResponse(error));
        return;
      }

      // Проверка уникальности email
      const existingUserByEmail = await userRepository.getByEmail(userData.email);
      if (existingUserByEmail) {
        const error = createConflictError('User', 'email', userData.email);
        res.status(409).json(createErrorResponse(error));
        return;
      }

      // Хеширование пароля
      const passwordHash = await hashPassword(userData.password);

      // Создание пользователя
      const newUser = await userRepository.create({
        ...userData,
        passwordHash,
        // Удаляем пароль из данных
        password: undefined,
      } as any);

      const userResponse = mapUserToResponse(newUser);
      res.status(201).json(createSuccessResponse(userResponse));

    } catch (error) {
      console.error('Error creating user:', error);
      const apiError = createApiError(
        ErrorCodes.INTERNAL_ERROR,
        'Failed to create user'
      );
      res.status(500).json(createErrorResponse(apiError));
    }
  };

  /**
   * Получение пользователя по ID
   * GET /api/users/:id
   */
  const getUserById = async (req: Request, res: Response): Promise<void> => {
    try {
      // Валидация параметров
      const validation = UserValidators.userParams.safeParse(req.params);
      if (!validation.success) {
        const error = createApiError(
          ErrorCodes.VALIDATION_ERROR,
          'Invalid user ID',
          { issues: validation.error.issues }
        );
        res.status(400).json(createErrorResponse(error));
        return;
      }

      const { userId } = validation.data;

      // Получение пользователя
      const user = await userRepository.getById(userId);
      if (!user) {
        const error = createNotFoundError('User', userId);
        res.status(404).json(createErrorResponse(error));
        return;
      }

      const userResponse = mapUserToResponse(user);
      res.json(createSuccessResponse(userResponse));

    } catch (error) {
      console.error('Error getting user:', error);
      const apiError = createApiError(
        ErrorCodes.INTERNAL_ERROR,
        'Failed to get user'
      );
      res.status(500).json(createErrorResponse(apiError));
    }
  };

  /**
   * Обновление пользователя
   * PUT /api/users/:id
   */
  const updateUser = async (req: Request, res: Response): Promise<void> => {
    try {
      // Валидация параметров
      const paramsValidation = UserValidators.userParams.safeParse(req.params);
      if (!paramsValidation.success) {
        const error = createApiError(
          ErrorCodes.VALIDATION_ERROR,
          'Invalid user ID',
          { issues: paramsValidation.error.issues }
        );
        res.status(400).json(createErrorResponse(error));
        return;
      }

      // Валидация данных для обновления
      const bodyValidation = UserValidators.updateUser.safeParse(req.body);
      if (!bodyValidation.success) {
        const error = createApiError(
          ErrorCodes.VALIDATION_ERROR,
          'Invalid update data',
          { issues: bodyValidation.error.issues }
        );
        res.status(400).json(createErrorResponse(error));
        return;
      }

      const { userId } = paramsValidation.data;
      const updateData = bodyValidation.data;

      // Проверка существования пользователя
      const existingUser = await userRepository.getById(userId);
      if (!existingUser) {
        const error = createNotFoundError('User', userId);
        res.status(404).json(createErrorResponse(error));
        return;
      }

      // Подготовка данных для обновления
      let finalUpdateData: any = { ...updateData };

      // Хеширование пароля, если он предоставлен
      if (updateData.password) {
        finalUpdateData.passwordHash = await hashPassword(updateData.password);
        delete finalUpdateData.password;
      }

      // Обновление пользователя
      const updatedUser = await userRepository.update(userId, finalUpdateData);
      if (!updatedUser) {
        const error = createApiError(
          ErrorCodes.INTERNAL_ERROR,
          'Failed to update user'
        );
        res.status(500).json(createErrorResponse(error));
        return;
      }

      const userResponse = mapUserToResponse(updatedUser);
      res.json(createSuccessResponse(userResponse));

    } catch (error) {
      console.error('Error updating user:', error);
      const apiError = createApiError(
        ErrorCodes.INTERNAL_ERROR,
        'Failed to update user'
      );
      res.status(500).json(createErrorResponse(apiError));
    }
  };

  /**
   * Удаление пользователя
   * DELETE /api/users/:id
   */
  const deleteUser = async (req: Request, res: Response): Promise<void> => {
    try {
      // Валидация параметров
      const validation = UserValidators.userParams.safeParse(req.params);
      if (!validation.success) {
        const error = createApiError(
          ErrorCodes.VALIDATION_ERROR,
          'Invalid user ID',
          { issues: validation.error.issues }
        );
        res.status(400).json(createErrorResponse(error));
        return;
      }

      const { userId } = validation.data;

      // Проверка существования пользователя
      const existingUser = await userRepository.getById(userId);
      if (!existingUser) {
        const error = createNotFoundError('User', userId);
        res.status(404).json(createErrorResponse(error));
        return;
      }

      // Удаление пользователя
      const deleted = await userRepository.delete(userId);
      if (!deleted) {
        const error = createApiError(
          ErrorCodes.INTERNAL_ERROR,
          'Failed to delete user'
        );
        res.status(500).json(createErrorResponse(error));
        return;
      }

      res.status(204).send();

    } catch (error) {
      console.error('Error deleting user:', error);
      const apiError = createApiError(
        ErrorCodes.INTERNAL_ERROR,
        'Failed to delete user'
      );
      res.status(500).json(createErrorResponse(apiError));
    }
  };

  /**
   * Получение списка пользователей с фильтрацией
   * GET /api/users
   */
  const getUsers = async (req: Request, res: Response): Promise<void> => {
    try {
      // Валидация параметров поиска
      const validation = UserValidators.searchUsers.safeParse(req.query);
      if (!validation.success) {
        const error = createApiError(
          ErrorCodes.VALIDATION_ERROR,
          'Invalid search parameters',
          { issues: validation.error.issues }
        );
        res.status(400).json(createErrorResponse(error));
        return;
      }

      const searchParams = validation.data;

      // Пока используем простой getAll, позже добавим фильтрацию
      const users = await userRepository.getAll();

      // Применяем базовую пагинацию
      const page = parseInt(String(searchParams.page || '1'));
      const limit = parseInt(String(searchParams.limit || '10'));
      const offset = (page - 1) * limit;

      const paginatedUsers = users.slice(offset, offset + limit);
      const total = users.length;
      const totalPages = Math.ceil(total / limit);

      const paginationMeta: PaginationMeta = {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      };

      const userResponses = paginatedUsers.map(mapUserToResponse);
      res.json(createPaginatedResponse(userResponses, paginationMeta));

    } catch (error) {
      console.error('Error getting users:', error);
      const apiError = createApiError(
        ErrorCodes.INTERNAL_ERROR,
        'Failed to get users'
      );
      res.status(500).json(createErrorResponse(apiError));
    }
  };

  /**
   * Вход в систему
   * POST /api/auth/login
   */
  const login = async (req: Request, res: Response): Promise<void> => {
    try {
      // Валидация данных входа
      const validation = UserValidators.login.safeParse(req.body);
      if (!validation.success) {
        const error = createApiError(
          ErrorCodes.VALIDATION_ERROR,
          'Invalid login data',
          { issues: validation.error.issues }
        );
        res.status(400).json(createErrorResponse(error));
        return;
      }

      const { username, password } = validation.data;

      // Поиск пользователя
      const user = await userRepository.getByUsername(username);
      if (!user) {
        const error = createApiError(
          ErrorCodes.INVALID_CREDENTIALS,
          'Invalid username or password'
        );
        res.status(401).json(createErrorResponse(error));
        return;
      }

      // Проверка пароля
      const isPasswordValid = await comparePassword(password, user.passwordHash);
      if (!isPasswordValid) {
        const error = createApiError(
          ErrorCodes.INVALID_CREDENTIALS,
          'Invalid username or password'
        );
        res.status(401).json(createErrorResponse(error));
        return;
      }

      // Обновление времени последнего входа
      await userRepository.update(user.id, {
        lastLoginAt: new Date(),
        lastActivityAt: new Date(),
      });

      // Создание ответа (пока без JWT токена)
      const userResponse = mapUserToResponse(user);
      const authResponse: AuthResponse = {
        user: userResponse,
        token: 'mock-jwt-token', // TODO: Реализовать JWT
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 часа
      };

      res.json(createSuccessResponse(authResponse));

    } catch (error) {
      console.error('Error during login:', error);
      const apiError = createApiError(
        ErrorCodes.INTERNAL_ERROR,
        'Login failed'
      );
      res.status(500).json(createErrorResponse(apiError));
    }
  };

  /**
   * Регистрация пользователя
   * POST /api/auth/register
   */
  const register = async (req: Request, res: Response): Promise<void> => {
    try {
      // Валидация данных регистрации
      const validation = UserValidators.createUser.safeParse(req.body);
      if (!validation.success) {
        const error = createApiError(
          ErrorCodes.VALIDATION_ERROR,
          'Invalid registration data',
          { issues: validation.error.issues }
        );
        res.status(400).json(createErrorResponse(error));
        return;
      }

      const userData = validation.data;

      // Проверка уникальности username
      const existingUserByUsername = await userRepository.getByUsername(userData.username);
      if (existingUserByUsername) {
        const error = createConflictError('User', 'username', userData.username);
        res.status(409).json(createErrorResponse(error));
        return;
      }

      // Проверка уникальности email
      const existingUserByEmail = await userRepository.getByEmail(userData.email);
      if (existingUserByEmail) {
        const error = createConflictError('User', 'email', userData.email);
        res.status(409).json(createErrorResponse(error));
        return;
      }

      // Хеширование пароля
      const passwordHash = await hashPassword(userData.password);

      // Создание пользователя
      const newUser = await userRepository.create({
        ...userData,
        passwordHash,
        userRole: userData.userRole || 'player',
        password: undefined,
      } as any);

      // Создание ответа
      const userResponse = mapUserToResponse(newUser);
      const authResponse: AuthResponse = {
        user: userResponse,
        token: 'mock-jwt-token', // TODO: Реализовать JWT
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      };

      res.status(201).json(createSuccessResponse(authResponse));

    } catch (error) {
      console.error('Error during registration:', error);
      const apiError = createApiError(
        ErrorCodes.INTERNAL_ERROR,
        'Registration failed'
      );
      res.status(500).json(createErrorResponse(apiError));
    }
  };

  return {
    createUser,
    getUserById,
    updateUser,
    deleteUser,
    getUsers,
    login,
    register,
  };
};
