/**
 * Handlers для API уведомлений в функциональном стиле
 * Содержит обработчики для всех операций с уведомлениями
 */

import { Request, Response } from "express";
import { db } from "../../db/connection";
import { NotificationRepository } from "../../repositories/notification-repository";
import { UserRepository } from "../../repositories/user-repository";
import { logger } from "../middleware/logger";
import { LogContext } from "../types";
import {
  CreateNotificationRequest,
  UpdateNotificationRequest,
  BulkCreateNotificationRequest,
  BulkUpdateStatusRequest,
  SearchNotificationsRequest,
  GetStatsRequest,
  CleanupNotificationsRequest,
} from "../validators/notifications";

// Инициализация репозиториев
const notificationRepository = new NotificationRepository(db!);
const userRepository = new UserRepository(db!);

/**
 * Создание нового уведомления
 */
export const createNotification = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const data = req.body as CreateNotificationRequest;
    const context: LogContext = {
      requestId: (req as any).id || "unknown",
      method: req.method,
      path: req.path,
      ip: req.ip || "unknown",
      timestamp: new Date().toISOString(),
      operation: "create_notification",
      userId: data.userId,
    };

    logger.info("Creating notification", context);

    // Проверяем существование пользователя
    const user = await userRepository.getById(data.userId);
    if (!user) {
      logger.warn("User not found for notification", {
        ...context,
        userId: data.userId,
      });
      res.status(404).json({
        success: false,
        error: "User not found",
        message: "The specified user does not exist",
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method,
      });
      return;
    }

    const notification = await notificationRepository.create(data);

    logger.info("Notification created successfully", {
      ...context,
      notificationId: notification.id,
      type: notification.type,
      channel: notification.channel,
    });

    res.status(201).json({
      success: true,
      data: notification,
      message: "Notification created successfully",
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
    });
  } catch (error) {
    logger.error("Failed to create notification", {
      error,
      requestId: (req as any).id || "unknown",
      method: req.method,
      path: req.path,
    });

    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: "Failed to create notification",
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
    });
  }
};

/**
 * Получение уведомления по ID
 */
export const getNotificationById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const context: LogContext = {
      requestId: (req as any).id || "unknown",
      method: req.method,
      path: req.path,
      ip: req.ip || "unknown",
      timestamp: new Date().toISOString(),
      operation: "get_notification",
      notificationId: id,
    };

    logger.info("Getting notification by ID", context);

    const notification = await notificationRepository.getById(id);

    if (!notification) {
      logger.warn("Notification not found", context);
      res.status(404).json({
        success: false,
        error: "Notification not found",
        message: "The specified notification does not exist",
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method,
      });
      return;
    }

    logger.info("Notification retrieved successfully", context);

    res.json({
      success: true,
      data: notification,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
    });
  } catch (error) {
    logger.error("Failed to get notification", {
      error,
      requestId: (req as any).id || "unknown",
      method: req.method,
      path: req.path,
      notificationId: req.params.id,
    });

    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: "Failed to retrieve notification",
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
    });
  }
};

/**
 * Обновление уведомления
 */
export const updateNotification = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const data = req.body as UpdateNotificationRequest;
    const context: LogContext = {
      requestId: (req as any).id || "unknown",
      method: req.method,
      path: req.path,
      ip: req.ip || "unknown",
      timestamp: new Date().toISOString(),
      operation: "update_notification",
      notificationId: id,
    };

    logger.info("Updating notification", context);

    const notification = await notificationRepository.update(id, data);

    if (!notification) {
      logger.warn("Notification not found for update", context);
      res.status(404).json({
        success: false,
        error: "Notification not found",
        message: "The specified notification does not exist",
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method,
      });
      return;
    }

    logger.info("Notification updated successfully", context);

    res.json({
      success: true,
      data: notification,
      message: "Notification updated successfully",
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
    });
  } catch (error) {
    logger.error("Failed to update notification", {
      error,
      requestId: (req as any).id || "unknown",
      method: req.method,
      path: req.path,
      notificationId: req.params.id,
    });

    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: "Failed to update notification",
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
    });
  }
};

/**
 * Удаление уведомления
 */
export const deleteNotification = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const context: LogContext = {
      requestId: (req as any).id || "unknown",
      method: req.method,
      path: req.path,
      ip: req.ip || "unknown",
      timestamp: new Date().toISOString(),
      operation: "delete_notification",
      notificationId: id,
    };

    logger.info("Deleting notification", context);

    const deleted = await notificationRepository.delete(id);

    if (!deleted) {
      logger.warn("Notification not found for deletion", context);
      res.status(404).json({
        success: false,
        error: "Notification not found",
        message: "The specified notification does not exist",
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method,
      });
      return;
    }

    logger.info("Notification deleted successfully", context);

    res.json({
      success: true,
      message: "Notification deleted successfully",
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
    });
  } catch (error) {
    logger.error("Failed to delete notification", {
      error,
      requestId: (req as any).id || "unknown",
      method: req.method,
      path: req.path,
      notificationId: req.params.id,
    });

    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: "Failed to delete notification",
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
    });
  }
};

