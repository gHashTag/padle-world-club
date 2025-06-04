/**
 * Venues API Routes
 * Маршруты для управления площадками в функциональном стиле
 */

import { Router } from 'express';
import { validate } from '../middleware/validator';
import { authenticationMiddleware, requireAnyRole, UserRole } from '../middleware/auth';
import {
  createVenueSchema,
  updateVenueSchema,
  venueQuerySchema,
  venueLocationSearchSchema,
  venueStatusUpdateSchema
} from '../validators/venues';
import * as venueHandlers from '../handlers/venues';

/**
 * Создает роутер для venues API
 */
export const createVenuesRouter = (): Router => {
  const router = Router();

  // CRUD операции для площадок

  /**
   * POST /api/venues - создание площадки
   * Требует роль admin или venue_manager
   */
  router.post('/',
    authenticationMiddleware,
    requireAnyRole([UserRole.ADMIN, UserRole.COACH]),
    validate.body(createVenueSchema),
    venueHandlers.createVenue
  );

  /**
   * GET /api/venues/:id - получение площадки по ID
   * Доступно всем аутентифицированным пользователям
   */
  router.get('/:id',
    authenticationMiddleware,
    venueHandlers.getVenueById
  );

  /**
   * PUT /api/venues/:id - обновление площадки
   * Требует роль admin или venue_manager
   */
  router.put('/:id',
    authenticationMiddleware,
    requireAnyRole([UserRole.ADMIN, UserRole.COACH]),
    validate.body(updateVenueSchema),
    venueHandlers.updateVenue
  );

  /**
   * DELETE /api/venues/:id - удаление площадки
   * Требует роль admin
   */
  router.delete('/:id',
    authenticationMiddleware,
    requireAnyRole([UserRole.ADMIN]),
    venueHandlers.deleteVenue
  );

  /**
   * GET /api/venues - список площадок с фильтрацией
   * Доступно всем аутентифицированным пользователям
   */
  router.get('/',
    authenticationMiddleware,
    validate.query(venueQuerySchema),
    venueHandlers.getVenues
  );

  // Дополнительные операции

  /**
   * GET /api/venues/search/location - поиск по геолокации
   * Поиск площадок в радиусе от указанной точки
   */
  router.get('/search/location',
    authenticationMiddleware,
    validate.query(venueLocationSearchSchema),
    venueHandlers.searchVenuesByLocation
  );

  /**
   * PUT /api/venues/:id/status - изменение статуса площадки
   * Требует роль admin или venue_manager
   */
  router.put('/:id/status',
    authenticationMiddleware,
    requireAnyRole([UserRole.ADMIN, UserRole.COACH]),
    validate.body(venueStatusUpdateSchema),
    venueHandlers.updateVenueStatus
  );

  /**
   * GET /api/venues/:id/courts - получение кортов площадки
   * Доступно всем аутентифицированным пользователям
   */
  router.get('/:id/courts',
    authenticationMiddleware,
    venueHandlers.getVenueCourts
  );

  /**
   * GET /api/venues/:id/availability - проверка доступности площадки
   * Проверяет доступные слоты для бронирования
   */
  router.get('/:id/availability',
    authenticationMiddleware,
    venueHandlers.getVenueAvailability
  );

  return router;
};

/**
 * Экспорт роутера по умолчанию
 */
export default createVenuesRouter;
