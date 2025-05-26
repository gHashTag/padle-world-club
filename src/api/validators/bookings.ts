/**
 * Валидаторы для бронирований (Booking и BookingParticipant)
 */

import { z } from 'zod';
import { commonSchemas, paginationSchemas, sortingSchemas, searchSchemas } from './common';

// Enum валидаторы на основе схемы базы данных
export const bookingEnums = {
  bookingStatus: z.enum(['confirmed', 'pending_payment', 'cancelled', 'completed']),
  bookingPurpose: z.enum(['free_play', 'group_training', 'private_training', 'tournament_match', 'other']),
  paymentStatus: z.enum(['success', 'failed', 'pending', 'refunded', 'partial']),
  participationStatus: z.enum(['registered', 'attended', 'no_show', 'cancelled']),
};

// Базовая схема бронирования (полная)
export const bookingSchema = z.object({
  id: commonSchemas.uuid,
  courtId: commonSchemas.uuid,
  startTime: commonSchemas.dateString,
  endTime: commonSchemas.dateString,
  durationMinutes: z.number()
    .int('Продолжительность должна быть целым числом')
    .min(15, 'Минимальная продолжительность 15 минут')
    .max(480, 'Максимальная продолжительность 8 часов'),
  status: bookingEnums.bookingStatus,
  totalAmount: z.number()
    .min(0, 'Сумма не может быть отрицательной')
    .multipleOf(0.01, 'Сумма должна быть с точностью до копеек'),
  currency: commonSchemas.currency,
  bookedByUserId: commonSchemas.uuid,
  bookingPurpose: bookingEnums.bookingPurpose,
  relatedEntityId: commonSchemas.uuid.optional().nullable(),
  notes: commonSchemas.longText.nullable(),
  createdAt: commonSchemas.dateString,
  updatedAt: commonSchemas.dateString,
}).refine(
  data => new Date(data.startTime) < new Date(data.endTime),
  {
    message: 'Время начала должно быть раньше времени окончания',
    path: ['endTime'],
  }
).refine(
  data => {
    const start = new Date(data.startTime);
    const end = new Date(data.endTime);
    const diffMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
    return Math.abs(diffMinutes - data.durationMinutes) < 1; // Допускаем погрешность в 1 минуту
  },
  {
    message: 'Продолжительность не соответствует времени начала и окончания',
    path: ['durationMinutes'],
  }
);

// Базовая схема для создания бронирования (без refine)
const createBookingBaseSchema = z.object({
  courtId: commonSchemas.uuid,
  startTime: commonSchemas.dateString,
  endTime: commonSchemas.dateString.optional(),
  durationMinutes: z.number()
    .int('Продолжительность должна быть целым числом')
    .min(15, 'Минимальная продолжительность 15 минут')
    .max(480, 'Максимальная продолжительность 8 часов')
    .optional(),
  totalAmount: z.number()
    .min(0, 'Сумма не может быть отрицательной')
    .multipleOf(0.01, 'Сумма должна быть с точностью до копеек'),
  currency: commonSchemas.currency,
  bookedByUserId: commonSchemas.uuid,
  bookingPurpose: bookingEnums.bookingPurpose,
  relatedEntityId: commonSchemas.uuid.optional().nullable(),
  notes: commonSchemas.longText.nullable(),
});

// Схема для создания бронирования с валидацией
export const createBookingSchema = createBookingBaseSchema.refine(
  data => data.endTime || data.durationMinutes,
  {
    message: 'Необходимо указать либо время окончания, либо продолжительность',
    path: ['endTime'],
  }
).refine(
  data => {
    if (data.endTime) {
      return new Date(data.startTime) < new Date(data.endTime);
    }
    return true;
  },
  {
    message: 'Время начала должно быть раньше времени окончания',
    path: ['endTime'],
  }
);

