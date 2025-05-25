/**
 * Репозиторий для работы с моделью TournamentMatch
 * Содержит методы CRUD для работы с матчами турниров
 */

import { eq, and, desc, asc, sql, inArray, count, like, or, gte, lte, isNull, isNotNull } from "drizzle-orm";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "../db/schema";
import { TournamentMatch, NewTournamentMatch, tournamentMatches, UpdateTournamentMatch } from "../db/schema";

export class TournamentMatchRepository {
  constructor(private db: PostgresJsDatabase<typeof schema>) {}

  /**
   * Создать новый матч турнира
   * @param data Данные для создания матча
   * @returns Созданный матч
   */
  async create(data: NewTournamentMatch): Promise<TournamentMatch> {
    const [match] = await this.db.insert(tournamentMatches).values(data).returning();
    return match;
  }

  /**
   * Получить матч по ID
   * @param id ID матча
   * @returns Матч или null
   */
  async getById(id: string): Promise<TournamentMatch | null> {
    const [match] = await this.db
      .select()
      .from(tournamentMatches)
      .where(eq(tournamentMatches.id, id));
    return match || null;
  }

  /**
   * Получить матч по турниру и номеру матча
   * @param tournamentId ID турнира
   * @param matchNumber Номер матча
   * @returns Матч или null
   */
  async getByTournamentAndMatchNumber(tournamentId: string, matchNumber: number): Promise<TournamentMatch | null> {
    const [match] = await this.db
      .select()
      .from(tournamentMatches)
      .where(and(
        eq(tournamentMatches.tournamentId, tournamentId),
        eq(tournamentMatches.matchNumber, matchNumber)
      ));
    return match || null;
  }

