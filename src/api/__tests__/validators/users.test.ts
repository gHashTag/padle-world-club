/**
 * Тесты для валидаторов пользователей
 */

import { describe, it, expect } from 'vitest';
import { UserValidators } from '../../validators/users';

describe('UserValidators', () => {
  describe('createUserSchema', () => {
    it('должен валидировать корректные данные пользователя', () => {
      const validUser = {
        username: 'testuser',
        password: 'TestPass123',
        firstName: 'Иван',
        lastName: 'Иванов',
        email: 'test@example.com',
        phone: '+79123456789',
        memberId: 'MEMBER001',
        userRole: 'player' as const,
        currentRating: 1500,
        bonusPoints: 0,
        profileImageUrl: 'https://example.com/avatar.jpg',
        gender: 'male' as const,
        dateOfBirth: '1990-01-01',
        homeVenueId: '123e4567-e89b-12d3-a456-426614174000',
        isAccountVerified: false,
      };

      const result = UserValidators.createUser.safeParse(validUser);
      expect(result.success).toBe(true);
    });

    it('должен отклонять некорректный username', () => {
      const invalidUser = {
        username: 'ab', // слишком короткий
        password: 'TestPass123',
        firstName: 'Иван',
        lastName: 'Иванов',
        email: 'test@example.com',
        memberId: 'MEMBER001',
        userRole: 'player' as const,
      };

      const result = UserValidators.createUser.safeParse(invalidUser);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('username');
      }
    });

    it('должен отклонять некорректный email', () => {
      const invalidUser = {
        username: 'testuser',
        password: 'TestPass123',
        firstName: 'Иван',
        lastName: 'Иванов',
        email: 'invalid-email',
        memberId: 'MEMBER001',
        userRole: 'player' as const,
      };

      const result = UserValidators.createUser.safeParse(invalidUser);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('email');
      }
    });

    it('должен отклонять слабый пароль', () => {
      const invalidUser = {
        username: 'testuser',
        password: 'weak', // не соответствует требованиям
        firstName: 'Иван',
        lastName: 'Иванов',
        email: 'test@example.com',
        memberId: 'MEMBER001',
        userRole: 'player' as const,
      };

      const result = UserValidators.createUser.safeParse(invalidUser);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('password');
      }
    });

    it('должен отклонять некорректный телефон', () => {
      const invalidUser = {
        username: 'testuser',
        password: 'TestPass123',
        firstName: 'Иван',
        lastName: 'Иванов',
        email: 'test@example.com',
        phone: '123', // некорректный формат
        memberId: 'MEMBER001',
        userRole: 'player' as const,
      };

      const result = UserValidators.createUser.safeParse(invalidUser);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('phone');
      }
    });

    it('должен отклонять некорректный рейтинг', () => {
      const invalidUser = {
        username: 'testuser',
        password: 'TestPass123',
        firstName: 'Иван',
        lastName: 'Иванов',
        email: 'test@example.com',
        memberId: 'MEMBER001',
        userRole: 'player' as const,
        currentRating: -100, // отрицательный рейтинг
      };

      const result = UserValidators.createUser.safeParse(invalidUser);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('currentRating');
      }
    });
  });

  describe('updateUserSchema', () => {
    it('должен валидировать частичное обновление', () => {
      const updateData = {
        firstName: 'Петр',
        currentRating: 1600,
      };

      const result = UserValidators.updateUser.safeParse(updateData);
      expect(result.success).toBe(true);
    });

    it('должен валидировать обновление пароля', () => {
      const updateData = {
        password: 'NewPass123',
      };

      const result = UserValidators.updateUser.safeParse(updateData);
      expect(result.success).toBe(true);
    });

    it('должен отклонять некорректный новый пароль', () => {
      const updateData = {
        password: 'weak',
      };

      const result = UserValidators.updateUser.safeParse(updateData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('password');
      }
    });
  });

  describe('loginSchema', () => {
    it('должен валидировать корректные данные входа', () => {
      const loginData = {
        username: 'testuser',
        password: 'TestPass123',
      };

      const result = UserValidators.login.safeParse(loginData);
      expect(result.success).toBe(true);
    });

    it('должен отклонять пустые данные', () => {
      const loginData = {
        username: '',
        password: '',
      };

      const result = UserValidators.login.safeParse(loginData);
      expect(result.success).toBe(false);
    });
  });

  describe('changePasswordSchema', () => {
    it('должен валидировать корректную смену пароля', () => {
      const changeData = {
        currentPassword: 'OldPass123',
        newPassword: 'NewPass123',
        confirmPassword: 'NewPass123',
      };

      const result = UserValidators.changePassword.safeParse(changeData);
      expect(result.success).toBe(true);
    });

    it('должен отклонять несовпадающие пароли', () => {
      const changeData = {
        currentPassword: 'OldPass123',
        newPassword: 'NewPass123',
        confirmPassword: 'DifferentPass123',
      };

      const result = UserValidators.changePassword.safeParse(changeData);
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].path).toContain('confirmPassword');
      }
    });
  });

  describe('searchUsersSchema', () => {
    it('должен валидировать базовый поиск', () => {
      const searchData = {
        page: '1',
        limit: '10',
        search: 'test',
      };

      const result = UserValidators.searchUsers.safeParse(searchData);
      expect(result.success).toBe(true);
    });

    it('должен валидировать поиск с фильтрами', () => {
      const searchData = {
        page: '1',
        limit: '10',
        userRole: 'player' as const,
        isAccountVerified: true,
        minRating: 1000,
        maxRating: 2000,
      };

      const result = UserValidators.searchUsers.safeParse(searchData);
      expect(result.success).toBe(true);
    });

    it('должен отклонять некорректный диапазон рейтинга', () => {
      const searchData = {
        minRating: 2000,
        maxRating: 1000, // минимум больше максимума
      };

      const result = UserValidators.searchUsers.safeParse(searchData);
      expect(result.success).toBe(false);
    });
  });

  describe('userAccountLinkSchema', () => {
    it('должен валидировать корректную связь аккаунта', () => {
      const linkData = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        platform: 'telegram' as const,
        platformUserId: 'telegram123',
        isPrimary: false,
      };

      const result = UserValidators.createUserAccountLink.safeParse(linkData);
      expect(result.success).toBe(true);
    });

    it('должен отклонять пустой platformUserId', () => {
      const linkData = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        platform: 'telegram' as const,
        platformUserId: '',
        isPrimary: false,
      };

      const result = UserValidators.createUserAccountLink.safeParse(linkData);
      expect(result.success).toBe(false);
    });
  });

  describe('userParamsSchema', () => {
    it('должен валидировать корректный UUID пользователя', () => {
      const params = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = UserValidators.userParams.safeParse(params);
      expect(result.success).toBe(true);
    });

    it('должен отклонять некорректный UUID', () => {
      const params = {
        userId: 'invalid-uuid',
      };

      const result = UserValidators.userParams.safeParse(params);
      expect(result.success).toBe(false);
    });
  });
});
