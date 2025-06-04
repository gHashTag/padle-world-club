/**
 * Репозиторий для работы с моделью RatingChange
 * Содержит методы CRUD для работы с изменениями рейтинга пользователей
 */

import { eq, and, desc, asc, sql, inArray, count, gte, lte } from "drizzle-orm";


import { RatingChange, NewRatingChange, ratingChanges } from "../db/schema";
import * as schema from "../db/schema";
import { DatabaseType } from "./types";

export class RatingChangeRepository {
  constructor(private db: DatabaseType) {}

  /**
   * Создает новое изменение рейтинга
   * @param ratingChangeData Данные изменения рейтинга
   * @returns Созданное изменение рейтинга
   */
  async create(ratingChangeData: NewRatingChange): Promise<RatingChange> {
    const [ratingChange] = await this.db
      .insert(ratingChanges)
      .values(ratingChangeData)
      .returning();
    return ratingChange;
  }

  /**
   * Получает изменение рейтинга по ID
   * @param id ID изменения рейтинга
   * @returns Изменение рейтинга или null, если не найдено
   */
  async getById(id: string): Promise<RatingChange | null> {
    const [ratingChange] = await this.db
      .select()
      .from(ratingChanges)
      .where(eq(ratingChanges.id, id));
    return ratingChange || null;
  }

  /**
   * Получает все изменения рейтинга пользователя
   * @param userId ID пользователя
   * @param reason Причина изменения (опционально)
   * @returns Массив изменений рейтинга
   */
  async getByUser(
    userId: string,
    reason?: "game_session" | "tournament_match" | "manual_adjustment"
  ): Promise<RatingChange[]> {
    const conditions = [eq(ratingChanges.userId, userId)];

    if (reason) {
      conditions.push(eq(ratingChanges.changeReason, reason));
    }

    return await this.db
      .select()
      .from(ratingChanges)
      .where(and(...conditions))
      .orderBy(desc(ratingChanges.createdAt));
  }

  /**
   * Получает изменения рейтинга по причине
   * @param reason Причина изменения
   * @returns Массив изменений рейтинга
   */
  async getByReason(reason: "game_session" | "tournament_match" | "manual_adjustment"): Promise<RatingChange[]> {
    return await this.db
      .select()
      .from(ratingChanges)
      .where(eq(ratingChanges.changeReason, reason))
      .orderBy(desc(ratingChanges.createdAt));
  }

  /**
   * Получает изменения рейтинга по игровой сессии
   * @param gameSessionId ID игровой сессии
   * @returns Массив изменений рейтинга
   */
  async getByGameSession(gameSessionId: string): Promise<RatingChange[]> {
    return await this.db
      .select()
      .from(ratingChanges)
      .where(eq(ratingChanges.relatedGameSessionId, gameSessionId))
      .orderBy(desc(ratingChanges.createdAt));
  }

  /**
   * Получает изменения рейтинга по турнирному матчу
   * @param tournamentMatchId ID турнирного матча
   * @returns Массив изменений рейтинга
   */
  async getByTournamentMatch(tournamentMatchId: string): Promise<RatingChange[]> {
    return await this.db
      .select()
      .from(ratingChanges)
      .where(eq(ratingChanges.relatedTournamentMatchId, tournamentMatchId))
      .orderBy(desc(ratingChanges.createdAt));
  }

  /**
   * Получает изменения рейтинга по нескольким пользователям
   * @param userIds Массив ID пользователей
   * @returns Массив изменений рейтинга
   */
  async getByUsers(userIds: string[]): Promise<RatingChange[]> {
    if (userIds.length === 0) return [];

    return await this.db
      .select()
      .from(ratingChanges)
      .where(inArray(ratingChanges.userId, userIds))
      .orderBy(desc(ratingChanges.createdAt));
  }

  /**
   * Получает изменения рейтинга по диапазону дат
   * @param startDate Начальная дата
   * @param endDate Конечная дата
   * @returns Массив изменений рейтинга
   */
  async getByDateRange(startDate: Date, endDate: Date): Promise<RatingChange[]> {
    return await this.db
      .select()
      .from(ratingChanges)
      .where(and(
        gte(ratingChanges.createdAt, startDate),
        lte(ratingChanges.createdAt, endDate)
      ))
      .orderBy(desc(ratingChanges.createdAt));
  }

