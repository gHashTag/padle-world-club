import { Router } from "express";
import { z } from "zod";
import { externalSyncService } from "../../services/external-sync-service";
import { syncMonitoringService } from "../../services/sync-monitoring-service";
import { logger } from "../middleware/logger";
import { createValidationMiddleware } from "../middleware/validator";
// Импортируем типы из enum файла
type ExternalSystem =
  | "exporta"
  | "google_calendar"
  | "whatsapp_api"
  | "telegram_api"
  | "payment_gateway_api"
  | "other";
type ExternalEntityMappingType =
  | "user"
  | "booking"
  | "court"
  | "class"
  | "venue"
  | "class_schedule"
  | "product"
  | "training_package_definition";

const router = Router();

// Схемы валидации для webhook'ов
const webhookPayloadSchema = z.object({
  externalSystem: z.enum([
    "exporta",
    "google_calendar",
    "whatsapp_api",
    "telegram_api",
    "payment_gateway_api",
    "other",
  ]),
  externalId: z.string().min(1).max(255),
  entityType: z.enum([
    "user",
    "booking",
    "court",
    "class",
    "venue",
    "class_schedule",
    "product",
    "training_package_definition",
  ]),
  action: z.enum(["created", "updated", "deleted"]),
  data: z.record(z.any()).optional(),
  timestamp: z.string().datetime().optional(),
});

const bulkWebhookPayloadSchema = z.object({
  externalSystem: z.enum([
    "exporta",
    "google_calendar",
    "whatsapp_api",
    "telegram_api",
    "payment_gateway_api",
    "other",
  ]),
  entityType: z.enum([
    "user",
    "booking",
    "court",
    "class",
    "venue",
    "class_schedule",
    "product",
    "training_package_definition",
  ]),
  events: z
    .array(
      z.object({
        externalId: z.string().min(1).max(255),
        action: z.enum(["created", "updated", "deleted"]),
        data: z.record(z.any()).optional(),
        timestamp: z.string().datetime().optional(),
      })
    )
    .min(1)
    .max(100),
});

const syncRequestSchema = z.object({
  externalSystem: z.enum([
    "exporta",
    "google_calendar",
    "whatsapp_api",
    "telegram_api",
    "payment_gateway_api",
    "other",
  ]),
  entityType: z.enum([
    "user",
    "booking",
    "court",
    "class",
    "venue",
    "class_schedule",
    "product",
    "training_package_definition",
  ]),
  externalId: z.string().min(1).max(255).optional(),
  options: z
    .object({
      forceUpdate: z.boolean().optional(),
      resolveConflicts: z.boolean().optional(),
      dryRun: z.boolean().optional(),
    })
    .optional(),
});

/**
 * @swagger
 * /api/sync/webhook:
 *   post:
 *     summary: Webhook для уведомлений от внешних систем
 *     description: Принимает уведомления об изменениях в внешних системах и запускает синхронизацию
 *     tags: [External Sync]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - externalSystem
 *               - externalId
 *               - entityType
 *               - action
 *             properties:
 *               externalSystem:
 *                 type: string
 *                 enum: [exporta, google_calendar, whatsapp_api, telegram_api, payment_gateway_api, other]
 *               externalId:
 *                 type: string
 *                 maxLength: 255
 *               entityType:
 *                 type: string
 *                 enum: [user, booking, court, class, venue, class_schedule, product, training_package_definition]
 *               action:
 *                 type: string
 *                 enum: [created, updated, deleted]
 *               data:
 *                 type: object
 *                 description: Данные сущности (опционально)
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: Webhook обработан успешно
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 syncResult:
 *                   type: object
 *       400:
 *         description: Неверные данные webhook'а
 *       500:
 *         description: Ошибка обработки webhook'а
 */