  /**
   * Получить все матчи турнира
   * @param tournamentId ID турнира
   * @param limit Лимит записей
   * @param offset Смещение
   * @returns Массив матчей
   */
  async getByTournament(tournamentId: string, limit?: number, offset?: number): Promise<TournamentMatch[]> {
    const baseQuery = this.db
      .select()
      .from(tournamentMatches)
      .where(eq(tournamentMatches.tournamentId, tournamentId))
      .orderBy(asc(tournamentMatches.matchNumber));

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
   * Получить матчи по нескольким турнирам
   * @param tournamentIds Массив ID турниров
   * @returns Массив матчей
   */
  async getByTournaments(tournamentIds: string[]): Promise<TournamentMatch[]> {
    if (tournamentIds.length === 0) return [];

    return await this.db
      .select()
      .from(tournamentMatches)
      .where(inArray(tournamentMatches.tournamentId, tournamentIds))
      .orderBy(asc(tournamentMatches.startTime));
  }

  /**
   * Получить матчи по корту
   * @param courtId ID корта
   * @param limit Лимит записей
   * @returns Массив матчей
   */
  async getByCourt(courtId: string, limit?: number): Promise<TournamentMatch[]> {
    const baseQuery = this.db
      .select()
      .from(tournamentMatches)
      .where(eq(tournamentMatches.courtId, courtId))
      .orderBy(asc(tournamentMatches.startTime));

    if (limit) {
      return await baseQuery.limit(limit);
    }

    return await baseQuery;
  }

  /**
   * Получить матчи по статусу
   * @param status Статус матча
   * @param tournamentId ID турнира (опционально)
   * @param limit Лимит записей
   * @returns Массив матчей
   */
  async getByStatus(status: "upcoming" | "registration_open" | "in_progress" | "completed" | "cancelled", tournamentId?: string, limit?: number): Promise<TournamentMatch[]> {
    const conditions = [eq(tournamentMatches.status, status)];
    if (tournamentId) {
      conditions.push(eq(tournamentMatches.tournamentId, tournamentId));
    }

    const baseQuery = this.db
      .select()
      .from(tournamentMatches)
      .where(and(...conditions))
      .orderBy(asc(tournamentMatches.startTime));

    if (limit) {
      return await baseQuery.limit(limit);
    }

    return await baseQuery;
  }

  /**
   * Получить матчи по раунду
   * @param round Раунд
   * @param tournamentId ID турнира (опционально)
   * @returns Массив матчей
   */
  async getByRound(round: string, tournamentId?: string): Promise<TournamentMatch[]> {
    const conditions = [eq(tournamentMatches.round, round)];
    if (tournamentId) {
      conditions.push(eq(tournamentMatches.tournamentId, tournamentId));
    }

    return await this.db
      .select()
      .from(tournamentMatches)
      .where(and(...conditions))
      .orderBy(asc(tournamentMatches.matchNumber));
  }

  /**
   * Получить матчи по диапазону времени
   * @param startTime Начальное время
   * @param endTime Конечное время
   * @param tournamentId ID турнира (опционально)
   * @returns Массив матчей
   */
  async getByTimeRange(startTime: Date, endTime: Date, tournamentId?: string): Promise<TournamentMatch[]> {
    const conditions = [
      gte(tournamentMatches.startTime, startTime),
      lte(tournamentMatches.endTime, endTime)
    ];
    if (tournamentId) {
      conditions.push(eq(tournamentMatches.tournamentId, tournamentId));
    }

    return await this.db
      .select()
      .from(tournamentMatches)
      .where(and(...conditions))
      .orderBy(asc(tournamentMatches.startTime));
  }

  /**
   * Получить матчи команды
   * @param teamId ID команды
   * @param tournamentId ID турнира (опционально)
   * @returns Массив матчей
   */
  async getByTeam(teamId: string, tournamentId?: string): Promise<TournamentMatch[]> {
    const conditions = [
      or(
        eq(tournamentMatches.winnerTeamId, teamId),
        eq(tournamentMatches.loserTeamId, teamId)
      )
    ];
    if (tournamentId) {
      conditions.push(eq(tournamentMatches.tournamentId, tournamentId));
    }

    return await this.db
      .select()
      .from(tournamentMatches)
      .where(and(...conditions))
      .orderBy(asc(tournamentMatches.startTime));
  }

  /**
   * Получить матчи игрока (в массивах winnerPlayerIds/loserPlayerIds)
   * @param playerId ID игрока
   * @param tournamentId ID турнира (опционально)
   * @returns Массив матчей
   */
  async getByPlayer(playerId: string, tournamentId?: string): Promise<TournamentMatch[]> {
    const conditions = [
      or(
        sql`${playerId} = ANY(${tournamentMatches.winnerPlayerIds})`,
        sql`${playerId} = ANY(${tournamentMatches.loserPlayerIds})`
      )
    ];
    if (tournamentId) {
      conditions.push(eq(tournamentMatches.tournamentId, tournamentId));
    }

    return await this.db
      .select()
      .from(tournamentMatches)
      .where(and(...conditions))
      .orderBy(asc(tournamentMatches.startTime));
  }

  /**
   * Поиск матчей по раунду (частичное совпадение)
   * @param searchTerm Поисковый термин
   * @param tournamentId ID турнира (опционально)
   * @returns Массив матчей
   */
  async searchByRound(searchTerm: string, tournamentId?: string): Promise<TournamentMatch[]> {
    const conditions = [like(tournamentMatches.round, `%${searchTerm}%`)];
    if (tournamentId) {
      conditions.push(eq(tournamentMatches.tournamentId, tournamentId));
    }

    return await this.db
      .select()
      .from(tournamentMatches)
      .where(and(...conditions))
      .orderBy(asc(tournamentMatches.startTime));
  }

  /**
   * Получить завершенные матчи
   * @param tournamentId ID турнира (опционально)
   * @param limit Лимит записей
   * @returns Массив матчей
   */
  async getCompletedMatches(tournamentId?: string, limit?: number): Promise<TournamentMatch[]> {
    return await this.getByStatus("completed", tournamentId, limit);
  }

  /**
   * Получить предстоящие матчи
   * @param tournamentId ID турнира (опционально)
   * @param limit Лимит записей
   * @returns Массив матчей
   */
  async getUpcomingMatches(tournamentId?: string, limit?: number): Promise<TournamentMatch[]> {
    return await this.getByStatus("upcoming", tournamentId, limit);
  }

  /**
   * Получить матчи в процессе
   * @param tournamentId ID турнира (опционально)
   * @param limit Лимит записей
   * @returns Массив матчей
   */
  async getInProgressMatches(tournamentId?: string, limit?: number): Promise<TournamentMatch[]> {
    return await this.getByStatus("in_progress", tournamentId, limit);
  }

  /**
   * Получить матчи без назначенного корта
   * @param tournamentId ID турнира (опционально)
   * @returns Массив матчей
   */
  async getMatchesWithoutCourt(tournamentId?: string): Promise<TournamentMatch[]> {
    const conditions = [isNull(tournamentMatches.courtId)];
    if (tournamentId) {
      conditions.push(eq(tournamentMatches.tournamentId, tournamentId));
    }

    return await this.db
      .select()
      .from(tournamentMatches)
      .where(and(...conditions))
      .orderBy(asc(tournamentMatches.startTime));
  }

  /**
   * Получить матчи с назначенным кортом
   * @param tournamentId ID турнира (опционально)
   * @returns Массив матчей
   */
  async getMatchesWithCourt(tournamentId?: string): Promise<TournamentMatch[]> {
    const conditions = [isNotNull(tournamentMatches.courtId)];
    if (tournamentId) {
      conditions.push(eq(tournamentMatches.tournamentId, tournamentId));
    }

    return await this.db
      .select()
      .from(tournamentMatches)
      .where(and(...conditions))
      .orderBy(asc(tournamentMatches.startTime));
  }

  /**
   * Обновить матч
   * @param id ID матча
   * @param data Данные для обновления
   * @returns Обновленный матч или null
   */
  async update(id: string, data: UpdateTournamentMatch): Promise<TournamentMatch | null> {
    const [match] = await this.db
      .update(tournamentMatches)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(tournamentMatches.id, id))
      .returning();
    return match || null;
  }

