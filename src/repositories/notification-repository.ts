/**
 * Репозиторий для работы с моделью Notification
 * Содержит методы CRUD для работы с уведомлениями
 */

import { eq, and, desc, asc, sql, count, like, gte, lte, inArray } from "drizzle-orm";


import {
  Notification,
  NewNotification,
  notifications,
  UpdateNotification,
  NotificationStats,
  NotificationGroupedByType,
  NotificationType,
  NotificationChannel,
  NotificationRelatedEntityType
} from "../db/schema";

import { DatabaseType } from "./types";

export class NotificationRepository {
  constructor(private db: DatabaseType) {}

  /**
   * Создать новое уведомление
   * @param data Данные для создания уведомления
   * @returns Созданное уведомление
   */
  async create(data: NewNotification): Promise<Notification> {
    const [notification] = await this.db.insert(notifications).values(data).returning();
    return notification;
  }

  /**
   * Получить уведомление по ID
   * @param id ID уведомления
   * @returns Уведомление или null
   */
  async getById(id: string): Promise<Notification | null> {
    const [notification] = await this.db
      .select()
      .from(notifications)
      .where(eq(notifications.id, id));
    return notification || null;
  }

  /**
   * Получить уведомления пользователя
   * @param userId ID пользователя
   * @param isRead Статус прочтения (опционально)
   * @param limit Лимит записей
   * @param offset Смещение
   * @returns Массив уведомлений
   */
  async getByUser(userId: string, isRead?: boolean, limit?: number, offset?: number): Promise<Notification[]> {
    const conditions = [eq(notifications.userId, userId)];
    if (isRead !== undefined) {
      conditions.push(eq(notifications.isRead, isRead));
    }

    const baseQuery = this.db
      .select()
      .from(notifications)
      .where(and(...conditions))
      .orderBy(desc(notifications.createdAt));

    if (limit && offset) {
      return await baseQuery.limit(limit).offset(offset);
    } else if (limit) {
      return await baseQuery.limit(limit);
    } else if (offset) {
      return await baseQuery.offset(offset);
    }

    return await baseQuery;
  }

  /**
   * Получить уведомления по типу
   * @param type Тип уведомления
   * @param userId ID пользователя (опционально)
   * @param limit Лимит записей
   * @returns Массив уведомлений
   */
  async getByType(type: NotificationType, userId?: string, limit?: number): Promise<Notification[]> {
    const conditions = [eq(notifications.type, type)];
    if (userId) {
      conditions.push(eq(notifications.userId, userId));
    }

    const baseQuery = this.db
      .select()
      .from(notifications)
      .where(and(...conditions))
      .orderBy(desc(notifications.createdAt));

    if (limit) {
      return await baseQuery.limit(limit);
    }

    return await baseQuery;
  }

  /**
   * Получить уведомления по каналу
   * @param channel Канал уведомления
   * @param isSent Статус отправки (опционально)
   * @param limit Лимит записей
   * @returns Массив уведомлений
   */
  async getByChannel(channel: NotificationChannel, isSent?: boolean, limit?: number): Promise<Notification[]> {
    const conditions = [eq(notifications.channel, channel)];
    if (isSent !== undefined) {
      conditions.push(eq(notifications.isSent, isSent));
    }

    const baseQuery = this.db
      .select()
      .from(notifications)
      .where(and(...conditions))
      .orderBy(desc(notifications.createdAt));

    if (limit) {
      return await baseQuery.limit(limit);
    }

    return await baseQuery;
  }

  /**
   * Получить неотправленные уведомления
   * @param channel Канал уведомления (опционально)
   * @param limit Лимит записей
   * @returns Массив неотправленных уведомлений
   */
  async getUnsent(channel?: NotificationChannel, limit?: number): Promise<Notification[]> {
    const conditions = [eq(notifications.isSent, false)];
    if (channel) {
      conditions.push(eq(notifications.channel, channel));
    }

    const baseQuery = this.db
      .select()
      .from(notifications)
      .where(and(...conditions))
      .orderBy(asc(notifications.createdAt));

    if (limit) {
      return await baseQuery.limit(limit);
    }

    return await baseQuery;
  }

