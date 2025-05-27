import { Router } from "express";
import {
  createBonusTransaction,
  getBonusTransactionById,
  getUserBonusTransactions,
  getBonusTransactionsByType,
  getBonusTransactionsByDateRange,
  getUserBonusBalance,
  getUserBalanceHistory,
  getUserBonusSummary,
  getExpiringBonuses,
  getExpiredBonuses,
  updateBonusTransaction,
  deleteBonusTransaction,
  getBonusStats,
} from "../handlers/bonus-transactions";
import { authenticationMiddleware } from "../middleware/auth";

const router = Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     BonusTransaction:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Уникальный идентификатор транзакции
 *         userId:
 *           type: string
 *           format: uuid
 *           description: ID пользователя
 *         transactionType:
 *           type: string
 *           enum: [earned, spent]
 *           description: Тип транзакции
 *         pointsChange:
 *           type: integer
 *           description: Изменение баллов
 *         currentBalanceAfter:
 *           type: integer
 *           description: Баланс после операции
 *         description:
 *           type: string
 *           description: Описание транзакции
 *         relatedOrderId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           description: ID связанного заказа
 *         relatedBookingId:
 *           type: string
 *           format: uuid
 *           nullable: true
 *           description: ID связанного бронирования
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           description: Дата истечения бонусов
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: Дата создания
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: Дата обновления
 *
 *     CreateBonusTransactionRequest:
 *       type: object
 *       required:
 *         - userId
 *         - transactionType
 *         - pointsChange
 *         - description
 *       properties:
 *         userId:
 *           type: string
 *           format: uuid
 *           description: ID пользователя
 *         transactionType:
 *           type: string
 *           enum: [earned, spent]
 *           description: Тип транзакции
 *         pointsChange:
 *           type: integer
 *           minimum: 1
 *           description: Количество баллов
 *         description:
 *           type: string
 *           maxLength: 500
 *           description: Описание транзакции
 *         relatedOrderId:
 *           type: string
 *           format: uuid
 *           description: ID связанного заказа
 *         relatedBookingId:
 *           type: string
 *           format: uuid
 *           description: ID связанного бронирования
 *         expiresAt:
 *           type: string
 *           format: date-time
 *           description: Дата истечения бонусов
 *
 *     BonusBalance:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *           format: uuid
 *           description: ID пользователя
 *         currentBalance:
 *           type: integer
 *           description: Текущий баланс бонусов
 *
 *     BonusSummary:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *           format: uuid
 *           description: ID пользователя
 *         totalEarned:
 *           type: integer
 *           description: Всего начислено
 *         totalSpent:
 *           type: integer
 *           description: Всего потрачено
 *         currentBalance:
 *           type: integer
 *           description: Текущий баланс
 *         transactionCount:
 *           type: integer
 *           description: Количество транзакций
 *
 *     BonusStats:
 *       type: object
 *       properties:
 *         totalTransactions:
 *           type: integer
 *           description: Общее количество транзакций
 *         totalEarned:
 *           type: integer
 *           description: Всего начислено баллов
 *         totalSpent:
 *           type: integer
 *           description: Всего потрачено баллов
 *         activeUsers:
 *           type: integer
 *           description: Количество активных пользователей
 */

/**
 * @swagger
 * /api/bonus-transactions:
 *   post:
 *     summary: Создать новую бонусную транзакцию
 *     tags: [Bonus Transactions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateBonusTransactionRequest'
 *     responses:
 *       201:
 *         description: Транзакция успешно создана
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/BonusTransaction'
 *       400:
 *         description: Недостаточно бонусных баллов или неверные данные
 *       401:
 *         description: Не авторизован
 *       500:
 *         description: Внутренняя ошибка сервера
 */
router.post("/", authenticationMiddleware, createBonusTransaction);

/**
 * @swagger
 * /api/bonus-transactions/{id}:
 *   get:
 *     summary: Получить транзакцию по ID
 *     tags: [Bonus Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID транзакции
 *     responses:
 *       200:
 *         description: Транзакция найдена
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/BonusTransaction'
 *       404:
 *         description: Транзакция не найдена
 *       401:
 *         description: Не авторизован
 */
router.get("/:id", authenticationMiddleware, getBonusTransactionById);

