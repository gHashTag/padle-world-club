/**
 * Репозиторий для работы с моделью GameSession
 * Содержит методы CRUD для работы с игровыми сессиями
 */

import { eq, and, desc, sql, gte, lte, lt, inArray, isNull, isNotNull } from "drizzle-orm";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "../db/schema";
import { GameSession, NewGameSession, gameSessions } from "../db/schema";

export class GameSessionRepository {
  private db: PostgresJsDatabase<typeof schema>;

  constructor(db: PostgresJsDatabase<typeof schema>) {
    this.db = db;
  }

  /**
   * Создает новую игровую сессию
   * @param sessionData Данные игровой сессии
   * @returns Созданная игровая сессия
   */
  async create(sessionData: NewGameSession): Promise<GameSession> {
    const [gameSession] = await this.db.insert(gameSessions).values(sessionData).returning();
    return gameSession;
  }

  /**
   * Получает игровую сессию по ID
   * @param id ID игровой сессии
   * @returns Игровая сессия или null, если не найдена
   */
  async getById(id: string): Promise<GameSession | null> {
    const result = await this.db
      .select()
      .from(gameSessions)
      .where(eq(gameSessions.id, id));

    return result.length > 0 ? result[0] : null;
  }

  /**
   * Получает игровые сессии по площадке
   * @param venueId ID площадки
   * @param statusFilter Фильтр по статусу (опционально)
   * @returns Массив игровых сессий
   */
  async getByVenue(
    venueId: string,
    statusFilter?: "open_for_players" | "full" | "in_progress" | "completed" | "cancelled"
  ): Promise<GameSession[]> {
    const conditions = [eq(gameSessions.venueId, venueId)];

    if (statusFilter) {
      conditions.push(eq(gameSessions.status, statusFilter));
    }

    return await this.db
      .select()
      .from(gameSessions)
      .where(and(...conditions))
      .orderBy(desc(gameSessions.startTime));
  }

  /**
   * Получает игровые сессии по корту
   * @param courtId ID корта
   * @param statusFilter Фильтр по статусу (опционально)
   * @returns Массив игровых сессий
   */
  async getByCourt(
    courtId: string,
    statusFilter?: "open_for_players" | "full" | "in_progress" | "completed" | "cancelled"
  ): Promise<GameSession[]> {
    const conditions = [eq(gameSessions.courtId, courtId)];

    if (statusFilter) {
      conditions.push(eq(gameSessions.status, statusFilter));
    }

    return await this.db
      .select()
      .from(gameSessions)
      .where(and(...conditions))
      .orderBy(desc(gameSessions.startTime));
  }

  /**
   * Получает игровые сессии по статусу
   * @param status Статус игровой сессии
   * @returns Массив игровых сессий
   */
  async getByStatus(status: "open_for_players" | "full" | "in_progress" | "completed" | "cancelled"): Promise<GameSession[]> {
    return await this.db
      .select()
      .from(gameSessions)
      .where(eq(gameSessions.status, status))
      .orderBy(desc(gameSessions.startTime));
  }

  /**
   * Получает игровые сессии по типу игры
   * @param gameType Тип игры
   * @returns Массив игровых сессий
   */
  async getByGameType(gameType: "public_match" | "private_match"): Promise<GameSession[]> {
    return await this.db
      .select()
      .from(gameSessions)
      .where(eq(gameSessions.gameType, gameType))
      .orderBy(desc(gameSessions.startTime));
  }

  /**
   * Получает игровые сессии по уровню навыков
   * @param skillLevel Требуемый уровень навыков
   * @returns Массив игровых сессий
   */
  async getBySkillLevel(skillLevel: "beginner" | "intermediate" | "advanced" | "professional"): Promise<GameSession[]> {
    return await this.db
      .select()
      .from(gameSessions)
      .where(eq(gameSessions.neededSkillLevel, skillLevel))
      .orderBy(desc(gameSessions.startTime));
  }

  /**
   * Получает игровые сессии, созданные пользователем
   * @param userId ID пользователя
   * @param statusFilter Фильтр по статусу (опционально)
   * @returns Массив игровых сессий
   */
  async getByCreator(
    userId: string,
    statusFilter?: "open_for_players" | "full" | "in_progress" | "completed" | "cancelled"
  ): Promise<GameSession[]> {
    const conditions = [eq(gameSessions.createdByUserId, userId)];

    if (statusFilter) {
      conditions.push(eq(gameSessions.status, statusFilter));
    }

    return await this.db
      .select()
      .from(gameSessions)
      .where(and(...conditions))
      .orderBy(desc(gameSessions.createdAt));
  }

