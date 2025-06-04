/**
 * Тесты для валидаторов бронирований
 */

import { describe, it, expect } from 'vitest';
import { BookingValidators } from '../../validators/bookings';

describe('BookingValidators', () => {
  describe('createBookingSchema', () => {
    it('должен валидировать корректное бронирование с endTime', () => {
      const validBooking = {
        courtId: '123e4567-e89b-12d3-a456-426614174000',
        startTime: '2024-01-15T10:00:00Z',
        endTime: '2024-01-15T11:30:00Z',
        totalAmount: 1500.00,
        currency: 'RUB',
        bookedByUserId: '123e4567-e89b-12d3-a456-426614174001',
        bookingPurpose: 'free_play' as const,
        notes: 'Игра с друзьями',
      };

      const result = BookingValidators.createBooking.safeParse(validBooking);
      expect(result.success).toBe(true);
    });

    it('должен валидировать корректное бронирование с durationMinutes', () => {
      const validBooking = {
        courtId: '123e4567-e89b-12d3-a456-426614174000',
        startTime: '2024-01-15T10:00:00Z',
        durationMinutes: 90,
        totalAmount: 1500.00,
        currency: 'RUB',
        bookedByUserId: '123e4567-e89b-12d3-a456-426614174001',
        bookingPurpose: 'private_training' as const,
      };

      const result = BookingValidators.createBooking.safeParse(validBooking);
      expect(result.success).toBe(true);
    });

    it('должен отклонять бронирование без endTime и durationMinutes', () => {
      const invalidBooking = {
        courtId: '123e4567-e89b-12d3-a456-426614174000',
        startTime: '2024-01-15T10:00:00Z',
        totalAmount: 1500.00,
        currency: 'RUB',
        bookedByUserId: '123e4567-e89b-12d3-a456-426614174001',
        bookingPurpose: 'free_play' as const,
      };

      const result = BookingValidators.createBooking.safeParse(invalidBooking);
      expect(result.success).toBe(false);
    });

    it('должен отклонять бронирование с некорректным временем', () => {
      const invalidBooking = {
        courtId: '123e4567-e89b-12d3-a456-426614174000',
        startTime: '2024-01-15T11:00:00Z',
        endTime: '2024-01-15T10:00:00Z', // endTime раньше startTime
        totalAmount: 1500.00,
        currency: 'RUB',
        bookedByUserId: '123e4567-e89b-12d3-a456-426614174001',
        bookingPurpose: 'free_play' as const,
      };

      const result = BookingValidators.createBooking.safeParse(invalidBooking);
      expect(result.success).toBe(false);
    });

    it('должен отклонять слишком короткую продолжительность', () => {
      const invalidBooking = {
        courtId: '123e4567-e89b-12d3-a456-426614174000',
        startTime: '2024-01-15T10:00:00Z',
        durationMinutes: 10, // меньше минимума в 15 минут
        totalAmount: 1500.00,
        currency: 'RUB',
        bookedByUserId: '123e4567-e89b-12d3-a456-426614174001',
        bookingPurpose: 'free_play' as const,
      };

      const result = BookingValidators.createBooking.safeParse(invalidBooking);
      expect(result.success).toBe(false);
    });

    it('должен отклонять отрицательную сумму', () => {
      const invalidBooking = {
        courtId: '123e4567-e89b-12d3-a456-426614174000',
        startTime: '2024-01-15T10:00:00Z',
        durationMinutes: 90,
        totalAmount: -100, // отрицательная сумма
        currency: 'RUB',
        bookedByUserId: '123e4567-e89b-12d3-a456-426614174001',
        bookingPurpose: 'free_play' as const,
      };

      const result = BookingValidators.createBooking.safeParse(invalidBooking);
      expect(result.success).toBe(false);
    });
  });

  describe('updateBookingSchema', () => {
    it('должен валидировать частичное обновление', () => {
      const updateData = {
        status: 'confirmed' as const,
        notes: 'Обновленные заметки',
      };

      const result = BookingValidators.updateBooking.safeParse(updateData);
      expect(result.success).toBe(true);
    });

    it('должен валидировать обновление времени', () => {
      const updateData = {
        startTime: '2024-01-15T11:00:00Z',
        endTime: '2024-01-15T12:30:00Z',
      };

      const result = BookingValidators.updateBooking.safeParse(updateData);
      expect(result.success).toBe(true);
    });

    it('должен отклонять некорректное время при обновлении', () => {
      const updateData = {
        startTime: '2024-01-15T12:00:00Z',
        endTime: '2024-01-15T11:00:00Z', // endTime раньше startTime
      };

      const result = BookingValidators.updateBooking.safeParse(updateData);
      expect(result.success).toBe(false);
    });
  });

  describe('searchBookingsSchema', () => {
    it('должен валидировать базовый поиск', () => {
      const searchData = {
        page: '1',
        limit: '10',
      };

      const result = BookingValidators.searchBookings.safeParse(searchData);
      expect(result.success).toBe(true);
    });

    it('должен валидировать поиск с фильтрами', () => {
      const searchData = {
        page: '1',
        limit: '20',
        courtId: '123e4567-e89b-12d3-a456-426614174000',
        status: 'confirmed' as const,
        bookingPurpose: 'free_play' as const,
        minAmount: 1000,
        maxAmount: 2000,
      };

      const result = BookingValidators.searchBookings.safeParse(searchData);
      expect(result.success).toBe(true);
    });

    it('должен валидировать поиск с диапазоном времени', () => {
      const searchData = {
        startTimeAfter: '2024-01-01T00:00:00Z',
        startTimeBefore: '2024-01-31T23:59:59Z',
        endTimeAfter: '2024-01-01T01:00:00Z',
        endTimeBefore: '2024-02-01T00:00:00Z',
      };

      const result = BookingValidators.searchBookings.safeParse(searchData);
      expect(result.success).toBe(true);
    });

    it('должен отклонять некорректный диапазон сумм', () => {
      const searchData = {
        minAmount: 2000,
        maxAmount: 1000, // минимум больше максимума
      };

      const result = BookingValidators.searchBookings.safeParse(searchData);
      expect(result.success).toBe(false);
    });
  });

  describe('cancelBookingSchema', () => {
    it('должен валидировать отмену с причиной', () => {
      const cancelData = {
        reason: 'Изменились планы',
        refundAmount: 1000.00,
      };

      const result = BookingValidators.cancelBooking.safeParse(cancelData);
      expect(result.success).toBe(true);
    });

    it('должен валидировать отмену без причины', () => {
      const cancelData = {};

      const result = BookingValidators.cancelBooking.safeParse(cancelData);
      expect(result.success).toBe(true);
    });

    it('должен отклонять отрицательную сумму возврата', () => {
      const cancelData = {
        refundAmount: -100,
      };

      const result = BookingValidators.cancelBooking.safeParse(cancelData);
      expect(result.success).toBe(false);
    });
  });

  describe('addBookingParticipantSchema', () => {
    it('должен валидировать корректного участника', () => {
      const participantData = {
        bookingId: '123e4567-e89b-12d3-a456-426614174000',
        userId: '123e4567-e89b-12d3-a456-426614174001',
        amountOwed: 750.00,
        amountPaid: 750.00,
        paymentStatus: 'success' as const,
        participationStatus: 'registered' as const,
        isHost: false,
      };

      const result = BookingValidators.addBookingParticipant.safeParse(participantData);
      expect(result.success).toBe(true);
    });

    it('должен валидировать участника с частичной оплатой', () => {
      const participantData = {
        bookingId: '123e4567-e89b-12d3-a456-426614174000',
        userId: '123e4567-e89b-12d3-a456-426614174001',
        amountOwed: 1000.00,
        amountPaid: 500.00,
        paymentStatus: 'partial' as const,
        participationStatus: 'registered' as const,
        isHost: true,
      };

      const result = BookingValidators.addBookingParticipant.safeParse(participantData);
      expect(result.success).toBe(true);
    });

    it('должен отклонять переплату', () => {
      const participantData = {
        bookingId: '123e4567-e89b-12d3-a456-426614174000',
        userId: '123e4567-e89b-12d3-a456-426614174001',
        amountOwed: 500.00,
        amountPaid: 1000.00, // больше чем должен
        paymentStatus: 'success' as const,
        participationStatus: 'registered' as const,
        isHost: false,
      };

      const result = BookingValidators.addBookingParticipant.safeParse(participantData);
      expect(result.success).toBe(false);
    });

    it('должен отклонять отрицательные суммы', () => {
      const participantData = {
        bookingId: '123e4567-e89b-12d3-a456-426614174000',
        userId: '123e4567-e89b-12d3-a456-426614174001',
        amountOwed: -100, // отрицательная сумма
        amountPaid: 0,
        paymentStatus: 'pending' as const,
        participationStatus: 'registered' as const,
        isHost: false,
      };

      const result = BookingValidators.addBookingParticipant.safeParse(participantData);
      expect(result.success).toBe(false);
    });
  });

  describe('updateBookingParticipantSchema', () => {
    it('должен валидировать частичное обновление участника', () => {
      const updateData = {
        paymentStatus: 'success' as const,
        participationStatus: 'attended' as const,
      };

      const result = BookingValidators.updateBookingParticipant.safeParse(updateData);
      expect(result.success).toBe(true);
    });

    it('должен валидировать обновление сумм', () => {
      const updateData = {
        amountOwed: 1000.00,
        amountPaid: 1000.00,
      };

      const result = BookingValidators.updateBookingParticipant.safeParse(updateData);
      expect(result.success).toBe(true);
    });

    it('должен отклонять переплату при обновлении', () => {
      const updateData = {
        amountOwed: 500.00,
        amountPaid: 1000.00,
      };

      const result = BookingValidators.updateBookingParticipant.safeParse(updateData);
      expect(result.success).toBe(false);
    });
  });

  describe('bookingParamsSchema', () => {
    it('должен валидировать корректный UUID бронирования', () => {
      const params = {
        bookingId: '123e4567-e89b-12d3-a456-426614174000',
      };

      const result = BookingValidators.bookingParams.safeParse(params);
      expect(result.success).toBe(true);
    });

    it('должен отклонять некорректный UUID', () => {
      const params = {
        bookingId: 'invalid-uuid',
      };

      const result = BookingValidators.bookingParams.safeParse(params);
      expect(result.success).toBe(false);
    });
  });
});