  /**
   * Получает изменения рейтинга по диапазону значений
   * @param minChange Минимальное изменение рейтинга
   * @param maxChange Максимальное изменение рейтинга
   * @returns Массив изменений рейтинга
   */
  async getByRatingChangeRange(minChange: number, maxChange: number): Promise<RatingChange[]> {
    return await this.db
      .select()
      .from(ratingChanges)
      .where(and(
        gte(sql`${ratingChanges.newRating} - ${ratingChanges.oldRating}`, minChange),
        lte(sql`${ratingChanges.newRating} - ${ratingChanges.oldRating}`, maxChange)
      ))
      .orderBy(desc(ratingChanges.createdAt));
  }

  /**
   * Обновляет данные изменения рейтинга
   * @param id ID изменения рейтинга
   * @param updateData Данные для обновления
   * @returns Обновленное изменение рейтинга или null, если не найдено
   */
  async update(
    id: string,
    updateData: Partial<Omit<NewRatingChange, "userId">>
  ): Promise<RatingChange | null> {
    const [updatedRatingChange] = await this.db
      .update(ratingChanges)
      .set(updateData)
      .where(eq(ratingChanges.id, id))
      .returning();
    return updatedRatingChange || null;
  }

  /**
   * Удаляет изменение рейтинга
   * @param id ID изменения рейтинга
   * @returns true, если изменение было удалено, false если не найдено
   */
  async delete(id: string): Promise<boolean> {
    const [deletedRatingChange] = await this.db
      .delete(ratingChanges)
      .where(eq(ratingChanges.id, id))
      .returning();
    return !!deletedRatingChange;
  }

  /**
   * Получает количество изменений рейтинга
   * @param userId ID пользователя (опционально)
   * @param reason Причина изменения (опционально)
   * @returns Количество изменений рейтинга
   */
  async getCount(
    userId?: string,
    reason?: "game_session" | "tournament_match" | "manual_adjustment"
  ): Promise<number> {
    const conditions = [];

    if (userId) {
      conditions.push(eq(ratingChanges.userId, userId));
    }
    if (reason) {
      conditions.push(eq(ratingChanges.changeReason, reason));
    }

    const [result] = await this.db
      .select({ count: count() })
      .from(ratingChanges)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return result.count;
  }

  /**
   * Получает все записи изменений рейтинга с пагинацией
   * @param limit Лимит записей (опционально)
   * @param offset Смещение (опционально)
   * @returns Массив изменений рейтинга
   */
  async getAll(limit?: number, offset?: number): Promise<RatingChange[]> {
    const baseQuery = this.db
      .select()
      .from(ratingChanges)
      .orderBy(desc(ratingChanges.createdAt));

    if (limit && offset) {
      return await baseQuery.limit(limit).offset(offset);
    } else if (limit) {
      return await baseQuery.limit(limit);
    } else if (offset) {
      return await baseQuery.offset(offset);
    } else {
      return await baseQuery;
    }
  }

  /**
   * Получает статистику по изменениям рейтинга
   * @param userId ID пользователя (опционально)
   * @returns Объект со статистикой
   */
  async getStats(userId?: string): Promise<{
    totalChanges: number;
    gameSessionChanges: number;
    tournamentChanges: number;
    manualChanges: number;
    averageChange: string;
    maxIncrease: number;
    maxDecrease: number;
  }> {
    const conditions = [];
    if (userId) {
      conditions.push(eq(ratingChanges.userId, userId));
    }

    const allChanges = await this.db
      .select()
      .from(ratingChanges)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const totalChanges = allChanges.length;
    const gameSessionChanges = allChanges.filter(c => c.changeReason === "game_session").length;
    const tournamentChanges = allChanges.filter(c => c.changeReason === "tournament_match").length;
    const manualChanges = allChanges.filter(c => c.changeReason === "manual_adjustment").length;

    const changes = allChanges.map(c => c.newRating - c.oldRating);
    const averageChange = totalChanges > 0
      ? (changes.reduce((sum, change) => sum + change, 0) / totalChanges).toFixed(2)
      : "0.00";

    const maxIncrease = changes.length > 0 ? Math.max(...changes) : 0;
    const maxDecrease = changes.length > 0 ? Math.min(...changes) : 0;

    return {
      totalChanges,
      gameSessionChanges,
      tournamentChanges,
      manualChanges,
      averageChange,
      maxIncrease,
      maxDecrease,
    };
  }

