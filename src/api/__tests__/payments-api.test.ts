/**
 * Тесты для Payments API
 */

import { describe, it, expect } from 'vitest';

describe('Payment Handlers', () => {
  it('должен экспортировать все необходимые функции', () => {
    // Простой тест на существование handlers
    const handlers = require('../handlers/payments');
    expect(typeof handlers.createPayment).toBe('function');
    expect(typeof handlers.getPaymentById).toBe('function');
    expect(typeof handlers.updatePayment).toBe('function');
    expect(typeof handlers.deletePayment).toBe('function');
    expect(typeof handlers.getPayments).toBe('function');
    expect(typeof handlers.updatePaymentStatus).toBe('function');
    expect(typeof handlers.refundPayment).toBe('function');
    expect(typeof handlers.getUserPayments).toBe('function');
    expect(typeof handlers.getPaymentStats).toBe('function');
    expect(typeof handlers.handlePaymentWebhook).toBe('function');
  });
});

describe('Payment Routes', () => {
  it('должен экспортировать функцию создания маршрутов', () => {
    const { createPaymentRoutes } = require('../routes/payments');
    expect(typeof createPaymentRoutes).toBe('function');
    
    const router = createPaymentRoutes();
    expect(router).toBeDefined();
  });
});

describe('Payment Validators', () => {
  it('должен экспортировать все валидаторы', () => {
    const validators = require('../validators/payments');
    expect(validators.PaymentValidators).toBeDefined();
    expect(validators.PaymentValidators.createPayment).toBeDefined();
    expect(validators.PaymentValidators.updatePayment).toBeDefined();
    expect(validators.PaymentValidators.searchPayments).toBeDefined();
    expect(validators.PaymentValidators.paymentParams).toBeDefined();
    expect(validators.PaymentValidators.updatePaymentStatus).toBeDefined();
    expect(validators.PaymentValidators.refundPayment).toBeDefined();
    expect(validators.PaymentValidators.paymentStats).toBeDefined();
    expect(validators.PaymentValidators.userPayments).toBeDefined();
    expect(validators.PaymentValidators.paymentWebhook).toBeDefined();
  });

  it('должен экспортировать enum для статусов и методов платежей', () => {
    const { paymentEnums } = require('../validators/payments');
    expect(paymentEnums).toBeDefined();
    expect(paymentEnums.paymentStatus).toBeDefined();
    expect(paymentEnums.paymentMethod).toBeDefined();
  });
});

describe('Payment API Integration', () => {
  it('должен правильно интегрироваться с основным приложением', () => {
    // Проверяем, что модуль app.ts загружается без ошибок
    const appModule = require('../app');
    expect(appModule).toBeDefined();
    // Проверяем, что Payment routes импортируется
    const paymentRoutes = require('../routes/payments');
    expect(typeof paymentRoutes.createPaymentRoutes).toBe('function');
  });
});

describe('Payment Repository Integration', () => {
  it('должен иметь доступ к методу findMany в PaymentRepository', () => {
    const { PaymentRepository } = require('../../repositories/payment-repository');
    expect(PaymentRepository).toBeDefined();
    
    // Проверяем, что класс имеет нужные методы
    const methods = Object.getOwnPropertyNames(PaymentRepository.prototype);
    expect(methods).toContain('findMany');
    expect(methods).toContain('create');
    expect(methods).toContain('getById');
    expect(methods).toContain('update');
    expect(methods).toContain('delete');
    expect(methods).toContain('getByUserId');
    expect(methods).toContain('getByStatus');
    expect(methods).toContain('getByPaymentMethod');
    expect(methods).toContain('getByGatewayTransactionId');
    expect(methods).toContain('getUserPaymentStats');
    expect(methods).toContain('getOverallStats');
    expect(methods).toContain('updateStatus');
  });
});