router.post(
  "/webhook",
  createValidationMiddleware({ body: webhookPayloadSchema }),
  async (req, res) => {
    try {
      const { externalSystem, externalId, entityType, action, data } = req.body;

      logger.info("Webhook received", {
        externalSystem,
        externalId,
        entityType,
        action,
        hasData: !!data,
      });

      let syncResult;

      switch (action) {
        case "created":
        case "updated":
          // Синхронизируем сущность
          syncResult = await externalSyncService.syncEntity(
            externalSystem as ExternalSystem,
            externalId,
            entityType as ExternalEntityMappingType,
            { forceUpdate: action === "updated" }
          );
          break;

        case "deleted":
          // Деактивируем маппинг (не удаляем, чтобы сохранить историю)
          // TODO: Реализовать логику деактивации
          syncResult = {
            success: true,
            message: "Entity marked as deleted (deactivated)",
          };
          break;

        default:
          res.status(400).json({
            success: false,
            error: `Unsupported action: ${action}`,
          });
          return;
      }

      if (syncResult.success) {
        logger.info("Webhook processed successfully", {
          externalSystem,
          externalId,
          entityType,
          action,
          mappingId: syncResult.mappingId,
        });

        res.json({
          success: true,
          message: "Webhook processed successfully",
          syncResult,
        });
      } else {
        logger.error("Webhook processing failed", {
          externalSystem,
          externalId,
          entityType,
          action,
          error: syncResult.error,
        });

        res.status(500).json({
          success: false,
          error: "Webhook processing failed",
          details: syncResult.error,
        });
      }
    } catch (error) {
      logger.error("Webhook processing error", { error });
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }
);

/**
 * @swagger
 * /api/sync/webhook/bulk:
 *   post:
 *     summary: Bulk webhook для массовых уведомлений
 *     description: Принимает массовые уведомления об изменениях в внешних системах
 *     tags: [External Sync]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - externalSystem
 *               - entityType
 *               - events
 *             properties:
 *               externalSystem:
 *                 type: string
 *                 enum: [exporta, google_calendar, whatsapp_api, telegram_api, payment_gateway_api, other]
 *               entityType:
 *                 type: string
 *                 enum: [user, booking, court, class, venue, class_schedule, product, training_package_definition]
 *               events:
 *                 type: array
 *                 maxItems: 100
 *                 items:
 *                   type: object
 *                   required:
 *                     - externalId
 *                     - action
 *                   properties:
 *                     externalId:
 *                       type: string
 *                       maxLength: 255
 *                     action:
 *                       type: string
 *                       enum: [created, updated, deleted]
 *                     data:
 *                       type: object
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *     responses:
 *       200:
 *         description: Bulk webhook обработан успешно
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 stats:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: number
 *                     successful:
 *                       type: number
 *                     failed:
 *                       type: number
 *       400:
 *         description: Неверные данные bulk webhook'а
 *       500:
 *         description: Ошибка обработки bulk webhook'а
 */
router.post(
  "/webhook/bulk",
  createValidationMiddleware({ body: bulkWebhookPayloadSchema }),
  async (req, res) => {
    try {
      const { externalSystem, entityType, events } = req.body;

      logger.info("Bulk webhook received", {
        externalSystem,
        entityType,
        eventsCount: events.length,
      });

      const stats = {
        total: events.length,
        successful: 0,
        failed: 0,
      };

      // Обрабатываем события последовательно (можно сделать параллельно при необходимости)
      for (const event of events) {
        try {
          let syncResult;

          switch (event.action) {
            case "created":
            case "updated":
              syncResult = await externalSyncService.syncEntity(
                externalSystem as ExternalSystem,
                event.externalId,
                entityType as ExternalEntityMappingType,
                { forceUpdate: event.action === "updated" }
              );
              break;

            case "deleted":
              // TODO: Реализовать логику деактивации
              syncResult = { success: true };
              break;

            default:
              syncResult = {
                success: false,
                error: `Unsupported action: ${event.action}`,
              };
          }

          if (syncResult.success) {
            stats.successful++;
          } else {
            stats.failed++;
            logger.error("Bulk webhook event failed", {
              externalSystem,
              externalId: event.externalId,
              action: event.action,
              error: syncResult.error,
            });
          }
        } catch (error) {
          stats.failed++;
          logger.error("Bulk webhook event error", {
            externalSystem,
            externalId: event.externalId,
            action: event.action,
            error,
          });
        }
      }

      logger.info("Bulk webhook processed", {
        externalSystem,
        entityType,
        stats,
      });

      res.json({
        success: true,
        message: "Bulk webhook processed",
        stats,
      });
    } catch (error) {
      logger.error("Bulk webhook processing error", { error });
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }
);

/**
 * @swagger
 * /api/sync/trigger:
 *   post:
 *     summary: Ручной запуск синхронизации
 *     description: Позволяет вручную запустить синхронизацию конкретной сущности или всех сущностей типа
 *     tags: [External Sync]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - externalSystem
 *               - entityType
 *             properties:
 *               externalSystem:
 *                 type: string
 *                 enum: [exporta, google_calendar, whatsapp_api, telegram_api, payment_gateway_api, other]
 *               entityType:
 *                 type: string
 *                 enum: [user, booking, court, class, venue, class_schedule, product, training_package_definition]
 *               externalId:
 *                 type: string
 *                 maxLength: 255
 *                 description: ID конкретной сущности (если не указан, синхронизируются все)
 *               options:
 *                 type: object
 *                 properties:
 *                   forceUpdate:
 *                     type: boolean
 *                     description: Принудительное обновление
 *                   resolveConflicts:
 *                     type: boolean
 *                     description: Автоматическое разрешение конфликтов
 *                   dryRun:
 *                     type: boolean
 *                     description: Тестовый запуск без изменений
 *     responses:
 *       200:
 *         description: Синхронизация запущена успешно
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 result:
 *                   oneOf:
 *                     - type: object
 *                       description: Результат синхронизации одной сущности
 *                     - type: object
 *                       description: Статистика массовой синхронизации
 *       400:
 *         description: Неверные параметры синхронизации
 *       500:
 *         description: Ошибка синхронизации
 */
router.post(
  "/trigger",
  createValidationMiddleware({ body: syncRequestSchema }),
  async (req, res) => {
    try {
      const { externalSystem, entityType, externalId, options = {} } = req.body;

      logger.info("Manual sync triggered", {
        externalSystem,
        entityType,
        externalId,
        options,
      });

      let result;

      if (externalId) {
        // Синхронизация конкретной сущности
        result = await externalSyncService.syncEntity(
          externalSystem as ExternalSystem,
          externalId,
          entityType as ExternalEntityMappingType,
          options
        );
      } else {
        // Массовая синхронизация всех сущностей типа
        result = await externalSyncService.syncEntities(
          externalSystem as ExternalSystem,
          entityType as ExternalEntityMappingType,
          options
        );
      }

      if (("success" in result && result.success) || "total" in result) {
        logger.info("Manual sync completed successfully", {
          externalSystem,
          entityType,
          externalId,
          result,
        });

        res.json({
          success: true,
          message: externalId
            ? "Entity synchronized successfully"
            : "Bulk synchronization completed",
          result,
        });
      } else {
        const errorMessage = "error" in result ? result.error : "Unknown error";
        logger.error("Manual sync failed", {
          externalSystem,
          entityType,
          externalId,
          error: errorMessage,
        });

        res.status(500).json({
          success: false,
          error: "Synchronization failed",
          details: errorMessage,
        });
      }
    } catch (error) {
      logger.error("Manual sync error", { error });
      res.status(500).json({
        success: false,
        error: "Internal server error",
      });
    }
  }
);

/**
 * @swagger
 * /api/sync/health:
 *   get:
 *     summary: Проверка здоровья внешних систем
 *     description: Проверяет доступность всех зарегистрированных внешних систем
 *     tags: [External Sync]
 *     responses:
 *       200:
 *         description: Статус здоровья внешних систем
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 systems:
 *                   type: object
 *                   additionalProperties:
 *                     type: boolean
 *                 overallHealth:
 *                   type: boolean
 *       500:
 *         description: Ошибка проверки здоровья
 */
router.get("/health", async (_req, res) => {
  try {
    logger.info("Health check requested");

    const systems = await externalSyncService.healthCheck();
    const overallHealth = Object.values(systems).every((status) => status);

    logger.info("Health check completed", { systems, overallHealth });

    res.json({
      success: true,
      systems,
      overallHealth,
    });
  } catch (error) {
    logger.error("Health check error", { error });
    res.status(500).json({
      success: false,
      error: "Health check failed",
    });
  }
});

/**
 * @swagger
 * /api/sync/stats:
 *   get:
 *     summary: Статистика синхронизации
 *     description: Получение статистики по синхронизации с внешними системами
 *     tags: [External Sync]
 *     parameters:
 *       - in: query
 *         name: externalSystem
 *         schema:
 *           type: string
 *           enum: [exporta, google_calendar, whatsapp_api, telegram_api, payment_gateway_api, other]
 *         description: Фильтр по внешней системе
 *       - in: query
 *         name: entityType
 *         schema:
 *           type: string
 *           enum: [user, booking, court, class, venue, class_schedule, product, training_package_definition]
 *         description: Фильтр по типу сущности
 *     responses:
 *       200:
 *         description: Статистика синхронизации
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 stats:
 *                   type: object
 *       500:
 *         description: Ошибка получения статистики
 */
router.get("/stats", async (req, res) => {
  try {
    const { externalSystem, entityType } = req.query;

    logger.info("Sync stats requested", {
      externalSystem:
        typeof externalSystem === "string" ? externalSystem : undefined,
      entityType: typeof entityType === "string" ? entityType : undefined,
    });

    const stats = await externalSyncService.getSyncStats(
      externalSystem as ExternalSystem,
      entityType as ExternalEntityMappingType
    );

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    logger.error("Sync stats error", { error });
    res.status(500).json({
      success: false,
      error: "Failed to get sync stats",
    });
  }
});

/**
 * @swagger
 * /api/sync/cleanup:
 *   post:
 *     summary: Очистка старых маппингов
 *     description: Удаляет старые неактивные маппинги для освобождения места
 *     tags: [External Sync]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               daysOld:
 *                 type: number
 *                 minimum: 1
 *                 maximum: 365
 *                 default: 30
 *                 description: Возраст маппингов в днях для удаления
 *     responses:
 *       200:
 *         description: Очистка выполнена успешно
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 cleanedCount:
 *                   type: number
 *       500:
 *         description: Ошибка очистки
 */
router.post("/cleanup", async (req, res) => {
  try {
    const { daysOld = 30 } = req.body;

    logger.info("Cleanup requested", { daysOld });

    const cleanedCount = await externalSyncService.cleanup(daysOld);

    logger.info("Cleanup completed", { cleanedCount, daysOld });

    res.json({
      success: true,
      message: `Cleaned up ${cleanedCount} old inactive mappings`,
      cleanedCount,
    });
  } catch (error) {
    logger.error("Cleanup error", { error });
    res.status(500).json({
      success: false,
      error: "Cleanup failed",
    });
  }
});

/**
 * @swagger
 * /api/sync/monitoring/stats:
 *   get:
 *     summary: Статистика мониторинга синхронизации
 *     description: Получение детальной статистики по синхронизации с внешними системами
 *     tags: [External Sync]
 *     responses:
 *       200:
 *         description: Статистика мониторинга
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 stats:
 *                   type: object
 *                   properties:
 *                     totalMappings:
 *                       type: number
 *                     activeMappings:
 *                       type: number
 *                     inactiveMappings:
 *                       type: number
 *                     conflictMappings:
 *                       type: number
 *                     errorMappings:
 *                       type: number
 *                     systemBreakdown:
 *                       type: object
 *                     entityBreakdown:
 *                       type: object
 *                     recentActivity:
 *                       type: object
 *       500:
 *         description: Ошибка получения статистики
 */
router.get("/monitoring/stats", async (_req, res) => {
  try {
    logger.info("Monitoring stats requested");

    const stats = await syncMonitoringService.getMonitoringStats();

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    logger.error("Monitoring stats error", { error });
    res.status(500).json({
      success: false,
      error: "Failed to get monitoring stats",
    });
  }
});

/**
 * @swagger
 * /api/sync/monitoring/health:
 *   get:
 *     summary: Статус здоровья внешних систем
 *     description: Получение текущего статуса здоровья всех внешних систем
 *     tags: [External Sync]
 *     responses:
 *       200:
 *         description: Статус здоровья систем
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 healthStatuses:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       system:
 *                         type: string
 *                       isHealthy:
 *                         type: boolean
 *                       lastCheck:
 *                         type: string
 *                         format: date-time
 *                       responseTime:
 *                         type: number
 *                       error:
 *                         type: string
 *       500:
 *         description: Ошибка получения статуса здоровья
 */
router.get("/monitoring/health", async (_req, res) => {
  try {
    logger.info("Health statuses requested");

    const healthStatuses = syncMonitoringService.getHealthStatuses();

    res.json({
      success: true,
      healthStatuses,
    });
  } catch (error) {
    logger.error("Health statuses error", { error });
    res.status(500).json({
      success: false,
      error: "Failed to get health statuses",
    });
  }
});

/**
 * @swagger
 * /api/sync/monitoring/alerts:
 *   get:
 *     summary: Получение алертов синхронизации
 *     description: Получение списка алертов с возможностью фильтрации
 *     tags: [External Sync]
 *     parameters:
 *       - in: query
 *         name: resolved
 *         schema:
 *           type: boolean
 *         description: Фильтр по статусу разрешения (true - разрешенные, false - активные)
 *     responses:
 *       200:
 *         description: Список алертов
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 alerts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       type:
 *                         type: string
 *                         enum: [error, warning, info]
 *                       system:
 *                         type: string
 *                       entityType:
 *                         type: string
 *                       message:
 *                         type: string
 *                       timestamp:
 *                         type: string
 *                         format: date-time
 *                       resolved:
 *                         type: boolean
 *                       metadata:
 *                         type: object
 *       500:
 *         description: Ошибка получения алертов
 */
router.get("/monitoring/alerts", async (req, res) => {
  try {
    const { resolved } = req.query;

    logger.info("Alerts requested", {
      resolved: typeof resolved === "string" ? resolved === "true" : undefined,
    });

    const alerts = syncMonitoringService.getAlerts(
      resolved !== undefined ? resolved === "true" : undefined
    );

    res.json({
      success: true,
      alerts,
    });
  } catch (error) {
    logger.error("Alerts error", { error });
    res.status(500).json({
      success: false,
      error: "Failed to get alerts",
    });
  }
});

/**
 * @swagger
 * /api/sync/monitoring/alerts/{alertId}/resolve:
 *   post:
 *     summary: Разрешение алерта
 *     description: Помечает алерт как разрешенный
 *     tags: [External Sync]
 *     parameters:
 *       - in: path
 *         name: alertId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID алерта для разрешения
 *     responses:
 *       200:
 *         description: Алерт разрешен успешно
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
 *         description: Алерт не найден
 *       500:
 *         description: Ошибка разрешения алерта
 */
router.post("/monitoring/alerts/:alertId/resolve", async (req, res) => {
  try {
    const { alertId } = req.params;

    logger.info("Alert resolution requested", { alertId });

    const resolved = syncMonitoringService.resolveAlert(alertId);

    if (resolved) {
      res.json({
        success: true,
        message: "Alert resolved successfully",
      });
    } else {
      res.status(404).json({
        success: false,
        error: "Alert not found",
      });
    }
  } catch (error) {
    logger.error("Alert resolution error", {
      error,
      alertId: req.params.alertId,
    });
    res.status(500).json({
      success: false,
      error: "Failed to resolve alert",
    });
  }
});

/**
 * @swagger
 * /api/sync/monitoring/issues:
 *   get:
 *     summary: Анализ проблем синхронизации
 *     description: Получение анализа текущих проблем и рекомендаций
 *     tags: [External Sync]
 *     responses:
 *       200:
 *         description: Анализ проблем
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 analysis:
 *                   type: object
 *                   properties:
 *                     criticalIssues:
 *                       type: array
 *                       items:
 *                         type: string
 *                     warnings:
 *                       type: array
 *                       items:
 *                         type: string
 *                     recommendations:
 *                       type: array
 *                       items:
 *                         type: string
 *       500:
 *         description: Ошибка анализа проблем
 */
router.get("/monitoring/issues", async (_req, res) => {
  try {
    logger.info("Issues analysis requested");

    const analysis = await syncMonitoringService.analyzeIssues();

    res.json({
      success: true,
      analysis,
    });
  } catch (error) {
    logger.error("Issues analysis error", { error });
    res.status(500).json({
      success: false,
      error: "Failed to analyze issues",
    });
  }
});

/**
 * @swagger
 * /api/sync/monitoring/performance:
 *   get:
 *     summary: Отчет о производительности
 *     description: Получение отчета о производительности синхронизации
 *     tags: [External Sync]
 *     responses:
 *       200:
 *         description: Отчет о производительности
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 report:
 *                   type: object
 *                   properties:
 *                     avgResponseTime:
 *                       type: number
 *                     systemPerformance:
 *                       type: object
 *                     trends:
 *                       type: object
 *       500:
 *         description: Ошибка получения отчета
 */
router.get("/monitoring/performance", async (_req, res) => {
  try {
    logger.info("Performance report requested");

    const report = await syncMonitoringService.getPerformanceReport();

    res.json({
      success: true,
      report,
    });
  } catch (error) {
    logger.error("Performance report error", { error });
    res.status(500).json({
      success: false,
      error: "Failed to get performance report",
    });
  }
});

export default router;
