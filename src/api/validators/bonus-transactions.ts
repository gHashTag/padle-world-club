import { z } from "zod";

/**
 * Схема для создания бонусной транзакции
 */
export const createBonusTransactionSchema = z.object({
  userId: z.string().uuid("ID пользователя должен быть валидным UUID"),
  transactionType: z.enum(["earned", "spent"], {
    errorMap: () => ({ message: "Тип транзакции должен быть 'earned' или 'spent'" }),
  }),
  pointsChange: z.number().int().positive("Количество баллов должно быть положительным числом"),
  description: z.string().min(1, "Описание обязательно").max(500, "Описание не должно превышать 500 символов"),
  relatedOrderId: z.string().uuid("ID заказа должен быть валидным UUID").optional(),
  relatedBookingId: z.string().uuid("ID бронирования должен быть валидным UUID").optional(),
  expiresAt: z.string().datetime("Дата истечения должна быть в формате ISO").optional(),
});

/**
 * Схема для обновления бонусной транзакции
 */
export const updateBonusTransactionSchema = z.object({
  description: z.string().min(1, "Описание обязательно").max(500, "Описание не должно превышать 500 символов").optional(),
  expiresAt: z.string().datetime("Дата истечения должна быть в формате ISO").optional(),
});

/**
 * Схема для получения транзакций пользователя
 */
export const getUserTransactionsSchema = z.object({
  userId: z.string().uuid("ID пользователя должен быть валидным UUID"),
  type: z.enum(["earned", "spent"]).optional(),
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0),
});

/**
 * Схема для получения транзакций по типу
 */
export const getTransactionsByTypeSchema = z.object({
  type: z.enum(["earned", "spent"], {
    errorMap: () => ({ message: "Тип транзакции должен быть 'earned' или 'spent'" }),
  }),
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0),
});

/**
 * Схема для получения транзакций за период
 */
export const getTransactionsByDateRangeSchema = z.object({
  startDate: z.string().datetime("Начальная дата должна быть в формате ISO"),
  endDate: z.string().datetime("Конечная дата должна быть в формате ISO"),
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0),
});

/**
 * Схема для получения баланса пользователя
 */
export const getUserBalanceSchema = z.object({
  userId: z.string().uuid("ID пользователя должен быть валидным UUID"),
});

/**
 * Схема для получения истории баланса
 */
export const getBalanceHistorySchema = z.object({
  userId: z.string().uuid("ID пользователя должен быть валидным UUID"),
  limit: z.number().int().min(1).max(50).default(20),
});

/**
 * Схема для получения сводки по бонусам пользователя
 */
export const getUserBonusSummarySchema = z.object({
  userId: z.string().uuid("ID пользователя должен быть валидным UUID"),
});

/**
 * Схема для получения истекающих бонусов
 */
export const getExpiringBonusesSchema = z.object({
  daysAhead: z.number().int().min(1).max(365).default(30),
});

/**
 * Схема для параметров пагинации
 */
export const paginationSchema = z.object({
  limit: z.number().int().min(1).max(100).default(50),
  offset: z.number().int().min(0).default(0),
});

/**
 * Схема для ID параметра
 */
export const idParamSchema = z.object({
  id: z.string().uuid("ID должен быть валидным UUID"),
});

/**
 * Типы для валидаторов
 */
export type CreateBonusTransactionInput = z.infer<typeof createBonusTransactionSchema>;
export type UpdateBonusTransactionInput = z.infer<typeof updateBonusTransactionSchema>;
export type GetUserTransactionsInput = z.infer<typeof getUserTransactionsSchema>;
export type GetTransactionsByTypeInput = z.infer<typeof getTransactionsByTypeSchema>;
export type GetTransactionsByDateRangeInput = z.infer<typeof getTransactionsByDateRangeSchema>;
export type GetUserBalanceInput = z.infer<typeof getUserBalanceSchema>;
export type GetBalanceHistoryInput = z.infer<typeof getBalanceHistorySchema>;
export type GetUserBonusSummaryInput = z.infer<typeof getUserBonusSummarySchema>;
export type GetExpiringBonusesInput = z.infer<typeof getExpiringBonusesSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type IdParamInput = z.infer<typeof idParamSchema>;
