/**
 * NotificationService - основной сервис для управления уведомлениями
 *
 * Функциональность:
 * - Отправка уведомлений через различные каналы
 * - Планирование отложенных уведомлений
 * - Retry логика для неудачных отправок
 * - Интеграция с внешними провайдерами
 * - Обработка ошибок и логирование
 */

import { logger, LogType } from "../utils/logger";
import { NotificationRepository } from "../repositories/notification-repository";
import { UserRepository } from "../repositories/user-repository";
import type { DatabaseType } from "../repositories/types";
import type {
  Notification,
  NewNotification,
  NotificationChannel,
  NotificationType,
} from "../db/schema/notification";

// Типы для сервиса
export interface INotificationProvider {
  readonly name: NotificationChannel;
  send(notification: INotificationData): Promise<ISendResult>;
  validateConfig(): Promise<boolean>;
}

export interface INotificationData {
  readonly id: string;
  readonly userId: string | undefined;
  readonly type: NotificationType;
  readonly channel: NotificationChannel;
  readonly message: string;
  readonly relatedEntityId?: string;
  readonly relatedEntityType?: string;
}

export interface ISendResult {
  readonly success: boolean;
  readonly messageId?: string;
  readonly error?: string;
  readonly retryable?: boolean;
  readonly deliveredAt?: Date;
}

export interface IScheduleOptions {
  readonly scheduledAt: Date;
  readonly retryAttempts?: number;
  readonly retryDelay?: number; // в минутах
}

export interface INotificationServiceConfig {
  readonly maxRetryAttempts: number;
  readonly retryDelayMinutes: number;
  readonly batchSize: number;
  readonly enableScheduling: boolean;
  readonly enableRetry: boolean;
}

// Провайдеры уведомлений (заглушки для будущей реализации)
class TelegramProvider implements INotificationProvider {
  readonly name: NotificationChannel = "telegram";

  async send(notification: INotificationData): Promise<ISendResult> {
    // TODO: Реализовать интеграцию с Telegram Bot API
    logger.info("Sending Telegram notification", {
      type: LogType.EXTERNAL_SERVICE,
      userId: notification.userId,
      data: {
        notificationId: notification.id,
        notificationType: notification.type,
      },
    });

    return {
      success: true,
      messageId: `tg_${Date.now()}`,
      deliveredAt: new Date(),
    };
  }

  async validateConfig(): Promise<boolean> {
    // TODO: Проверить конфигурацию Telegram Bot
    return true;
  }
}

class WhatsAppProvider implements INotificationProvider {
  readonly name: NotificationChannel = "whatsapp";

  async send(notification: INotificationData): Promise<ISendResult> {
    // TODO: Реализовать интеграцию с WhatsApp Business API
    logger.info("Sending WhatsApp notification", {
      type: LogType.EXTERNAL_SERVICE,
      userId: notification.userId,
      data: {
        notificationId: notification.id,
        notificationType: notification.type,
      },
    });

    return {
      success: true,
      messageId: `wa_${Date.now()}`,
      deliveredAt: new Date(),
    };
  }

  async validateConfig(): Promise<boolean> {
    // TODO: Проверить конфигурацию WhatsApp Business
    return true;
  }
}

class EmailProvider implements INotificationProvider {
  readonly name: NotificationChannel = "email";

  async send(notification: INotificationData): Promise<ISendResult> {
    // TODO: Реализовать интеграцию с SMTP/SendGrid
    logger.info("Sending Email notification", {
      type: LogType.EXTERNAL_SERVICE,
      userId: notification.userId,
      data: {
        notificationId: notification.id,
        notificationType: notification.type,
      },
    });

    return {
      success: true,
      messageId: `email_${Date.now()}`,
      deliveredAt: new Date(),
    };
  }

  async validateConfig(): Promise<boolean> {
    // TODO: Проверить конфигурацию SMTP
    return true;
  }
}

class AppPushProvider implements INotificationProvider {
  readonly name: NotificationChannel = "app_push";

  async send(notification: INotificationData): Promise<ISendResult> {
    // TODO: Реализовать интеграцию с FCM/APNS
    logger.info("Sending Push notification", {
      type: LogType.EXTERNAL_SERVICE,
      userId: notification.userId,
      data: {
        notificationId: notification.id,
        notificationType: notification.type,
      },
    });

    return {
      success: true,
      messageId: `push_${Date.now()}`,
      deliveredAt: new Date(),
    };
  }