describe('Payment Validation Tests', () => {
  it('должен валидировать создание платежа', () => {
    const { PaymentValidators } = require('../validators/payments');
    
    const validPaymentData = {
      userId: '123e4567-e89b-12d3-a456-426614174000',
      amount: 50.00,
      currency: 'USD',
      status: 'pending',
      paymentMethod: 'card',
      description: 'Оплата за бронирование корта',
      relatedBookingParticipantId: '123e4567-e89b-12d3-a456-426614174001'
    };

    const result = PaymentValidators.createPayment.safeParse(validPaymentData);
    expect(result.success).toBe(true);
  });

  it('должен отклонить невалидные данные платежа', () => {
    const { PaymentValidators } = require('../validators/payments');
    
    const invalidPaymentData = {
      userId: 'invalid-uuid',
      amount: -10, // Отрицательная сумма
      currency: 'INVALID', // Неправильная валюта
      paymentMethod: 'invalid-method'
    };

    const result = PaymentValidators.createPayment.safeParse(invalidPaymentData);
    expect(result.success).toBe(false);
  });

  it('должен требовать ровно одну связь при создании платежа', () => {
    const { PaymentValidators } = require('../validators/payments');
    
    // Без связей
    const noRelationsData = {
      userId: '123e4567-e89b-12d3-a456-426614174000',
      amount: 50.00,
      currency: 'USD',
      paymentMethod: 'card'
    };

    const noRelationsResult = PaymentValidators.createPayment.safeParse(noRelationsData);
    expect(noRelationsResult.success).toBe(false);

    // Несколько связей
    const multipleRelationsData = {
      userId: '123e4567-e89b-12d3-a456-426614174000',
      amount: 50.00,
      currency: 'USD',
      paymentMethod: 'card',
      relatedBookingParticipantId: '123e4567-e89b-12d3-a456-426614174001',
      relatedOrderId: '123e4567-e89b-12d3-a456-426614174002'
    };

    const multipleRelationsResult = PaymentValidators.createPayment.safeParse(multipleRelationsData);
    expect(multipleRelationsResult.success).toBe(false);
  });

  it('должен валидировать параметры поиска платежей', () => {
    const { PaymentValidators } = require('../validators/payments');
    
    const validSearchParams = {
      page: '1',
      limit: '10',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      status: 'success',
      paymentMethod: 'card',
      currency: 'USD',
      minAmount: '10',
      maxAmount: '100'
    };

    const result = PaymentValidators.searchPayments.safeParse(validSearchParams);
    expect(result.success).toBe(true);
  });

  it('должен валидировать обновление статуса платежа', () => {
    const { PaymentValidators } = require('../validators/payments');
    
    const validStatusUpdate = {
      status: 'success',
      gatewayTransactionId: 'txn_123456789',
      description: 'Платеж успешно обработан'
    };

    const result = PaymentValidators.updatePaymentStatus.safeParse(validStatusUpdate);
    expect(result.success).toBe(true);
  });

  it('должен валидировать возврат платежа', () => {
    const { PaymentValidators } = require('../validators/payments');
    
    const validRefund = {
      amount: 25.00, // Частичный возврат
      reason: 'Отмена бронирования',
      gatewayTransactionId: 'refund_123456789'
    };

    const result = PaymentValidators.refundPayment.safeParse(validRefund);
    expect(result.success).toBe(true);
  });

  it('должен валидировать webhook данные', () => {
    const { PaymentValidators } = require('../validators/payments');
    
    const validWebhookData = {
      gatewayTransactionId: 'txn_123456789',
      status: 'success',
      amount: 50.00,
      currency: 'USD',
      gatewayData: {
        provider: 'stripe',
        chargeId: 'ch_123456789'
      },
      signature: 'webhook_signature_hash'
    };

    const result = PaymentValidators.paymentWebhook.safeParse(validWebhookData);
    expect(result.success).toBe(true);
  });
});

describe('Payment Enum Tests', () => {
  it('должен содержать правильные статусы платежей', () => {
    const { paymentEnums } = require('../validators/payments');
    
    const validStatuses = ['success', 'failed', 'pending', 'refunded', 'partial'];
    const statusEnum = paymentEnums.paymentStatus;
    
    validStatuses.forEach(status => {
      const result = statusEnum.safeParse(status);
      expect(result.success).toBe(true);
    });
  });

  it('должен содержать правильные методы платежей', () => {
    const { paymentEnums } = require('../validators/payments');
    
    const validMethods = ['card', 'cash', 'bank_transfer', 'bonus_points'];
    const methodEnum = paymentEnums.paymentMethod;
    
    validMethods.forEach(method => {
      const result = methodEnum.safeParse(method);
      expect(result.success).toBe(true);
    });
  });
});

describe('Payment Business Logic Tests', () => {
  it('должен правильно обрабатывать диапазоны сумм в поиске', () => {
    const { PaymentValidators } = require('../validators/payments');
    
    // Валидный диапазон
    const validRange = {
      minAmount: '10',
      maxAmount: '100'
    };

    const validResult = PaymentValidators.searchPayments.safeParse(validRange);
    expect(validResult.success).toBe(true);

    // Невалидный диапазон (min > max)
    const invalidRange = {
      minAmount: '100',
      maxAmount: '10'
    };

    const invalidResult = PaymentValidators.searchPayments.safeParse(invalidRange);
    expect(invalidResult.success).toBe(false);
  });

  it('должен правильно обрабатывать диапазоны дат в статистике', () => {
    const { PaymentValidators } = require('../validators/payments');
    
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    
    // Валидный диапазон дат
    const validDateRange = {
      startDate: yesterday.toISOString(),
      endDate: today.toISOString()
    };

    const validResult = PaymentValidators.paymentStats.safeParse(validDateRange);
    expect(validResult.success).toBe(true);

    // Невалидный диапазон дат (start > end)
    const invalidDateRange = {
      startDate: today.toISOString(),
      endDate: yesterday.toISOString()
    };

    const invalidResult = PaymentValidators.paymentStats.safeParse(invalidDateRange);
    expect(invalidResult.success).toBe(false);
  });
});
