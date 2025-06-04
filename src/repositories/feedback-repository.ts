/**
 * Репозиторий для работы с моделью Feedback
 * Содержит методы CRUD для работы с обратной связью
 */

import { eq, and, desc, sql, count, like, gte, lte, or } from "drizzle-orm";


import {
  Feedback,
  NewFeedback,
  feedbacks,
  UpdateFeedback,
  FeedbackStats,
  FeedbackGroupedByCategory,
  FEEDBACK_STATUSES,
  FeedbackCategory,
  FeedbackStatus,
  FeedbackRating
} from "../db/schema";
import { DatabaseType } from "./types";

export class FeedbackRepository {
  constructor(private db: DatabaseType) {}

  /**
   * Создать новый отзыв
   * @param data Данные для создания отзыва
   * @returns Созданный отзыв
   */
  async create(data: NewFeedback): Promise<Feedback> {
    const [feedback] = await this.db.insert(feedbacks).values(data).returning();
    return feedback;
  }

  /**
   * Получить отзыв по ID
   * @param id ID отзыва
   * @returns Отзыв или null
   */
  async getById(id: string): Promise<Feedback | null> {
    const [feedback] = await this.db
      .select()
      .from(feedbacks)
      .where(eq(feedbacks.id, id));
    return feedback || null;
  }