  /**
   * Обновить статус матча
   * @param id ID матча
   * @param status Новый статус
   * @returns Обновленный матч или null
   */
  async updateStatus(id: string, status: "upcoming" | "registration_open" | "in_progress" | "completed" | "cancelled"): Promise<TournamentMatch | null> {
    return await this.update(id, { status });
  }

  /**
   * Обновить корт матча
   * @param id ID матча
   * @param courtId ID корта (или null для удаления)
   * @returns Обновленный матч или null
   */
  async updateCourt(id: string, courtId: string | null): Promise<TournamentMatch | null> {
    return await this.update(id, { courtId });
  }

  /**
   * Обновить счет матча
   * @param id ID матча
   * @param score Счет
   * @returns Обновленный матч или null
   */
  async updateScore(id: string, score: string): Promise<TournamentMatch | null> {
    return await this.update(id, { score });
  }

  /**
   * Установить результат матча (команды)
   * @param id ID матча
   * @param winnerTeamId ID команды-победителя
   * @param loserTeamId ID команды-проигравшей
   * @param score Счет (опционально)
   * @returns Обновленный матч или null
   */
  async setTeamResult(id: string, winnerTeamId: string, loserTeamId: string, score?: string): Promise<TournamentMatch | null> {
    const updateData: UpdateTournamentMatch = {
      winnerTeamId,
      loserTeamId,
      status: "completed",
      winnerPlayerIds: null,
      loserPlayerIds: null,
    };
    if (score) {
      updateData.score = score;
    }
    return await this.update(id, updateData);
  }

  /**
   * Установить результат матча (игроки)
   * @param id ID матча
   * @param winnerPlayerIds Массив ID игроков-победителей
   * @param loserPlayerIds Массив ID игроков-проигравших
   * @param score Счет (опционально)
   * @returns Обновленный матч или null
   */
  async setPlayerResult(id: string, winnerPlayerIds: string[], loserPlayerIds: string[], score?: string): Promise<TournamentMatch | null> {
    const updateData: UpdateTournamentMatch = {
      winnerPlayerIds,
      loserPlayerIds,
      status: "completed",
      winnerTeamId: null,
      loserTeamId: null,
    };
    if (score) {
      updateData.score = score;
    }
    return await this.update(id, updateData);
  }

