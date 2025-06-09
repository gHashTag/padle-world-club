/**
 * Маршруты для Bookings API
 * Функциональный стиль с композицией middleware
 */

import { Router } from 'express';
import { validate } from '../middleware/validator';
import { authenticationMiddleware, requireAnyRole, UserRole } from '../middleware/auth';
import * as bookingHandlers from '../handlers/bookings';
import { BookingValidators } from '../validators/bookings';

/**
 * Создает маршруты для Bookings API
 * @returns Express Router с настроенными маршрутами
 */
export const createBookingRoutes = (): Router => {
  const router = Router();

  /**
   * POST /api/bookings - создание нового бронирования
   * Доступно всем аутентифицированным пользователям
   */
  router.post('/',
    authenticationMiddleware,
    validate.body(BookingValidators.createBooking),
    bookingHandlers.createBooking
  );

  /**
   * GET /api/bookings/:id - получение бронирования по ID
   * Доступно всем аутентифицированным пользователям
   */
  router.get('/:id',
    authenticationMiddleware,
    validate.params(BookingValidators.bookingParams),
    bookingHandlers.getBookingById
  );

  /**
   * PUT /api/bookings/:id - обновление бронирования
   * Доступно создателю бронирования, тренерам и администраторам
   */
  router.put('/:id',
    authenticationMiddleware,
    requireAnyRole([UserRole.ADMIN, UserRole.COACH]),
    validate.params(BookingValidators.bookingParams),
    validate.body(BookingValidators.updateBooking),
    bookingHandlers.updateBooking
  );

  /**
   * DELETE /api/bookings/:id - отмена бронирования
   * Доступно создателю бронирования, тренерам и администраторам
   */
  router.delete('/:id',
    authenticationMiddleware,
    requireAnyRole([UserRole.ADMIN, UserRole.COACH]),
    validate.params(BookingValidators.bookingParams),
    bookingHandlers.cancelBooking
  );

  /**
   * GET /api/bookings - список бронирований с фильтрацией
   * Доступно всем аутентифицированным пользователям
   */
  router.get('/',
    authenticationMiddleware,
    validate.query(BookingValidators.searchBookings),
    bookingHandlers.getBookings
  );

  /**
   * POST /api/bookings/:id/confirm - подтверждение бронирования
   * Доступно тренерам и администраторам
   */
  router.post('/:id/confirm',
    authenticationMiddleware,
    requireAnyRole([UserRole.ADMIN, UserRole.COACH]),
    validate.params(BookingValidators.bookingParams),
    validate.body(BookingValidators.confirmBooking),
    bookingHandlers.confirmBooking
  );

  // ===== МАРШРУТЫ ДЛЯ УЧАСТНИКОВ БРОНИРОВАНИЯ =====

  /**
   * GET /api/bookings/:id/participants - получение участников бронирования
   * Доступно всем аутентифицированным пользователям
   */
  router.get('/:id/participants',
    authenticationMiddleware,
    validate.params(BookingValidators.bookingParams),
    bookingHandlers.getBookingParticipants
  );

  /**
   * POST /api/bookings/:id/participants - добавление участника к бронированию
   * Доступно создателю бронирования, тренерам и администраторам
   */
  router.post('/:id/participants',
    authenticationMiddleware,
    requireAnyRole([UserRole.ADMIN, UserRole.COACH]),
    validate.params(BookingValidators.bookingParams),
    validate.body(BookingValidators.addBookingParticipant),
    bookingHandlers.addBookingParticipant
  );

  /**
   * PUT /api/bookings/:id/participants/:participantId - обновление участника бронирования
   * Доступно тренерам и администраторам
   */
  router.put('/:id/participants/:participantId',
    authenticationMiddleware,
    requireAnyRole([UserRole.ADMIN, UserRole.COACH]),
    validate.params(BookingValidators.participantParams),
    validate.body(BookingValidators.updateBookingParticipant),
    bookingHandlers.updateBookingParticipant
  );

  /**
   * DELETE /api/bookings/:id/participants/:participantId - удаление участника из бронирования
   * Доступно тренерам и администраторам
   */
  router.delete('/:id/participants/:participantId',
    authenticationMiddleware,
    requireAnyRole([UserRole.ADMIN, UserRole.COACH]),
    validate.params(BookingValidators.participantParams),
    bookingHandlers.removeBookingParticipant
  );

  return router;
};

/**
 * Экспорт для совместимости
 */
export default createBookingRoutes;