  /**
   * Получает игровые сессии, где пользователь является хостом
   * @param userId ID пользователя
   * @param statusFilter Фильтр по статусу (опционально)
   * @returns Массив игровых сессий
   */
  async getByHost(
    userId: string,
    statusFilter?: "open_for_players" | "full" | "in_progress" | "completed" | "cancelled"
  ): Promise<GameSession[]> {
    const conditions = [eq(gameSessions.hostUserId, userId)];

    if (statusFilter) {
      conditions.push(eq(gameSessions.status, statusFilter));
    }

    return await this.db
      .select()
      .from(gameSessions)
      .where(and(...conditions))
      .orderBy(desc(gameSessions.startTime));
  }

  /**
   * Получает открытые игровые сессии для подбора игроков
   * @param venueId ID площадки (опционально)
   * @param skillLevel Уровень навыков (опционально)
   * @returns Массив открытых игровых сессий
   */
  async getOpenForPlayers(
    venueId?: string,
    skillLevel?: "beginner" | "intermediate" | "advanced" | "professional"
  ): Promise<GameSession[]> {
    const conditions = [eq(gameSessions.status, "open_for_players")];

    if (venueId) {
      conditions.push(eq(gameSessions.venueId, venueId));
    }

    if (skillLevel) {
      conditions.push(eq(gameSessions.neededSkillLevel, skillLevel));
    }

    return await this.db
      .select()
      .from(gameSessions)
      .where(and(...conditions))
      .orderBy(gameSessions.startTime);
  }

  /**
   * Получает игровые сессии по диапазону времени
   * @param startDate Начальная дата
   * @param endDate Конечная дата
   * @param venueId ID площадки (опционально)
   * @returns Массив игровых сессий
   */
  async getByTimeRange(startDate: Date, endDate: Date, venueId?: string): Promise<GameSession[]> {
    const conditions = [
      gte(gameSessions.startTime, startDate),
      lte(gameSessions.startTime, endDate)
    ];

    if (venueId) {
      conditions.push(eq(gameSessions.venueId, venueId));
    }

    return await this.db
      .select()
      .from(gameSessions)
      .where(and(...conditions))
      .orderBy(gameSessions.startTime);
  }

  /**
   * Получает игровые сессии с доступными местами
   * @param venueId ID площадки (опционально)
   * @param skillLevel Уровень навыков (опционально)
   * @returns Массив игровых сессий с доступными местами
   */
  async getWithAvailableSlots(
    venueId?: string,
    skillLevel?: "beginner" | "intermediate" | "advanced" | "professional"
  ): Promise<GameSession[]> {
    const conditions = [
      inArray(gameSessions.status, ["open_for_players", "full"]),
      sql`${gameSessions.currentPlayers} < ${gameSessions.maxPlayers}`
    ];

    if (venueId) {
      conditions.push(eq(gameSessions.venueId, venueId));
    }

    if (skillLevel) {
      conditions.push(eq(gameSessions.neededSkillLevel, skillLevel));
    }

    return await this.db
      .select()
      .from(gameSessions)
      .where(and(...conditions))
      .orderBy(gameSessions.startTime);
  }

  /**
   * Получает игровые сессии без назначенного корта
   * @param venueId ID площадки (опционально)
   * @returns Массив игровых сессий без корта
   */
  async getWithoutCourt(venueId?: string): Promise<GameSession[]> {
    const conditions = [isNull(gameSessions.courtId)];

    if (venueId) {
      conditions.push(eq(gameSessions.venueId, venueId));
    }

    return await this.db
      .select()
      .from(gameSessions)
      .where(and(...conditions))
      .orderBy(gameSessions.startTime);
  }

  /**
   * Получает игровые сессии с результатами
   * @param venueId ID площадки (опционально)
   * @returns Массив завершенных игровых сессий с результатами
   */
  async getWithResults(venueId?: string): Promise<GameSession[]> {
    const conditions = [
      eq(gameSessions.status, "completed"),
      isNotNull(gameSessions.matchScore)
    ];

    if (venueId) {
      conditions.push(eq(gameSessions.venueId, venueId));
    }

    return await this.db
      .select()
      .from(gameSessions)
      .where(and(...conditions))
      .orderBy(desc(gameSessions.endTime));
  }

