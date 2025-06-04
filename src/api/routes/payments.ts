/**
 * Маршруты для Payments API
 * Функциональный стиль с композицией middleware
 */

import { Router } from 'express';
import { validate } from '../middleware/validator';
import { authenticationMiddleware, requireAnyRole, UserRole } from '../middleware/auth';
import * as paymentHandlers from '../handlers/payments';
import { PaymentValidators } from '../validators/payments';

/**
 * Создает маршруты для Payments API
 * @returns Express Router с настроенными маршрутами
 */
export const createPaymentRoutes = (): Router => {
  const router = Router();

  /**
   * POST /api/payments - создание нового платежа
   * Доступно всем аутентифицированным пользователям
   */
  router.post('/',
    authenticationMiddleware,
    validate.body(PaymentValidators.createPayment),
    paymentHandlers.createPayment
  );

  /**
   * GET /api/payments/:id - получение платежа по ID
   * Доступно всем аутентифицированным пользователям (с проверкой прав)
   */
  router.get('/:id',
    authenticationMiddleware,
    validate.params(PaymentValidators.paymentParams),
    paymentHandlers.getPaymentById
  );

  /**
   * PUT /api/payments/:id - обновление платежа
   * Доступно администраторам и тренерам
   */
  router.put('/:id',
    authenticationMiddleware,
    requireAnyRole([UserRole.ADMIN, UserRole.COACH]),
    validate.params(PaymentValidators.paymentParams),
    validate.body(PaymentValidators.updatePayment),
    paymentHandlers.updatePayment
  );

  /**
   * DELETE /api/payments/:id - удаление платежа
   * Доступно только администраторам
   */
  router.delete('/:id',
    authenticationMiddleware,
    requireAnyRole([UserRole.ADMIN]),
    validate.params(PaymentValidators.paymentParams),
    paymentHandlers.deletePayment
  );

  /**
   * GET /api/payments - список платежей с фильтрацией
   * Доступно администраторам и тренерам
   */
  router.get('/',
    authenticationMiddleware,
    requireAnyRole([UserRole.ADMIN, UserRole.COACH]),
    validate.query(PaymentValidators.searchPayments),
    paymentHandlers.getPayments
  );

  /**
   * PUT /api/payments/:id/status - изменение статуса платежа
   * Доступно администраторам и тренерам
   */
  router.put('/:id/status',
    authenticationMiddleware,
    requireAnyRole([UserRole.ADMIN, UserRole.COACH]),
    validate.params(PaymentValidators.paymentParams),
    validate.body(PaymentValidators.updatePaymentStatus),
    paymentHandlers.updatePaymentStatus
  );

  /**
   * POST /api/payments/:id/refund - возврат платежа
   * Доступно администраторам и тренерам
   */
  router.post('/:id/refund',
    authenticationMiddleware,
    requireAnyRole([UserRole.ADMIN, UserRole.COACH]),
    validate.params(PaymentValidators.paymentParams),
    validate.body(PaymentValidators.refundPayment),
    paymentHandlers.refundPayment
  );

  /**
   * GET /api/payments/user/:userId - платежи пользователя
   * Доступно администраторам, тренерам и самому пользователю
   */
  router.get('/user/:userId',
    authenticationMiddleware,
    // TODO: Добавить middleware для проверки, что пользователь может видеть эти платежи
    validate.params(PaymentValidators.paymentParams),
    validate.query(PaymentValidators.userPayments),
    paymentHandlers.getUserPayments
  );

  /**
   * GET /api/payments/stats - статистика платежей
   * Доступно администраторам и тренерам
   */
  router.get('/stats',
    authenticationMiddleware,
    requireAnyRole([UserRole.ADMIN, UserRole.COACH]),
    validate.query(PaymentValidators.paymentStats),
    paymentHandlers.getPaymentStats
  );

  /**
   * POST /api/payments/webhook - webhook для платежных систем
   * Публичный endpoint (без аутентификации, но с проверкой подписи)
   * TODO: Добавить middleware для проверки подписи webhook'а
   */
  router.post('/webhook',
    validate.body(PaymentValidators.paymentWebhook),
    paymentHandlers.handlePaymentWebhook
  );

  return router;
};

/**
 * Экспорт для совместимости
 */
export default createPaymentRoutes;
