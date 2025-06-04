/**
 * Репозиторий для работы с моделью GamePlayer
 * Содержит методы CRUD для работы с игроками в игровых сессиях
 */

import { eq, and, desc, sql, inArray, count } from "drizzle-orm";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "../db/schema";
import { GamePlayer, NewGamePlayer, gamePlayers } from "../db/schema";

export class GamePlayerRepository {
  constructor(private db: PostgresJsDatabase<typeof schema>) {}

  /**
   * Создает нового игрока в игровой сессии
   * @param gamePlayerData Данные игрока
   * @returns Созданный игрок
   */
  async create(gamePlayerData: NewGamePlayer): Promise<GamePlayer> {
    const [gamePlayer] = await this.db
      .insert(gamePlayers)
      .values(gamePlayerData)
      .returning();
    return gamePlayer;
  }

  /**
   * Получает игрока по ID
   * @param id ID игрока
   * @returns Игрок или null, если не найден
   */
  async getById(id: string): Promise<GamePlayer | null> {
    const [gamePlayer] = await this.db
      .select()
      .from(gamePlayers)
      .where(eq(gamePlayers.id, id));
    return gamePlayer || null;
  }

  /**
   * Получает игрока по игровой сессии и пользователю
   * @param gameSessionId ID игровой сессии
   * @param userId ID пользователя
   * @returns Игрок или null, если не найден
   */
  async getByGameSessionAndUser(gameSessionId: string, userId: string): Promise<GamePlayer | null> {
    const [gamePlayer] = await this.db
      .select()
      .from(gamePlayers)
      .where(and(
        eq(gamePlayers.gameSessionId, gameSessionId),
        eq(gamePlayers.userId, userId)
      ));
    return gamePlayer || null;
  }

  /**
   * Получает всех игроков игровой сессии
   * @param gameSessionId ID игровой сессии
   * @param status Статус участия (опционально)
   * @returns Массив игроков
   */
  async getByGameSession(
    gameSessionId: string,
    status?: "registered" | "attended" | "no_show" | "cancelled"
  ): Promise<GamePlayer[]> {
    const conditions = [eq(gamePlayers.gameSessionId, gameSessionId)];

    if (status) {
      conditions.push(eq(gamePlayers.participationStatus, status));
    }

    return await this.db
      .select()
      .from(gamePlayers)
      .where(and(...conditions))
      .orderBy(desc(gamePlayers.createdAt));
  }

  /**
   * Получает все игровые сессии пользователя
   * @param userId ID пользователя
   * @param status Статус участия (опционально)
   * @returns Массив игроков
   */
  async getByUser(
    userId: string,
    status?: "registered" | "attended" | "no_show" | "cancelled"
  ): Promise<GamePlayer[]> {
    const conditions = [eq(gamePlayers.userId, userId)];

    if (status) {
      conditions.push(eq(gamePlayers.participationStatus, status));
    }

    return await this.db
      .select()
      .from(gamePlayers)
      .where(and(...conditions))
      .orderBy(desc(gamePlayers.createdAt));
  }

  /**
   * Получает игроков по статусу
   * @param status Статус участия
   * @returns Массив игроков
   */
  async getByStatus(status: "registered" | "attended" | "no_show" | "cancelled"): Promise<GamePlayer[]> {
    return await this.db
      .select()
      .from(gamePlayers)
      .where(eq(gamePlayers.participationStatus, status))
      .orderBy(desc(gamePlayers.createdAt));
  }

  /**
   * Получает игроков по нескольким игровым сессиям
   * @param gameSessionIds Массив ID игровых сессий
   * @returns Массив игроков
   */
  async getByGameSessions(gameSessionIds: string[]): Promise<GamePlayer[]> {
    if (gameSessionIds.length === 0) return [];

    return await this.db
      .select()
      .from(gamePlayers)
      .where(inArray(gamePlayers.gameSessionId, gameSessionIds))
      .orderBy(desc(gamePlayers.createdAt));
  }

