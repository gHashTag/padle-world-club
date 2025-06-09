/**
 * Обработчики для Payments API
 * Функциональный стиль с композицией и чистыми функциями
 */

import { Request, Response } from 'express';
import { PaymentRepository } from '../../repositories/payment-repository';
import { UserRepository } from '../../repositories/user-repository';
import { BookingParticipantRepository } from '../../repositories/booking-participant-repository';
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
const paymentRepo = new PaymentRepository(db);
const userRepo = new UserRepository(db);
const participantRepo = new BookingParticipantRepository(db);

/**
 * Создание нового платежа
 * POST /api/payments
 */
export const createPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    logger.info('Creating new payment', { body: req.body } as any);

    const paymentData = req.body;

    // Проверяем существование пользователя
    const user = await userRepo.getById(paymentData.userId);
    if (!user) {
      logger.warn('User not found', { userId: paymentData.userId } as any);
      const response = createErrorResponse('Пользователь не найден');
      res.status(404).json(response);
      return;
    }

    // Проверяем связанные сущности
    if (paymentData.relatedBookingParticipantId) {
      const participant = await participantRepo.getById(paymentData.relatedBookingParticipantId);
      if (!participant) {
        logger.warn('Booking participant not found', {
          participantId: paymentData.relatedBookingParticipantId
        } as any);
        const response = createErrorResponse('Участник бронирования не найден');
        res.status(404).json(response);
        return;
      }
    }

    const payment = await paymentRepo.create(paymentData);

    logger.info('Payment created successfully', { paymentId: payment.id } as any);
    const response = createSuccessResponse(payment, 'Платеж успешно создан');
    res.status(201).json(response);
  } catch (error) {
    logger.error('Error creating payment', { error } as any);
    const response = createErrorResponse('Ошибка при создании платежа', error);
    res.status(500).json(response);
  }
};

/**
 * Получение платежа по ID
 * GET /api/payments/:id
 */
export const getPaymentById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    logger.info('Getting payment by ID', { paymentId: id } as any);

    const payment = await paymentRepo.getById(id);

    if (!payment) {
      logger.warn('Payment not found', { paymentId: id } as any);
      const response = createErrorResponse('Платеж не найден');
      res.status(404).json(response);
      return;
    }

    logger.info('Payment found', { paymentId: id } as any);
    const response = createSuccessResponse(payment);
    res.json(response);
  } catch (error) {
    logger.error('Error getting payment', { error } as any);
    const response = createErrorResponse('Ошибка при получении платежа', error);
    res.status(500).json(response);
  }
};

/**
 * Обновление платежа
 * PUT /api/payments/:id
 */
export const updatePayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    logger.info('Updating payment', { paymentId: id, body: req.body } as any);

    // Проверяем существование платежа
    const existingPayment = await paymentRepo.getById(id);
    if (!existingPayment) {
      logger.warn('Payment not found for update', { paymentId: id } as any);
      const response = createErrorResponse('Платеж не найден');
      res.status(404).json(response);
      return;
    }

    const updateData = req.body;
    const payment = await paymentRepo.update(id, updateData);

    if (!payment) {
      logger.warn('Payment not found after update', { paymentId: id } as any);
      const response = createErrorResponse('Платеж не найден');
      res.status(404).json(response);
      return;
    }

    logger.info('Payment updated successfully', { paymentId: id } as any);
    const response = createSuccessResponse(payment, 'Платеж успешно обновлен');
    res.json(response);
  } catch (error) {
    logger.error('Error updating payment', { error } as any);
    const response = createErrorResponse('Ошибка при обновлении платежа', error);
    res.status(500).json(response);
  }
};

/**
 * Получение списка платежей с фильтрацией
 * GET /api/payments
 */
export const getPayments = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = req.query;
    logger.info('Getting payments list', { query } as any);

    // Извлекаем параметры пагинации и фильтрации
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const sortBy = (query.sortBy as string) || 'createdAt';
    const sortOrder = (query.sortOrder as 'asc' | 'desc') || 'desc';

    // Фильтры
    const filters = {
      userId: query.userId as string,
      status: query.status as string,
      paymentMethod: query.paymentMethod as string,
      currency: query.currency as string,
      relatedBookingParticipantId: query.relatedBookingParticipantId as string,
      relatedOrderId: query.relatedOrderId as string,
      relatedUserTrainingPackageId: query.relatedUserTrainingPackageId as string,
      minAmount: query.minAmount ? Number(query.minAmount) : undefined,
      maxAmount: query.maxAmount ? Number(query.maxAmount) : undefined,
      createdAfter: query.createdAfter as string,
      createdBefore: query.createdBefore as string,
      gatewayTransactionId: query.gatewayTransactionId as string,
      search: query.search as string,
    };

    const result = await paymentRepo.findMany({
      page,
      limit,
      sortBy,
      sortOrder,
      ...filters
    });

    logger.info('Payments retrieved', { count: result.data.length, total: result.total } as any);
    const response = createSuccessResponse(result);
    res.json(response);
  } catch (error) {
    logger.error('Error getting payments', { error } as any);
    const response = createErrorResponse('Ошибка при получении списка платежей', error);
    res.status(500).json(response);
  }
};

