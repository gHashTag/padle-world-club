/**
 * Unit тесты для Bonus Transactions валидаторов
 */

import { describe, it, expect } from 'vitest';
import {
  createBonusTransactionSchema,
  updateBonusTransactionSchema,
  getUserTransactionsSchema,
  getTransactionsByTypeSchema,
  getTransactionsByDateRangeSchema,
  getUserBalanceSchema,
  getBalanceHistorySchema,
  getUserBonusSummarySchema,
  getExpiringBonusesSchema,
  idParamSchema
} from '../../validators/bonus-transactions';

describe('Bonus Transactions Validators', () => {
  describe('createBonusTransactionSchema', () => {
    it('должен валидировать корректные данные для создания транзакции', () => {
      const validData = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        transactionType: 'earned',
        pointsChange: 50,
        description: 'Участие в игре',
        relatedOrderId: '123e4567-e89b-12d3-a456-426614174001'
      };

      const result = createBonusTransactionSchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.userId).toBe(validData.userId);
        expect(result.data.transactionType).toBe(validData.transactionType);
        expect(result.data.pointsChange).toBe(validData.pointsChange);
      }
    });

    it('должен валидировать данные с expiresAt', () => {
      const validData = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        transactionType: 'earned',
        pointsChange: 100,
        description: 'Награда за турнир',
        expiresAt: '2024-12-31T23:59:59.000Z'
      };

      const result = createBonusTransactionSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('должен отклонить данные с неверным userId', () => {
      const invalidData = {
        userId: 'invalid-uuid',
        transactionType: 'earned',
        pointsChange: 50,
        description: 'Тест'
      };

      const result = createBonusTransactionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('должен отклонить данные с неверным типом', () => {
      const invalidData = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        transactionType: 'invalid_type',
        pointsChange: 50,
        description: 'Тест'
      };

      const result = createBonusTransactionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('должен отклонить отрицательные pointsChange', () => {
      const invalidData = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        transactionType: 'earned',
        pointsChange: -10,
        description: 'Тест'
      };

      const result = createBonusTransactionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('должен отклонить слишком длинное описание', () => {
      const invalidData = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        transactionType: 'earned',
        pointsChange: 50,
        description: 'a'.repeat(501) // больше 500 символов
      };

      const result = createBonusTransactionSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('updateBonusTransactionSchema', () => {
    it('должен валидировать корректные данные для обновления', () => {
      const validData = {
        description: 'Обновленное описание',
        metadata: {
          updated: true
        }
      };

      const result = updateBonusTransactionSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('должен валидировать пустой объект (все поля опциональные)', () => {
      const result = updateBonusTransactionSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it('должен отклонить попытку изменить userId (поле не поддерживается)', () => {
      const invalidData = {
        userId: '123e4567-e89b-12d3-a456-426614174000'
      };

      const result = updateBonusTransactionSchema.safeParse(invalidData);
      // В updateBonusTransactionSchema нет поля userId, поэтому оно будет проигнорировано
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).not.toHaveProperty('userId');
      }
    });
  });

  describe('getUserTransactionsSchema', () => {
    it('должен валидировать корректные параметры', () => {
      const validData = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        type: 'earned',
        limit: 10,
        offset: 0
      };

      const result = getUserTransactionsSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('должен валидировать только userId', () => {
      const validData = {
        userId: '123e4567-e89b-12d3-a456-426614174000'
      };

      const result = getUserTransactionsSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('должен отклонить отрицательный limit', () => {
      const invalidData = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        limit: -1
      };

      const result = getUserTransactionsSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('должен отклонить слишком большой limit', () => {
      const invalidData = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        limit: 1001
      };

      const result = getUserTransactionsSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('getTransactionsByTypeSchema', () => {
    it('должен валидировать корректный тип', () => {
      const validData = {
        type: 'spent',
        limit: 20,
        offset: 10
      };

      const result = getTransactionsByTypeSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('должен отклонить неверный тип', () => {
      const invalidData = {
        type: 'invalid_type'
      };

      const result = getTransactionsByTypeSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('getTransactionsByDateRangeSchema', () => {
    it('должен валидировать корректный диапазон дат', () => {
      const validData = {
        startDate: '2024-01-01T00:00:00.000Z',
        endDate: '2024-01-31T23:59:59.999Z',
        limit: 50,
        offset: 0
      };

      const result = getTransactionsByDateRangeSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('должен отклонить неверный формат даты', () => {
      const invalidData = {
        startDate: 'invalid-date',
        endDate: '2024-01-31'
      };

      const result = getTransactionsByDateRangeSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('getUserBalanceSchema', () => {
    it('должен валидировать корректный userId', () => {
      const validData = {
        userId: '123e4567-e89b-12d3-a456-426614174000'
      };

      const result = getUserBalanceSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('должен отклонить неверный UUID', () => {
      const invalidData = {
        userId: 'not-a-uuid'
      };

      const result = getUserBalanceSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('getBalanceHistorySchema', () => {
    it('должен валидировать корректные параметры', () => {
      const validData = {
        userId: '123e4567-e89b-12d3-a456-426614174000',
        limit: 25
      };

      const result = getBalanceHistorySchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('должен использовать значение по умолчанию для limit', () => {
      const validData = {
        userId: '123e4567-e89b-12d3-a456-426614174000'
      };

      const result = getBalanceHistorySchema.safeParse(validData);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.limit).toBe(20); // значение по умолчанию
      }
    });
  });

  describe('getUserBonusSummarySchema', () => {
    it('должен валидировать корректный userId', () => {
      const validData = {
        userId: '123e4567-e89b-12d3-a456-426614174000'
      };

      const result = getUserBonusSummarySchema.safeParse(validData);
      expect(result.success).toBe(true);
    });
  });

  describe('getExpiringBonusesSchema', () => {
    it('должен валидировать корректные параметры', () => {
      const validData = {
        daysAhead: 30
      };

      const result = getExpiringBonusesSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('должен использовать значение по умолчанию', () => {
      const result = getExpiringBonusesSchema.safeParse({});
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.daysAhead).toBe(30); // значение по умолчанию
      }
    });

    it('должен отклонить отрицательное значение', () => {
      const invalidData = {
        daysAhead: -1
      };

      const result = getExpiringBonusesSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('должен отклонить слишком большое значение', () => {
      const invalidData = {
        daysAhead: 366
      };

      const result = getExpiringBonusesSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });

  describe('idParamSchema', () => {
    it('должен валидировать корректный UUID', () => {
      const validData = {
        id: '123e4567-e89b-12d3-a456-426614174000'
      };

      const result = idParamSchema.safeParse(validData);
      expect(result.success).toBe(true);
    });

    it('должен отклонить неверный UUID', () => {
      const invalidData = {
        id: 'not-a-uuid'
      };

      const result = idParamSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });

    it('должен отклонить пустую строку', () => {
      const invalidData = {
        id: ''
      };

      const result = idParamSchema.safeParse(invalidData);
      expect(result.success).toBe(false);
    });
  });
});