// Базовая схема для обновления бронирования (без refine)
const updateBookingBaseSchema = z.object({
  courtId: commonSchemas.uuid,
  startTime: commonSchemas.dateString,
  endTime: commonSchemas.dateString,
  durationMinutes: z.number()
    .int('Продолжительность должна быть целым числом')
    .min(15, 'Минимальная продолжительность 15 минут')
    .max(480, 'Максимальная продолжительность 8 часов'),
  status: bookingEnums.bookingStatus,
  totalAmount: z.number()
    .min(0, 'Сумма не может быть отрицательной')
    .multipleOf(0.01, 'Сумма должна быть с точностью до копеек'),
  currency: commonSchemas.currency,
  bookingPurpose: bookingEnums.bookingPurpose,
  relatedEntityId: commonSchemas.uuid.optional().nullable(),
  notes: commonSchemas.longText.nullable(),
}).partial();

// Схема для обновления бронирования с валидацией
export const updateBookingSchema = updateBookingBaseSchema.refine(
  data => !data.startTime || !data.endTime || new Date(data.startTime) < new Date(data.endTime),
  {
    message: 'Время начала должно быть раньше времени окончания',
    path: ['endTime'],
  }
);

// Схема для поиска бронирований
export const searchBookingsSchema = z.object({
  ...paginationSchemas.basic.shape,
  ...sortingSchemas.withFields([
    'startTime', 'endTime', 'status', 'totalAmount', 'createdAt', 'updatedAt'
  ]).shape,
  ...searchSchemas.basic.shape,

  // Фильтры
  courtId: commonSchemas.uuid.optional(),
  bookedByUserId: commonSchemas.uuid.optional(),
  status: bookingEnums.bookingStatus.optional(),
  bookingPurpose: bookingEnums.bookingPurpose.optional(),

  // Диапазон времени
  startTimeAfter: commonSchemas.dateString.optional(),
  startTimeBefore: commonSchemas.dateString.optional(),
  endTimeAfter: commonSchemas.dateString.optional(),
  endTimeBefore: commonSchemas.dateString.optional(),

  // Диапазон сумм
  minAmount: z.number().min(0).optional(),
  maxAmount: z.number().min(0).optional(),

  // Диапазон дат создания
  createdAfter: commonSchemas.dateString.optional(),
  createdBefore: commonSchemas.dateString.optional(),
}).refine(
  data => !data.minAmount || !data.maxAmount || data.minAmount <= data.maxAmount,
  {
    message: 'Минимальная сумма должна быть меньше максимальной',
    path: ['maxAmount'],
  }
);

// Схема для отмены бронирования
export const cancelBookingSchema = z.object({
  reason: z.string()
    .max(500, 'Причина отмены не должна превышать 500 символов')
    .optional(),
  refundAmount: z.number()
    .min(0, 'Сумма возврата не может быть отрицательной')
    .optional(),
});

// Схема для подтверждения бронирования
export const confirmBookingSchema = z.object({
  paymentConfirmed: z.boolean().default(false),
  notes: commonSchemas.mediumText.optional(),
});

// ===== СХЕМЫ ДЛЯ BOOKING PARTICIPANT =====

// Базовая схема участника бронирования
export const bookingParticipantSchema = z.object({
  id: commonSchemas.uuid,
  bookingId: commonSchemas.uuid,
  userId: commonSchemas.uuid,
  amountOwed: z.number()
    .min(0, 'Сумма к оплате не может быть отрицательной')
    .multipleOf(0.01, 'Сумма должна быть с точностью до копеек'),
  amountPaid: z.number()
    .min(0, 'Оплаченная сумма не может быть отрицательной')
    .multipleOf(0.01, 'Сумма должна быть с точностью до копеек')
    .default(0),
  paymentStatus: bookingEnums.paymentStatus.default('pending'),
  participationStatus: bookingEnums.participationStatus.default('registered'),
  isHost: z.boolean().default(false),
  createdAt: commonSchemas.dateString,
  updatedAt: commonSchemas.dateString,
}).refine(
  data => data.amountPaid <= data.amountOwed,
  {
    message: 'Оплаченная сумма не может превышать сумму к оплате',
    path: ['amountPaid'],
  }
);