  /**
   * Получает последнее изменение рейтинга пользователя
   * @param userId ID пользователя
   * @returns Последнее изменение рейтинга или null
   */
  async getLastChange(userId: string): Promise<RatingChange | null> {
    const [lastChange] = await this.db
      .select()
      .from(ratingChanges)
      .where(eq(ratingChanges.userId, userId))
      .orderBy(desc(ratingChanges.createdAt))
      .limit(1);
    return lastChange || null;
  }

  /**
   * Получает историю рейтинга пользователя с ограничением
   * @param userId ID пользователя
   * @param limit Количество последних изменений
   * @returns Массив изменений рейтинга
   */
  async getRatingHistory(userId: string, limit: number = 10): Promise<RatingChange[]> {
    return await this.db
      .select()
      .from(ratingChanges)
      .where(eq(ratingChanges.userId, userId))
      .orderBy(desc(ratingChanges.createdAt))
      .limit(limit);
  }

  /**
   * Получает изменения рейтинга с детальной информацией о пользователе
   * @param userId ID пользователя (опционально)
   * @param limit Лимит записей (опционально)
   * @returns Массив изменений рейтинга с информацией о пользователе
   */
  async getWithUserDetails(userId?: string, limit?: number): Promise<Array<RatingChange & {
    user: { firstName: string; lastName: string; email: string; currentRating: number };
  }>> {
    const conditions = [];
    if (userId) {
      conditions.push(eq(ratingChanges.userId, userId));
    }

    const baseQuery = this.db
      .select({
        id: ratingChanges.id,
        userId: ratingChanges.userId,
        oldRating: ratingChanges.oldRating,
        newRating: ratingChanges.newRating,
        changeReason: ratingChanges.changeReason,
        relatedGameSessionId: ratingChanges.relatedGameSessionId,
        relatedTournamentMatchId: ratingChanges.relatedTournamentMatchId,
        notes: ratingChanges.notes,
        createdAt: ratingChanges.createdAt,
        updatedAt: ratingChanges.updatedAt,
        user: {
          firstName: schema.users.firstName,
          lastName: schema.users.lastName,
          email: schema.users.email,
          currentRating: schema.users.currentRating,
        },
      })
      .from(ratingChanges)
      .innerJoin(schema.users, eq(ratingChanges.userId, schema.users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(ratingChanges.createdAt));

    if (limit) {
      return await baseQuery.limit(limit);
    } else {
      return await baseQuery;
    }
  }

  /**
   * Получает топ пользователей по росту рейтинга
   * @param limit Лимит записей (по умолчанию 10)
   * @param period Период в днях (опционально)
   * @returns Массив с топ пользователями
   */
  async getTopRatingGainers(limit: number = 10, period?: number): Promise<Array<{
    userId: string;
    firstName: string;
    lastName: string;
    totalGain: number;
    changesCount: number;
    currentRating: number;
  }>> {
    const conditions = [];
    if (period) {
      const periodStart = new Date();
      periodStart.setDate(periodStart.getDate() - period);
      conditions.push(gte(ratingChanges.createdAt, periodStart));
    }

    const result = await this.db
      .select({
        userId: ratingChanges.userId,
        firstName: schema.users.firstName,
        lastName: schema.users.lastName,
        totalGain: sql<number>`sum(${ratingChanges.newRating} - ${ratingChanges.oldRating})::float`,
        changesCount: sql<number>`count(*)::int`,
        currentRating: schema.users.currentRating,
      })
      .from(ratingChanges)
      .innerJoin(schema.users, eq(ratingChanges.userId, schema.users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .groupBy(ratingChanges.userId, schema.users.firstName, schema.users.lastName, schema.users.currentRating)
      .orderBy(desc(sql`sum(${ratingChanges.newRating} - ${ratingChanges.oldRating})`))
      .limit(limit);

    return result;
  }

  /**
   * Получает изменения рейтинга с положительным изменением
   * @param userId ID пользователя (опционально)
   * @returns Массив положительных изменений рейтинга
   */
  async getPositiveChanges(userId?: string): Promise<RatingChange[]> {
    const conditions = [sql`${ratingChanges.newRating} > ${ratingChanges.oldRating}`];

    if (userId) {
      conditions.push(eq(ratingChanges.userId, userId));
    }

    return await this.db
      .select()
      .from(ratingChanges)
      .where(and(...conditions))
      .orderBy(desc(ratingChanges.createdAt));
  }

  /**
   * Получает изменения рейтинга с отрицательным изменением
   * @param userId ID пользователя (опционально)
   * @returns Массив отрицательных изменений рейтинга
   */
  async getNegativeChanges(userId?: string): Promise<RatingChange[]> {
    const conditions = [sql`${ratingChanges.newRating} < ${ratingChanges.oldRating}`];

    if (userId) {
      conditions.push(eq(ratingChanges.userId, userId));
    }

    return await this.db
      .select()
      .from(ratingChanges)
      .where(and(...conditions))
      .orderBy(desc(ratingChanges.createdAt));
  }

  /**
   * Удаляет все изменения рейтинга пользователя
   * @param userId ID пользователя
   * @returns Количество удаленных записей
   */
  async deleteAllByUser(userId: string): Promise<number> {
    const deletedChanges = await this.db
      .delete(ratingChanges)
      .where(eq(ratingChanges.userId, userId))
      .returning();

    return deletedChanges.length;
  }

  /**
   * Получает среднее изменение рейтинга по причинам
   * @returns Объект со средними изменениями по причинам
   */
  async getAverageChangesByReason(): Promise<{
    gameSession: string;
    tournamentMatch: string;
    manualAdjustment: string;
  }> {
    const result = await this.db
      .select({
        changeReason: ratingChanges.changeReason,
        averageChange: sql<number>`avg(${ratingChanges.newRating} - ${ratingChanges.oldRating})::float`,
      })
      .from(ratingChanges)
      .groupBy(ratingChanges.changeReason);

    const averages = {
      gameSession: "0.00",
      tournamentMatch: "0.00",
      manualAdjustment: "0.00",
    };

    result.forEach(row => {
      const avg = row.averageChange?.toFixed(2) || "0.00";
      switch (row.changeReason) {
        case "game_session":
          averages.gameSession = avg;
          break;
        case "tournament_match":
          averages.tournamentMatch = avg;
          break;
        case "manual_adjustment":
          averages.manualAdjustment = avg;
          break;
      }
    });

    return averages;
  }

  /**
   * Получает изменения рейтинга, сгруппированные по дням
   * @param userId ID пользователя (опционально)
   * @param days Количество дней (по умолчанию 30)
   * @returns Массив с изменениями по дням
   */
  async getChangesByDays(userId?: string, days: number = 30): Promise<Array<{
    date: string;
    changesCount: number;
    totalChange: number;
  }>> {
    const conditions = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    conditions.push(gte(ratingChanges.createdAt, startDate));

    if (userId) {
      conditions.push(eq(ratingChanges.userId, userId));
    }

    const result = await this.db
      .select({
        date: sql<string>`date(${ratingChanges.createdAt})`,
        changesCount: sql<number>`count(*)::int`,
        totalChange: sql<number>`sum(${ratingChanges.newRating} - ${ratingChanges.oldRating})::float`,
      })
      .from(ratingChanges)
      .where(and(...conditions))
      .groupBy(sql`date(${ratingChanges.createdAt})`)
      .orderBy(asc(sql`date(${ratingChanges.createdAt})`));

    return result;
  }
}
