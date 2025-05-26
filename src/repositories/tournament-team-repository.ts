/**
 * Репозиторий для работы с моделью TournamentTeam
 * Содержит методы CRUD для работы с командами турниров
 */

import { eq, and, desc, asc, sql, inArray, count, like, or } from "drizzle-orm";


import { TournamentTeam, NewTournamentTeam, tournamentTeams } from "../db/schema";
import * as schema from "../db/schema";
import { DatabaseType } from "./types";

export class TournamentTeamRepository {
  constructor(private db: DatabaseType) {}

  /**
   * Создает новую команду турнира
   * @param teamData Данные команды турнира
   * @returns Созданная команда турнира
   */
  async create(teamData: NewTournamentTeam): Promise<TournamentTeam> {
    const [team] = await this.db
      .insert(tournamentTeams)
      .values(teamData)
      .returning();
    return team;
  }

  /**
   * Получает команду турнира по ID
   * @param id ID команды турнира
   * @returns Команда турнира или null, если не найдена
   */
  async getById(id: string): Promise<TournamentTeam | null> {
    const [team] = await this.db
      .select()
      .from(tournamentTeams)
      .where(eq(tournamentTeams.id, id));
    return team || null;
  }

  /**
   * Получает команду турнира по турниру и названию
   * @param tournamentId ID турнира
   * @param name Название команды
   * @returns Команда турнира или null, если не найдена
   */
  async getByTournamentAndName(tournamentId: string, name: string): Promise<TournamentTeam | null> {
    const [team] = await this.db
      .select()
      .from(tournamentTeams)
      .where(and(
        eq(tournamentTeams.tournamentId, tournamentId),
        eq(tournamentTeams.name, name)
      ));
    return team || null;
  }

  /**
   * Получает все команды турнира
   * @param tournamentId ID турнира
   * @returns Массив команд турнира
   */
  async getByTournament(tournamentId: string): Promise<TournamentTeam[]> {
    return await this.db
      .select()
      .from(tournamentTeams)
      .where(eq(tournamentTeams.tournamentId, tournamentId))
      .orderBy(asc(tournamentTeams.name));
  }

  /**
   * Получает команды по нескольким турнирам
   * @param tournamentIds Массив ID турниров
   * @returns Массив команд турниров
   */
  async getByTournaments(tournamentIds: string[]): Promise<TournamentTeam[]> {
    if (tournamentIds.length === 0) return [];

    return await this.db
      .select()
      .from(tournamentTeams)
      .where(inArray(tournamentTeams.tournamentId, tournamentIds))
      .orderBy(asc(tournamentTeams.name));
  }

  /**
   * Получает команды, в которых участвует пользователь
   * @param userId ID пользователя
   * @param tournamentId ID турнира (опционально)
   * @returns Массив команд
   */
  async getByPlayer(userId: string, tournamentId?: string): Promise<TournamentTeam[]> {
    const conditions = [
      sql`(${tournamentTeams.player1Id} = ${userId} OR ${tournamentTeams.player2Id} = ${userId})`
    ];

    if (tournamentId) {
      conditions.push(eq(tournamentTeams.tournamentId, tournamentId));
    }

    return await this.db
      .select()
      .from(tournamentTeams)
      .where(and(...conditions))
      .orderBy(desc(tournamentTeams.createdAt));
  }

  /**
   * Получает команды по нескольким игрокам
   * @param userIds Массив ID пользователей
   * @param tournamentId ID турнира (опционально)
   * @returns Массив команд
   */
  async getByPlayers(userIds: string[], tournamentId?: string): Promise<TournamentTeam[]> {
    if (userIds.length === 0) return [];

    const conditions = [
      or(
        inArray(tournamentTeams.player1Id, userIds),
        inArray(tournamentTeams.player2Id, userIds)
      )
    ];

    if (tournamentId) {
      conditions.push(eq(tournamentTeams.tournamentId, tournamentId));
    }

    return await this.db
      .select()
      .from(tournamentTeams)
      .where(and(...conditions))
      .orderBy(desc(tournamentTeams.createdAt));
  }

  /**
   * Поиск команд по названию
   * @param searchTerm Поисковый термин
   * @param tournamentId ID турнира (опционально)
   * @returns Массив команд
   */
  async searchByName(searchTerm: string, tournamentId?: string): Promise<TournamentTeam[]> {
    const conditions = [like(tournamentTeams.name, `%${searchTerm}%`)];

    if (tournamentId) {
      conditions.push(eq(tournamentTeams.tournamentId, tournamentId));
    }

    return await this.db
      .select()
      .from(tournamentTeams)
      .where(and(...conditions))
      .orderBy(asc(tournamentTeams.name));
  }

