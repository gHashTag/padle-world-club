/**
 * Unit тесты для Bonus Transactions handlers
 */

import { describe, it, expect } from 'vitest';

describe('Bonus Transactions Handlers', () => {
  it('должен экспортировать все необходимые функции', async () => {
    const handlers = await import('../../handlers/bonus-transactions');

    expect(handlers.createBonusTransaction).toBeDefined();
    expect(handlers.getBonusTransactionById).toBeDefined();
    expect(handlers.getUserBonusTransactions).toBeDefined();
    expect(handlers.getUserBonusBalance).toBeDefined();
    expect(handlers.getUserBalanceHistory).toBeDefined();
    expect(handlers.getUserBonusSummary).toBeDefined();
    expect(handlers.getBonusTransactionsByType).toBeDefined();
    expect(handlers.getBonusTransactionsByDateRange).toBeDefined();
    expect(handlers.getExpiringBonuses).toBeDefined();
    expect(handlers.getExpiredBonuses).toBeDefined();
    expect(handlers.updateBonusTransaction).toBeDefined();
    expect(handlers.deleteBonusTransaction).toBeDefined();
    expect(handlers.getBonusStats).toBeDefined();
  });

  it('должен иметь корректные типы функций', async () => {
    const handlers = await import('../../handlers/bonus-transactions');

    expect(typeof handlers.createBonusTransaction).toBe('function');
    expect(typeof handlers.getBonusTransactionById).toBe('function');
    expect(typeof handlers.getUserBonusTransactions).toBe('function');
    expect(typeof handlers.getUserBonusBalance).toBe('function');
    expect(typeof handlers.getUserBalanceHistory).toBe('function');
    expect(typeof handlers.getUserBonusSummary).toBe('function');
    expect(typeof handlers.getBonusTransactionsByType).toBe('function');
    expect(typeof handlers.getBonusTransactionsByDateRange).toBe('function');
    expect(typeof handlers.getExpiringBonuses).toBe('function');
    expect(typeof handlers.getExpiredBonuses).toBe('function');
    expect(typeof handlers.updateBonusTransaction).toBe('function');
    expect(typeof handlers.deleteBonusTransaction).toBeDefined();
    expect(typeof handlers.getBonusStats).toBe('function');
  });

  it('должен импортировать валидаторы', async () => {
    const validators = await import('../../validators/bonus-transactions');

    expect(validators.createBonusTransactionSchema).toBeDefined();
    expect(validators.updateBonusTransactionSchema).toBeDefined();
    expect(validators.getUserTransactionsSchema).toBeDefined();
    expect(validators.getTransactionsByTypeSchema).toBeDefined();
    expect(validators.getTransactionsByDateRangeSchema).toBeDefined();
    expect(validators.getUserBalanceSchema).toBeDefined();
    expect(validators.getBalanceHistorySchema).toBeDefined();
    expect(validators.getUserBonusSummarySchema).toBeDefined();
    expect(validators.getExpiringBonusesSchema).toBeDefined();
    expect(validators.idParamSchema).toBeDefined();
  });

});
