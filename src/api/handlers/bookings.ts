/**
 * Обработчики для Bookings API
 * Функциональный стиль с композицией и чистыми функциями
 */

import { Request, Response } from 'express';
import { BookingRepository } from '../../repositories/booking-repository';
import { BookingParticipantRepository } from '../../repositories/booking-participant-repository';
import { CourtRepository } from '../../repositories/court-repository';
import { UserRepository } from '../../repositories/user-repository';
import { db } from '../../db';
import { logger } from '../middleware/logger';

// Вспомогательные функции для создания ответов
const createSuccessResponse = <T>(data: T, message?: string) => ({
  success: true,
  data,
  message,
  timestamp: new Date().toISOString()
});

const createErrorResponse = (message: string, error?: any) => ({
  success: false,
  message,
  error,
  timestamp: new Date().toISOString()
});

// Инициализация репозиториев
if (!db) {
  throw new Error('Database connection not available');
}
const bookingRepo = new BookingRepository(db);
const participantRepo = new BookingParticipantRepository(db);
const courtRepo = new CourtRepository(db);
const userRepo = new UserRepository(db);

/**
 * Создание нового бронирования
 * POST /api/bookings
 */
export const createBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info('Creating new booking', { body: req.body } as any);

    const bookingData = req.body;

    // Проверяем существование корта
    const court = await courtRepo.getById(bookingData.courtId);
    if (!court) {
      logger.warn('Court not found', { courtId: bookingData.courtId } as any);
      const response = createErrorResponse('Корт не найден');
      res.status(404).json(response);
      return;
    }

    // Проверяем существование пользователя
    const user = await userRepo.getById(bookingData.bookedByUserId);
    if (!user) {
      logger.warn('User not found', { userId: bookingData.bookedByUserId } as any);
      const response = createErrorResponse('Пользователь не найден');
      res.status(404).json(response);
      return;
    }

    // Вычисляем endTime или durationMinutes если не указаны
    let finalBookingData = { ...bookingData };

    if (!finalBookingData.endTime && finalBookingData.durationMinutes) {
      const startTime = new Date(finalBookingData.startTime);
      const endTime = new Date(startTime.getTime() + finalBookingData.durationMinutes * 60000);
      finalBookingData.endTime = endTime.toISOString();
    } else if (finalBookingData.endTime && !finalBookingData.durationMinutes) {
      const startTime = new Date(finalBookingData.startTime);
      const endTime = new Date(finalBookingData.endTime);
      finalBookingData.durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / 60000);
    }

    // Проверяем доступность корта
    const isAvailable = await bookingRepo.isCourtAvailable(
      finalBookingData.courtId,
      new Date(finalBookingData.startTime),
      new Date(finalBookingData.endTime)
    );

    if (!isAvailable) {
      logger.warn('Court not available', {
        courtId: finalBookingData.courtId,
        startTime: finalBookingData.startTime,
        endTime: finalBookingData.endTime
      } as any);
      const response = createErrorResponse('Корт недоступен в указанное время');
      res.status(409).json(response);
      return;
    }

    // Устанавливаем статус по умолчанию
    if (!finalBookingData.status) {
      finalBookingData.status = 'pending_payment';
    }

    const booking = await bookingRepo.create(finalBookingData);

    logger.info('Booking created successfully', { bookingId: booking.id } as any);
    const response = createSuccessResponse(booking, 'Бронирование успешно создано');
    res.status(201).json(response);
  } catch (error) {
    logger.error('Error creating booking', { error } as any);
    const response = createErrorResponse('Ошибка при создании бронирования', error);
    res.status(500).json(response);
  }
};

/**
 * Получение бронирования по ID
 * GET /api/bookings/:id
 */
export const getBookingById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    logger.info('Getting booking by ID', { bookingId: id } as any);

    const booking = await bookingRepo.getById(id);

    if (!booking) {
      logger.warn('Booking not found', { bookingId: id } as any);
      const response = createErrorResponse('Бронирование не найдено');
      res.status(404).json(response);
      return;
    }

    logger.info('Booking found', { bookingId: id } as any);
    const response = createSuccessResponse(booking);
    res.json(response);
  } catch (error) {
    logger.error('Error getting booking', { error } as any);
    const response = createErrorResponse('Ошибка при получении бронирования', error);
    res.status(500).json(response);
  }
};

/**
 * Обновление бронирования
 * PUT /api/bookings/:id
 */
