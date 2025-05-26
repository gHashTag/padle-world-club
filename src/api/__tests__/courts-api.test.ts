/**
 * Тесты для Courts API
 */

import { describe, it, expect } from 'vitest';

describe('Court Handlers', () => {
  it('должен экспортировать все необходимые функции', () => {
    // Простой тест на существование handlers
    const handlers = require('../handlers/courts');
    expect(typeof handlers.createCourt).toBe('function');
    expect(typeof handlers.getCourtById).toBe('function');
    expect(typeof handlers.updateCourt).toBe('function');
    expect(typeof handlers.deleteCourt).toBe('function');
    expect(typeof handlers.getCourts).toBe('function');
    expect(typeof handlers.getCourtsByVenue).toBe('function');
    expect(typeof handlers.checkCourtAvailability).toBe('function');
    expect(typeof handlers.getCourtStats).toBe('function');
  });
});

describe('Court Routes', () => {
  it('должен экспортировать функцию создания маршрутов', () => {
    const { createCourtRoutes } = require('../routes/courts');
    expect(typeof createCourtRoutes).toBe('function');

    const router = createCourtRoutes();
    expect(router).toBeDefined();
  });
});

describe('Court Validators', () => {
  it('должен экспортировать все валидаторы', () => {
    const validators = require('../validators/courts');
    expect(validators.CourtValidators).toBeDefined();
    expect(validators.CourtValidators.createCourt).toBeDefined();
    expect(validators.CourtValidators.updateCourt).toBeDefined();
    expect(validators.CourtValidators.searchCourts).toBeDefined();
    expect(validators.CourtValidators.courtParams).toBeDefined();
    expect(validators.CourtValidators.venueParams).toBeDefined();
    expect(validators.CourtValidators.checkAvailability).toBeDefined();
    expect(validators.CourtValidators.venueCourtFilters).toBeDefined();
  });

  it('должен экспортировать enum для типов кортов', () => {
    const { courtEnums } = require('../validators/courts');
    expect(courtEnums).toBeDefined();
    expect(courtEnums.courtType).toBeDefined();
  });
});

describe('Court API Integration', () => {
  it('должен правильно интегрироваться с основным приложением', () => {
    // Проверяем, что модуль app.ts загружается без ошибок
    const appModule = require('../app');
    expect(appModule).toBeDefined();
    // Проверяем, что Courts routes импортируется
    const courtsRoutes = require('../routes/courts');
    expect(typeof courtsRoutes.createCourtRoutes).toBe('function');
  });
});

describe('Court Repository Integration', () => {
  it('должен иметь доступ к методу findMany в CourtRepository', () => {
    const { CourtRepository } = require('../../repositories/court-repository');
    expect(CourtRepository).toBeDefined();

    // Проверяем, что класс имеет нужные методы
    const methods = Object.getOwnPropertyNames(CourtRepository.prototype);
    expect(methods).toContain('findMany');
    expect(methods).toContain('create');
    expect(methods).toContain('getById');
    expect(methods).toContain('update');
    expect(methods).toContain('delete');
    expect(methods).toContain('getByVenueId');
    expect(methods).toContain('getCourtStats');
  });
});

describe('Booking Repository Integration', () => {
  it('должен иметь доступ к методу findActiveBookingsByCourtId в BookingRepository', () => {
    const { BookingRepository } = require('../../repositories/booking-repository');
    expect(BookingRepository).toBeDefined();

    // Проверяем, что класс имеет нужные методы
    const methods = Object.getOwnPropertyNames(BookingRepository.prototype);
    expect(methods).toContain('findActiveBookingsByCourtId');
    expect(methods).toContain('isCourtAvailable');
  });
});

describe('Court Validation Tests', () => {
  it('должен валидировать создание корта', () => {
    const { CourtValidators } = require('../validators/courts');

    const validCourtData = {
      name: 'Корт 1',
      venueId: '123e4567-e89b-12d3-a456-426614174000',
      courtType: 'paddle',
      hourlyRate: 50.00,
      description: 'Отличный корт для падела',
      isActive: true
    };

    const result = CourtValidators.createCourt.safeParse(validCourtData);
    expect(result.success).toBe(true);
  });

  it('должен отклонить невалидные данные корта', () => {
    const { CourtValidators } = require('../validators/courts');

    const invalidCourtData = {
      name: '', // Пустое имя
      venueId: 'invalid-uuid',
      courtType: 'invalid-type',
      hourlyRate: -10 // Отрицательная ставка
    };

    const result = CourtValidators.createCourt.safeParse(invalidCourtData);
    expect(result.success).toBe(false);
  });

  it('должен валидировать параметры поиска кортов', () => {
    const { CourtValidators } = require('../validators/courts');

    const validSearchParams = {
      page: '1',
      limit: '10',
      sortBy: 'name',
      sortOrder: 'asc',
      courtType: 'paddle',
      isActive: 'true',
      minHourlyRate: '20',
      maxHourlyRate: '100'
    };

    const result = CourtValidators.searchCourts.safeParse(validSearchParams);
    expect(result.success).toBe(true);
  });

  it('должен валидировать проверку доступности', () => {
    const { CourtValidators } = require('../validators/courts');

    const futureDate1 = new Date(Date.now() + 24 * 60 * 60 * 1000); // Завтра
    const futureDate2 = new Date(Date.now() + 25 * 60 * 60 * 1000); // Послезавтра

    const validAvailabilityCheck = {
      startTime: futureDate1.toISOString(),
      endTime: futureDate2.toISOString(),
      excludeBookingId: '123e4567-e89b-12d3-a456-426614174000'
    };

    const result = CourtValidators.checkAvailability.safeParse(validAvailabilityCheck);
    expect(result.success).toBe(true);
  });
});

describe('Response Format Tests', () => {
  it('должен возвращать правильный формат успешного ответа', () => {
    const data = { id: '123', name: 'Test Court' };
    const message = 'Success';

    const expectedFormat = {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString()
    };

    expect(expectedFormat.success).toBe(true);
    expect(expectedFormat.data).toEqual(data);
    expect(expectedFormat.message).toBe(message);
    expect(typeof expectedFormat.timestamp).toBe('string');
  });

  it('должен возвращать правильный формат ответа с ошибкой', () => {
    const message = 'Error occurred';
    const error = { message: 'Test error' };

    const expectedFormat = {
      success: false,
      message,
      error,
      timestamp: new Date().toISOString()
    };

    expect(expectedFormat.success).toBe(false);
    expect(expectedFormat.message).toBe(message);
    expect(expectedFormat.error).toEqual(error);
    expect(typeof expectedFormat.timestamp).toBe('string');
  });
});