  /**
   * Удалить матч
   * @param id ID матча
   * @returns true если удален, false если не найден
   */
  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .delete(tournamentMatches)
      .where(eq(tournamentMatches.id, id));
    return result.rowCount > 0;
  }

  /**
   * Удалить матч по турниру и номеру матча
   * @param tournamentId ID турнира
   * @param matchNumber Номер матча
   * @returns true если удален, false если не найден
   */
  async deleteByTournamentAndMatchNumber(tournamentId: string, matchNumber: number): Promise<boolean> {
    const result = await this.db
      .delete(tournamentMatches)
      .where(and(
        eq(tournamentMatches.tournamentId, tournamentId),
        eq(tournamentMatches.matchNumber, matchNumber)
      ));
    return result.rowCount > 0;
  }

  /**
   * Получить количество матчей
   * @param tournamentId ID турнира (опционально)
   * @returns Количество матчей
   */
  async getCount(tournamentId?: string): Promise<number> {
    const conditions = [];
    if (tournamentId) {
      conditions.push(eq(tournamentMatches.tournamentId, tournamentId));
    }

    const [result] = await this.db
      .select({ count: count() })
      .from(tournamentMatches)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return result.count;
  }

  /**
   * Получить все матчи с пагинацией
   * @param limit Лимит записей
   * @param offset Смещение
   * @returns Массив матчей
   */
  async getAll(limit?: number, offset?: number): Promise<TournamentMatch[]> {
    const baseQuery = this.db
      .select()
      .from(tournamentMatches)
      .orderBy(desc(tournamentMatches.createdAt));

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
   * Получить статистику по матчам
   * @param tournamentId ID турнира (опционально)
   * @returns Статистика матчей
   */
  async getStats(tournamentId?: string): Promise<{
    totalMatches: number;
    completedMatches: number;
    upcomingMatches: number;
    inProgressMatches: number;
    cancelledMatches: number;
    averageMatchDuration: number;
    averageMatchesPerTournament: number;
  }> {
    const conditions = [];
    if (tournamentId) {
      conditions.push(eq(tournamentMatches.tournamentId, tournamentId));
    }

    const [stats] = await this.db
      .select({
        totalMatches: count(),
        completedMatches: sql<number>`count(*) filter (where status = 'completed')::int`,
        upcomingMatches: sql<number>`count(*) filter (where status = 'upcoming')::int`,
        inProgressMatches: sql<number>`count(*) filter (where status = 'in_progress')::int`,
        cancelledMatches: sql<number>`count(*) filter (where status = 'cancelled')::int`,
        averageMatchDuration: sql<number>`
          coalesce(
            avg(extract(epoch from (end_time - start_time)) / 60)::int,
            0
          )
        `,
      })
      .from(tournamentMatches)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    // Получаем среднее количество матчей на турнир
    let averageMatchesPerTournament = 0;
    if (!tournamentId) {
      const [tournamentStats] = await this.db
        .select({
          tournamentCount: sql<number>`count(distinct tournament_id)::int`,
          totalMatches: count(),
        })
        .from(tournamentMatches);

      if (tournamentStats.tournamentCount > 0) {
        averageMatchesPerTournament = Math.round(tournamentStats.totalMatches / tournamentStats.tournamentCount * 100) / 100;
      }
    } else {
      averageMatchesPerTournament = stats.totalMatches;
    }

    return {
      ...stats,
      averageMatchesPerTournament,
    };
  }

  /**
   * Получить матчи с детальной информацией
   * @param tournamentId ID турнира (опционально)
   * @param limit Лимит записей
   * @returns Массив матчей с детальной информацией
   */
  async getWithDetails(tournamentId?: string, limit?: number): Promise<Array<TournamentMatch & {
    tournament: { name: string; startDate: Date; endDate: Date; status: string };
    court?: { name: string; courtType: string } | null;
    winnerTeam?: {
      name: string;
      player1: { firstName: string; lastName: string };
      player2?: { firstName: string | null; lastName: string | null } | null;
    } | null;
    loserTeam?: {
      name: string;
      player1: { firstName: string; lastName: string };
      player2?: { firstName: string | null; lastName: string | null } | null;
    } | null;
  }>> {
    const conditions = [];
    if (tournamentId) {
      conditions.push(eq(tournamentMatches.tournamentId, tournamentId));
    }

    const baseQuery = this.db
      .select()
      .from(tournamentMatches)
      .innerJoin(schema.tournaments, eq(tournamentMatches.tournamentId, schema.tournaments.id))
      .leftJoin(schema.courts, eq(tournamentMatches.courtId, schema.courts.id))
      .leftJoin(schema.tournamentTeams, eq(tournamentMatches.winnerTeamId, schema.tournamentTeams.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(asc(tournamentMatches.startTime));

    const query = limit ? baseQuery.limit(limit) : baseQuery;
    const results = await query;

    // Простое приведение типов для возврата
    return results.map(row => ({
      ...row.tournament_match,
      tournament: {
        name: row.tournament.name,
        startDate: row.tournament.startDate,
        endDate: row.tournament.endDate,
        status: row.tournament.status,
      },
      court: row.court ? {
        name: row.court.name,
        courtType: row.court.courtType,
      } : null,
      winnerTeam: row.tournament_team ? {
        name: row.tournament_team.name,
        player1: { firstName: "", lastName: "" }, // Заполним позже через отдельные запросы
        player2: null,
      } : null,
      loserTeam: null, // Заполним позже через отдельные запросы
    })) as any;
  }

  /**
   * Проверить, занят ли номер матча в турнире
   * @param tournamentId ID турнира
   * @param matchNumber Номер матча
   * @param excludeId ID матча для исключения (для обновления)
   * @returns true если номер занят, false если свободен
   */
  async isMatchNumberTaken(tournamentId: string, matchNumber: number, excludeId?: string): Promise<boolean> {
    const conditions = [
      eq(tournamentMatches.tournamentId, tournamentId),
      eq(tournamentMatches.matchNumber, matchNumber)
    ];
    if (excludeId) {
      conditions.push(sql`${tournamentMatches.id} != ${excludeId}`);
    }

    const [result] = await this.db
      .select({ count: count() })
      .from(tournamentMatches)
      .where(and(...conditions));

    return result.count > 0;
  }

  /**
   * Получить следующий доступный номер матча для турнира
   * @param tournamentId ID турнира
   * @returns Следующий доступный номер матча
   */
  async getNextMatchNumber(tournamentId: string): Promise<number> {
    const [result] = await this.db
      .select({ maxNumber: sql<number>`coalesce(max(match_number), 0)` })
      .from(tournamentMatches)
      .where(eq(tournamentMatches.tournamentId, tournamentId));

    return result.maxNumber + 1;
  }

  /**
   * Удалить все матчи турнира
   * @param tournamentId ID турнира
   * @returns Количество удаленных матчей
   */
  async deleteAllByTournament(tournamentId: string): Promise<number> {
    const result = await this.db
      .delete(tournamentMatches)
      .where(eq(tournamentMatches.tournamentId, tournamentId));
    return result.rowCount;
  }

  /**
   * Удалить все матчи команды
   * @param teamId ID команды
   * @returns Количество удаленных матчей
   */
  async deleteAllByTeam(teamId: string): Promise<number> {
    const result = await this.db
      .delete(tournamentMatches)
      .where(or(
        eq(tournamentMatches.winnerTeamId, teamId),
        eq(tournamentMatches.loserTeamId, teamId)
      ));
    return result.rowCount;
  }

  /**
   * Получить матчи, сгруппированные по турнирам
   * @param teamIds Массив ID команд для фильтрации (опционально)
   * @returns Массив групп матчей по турнирам
   */
  async getGroupedByTournament(teamIds?: string[]): Promise<Array<{
    tournamentId: string;
    tournamentName: string;
    matchesCount: number;
    completedMatchesCount: number;
    upcomingMatchesCount: number;
    inProgressMatchesCount: number;
  }>> {
    const conditions = [];
    if (teamIds && teamIds.length > 0) {
      conditions.push(
        or(
          inArray(tournamentMatches.winnerTeamId, teamIds),
          inArray(tournamentMatches.loserTeamId, teamIds)
        )
      );
    }

    return await this.db
      .select({
        tournamentId: tournamentMatches.tournamentId,
        tournamentName: schema.tournaments.name,
        matchesCount: sql<number>`count(*)::int`,
        completedMatchesCount: sql<number>`count(*) filter (where ${tournamentMatches.status} = 'completed')::int`,
        upcomingMatchesCount: sql<number>`count(*) filter (where ${tournamentMatches.status} = 'upcoming')::int`,
        inProgressMatchesCount: sql<number>`count(*) filter (where ${tournamentMatches.status} = 'in_progress')::int`,
      })
      .from(tournamentMatches)
      .innerJoin(schema.tournaments, eq(tournamentMatches.tournamentId, schema.tournaments.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .groupBy(tournamentMatches.tournamentId, schema.tournaments.name)
      .orderBy(desc(sql`count(*)`));
  }

  /**
   * Получить матчи, сгруппированные по раундам
   * @param tournamentId ID турнира (опционально)
   * @returns Массив групп матчей по раундам
   */
  async getGroupedByRound(tournamentId?: string): Promise<Array<{
    round: string;
    matchesCount: number;
    completedMatchesCount: number;
    upcomingMatchesCount: number;
  }>> {
    const conditions = [];
    if (tournamentId) {
      conditions.push(eq(tournamentMatches.tournamentId, tournamentId));
    }

    return await this.db
      .select({
        round: tournamentMatches.round,
        matchesCount: sql<number>`count(*)::int`,
        completedMatchesCount: sql<number>`count(*) filter (where ${tournamentMatches.status} = 'completed')::int`,
        upcomingMatchesCount: sql<number>`count(*) filter (where ${tournamentMatches.status} = 'upcoming')::int`,
      })
      .from(tournamentMatches)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .groupBy(tournamentMatches.round)
      .orderBy(asc(tournamentMatches.round));
  }

  /**
   * Получить недавние матчи
   * @param days Количество дней назад
   * @param tournamentId ID турнира (опционально)
   * @returns Массив недавних матчей
   */
  async getRecentMatches(days: number, tournamentId?: string): Promise<TournamentMatch[]> {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    const conditions = [gte(tournamentMatches.createdAt, dateThreshold)];
    if (tournamentId) {
      conditions.push(eq(tournamentMatches.tournamentId, tournamentId));
    }

    return await this.db
      .select()
      .from(tournamentMatches)
      .where(and(...conditions))
      .orderBy(desc(tournamentMatches.createdAt));
  }

  /**
   * Получить матчи по дням
   * @param tournamentId ID турнира (опционально)
   * @returns Массив матчей по дням
   */
  async getMatchesByDays(tournamentId?: string): Promise<Array<{
    date: string;
    matchesCount: number;
    completedMatchesCount: number;
    upcomingMatchesCount: number;
  }>> {
    const conditions = [];
    if (tournamentId) {
      conditions.push(eq(tournamentMatches.tournamentId, tournamentId));
    }

    return await this.db
      .select({
        date: sql<string>`date(${tournamentMatches.startTime})`,
        matchesCount: sql<number>`count(*)::int`,
        completedMatchesCount: sql<number>`count(*) filter (where ${tournamentMatches.status} = 'completed')::int`,
        upcomingMatchesCount: sql<number>`count(*) filter (where ${tournamentMatches.status} = 'upcoming')::int`,
      })
      .from(tournamentMatches)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .groupBy(sql`date(${tournamentMatches.startTime})`)
      .orderBy(desc(sql`date(${tournamentMatches.startTime})`));
  }

  /**
   * Получить конфликтующие матчи по времени и корту
   * @param courtId ID корта
   * @param startTime Время начала
   * @param endTime Время окончания
   * @param excludeId ID матча для исключения (опционально)
   * @returns Массив конфликтующих матчей
   */
  async getConflictingMatches(courtId: string, startTime: Date, endTime: Date, excludeId?: string): Promise<TournamentMatch[]> {
    const conditions = [
      eq(tournamentMatches.courtId, courtId),
      or(
        and(
          lte(tournamentMatches.startTime, startTime),
          gte(tournamentMatches.endTime, startTime)
        ),
        and(
          lte(tournamentMatches.startTime, endTime),
          gte(tournamentMatches.endTime, endTime)
        ),
        and(
          gte(tournamentMatches.startTime, startTime),
          lte(tournamentMatches.endTime, endTime)
        )
      )
    ];

    if (excludeId) {
      conditions.push(sql`${tournamentMatches.id} != ${excludeId}`);
    }

    return await this.db
      .select()
      .from(tournamentMatches)
      .where(and(...conditions))
      .orderBy(asc(tournamentMatches.startTime));
  }

  /**
   * Получить матчи команды против другой команды
   * @param team1Id ID первой команды
   * @param team2Id ID второй команды
   * @param tournamentId ID турнира (опционально)
   * @returns Массив матчей между командами
   */
  async getMatchesBetweenTeams(team1Id: string, team2Id: string, tournamentId?: string): Promise<TournamentMatch[]> {
    const conditions = [
      or(
        and(
          eq(tournamentMatches.winnerTeamId, team1Id),
          eq(tournamentMatches.loserTeamId, team2Id)
        ),
        and(
          eq(tournamentMatches.winnerTeamId, team2Id),
          eq(tournamentMatches.loserTeamId, team1Id)
        )
      )
    ];

    if (tournamentId) {
      conditions.push(eq(tournamentMatches.tournamentId, tournamentId));
    }

    return await this.db
      .select()
      .from(tournamentMatches)
      .where(and(...conditions))
      .orderBy(asc(tournamentMatches.startTime));
  }
}