  /**
   * Получить непрочитанные уведомления пользователя
   * @param userId ID пользователя
   * @param type Тип уведомления (опционально)
   * @param limit Лимит записей
   * @returns Массив непрочитанных уведомлений
   */
  async getUnread(userId: string, type?: NotificationType, limit?: number): Promise<Notification[]> {
    const conditions = [
      eq(notifications.userId, userId),
      eq(notifications.isRead, false)
    ];
    if (type) {
      conditions.push(eq(notifications.type, type));
    }

    const baseQuery = this.db
      .select()
      .from(notifications)
      .where(and(...conditions))
      .orderBy(desc(notifications.createdAt));

    if (limit) {
      return await baseQuery.limit(limit);
    }

    return await baseQuery;
  }

  /**
   * Получить уведомления по связанной сущности
   * @param relatedEntityType Тип связанной сущности
   * @param relatedEntityId ID связанной сущности
   * @param userId ID пользователя (опционально)
   * @returns Массив уведомлений
   */
  async getByRelatedEntity(relatedEntityType: NotificationRelatedEntityType, relatedEntityId: string, userId?: string): Promise<Notification[]> {
    const conditions = [
      eq(notifications.relatedEntityType, relatedEntityType),
      eq(notifications.relatedEntityId, relatedEntityId)
    ];
    if (userId) {
      conditions.push(eq(notifications.userId, userId));
    }

    return await this.db
      .select()
      .from(notifications)
      .where(and(...conditions))
      .orderBy(desc(notifications.createdAt));
  }

  /**
   * Поиск уведомлений по сообщению
   * @param searchTerm Поисковый термин
   * @param userId ID пользователя (опционально)
   * @param limit Лимит записей
   * @returns Массив уведомлений
   */
  async searchByMessage(searchTerm: string, userId?: string, limit?: number): Promise<Notification[]> {
    const conditions = [like(notifications.message, `%${searchTerm}%`)];
    if (userId) {
      conditions.push(eq(notifications.userId, userId));
    }

    const baseQuery = this.db
      .select()
      .from(notifications)
      .where(and(...conditions))
      .orderBy(desc(notifications.createdAt));

    if (limit) {
      return await baseQuery.limit(limit);
    }

    return await baseQuery;
  }

  /**
   * Получить уведомления по диапазону дат
   * @param startDate Начальная дата
   * @param endDate Конечная дата
   * @param userId ID пользователя (опционально)
   * @returns Массив уведомлений
   */
  async getByDateRange(startDate: Date, endDate: Date, userId?: string): Promise<Notification[]> {
    const conditions = [
      gte(notifications.createdAt, startDate),
      lte(notifications.createdAt, endDate)
    ];
    if (userId) {
      conditions.push(eq(notifications.userId, userId));
    }

    return await this.db
      .select()
      .from(notifications)
      .where(and(...conditions))
      .orderBy(desc(notifications.createdAt));
  }

  /**
   * Получить все уведомления
   * @param limit Лимит записей
   * @param offset Смещение
   * @returns Массив уведомлений
   */
  async getAll(limit?: number, offset?: number): Promise<Notification[]> {
    const baseQuery = this.db
      .select()
      .from(notifications)
      .orderBy(desc(notifications.createdAt));

    if (limit && offset) {
      return await baseQuery.limit(limit).offset(offset);
    } else if (limit) {
      return await baseQuery.limit(limit);
    } else if (offset) {
      return await baseQuery.offset(offset);
    }

    return await baseQuery;
  }