/**
 * Поиск уведомлений с фильтрацией и пагинацией
 */
export const searchNotifications = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const query = req.query as unknown as SearchNotificationsRequest;
    const context: LogContext = {
      requestId: (req as any).id || "unknown",
      method: req.method,
      path: req.path,
      ip: req.ip || "unknown",
      timestamp: new Date().toISOString(),
      operation: "search_notifications",
      query,
    };

    logger.info("Searching notifications", context);

    let notifications = [];
    let totalCount = 0;

    // Применяем различные фильтры в зависимости от параметров
    if (query.userId) {
      notifications = await notificationRepository.getByUser(
        query.userId,
        query.isRead,
        query.limit,
        (query.page - 1) * query.limit
      );
      totalCount = await notificationRepository.getCount(
        query.userId,
        query.isRead
      );
    } else if (query.type) {
      notifications = await notificationRepository.getByType(
        query.type,
        query.userId,
        query.limit
      );
      totalCount = notifications.length; // Приблизительный подсчет
    } else if (query.channel) {
      notifications = await notificationRepository.getByChannel(
        query.channel,
        query.isSent,
        query.limit
      );
      totalCount = notifications.length; // Приблизительный подсчет
    } else if (query.message) {
      notifications = await notificationRepository.searchByMessage(
        query.message,
        query.userId,
        query.limit
      );
      totalCount = notifications.length; // Приблизительный подсчет
    } else if (query.startDate && query.endDate) {
      notifications = await notificationRepository.getByDateRange(
        new Date(query.startDate),
        new Date(query.endDate),
        query.userId
      );
      totalCount = notifications.length;
    } else {
      notifications = await notificationRepository.getAll(
        query.limit,
        (query.page - 1) * query.limit
      );
      totalCount = await notificationRepository.getCount();
    }

    const totalPages = Math.ceil(totalCount / query.limit);

    logger.info("Notifications search completed", {
      ...context,
      resultCount: notifications.length,
      total: totalCount,
    });

    res.json({
      success: true,
      data: notifications,
      pagination: {
        page: query.page,
        limit: query.limit,
        total: totalCount,
        totalPages,
        hasNext: query.page < totalPages,
        hasPrev: query.page > 1,
      },
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
    });
  } catch (error) {
    logger.error("Failed to search notifications", {
      error,
      requestId: (req as any).id || "unknown",
      method: req.method,
      path: req.path,
    });

    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: "Failed to search notifications",
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
    });
  }
};

/**
 * Получение уведомлений пользователя
 */
export const getUserNotifications = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;
    const { isRead, limit = "20", offset = "0" } = req.query;
    const context: LogContext = {
      requestId: (req as any).id || "unknown",
      method: req.method,
      path: req.path,
      ip: req.ip || "unknown",
      timestamp: new Date().toISOString(),
      operation: "get_user_notifications",
      userId,
    };

    logger.info("Getting user notifications", context);

    const notifications = await notificationRepository.getByUser(
      userId,
      isRead === "true" ? true : isRead === "false" ? false : undefined,
      parseInt(limit as string),
      parseInt(offset as string)
    );

    const totalCount = await notificationRepository.getCount(
      userId,
      isRead === "true" ? true : isRead === "false" ? false : undefined
    );

    logger.info("User notifications retrieved", {
      ...context,
      resultCount: notifications.length,
      total: totalCount,
    });

    res.json({
      success: true,
      data: notifications,
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        total: totalCount,
      },
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
    });
  } catch (error) {
    logger.error("Failed to get user notifications", {
      error,
      requestId: (req as any).id || "unknown",
      method: req.method,
      path: req.path,
      userId: req.params.userId,
    });

    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: "Failed to retrieve user notifications",
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
    });
  }
};

/**
 * Отметить уведомление как прочитанное
 */
export const markAsRead = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const context: LogContext = {
      requestId: (req as any).id || "unknown",
      method: req.method,
      path: req.path,
      ip: req.ip || "unknown",
      timestamp: new Date().toISOString(),
      operation: "mark_notification_read",
      notificationId: id,
    };

    logger.info("Marking notification as read", context);

    const notification = await notificationRepository.markAsRead(id);

    if (!notification) {
      logger.warn("Notification not found for mark as read", context);
      res.status(404).json({
        success: false,
        error: "Notification not found",
        message: "The specified notification does not exist",
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method,
      });
      return;
    }

    logger.info("Notification marked as read", context);

    res.json({
      success: true,
      data: notification,
      message: "Notification marked as read",
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
    });
  } catch (error) {
    logger.error("Failed to mark notification as read", {
      error,
      requestId: (req as any).id || "unknown",
      method: req.method,
      path: req.path,
      notificationId: req.params.id,
    });

    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: "Failed to mark notification as read",
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
    });
  }
};

