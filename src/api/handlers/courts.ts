/**
 * Обработчики для Courts API
 * Функциональный стиль с композицией и чистыми функциями
 */

import { Request, Response } from 'express';
import { CourtRepository } from '../../repositories/court-repository';
import { VenueRepository } from '../../repositories/venue-repository';
import { BookingRepository } from '../../repositories/booking-repository';
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
const courtRepo = new CourtRepository(db);
const venueRepo = new VenueRepository(db);
const bookingRepo = new BookingRepository(db);

/**
 * Создание нового корта
 * POST /api/courts
 */
export const createCourt = async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info('Creating new court', { body: req.body } as any);

    const courtData = req.body;

    // Проверяем существование площадки
    const venue = await venueRepo.getById(courtData.venueId);
    if (!venue) {
      logger.warn('Venue not found', { venueId: courtData.venueId } as any);
      const response = createErrorResponse('Площадка не найдена');
      res.status(404).json(response);
      return;
    }

    // Проверяем, что площадка активна
    if (!venue.isActive) {
      logger.warn('Venue is not active', { venueId: courtData.venueId } as any);
      const response = createErrorResponse('Площадка неактивна');
      res.status(400).json(response);
      return;
    }

    const court = await courtRepo.create(courtData);

    logger.info('Court created successfully', { courtId: court.id } as any);
    const response = createSuccessResponse(court, 'Корт успешно создан');
    res.status(201).json(response);
  } catch (error) {
    logger.error('Error creating court', { error } as any);
    const response = createErrorResponse('Ошибка при создании корта', error);
    res.status(500).json(response);
  }
};

/**
 * Получение корта по ID
 * GET /api/courts/:id
 */
export const getCourtById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    logger.info('Getting court by ID', { courtId: id } as any);

    const court = await courtRepo.getById(id);

    if (!court) {
      logger.warn('Court not found', { courtId: id } as any);
      const response = createErrorResponse('Корт не найден');
      res.status(404).json(response);
      return;
    }

    logger.info('Court found', { courtId: id } as any);
    const response = createSuccessResponse(court);
    res.json(response);
  } catch (error) {
    logger.error('Error getting court', { error } as any);
    const response = createErrorResponse('Ошибка при получении корта', error);
    res.status(500).json(response);
  }
};

/**
 * Обновление корта
 * PUT /api/courts/:id
 */
export const updateCourt = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    logger.info('Updating court', { courtId: id, body: req.body } as any);

    // Проверяем существование корта
    const existingCourt = await courtRepo.getById(id);
    if (!existingCourt) {
      logger.warn('Court not found for update', { courtId: id } as any);
      const response = createErrorResponse('Корт не найден');
      res.status(404).json(response);
      return;
    }

    const updateData = req.body;
    const court = await courtRepo.update(id, updateData);

    if (!court) {
      logger.warn('Court not found after update', { courtId: id } as any);
      const response = createErrorResponse('Корт не найден');
      res.status(404).json(response);
      return;
    }

    logger.info('Court updated successfully', { courtId: id } as any);
    const response = createSuccessResponse(court, 'Корт успешно обновлен');
    res.json(response);
  } catch (error) {
    logger.error('Error updating court', { error } as any);
    const response = createErrorResponse('Ошибка при обновлении корта', error);
    res.status(500).json(response);
  }
};

/**
 * Удаление корта
 * DELETE /api/courts/:id
 */
export const deleteCourt = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    logger.info('Deleting court', { courtId: id } as any);

    // Проверяем существование корта
    const existingCourt = await courtRepo.getById(id);
    if (!existingCourt) {
      logger.warn('Court not found for deletion', { courtId: id } as any);
      const response = createErrorResponse('Корт не найден');
      res.status(404).json(response);
      return;
    }

    // Проверяем, есть ли активные бронирования
    const activeBookings = await bookingRepo.findActiveBookingsByCourtId(id);
    if (activeBookings.length > 0) {
      logger.warn('Cannot delete court with active bookings', {
        courtId: id,
        activeBookingsCount: activeBookings.length
      } as any);
      const response = createErrorResponse('Нельзя удалить корт с активными бронированиями');
      res.status(400).json(response);
      return;
    }

    const success = await courtRepo.delete(id);

    if (!success) {
      logger.warn('Failed to delete court', { courtId: id } as any);
      const response = createErrorResponse('Не удалось удалить корт');
      res.status(500).json(response);
      return;
    }

    logger.info('Court deleted successfully', { courtId: id } as any);
    const response = createSuccessResponse(null, 'Корт успешно удален');
    res.json(response);
  } catch (error) {
    logger.error('Error deleting court', { error } as any);
    const response = createErrorResponse('Ошибка при удалении корта', error);
    res.status(500).json(response);
  }
};

/**
 * Получение списка кортов с фильтрацией
 * GET /api/courts
 */