export const updateBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    logger.info('Updating booking', { bookingId: id, body: req.body } as any);

    // Проверяем существование бронирования
    const existingBooking = await bookingRepo.getById(id);
    if (!existingBooking) {
      logger.warn('Booking not found for update', { bookingId: id } as any);
      const response = createErrorResponse('Бронирование не найдено');
      res.status(404).json(response);
      return;
    }

    const updateData = req.body;

    // Если изменяется время, проверяем доступность корта
    if (updateData.startTime || updateData.endTime || updateData.courtId) {
      const startTime = updateData.startTime ? new Date(updateData.startTime) : existingBooking.startTime;
      const endTime = updateData.endTime ? new Date(updateData.endTime) : existingBooking.endTime;
      const courtId = updateData.courtId || existingBooking.courtId;

      const isAvailable = await bookingRepo.isCourtAvailable(
        courtId,
        startTime,
        endTime,
        id // Исключаем текущее бронирование
      );

      if (!isAvailable) {
        logger.warn('Court not available for update', {
          courtId,
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString()
        } as any);
        const response = createErrorResponse('Корт недоступен в указанное время');
        res.status(409).json(response);
        return;
      }
    }

    const booking = await bookingRepo.update(id, updateData);

    if (!booking) {
      logger.warn('Booking not found after update', { bookingId: id } as any);
      const response = createErrorResponse('Бронирование не найдено');
      res.status(404).json(response);
      return;
    }

    logger.info('Booking updated successfully', { bookingId: id } as any);
    const response = createSuccessResponse(booking, 'Бронирование успешно обновлено');
    res.json(response);
  } catch (error) {
    logger.error('Error updating booking', { error } as any);
    const response = createErrorResponse('Ошибка при обновлении бронирования', error);
    res.status(500).json(response);
  }
};

/**
 * Отмена бронирования
 * DELETE /api/bookings/:id
 */
export const cancelBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    logger.info('Cancelling booking', { bookingId: id } as any);

    // Обновляем статус на cancelled вместо удаления
    const booking = await bookingRepo.update(id, { status: 'cancelled' });

    if (!booking) {
      logger.warn('Booking not found for cancellation', { bookingId: id } as any);
      const response = createErrorResponse('Бронирование не найдено');
      res.status(404).json(response);
      return;
    }

    logger.info('Booking cancelled successfully', { bookingId: id } as any);
    const response = createSuccessResponse(booking, 'Бронирование успешно отменено');
    res.json(response);
  } catch (error) {
    logger.error('Error cancelling booking', { error } as any);
    const response = createErrorResponse('Ошибка при отмене бронирования', error);
    res.status(500).json(response);
  }
};

/**
 * Получение списка бронирований с фильтрацией
 * GET /api/bookings
 */
export const getBookings = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = req.query;
    logger.info('Getting bookings list', { query } as any);

    // Извлекаем параметры пагинации и фильтрации
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const sortBy = (query.sortBy as string) || 'startTime';
    const sortOrder = (query.sortOrder as 'asc' | 'desc') || 'asc';

    // Фильтры
    const filters = {
      courtId: query.courtId as string,
      bookedByUserId: query.bookedByUserId as string,
      status: query.status as string,
      bookingPurpose: query.bookingPurpose as string,
      startTimeAfter: query.startTimeAfter as string,
      startTimeBefore: query.startTimeBefore as string,
    };

    const result = await bookingRepo.findMany({
      page,
      limit,
      sortBy,
      sortOrder,
      ...filters
    });

    logger.info('Bookings retrieved', { count: result.data.length, total: result.total } as any);
    const response = createSuccessResponse(result);
    res.json(response);
  } catch (error) {
    logger.error('Error getting bookings', { error } as any);
    const response = createErrorResponse('Ошибка при получении списка бронирований', error);
    res.status(500).json(response);
  }
};

/**
 * Получение участников бронирования
 * GET /api/bookings/:id/participants
 */
export const getBookingParticipants = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    logger.info('Getting booking participants', { bookingId: id } as any);

    // Проверяем существование бронирования
    const booking = await bookingRepo.getById(id);
    if (!booking) {
      logger.warn('Booking not found', { bookingId: id } as any);
      const response = createErrorResponse('Бронирование не найдено');
      res.status(404).json(response);
      return;
    }

    const participants = await participantRepo.getByBookingId(id);

    logger.info('Booking participants retrieved', { bookingId: id, count: participants.length } as any);
    const response = createSuccessResponse(participants);
    res.json(response);
  } catch (error) {
    logger.error('Error getting booking participants', { error } as any);
    const response = createErrorResponse('Ошибка при получении участников бронирования', error);
    res.status(500).json(response);
  }
};

/**
 * Добавление участника к бронированию
 * POST /api/bookings/:id/participants
 */