// Базовая схема для добавления участника (без refine)
const addBookingParticipantBaseSchema = z.object({
  bookingId: commonSchemas.uuid,
  userId: commonSchemas.uuid,
  amountOwed: z.number()
    .min(0, 'Сумма к оплате не может быть отрицательной')
    .multipleOf(0.01, 'Сумма должна быть с точностью до копеек'),
  amountPaid: z.number()
    .min(0, 'Оплаченная сумма не может быть отрицательной')
    .multipleOf(0.01, 'Сумма должна быть с точностью до копеек')
    .default(0),
  paymentStatus: bookingEnums.paymentStatus.default('pending'),
  participationStatus: bookingEnums.participationStatus.default('registered'),
  isHost: z.boolean().default(false),
});

// Схема для добавления участника к бронированию с валидацией
export const addBookingParticipantSchema = addBookingParticipantBaseSchema.refine(
  data => data.amountPaid <= data.amountOwed,
  {
    message: 'Оплаченная сумма не может превышать сумму к оплате',
    path: ['amountPaid'],
  }
);

// Базовая схема для обновления участника (без refine)
const updateBookingParticipantBaseSchema = z.object({
  amountOwed: z.number()
    .min(0, 'Сумма к оплате не может быть отрицательной')
    .multipleOf(0.01, 'Сумма должна быть с точностью до копеек'),
  amountPaid: z.number()
    .min(0, 'Оплаченная сумма не может быть отрицательной')
    .multipleOf(0.01, 'Сумма должна быть с точностью до копеек'),
  paymentStatus: bookingEnums.paymentStatus,
  participationStatus: bookingEnums.participationStatus,
  isHost: z.boolean(),
}).partial();

// Схема для обновления участника бронирования с валидацией
export const updateBookingParticipantSchema = updateBookingParticipantBaseSchema.refine(
  data => !data.amountOwed || !data.amountPaid || data.amountPaid <= data.amountOwed,
  {
    message: 'Оплаченная сумма не может превышать сумму к оплате',
    path: ['amountPaid'],
  }
);

// Схема для поиска участников бронирований
export const searchBookingParticipantsSchema = z.object({
  ...paginationSchemas.basic.shape,
  ...sortingSchemas.withFields([
    'amountOwed', 'amountPaid', 'paymentStatus', 'participationStatus', 'isHost', 'createdAt'
  ]).shape,

  // Фильтры
  bookingId: commonSchemas.uuid.optional(),
  userId: commonSchemas.uuid.optional(),
  paymentStatus: bookingEnums.paymentStatus.optional(),
  participationStatus: bookingEnums.participationStatus.optional(),
  isHost: z.boolean().optional(),

  // Диапазон сумм
  minAmountOwed: z.number().min(0).optional(),
  maxAmountOwed: z.number().min(0).optional(),
  minAmountPaid: z.number().min(0).optional(),
  maxAmountPaid: z.number().min(0).optional(),
});

// Схема для массового обновления статуса участников
export const bulkUpdateParticipantsSchema = z.object({
  participantIds: z.array(commonSchemas.uuid)
    .min(1, 'Необходимо выбрать хотя бы одного участника')
    .max(50, 'Можно обновить максимум 50 участников за раз'),
  updates: updateBookingParticipantSchema,
});

// ===== ПАРАМЕТРЫ URL =====

export const bookingParamsSchema = z.object({
  bookingId: commonSchemas.uuid,
});

export const participantParamsSchema = z.object({
  bookingId: commonSchemas.uuid,
  participantId: commonSchemas.uuid,
});

// ===== ЭКСПОРТ ВСЕХ ВАЛИДАТОРОВ =====

export const BookingValidators = {
  // Основные схемы бронирования
  booking: bookingSchema,
  createBooking: createBookingSchema,
  updateBooking: updateBookingSchema,
  searchBookings: searchBookingsSchema,
  cancelBooking: cancelBookingSchema,
  confirmBooking: confirmBookingSchema,

  // Схемы участников бронирования
  bookingParticipant: bookingParticipantSchema,
  addBookingParticipant: addBookingParticipantSchema,
  updateBookingParticipant: updateBookingParticipantSchema,
  searchBookingParticipants: searchBookingParticipantsSchema,
  bulkUpdateParticipants: bulkUpdateParticipantsSchema,

  // Параметры URL
  bookingParams: bookingParamsSchema,
  participantParams: participantParamsSchema,

  // Enum'ы
  enums: bookingEnums,
};