  /**
   * Получает одиночные команды (только с player1)
   * @param tournamentId ID турнира (опционально)
   * @returns Массив одиночных команд
   */
  async getSoloTeams(tournamentId?: string): Promise<TournamentTeam[]> {
    const conditions = [sql`${tournamentTeams.player2Id} IS NULL`];

    if (tournamentId) {
      conditions.push(eq(tournamentTeams.tournamentId, tournamentId));
    }

    return await this.db
      .select()
      .from(tournamentTeams)
      .where(and(...conditions))
      .orderBy(asc(tournamentTeams.name));
  }

  /**
   * Получает парные команды (с player1 и player2)
   * @param tournamentId ID турнира (опционально)
   * @returns Массив парных команд
   */
  async getDoubleTeams(tournamentId?: string): Promise<TournamentTeam[]> {
    const conditions = [sql`${tournamentTeams.player2Id} IS NOT NULL`];

    if (tournamentId) {
      conditions.push(eq(tournamentTeams.tournamentId, tournamentId));
    }

    return await this.db
      .select()
      .from(tournamentTeams)
      .where(and(...conditions))
      .orderBy(asc(tournamentTeams.name));
  }

  /**
   * Обновляет данные команды турнира
   * @param id ID команды турнира
   * @param updateData Данные для обновления
   * @returns Обновленная команда турнира или null, если не найдена
   */
  async update(
    id: string,
    updateData: Partial<Omit<NewTournamentTeam, "tournamentId">>
  ): Promise<TournamentTeam | null> {
    const [updatedTeam] = await this.db
      .update(tournamentTeams)
      .set(updateData)
      .where(eq(tournamentTeams.id, id))
      .returning();
    return updatedTeam || null;
  }

  /**
   * Обновляет название команды
   * @param id ID команды турнира
   * @param name Новое название
   * @returns Обновленная команда турнира или null, если не найдена
   */
  async updateName(id: string, name: string): Promise<TournamentTeam | null> {
    const [updatedTeam] = await this.db
      .update(tournamentTeams)
      .set({ name })
      .where(eq(tournamentTeams.id, id))
      .returning();
    return updatedTeam || null;
  }

  /**
   * Обновляет второго игрока команды
   * @param id ID команды турнира
   * @param player2Id ID второго игрока (или null для удаления)
   * @returns Обновленная команда турнира или null, если не найдена
   */
  async updatePlayer2(id: string, player2Id: string | null): Promise<TournamentTeam | null> {
    const [updatedTeam] = await this.db
      .update(tournamentTeams)
      .set({ player2Id })
      .where(eq(tournamentTeams.id, id))
      .returning();
    return updatedTeam || null;
  }

  /**
   * Удаляет команду турнира
   * @param id ID команды турнира
   * @returns true, если команда была удалена, false если не найдена
   */
  async delete(id: string): Promise<boolean> {
    const [deletedTeam] = await this.db
      .delete(tournamentTeams)
      .where(eq(tournamentTeams.id, id))
      .returning();
    return !!deletedTeam;
  }

  /**
   * Удаляет команду по турниру и названию
   * @param tournamentId ID турнира
   * @param name Название команды
   * @returns true, если команда была удалена, false если не найдена
   */
  async deleteByTournamentAndName(tournamentId: string, name: string): Promise<boolean> {
    const [deletedTeam] = await this.db
      .delete(tournamentTeams)
      .where(and(
        eq(tournamentTeams.tournamentId, tournamentId),
        eq(tournamentTeams.name, name)
      ))
      .returning();
    return !!deletedTeam;
  }

  /**
   * Получает количество команд
   * @param tournamentId ID турнира (опционально)
   * @returns Количество команд
   */
  async getCount(tournamentId?: string): Promise<number> {
    const conditions = [];

    if (tournamentId) {
      conditions.push(eq(tournamentTeams.tournamentId, tournamentId));
    }

    const [result] = await this.db
      .select({ count: count() })
      .from(tournamentTeams)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return result.count;
  }