/**
 * Отметить все уведомления пользователя как прочитанные
 */
export const markAllAsRead = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;
    const { type } = req.query;
    const context: LogContext = {
      requestId: (req as any).id || "unknown",
      method: req.method,
      path: req.path,
      ip: req.ip || "unknown",
      timestamp: new Date().toISOString(),
      operation: "mark_all_notifications_read",
      userId,
    };

    logger.info("Marking all notifications as read", context);

    const updatedCount = await notificationRepository.markAllAsRead(
      userId,
      type as any
    );

    logger.info("All notifications marked as read", {
      ...context,
      updatedCount,
    });

    res.json({
      success: true,
      data: { updatedCount },
      message: `${updatedCount} notifications marked as read`,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
    });
  } catch (error) {
    logger.error("Failed to mark all notifications as read", {
      error,
      requestId: (req as any).id || "unknown",
      method: req.method,
      path: req.path,
      userId: req.params.userId,
    });

    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: "Failed to mark all notifications as read",
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
    });
  }
};

/**
 * Отметить уведомление как отправленное
 */
export const markAsSent = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const context: LogContext = {
      requestId: (req as any).id || "unknown",
      method: req.method,
      path: req.path,
      ip: req.ip || "unknown",
      timestamp: new Date().toISOString(),
      operation: "mark_notification_sent",
      notificationId: id,
    };

    logger.info("Marking notification as sent", context);

    const notification = await notificationRepository.markAsSent(id);

    if (!notification) {
      logger.warn("Notification not found for mark as sent", context);
      res.status(404).json({
        success: false,
        error: "Notification not found",
        message: "The specified notification does not exist",
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method,
      });
      return;
    }

    logger.info("Notification marked as sent", context);

    res.json({
      success: true,
      data: notification,
      message: "Notification marked as sent",
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
    });
  } catch (error) {
    logger.error("Failed to mark notification as sent", {
      error,
      requestId: (req as any).id || "unknown",
      method: req.method,
      path: req.path,
      notificationId: req.params.id,
    });

    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: "Failed to mark notification as sent",
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
    });
  }
};

/**
 * Массовое создание уведомлений
 */
export const bulkCreateNotifications = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const data = req.body as BulkCreateNotificationRequest;
    const context: LogContext = {
      requestId: (req as any).id || "unknown",
      method: req.method,
      path: req.path,
      ip: req.ip || "unknown",
      timestamp: new Date().toISOString(),
      operation: "bulk_create_notifications",
      total: data.notifications.length,
    };

    logger.info("Bulk creating notifications", context);

    const createdNotifications = [];
    const errors = [];

    for (const notificationData of data.notifications) {
      try {
        // Проверяем существование пользователя
        const user = await userRepository.getById(notificationData.userId);
        if (!user) {
          errors.push({
            userId: notificationData.userId,
            error: "User not found",
          });
          continue;
        }

        const notification = await notificationRepository.create(
          notificationData
        );
        createdNotifications.push(notification);
      } catch (error) {
        errors.push({
          userId: notificationData.userId,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    logger.info("Bulk notifications creation completed", {
      ...context,
      resultCount: createdNotifications.length,
      errors: errors,
    });

    res.status(201).json({
      success: true,
      data: {
        created: createdNotifications,
        errors,
        stats: {
          total: data.notifications.length,
          successful: createdNotifications.length,
          failed: errors.length,
        },
      },
      message: `${createdNotifications.length} notifications created successfully`,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
    });
  } catch (error) {
    logger.error("Failed to bulk create notifications", {
      error,
      requestId: (req as any).id || "unknown",
      method: req.method,
      path: req.path,
    });

    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: "Failed to bulk create notifications",
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
    });
  }
};

/**
 * Массовое обновление статуса уведомлений
 */
