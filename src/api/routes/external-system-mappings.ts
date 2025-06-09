import { Router } from "express";
import {
  authenticationMiddleware,
  requireAnyRole,
  UserRole,
} from "../middleware/auth";
import { createValidationMiddleware } from "../middleware/validator";
import {
  createExternalSystemMappingSchema,
  updateExternalSystemMappingSchema,
  updateSyncStatusSchema,
  bulkUpdateSyncStatusSchema,
  findByExternalIdQuerySchema,
  findByInternalEntityQuerySchema,
  findBySystemQuerySchema,
  findOutdatedQuerySchema,
  cleanupOldInactiveQuerySchema,
  paginationQuerySchema,
  mappingIdParamSchema,
} from "../validators/external-system-mappings";
import {
  createExternalSystemMapping,
  getExternalSystemMappingById,
  updateExternalSystemMapping,
  deleteExternalSystemMapping,
  findByExternalId,
  findByInternalEntity,
  findBySystem,
  getAllExternalSystemMappings,
  getActiveMappings,
  getMappingsWithConflicts,
  getOutdatedMappings,
  getMappingsWithErrors,
  updateSyncStatus,
  bulkUpdateSyncStatus,
  deactivateMapping,
  getMappingStats,
  findDuplicateMappings,
  cleanupOldInactiveMappings,
} from "../handlers/external-system-mappings";

const router = Router();

// Middleware для админов
const adminOnly = [authenticationMiddleware, requireAnyRole([UserRole.ADMIN])];