  /**
   * Получает все команды с пагинацией
   * @param limit Лимит записей (опционально)
   * @param offset Смещение (опционально)
   * @returns Массив команд турниров
   */
  async getAll(limit?: number, offset?: number): Promise<TournamentTeam[]> {
    const baseQuery = this.db
      .select()
      .from(tournamentTeams)
      .orderBy(desc(tournamentTeams.createdAt));

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
   * Получает статистику по командам турниров
   * @param tournamentId ID турнира (опционально)
   * @returns Объект со статистикой
   */
  async getStats(tournamentId?: string): Promise<{
    totalTeams: number;
    soloTeams: number;
    doubleTeams: number;
    averageTeamsPerTournament: number;
  }> {
    const conditions = [];
    if (tournamentId) {
      conditions.push(eq(tournamentTeams.tournamentId, tournamentId));
    }

    const allTeams = await this.db
      .select()
      .from(tournamentTeams)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const totalTeams = allTeams.length;
    const soloTeams = allTeams.filter(t => t.player2Id === null).length;
    const doubleTeams = allTeams.filter(t => t.player2Id !== null).length;

    // Подсчет среднего количества команд на турнир
    let averageTeamsPerTournament = 0;
    if (!tournamentId && totalTeams > 0) {
      const tournamentCounts = await this.db
        .select({
          tournamentId: tournamentTeams.tournamentId,
          teamCount: sql<number>`count(*)::int`,
        })
        .from(tournamentTeams)
        .groupBy(tournamentTeams.tournamentId);

      const totalTournaments = tournamentCounts.length;
      if (totalTournaments > 0) {
        const totalTeamsAcrossTournaments = tournamentCounts.reduce((sum, t) => sum + t.teamCount, 0);
        averageTeamsPerTournament = totalTeamsAcrossTournaments / totalTournaments;
      }
    } else if (tournamentId) {
      averageTeamsPerTournament = totalTeams;
    }

    return {
      totalTeams,
      soloTeams,
      doubleTeams,
      averageTeamsPerTournament,
    };
  }

  /**
   * Получает команды с детальной информацией о игроках и турнире
   * @param tournamentId ID турнира (опционально)
   * @param limit Лимит записей (опционально)
   * @returns Массив команд с детальной информацией
   */
  async getWithDetails(tournamentId?: string, limit?: number): Promise<Array<TournamentTeam & {
    player1: { firstName: string; lastName: string; email: string; currentRating: number };
    player2?: { firstName: string | null; lastName: string | null; email: string | null; currentRating: number | null } | null;
    tournament: { name: string; startDate: Date; endDate: Date; status: string };
  }>> {
    const conditions = [];
    if (tournamentId) {
      conditions.push(eq(tournamentTeams.tournamentId, tournamentId));
    }

    const baseQuery = this.db
      .select({
        id: tournamentTeams.id,
        tournamentId: tournamentTeams.tournamentId,
        name: tournamentTeams.name,
        player1Id: tournamentTeams.player1Id,
        player2Id: tournamentTeams.player2Id,
        createdAt: tournamentTeams.createdAt,
        updatedAt: tournamentTeams.updatedAt,
        player1: {
          firstName: schema.users.firstName,
          lastName: schema.users.lastName,
          email: schema.users.email,
          currentRating: schema.users.currentRating,
        },
        player2: {
          firstName: sql<string | null>`player2_user.first_name`,
          lastName: sql<string | null>`player2_user.last_name`,
          email: sql<string | null>`player2_user.email`,
          currentRating: sql<number | null>`player2_user.current_rating`,
        },
        tournament: {
          name: schema.tournaments.name,
          startDate: schema.tournaments.startDate,
          endDate: schema.tournaments.endDate,
          status: schema.tournaments.status,
        },
      })
      .from(tournamentTeams)
      .innerJoin(schema.users, eq(tournamentTeams.player1Id, schema.users.id))
      .leftJoin(
        sql`"user" as player2_user`,
        eq(tournamentTeams.player2Id, sql`player2_user.id`)
      )
      .innerJoin(schema.tournaments, eq(tournamentTeams.tournamentId, schema.tournaments.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(tournamentTeams.createdAt));

    if (limit) {
      return await baseQuery.limit(limit);
    } else {
      return await baseQuery;
    }
  }

  /**
   * Проверяет, существует ли команда с таким названием в турнире
   * @param tournamentId ID турнира
   * @param name Название команды
   * @param excludeId ID команды для исключения (при обновлении)
   * @returns true, если команда существует
   */
  async isNameTaken(tournamentId: string, name: string, excludeId?: string): Promise<boolean> {
    const conditions = [
      eq(tournamentTeams.tournamentId, tournamentId),
      eq(tournamentTeams.name, name)
    ];

    if (excludeId) {
      conditions.push(sql`${tournamentTeams.id} != ${excludeId}`);
    }

    const [team] = await this.db
      .select({ id: tournamentTeams.id })
      .from(tournamentTeams)
      .where(and(...conditions))
      .limit(1);

    return !!team;
  }

  /**
   * Получает партнера игрока в команде
   * @param teamId ID команды
   * @param playerId ID игрока
   * @returns ID партнера или null
   */
  async getPartner(teamId: string, playerId: string): Promise<string | null> {
    const team = await this.getById(teamId);
    if (!team) return null;

    if (team.player1Id === playerId) {
      return team.player2Id;
    } else if (team.player2Id === playerId) {
      return team.player1Id;
    }

    return null;
  }

  /**
   * Проверяет, является ли пользователь членом команды
   * @param teamId ID команды
   * @param userId ID пользователя
   * @returns true, если пользователь является членом команды
   */
  async isPlayerInTeam(teamId: string, userId: string): Promise<boolean> {
    const team = await this.getById(teamId);
    if (!team) return false;

    return team.player1Id === userId || team.player2Id === userId;
  }

  /**
   * Удаляет все команды турнира
   * @param tournamentId ID турнира
   * @returns Количество удаленных команд
   */
  async deleteAllByTournament(tournamentId: string): Promise<number> {
    const deletedTeams = await this.db
      .delete(tournamentTeams)
      .where(eq(tournamentTeams.tournamentId, tournamentId))
      .returning();

    return deletedTeams.length;
  }

  /**
   * Удаляет все команды, в которых участвует пользователь
   * @param userId ID пользователя
   * @returns Количество удаленных команд
   */
  async deleteAllByPlayer(userId: string): Promise<number> {
    const deletedTeams = await this.db
      .delete(tournamentTeams)
      .where(sql`(${tournamentTeams.player1Id} = ${userId} OR ${tournamentTeams.player2Id} = ${userId})`)
      .returning();

    return deletedTeams.length;
  }

  /**
   * Получает команды, сгруппированные по турнирам
   * @param playerIds Массив ID игроков (опционально)
   * @returns Массив с командами по турнирам
   */
  async getGroupedByTournament(playerIds?: string[]): Promise<Array<{
    tournamentId: string;
    tournamentName: string;
    teamsCount: number;
    soloTeamsCount: number;
    doubleTeamsCount: number;
  }>> {
    const conditions = [];
    if (playerIds && playerIds.length > 0) {
      conditions.push(
        or(
          inArray(tournamentTeams.player1Id, playerIds),
          inArray(tournamentTeams.player2Id, playerIds)
        )
      );
    }

    const result = await this.db
      .select({
        tournamentId: tournamentTeams.tournamentId,
        tournamentName: schema.tournaments.name,
        teamsCount: sql<number>`count(*)::int`,
        soloTeamsCount: sql<number>`count(case when ${tournamentTeams.player2Id} is null then 1 end)::int`,
        doubleTeamsCount: sql<number>`count(case when ${tournamentTeams.player2Id} is not null then 1 end)::int`,
      })
      .from(tournamentTeams)
      .innerJoin(schema.tournaments, eq(tournamentTeams.tournamentId, schema.tournaments.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .groupBy(tournamentTeams.tournamentId, schema.tournaments.name)
      .orderBy(desc(sql`count(*)`));

    return result;
  }

  /**
   * Получает топ игроков по количеству команд
   * @param limit Лимит записей (по умолчанию 10)
   * @param tournamentId ID турнира (опционально)
   * @returns Массив с топ игроками
   */
  async getTopPlayers(limit: number = 10, tournamentId?: string): Promise<Array<{
    userId: string;
    firstName: string;
    lastName: string;
    teamsCount: number;
    soloTeamsCount: number;
    doubleTeamsCount: number;
    currentRating: number;
  }>> {
    const conditions = [];
    if (tournamentId) {
      conditions.push(eq(tournamentTeams.tournamentId, tournamentId));
    }

    // Получаем статистику для player1
    const player1Stats = await this.db
      .select({
        userId: tournamentTeams.player1Id,
        firstName: schema.users.firstName,
        lastName: schema.users.lastName,
        teamsCount: sql<number>`count(*)::int`,
        soloTeamsCount: sql<number>`count(case when ${tournamentTeams.player2Id} is null then 1 end)::int`,
        doubleTeamsCount: sql<number>`count(case when ${tournamentTeams.player2Id} is not null then 1 end)::int`,
        currentRating: schema.users.currentRating,
      })
      .from(tournamentTeams)
      .innerJoin(schema.users, eq(tournamentTeams.player1Id, schema.users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .groupBy(tournamentTeams.player1Id, schema.users.firstName, schema.users.lastName, schema.users.currentRating);

    // Получаем статистику для player2
    const player2Conditions = [sql`${tournamentTeams.player2Id} is not null`];
    if (conditions.length > 0) {
      player2Conditions.push(...conditions);
    }

    const player2Stats = await this.db
      .select({
        userId: tournamentTeams.player2Id,
        firstName: schema.users.firstName,
        lastName: schema.users.lastName,
        teamsCount: sql<number>`count(*)::int`,
        soloTeamsCount: sql<number>`0::int`, // player2 не может быть в одиночной команде
        doubleTeamsCount: sql<number>`count(*)::int`,
        currentRating: schema.users.currentRating,
      })
      .from(tournamentTeams)
      .innerJoin(schema.users, eq(tournamentTeams.player2Id, schema.users.id))
      .where(and(...player2Conditions))
      .groupBy(tournamentTeams.player2Id, schema.users.firstName, schema.users.lastName, schema.users.currentRating);

    // Объединяем статистику
    const playerStatsMap = new Map<string, {
      userId: string;
      firstName: string;
      lastName: string;
      teamsCount: number;
      soloTeamsCount: number;
      doubleTeamsCount: number;
      currentRating: number;
    }>();

    // Добавляем статистику player1
    for (const stat of player1Stats) {
      playerStatsMap.set(stat.userId, stat);
    }

    // Добавляем статистику player2
    for (const stat of player2Stats) {
      if (stat.userId) {
        const existing = playerStatsMap.get(stat.userId);
        if (existing) {
          existing.teamsCount += stat.teamsCount;
          existing.doubleTeamsCount += stat.doubleTeamsCount;
        } else {
          playerStatsMap.set(stat.userId, {
            userId: stat.userId,
            firstName: stat.firstName,
            lastName: stat.lastName,
            teamsCount: stat.teamsCount,
            soloTeamsCount: stat.soloTeamsCount,
            doubleTeamsCount: stat.doubleTeamsCount,
            currentRating: stat.currentRating,
          });
        }
      }
    }

    // Сортируем по количеству команд и возвращаем топ
    return Array.from(playerStatsMap.values())
      .sort((a, b) => b.teamsCount - a.teamsCount)
      .slice(0, limit);
  }

  /**
   * Получает команды, созданные в определенный период
   * @param days Количество дней (по умолчанию 30)
   * @param tournamentId ID турнира (опционально)
   * @returns Массив команд
   */
  async getRecentTeams(days: number = 30, tournamentId?: string): Promise<TournamentTeam[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const conditions = [sql`${tournamentTeams.createdAt} >= ${startDate}`];

    if (tournamentId) {
      conditions.push(eq(tournamentTeams.tournamentId, tournamentId));
    }

    return await this.db
      .select()
      .from(tournamentTeams)
      .where(and(...conditions))
      .orderBy(desc(tournamentTeams.createdAt));
  }

  /**
   * Получает команды, сгруппированные по дням создания
   * @param tournamentId ID турнира (опционально)
   * @param days Количество дней (по умолчанию 30)
   * @returns Массив с командами по дням
   */
  async getTeamsByDays(tournamentId?: string, days: number = 30): Promise<Array<{
    date: string;
    teamsCount: number;
  }>> {
    const conditions = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    conditions.push(sql`${tournamentTeams.createdAt} >= ${startDate}`);

    if (tournamentId) {
      conditions.push(eq(tournamentTeams.tournamentId, tournamentId));
    }

    const result = await this.db
      .select({
        date: sql<string>`date(${tournamentTeams.createdAt})`,
        teamsCount: sql<number>`count(*)::int`,
      })
      .from(tournamentTeams)
      .where(and(...conditions))
      .groupBy(sql`date(${tournamentTeams.createdAt})`)
      .orderBy(asc(sql`date(${tournamentTeams.createdAt})`));

    return result;
  }
}
