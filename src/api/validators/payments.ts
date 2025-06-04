/**
 * Валидаторы для Payments API
 * Схемы валидации для платежей с использованием Zod
 */

import { z } from 'zod';
import { commonSchemas } from './common';

// Enum'ы для платежей (соответствуют схеме БД)
const paymentEnums = {
  paymentStatus: z.enum(['success', 'failed', 'pending', 'refunded', 'partial']),
  paymentMethod: z.enum(['card', 'cash', 'bank_transfer', 'bonus_points']),
};

// Базовая схема платежа
const basePaymentSchema = z.object({
  userId: commonSchemas.uuid,
  amount: z.number().min(0.01, 'Сумма должна быть больше 0').max(999999.99, 'Сумма слишком большая'),
  currency: z.string().length(3, 'Валюта должна быть в формате ISO 4217 (3 символа)').default('USD'),
  status: paymentEnums.paymentStatus.default('pending'),
  paymentMethod: paymentEnums.paymentMethod,
  gatewayTransactionId: z.string().max(255, 'ID транзакции не должен превышать 255 символов').optional(),
  description: z.string().max(1000, 'Описание не должно превышать 1000 символов').optional(),

  // Полиморфные связи (только одна должна быть указана)
  relatedBookingParticipantId: commonSchemas.uuid.optional(),
  relatedOrderId: commonSchemas.uuid.optional(),
  relatedUserTrainingPackageId: commonSchemas.uuid.optional(),
});

// Схема для создания платежа
export const createPaymentSchema = basePaymentSchema.omit({
  // Убираем поля, которые устанавливаются автоматически
}).refine(
  data => {
    // Проверяем, что указана хотя бы одна связь
    const relatedFields = [
      data.relatedBookingParticipantId,
      data.relatedOrderId,
      data.relatedUserTrainingPackageId
    ].filter(Boolean);

    return relatedFields.length === 1;
  },
  {
    message: 'Должна быть указана ровно одна связь (booking participant, order или training package)',
    path: ['relatedBookingParticipantId'],
  }
);

// Схема для обновления платежа
export const updatePaymentSchema = basePaymentSchema.partial().omit({
  userId: true, // Нельзя изменить пользователя после создания
  // Нельзя изменить связи после создания
  relatedBookingParticipantId: true,
  relatedOrderId: true,
  relatedUserTrainingPackageId: true,
});

// Схема для параметров URL
export const paymentParamsSchema = z.object({
  id: commonSchemas.uuid,
});

// Схема для поиска платежей
export const searchPaymentsSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  sortBy: z.enum(['amount', 'status', 'paymentMethod', 'createdAt', 'updatedAt']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),

  // Фильтры
  userId: commonSchemas.uuid.optional(),
  status: paymentEnums.paymentStatus.optional(),
  paymentMethod: paymentEnums.paymentMethod.optional(),
  currency: z.string().length(3).optional(),

  // Фильтры по связанным сущностям
  relatedBookingParticipantId: commonSchemas.uuid.optional(),
  relatedOrderId: commonSchemas.uuid.optional(),
  relatedUserTrainingPackageId: commonSchemas.uuid.optional(),

  // Диапазон сумм
  minAmount: z.coerce.number().min(0).optional(),
  maxAmount: z.coerce.number().min(0).optional(),

  // Диапазон дат создания
  createdAfter: commonSchemas.dateString.optional(),
  createdBefore: commonSchemas.dateString.optional(),

  // ID транзакции платежного шлюза
  gatewayTransactionId: z.string().optional(),
}).refine(
  data => !data.minAmount || !data.maxAmount || data.minAmount <= data.maxAmount,
  {
    message: 'Минимальная сумма должна быть меньше максимальной',
    path: ['maxAmount'],
  }
);

// Схема для обновления статуса платежа
export const updatePaymentStatusSchema = z.object({
  status: paymentEnums.paymentStatus,
  gatewayTransactionId: z.string().max(255, 'ID транзакции не должен превышать 255 символов').optional(),
  description: z.string().max(1000, 'Описание не должно превышать 1000 символов').optional(),
});

// Схема для возврата платежа
export const refundPaymentSchema = z.object({
  amount: z.number().min(0.01, 'Сумма возврата должна быть больше 0').optional(), // Если не указана, возвращается полная сумма
  reason: z.string().max(500, 'Причина возврата не должна превышать 500 символов').optional(),
  gatewayTransactionId: z.string().max(255, 'ID транзакции возврата не должен превышать 255 символов').optional(),
});

// Схема для получения статистики платежей
export const paymentStatsSchema = z.object({
  userId: commonSchemas.uuid.optional(),
  currency: z.string().length(3).optional(),
  startDate: commonSchemas.dateString.optional(),
  endDate: commonSchemas.dateString.optional(),
  groupBy: z.enum(['day', 'week', 'month', 'year']).optional(),
}).refine(
  data => !data.startDate || !data.endDate || new Date(data.startDate) <= new Date(data.endDate),
  {
    message: 'Дата начала должна быть раньше даты окончания',
    path: ['endDate'],
  }
);

// Схема для получения платежей пользователя
export const userPaymentsSchema = z.object({
  userId: commonSchemas.uuid,
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  status: paymentEnums.paymentStatus.optional(),
  paymentMethod: paymentEnums.paymentMethod.optional(),
  startDate: commonSchemas.dateString.optional(),
  endDate: commonSchemas.dateString.optional(),
});

// Схема для webhook'ов платежных систем
export const paymentWebhookSchema = z.object({
  gatewayTransactionId: z.string().min(1, 'ID транзакции обязателен'),
  status: paymentEnums.paymentStatus,
  amount: z.number().min(0).optional(),
  currency: z.string().length(3).optional(),
  gatewayData: z.record(z.any()).optional(), // Дополнительные данные от платежного шлюза
  signature: z.string().optional(), // Подпись для верификации
});

// Экспорт всех валидаторов
export const PaymentValidators = {
  createPayment: createPaymentSchema,
  updatePayment: updatePaymentSchema,
  paymentParams: paymentParamsSchema,
  searchPayments: searchPaymentsSchema,
  updatePaymentStatus: updatePaymentStatusSchema,
  refundPayment: refundPaymentSchema,
  paymentStats: paymentStatsSchema,
  userPayments: userPaymentsSchema,
  paymentWebhook: paymentWebhookSchema,
};

// Экспорт enum'ов для использования в других модулях
export { paymentEnums };

// Типы для TypeScript
export type CreatePaymentRequest = z.infer<typeof createPaymentSchema>;
export type UpdatePaymentRequest = z.infer<typeof updatePaymentSchema>;
export type SearchPaymentsQuery = z.infer<typeof searchPaymentsSchema>;
export type UpdatePaymentStatusRequest = z.infer<typeof updatePaymentStatusSchema>;
export type RefundPaymentRequest = z.infer<typeof refundPaymentSchema>;
export type PaymentStatsQuery = z.infer<typeof paymentStatsSchema>;
export type UserPaymentsQuery = z.infer<typeof userPaymentsSchema>;
export type PaymentWebhookData = z.infer<typeof paymentWebhookSchema>;