export const addBookingParticipant = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const participantData = { ...req.body, bookingId: id };

    logger.info('Adding booking participant', { bookingId: id, participantData } as any);

    // Проверяем существование бронирования
    const booking = await bookingRepo.getById(id);
    if (!booking) {
      logger.warn('Booking not found', { bookingId: id } as any);
      const response = createErrorResponse('Бронирование не найдено');
      res.status(404).json(response);
      return;
    }

    // Проверяем существование пользователя
    const user = await userRepo.getById(participantData.userId);
    if (!user) {
      logger.warn('User not found', { userId: participantData.userId } as any);
      const response = createErrorResponse('Пользователь не найден');
      res.status(404).json(response);
      return;
    }

    // Проверяем, не является ли пользователь уже участником
    const existingParticipant = await participantRepo.getByBookingAndUser(id, participantData.userId);
    if (existingParticipant) {
      logger.warn('User already participant', { bookingId: id, userId: participantData.userId } as any);
      const response = createErrorResponse('Пользователь уже является участником этого бронирования');
      res.status(409).json(response);
      return;
    }

    const participant = await participantRepo.create(participantData);

    logger.info('Booking participant added successfully', {
      bookingId: id,
      participantId: participant.id
    } as any);
    const response = createSuccessResponse(participant, 'Участник успешно добавлен к бронированию');
    res.status(201).json(response);
  } catch (error) {
    logger.error('Error adding booking participant', { error } as any);
    const response = createErrorResponse('Ошибка при добавлении участника к бронированию', error);
    res.status(500).json(response);
  }
};

/**
 * Обновление участника бронирования
 * PUT /api/bookings/:id/participants/:participantId
 */
export const updateBookingParticipant = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, participantId } = req.params;
    const updateData = req.body;

    logger.info('Updating booking participant', {
      bookingId: id,
      participantId,
      updateData
    } as any);

    // Проверяем существование участника
    const existingParticipant = await participantRepo.getById(participantId);
    if (!existingParticipant || existingParticipant.bookingId !== id) {
      logger.warn('Booking participant not found', { bookingId: id, participantId } as any);
      const response = createErrorResponse('Участник бронирования не найден');
      res.status(404).json(response);
      return;
    }

    const participant = await participantRepo.update(participantId, updateData);

    if (!participant) {
      logger.warn('Participant not found after update', { participantId } as any);
      const response = createErrorResponse('Участник не найден');
      res.status(404).json(response);
      return;
    }

    logger.info('Booking participant updated successfully', {
      bookingId: id,
      participantId
    } as any);
    const response = createSuccessResponse(participant, 'Участник бронирования успешно обновлен');
    res.json(response);
  } catch (error) {
    logger.error('Error updating booking participant', { error } as any);
    const response = createErrorResponse('Ошибка при обновлении участника бронирования', error);
    res.status(500).json(response);
  }
};

/**
 * Удаление участника из бронирования
 * DELETE /api/bookings/:id/participants/:participantId
 */
export const removeBookingParticipant = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id, participantId } = req.params;

    logger.info('Removing booking participant', { bookingId: id, participantId } as any);

    // Проверяем существование участника
    const existingParticipant = await participantRepo.getById(participantId);
    if (!existingParticipant || existingParticipant.bookingId !== id) {
      logger.warn('Booking participant not found', { bookingId: id, participantId } as any);
      const response = createErrorResponse('Участник бронирования не найден');
      res.status(404).json(response);
      return;
    }

    const success = await participantRepo.delete(participantId);

    if (!success) {
      logger.warn('Failed to remove participant', { participantId } as any);
      const response = createErrorResponse('Не удалось удалить участника');
      res.status(500).json(response);
      return;
    }

    logger.info('Booking participant removed successfully', {
      bookingId: id,
      participantId
    } as any);
    const response = createSuccessResponse(null, 'Участник успешно удален из бронирования');
    res.json(response);
  } catch (error) {
    logger.error('Error removing booking participant', { error } as any);
    const response = createErrorResponse('Ошибка при удалении участника из бронирования', error);
    res.status(500).json(response);
  }
};

/**
 * Подтверждение бронирования
 * POST /api/bookings/:id/confirm
 */
export const confirmBooking = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { paymentConfirmed, notes } = req.body;

    logger.info('Confirming booking', { bookingId: id, paymentConfirmed } as any);

    // Проверяем существование бронирования
    const existingBooking = await bookingRepo.getById(id);
    if (!existingBooking) {
      logger.warn('Booking not found for confirmation', { bookingId: id } as any);
      const response = createErrorResponse('Бронирование не найдено');
      res.status(404).json(response);
      return;
    }

    // Обновляем статус на confirmed
    const updateData: any = { status: 'confirmed' };
    if (notes) {
      updateData.notes = notes;
    }

    const booking = await bookingRepo.update(id, updateData);

    logger.info('Booking confirmed successfully', { bookingId: id } as any);
    const response = createSuccessResponse(booking, 'Бронирование успешно подтверждено');
    res.json(response);
  } catch (error) {
    logger.error('Error confirming booking', { error } as any);
    const response = createErrorResponse('Ошибка при подтверждении бронирования', error);
    res.status(500).json(response);
  }
};