  /**
   * Получить отзывы пользователя
   * @param userId ID пользователя
   * @param category Категория отзывов (опционально)
   * @param limit Лимит записей
   * @param offset Смещение
   * @returns Массив отзывов
   */
  async getByUser(userId: string, category?: FeedbackCategory, limit?: number, offset?: number): Promise<Feedback[]> {
    const conditions = [eq(feedbacks.userId, userId)];
    if (category) {
      conditions.push(eq(feedbacks.category, category));
    }

    const baseQuery = this.db
      .select()
      .from(feedbacks)
      .where(and(...conditions))
      .orderBy(desc(feedbacks.createdAt));

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
   * Получить отзывы по площадке
   * @param venueId ID площадки
   * @param category Категория отзывов (опционально)
   * @param limit Лимит записей
   * @param offset Смещение
   * @returns Массив отзывов
   */
  async getByVenue(venueId: string, category?: FeedbackCategory, limit?: number, offset?: number): Promise<Feedback[]> {
    const conditions = [eq(feedbacks.venueId, venueId)];
    if (category) {
      conditions.push(eq(feedbacks.category, category));
    }

    const baseQuery = this.db
      .select()
      .from(feedbacks)
      .where(and(...conditions))
      .orderBy(desc(feedbacks.createdAt));

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
   * Получить отзывы по категории
   * @param category Категория отзыва
   * @param venueId ID площадки (опционально)
   * @param limit Лимит записей
   * @returns Массив отзывов
   */
  async getByCategory(category: FeedbackCategory, venueId?: string, limit?: number): Promise<Feedback[]> {
    const conditions = [eq(feedbacks.category, category)];
    if (venueId) {
      conditions.push(eq(feedbacks.venueId, venueId));
    }

    const baseQuery = this.db
      .select()
      .from(feedbacks)
      .where(and(...conditions))
      .orderBy(desc(feedbacks.createdAt));

    if (limit) {
      return await baseQuery.limit(limit);
    }

    return await baseQuery;
  }

  /**
   * Получить отзывы по статусу
   * @param status Статус отзыва
   * @param venueId ID площадки (опционально)
   * @param limit Лимит записей
   * @returns Массив отзывов
   */
  async getByStatus(status: FeedbackStatus, venueId?: string, limit?: number): Promise<Feedback[]> {
    const conditions = [eq(feedbacks.status, status)];
    if (venueId) {
      conditions.push(eq(feedbacks.venueId, venueId));
    }

    const baseQuery = this.db
      .select()
      .from(feedbacks)
      .where(and(...conditions))
      .orderBy(desc(feedbacks.createdAt));

    if (limit) {
      return await baseQuery.limit(limit);
    }

    return await baseQuery;
  }

  /**
   * Получить отзывы по рейтингу
   * @param rating Рейтинг
   * @param venueId ID площадки (опционально)
   * @param limit Лимит записей
   * @returns Массив отзывов
   */
  async getByRating(rating: FeedbackRating, venueId?: string, limit?: number): Promise<Feedback[]> {
    const conditions = [eq(feedbacks.rating, rating)];
    if (venueId) {
      conditions.push(eq(feedbacks.venueId, venueId));
    }

    const baseQuery = this.db
      .select()
      .from(feedbacks)
      .where(and(...conditions))
      .orderBy(desc(feedbacks.createdAt));

    if (limit) {
      return await baseQuery.limit(limit);
    }

    return await baseQuery;
  }

  /**
   * Получить отзывы по диапазону рейтингов
   * @param minRating Минимальный рейтинг
   * @param maxRating Максимальный рейтинг
   * @param venueId ID площадки (опционально)
   * @returns Массив отзывов
   */
  async getByRatingRange(minRating: number, maxRating: number, venueId?: string): Promise<Feedback[]> {
    const conditions = [
      gte(feedbacks.rating, minRating),
      lte(feedbacks.rating, maxRating)
    ];
    if (venueId) {
      conditions.push(eq(feedbacks.venueId, venueId));
    }

    return await this.db
      .select()
      .from(feedbacks)
      .where(and(...conditions))
      .orderBy(desc(feedbacks.createdAt));
  }

  /**
   * Получить нерешенные отзывы
   * @param venueId ID площадки (опционально)
   * @param limit Лимит записей
   * @returns Массив нерешенных отзывов
   */
  async getUnresolved(venueId?: string, limit?: number): Promise<Feedback[]> {
    const statusCondition = or(
      eq(feedbacks.status, FEEDBACK_STATUSES.NEW),
      eq(feedbacks.status, FEEDBACK_STATUSES.IN_REVIEW)
    );

    const conditions = [statusCondition];
    if (venueId) {
      conditions.push(eq(feedbacks.venueId, venueId));
    }

    const baseQuery = this.db
      .select()
      .from(feedbacks)
      .where(and(...conditions))
      .orderBy(desc(feedbacks.createdAt));

    if (limit) {
      return await baseQuery.limit(limit);
    }

    return await baseQuery;
  }

  /**
   * Поиск отзывов по комментарию
   * @param searchTerm Поисковый термин
   * @param venueId ID площадки (опционально)
   * @param limit Лимит записей
   * @returns Массив отзывов
   */
  async searchByComment(searchTerm: string, venueId?: string, limit?: number): Promise<Feedback[]> {
    const conditions = [like(feedbacks.comment, `%${searchTerm}%`)];
    if (venueId) {
      conditions.push(eq(feedbacks.venueId, venueId));
    }

    const baseQuery = this.db
      .select()
      .from(feedbacks)
      .where(and(...conditions))
      .orderBy(desc(feedbacks.createdAt));

    if (limit) {
      return await baseQuery.limit(limit);
    }

    return await baseQuery;
  }

  /**
   * Получить отзывы по диапазону дат
   * @param startDate Начальная дата
   * @param endDate Конечная дата
   * @param venueId ID площадки (опционально)
   * @returns Массив отзывов
   */
  async getByDateRange(startDate: Date, endDate: Date, venueId?: string): Promise<Feedback[]> {
    const conditions = [
      gte(feedbacks.createdAt, startDate),
      lte(feedbacks.createdAt, endDate)
    ];
    if (venueId) {
      conditions.push(eq(feedbacks.venueId, venueId));
    }

    return await this.db
      .select()
      .from(feedbacks)
      .where(and(...conditions))
      .orderBy(desc(feedbacks.createdAt));
  }

  /**
   * Получить все отзывы
   * @param limit Лимит записей
   * @param offset Смещение
   * @returns Массив отзывов
   */
  async getAll(limit?: number, offset?: number): Promise<Feedback[]> {
    const baseQuery = this.db
      .select()
      .from(feedbacks)
      .orderBy(desc(feedbacks.createdAt));

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
   * Получить количество отзывов
   * @param venueId ID площадки (опционально)
   * @param status Статус отзывов (опционально)
   * @returns Количество отзывов
   */
  async getCount(venueId?: string, status?: FeedbackStatus): Promise<number> {
    const conditions = [];
    if (venueId) {
      conditions.push(eq(feedbacks.venueId, venueId));
    }
    if (status) {
      conditions.push(eq(feedbacks.status, status));
    }

    const [result] = await this.db
      .select({ count: count() })
      .from(feedbacks)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return result.count;
  }

  /**
   * Обновить отзыв
   * @param id ID отзыва
   * @param data Данные для обновления
   * @returns Обновленный отзыв или null
   */
  async update(id: string, data: UpdateFeedback): Promise<Feedback | null> {
    const [feedback] = await this.db
      .update(feedbacks)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(feedbacks.id, id))
      .returning();
    return feedback || null;
  }

  /**
   * Обновить статус отзыва
   * @param id ID отзыва
   * @param status Новый статус
   * @param resolvedByUserId ID пользователя, решившего отзыв (опционально)
   * @returns Обновленный отзыв или null
   */
  async updateStatus(id: string, status: FeedbackStatus, resolvedByUserId?: string): Promise<Feedback | null> {
    const updateData: UpdateFeedback = { status };
    if (resolvedByUserId && (status === FEEDBACK_STATUSES.RESOLVED || status === FEEDBACK_STATUSES.ARCHIVED)) {
      updateData.resolvedByUserId = resolvedByUserId;
    }
    return await this.update(id, updateData);
  }

  /**
   * Решить отзыв
   * @param id ID отзыва
   * @param resolvedByUserId ID пользователя, решившего отзыв
   * @returns Обновленный отзыв или null
   */
  async resolve(id: string, resolvedByUserId: string): Promise<Feedback | null> {
    return await this.updateStatus(id, FEEDBACK_STATUSES.RESOLVED, resolvedByUserId);
  }

  /**
   * Взять отзыв в работу
   * @param id ID отзыва
   * @returns Обновленный отзыв или null
   */
  async takeInReview(id: string): Promise<Feedback | null> {
    return await this.updateStatus(id, FEEDBACK_STATUSES.IN_REVIEW);
  }

  /**
   * Архивировать отзыв
   * @param id ID отзыва
   * @param resolvedByUserId ID пользователя, архивировавшего отзыв
   * @returns Обновленный отзыв или null
   */
  async archive(id: string, resolvedByUserId: string): Promise<Feedback | null> {
    return await this.updateStatus(id, FEEDBACK_STATUSES.ARCHIVED, resolvedByUserId);
  }

  /**
   * Удалить отзыв
   * @param id ID отзыва
   * @returns true, если отзыв удален
   */
  async delete(id: string): Promise<boolean> {
    const [deletedFeedback] = await this.db
      .delete(feedbacks)
      .where(eq(feedbacks.id, id))
      .returning();
    return !!deletedFeedback;
  }

  /**
   * Получить статистику отзывов
   * @param venueId ID площадки (опционально)
   * @param days Количество дней назад (опционально)
   * @returns Статистика отзывов
   */
  async getStats(venueId?: string, days?: number): Promise<FeedbackStats> {
    const conditions = [];
    if (venueId) {
      conditions.push(eq(feedbacks.venueId, venueId));
    }
    if (days) {
      const dateThreshold = new Date();
      dateThreshold.setDate(dateThreshold.getDate() - days);
      conditions.push(gte(feedbacks.createdAt, dateThreshold));
    }

    const [stats] = await this.db
      .select({
        totalFeedbacks: count(),
        newFeedbacks: sql<number>`count(*) filter (where ${feedbacks.status} = 'new')::int`,
        inReviewFeedbacks: sql<number>`count(*) filter (where ${feedbacks.status} = 'in_review')::int`,
        resolvedFeedbacks: sql<number>`count(*) filter (where ${feedbacks.status} = 'resolved')::int`,
        archivedFeedbacks: sql<number>`count(*) filter (where ${feedbacks.status} = 'archived')::int`,
        averageRating: sql<number>`coalesce(avg(${feedbacks.rating}::numeric), 0)`,
        courtQualityCount: sql<number>`count(*) filter (where ${feedbacks.category} = 'court_quality')::int`,
        gameExperienceCount: sql<number>`count(*) filter (where ${feedbacks.category} = 'game_experience')::int`,
        trainingQualityCount: sql<number>`count(*) filter (where ${feedbacks.category} = 'training_quality')::int`,
        staffServiceCount: sql<number>`count(*) filter (where ${feedbacks.category} = 'staff_service')::int`,
        systemSuggestionCount: sql<number>`count(*) filter (where ${feedbacks.category} = 'system_suggestion')::int`,
        otherCount: sql<number>`count(*) filter (where ${feedbacks.category} = 'other')::int`,
        rating1Count: sql<number>`count(*) filter (where ${feedbacks.rating} = 1)::int`,
        rating2Count: sql<number>`count(*) filter (where ${feedbacks.rating} = 2)::int`,
        rating3Count: sql<number>`count(*) filter (where ${feedbacks.rating} = 3)::int`,
        rating4Count: sql<number>`count(*) filter (where ${feedbacks.rating} = 4)::int`,
        rating5Count: sql<number>`count(*) filter (where ${feedbacks.rating} = 5)::int`,
      })
      .from(feedbacks)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    // Получаем среднее время решения
    const [resolutionStats] = await this.db
      .select({
        averageResolutionTime: sql<number>`coalesce(avg(extract(epoch from (${feedbacks.updatedAt} - ${feedbacks.createdAt})) / 86400), 0)`,
      })
      .from(feedbacks)
      .where(
        and(
          eq(feedbacks.status, FEEDBACK_STATUSES.RESOLVED),
          ...(conditions.length > 0 ? conditions : [])
        )
      );

    const resolutionRate = stats.totalFeedbacks > 0
      ? Math.round((stats.resolvedFeedbacks / stats.totalFeedbacks) * 100 * 100) / 100
      : 0;

    return {
      ...stats,
      averageRating: Math.round(stats.averageRating * 100) / 100,
      feedbacksByCategory: {
        court_quality: stats.courtQualityCount,
        game_experience: stats.gameExperienceCount,
        training_quality: stats.trainingQualityCount,
        staff_service: stats.staffServiceCount,
        system_suggestion: stats.systemSuggestionCount,
        other: stats.otherCount,
      },
      feedbacksByRating: {
        1: stats.rating1Count,
        2: stats.rating2Count,
        3: stats.rating3Count,
        4: stats.rating4Count,
        5: stats.rating5Count,
      },
      averageResolutionTime: Math.round(resolutionStats.averageResolutionTime * 100) / 100,
      resolutionRate,
    };
  }

  /**
   * Получить отзывы, сгруппированные по категории
   * @param venueId ID площадки (опционально)
   * @param days Количество дней назад (опционально)
   * @returns Массив групп отзывов по категории
   */
  async getGroupedByCategory(venueId?: string, days?: number): Promise<FeedbackGroupedByCategory[]> {
    const conditions = [];
    if (venueId) {
      conditions.push(eq(feedbacks.venueId, venueId));
    }
    if (days) {
      const dateThreshold = new Date();
      dateThreshold.setDate(dateThreshold.getDate() - days);
      conditions.push(gte(feedbacks.createdAt, dateThreshold));
    }

    return await this.db
      .select({
        category: feedbacks.category,
        feedbacksCount: sql<number>`count(*)::int`,
        averageRating: sql<number>`coalesce(avg(${feedbacks.rating}::numeric), 0)`,
        newCount: sql<number>`count(*) filter (where ${feedbacks.status} = 'new')::int`,
        resolvedCount: sql<number>`count(*) filter (where ${feedbacks.status} = 'resolved')::int`,
        resolutionRate: sql<number>`round(count(*) filter (where ${feedbacks.status} = 'resolved') * 100.0 / count(*), 2)`,
      })
      .from(feedbacks)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .groupBy(feedbacks.category)
      .orderBy(desc(sql`count(*)`));
  }

  /**
   * Получить недавние отзывы
   * @param days Количество дней назад
   * @param venueId ID площадки (опционально)
   * @returns Массив недавних отзывов
   */
  async getRecentFeedbacks(days: number, venueId?: string): Promise<Feedback[]> {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    const conditions = [gte(feedbacks.createdAt, dateThreshold)];
    if (venueId) {
      conditions.push(eq(feedbacks.venueId, venueId));
    }

    return await this.db
      .select()
      .from(feedbacks)
      .where(and(...conditions))
      .orderBy(desc(feedbacks.createdAt));
  }
}
