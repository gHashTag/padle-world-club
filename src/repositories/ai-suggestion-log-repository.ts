/**
 * Репозиторий для работы с моделью AISuggestionLog
 * Содержит методы CRUD для работы с логами AI предложений
 */

import {
  eq,
  and,
  desc,
  sql,
  count,
  gte,
  lte,
  isNull,
  isNotNull,
} from "drizzle-orm";
import {
  AISuggestionLog,
  NewAISuggestionLog,
  aiSuggestionLogs,
} from "../db/schema/aiSuggestionLog";
import { DatabaseType } from "./types";

// Типы для статистики
export interface AISuggestionStats {
  totalSuggestions: number;
  acceptedSuggestions: number;
  rejectedSuggestions: number;
  pendingSuggestions: number;
  acceptanceRate: number; // в процентах
  averageConfidenceScore: number;
  averageExecutionTime: number; // в миллисекундах
  suggestionsByType: Record<string, number>;
  suggestionsByModel: Record<string, number>;
}

export interface AISuggestionGroupedByType {
  suggestionType: string;
  suggestionsCount: number;
  acceptedCount: number;
  rejectedCount: number;
  pendingCount: number;
  acceptanceRate: number;
  averageConfidenceScore: number;
  averageExecutionTime: number;
}

export class AISuggestionLogRepository {
  constructor(private db: DatabaseType) {}

  /**
   * Создать новый лог AI предложения
   * @param data Данные для создания лога
   * @returns Созданный лог
   */
  async create(data: NewAISuggestionLog): Promise<AISuggestionLog> {
    const [log] = await this.db
      .insert(aiSuggestionLogs)
      .values(data)
      .returning();
    return log;
  }

  /**
   * Получить лог по ID
   * @param id ID лога
   * @returns Лог или null
   */
  async getById(id: string): Promise<AISuggestionLog | null> {
    const [log] = await this.db
      .select()
      .from(aiSuggestionLogs)
      .where(eq(aiSuggestionLogs.id, id));
    return log || null;
  }