export const bulkUpdateStatus = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const data = req.body as BulkUpdateStatusRequest;
    const context: LogContext = {
      requestId: (req as any).id || "unknown",
      method: req.method,
      path: req.path,
      ip: req.ip || "unknown",
      timestamp: new Date().toISOString(),
      operation: "bulk_update_notification_status",
      totalIds: data.notificationIds.length,
    };

    logger.info("Bulk updating notification status", context);

    let updatedCount = 0;

    if (data.isSent !== undefined) {
      updatedCount = await notificationRepository.markMultipleAsSent(
        data.notificationIds
      );
    }

    // Для isRead нужно было бы добавить метод в репозиторий
    // Пока обновляем по одному
    if (data.isRead !== undefined) {
      for (const id of data.notificationIds) {
        try {
          if (data.isRead) {
            await notificationRepository.markAsRead(id);
            updatedCount++;
          }
        } catch (error) {
          logger.warn("Failed to update notification status", {
            notificationId: id,
            errors: [error],
          });
        }
      }
    }

    logger.info("Bulk status update completed", {
      ...context,
      updatedCount,
    });

    res.json({
      success: true,
      data: { updatedCount },
      message: `${updatedCount} notifications updated successfully`,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
    });
  } catch (error) {
    logger.error("Failed to bulk update notification status", {
      error,
      requestId: (req as any).id || "unknown",
      method: req.method,
      path: req.path,
    });

    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: "Failed to bulk update notification status",
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
    });
  }
};

/**
 * Получение статистики уведомлений
 */
export const getNotificationStats = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const query = req.query as unknown as GetStatsRequest;
    const context: LogContext = {
      requestId: (req as any).id || "unknown",
      method: req.method,
      path: req.path,
      ip: req.ip || "unknown",
      timestamp: new Date().toISOString(),
      operation: "get_notification_stats",
      userId: query.userId,
    };

    logger.info("Getting notification statistics", context);

    const stats = await notificationRepository.getStats(
      query.userId,
      query.days
    );

    let groupedData = null;
    if (query.groupBy === "type") {
      groupedData = await notificationRepository.getGroupedByType(
        query.userId,
        query.days
      );
    }

    logger.info("Notification statistics retrieved", context);

    res.json({
      success: true,
      data: {
        stats,
        groupedData,
      },
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
    });
  } catch (error) {
    logger.error("Failed to get notification statistics", {
      error,
      requestId: (req as any).id || "unknown",
      method: req.method,
      path: req.path,
    });

    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: "Failed to retrieve notification statistics",
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
    });
  }
};

/**
 * Получение неотправленных уведомлений
 */
export const getUnsentNotifications = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { channel, limit = "50" } = req.query;
    const context: LogContext = {
      requestId: (req as any).id || "unknown",
      method: req.method,
      path: req.path,
      ip: req.ip || "unknown",
      timestamp: new Date().toISOString(),
      operation: "get_unsent_notifications",
    };

    logger.info("Getting unsent notifications", context);

    const notifications = await notificationRepository.getUnsent(
      channel as any,
      parseInt(limit as string)
    );

    logger.info("Unsent notifications retrieved", {
      ...context,
      count: notifications.length,
    });

    res.json({
      success: true,
      data: notifications,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
    });
  } catch (error) {
    logger.error("Failed to get unsent notifications", {
      error,
      requestId: (req as any).id || "unknown",
      method: req.method,
      path: req.path,
    });

    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: "Failed to retrieve unsent notifications",
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
    });
  }
};

/**
 * Очистка старых уведомлений
 */
export const cleanupNotifications = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const data = req.body as CleanupNotificationsRequest;
    const context: LogContext = {
      requestId: (req as any).id || "unknown",
      method: req.method,
      path: req.path,
      ip: req.ip || "unknown",
      timestamp: new Date().toISOString(),
      operation: "cleanup_notifications",
      daysOld: data.days,
    };

    logger.info("Cleaning up old notifications", context);

    if (data.dryRun) {
      // Для dry run просто подсчитываем количество
      const recentNotifications =
        await notificationRepository.getRecentNotifications(data.days);
      const totalNotifications = await notificationRepository.getCount();
      const toDeleteCount = totalNotifications - recentNotifications.length;

      logger.info("Dry run cleanup completed", {
        ...context,
        toDeleteCount,
      });

      res.json({
        success: true,
        data: {
          dryRun: true,
          toDeleteCount,
          message: `Would delete ${toDeleteCount} notifications older than ${data.days} days`,
        },
        timestamp: new Date().toISOString(),
        path: req.path,
        method: req.method,
      });
      return;
    }

    const deletedCount = await notificationRepository.deleteOld(
      data.days,
      data.onlyRead
    );

    logger.info("Cleanup completed", {
      ...context,
      deletedCount,
    });

    res.json({
      success: true,
      data: { deletedCount },
      message: `${deletedCount} old notifications deleted successfully`,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
    });
  } catch (error) {
    logger.error("Failed to cleanup notifications", {
      error,
      requestId: (req as any).id || "unknown",
      method: req.method,
      path: req.path,
    });

    res.status(500).json({
      success: false,
      error: "Internal server error",
      message: "Failed to cleanup notifications",
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
    });
  }
};