/**
 * @swagger
 * components:
 *   schemas:
 *     ExternalSystemMapping:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *           description: Уникальный идентификатор маппинга
 *         externalSystem:
 *           type: string
 *           enum: [exporta, google_calendar, whatsapp_api, telegram_api, payment_gateway_api, other]
 *           description: Внешняя система
 *         externalId:
 *           type: string
 *           maxLength: 255
 *           description: ID во внешней системе
 *         internalEntityType:
 *           type: string
 *           enum: [user, booking, court, class, venue, class_schedule, product, training_package_definition]
 *           description: Тип внутренней сущности
 *         internalEntityId:
 *           type: string
 *           format: uuid
 *           description: ID внутренней сущности
 *         isActive:
 *           type: boolean
 *           description: Активен ли маппинг
 *         lastSyncAt:
 *           type: string
 *           format: date-time
 *           description: Время последней синхронизации
 *         syncData:
 *           type: string
 *           description: JSON данные синхронизации
 *         hasConflict:
 *           type: boolean
 *           description: Есть ли конфликт
 *         conflictData:
 *           type: string
 *           description: JSON данные о конфликте
 *         lastError:
 *           type: string
 *           description: Последняя ошибка синхронизации
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *       required:
 *         - id
 *         - externalSystem
 *         - externalId
 *         - internalEntityType
 *         - internalEntityId
 *         - isActive
 *         - hasConflict
 *         - createdAt
 *         - updatedAt
 *       example:
 *         id: "123e4567-e89b-12d3-a456-426614174000"
 *         externalSystem: "exporta"
 *         externalId: "ext_user_123"
 *         internalEntityType: "user"
 *         internalEntityId: "456e7890-e89b-12d3-a456-426614174001"
 *         isActive: true
 *         lastSyncAt: "2024-01-15T10:30:00Z"
 *         syncData: "{\"lastSync\": \"2024-01-15T10:30:00Z\"}"
 *         hasConflict: false
 *         conflictData: null
 *         lastError: null
 *         createdAt: "2024-01-15T10:00:00Z"
 *         updatedAt: "2024-01-15T10:30:00Z"
 *
 *     CreateExternalSystemMappingRequest:
 *       type: object
 *       properties:
 *         externalSystem:
 *           type: string
 *           enum: [exporta, google_calendar, whatsapp_api, telegram_api, payment_gateway_api, other]
 *         externalId:
 *           type: string
 *           maxLength: 255
 *         internalEntityType:
 *           type: string
 *           enum: [user, booking, court, class, venue, class_schedule, product, training_package_definition]
 *         internalEntityId:
 *           type: string
 *           format: uuid
 *         isActive:
 *           type: boolean
 *           default: true
 *         syncData:
 *           type: string
 *         hasConflict:
 *           type: boolean
 *           default: false
 *         conflictData:
 *           type: string
 *         lastError:
 *           type: string
 *       required:
 *         - externalSystem
 *         - externalId
 *         - internalEntityType
 *         - internalEntityId
 *       example:
 *         externalSystem: "exporta"
 *         externalId: "ext_user_123"
 *         internalEntityType: "user"
 *         internalEntityId: "456e7890-e89b-12d3-a456-426614174001"
 *         isActive: true
 *         syncData: "{\"metadata\": \"value\"}"
 *
 *     UpdateSyncStatusRequest:
 *       type: object
 *       properties:
 *         syncData:
 *           type: string
 *         hasConflict:
 *           type: boolean
 *           default: false
 *         conflictData:
 *           type: string
 *         lastError:
 *           type: string
 *       example:
 *         syncData: "{\"lastSync\": \"2024-01-15T10:30:00Z\"}"
 *         hasConflict: false
 *
 *     BulkUpdateSyncStatusRequest:
 *       type: object
 *       properties:
 *         ids:
 *           type: array
 *           items:
 *             type: string
 *             format: uuid
 *           minItems: 1
 *         syncData:
 *           type: string
 *         hasConflict:
 *           type: boolean
 *           default: false
 *       required:
 *         - ids
 *       example:
 *         ids: ["123e4567-e89b-12d3-a456-426614174000", "456e7890-e89b-12d3-a456-426614174001"]
 *         syncData: "{\"bulkSync\": true}"
 *         hasConflict: false
 *
 *     MappingStats:
 *       type: object
 *       properties:
 *         total:
 *           type: number
 *           description: Общее количество маппингов
 *         active:
 *           type: number
 *           description: Количество активных маппингов
 *         withConflicts:
 *           type: number
 *           description: Количество маппингов с конфликтами
 *         withErrors:
 *           type: number
 *           description: Количество маппингов с ошибками
 *         bySystem:
 *           type: object
 *           additionalProperties:
 *             type: number
 *           description: Статистика по системам
 *       example:
 *         total: 150
 *         active: 140
 *         withConflicts: 5
 *         withErrors: 3
 *         bySystem:
 *           exporta: 80
 *           google_calendar: 45
 *           telegram_api: 25
 */

