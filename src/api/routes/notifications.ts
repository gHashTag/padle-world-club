/**
 * Routes для API уведомлений
 * Содержит все маршруты для работы с уведомлениями
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
  createNotificationSchema,
  updateNotificationSchema,
  bulkCreateNotificationSchema,
  bulkUpdateStatusSchema,
  searchNotificationsSchema,
  getStatsSchema,
  cleanupNotificationsSchema,
} from "../validators/notifications";
import {
  createNotification,
  getNotificationById,
  updateNotification,
  deleteNotification,
  searchNotifications,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  markAsSent,
  bulkCreateNotifications,
  bulkUpdateStatus,
  getNotificationStats,
  getUnsentNotifications,
  cleanupNotifications,
} from "../handlers/notifications";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Уникальный идентификатор уведомления
 *         userId:
 *           type: string
 *           format: uuid
 *           description: ID пользователя
 *         type:
 *           type: string
 *           enum: [booking_reminder, game_invite, tournament_update, payment_confirmation, package_expiration, custom_message, stock_alert]
 *           description: Тип уведомления
 *         message:
 *           type: string
 *           description: Текст уведомления
 *         channel:
 *           type: string
 *           enum: [whatsapp, telegram, email, app_push]
 *           description: Канал отправки
 *         isRead:
 *           type: boolean
 *           description: Прочитано ли уведомление
 *         isSent:
 *           type: boolean
 *           description: Отправлено ли уведомление
 *         relatedEntityId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           description: ID связанной сущности
 *         relatedEntityType:
 *           type: string
 *           enum: [booking, user, court, venue, tournament, class_schedule, game_session, order, payment, product, training_package, task]
 *           nullable: true
 *           description: Тип связанной сущности
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Дата создания
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Дата обновления
 *         readAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Дата прочтения
 *         sentAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Дата отправки
 *
 *     CreateNotificationRequest:
 *       type: object
 *       required:
 *         - userId
 *         - type
 *         - message
 *         - channel
 *       properties:
 *         userId:
 *           type: string
 *           format: uuid
 *         type:
 *           type: string
 *           enum: [booking_reminder, game_invite, tournament_update, payment_confirmation, package_expiration, custom_message, stock_alert]
 *         message:
 *           type: string
 *           maxLength: 1000
 *         channel:
 *           type: string
 *           enum: [whatsapp, telegram, email, app_push]
 *         relatedEntityId:
 *           type: string
 *           format: uuid
 *         relatedEntityType:
 *           type: string
 *           enum: [booking, user, court, venue, tournament, class_schedule, game_session, order, payment, product, training_package, task]
 *
 *     UpdateNotificationRequest:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           maxLength: 1000
 *         channel:
 *           type: string
 *           enum: [whatsapp, telegram, email, app_push]
 *         isRead:
 *           type: boolean
 *         isSent:
 *           type: boolean
 *         relatedEntityId:
 *           type: string
 *           format: uuid
 *         relatedEntityType:
 *           type: string
 *           enum: [booking, user, court, venue, tournament, class_schedule, game_session, order, payment, product, training_package, task]
 *
 *     NotificationStats:
 *       type: object
 *       properties:
 *         total:
 *           type: integer
 *         unread:
 *           type: integer
 *         unsent:
 *           type: integer
 *         byType:
 *           type: object
 *         byChannel:
 *           type: object
 *         recent:
 *           type: integer
 *
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /api/notifications:
 *   post:
 *     summary: Создать новое уведомление
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateNotificationRequest'
 *     responses:
 *       201:
 *         description: Уведомление создано успешно
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Notification'
 *                 message:
 *                   type: string
 *       400:
 *         description: Ошибка валидации
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Пользователь не найден
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.post(
  "/",
  authenticationMiddleware,
  requireAnyRole([UserRole.ADMIN, UserRole.COACH]),
  createValidationMiddleware({ body: createNotificationSchema }),
  createNotification
);

/**
 * @swagger
 * /api/notifications/search:
 *   get:
 *     summary: Поиск уведомлений с фильтрацией
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID пользователя
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [booking_reminder, game_invite, tournament_update, payment_confirmation, package_expiration, custom_message, stock_alert]
 *         description: Тип уведомления
 *       - in: query
 *         name: channel
 *         schema:
 *           type: string
 *           enum: [whatsapp, telegram, email, app_push]
 *         description: Канал отправки
 *       - in: query
 *         name: isRead
 *         schema:
 *           type: boolean
 *         description: Статус прочтения
 *       - in: query
 *         name: isSent
 *         schema:
 *           type: boolean
 *         description: Статус отправки
 *       - in: query
 *         name: message
 *         schema:
 *           type: string
 *         description: Поиск по тексту сообщения
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
 *         name: page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Номер страницы
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Количество элементов на странице
 *     responses:
 *       200:
 *         description: Список уведомлений
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
 *                     $ref: '#/components/schemas/Notification'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     hasNext:
 *                       type: boolean
 *                     hasPrev:
 *                       type: boolean
 *       400:
 *         description: Ошибка валидации
 *       401:
 *         description: Не авторизован
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.get(
  "/search",
  authenticationMiddleware,
  requireAnyRole([UserRole.ADMIN, UserRole.COACH]),
  createValidationMiddleware({ query: searchNotificationsSchema }),
  searchNotifications
);

/**
 * @swagger
 * /api/notifications/stats:
 *   get:
 *     summary: Получить статистику уведомлений
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID пользователя (для фильтрации)
 *       - in: query
 *         name: days
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 365
 *           default: 30
 *         description: Количество дней для анализа
 *       - in: query
 *         name: groupBy
 *         schema:
 *           type: string
 *           enum: [type, channel, user, date]
 *         description: Группировка данных
 *     responses:
 *       200:
 *         description: Статистика уведомлений
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
 *                     stats:
 *                       $ref: '#/components/schemas/NotificationStats'
 *                     groupedData:
 *                       type: object
 *       401:
 *         description: Не авторизован
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.get(
  "/stats",
  authenticationMiddleware,
  requireAnyRole([UserRole.ADMIN, UserRole.COACH]),
  createValidationMiddleware({ query: getStatsSchema }),
  getNotificationStats
);

/**
 * @swagger
 * /api/notifications/unsent:
 *   get:
 *     summary: Получить неотправленные уведомления
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: channel
 *         schema:
 *           type: string
 *           enum: [whatsapp, telegram, email, app_push]
 *         description: Фильтр по каналу
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: Максимальное количество
 *     responses:
 *       200:
 *         description: Список неотправленных уведомлений
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
 *                     $ref: '#/components/schemas/Notification'
 *       401:
 *         description: Не авторизован
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.get(
  "/unsent",
  authenticationMiddleware,
  requireAnyRole([UserRole.ADMIN, UserRole.COACH]),
  getUnsentNotifications
);

/**
 * @swagger
 * /api/notifications/bulk:
 *   post:
 *     summary: Массовое создание уведомлений
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - notifications
 *             properties:
 *               notifications:
 *                 type: array
 *                 minItems: 1
 *                 maxItems: 100
 *                 items:
 *                   $ref: '#/components/schemas/CreateNotificationRequest'
 *     responses:
 *       201:
 *         description: Уведомления созданы
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
 *                     created:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Notification'
 *                     errors:
 *                       type: array
 *                       items:
 *                         type: object
 *                     stats:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: integer
 *                         successful:
 *                           type: integer
 *                         failed:
 *                           type: integer
 *       400:
 *         description: Ошибка валидации
 *       401:
 *         description: Не авторизован
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.post(
  "/bulk",
  authenticationMiddleware,
  requireAnyRole([UserRole.ADMIN, UserRole.COACH]),
  createValidationMiddleware({ body: bulkCreateNotificationSchema }),
  bulkCreateNotifications
);

/**
 * @swagger
 * /api/notifications/bulk/status:
 *   patch:
 *     summary: Массовое обновление статуса уведомлений
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - notificationIds
 *             properties:
 *               notificationIds:
 *                 type: array
 *                 minItems: 1
 *                 maxItems: 100
 *                 items:
 *                   type: string
 *                   format: uuid
 *               isRead:
 *                 type: boolean
 *               isSent:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Статус обновлен
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
 *                     updatedCount:
 *                       type: integer
 *       400:
 *         description: Ошибка валидации
 *       401:
 *         description: Не авторизован
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.patch(
  "/bulk/status",
  authenticationMiddleware,
  requireAnyRole([UserRole.ADMIN, UserRole.COACH]),
  createValidationMiddleware({ body: bulkUpdateStatusSchema }),
  bulkUpdateStatus
);

/**
 * @swagger
 * /api/notifications/cleanup:
 *   post:
 *     summary: Очистка старых уведомлений
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               days:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 365
 *                 default: 30
 *                 description: Возраст уведомлений в днях
 *               onlyRead:
 *                 type: boolean
 *                 default: true
 *                 description: Удалять только прочитанные
 *               dryRun:
 *                 type: boolean
 *                 default: false
 *                 description: Только подсчет без удаления
 *     responses:
 *       200:
 *         description: Очистка выполнена
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
 *                     dryRun:
 *                       type: boolean
 *                     toDeleteCount:
 *                       type: integer
 *       400:
 *         description: Ошибка валидации
 *       401:
 *         description: Не авторизован
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.post(
  "/cleanup",
  authenticationMiddleware,
  requireRole(UserRole.ADMIN),
  createValidationMiddleware({ body: cleanupNotificationsSchema }),
  cleanupNotifications
);

/**
 * @swagger
 * /api/notifications/users/{userId}:
 *   get:
 *     summary: Получить уведомления пользователя
 *     tags: [Notifications]
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
 *         name: isRead
 *         schema:
 *           type: boolean
 *         description: Фильтр по статусу прочтения
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Количество элементов
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Смещение
 *     responses:
 *       200:
 *         description: Уведомления пользователя
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
 *                     $ref: '#/components/schemas/Notification'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     limit:
 *                       type: integer
 *                     offset:
 *                       type: integer
 *                     total:
 *                       type: integer
 *       401:
 *         description: Не авторизован
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.get("/users/:userId", authenticationMiddleware, getUserNotifications);

/**
 * @swagger
 * /api/notifications/users/{userId}/mark-all-read:
 *   patch:
 *     summary: Отметить все уведомления пользователя как прочитанные
 *     tags: [Notifications]
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
 *         name: type
 *         schema:
 *           type: string
 *           enum: [booking_reminder, game_invite, tournament_update, payment_confirmation, package_expiration, custom_message, stock_alert]
 *         description: Фильтр по типу уведомления
 *     responses:
 *       200:
 *         description: Уведомления отмечены как прочитанные
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
 *                     updatedCount:
 *                       type: integer
 *       401:
 *         description: Не авторизован
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.patch(
  "/users/:userId/mark-all-read",
  authenticationMiddleware,
  markAllAsRead
);

/**
 * @swagger
 * /api/notifications/{id}:
 *   get:
 *     summary: Получить уведомление по ID
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID уведомления
 *     responses:
 *       200:
 *         description: Данные уведомления
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Notification'
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Уведомление не найдено
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.get("/:id", authenticationMiddleware, getNotificationById);

/**
 * @swagger
 * /api/notifications/{id}:
 *   patch:
 *     summary: Обновить уведомление
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID уведомления
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateNotificationRequest'
 *     responses:
 *       200:
 *         description: Уведомление обновлено
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Notification'
 *       400:
 *         description: Ошибка валидации
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Уведомление не найдено
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.patch(
  "/:id",
  authenticationMiddleware,
  requireAnyRole([UserRole.ADMIN, UserRole.COACH]),
  createValidationMiddleware({ body: updateNotificationSchema }),
  updateNotification
);

/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     summary: Удалить уведомление
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID уведомления
 *     responses:
 *       200:
 *         description: Уведомление удалено
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Уведомление не найдено
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.delete(
  "/:id",
  authenticationMiddleware,
  requireAnyRole([UserRole.ADMIN, UserRole.COACH]),
  deleteNotification
);

/**
 * @swagger
 * /api/notifications/{id}/mark-read:
 *   patch:
 *     summary: Отметить уведомление как прочитанное
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID уведомления
 *     responses:
 *       200:
 *         description: Уведомление отмечено как прочитанное
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Notification'
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Уведомление не найдено
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.patch("/:id/mark-read", authenticationMiddleware, markAsRead);

/**
 * @swagger
 * /api/notifications/{id}/mark-sent:
 *   patch:
 *     summary: Отметить уведомление как отправленное
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID уведомления
 *     responses:
 *       200:
 *         description: Уведомление отмечено как отправленное
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Notification'
 *       401:
 *         description: Не авторизован
 *       404:
 *         description: Уведомление не найдено
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.patch(
  "/:id/mark-sent",
  authenticationMiddleware,
  requireAnyRole([UserRole.ADMIN, UserRole.COACH]),
  markAsSent
);

export default router;
