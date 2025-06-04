/**
 * Venues API Handlers
 * Обработчики для управления площадками в функциональном стиле
 */

import { Request, Response } from 'express';
import { VenueRepository } from '../../repositories/venue-repository';
import { CourtRepository } from '../../repositories/court-repository';
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
const venueRepo = new VenueRepository(db);
const courtRepo = new CourtRepository(db);
const bookingRepo = new BookingRepository(db);

/**
 * POST /api/venues - создание площадки
 */
export const createVenue = async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info('Creating new venue', { body: req.body });

    const venueData = {
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const venue = await venueRepo.create(venueData);

    logger.info('Venue created successfully', { venueId: venue.id } as any);

    const response = createSuccessResponse(venue, 'Площадка создана успешно');
    res.status(201).json(response);
  } catch (error) {
    logger.error('Error creating venue', { error: error instanceof Error ? error.message : String(error) });
    const response = createErrorResponse('Ошибка при создании площадки');
    res.status(500).json(response);
  }
};

/**
 * GET /api/venues/:id - получение площадки по ID
 */
export const getVenueById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    logger.info('Getting venue by ID', { venueId: id } as any);

    const venue = await venueRepo.findById(id);

    if (!venue) {
      logger.warn('Venue not found', { venueId: id } as any);
      const response = createErrorResponse('Площадка не найдена');
      res.status(404).json(response);
      return;
    }

    logger.info('Venue found', { venueId: id } as any);
    const response = createSuccessResponse(venue);
    res.json(response);
  } catch (error) {
    logger.error('Error getting venue', { error: error instanceof Error ? error.message : String(error) });
    const response = createErrorResponse('Ошибка при получении площадки');
    res.status(500).json(response);
  }
};

/**
 * PUT /api/venues/:id - обновление площадки
 */
export const updateVenue = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    logger.info('Updating venue', { venueId: id, body: req.body } as any);

    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };

    const venue = await venueRepo.update(id, updateData);

    if (!venue) {
      logger.warn('Venue not found for update', { venueId: id } as any);
      const response = createErrorResponse('Площадка не найдена');
      res.status(404).json(response);
      return;
    }

    logger.info('Venue updated successfully', { venueId: id } as any);
    const response = createSuccessResponse(venue, 'Площадка обновлена успешно');
    res.json(response);
  } catch (error) {
    logger.error('Error updating venue', { error: error instanceof Error ? error.message : String(error) });
    const response = createErrorResponse('Ошибка при обновлении площадки');
    res.status(500).json(response);
  }
};

/**
 * DELETE /api/venues/:id - удаление площадки
 */
export const deleteVenue = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    logger.info('Deleting venue', { venueId: id } as any);

    const success = await venueRepo.delete(id);

    if (!success) {
      logger.warn('Venue not found for deletion', { venueId: id } as any);
      const response = createErrorResponse('Площадка не найдена');
      res.status(404).json(response);
      return;
    }

    logger.info('Venue deleted successfully', { venueId: id } as any);
    const response = createSuccessResponse(null, 'Площадка удалена успешно');
    res.json(response);
  } catch (error) {
    logger.error('Error deleting venue', { error: error instanceof Error ? error.message : String(error) });
    const response = createErrorResponse('Ошибка при удалении площадки');
    res.status(500).json(response);
  }
};

/**
 * GET /api/venues - список площадок с фильтрацией
 */
export const getVenues = async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info('Getting venues list', { query: req.query });

    const {
      page = 1,
      limit = 10,
      city,
      status,
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    const options = {
      page: Number(page),
      limit: Number(limit),
      city: city as string,
      status: status as string,
      sortBy: sortBy as string,
      sortOrder: sortOrder as 'asc' | 'desc'
    };

    const result = await venueRepo.findMany(options);

    logger.info('Venues retrieved', { count: result.data.length, total: result.total } as any);
    const response = createSuccessResponse(result);
    res.json(response);
  } catch (error) {
    logger.error('Error getting venues', { error: error instanceof Error ? error.message : String(error) });
    const response = createErrorResponse('Ошибка при получении списка площадок');
    res.status(500).json(response);
  }
};

/**
 * GET /api/venues/search/location - поиск по геолокации
 */
export const searchVenuesByLocation = async (req: Request, res: Response): Promise<void> => {
  try {
    const { latitude, longitude, radius = 10 } = req.query;
    logger.info('Searching venues by location', { latitude, longitude, radius } as any);

    const venues = await venueRepo.findByLocation(
      Number(latitude),
      Number(longitude),
      Number(radius)
    );

    logger.info('Location search completed', { count: venues.length } as any);
    const response = createSuccessResponse(venues);
    res.json(response);
  } catch (error) {
    logger.error('Error searching venues by location', { error: error instanceof Error ? error.message : String(error) });
    const response = createErrorResponse('Ошибка при поиске площадок по геолокации');
    res.status(500).json(response);
  }
};

/**
 * PUT /api/venues/:id/status - изменение статуса площадки
 */
export const updateVenueStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    logger.info('Updating venue status', { venueId: id, status } as any);

    const venue = await venueRepo.updateStatus(id, status);

    if (!venue) {
      logger.warn('Venue not found for status update', { venueId: id } as any);
      const response = createErrorResponse('Площадка не найдена');
      res.status(404).json(response);
      return;
    }

    logger.info('Venue status updated', { venueId: id, status } as any);
    const response = createSuccessResponse(venue, 'Статус площадки обновлен');
    res.json(response);
  } catch (error) {
    logger.error('Error updating venue status', { error: error instanceof Error ? error.message : String(error) });
    const response = createErrorResponse('Ошибка при обновлении статуса площадки');
    res.status(500).json(response);
  }
};

/**
 * GET /api/venues/:id/courts - получение кортов площадки
 */
export const getVenueCourts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    logger.info('Getting venue courts', { venueId: id } as any);

    const courts = await courtRepo.findByVenueId(id);

    logger.info('Venue courts retrieved', { venueId: id, count: courts.length } as any);
    const response = createSuccessResponse(courts);
    res.json(response);
  } catch (error) {
    logger.error('Error getting venue courts', { error: error instanceof Error ? error.message : String(error) });
    const response = createErrorResponse('Ошибка при получении кортов площадки');
    res.status(500).json(response);
  }
};

/**
 * GET /api/venues/:id/availability - проверка доступности площадки
 */
export const getVenueAvailability = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { date, startTime, endTime } = req.query;
    logger.info('Checking venue availability', { venueId: id, date, startTime, endTime } as any);

    // Получаем все корты площадки
    const courts = await courtRepo.findByVenueId(id);

    if (courts.length === 0) {
      const response = createSuccessResponse([], 'У площадки нет кортов');
      res.json(response);
      return;
    }

    // Проверяем доступность каждого корта
    const availability = await Promise.all(
      courts.map(async (court) => {
        const isAvailable = await bookingRepo.isCourtAvailable(
          court.id,
          date as string,
          startTime as string,
          endTime as string
        );
        return {
          courtId: court.id,
          courtName: court.name,
          isAvailable
        };
      })
    );

    logger.info('Venue availability checked', { venueId: id, availability } as any);
    const response = createSuccessResponse(availability);
    res.json(response);
  } catch (error) {
    logger.error('Error checking venue availability', { error: error instanceof Error ? error.message : String(error) });
    const response = createErrorResponse('Ошибка при проверке доступности площадки');
    res.status(500).json(response);
  }
};
