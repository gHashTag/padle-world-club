/**
 * Routes для API AI Suggestion Logs
 * Содержит все маршруты для работы с логами AI рекомендаций
 */

import { Router } from "express";
import { createValidationMiddleware } from "../middleware/validator";
import {
  authenticationMiddleware,
  requireRole,
  requireAnyRole,
  UserRole,
} from "../middleware/auth";
import {
  createAISuggestionLogSchema,
  updateAISuggestionLogSchema,
  searchAISuggestionLogsSchema,
  getAISuggestionStatsSchema,
  cleanupAISuggestionLogsSchema,
  processFeedbackSchema,
  getRecentLogsSchema,
} from "../validators/ai-suggestion-logs";
import {
  createAISuggestionLog,
  getAISuggestionLogById,
  updateAISuggestionLog,
  deleteAISuggestionLog,
  searchAISuggestionLogs,
  getUserAISuggestionLogs,
  markAsAccepted,
  markAsRejected,
  processFeedback,
  getAISuggestionStats,
  getRecentAISuggestionLogs,
  cleanupAISuggestionLogs,
} from "../handlers/ai-suggestion-logs";

/**
 * @swagger
 * components:
 *   schemas:
 *     AISuggestionLog:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Уникальный идентификатор лога AI рекомендации
 *         suggestionType:
 *           type: string
 *           enum: [game_matching, court_fill_optimization, demand_prediction, rating_update]
 *           description: Тип AI рекомендации
 *         userId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           description: ID пользователя (если применимо)
 *         inputData:
 *           type: object
 *           description: Входные данные для AI модели
 *         suggestionData:
 *           type: object
 *           description: Данные рекомендации от AI
 *         confidenceScore:
 *           type: number
 *           minimum: 0
 *           maximum: 1
 *           description: Уровень уверенности AI (0-1)
 *         executionTimeMs:
 *           type: number
 *           description: Время выполнения в миллисекундах
 *         modelVersion:
 *           type: string
 *           description: Версия AI модели
 *         status:
 *           type: string
 *           enum: [pending, accepted, rejected]
 *           description: Статус рекомендации
 *         feedback:
 *           type: string
 *           nullable: true
 *           description: Обратная связь пользователя
 *         contextData:
 *           type: object
 *           nullable: true
 *           description: Дополнительные контекстные данные
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Дата создания
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Дата последнего обновления
 *
 *     CreateAISuggestionLogRequest:
 *       type: object
 *       required:
 *         - suggestionType
 *         - inputData
 *         - suggestionData
 *         - confidenceScore
 *         - executionTimeMs
 *         - modelVersion
 *       properties:
 *         suggestionType:
 *           type: string
 *           enum: [game_matching, court_fill_optimization, demand_prediction, rating_update]
 *         userId:
 *           type: string
 *           format: uuid
 *         inputData:
 *           type: object
 *         suggestionData:
 *           type: object
 *         confidenceScore:
 *           type: number
 *           minimum: 0
 *           maximum: 1
 *         executionTimeMs:
 *           type: number
 *           minimum: 1
 *         modelVersion:
 *           type: string
 *           minLength: 1
 *           maxLength: 50
 *         contextData:
 *           type: object
 *
 *     UpdateAISuggestionLogRequest:
 *       type: object
 *       properties:
 *         status:
 *           type: string
 *           enum: [pending, accepted, rejected]
 *         feedback:
 *           type: string
 *         contextData:
 *           type: object
 */