  /**
   * Получить логи пользователя
   * @param userId ID пользователя
   * @param suggestionType Тип предложения (опционально)
   * @param limit Лимит записей
   * @param offset Смещение
   * @returns Массив логов
   */
  async getByUser(
    userId: string,
    suggestionType?: string,
    limit?: number,
    offset?: number
  ): Promise<AISuggestionLog[]> {
    const conditions = [eq(aiSuggestionLogs.userId, userId)];
    if (suggestionType) {
      conditions.push(
        eq(aiSuggestionLogs.suggestionType, suggestionType as any)
      );
    }

    const baseQuery = this.db
      .select()
      .from(aiSuggestionLogs)
      .where(and(...conditions))
      .orderBy(desc(aiSuggestionLogs.createdAt));

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
   * Получить логи по типу предложения
   * @param suggestionType Тип предложения
   * @param userId ID пользователя (опционально)
   * @param limit Лимит записей
   * @returns Массив логов
   */
  async getByType(
    suggestionType: string,
    userId?: string,
    limit?: number
  ): Promise<AISuggestionLog[]> {
    const conditions = [
      eq(aiSuggestionLogs.suggestionType, suggestionType as any),
    ];
    if (userId) {
      conditions.push(eq(aiSuggestionLogs.userId, userId));
    }

    const baseQuery = this.db
      .select()
      .from(aiSuggestionLogs)
      .where(and(...conditions))
      .orderBy(desc(aiSuggestionLogs.createdAt));

    if (limit) {
      return await baseQuery.limit(limit);
    }

    return await baseQuery;
  }

  /**
   * Получить принятые предложения
   * @param userId ID пользователя (опционально)
   * @param suggestionType Тип предложения (опционально)
   * @param limit Лимит записей
   * @returns Массив принятых предложений
   */
  async getAccepted(
    userId?: string,
    suggestionType?: string,
    limit?: number
  ): Promise<AISuggestionLog[]> {
    const conditions = [eq(aiSuggestionLogs.wasAccepted, true)];
    if (userId) {
      conditions.push(eq(aiSuggestionLogs.userId, userId));
    }
    if (suggestionType) {
      conditions.push(
        eq(aiSuggestionLogs.suggestionType, suggestionType as any)
      );
    }

    const baseQuery = this.db
      .select()
      .from(aiSuggestionLogs)
      .where(and(...conditions))
      .orderBy(desc(aiSuggestionLogs.createdAt));

    if (limit) {
      return await baseQuery.limit(limit);
    }

    return await baseQuery;
  }

  /**
   * Получить отклоненные предложения
   * @param userId ID пользователя (опционально)
   * @param suggestionType Тип предложения (опционально)
   * @param limit Лимит записей
   * @returns Массив отклоненных предложений
   */
  async getRejected(
    userId?: string,
    suggestionType?: string,
    limit?: number
  ): Promise<AISuggestionLog[]> {
    const conditions = [eq(aiSuggestionLogs.wasAccepted, false)];
    if (userId) {
      conditions.push(eq(aiSuggestionLogs.userId, userId));
    }
    if (suggestionType) {
      conditions.push(
        eq(aiSuggestionLogs.suggestionType, suggestionType as any)
      );
    }

    const baseQuery = this.db
      .select()
      .from(aiSuggestionLogs)
      .where(and(...conditions))
      .orderBy(desc(aiSuggestionLogs.createdAt));

    if (limit) {
      return await baseQuery.limit(limit);
    }

    return await baseQuery;
  }

  /**
   * Получить предложения без ответа (pending)
   * @param userId ID пользователя (опционально)
   * @param suggestionType Тип предложения (опционально)
   * @param limit Лимит записей
   * @returns Массив предложений без ответа
   */
  async getPending(
    userId?: string,
    suggestionType?: string,
    limit?: number
  ): Promise<AISuggestionLog[]> {
    const conditions = [isNull(aiSuggestionLogs.wasAccepted)];
    if (userId) {
      conditions.push(eq(aiSuggestionLogs.userId, userId));
    }
    if (suggestionType) {
      conditions.push(
        eq(aiSuggestionLogs.suggestionType, suggestionType as any)
      );
    }

    const baseQuery = this.db
      .select()
      .from(aiSuggestionLogs)
      .where(and(...conditions))
      .orderBy(desc(aiSuggestionLogs.createdAt));

    if (limit) {
      return await baseQuery.limit(limit);
    }

    return await baseQuery;
  }

  /**
   * Получить логи по диапазону дат
   * @param startDate Начальная дата
   * @param endDate Конечная дата
   * @param userId ID пользователя (опционально)
   * @returns Массив логов
   */
  async getByDateRange(
    startDate: Date,
    endDate: Date,
    userId?: string
  ): Promise<AISuggestionLog[]> {
    const conditions = [
      gte(aiSuggestionLogs.createdAt, startDate),
      lte(aiSuggestionLogs.createdAt, endDate),
    ];
    if (userId) {
      conditions.push(eq(aiSuggestionLogs.userId, userId));
    }

    return await this.db
      .select()
      .from(aiSuggestionLogs)
      .where(and(...conditions))
      .orderBy(desc(aiSuggestionLogs.createdAt));
  }

  /**
   * Получить логи по версии модели
   * @param modelVersion Версия модели
   * @param limit Лимит записей
   * @returns Массив логов
   */
  async getByModelVersion(
    modelVersion: string,
    limit?: number
  ): Promise<AISuggestionLog[]> {
    const baseQuery = this.db
      .select()
      .from(aiSuggestionLogs)
      .where(eq(aiSuggestionLogs.modelVersion, modelVersion))
      .orderBy(desc(aiSuggestionLogs.createdAt));

    if (limit) {
      return await baseQuery.limit(limit);
    }

    return await baseQuery;
  }

  /**
   * Получить все логи с пагинацией
   * @param limit Лимит записей
   * @param offset Смещение
   * @returns Массив логов
   */
  async getAll(limit?: number, offset?: number): Promise<AISuggestionLog[]> {
    const baseQuery = this.db
      .select()
      .from(aiSuggestionLogs)
      .orderBy(desc(aiSuggestionLogs.createdAt));

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
   * Получить количество логов
   * @param userId ID пользователя (опционально)
   * @param suggestionType Тип предложения (опционально)
   * @param wasAccepted Статус принятия (опционально)
   * @returns Количество логов
   */
  async getCount(
    userId?: string,
    suggestionType?: string,
    wasAccepted?: boolean
  ): Promise<number> {
    const conditions = [];
    if (userId) {
      conditions.push(eq(aiSuggestionLogs.userId, userId));
    }
    if (suggestionType) {
      conditions.push(
        eq(aiSuggestionLogs.suggestionType, suggestionType as any)
      );
    }
    if (wasAccepted !== undefined) {
      if (wasAccepted === null) {
        conditions.push(isNull(aiSuggestionLogs.wasAccepted));
      } else {
        conditions.push(eq(aiSuggestionLogs.wasAccepted, wasAccepted));
      }
    }

    const [result] = await this.db
      .select({ count: count() })
      .from(aiSuggestionLogs)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return Number(result.count);
  }

  /**
   * Обновить лог
   * @param id ID лога
   * @param data Данные для обновления
   * @returns Обновленный лог или null
   */
  async update(
    id: string,
    data: Partial<NewAISuggestionLog>
  ): Promise<AISuggestionLog | null> {
    const [updatedLog] = await this.db
      .update(aiSuggestionLogs)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(aiSuggestionLogs.id, id))
      .returning();

    return updatedLog || null;
  }

  /**
   * Отметить предложение как принятое
   * @param id ID лога
   * @param userFeedback Обратная связь от пользователя (опционально)
   * @returns Обновленный лог или null
   */
  async markAsAccepted(
    id: string,
    userFeedback?: string
  ): Promise<AISuggestionLog | null> {
    return await this.update(id, {
      wasAccepted: true,
      userFeedback,
    });
  }

  /**
   * Отметить предложение как отклоненное
   * @param id ID лога
   * @param userFeedback Обратная связь от пользователя (опционально)
   * @returns Обновленный лог или null
   */
  async markAsRejected(
    id: string,
    userFeedback?: string
  ): Promise<AISuggestionLog | null> {
    return await this.update(id, {
      wasAccepted: false,
      userFeedback,
    });
  }

  /**
   * Удалить лог
   * @param id ID лога
   * @returns true если удален, false если не найден
   */
  async delete(id: string): Promise<boolean> {
    const [deletedLog] = await this.db
      .delete(aiSuggestionLogs)
      .where(eq(aiSuggestionLogs.id, id))
      .returning();

    return !!deletedLog;
  }

  /**
   * Удалить старые логи
   * @param days Количество дней (логи старше этого периода будут удалены)
   * @returns Количество удаленных записей
   */
  async deleteOld(days: number): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const deletedLogs = await this.db
      .delete(aiSuggestionLogs)
      .where(lte(aiSuggestionLogs.createdAt, cutoffDate))
      .returning();

    return deletedLogs.length;
  }