export const getCourts = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = req.query;
    logger.info('Getting courts list', { query } as any);

    // Извлекаем параметры пагинации и фильтрации
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const sortBy = (query.sortBy as string) || 'name';
    const sortOrder = (query.sortOrder as 'asc' | 'desc') || 'asc';

    // Фильтры (только существующие поля)
    const filters = {
      venueId: query.venueId as string,
      courtType: query.courtType as string,
      isActive: query.isActive ? Boolean(query.isActive) : undefined,
      minHourlyRate: query.minHourlyRate ? Number(query.minHourlyRate) : undefined,
      maxHourlyRate: query.maxHourlyRate ? Number(query.maxHourlyRate) : undefined,
      createdAfter: query.createdAfter as string,
      createdBefore: query.createdBefore as string,
      search: query.search as string,
    };

    const result = await courtRepo.findMany({
      page,
      limit,
      sortBy,
      sortOrder,
      ...filters
    });

    logger.info('Courts retrieved', { count: result.data.length, total: result.total } as any);
    const response = createSuccessResponse(result);
    res.json(response);
  } catch (error) {
    logger.error('Error getting courts', { error } as any);
    const response = createErrorResponse('Ошибка при получении списка кортов', error);
    res.status(500).json(response);
  }
};

/**
 * Получение кортов площадки
 * GET /api/courts/venue/:venueId
 */
export const getCourtsByVenue = async (req: Request, res: Response): Promise<void> => {
  try {
    const { venueId } = req.params;
    const query = req.query;
    logger.info('Getting courts by venue', { venueId, query } as any);

    // Проверяем существование площадки
    const venue = await venueRepo.getById(venueId);
    if (!venue) {
      logger.warn('Venue not found', { venueId } as any);
      const response = createErrorResponse('Площадка не найдена');
      res.status(404).json(response);
      return;
    }

    const courts = await courtRepo.getByVenueId(venueId);

    logger.info('Venue courts retrieved', { venueId, count: courts.length } as any);
    const response = createSuccessResponse(courts);
    res.json(response);
  } catch (error) {
    logger.error('Error getting venue courts', { error } as any);
    const response = createErrorResponse('Ошибка при получении кортов площадки', error);
    res.status(500).json(response);
  }
};



/**
 * Проверка доступности корта
 * GET /api/courts/:id/availability
 */
export const checkCourtAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { startTime, endTime, excludeBookingId } = req.query;

    logger.info('Checking court availability', {
      courtId: id,
      startTime,
      endTime,
      excludeBookingId
    } as any);

    // Проверяем существование корта
    const court = await courtRepo.getById(id);
    if (!court) {
      logger.warn('Court not found for availability check', { courtId: id } as any);
      const response = createErrorResponse('Корт не найден');
      res.status(404).json(response);
      return;
    }

    // Проверяем, что корт активен
    if (!court.isActive) {
      logger.info('Court not available due to inactive status', { courtId: id, isActive: court.isActive } as any);
      const response = createSuccessResponse({
        available: false,
        reason: 'Корт неактивен',
        court: {
          id: court.id,
          name: court.name,
          isActive: court.isActive
        }
      });
      res.json(response);
      return;
    }

    // Проверяем доступность по времени
    const isAvailable = await bookingRepo.isCourtAvailable(
      id,
      new Date(startTime as string),
      new Date(endTime as string),
      excludeBookingId as string
    );

    const result = {
      available: isAvailable,
      reason: isAvailable ? 'Корт доступен' : 'Корт занят в указанное время',
      court: {
        id: court.id,
        name: court.name,
        isActive: court.isActive,
        hourlyRate: court.hourlyRate
      },
      timeSlot: {
        startTime,
        endTime,
        duration: Math.round((new Date(endTime as string).getTime() - new Date(startTime as string).getTime()) / (1000 * 60)) // в минутах
      }
    };

    logger.info('Court availability checked', {
      courtId: id,
      available: isAvailable
    } as any);
    const response = createSuccessResponse(result);
    res.json(response);
  } catch (error) {
    logger.error('Error checking court availability', { error } as any);
    const response = createErrorResponse('Ошибка при проверке доступности корта', error);
    res.status(500).json(response);
  }
};

/**
 * Получение статистики корта
 * GET /api/courts/:id/stats
 */
export const getCourtStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    logger.info('Getting court statistics', { courtId: id } as any);

    // Проверяем существование корта
    const court = await courtRepo.getById(id);
    if (!court) {
      logger.warn('Court not found for stats', { courtId: id } as any);
      const response = createErrorResponse('Корт не найден');
      res.status(404).json(response);
      return;
    }

    // Получаем статистику использования корта
    const stats = await courtRepo.getCourtStats(id);

    logger.info('Court statistics retrieved', { courtId: id } as any);
    const response = createSuccessResponse({
      court: {
        id: court.id,
        name: court.name,
        isActive: court.isActive
      },
      ...stats
    });
    res.json(response);
  } catch (error) {
    logger.error('Error getting court statistics', { error } as any);
    const response = createErrorResponse('Ошибка при получении статистики корта', error);
    res.status(500).json(response);
  }
};