/**
 * @swagger
 * /api/bonus-transactions/{id}:
 *   put:
 *     summary: Обновить транзакцию
 *     tags: [Bonus Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID транзакции
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               description:
 *                 type: string
 *                 maxLength: 500
 *               expiresAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Транзакция обновлена
 *       404:
 *         description: Транзакция не найдена
 *       401:
 *         description: Не авторизован
 */
router.put("/:id", authenticationMiddleware, updateBonusTransaction);

/**
 * @swagger
 * /api/bonus-transactions/{id}:
 *   delete:
 *     summary: Удалить транзакцию
 *     tags: [Bonus Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID транзакции
 *     responses:
 *       200:
 *         description: Транзакция удалена
 *       404:
 *         description: Транзакция не найдена
 *       401:
 *         description: Не авторизован
 */
router.delete("/:id", authenticationMiddleware, deleteBonusTransaction);

/**
 * @swagger
 * /api/bonus-transactions/user/{userId}:
 *   get:
 *     summary: Получить транзакции пользователя
 *     tags: [Bonus Transactions]
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
 *           enum: [earned, spent]
 *         description: Тип транзакций
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: Количество записей
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Смещение
 *     responses:
 *       200:
 *         description: Список транзакций пользователя
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
 *                     $ref: '#/components/schemas/BonusTransaction'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     limit:
 *                       type: integer
 *                     offset:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     hasMore:
 *                       type: boolean
 */
router.get("/user/:userId", authenticationMiddleware, getUserBonusTransactions);

/**
 * @swagger
 * /api/bonus-transactions/user/{userId}/balance:
 *   get:
 *     summary: Получить текущий баланс пользователя
 *     tags: [Bonus Transactions]
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
 *     responses:
 *       200:
 *         description: Текущий баланс пользователя
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/BonusBalance'
 */
router.get("/user/:userId/balance", authenticationMiddleware, getUserBonusBalance);

/**
 * @swagger
 * /api/bonus-transactions/user/{userId}/history:
 *   get:
 *     summary: Получить историю баланса пользователя
 *     tags: [Bonus Transactions]
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
 *           maximum: 50
 *           default: 20
 *         description: Количество записей
 *     responses:
 *       200:
 *         description: История баланса пользователя
 */
router.get("/user/:userId/history", authenticationMiddleware, getUserBalanceHistory);

/**
 * @swagger
 * /api/bonus-transactions/user/{userId}/summary:
 *   get:
 *     summary: Получить сводку по бонусам пользователя
 *     tags: [Bonus Transactions]
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
 *     responses:
 *       200:
 *         description: Сводка по бонусам пользователя
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/BonusSummary'
 */
router.get("/user/:userId/summary", authenticationMiddleware, getUserBonusSummary);

/**
 * @swagger
 * /api/bonus-transactions/type/{type}:
 *   get:
 *     summary: Получить транзакции по типу
 *     tags: [Bonus Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *           enum: [earned, spent]
 *         description: Тип транзакций
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *     responses:
 *       200:
 *         description: Список транзакций по типу
 */
router.get("/type", authenticationMiddleware, getBonusTransactionsByType);

/**
 * @swagger
 * /api/bonus-transactions/date-range:
 *   get:
 *     summary: Получить транзакции за период
 *     tags: [Bonus Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         required: true
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Начальная дата
 *       - in: query
 *         name: endDate
 *         required: true
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
 *           default: 50
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *     responses:
 *       200:
 *         description: Список транзакций за период
 */
router.get("/date-range", authenticationMiddleware, getBonusTransactionsByDateRange);

/**
 * @swagger
 * /api/bonus-transactions/expiring:
 *   get:
 *     summary: Получить истекающие бонусы
 *     tags: [Bonus Transactions]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: daysAhead
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 365
 *           default: 30
 *         description: Количество дней вперед
 *     responses:
 *       200:
 *         description: Список истекающих бонусов
 */
router.get("/expiring", authenticationMiddleware, getExpiringBonuses);

/**
 * @swagger
 * /api/bonus-transactions/expired:
 *   get:
 *     summary: Получить просроченные бонусы
 *     tags: [Bonus Transactions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Список просроченных бонусов
 */
router.get("/expired", authenticationMiddleware, getExpiredBonuses);

/**
 * @swagger
 * /api/bonus-transactions/stats:
 *   get:
 *     summary: Получить общую статистику по бонусам
 *     tags: [Bonus Transactions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Общая статистика по бонусам
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/BonusStats'
 */
router.get("/stats", authenticationMiddleware, getBonusStats);

export default router;