  /**
   * Получить статистику логов
   * @param userId ID пользователя (опционально)
   * @param days Количество дней для анализа (опционально)
   * @returns Статистика
   */
  async getStats(userId?: string, days?: number): Promise<AISuggestionStats> {
    const conditions = [];
    if (userId) {
      conditions.push(eq(aiSuggestionLogs.userId, userId));
    }
    if (days) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      conditions.push(gte(aiSuggestionLogs.createdAt, startDate));
    }

    // Основная статистика
    const [basicStats] = await this.db
      .select({
        totalSuggestions: count(),
        acceptedSuggestions: sql<number>`COUNT(CASE WHEN ${aiSuggestionLogs.wasAccepted} = true THEN 1 END)`,
        rejectedSuggestions: sql<number>`COUNT(CASE WHEN ${aiSuggestionLogs.wasAccepted} = false THEN 1 END)`,
        pendingSuggestions: sql<number>`COUNT(CASE WHEN ${aiSuggestionLogs.wasAccepted} IS NULL THEN 1 END)`,
        averageConfidenceScore: sql<number>`AVG(CAST(${aiSuggestionLogs.confidenceScore} AS DECIMAL))`,
        averageExecutionTime: sql<number>`AVG(CAST(${aiSuggestionLogs.executionTimeMs} AS DECIMAL))`,
      })
      .from(aiSuggestionLogs)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    // Статистика по типам
    const typeStats = await this.db
      .select({
        suggestionType: aiSuggestionLogs.suggestionType,
        count: count(),
      })
      .from(aiSuggestionLogs)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .groupBy(aiSuggestionLogs.suggestionType);