  /**
   * Получает все игровые сессии
   * @param limit Лимит записей (по умолчанию 100)
   * @param offset Смещение (по умолчанию 0)
   * @returns Массив игровых сессий
   */
  async getAll(limit: number = 100, offset: number = 0): Promise<GameSession[]> {
    return await this.db
      .select()
      .from(gameSessions)
      .orderBy(desc(gameSessions.createdAt))
      .limit(limit)
      .offset(offset);
  }

  /**
   * Обновляет данные игровой сессии
   * @param id ID игровой сессии
   * @param sessionData Данные для обновления
   * @returns Обновленная игровая сессия или null, если не найдена
   */
  async update(id: string, sessionData: Partial<NewGameSession>): Promise<GameSession | null> {
    const [updatedSession] = await this.db
      .update(gameSessions)
      .set(sessionData)
      .where(eq(gameSessions.id, id))
      .returning();

    return updatedSession || null;
  }

  /**
   * Обновляет статус игровой сессии
   * @param id ID игровой сессии
   * @param status Новый статус
   * @returns Обновленная игровая сессия или null, если не найдена
   */
  async updateStatus(
    id: string,
    status: "open_for_players" | "full" | "in_progress" | "completed" | "cancelled"
  ): Promise<GameSession | null> {
    return await this.update(id, { status });
  }

  /**
   * Обновляет количество текущих игроков
   * @param id ID игровой сессии
   * @param currentPlayers Новое количество игроков
   * @returns Обновленная игровая сессия или null, если не найдена
   */
  async updateCurrentPlayers(id: string, currentPlayers: number): Promise<GameSession | null> {
    const gameSession = await this.getById(id);

    if (!gameSession) {
      return null;
    }

    // Автоматически обновляем статус в зависимости от количества игроков
    let newStatus = gameSession.status;
    if (currentPlayers >= gameSession.maxPlayers && gameSession.status === "open_for_players") {
      newStatus = "full";
    } else if (currentPlayers < gameSession.maxPlayers && gameSession.status === "full") {
      newStatus = "open_for_players";
    }

    return await this.update(id, {
      currentPlayers,
      status: newStatus
    });
  }

  /**
   * Назначает корт игровой сессии
   * @param id ID игровой сессии
   * @param courtId ID корта
   * @returns Обновленная игровая сессия или null, если не найдена
   */
  async assignCourt(id: string, courtId: string): Promise<GameSession | null> {
    return await this.update(id, { courtId });
  }

  /**
   * Устанавливает результат матча
   * @param id ID игровой сессии
   * @param matchScore Счет матча
   * @param winnerUserIds Массив ID победителей
   * @returns Обновленная игровая сессия или null, если не найдена
   */
  async setMatchResult(id: string, matchScore: string, winnerUserIds: string[]): Promise<GameSession | null> {
    return await this.update(id, {
      matchScore,
      winnerUserIds,
      status: "completed"
    });
  }

  /**
   * Удаляет игровую сессию
   * @param id ID игровой сессии
   * @returns true, если игровая сессия успешно удалена, иначе false
   */
  async delete(id: string): Promise<boolean> {
    const [deletedSession] = await this.db
      .delete(gameSessions)
      .where(eq(gameSessions.id, id))
      .returning();

    return !!deletedSession;
  }

  /**
   * Получает количество игровых сессий
   * @param statusFilter Фильтр по статусу (опционально)
   * @param venueId ID площадки (опционально)
   * @returns Количество игровых сессий
   */
  async getCount(
    statusFilter?: "open_for_players" | "full" | "in_progress" | "completed" | "cancelled",
    venueId?: string
  ): Promise<number> {
    const conditions = [];

    if (statusFilter) {
      conditions.push(eq(gameSessions.status, statusFilter));
    }

    if (venueId) {
      conditions.push(eq(gameSessions.venueId, venueId));
    }

    const result = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(gameSessions)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return Number(result[0]?.count) || 0;
  }