export function createAISuggestionLogsRouter(): Router {
  const router = Router();

  /**
   * @swagger
   * /api/ai-suggestion-logs:
   *   post:
   *     summary: Создать новый лог AI рекомендации
   *     tags: [AI Suggestion Logs]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/CreateAISuggestionLogRequest'
   *     responses:
   *       201:
   *         description: Лог AI рекомендации успешно создан
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   $ref: '#/components/schemas/AISuggestionLog'
   *                 message:
   *                   type: string
   *       400:
   *         description: Ошибка валидации
   *       401:
   *         description: Не авторизован
   *       500:
   *         description: Внутренняя ошибка сервера
   */
  router.post(
    "/",
    authenticationMiddleware,
    requireAnyRole([UserRole.ADMIN, UserRole.COACH, UserRole.PLAYER]),
    createValidationMiddleware({ body: createAISuggestionLogSchema }),
    createAISuggestionLog
  );

  /**
   * @swagger
   * /api/ai-suggestion-logs/search:
   *   get:
   *     summary: Поиск логов AI рекомендаций
   *     tags: [AI Suggestion Logs]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: suggestionType
   *         schema:
   *           type: string
   *           enum: [game_matching, court_fill_optimization, demand_prediction, rating_update]
   *         description: Тип AI рекомендации
   *       - in: query
   *         name: status
   *         schema:
   *           type: string
   *           enum: [pending, accepted, rejected]
   *         description: Статус рекомендации
   *       - in: query
   *         name: userId
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID пользователя
   *       - in: query
   *         name: startDate
   *         schema:
   *           type: string
   *           format: date-time
   *         description: Начальная дата
   *       - in: query
   *         name: endDate
   *         schema:
   *           type: string
   *           format: date-time
   *         description: Конечная дата
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 20
   *         description: Лимит результатов
   *       - in: query
   *         name: offset
   *         schema:
   *           type: integer
   *           minimum: 0
   *           default: 0
   *         description: Смещение
   *     responses:
   *       200:
   *         description: Список логов AI рекомендаций
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/AISuggestionLog'
   *       401:
   *         description: Не авторизован
   *       500:
   *         description: Внутренняя ошибка сервера
   */
  router.get(
    "/search",
    authenticationMiddleware,
    requireAnyRole([UserRole.ADMIN, UserRole.COACH]),
    createValidationMiddleware({ query: searchAISuggestionLogsSchema }),
    searchAISuggestionLogs
  );

  /**
   * @swagger
   * /api/ai-suggestion-logs/recent:
   *   get:
   *     summary: Получить недавние логи AI рекомендаций
   *     tags: [AI Suggestion Logs]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 50
   *           default: 10
   *         description: Лимит результатов
   *       - in: query
   *         name: suggestionType
   *         schema:
   *           type: string
   *           enum: [game_matching, court_fill_optimization, demand_prediction, rating_update]
   *         description: Тип AI рекомендации
   *     responses:
   *       200:
   *         description: Список недавних логов AI рекомендаций
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/AISuggestionLog'
   *       401:
   *         description: Не авторизован
   *       500:
   *         description: Внутренняя ошибка сервера
   */
  router.get(
    "/recent",
    authenticationMiddleware,
    requireAnyRole([UserRole.ADMIN, UserRole.COACH]),
    createValidationMiddleware({ query: getRecentLogsSchema }),
    getRecentAISuggestionLogs
  );

  /**
   * @swagger
   * /api/ai-suggestion-logs/stats:
   *   get:
   *     summary: Получить статистику AI рекомендаций
   *     tags: [AI Suggestion Logs]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: query
   *         name: startDate
   *         schema:
   *           type: string
   *           format: date-time
   *         description: Начальная дата
   *       - in: query
   *         name: endDate
   *         schema:
   *           type: string
   *           format: date-time
   *         description: Конечная дата
   *       - in: query
   *         name: groupBy
   *         schema:
   *           type: string
   *           enum: [type, status, date]
   *         description: Группировка статистики
   *     responses:
   *       200:
   *         description: Статистика AI рекомендаций
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: object
   *       401:
   *         description: Не авторизован
   *       403:
   *         description: Недостаточно прав
   *       500:
   *         description: Внутренняя ошибка сервера
   */
  router.get(
    "/stats",
    authenticationMiddleware,
    requireRole(UserRole.ADMIN),
    createValidationMiddleware({ query: getAISuggestionStatsSchema }),
    getAISuggestionStats
  );

  /**
   * @swagger
   * /api/ai-suggestion-logs/cleanup:
   *   post:
   *     summary: Очистить старые логи AI рекомендаций
   *     tags: [AI Suggestion Logs]
   *     security:
   *       - bearerAuth: []
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - olderThanDays
   *             properties:
   *               olderThanDays:
   *                 type: integer
   *                 minimum: 1
   *                 maximum: 365
   *                 description: Удалить логи старше указанного количества дней
   *               dryRun:
   *                 type: boolean
   *                 default: true
   *                 description: Режим предварительного просмотра (не удалять)
   *     responses:
   *       200:
   *         description: Результат очистки
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: object
   *                   properties:
   *                     deletedCount:
   *                       type: integer
   *                 message:
   *                   type: string
   *       401:
   *         description: Не авторизован
   *       403:
   *         description: Недостаточно прав
   *       500:
   *         description: Внутренняя ошибка сервера
   */
  router.post(
    "/cleanup",
    authenticationMiddleware,
    requireRole(UserRole.ADMIN),
    createValidationMiddleware({ body: cleanupAISuggestionLogsSchema }),
    cleanupAISuggestionLogs
  );

  /**
   * @swagger
   * /api/ai-suggestion-logs/user/{userId}:
   *   get:
   *     summary: Получить логи AI рекомендаций пользователя
   *     tags: [AI Suggestion Logs]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: userId
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID пользователя
   *       - in: query
   *         name: limit
   *         schema:
   *           type: integer
   *           minimum: 1
   *           maximum: 100
   *           default: 20
   *         description: Лимит результатов
   *       - in: query
   *         name: offset
   *         schema:
   *           type: integer
   *           minimum: 0
   *           default: 0
   *         description: Смещение
   *     responses:
   *       200:
   *         description: Список логов AI рекомендаций пользователя
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   type: array
   *                   items:
   *                     $ref: '#/components/schemas/AISuggestionLog'
   *       401:
   *         description: Не авторизован
   *       500:
   *         description: Внутренняя ошибка сервера
   */
  router.get(
    "/user/:userId",
    authenticationMiddleware,
    requireAnyRole([UserRole.ADMIN, UserRole.COACH]),
    getUserAISuggestionLogs
  );

  /**
   * @swagger
   * /api/ai-suggestion-logs/{id}:
   *   get:
   *     summary: Получить лог AI рекомендации по ID
   *     tags: [AI Suggestion Logs]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID лога AI рекомендации
   *     responses:
   *       200:
   *         description: Лог AI рекомендации
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   $ref: '#/components/schemas/AISuggestionLog'
   *       404:
   *         description: Лог не найден
   *       401:
   *         description: Не авторизован
   *       500:
   *         description: Внутренняя ошибка сервера
   */
  router.get(
    "/:id",
    authenticationMiddleware,
    requireAnyRole([UserRole.ADMIN, UserRole.COACH, UserRole.PLAYER]),
    getAISuggestionLogById
  );

  /**
   * @swagger
   * /api/ai-suggestion-logs/{id}:
   *   put:
   *     summary: Обновить лог AI рекомендации
   *     tags: [AI Suggestion Logs]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID лога AI рекомендации
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             $ref: '#/components/schemas/UpdateAISuggestionLogRequest'
   *     responses:
   *       200:
   *         description: Лог AI рекомендации успешно обновлен
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   $ref: '#/components/schemas/AISuggestionLog'
   *                 message:
   *                   type: string
   *       404:
   *         description: Лог не найден
   *       400:
   *         description: Ошибка валидации
   *       401:
   *         description: Не авторизован
   *       500:
   *         description: Внутренняя ошибка сервера
   */
  router.put(
    "/:id",
    authenticationMiddleware,
    requireAnyRole([UserRole.ADMIN, UserRole.COACH]),
    createValidationMiddleware({ body: updateAISuggestionLogSchema }),
    updateAISuggestionLog
  );

  /**
   * @swagger
   * /api/ai-suggestion-logs/{id}:
   *   delete:
   *     summary: Удалить лог AI рекомендации
   *     tags: [AI Suggestion Logs]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID лога AI рекомендации
   *     responses:
   *       200:
   *         description: Лог AI рекомендации успешно удален
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 message:
   *                   type: string
   *       404:
   *         description: Лог не найден
   *       401:
   *         description: Не авторизован
   *       403:
   *         description: Недостаточно прав
   *       500:
   *         description: Внутренняя ошибка сервера
   */
  router.delete(
    "/:id",
    authenticationMiddleware,
    requireRole(UserRole.ADMIN),
    deleteAISuggestionLog
  );

  /**
   * @swagger
   * /api/ai-suggestion-logs/{id}/accept:
   *   post:
   *     summary: Отметить AI рекомендацию как принятую
   *     tags: [AI Suggestion Logs]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID лога AI рекомендации
   *     responses:
   *       200:
   *         description: AI рекомендация отмечена как принятая
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   $ref: '#/components/schemas/AISuggestionLog'
   *                 message:
   *                   type: string
   *       404:
   *         description: Лог не найден
   *       401:
   *         description: Не авторизован
   *       500:
   *         description: Внутренняя ошибка сервера
   */
  router.post(
    "/:id/accept",
    authenticationMiddleware,
    requireAnyRole([UserRole.ADMIN, UserRole.COACH, UserRole.PLAYER]),
    markAsAccepted
  );

  /**
   * @swagger
   * /api/ai-suggestion-logs/{id}/reject:
   *   post:
   *     summary: Отметить AI рекомендацию как отклоненную
   *     tags: [AI Suggestion Logs]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID лога AI рекомендации
   *     responses:
   *       200:
   *         description: AI рекомендация отмечена как отклоненная
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   $ref: '#/components/schemas/AISuggestionLog'
   *                 message:
   *                   type: string
   *       404:
   *         description: Лог не найден
   *       401:
   *         description: Не авторизован
   *       500:
   *         description: Внутренняя ошибка сервера
   */
  router.post(
    "/:id/reject",
    authenticationMiddleware,
    requireAnyRole([UserRole.ADMIN, UserRole.COACH, UserRole.PLAYER]),
    markAsRejected
  );

  /**
   * @swagger
   * /api/ai-suggestion-logs/{id}/feedback:
   *   post:
   *     summary: Добавить обратную связь к AI рекомендации
   *     tags: [AI Suggestion Logs]
   *     security:
   *       - bearerAuth: []
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: string
   *           format: uuid
   *         description: ID лога AI рекомендации
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - feedback
   *             properties:
   *               feedback:
   *                 type: string
   *                 minLength: 1
   *                 description: Текст обратной связи
   *               rating:
   *                 type: integer
   *                 minimum: 1
   *                 maximum: 5
   *                 description: Оценка от 1 до 5
   *     responses:
   *       200:
   *         description: Обратная связь успешно добавлена
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 success:
   *                   type: boolean
   *                 data:
   *                   $ref: '#/components/schemas/AISuggestionLog'
   *                 message:
   *                   type: string
   *       404:
   *         description: Лог не найден
   *       400:
   *         description: Ошибка валидации
   *       401:
   *         description: Не авторизован
   *       500:
   *         description: Внутренняя ошибка сервера
   */
  router.post(
    "/:id/feedback",
    authenticationMiddleware,
    requireAnyRole([UserRole.ADMIN, UserRole.COACH, UserRole.PLAYER]),
    createValidationMiddleware({ body: processFeedbackSchema }),
    processFeedback
  );

  return router;
}