  /**
   * Получить количество уведомлений
   * @param userId ID пользователя (опционально)
   * @param isRead Статус прочтения (опционально)
   * @returns Количество уведомлений
   */
  async getCount(userId?: string, isRead?: boolean): Promise<number> {
    const conditions = [];
    if (userId) {
      conditions.push(eq(notifications.userId, userId));
    }
    if (isRead !== undefined) {
      conditions.push(eq(notifications.isRead, isRead));
    }

    const [result] = await this.db
      .select({ count: count() })
      .from(notifications)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return result.count;
  }

  /**
   * Обновить уведомление
   * @param id ID уведомления
   * @param data Данные для обновления
   * @returns Обновленное уведомление или null
   */
  async update(id: string, data: UpdateNotification): Promise<Notification | null> {
    const [notification] = await this.db
      .update(notifications)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(notifications.id, id))
      .returning();
    return notification || null;
  }

  /**
   * Отметить уведомление как отправленное
   * @param id ID уведомления
   * @returns Обновленное уведомление или null
   */
  async markAsSent(id: string): Promise<Notification | null> {
    return await this.update(id, {
      isSent: true,
      sentAt: new Date()
    });
  }

  /**
   * Отметить уведомление как прочитанное
   * @param id ID уведомления
   * @returns Обновленное уведомление или null
   */
  async markAsRead(id: string): Promise<Notification | null> {
    return await this.update(id, {
      isRead: true,
      readAt: new Date()
    });
  }

  /**
   * Отметить все уведомления пользователя как прочитанные
   * @param userId ID пользователя
   * @param type Тип уведомления (опционально)
   * @returns Количество обновленных уведомлений
   */
  async markAllAsRead(userId: string, type?: NotificationType): Promise<number> {
    const conditions = [
      eq(notifications.userId, userId),
      eq(notifications.isRead, false)
    ];
    if (type) {
      conditions.push(eq(notifications.type, type));
    }

    const result = await this.db
      .update(notifications)
      .set({
        isRead: true,
        readAt: new Date(),
        updatedAt: new Date()
      })
      .where(and(...conditions))
      .returning();

    return result.length;
  }

  /**
   * Массовая отправка уведомлений
   * @param ids Массив ID уведомлений
   * @returns Количество обновленных уведомлений
   */
  async markMultipleAsSent(ids: string[]): Promise<number> {
    if (ids.length === 0) return 0;

    const result = await this.db
      .update(notifications)
      .set({
        isSent: true,
        sentAt: new Date(),
        updatedAt: new Date()
      })
      .where(inArray(notifications.id, ids))
      .returning();

    return result.length;
  }

  /**
   * Удалить уведомление
   * @param id ID уведомления
   * @returns true, если уведомление удалено
   */
  async delete(id: string): Promise<boolean> {
    const [deletedNotification] = await this.db
      .delete(notifications)
      .where(eq(notifications.id, id))
      .returning();
    return !!deletedNotification;
  }

  /**
   * Удалить старые уведомления
   * @param days Количество дней назад
   * @param onlyRead Удалять только прочитанные (по умолчанию true)
   * @returns Количество удаленных уведомлений
   */
  async deleteOld(days: number, onlyRead: boolean = true): Promise<number> {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    const conditions = [lte(notifications.createdAt, dateThreshold)];
    if (onlyRead) {
      conditions.push(eq(notifications.isRead, true));
    }

    const result = await this.db
      .delete(notifications)
      .where(and(...conditions))
      .returning();

    return result.length;
  }

  /**
   * Получить статистику уведомлений
   * @param userId ID пользователя (опционально)
   * @param days Количество дней назад (опционально)
   * @returns Статистика уведомлений
   */
  async getStats(userId?: string, days?: number): Promise<NotificationStats> {
    const conditions = [];
    if (userId) {
      conditions.push(eq(notifications.userId, userId));
    }
    if (days) {
      const dateThreshold = new Date();
      dateThreshold.setDate(dateThreshold.getDate() - days);
      conditions.push(gte(notifications.createdAt, dateThreshold));
    }

    const [stats] = await this.db
      .select({
        totalNotifications: count(),
        sentNotifications: sql<number>`count(*) filter (where ${notifications.isSent} = true)::int`,
        unsentNotifications: sql<number>`count(*) filter (where ${notifications.isSent} = false)::int`,
        readNotifications: sql<number>`count(*) filter (where ${notifications.isRead} = true)::int`,
        unreadNotifications: sql<number>`count(*) filter (where ${notifications.isRead} = false)::int`,
        whatsappCount: sql<number>`count(*) filter (where ${notifications.channel} = 'whatsapp')::int`,
        telegramCount: sql<number>`count(*) filter (where ${notifications.channel} = 'telegram')::int`,
        emailCount: sql<number>`count(*) filter (where ${notifications.channel} = 'email')::int`,
        appPushCount: sql<number>`count(*) filter (where ${notifications.channel} = 'app_push')::int`,
      })
      .from(notifications)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    // Получаем среднее время доставки
    const [deliveryStats] = await this.db
      .select({
        averageDeliveryTime: sql<number>`coalesce(avg(extract(epoch from (${notifications.sentAt} - ${notifications.createdAt})) / 60), 0)`,
      })
      .from(notifications)
      .where(
        and(
          eq(notifications.isSent, true),
          sql`${notifications.sentAt} is not null`,
          ...(conditions.length > 0 ? conditions : [])
        )
      );

    const deliverySuccessRate = stats.totalNotifications > 0
      ? Math.round((stats.sentNotifications / stats.totalNotifications) * 100 * 100) / 100
      : 0;

    return {
      ...stats,
      notificationsByType: {}, // Заполним отдельным запросом если нужно
      notificationsByChannel: {
        whatsapp: stats.whatsappCount,
        telegram: stats.telegramCount,
        email: stats.emailCount,
        app_push: stats.appPushCount,
      },
      averageDeliveryTime: Math.round(deliveryStats.averageDeliveryTime * 100) / 100,
      deliverySuccessRate,
    };
  }

  /**
   * Получить уведомления, сгруппированные по типу
   * @param userId ID пользователя (опционально)
   * @param days Количество дней назад (опционально)
   * @returns Массив групп уведомлений по типу
   */
  async getGroupedByType(userId?: string, days?: number): Promise<NotificationGroupedByType[]> {
    const conditions = [];
    if (userId) {
      conditions.push(eq(notifications.userId, userId));
    }
    if (days) {
      const dateThreshold = new Date();
      dateThreshold.setDate(dateThreshold.getDate() - days);
      conditions.push(gte(notifications.createdAt, dateThreshold));
    }

    return await this.db
      .select({
        type: notifications.type,
        notificationsCount: sql<number>`count(*)::int`,
        sentCount: sql<number>`count(*) filter (where ${notifications.isSent} = true)::int`,
        readCount: sql<number>`count(*) filter (where ${notifications.isRead} = true)::int`,
        deliveryRate: sql<number>`round(count(*) filter (where ${notifications.isSent} = true) * 100.0 / count(*), 2)`,
        readRate: sql<number>`round(count(*) filter (where ${notifications.isRead} = true) * 100.0 / count(*), 2)`,
      })
      .from(notifications)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .groupBy(notifications.type)
      .orderBy(desc(sql`count(*)`));
  }

  /**
   * Получить недавние уведомления
   * @param days Количество дней назад
   * @param userId ID пользователя (опционально)
   * @returns Массив недавних уведомлений
   */
  async getRecentNotifications(days: number, userId?: string): Promise<Notification[]> {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    const conditions = [gte(notifications.createdAt, dateThreshold)];
    if (userId) {
      conditions.push(eq(notifications.userId, userId));
    }

    return await this.db
      .select()
      .from(notifications)
      .where(and(...conditions))
      .orderBy(desc(notifications.createdAt));
  }
}