  /**
   * Получает статистику по игровым сессиям
   * @param venueId ID площадки (опционально, для статистики конкретной площадки)
   * @returns Объект со статистикой
   */
  async getStats(venueId?: string): Promise<{
    totalSessions: number;
    openSessions: number;
    fullSessions: number;
    inProgressSessions: number;
    completedSessions: number;
    cancelledSessions: number;
    publicMatches: number;
    privateMatches: number;
    averagePlayersPerSession: string;
    sessionsWithoutCourt: number;
    sessionsWithResults: number;
  }> {
    const conditions = [];
    if (venueId) {
      conditions.push(eq(gameSessions.venueId, venueId));
    }

    const allSessions = await this.db
      .select()
      .from(gameSessions)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const totalSessions = allSessions.length;
    const openSessions = allSessions.filter(s => s.status === "open_for_players").length;
    const fullSessions = allSessions.filter(s => s.status === "full").length;
    const inProgressSessions = allSessions.filter(s => s.status === "in_progress").length;
    const completedSessions = allSessions.filter(s => s.status === "completed").length;
    const cancelledSessions = allSessions.filter(s => s.status === "cancelled").length;

    const publicMatches = allSessions.filter(s => s.gameType === "public_match").length;
    const privateMatches = allSessions.filter(s => s.gameType === "private_match").length;

    const totalPlayers = allSessions.reduce((sum, s) => sum + s.currentPlayers, 0);
    const averagePlayersPerSession = totalSessions > 0
      ? (totalPlayers / totalSessions).toFixed(2)
      : "0.00";

    const sessionsWithoutCourt = allSessions.filter(s => s.courtId === null).length;
    const sessionsWithResults = allSessions.filter(s => s.matchScore !== null).length;

    return {
      totalSessions,
      openSessions,
      fullSessions,
      inProgressSessions,
      completedSessions,
      cancelledSessions,
      publicMatches,
      privateMatches,
      averagePlayersPerSession,
      sessionsWithoutCourt,
      sessionsWithResults,
    };
  }

  /**
   * Отменяет игровую сессию
   * @param id ID игровой сессии
   * @returns Обновленная игровая сессия или null, если не найдена
   */
  async cancel(id: string): Promise<GameSession | null> {
    return await this.updateStatus(id, "cancelled");
  }

  /**
   * Начинает игровую сессию (переводит в статус "in_progress")
   * @param id ID игровой сессии
   * @returns Обновленная игровая сессия или null, если не найдена
   */
  async start(id: string): Promise<GameSession | null> {
    return await this.updateStatus(id, "in_progress");
  }

  /**
   * Завершает игровую сессию
   * @param id ID игровой сессии
   * @returns Обновленная игровая сессия или null, если не найдена
   */
  async complete(id: string): Promise<GameSession | null> {
    return await this.updateStatus(id, "completed");
  }

  /**
   * Получает игровые сессии, которые скоро начнутся
   * @param minutesUntilStart Количество минут до начала (по умолчанию 30)
   * @param venueId ID площадки (опционально)
   * @returns Массив игровых сессий, которые скоро начнутся
   */
  async getStartingSoon(minutesUntilStart: number = 30, venueId?: string): Promise<GameSession[]> {
    const now = new Date();
    const startThreshold = new Date();
    startThreshold.setMinutes(now.getMinutes() + minutesUntilStart);

    const conditions = [
      inArray(gameSessions.status, ["open_for_players", "full"]),
      gte(gameSessions.startTime, now),
      lte(gameSessions.startTime, startThreshold)
    ];

    if (venueId) {
      conditions.push(eq(gameSessions.venueId, venueId));
    }

    return await this.db
      .select()
      .from(gameSessions)
      .where(and(...conditions))
      .orderBy(gameSessions.startTime);
  }

  /**
   * Получает просроченные игровые сессии (которые должны были начаться, но не начались)
   * @param venueId ID площадки (опционально)
   * @returns Массив просроченных игровых сессий
   */
  async getOverdue(venueId?: string): Promise<GameSession[]> {
    const now = new Date();

    const conditions = [
      inArray(gameSessions.status, ["open_for_players", "full"]),
      lt(gameSessions.startTime, now)
    ];

    if (venueId) {
      conditions.push(eq(gameSessions.venueId, venueId));
    }

    return await this.db
      .select()
      .from(gameSessions)
      .where(and(...conditions))
      .orderBy(desc(gameSessions.startTime));
  }

  /**
   * Получает игровые сессии по ID пользователей-победителей
   * @param userIds Массив ID пользователей
   * @returns Массив игровых сессий, где указанные пользователи были победителями
   */
  async getByWinners(userIds: string[]): Promise<GameSession[]> {
    return await this.db
      .select()
      .from(gameSessions)
      .where(and(
        eq(gameSessions.status, "completed"),
        sql`${gameSessions.winnerUserIds} && ARRAY[${sql.join(userIds.map(id => sql`${id}::uuid`), sql`, `)}]`
      ))
      .orderBy(desc(gameSessions.endTime));
  }