  async validateConfig(): Promise<boolean> {
    // TODO: Проверить конфигурацию FCM/APNS
    return true;
  }
}

/**
 * NotificationService - основной класс для управления уведомлениями
 */
export class NotificationService {
  private readonly providers: Map<NotificationChannel, INotificationProvider>;
  private readonly notificationRepo: NotificationRepository;
  private readonly userRepo: UserRepository;
  private readonly config: INotificationServiceConfig;

  constructor(
    db: DatabaseType,
    config: Partial<INotificationServiceConfig> = {}
  ) {
    this.notificationRepo = new NotificationRepository(db);
    this.userRepo = new UserRepository(db);

    // Конфигурация по умолчанию
    this.config = {
      maxRetryAttempts: 3,
      retryDelayMinutes: 5,
      batchSize: 10,
      enableScheduling: true,
      enableRetry: true,
      ...config,
    };

    // Инициализация провайдеров
    this.providers = new Map();
    this.providers.set("telegram", new TelegramProvider());
    this.providers.set("whatsapp", new WhatsAppProvider());
    this.providers.set("email", new EmailProvider());
    this.providers.set("app_push", new AppPushProvider());
  }

  /**
   * Отправить уведомление немедленно
   */
  async send(notificationId: string): Promise<ISendResult> {
    try {
      const notification = await this.notificationRepo.getById(notificationId);
      if (!notification) {
        throw new Error(`Notification not found: ${notificationId}`);
      }

      const provider = this.providers.get(notification.channel);
      if (!provider) {
        throw new Error(
          `Provider not found for channel: ${notification.channel}`
        );
      }

      const result = await provider.send({
        id: notification.id,
        userId: notification.userId || undefined,
        type: notification.type,
        channel: notification.channel,
        message: notification.message,

        relatedEntityId: notification.relatedEntityId || undefined,
        relatedEntityType: notification.relatedEntityType || undefined,
      });

      // Обновляем статус в базе данных
      if (result.success) {
        await this.notificationRepo.markAsSent(notificationId);

        logger.info("Notification sent successfully", {
          type: LogType.BUSINESS_LOGIC,
          userId: notification.userId || undefined,
          data: {
            notificationId,
            channel: notification.channel,
            messageId: result.messageId,
          },
        });
      } else {
        logger.warn("Notification send failed", {
          type: LogType.BUSINESS_LOGIC,
          userId: notification.userId || undefined,
          data: {
            notificationId,
            channel: notification.channel,
            error: result.error,
          },
        });

        // TODO: Добавить retry логику когда будет поле retryCount в схеме
      }

      return result;
    } catch (error) {
      logger.error("Error in NotificationService.send", {
        type: LogType.ERROR,
        data: {
          notificationId,
          error: error instanceof Error ? error.message : String(error),
        },
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Создать и отправить уведомление
   */
  async createAndSend(
    data: NewNotification
  ): Promise<{ notification: Notification; result: ISendResult }> {
    try {
      // Проверяем существование пользователя
      if (data.userId) {
        const user = await this.userRepo.getById(data.userId);
        if (!user) {
          throw new Error(`User not found: ${data.userId}`);
        }
      }

      // Создаем уведомление
      const notification = await this.notificationRepo.create(data);

      // Отправляем уведомление
      const result = await this.send(notification.id);

      return { notification, result };
    } catch (error) {
      logger.error("Error in NotificationService.createAndSend", {
        type: LogType.ERROR,
        userId: data.userId || undefined,
        data: {
          notificationType: data.type,
          channel: data.channel,
          error: error instanceof Error ? error.message : String(error),
        },
      });

      throw error;
    }
  }

  /**
   * Запланировать отправку уведомления
   */
  async schedule(
    notificationId: string,
    options: IScheduleOptions
  ): Promise<boolean> {
    if (!this.config.enableScheduling) {
      throw new Error("Scheduling is disabled");
    }

    try {
      const notification = await this.notificationRepo.getById(notificationId);
      if (!notification) {
        throw new Error(`Notification not found: ${notificationId}`);
      }

      // TODO: Добавить поддержку scheduledAt в схему и репозиторий
      logger.info("Notification scheduled (placeholder)", {
        type: LogType.BUSINESS_LOGIC,
        data: {
          notificationId,
          scheduledAt: options.scheduledAt,
        },
      });

      return true;
    } catch (error) {
      logger.error("Error in NotificationService.schedule", {
        type: LogType.ERROR,
        data: {
          notificationId,
          error: error instanceof Error ? error.message : String(error),
        },
      });
      return false;
    }
  }

  /**
   * Отменить запланированное уведомление
   */
  async cancel(notificationId: string): Promise<boolean> {
    try {
      const notification = await this.notificationRepo.getById(notificationId);
      if (!notification) {
        return false;
      }

      // TODO: Реализовать отмену когда будет поддержка scheduledAt
      logger.info("Notification cancelled", {
        type: LogType.BUSINESS_LOGIC,
        data: { notificationId },
      });

      return true;
    } catch (error) {
      logger.error("Error in NotificationService.cancel", {
        type: LogType.ERROR,
        data: {
          notificationId,
          error: error instanceof Error ? error.message : String(error),
        },
      });
      return false;
    }
  }

  /**
   * Обработать запланированные уведомления
   */
  async processScheduled(): Promise<{ processed: number; failed: number }> {
    try {
      // TODO: Реализовать когда будет поддержка scheduledAt
      // const scheduledNotifications = await this.notificationRepo.getScheduledForSending();
      const scheduledNotifications: Notification[] = [];

      let processed = 0;
      let failed = 0;

      // Обрабатываем батчами
      for (
        let i = 0;
        i < scheduledNotifications.length;
        i += this.config.batchSize
      ) {
        const batch = scheduledNotifications.slice(
          i,
          i + this.config.batchSize
        );

        const results = await Promise.allSettled(
          batch.map((notification: Notification) => this.send(notification.id))
        );

        results.forEach(
          (result: PromiseSettledResult<ISendResult>, index: number) => {
            if (result.status === "fulfilled" && result.value.success) {
              processed++;
            } else {
              failed++;
              logger.error("Failed to process scheduled notification", {
                type: LogType.ERROR,
                data: {
                  notificationId: batch[index].id,
                  error:
                    result.status === "rejected"
                      ? result.reason
                      : result.value.error,
                },
              });
            }
          }
        );
      }

      logger.info("Processed scheduled notifications", {
        type: LogType.BUSINESS_LOGIC,
        data: {
          total: scheduledNotifications.length,
          processed,
          failed,
        },
      });

      return { processed, failed };
    } catch (error) {
      logger.error("Error in NotificationService.processScheduled", {
        type: LogType.ERROR,
        data: {
          error: error instanceof Error ? error.message : String(error),
        },
      });
      return { processed: 0, failed: 0 };
    }
  }

  /**
   * Получить статистику уведомлений
   */
  async getStats(): Promise<{
    totalSent: number;
    totalFailed: number;
    totalScheduled: number;
    byChannel: Record<NotificationChannel, number>;
    byType: Record<NotificationType, number>;
  }> {
    try {
      const stats = await this.notificationRepo.getStats();

      return {
        totalSent: stats.sentNotifications,
        totalFailed: stats.totalNotifications - stats.sentNotifications,
        totalScheduled: 0, // TODO: Добавить когда будет поддержка scheduledAt
        byChannel: stats.notificationsByChannel as Record<
          NotificationChannel,
          number
        >,
        byType: stats.notificationsByType as Record<NotificationType, number>,
      };
    } catch (error) {
      logger.error("Error in NotificationService.getStats", {
        type: LogType.ERROR,
        data: {
          error: error instanceof Error ? error.message : String(error),
        },
      });

      return {
        totalSent: 0,
        totalFailed: 0,
        totalScheduled: 0,
        byChannel: {} as Record<NotificationChannel, number>,
        byType: {} as Record<NotificationType, number>,
      };
    }
  }

  /**
   * Проверить здоровье провайдеров
   */
  async healthCheck(): Promise<Record<NotificationChannel, boolean>> {
    const health: Record<NotificationChannel, boolean> = {} as Record<
      NotificationChannel,
      boolean
    >;

    for (const [channel, provider] of this.providers) {
      try {
        health[channel] = await provider.validateConfig();
      } catch (error) {
        logger.error(`Health check failed for ${channel}`, {
          type: LogType.ERROR,
          data: {
            error: error instanceof Error ? error.message : String(error),
          },
        });
        health[channel] = false;
      }
    }

    return health;
  }
}

// Типы экспортируются через интерфейсы выше