  /**
   * Получает игроков по нескольким пользователям
   * @param userIds Массив ID пользователей
   * @returns Массив игроков
   */
  async getByUsers(userIds: string[]): Promise<GamePlayer[]> {
    if (userIds.length === 0) return [];

    return await this.db
      .select()
      .from(gamePlayers)
      .where(inArray(gamePlayers.userId, userIds))
      .orderBy(desc(gamePlayers.createdAt));
  }

  /**
   * Обновляет данные игрока
   * @param id ID игрока
   * @param updateData Данные для обновления
   * @returns Обновленный игрок или null, если не найден
   */
  async update(
    id: string,
    updateData: Partial<Omit<NewGamePlayer, "gameSessionId" | "userId">>
  ): Promise<GamePlayer | null> {
    const [updatedGamePlayer] = await this.db
      .update(gamePlayers)
      .set(updateData)
      .where(eq(gamePlayers.id, id))
      .returning();
    return updatedGamePlayer || null;
  }

  /**
   * Обновляет статус участия игрока
   * @param id ID игрока
   * @param status Новый статус
   * @returns Обновленный игрок или null, если не найден
   */
  async updateStatus(
    id: string,
    status: "registered" | "attended" | "no_show" | "cancelled"
  ): Promise<GamePlayer | null> {
    const [updatedGamePlayer] = await this.db
      .update(gamePlayers)
      .set({ participationStatus: status })
      .where(eq(gamePlayers.id, id))
      .returning();
    return updatedGamePlayer || null;
  }

  /**
   * Обновляет статус участия по игровой сессии и пользователю
   * @param gameSessionId ID игровой сессии
   * @param userId ID пользователя
   * @param status Новый статус
   * @returns Обновленный игрок или null, если не найден
   */
  async updateStatusByGameSessionAndUser(
    gameSessionId: string,
    userId: string,
    status: "registered" | "attended" | "no_show" | "cancelled"
  ): Promise<GamePlayer | null> {
    const [updatedGamePlayer] = await this.db
      .update(gamePlayers)
      .set({ participationStatus: status })
      .where(and(
        eq(gamePlayers.gameSessionId, gameSessionId),
        eq(gamePlayers.userId, userId)
      ))
      .returning();
    return updatedGamePlayer || null;
  }

  /**
   * Удаляет игрока
   * @param id ID игрока
   * @returns true, если игрок был удален, false если не найден
   */
  async delete(id: string): Promise<boolean> {
    const [deletedGamePlayer] = await this.db
      .delete(gamePlayers)
      .where(eq(gamePlayers.id, id))
      .returning();
    return !!deletedGamePlayer;
  }

  /**
   * Удаляет игрока по игровой сессии и пользователю
   * @param gameSessionId ID игровой сессии
   * @param userId ID пользователя
   * @returns true, если игрок был удален, false если не найден
   */
  async deleteByGameSessionAndUser(gameSessionId: string, userId: string): Promise<boolean> {
    const [deletedGamePlayer] = await this.db
      .delete(gamePlayers)
      .where(and(
        eq(gamePlayers.gameSessionId, gameSessionId),
        eq(gamePlayers.userId, userId)
      ))
      .returning();
    return !!deletedGamePlayer;
  }

  /**
   * Получает количество игроков
   * @param status Статус участия (опционально)
   * @param gameSessionId ID игровой сессии (опционально)
   * @param userId ID пользователя (опционально)
   * @returns Количество игроков
   */
  async getCount(
    status?: "registered" | "attended" | "no_show" | "cancelled",
    gameSessionId?: string,
    userId?: string
  ): Promise<number> {
    const conditions = [];

    if (status) {
      conditions.push(eq(gamePlayers.participationStatus, status));
    }
    if (gameSessionId) {
      conditions.push(eq(gamePlayers.gameSessionId, gameSessionId));
    }
    if (userId) {
      conditions.push(eq(gamePlayers.userId, userId));
    }

    const [result] = await this.db
      .select({ count: count() })
      .from(gamePlayers)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return result.count;
  }