/**
 * Обновление статуса платежа
 * PUT /api/payments/:id/status
 */
export const updatePaymentStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, gatewayTransactionId, description } = req.body;

    logger.info('Updating payment status', {
      paymentId: id,
      status,
      gatewayTransactionId
    } as any);

    // Проверяем существование платежа
    const existingPayment = await paymentRepo.getById(id);
    if (!existingPayment) {
      logger.warn('Payment not found for status update', { paymentId: id } as any);
      const response = createErrorResponse('Платеж не найден');
      res.status(404).json(response);
      return;
    }

    const updateData: any = { status };
    if (gatewayTransactionId !== undefined) {
      updateData.gatewayTransactionId = gatewayTransactionId;
    }
    if (description !== undefined) {
      updateData.description = description;
    }

    const payment = await paymentRepo.update(id, updateData);

    logger.info('Payment status updated successfully', { paymentId: id, status } as any);
    const response = createSuccessResponse(payment, 'Статус платежа успешно обновлен');
    res.json(response);
  } catch (error) {
    logger.error('Error updating payment status', { error } as any);
    const response = createErrorResponse('Ошибка при обновлении статуса платежа', error);
    res.status(500).json(response);
  }
};

/**
 * Возврат платежа
 * POST /api/payments/:id/refund
 */
export const refundPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { amount, reason, gatewayTransactionId } = req.body;

    logger.info('Processing payment refund', {
      paymentId: id,
      amount,
      reason
    } as any);

    // Проверяем существование платежа
    const existingPayment = await paymentRepo.getById(id);
    if (!existingPayment) {
      logger.warn('Payment not found for refund', { paymentId: id } as any);
      const response = createErrorResponse('Платеж не найден');
      res.status(404).json(response);
      return;
    }

    // Проверяем, что платеж можно вернуть
    if (existingPayment.status !== 'success') {
      logger.warn('Cannot refund non-successful payment', {
        paymentId: id,
        status: existingPayment.status
      } as any);
      const response = createErrorResponse('Можно вернуть только успешные платежи');
      res.status(400).json(response);
      return;
    }

    // Определяем сумму возврата
    const refundAmount = amount || parseFloat(existingPayment.amount);
    const originalAmount = parseFloat(existingPayment.amount);

    if (refundAmount > originalAmount) {
      logger.warn('Refund amount exceeds original amount', {
        paymentId: id,
        refundAmount,
        originalAmount
      } as any);
      const response = createErrorResponse('Сумма возврата не может превышать сумму платежа');
      res.status(400).json(response);
      return;
    }

    // Обновляем статус платежа
    const newStatus = refundAmount === originalAmount ? 'refunded' : 'partial';
    const updateData: any = {
      status: newStatus,
      description: reason ? `Возврат: ${reason}` : 'Возврат платежа'
    };

    if (gatewayTransactionId) {
      updateData.gatewayTransactionId = gatewayTransactionId;
    }

    const payment = await paymentRepo.update(id, updateData);

    logger.info('Payment refund processed successfully', {
      paymentId: id,
      refundAmount,
      newStatus
    } as any);
    const response = createSuccessResponse({
      payment,
      refundAmount,
      refundStatus: newStatus
    }, 'Возврат платежа успешно обработан');
    res.json(response);
  } catch (error) {
    logger.error('Error processing payment refund', { error } as any);
    const response = createErrorResponse('Ошибка при обработке возврата платежа', error);
    res.status(500).json(response);
  }
};

/**
 * Получение платежей пользователя
 * GET /api/payments/user/:userId
 */