    // Статистика по моделям
    const modelStats = await this.db
      .select({
        modelVersion: aiSuggestionLogs.modelVersion,
        count: count(),
      })
      .from(aiSuggestionLogs)
      .where(
        and(
          isNotNull(aiSuggestionLogs.modelVersion),
          ...(conditions.length > 0 ? conditions : [])
        )
      )
      .groupBy(aiSuggestionLogs.modelVersion);

    const suggestionsByType: Record<string, number> = {};
    typeStats.forEach((stat) => {
      suggestionsByType[stat.suggestionType] = Number(stat.count);
    });

    const suggestionsByModel: Record<string, number> = {};
    modelStats.forEach((stat) => {
      if (stat.modelVersion) {
        suggestionsByModel[stat.modelVersion] = Number(stat.count);
      }
    });

    const totalSuggestions = Number(basicStats.totalSuggestions);
    const acceptedSuggestions = Number(basicStats.acceptedSuggestions);
    const acceptanceRate =
      totalSuggestions > 0 ? (acceptedSuggestions / totalSuggestions) * 100 : 0;

    return {
      totalSuggestions,
      acceptedSuggestions,
      rejectedSuggestions: Number(basicStats.rejectedSuggestions),
      pendingSuggestions: Number(basicStats.pendingSuggestions),
      acceptanceRate: Math.round(acceptanceRate),
      averageConfidenceScore: Number(basicStats.averageConfidenceScore) || 0,
      averageExecutionTime: Number(basicStats.averageExecutionTime) || 0,
      suggestionsByType,
      suggestionsByModel,
    };
  }

  /**
   * Получить статистику, сгруппированную по типам предложений
   * @param userId ID пользователя (опционально)
   * @param days Количество дней для анализа (опционально)
   * @returns Массив статистики по типам
   */
  async getGroupedByType(
    userId?: string,
    days?: number
  ): Promise<AISuggestionGroupedByType[]> {
    const conditions = [];
    if (userId) {
      conditions.push(eq(aiSuggestionLogs.userId, userId));
    }
    if (days) {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      conditions.push(gte(aiSuggestionLogs.createdAt, startDate));
    }

    const groupedStats = await this.db
      .select({
        suggestionType: aiSuggestionLogs.suggestionType,
        suggestionsCount: count(),
        acceptedCount: sql<number>`COUNT(CASE WHEN ${aiSuggestionLogs.wasAccepted} = true THEN 1 END)`,
        rejectedCount: sql<number>`COUNT(CASE WHEN ${aiSuggestionLogs.wasAccepted} = false THEN 1 END)`,
        pendingCount: sql<number>`COUNT(CASE WHEN ${aiSuggestionLogs.wasAccepted} IS NULL THEN 1 END)`,
        averageConfidenceScore: sql<number>`AVG(CAST(${aiSuggestionLogs.confidenceScore} AS DECIMAL))`,
        averageExecutionTime: sql<number>`AVG(CAST(${aiSuggestionLogs.executionTimeMs} AS DECIMAL))`,
      })
      .from(aiSuggestionLogs)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .groupBy(aiSuggestionLogs.suggestionType);

    return groupedStats.map((stat) => {
      const suggestionsCount = Number(stat.suggestionsCount);
      const acceptedCount = Number(stat.acceptedCount);
      const acceptanceRate =
        suggestionsCount > 0 ? (acceptedCount / suggestionsCount) * 100 : 0;

      return {
        suggestionType: stat.suggestionType,
        suggestionsCount,
        acceptedCount,
        rejectedCount: Number(stat.rejectedCount),
        pendingCount: Number(stat.pendingCount),
        acceptanceRate: Math.round(acceptanceRate),
        averageConfidenceScore: Number(stat.averageConfidenceScore) || 0,
        averageExecutionTime: Number(stat.averageExecutionTime) || 0,
      };
    });
  }

  /**
   * Получить недавние логи
   * @param days Количество дней
   * @param userId ID пользователя (опционально)
   * @returns Массив недавних логов
   */
  async getRecentLogs(
    days: number,
    userId?: string
  ): Promise<AISuggestionLog[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const conditions = [gte(aiSuggestionLogs.createdAt, startDate)];
    if (userId) {
      conditions.push(eq(aiSuggestionLogs.userId, userId));
    }

    return await this.db
      .select()
      .from(aiSuggestionLogs)
      .where(and(...conditions))
      .orderBy(desc(aiSuggestionLogs.createdAt));
  }
}