  /**
   * Получает все записи игроков с пагинацией
   * @param limit Лимит записей (опционально)
   * @param offset Смещение (опционально)
   * @returns Массив игроков
   */
  async getAll(limit?: number, offset?: number): Promise<GamePlayer[]> {
    const baseQuery = this.db
      .select()
      .from(gamePlayers)
      .orderBy(desc(gamePlayers.createdAt));

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
   * Получает статистику по игрокам
   * @param gameSessionId ID игровой сессии (опционально)
   * @returns Объект со статистикой
   */
  async getStats(gameSessionId?: string): Promise<{
    totalPlayers: number;
    registeredPlayers: number;
    attendedPlayers: number;
    noShowPlayers: number;
    cancelledPlayers: number;
    attendanceRate: string;
  }> {
    const conditions = [];
    if (gameSessionId) {
      conditions.push(eq(gamePlayers.gameSessionId, gameSessionId));
    }

    const allPlayers = await this.db
      .select()
      .from(gamePlayers)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const totalPlayers = allPlayers.length;
    const registeredPlayers = allPlayers.filter(p => p.participationStatus === "registered").length;
    const attendedPlayers = allPlayers.filter(p => p.participationStatus === "attended").length;
    const noShowPlayers = allPlayers.filter(p => p.participationStatus === "no_show").length;
    const cancelledPlayers = allPlayers.filter(p => p.participationStatus === "cancelled").length;

    const attendanceRate = totalPlayers > 0
      ? ((attendedPlayers / totalPlayers) * 100).toFixed(2)
      : "0.00";

    return {
      totalPlayers,
      registeredPlayers,
      attendedPlayers,
      noShowPlayers,
      cancelledPlayers,
      attendanceRate,
    };
  }

  /**
   * Проверяет, участвует ли пользователь в игровой сессии
   * @param gameSessionId ID игровой сессии
   * @param userId ID пользователя
   * @returns true, если пользователь участвует
   */
  async isUserInGameSession(gameSessionId: string, userId: string): Promise<boolean> {
    const gamePlayer = await this.getByGameSessionAndUser(gameSessionId, userId);
    return !!gamePlayer;
  }

  /**
   * Получает активных игроков игровой сессии (зарегистрированных и присутствующих)
   * @param gameSessionId ID игровой сессии
   * @returns Массив активных игроков
   */
  async getActivePlayersByGameSession(gameSessionId: string): Promise<GamePlayer[]> {
    return await this.db
      .select()
      .from(gamePlayers)
      .where(and(
        eq(gamePlayers.gameSessionId, gameSessionId),
        inArray(gamePlayers.participationStatus, ["registered", "attended"])
      ))
      .orderBy(desc(gamePlayers.createdAt));
  }

  /**
   * Массовое обновление статуса игроков игровой сессии
   * @param gameSessionId ID игровой сессии
   * @param fromStatus Исходный статус
   * @param toStatus Целевой статус
   * @returns Количество обновленных игроков
   */
  async bulkUpdateStatus(
    gameSessionId: string,
    fromStatus: "registered" | "attended" | "no_show" | "cancelled",
    toStatus: "registered" | "attended" | "no_show" | "cancelled"
  ): Promise<number> {
    const updatedPlayers = await this.db
      .update(gamePlayers)
      .set({ participationStatus: toStatus })
      .where(and(
        eq(gamePlayers.gameSessionId, gameSessionId),
        eq(gamePlayers.participationStatus, fromStatus)
      ))
      .returning();

    return updatedPlayers.length;
  }

  /**
   * Удаляет всех игроков игровой сессии
   * @param gameSessionId ID игровой сессии
   * @returns Количество удаленных игроков
   */
  async deleteAllByGameSession(gameSessionId: string): Promise<number> {
    const deletedPlayers = await this.db
      .delete(gamePlayers)
      .where(eq(gamePlayers.gameSessionId, gameSessionId))
      .returning();

    return deletedPlayers.length;
  }

  /**
   * Получает игроков с детальной информацией о пользователе и игровой сессии
   * @param gameSessionId ID игровой сессии (опционально)
   * @param userId ID пользователя (опционально)
   * @returns Массив игроков с дополнительной информацией
   */
  async getWithDetails(gameSessionId?: string, userId?: string): Promise<Array<GamePlayer & {
    user: { firstName: string; lastName: string; email: string; currentRating: number };
    gameSession: { startTime: Date; endTime: Date; gameType: string; status: string };
  }>> {
    const conditions = [];
    if (gameSessionId) {
      conditions.push(eq(gamePlayers.gameSessionId, gameSessionId));
    }
    if (userId) {
      conditions.push(eq(gamePlayers.userId, userId));
    }

    return await this.db
      .select({
        id: gamePlayers.id,
        gameSessionId: gamePlayers.gameSessionId,
        userId: gamePlayers.userId,
        participationStatus: gamePlayers.participationStatus,
        createdAt: gamePlayers.createdAt,
        updatedAt: gamePlayers.updatedAt,
        user: {
          firstName: schema.users.firstName,
          lastName: schema.users.lastName,
          email: schema.users.email,
          currentRating: schema.users.currentRating,
        },
        gameSession: {
          startTime: schema.gameSessions.startTime,
          endTime: schema.gameSessions.endTime,
          gameType: schema.gameSessions.gameType,
          status: schema.gameSessions.status,
        },
      })
      .from(gamePlayers)
      .innerJoin(schema.users, eq(gamePlayers.userId, schema.users.id))
      .innerJoin(schema.gameSessions, eq(gamePlayers.gameSessionId, schema.gameSessions.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(gamePlayers.createdAt));
  }

  /**
   * Получает топ игроков по количеству посещенных игровых сессий
   * @param limit Лимит записей (по умолчанию 10)
   * @returns Массив с топ игроками
   */
  async getTopPlayersByAttendance(limit: number = 10): Promise<Array<{
    userId: string;
    firstName: string;
    lastName: string;
    attendedSessions: number;
    totalSessions: number;
    attendanceRate: string;
  }>> {
    const result = await this.db
      .select({
        userId: gamePlayers.userId,
        firstName: schema.users.firstName,
        lastName: schema.users.lastName,
        attendedSessions: sql<number>`count(case when ${gamePlayers.participationStatus} = 'attended' then 1 end)::int`,
        totalSessions: sql<number>`count(*)::int`,
      })
      .from(gamePlayers)
      .innerJoin(schema.users, eq(gamePlayers.userId, schema.users.id))
      .groupBy(gamePlayers.userId, schema.users.firstName, schema.users.lastName)
      .orderBy(desc(sql`count(case when ${gamePlayers.participationStatus} = 'attended' then 1 end)`))
      .limit(limit);

    return result.map(player => ({
      ...player,
      attendanceRate: player.totalSessions > 0
        ? ((player.attendedSessions / player.totalSessions) * 100).toFixed(2)
        : "0.00",
    }));
  }

  /**
   * Получает игроков по диапазону дат
   * @param startDate Начальная дата
   * @param endDate Конечная дата
   * @returns Массив игроков
   */
  async getByDateRange(startDate: Date, endDate: Date): Promise<GamePlayer[]> {
    return await this.db
      .select()
      .from(gamePlayers)
      .where(and(
        sql`${gamePlayers.createdAt} >= ${startDate}`,
        sql`${gamePlayers.createdAt} <= ${endDate}`
      ))
      .orderBy(desc(gamePlayers.createdAt));
  }

  /**
   * Получает уникальных пользователей, участвовавших в игровых сессиях
   * @param gameSessionIds Массив ID игровых сессий (опционально)
   * @returns Массив уникальных ID пользователей
   */
  async getUniqueUserIds(gameSessionIds?: string[]): Promise<string[]> {
    const conditions = [];
    if (gameSessionIds && gameSessionIds.length > 0) {
      conditions.push(inArray(gamePlayers.gameSessionId, gameSessionIds));
    }

    const result = await this.db
      .selectDistinct({ userId: gamePlayers.userId })
      .from(gamePlayers)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return result.map(r => r.userId);
  }
}