/**
 * @swagger
 * /api/external-system-mappings:
 *   get:
 *     summary: Получить список маппингов внешних систем
 *     tags: [External System Mappings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 50
 *         description: Количество записей на странице
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Смещение для пагинации
 *     responses:
 *       200:
 *         description: Список маппингов получен успешно
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ExternalSystemMapping'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: number
 *                     limit:
 *                       type: number
 *                     offset:
 *                       type: number
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *   post:
 *     summary: Создать новый маппинг внешней системы
 *     tags: [External System Mappings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateExternalSystemMappingRequest'
 *     responses:
 *       201:
 *         description: Маппинг создан успешно
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ExternalSystemMapping'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get(
  "/",
  ...adminOnly,
  createValidationMiddleware({ query: paginationQuerySchema }),
  getAllExternalSystemMappings
);

router.post(
  "/",
  ...adminOnly,
  createValidationMiddleware({ body: createExternalSystemMappingSchema }),
  createExternalSystemMapping
);

/**
 * @swagger
 * /api/external-system-mappings/{id}:
 *   get:
 *     summary: Получить маппинг по ID
 *     tags: [External System Mappings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID маппинга
 *     responses:
 *       200:
 *         description: Маппинг найден
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ExternalSystemMapping'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *   put:
 *     summary: Обновить маппинг
 *     tags: [External System Mappings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID маппинга
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateExternalSystemMappingRequest'
 *     responses:
 *       200:
 *         description: Маппинг обновлен успешно
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ExternalSystemMapping'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 *   delete:
 *     summary: Удалить маппинг
 *     tags: [External System Mappings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID маппинга
 *     responses:
 *       200:
 *         description: Маппинг удален успешно
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Mapping deleted successfully"
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get(
  "/:id",
  ...adminOnly,
  createValidationMiddleware({ params: mappingIdParamSchema }),
  getExternalSystemMappingById
);

router.put(
  "/:id",
  ...adminOnly,
  createValidationMiddleware({
    params: mappingIdParamSchema,
    body: updateExternalSystemMappingSchema,
  }),
  updateExternalSystemMapping
);

router.delete(
  "/:id",
  ...adminOnly,
  createValidationMiddleware({ params: mappingIdParamSchema }),
  deleteExternalSystemMapping
);

/**
 * @swagger
 * /api/external-system-mappings/search/external:
 *   get:
 *     summary: Найти маппинг по внешнему ID
 *     tags: [External System Mappings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: externalSystem
 *         required: true
 *         schema:
 *           type: string
 *           enum: [exporta, google_calendar, whatsapp_api, telegram_api, payment_gateway_api, other]
 *         description: Внешняя система
 *       - in: query
 *         name: externalId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID во внешней системе
 *     responses:
 *       200:
 *         description: Маппинг найден или null
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   oneOf:
 *                     - $ref: '#/components/schemas/ExternalSystemMapping'
 *                     - type: "null"
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get(
  "/search/external",
  ...adminOnly,
  createValidationMiddleware({ query: findByExternalIdQuerySchema }),
  findByExternalId
);

/**
 * @swagger
 * /api/external-system-mappings/search/internal:
 *   get:
 *     summary: Найти маппинги по внутренней сущности
 *     tags: [External System Mappings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: entityType
 *         required: true
 *         schema:
 *           type: string
 *           enum: [user, booking, court, class, venue, class_schedule, product, training_package_definition]
 *         description: Тип внутренней сущности
 *       - in: query
 *         name: entityId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID внутренней сущности
 *     responses:
 *       200:
 *         description: Маппинги найдены
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ExternalSystemMapping'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get(
  "/search/internal",
  ...adminOnly,
  createValidationMiddleware({ query: findByInternalEntityQuerySchema }),
  findByInternalEntity
);

/**
 * @swagger
 * /api/external-system-mappings/search/system:
 *   get:
 *     summary: Найти маппинги по системе
 *     tags: [External System Mappings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: externalSystem
 *         required: true
 *         schema:
 *           type: string
 *           enum: [exporta, google_calendar, whatsapp_api, telegram_api, payment_gateway_api, other]
 *         description: Внешняя система
 *     responses:
 *       200:
 *         description: Маппинги найдены
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ExternalSystemMapping'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get(
  "/search/system",
  ...adminOnly,
  createValidationMiddleware({ query: findBySystemQuerySchema }),
  findBySystem
);

/**
 * @swagger
 * /api/external-system-mappings/status/active:
 *   get:
 *     summary: Получить активные маппинги
 *     tags: [External System Mappings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Активные маппинги получены
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ExternalSystemMapping'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get("/filter/active", ...adminOnly, getActiveMappings);

/**
 * @swagger
 * /api/external-system-mappings/status/conflicts:
 *   get:
 *     summary: Получить маппинги с конфликтами
 *     tags: [External System Mappings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Маппинги с конфликтами получены
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ExternalSystemMapping'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get("/filter/conflicts", ...adminOnly, getMappingsWithConflicts);

/**
 * @swagger
 * /api/external-system-mappings/status/outdated:
 *   get:
 *     summary: Получить устаревшие маппинги
 *     tags: [External System Mappings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: daysOld
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 365
 *           default: 7
 *         description: Количество дней для определения устаревших маппингов
 *     responses:
 *       200:
 *         description: Устаревшие маппинги получены
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ExternalSystemMapping'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get(
  "/filter/outdated",
  ...adminOnly,
  createValidationMiddleware({ query: findOutdatedQuerySchema }),
  getOutdatedMappings
);

/**
 * @swagger
 * /api/external-system-mappings/status/errors:
 *   get:
 *     summary: Получить маппинги с ошибками
 *     tags: [External System Mappings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Маппинги с ошибками получены
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ExternalSystemMapping'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get("/filter/errors", ...adminOnly, getMappingsWithErrors);

/**
 * @swagger
 * /api/external-system-mappings/{id}/sync:
 *   put:
 *     summary: Обновить статус синхронизации маппинга
 *     tags: [External System Mappings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID маппинга
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateSyncStatusRequest'
 *     responses:
 *       200:
 *         description: Статус синхронизации обновлен
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ExternalSystemMapping'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.patch(
  "/:id/sync-status",
  ...adminOnly,
  createValidationMiddleware({
    params: mappingIdParamSchema,
    body: updateSyncStatusSchema,
  }),
  updateSyncStatus
);

/**
 * @swagger
 * /api/external-system-mappings/sync/bulk:
 *   put:
 *     summary: Массовое обновление статуса синхронизации
 *     tags: [External System Mappings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BulkUpdateSyncStatusRequest'
 *     responses:
 *       200:
 *         description: Статус синхронизации обновлен для нескольких маппингов
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     updatedCount:
 *                       type: number
 *                       description: Количество обновленных маппингов
 *                     totalRequested:
 *                       type: number
 *                       description: Общее количество запрошенных для обновления
 *                   example:
 *                     updatedCount: 5
 *                     totalRequested: 5
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.patch(
  "/bulk/sync-status",
  ...adminOnly,
  createValidationMiddleware({ body: bulkUpdateSyncStatusSchema }),
  bulkUpdateSyncStatus
);

/**
 * @swagger
 * /api/external-system-mappings/{id}/deactivate:
 *   put:
 *     summary: Деактивировать маппинг
 *     tags: [External System Mappings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID маппинга
 *     responses:
 *       200:
 *         description: Маппинг деактивирован
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/ExternalSystemMapping'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.patch(
  "/:id/deactivate",
  ...adminOnly,
  createValidationMiddleware({ params: mappingIdParamSchema }),
  deactivateMapping
);

/**
 * @swagger
 * /api/external-system-mappings/stats:
 *   get:
 *     summary: Получить статистику маппингов
 *     tags: [External System Mappings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Статистика получена
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/MappingStats'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get("/analytics/stats", ...adminOnly, getMappingStats);

/**
 * @swagger
 * /api/external-system-mappings/duplicates:
 *   get:
 *     summary: Найти дублирующиеся маппинги
 *     tags: [External System Mappings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Дублирующиеся маппинги найдены
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/ExternalSystemMapping'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get("/analytics/duplicates", ...adminOnly, findDuplicateMappings);

/**
 * @swagger
 * /api/external-system-mappings/cleanup:
 *   delete:
 *     summary: Очистить старые неактивные маппинги
 *     tags: [External System Mappings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: daysOld
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 365
 *           default: 30
 *         description: Количество дней для определения старых маппингов
 *     responses:
 *       200:
 *         description: Старые маппинги очищены
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     cleanedCount:
 *                       type: number
 *                       description: Количество удаленных маппингов
 *                   example:
 *                     cleanedCount: 15
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete(
  "/cleanup/inactive",
  ...adminOnly,
  createValidationMiddleware({ query: cleanupOldInactiveQuerySchema }),
  cleanupOldInactiveMappings
);

export default router;