export const getUserPayments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const query = req.query;

    logger.info('Getting user payments', { userId, query } as any);

    // Проверяем существование пользователя
    const user = await userRepo.getById(userId);
    if (!user) {
      logger.warn('User not found', { userId } as any);
      const response = createErrorResponse('Пользователь не найден');
      res.status(404).json(response);
      return;
    }

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const status = query.status as string;
    const paymentMethod = query.paymentMethod as string;
    const startDate = query.startDate as string;
    const endDate = query.endDate as string;

    // Получаем платежи пользователя с фильтрацией
    let payments = await paymentRepo.getByUserId(userId);

    // Применяем фильтры
    if (status) {
      payments = payments.filter(p => p.status === status);
    }
    if (paymentMethod) {
      payments = payments.filter(p => p.paymentMethod === paymentMethod);
    }
    if (startDate) {
      payments = payments.filter(p => new Date(p.createdAt) >= new Date(startDate));
    }
    if (endDate) {
      payments = payments.filter(p => new Date(p.createdAt) <= new Date(endDate));
    }

    // Пагинация
    const total = payments.length;
    const offset = (page - 1) * limit;
    const paginatedPayments = payments.slice(offset, offset + limit);

    const result = {
      data: paginatedPayments,
      total,
      page,
      limit
    };

    logger.info('User payments retrieved', {
      userId,
      count: paginatedPayments.length,
      total
    } as any);
    const response = createSuccessResponse(result);
    res.json(response);
  } catch (error) {
    logger.error('Error getting user payments', { error } as any);
    const response = createErrorResponse('Ошибка при получении платежей пользователя', error);
    res.status(500).json(response);
  }
};

/**
 * Получение статистики платежей
 * GET /api/payments/stats
 */
export const getPaymentStats = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = req.query;
    logger.info('Getting payment statistics', { query } as any);

    const userId = query.userId as string;
    const currency = query.currency as string;

    let stats;
    if (userId) {
      // Статистика для конкретного пользователя
      stats = await paymentRepo.getUserPaymentStats(userId);
    } else {
      // Общая статистика
      stats = await paymentRepo.getOverallStats(currency);
    }

    logger.info('Payment statistics retrieved', { userId, currency } as any);
    const response = createSuccessResponse(stats);
    res.json(response);
  } catch (error) {
    logger.error('Error getting payment statistics', { error } as any);
    const response = createErrorResponse('Ошибка при получении статистики платежей', error);
    res.status(500).json(response);
  }
};

/**
 * Webhook для обработки уведомлений от платежных систем
 * POST /api/payments/webhook
 */
export const handlePaymentWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    const webhookData = req.body;
    logger.info('Processing payment webhook', { webhookData } as any);

    const { gatewayTransactionId, status, amount, currency, gatewayData } = webhookData;

    // Находим платеж по ID транзакции
    const payment = await paymentRepo.getByGatewayTransactionId(gatewayTransactionId);
    if (!payment) {
      logger.warn('Payment not found for webhook', { gatewayTransactionId } as any);
      const response = createErrorResponse('Платеж не найден');
      res.status(404).json(response);
      return;
    }

    // Обновляем статус платежа
    const updateData: any = { status };

    if (amount !== undefined) {
      updateData.amount = amount.toString();
    }
    if (currency !== undefined) {
      updateData.currency = currency;
    }
    if (gatewayData) {
      updateData.description = `Webhook data: ${JSON.stringify(gatewayData)}`;
    }

    const updatedPayment = await paymentRepo.update(payment.id, updateData);

    logger.info('Payment webhook processed successfully', {
      paymentId: payment.id,
      status,
      gatewayTransactionId
    } as any);

    const response = createSuccessResponse({
      payment: updatedPayment,
      processed: true
    }, 'Webhook успешно обработан');
    res.json(response);
  } catch (error) {
    logger.error('Error processing payment webhook', { error } as any);
    const response = createErrorResponse('Ошибка при обработке webhook', error);
    res.status(500).json(response);
  }
};

/**
 * Удаление платежа (только для администраторов)
 * DELETE /api/payments/:id
 */
export const deletePayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    logger.info('Deleting payment', { paymentId: id } as any);

    // Проверяем существование платежа
    const existingPayment = await paymentRepo.getById(id);
    if (!existingPayment) {
      logger.warn('Payment not found for deletion', { paymentId: id } as any);
      const response = createErrorResponse('Платеж не найден');
      res.status(404).json(response);
      return;
    }

    // Проверяем, что платеж можно удалить (только pending или failed)
    if (!['pending', 'failed'].includes(existingPayment.status)) {
      logger.warn('Cannot delete processed payment', {
        paymentId: id,
        status: existingPayment.status
      } as any);
      const response = createErrorResponse('Можно удалить только платежи со статусом pending или failed');
      res.status(400).json(response);
      return;
    }

    const deleted = await paymentRepo.delete(id);

    if (!deleted) {
      logger.warn('Payment not found after deletion attempt', { paymentId: id } as any);
      const response = createErrorResponse('Платеж не найден');
      res.status(404).json(response);
      return;
    }

    logger.info('Payment deleted successfully', { paymentId: id } as any);
    const response = createSuccessResponse({ deleted: true }, 'Платеж успешно удален');
    res.json(response);
  } catch (error) {
    logger.error('Error deleting payment', { error } as any);
    const response = createErrorResponse('Ошибка при удалении платежа', error);
    res.status(500).json(response);
  }
};