  /**
   * Получает игровые сессии по связанному бронированию
   * @param bookingId ID бронирования
   * @returns Массив игровых сессий, связанных с бронированием
   */
  async getByRelatedBooking(bookingId: string): Promise<GameSession[]> {
    return await this.db
      .select()
      .from(gameSessions)
      .where(eq(gameSessions.relatedBookingId, bookingId))
      .orderBy(desc(gameSessions.startTime));
  }

  /**
   * Ищет подходящие игровые сессии для пользователя
   * @param skillLevel Уровень навыков пользователя
   * @param venueId ID площадки (опционально)
   * @param gameType Тип игры (опционально)
   * @returns Массив подходящих открытых игровых сессий
   */
  async findSuitableForUser(
    skillLevel: "beginner" | "intermediate" | "advanced" | "professional",
    venueId?: string,
    gameType?: "public_match" | "private_match"
  ): Promise<GameSession[]> {
    const conditions = [
      eq(gameSessions.status, "open_for_players"),
      eq(gameSessions.neededSkillLevel, skillLevel),
      sql`${gameSessions.currentPlayers} < ${gameSessions.maxPlayers}`,
      gte(gameSessions.startTime, new Date())
    ];

    if (venueId) {
      conditions.push(eq(gameSessions.venueId, venueId));
    }

    if (gameType) {
      conditions.push(eq(gameSessions.gameType, gameType));
    }

    return await this.db
      .select()
      .from(gameSessions)
      .where(and(...conditions))
      .orderBy(gameSessions.startTime);
  }

  /**
   * Массово обновляет статус просроченных сессий
   * @returns Количество обновленных сессий
   */
  async markOverdueSessions(): Promise<number> {
    const now = new Date();

    const updatedSessions = await this.db
      .update(gameSessions)
      .set({ status: "cancelled" })
      .where(and(
        inArray(gameSessions.status, ["open_for_players", "full"]),
        lt(gameSessions.startTime, now)
      ))
      .returning();

    return updatedSessions.length;
  }

  /**
   * Получает самые популярные временные слоты
   * @param venueId ID площадки (опционально)
   * @param limit Лимит записей (по умолчанию 10)
   * @returns Массив с временными слотами и количеством сессий
   */
  async getMostPopularTimeSlots(venueId?: string, limit: number = 10): Promise<Array<{ hour: number; sessionCount: number }>> {
    const conditions = [];
    if (venueId) {
      conditions.push(eq(gameSessions.venueId, venueId));
    }

    const result = await this.db
      .select({
        hour: sql<number>`EXTRACT(HOUR FROM ${gameSessions.startTime})::int`,
        sessionCount: sql<number>`count(*)::int`
      })
      .from(gameSessions)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .groupBy(sql`EXTRACT(HOUR FROM ${gameSessions.startTime})`)
      .orderBy(desc(sql`count(*)`))
      .limit(limit);

    return result.map(row => ({
      hour: Number(row.hour),
      sessionCount: Number(row.sessionCount)
    }));
  }

  /**
   * Получает игровые сессии по диапазону количества игроков
   * @param minPlayers Минимальное количество игроков
   * @param maxPlayers Максимальное количество игроков (опционально)
   * @returns Массив игровых сессий
   */
  async getByPlayersRange(minPlayers: number, maxPlayers?: number): Promise<GameSession[]> {
    const conditions = [gte(gameSessions.currentPlayers, minPlayers)];

    if (maxPlayers !== undefined) {
      conditions.push(lte(gameSessions.currentPlayers, maxPlayers));
    }

    return await this.db
      .select()
      .from(gameSessions)
      .where(and(...conditions))
      .orderBy(desc(gameSessions.currentPlayers));
  }

  /**
   * Устанавливает хоста игровой сессии
   * @param id ID игровой сессии
   * @param hostUserId ID пользователя-хоста
   * @returns Обновленная игровая сессия или null, если не найдена
   */
  async setHost(id: string, hostUserId: string): Promise<GameSession | null> {
    return await this.update(id, { hostUserId });
  }

  /**
   * Убирает хоста игровой сессии
   * @param id ID игровой сессии
   * @returns Обновленная игровая сессия или null, если не найдена
   */
  async removeHost(id: string): Promise<GameSession | null> {
    return await this.update(id, { hostUserId: null });
  }
}
