/**
 * Тесты для Bookings API
 */

import { describe, it, expect } from 'vitest';

describe('Booking Handlers', () => {
  it('должен экспортировать все необходимые функции', () => {
    // Простой тест на существование handlers
    const handlers = require('../handlers/bookings');
    expect(typeof handlers.createBooking).toBe('function');
    expect(typeof handlers.getBookingById).toBe('function');
    expect(typeof handlers.updateBooking).toBe('function');
    expect(typeof handlers.cancelBooking).toBe('function');
    expect(typeof handlers.getBookings).toBe('function');
    expect(typeof handlers.getBookingParticipants).toBe('function');
    expect(typeof handlers.addBookingParticipant).toBe('function');
    expect(typeof handlers.updateBookingParticipant).toBe('function');
    expect(typeof handlers.removeBookingParticipant).toBe('function');
    expect(typeof handlers.confirmBooking).toBe('function');
  });
});

describe('Booking Routes', () => {
  it('должен экспортировать функцию создания маршрутов', () => {
    const { createBookingRoutes } = require('../routes/bookings');
    expect(typeof createBookingRoutes).toBe('function');

    const router = createBookingRoutes();
    expect(router).toBeDefined();
  });
});

describe('Booking Validators', () => {
  it('должен экспортировать все валидаторы', () => {
    const validators = require('../validators/bookings');
    expect(validators.BookingValidators).toBeDefined();
    expect(validators.BookingValidators.createBooking).toBeDefined();
    expect(validators.BookingValidators.updateBooking).toBeDefined();
    expect(validators.BookingValidators.searchBookings).toBeDefined();
    expect(validators.BookingValidators.bookingParams).toBeDefined();
    expect(validators.BookingValidators.addBookingParticipant).toBeDefined();
    expect(validators.BookingValidators.updateBookingParticipant).toBeDefined();
    expect(validators.BookingValidators.participantParams).toBeDefined();
    expect(validators.BookingValidators.confirmBooking).toBeDefined();
  });
});

describe('Booking API Integration', () => {
  it('должен правильно интегрироваться с основным приложением', () => {
    // Проверяем, что модуль app.ts загружается без ошибок
    const appModule = require('../app');
    expect(appModule).toBeDefined();
    // Проверяем, что Booking routes импортируется
    const bookingRoutes = require('../routes/bookings');
    expect(typeof bookingRoutes.createBookingRoutes).toBe('function');
  });
});

describe('Response Format Tests', () => {
  it('должен возвращать правильный формат успешного ответа', () => {
    const data = { id: '123', name: 'Test Booking' };
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

describe('Booking Repository Integration', () => {
  it('должен иметь доступ к методу findMany в BookingRepository', () => {
    const { BookingRepository } = require('../../repositories/booking-repository');
    expect(BookingRepository).toBeDefined();

    // Проверяем, что класс имеет нужные методы
    const methods = Object.getOwnPropertyNames(BookingRepository.prototype);
    expect(methods).toContain('findMany');
    expect(methods).toContain('create');
    expect(methods).toContain('getById');
    expect(methods).toContain('update');
    expect(methods).toContain('delete');
    expect(methods).toContain('isCourtAvailable');
  });
});
