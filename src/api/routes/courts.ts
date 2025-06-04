/**
 * Маршруты для Courts API
 * Функциональный стиль с композицией middleware
 */

import { Router } from 'express';
import { validate } from '../middleware/validator';
import { authenticationMiddleware, requireAnyRole, UserRole } from '../middleware/auth';
import * as courtHandlers from '../handlers/courts';
import { CourtValidators } from '../validators/courts';

/**
 * Создает маршруты для Courts API
 * @returns Express Router с настроенными маршрутами
 */
export const createCourtRoutes = (): Router => {
  const router = Router();

  /**
   * POST /api/courts - создание нового корта
   * Доступно администраторам и тренерам
   */
  router.post('/',
    authenticationMiddleware,
    requireAnyRole([UserRole.ADMIN, UserRole.COACH]),
    validate.body(CourtValidators.createCourt),
    courtHandlers.createCourt
  );

  /**
   * GET /api/courts/:id - получение корта по ID
   * Доступно всем аутентифицированным пользователям
   */
  router.get('/:id',
    authenticationMiddleware,
    validate.params(CourtValidators.courtParams),
    courtHandlers.getCourtById
  );

  /**
   * PUT /api/courts/:id - обновление корта
   * Доступно администраторам и тренерам
   */
  router.put('/:id',
    authenticationMiddleware,
    requireAnyRole([UserRole.ADMIN, UserRole.COACH]),
    validate.params(CourtValidators.courtParams),
    validate.body(CourtValidators.updateCourt),
    courtHandlers.updateCourt
  );

  /**
   * DELETE /api/courts/:id - удаление корта
   * Доступно только администраторам
   */
  router.delete('/:id',
    authenticationMiddleware,
    requireAnyRole([UserRole.ADMIN]),
    validate.params(CourtValidators.courtParams),
    courtHandlers.deleteCourt
  );

  /**
   * GET /api/courts - список кортов с фильтрацией
   * Доступно всем аутентифицированным пользователям
   */
  router.get('/',
    authenticationMiddleware,
    validate.query(CourtValidators.searchCourts),
    courtHandlers.getCourts
  );



  /**
   * GET /api/courts/:id/availability - проверка доступности корта
   * Доступно всем аутентифицированным пользователям
   */
  router.get('/:id/availability',
    authenticationMiddleware,
    validate.params(CourtValidators.courtParams),
    validate.query(CourtValidators.checkAvailability),
    courtHandlers.checkCourtAvailability
  );

  /**
   * GET /api/courts/:id/stats - статистика корта
   * Доступно администраторам и тренерам
   */
  router.get('/:id/stats',
    authenticationMiddleware,
    requireAnyRole([UserRole.ADMIN, UserRole.COACH]),
    validate.params(CourtValidators.courtParams),
    courtHandlers.getCourtStats
  );

  /**
   * GET /api/courts/venue/:venueId - корты площадки
   * Доступно всем аутентифицированным пользователям
   */
  router.get('/venue/:venueId',
    authenticationMiddleware,
    validate.params(CourtValidators.venueParams),
    validate.query(CourtValidators.venueCourtFilters),
    courtHandlers.getCourtsByVenue
  );

  return router;
};

/**
 * Экспорт для совместимости
 */
export default createCourtRoutes;
