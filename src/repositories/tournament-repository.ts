/**
 * Репозиторий для работы с моделью Tournament
 * Содержит методы CRUD для работы с турнирами
 */

import { eq, and, desc, asc, sql, inArray, count, gte, lte, like } from "drizzle-orm";


import { Tournament, NewTournament, tournaments } from "../db/schema";
import * as schema from "../db/schema";
import { DatabaseType } from "./types";

export class TournamentRepository {
  constructor(private db: DatabaseType) {}

  /**
   * Создает новый турнир
   * @param tournamentData Данные турнира
   * @returns Созданный турнир
   */
  async create(tournamentData: NewTournament): Promise<Tournament> {
    const [tournament] = await this.db
      .insert(tournaments)
      .values(tournamentData)
      .returning();
    return tournament;
  }

  /**
   * Получает турнир по ID
   * @param id ID турнира
   * @returns Турнир или null, если не найден
   */
  async getById(id: string): Promise<Tournament | null> {
    const [tournament] = await this.db
      .select()
      .from(tournaments)
      .where(eq(tournaments.id, id));
    return tournament || null;
  }

  /**
   * Получает все турниры площадки
   * @param venueId ID площадки
   * @param status Статус турнира (опционально)
   * @returns Массив турниров
   */
  async getByVenue(
    venueId: string,
    status?: "upcoming" | "registration_open" | "in_progress" | "completed" | "cancelled"
  ): Promise<Tournament[]> {
    const conditions = [eq(tournaments.venueId, venueId)];

    if (status) {
      conditions.push(eq(tournaments.status, status));
    }

    return await this.db
      .select()
      .from(tournaments)
      .where(and(...conditions))
      .orderBy(desc(tournaments.startDate));
  }

  /**
   * Получает турниры по статусу
   * @param status Статус турнира
   * @returns Массив турниров
   */
  async getByStatus(status: "upcoming" | "registration_open" | "in_progress" | "completed" | "cancelled"): Promise<Tournament[]> {
    return await this.db
      .select()
      .from(tournaments)
      .where(eq(tournaments.status, status))
      .orderBy(desc(tournaments.startDate));
  }

  /**
   * Получает турниры по типу
   * @param tournamentType Тип турнира
   * @returns Массив турниров
   */
  async getByType(tournamentType: "singles_elimination" | "doubles_round_robin" | "other"): Promise<Tournament[]> {
    return await this.db
      .select()
      .from(tournaments)
      .where(eq(tournaments.tournamentType, tournamentType))
      .orderBy(desc(tournaments.startDate));
  }

  /**
   * Получает турниры по уровню навыков
   * @param skillLevel Уровень навыков
   * @returns Массив турниров
   */
  async getBySkillLevel(skillLevel: "beginner" | "intermediate" | "advanced" | "professional"): Promise<Tournament[]> {
    return await this.db
      .select()
      .from(tournaments)
      .where(eq(tournaments.skillLevelCategory, skillLevel))
      .orderBy(desc(tournaments.startDate));
  }

  /**
   * Получает турниры по нескольким площадкам
   * @param venueIds Массив ID площадок
   * @returns Массив турниров
   */
  async getByVenues(venueIds: string[]): Promise<Tournament[]> {
    if (venueIds.length === 0) return [];

    return await this.db
      .select()
      .from(tournaments)
      .where(inArray(tournaments.venueId, venueIds))
      .orderBy(desc(tournaments.startDate));
  }

  /**
   * Получает турниры по диапазону дат
   * @param startDate Начальная дата
   * @param endDate Конечная дата
   * @returns Массив турниров
   */
  async getByDateRange(startDate: Date, endDate: Date): Promise<Tournament[]> {
    return await this.db
      .select()
      .from(tournaments)
      .where(and(
        gte(tournaments.startDate, startDate),
        lte(tournaments.endDate, endDate)
      ))
      .orderBy(desc(tournaments.startDate));
  }

  /**
   * Получает турниры по диапазону регистрационного взноса
   * @param minFee Минимальный взнос
   * @param maxFee Максимальный взнос
   * @returns Массив турниров
   */
  async getByFeeRange(minFee: number, maxFee: number): Promise<Tournament[]> {
    return await this.db
      .select()
      .from(tournaments)
      .where(and(
        gte(tournaments.registrationFee, minFee.toString()),
        lte(tournaments.registrationFee, maxFee.toString())
      ))
      .orderBy(desc(tournaments.startDate));
  }

  /**
   * Поиск турниров по названию
   * @param searchTerm Поисковый запрос
   * @returns Массив турниров
   */
  async searchByName(searchTerm: string): Promise<Tournament[]> {
    return await this.db
      .select()
      .from(tournaments)
      .where(like(tournaments.name, `%${searchTerm}%`))
      .orderBy(desc(tournaments.startDate));
  }

  /**
   * Получает активные турниры (upcoming, registration_open, in_progress)
   * @param venueId ID площадки (опционально)
   * @returns Массив активных турниров
   */
  async getActiveTournaments(venueId?: string): Promise<Tournament[]> {
    const conditions = [
      sql`${tournaments.status} IN ('upcoming', 'registration_open', 'in_progress')`
    ];

    if (venueId) {
      conditions.push(eq(tournaments.venueId, venueId));
    }

    return await this.db
      .select()
      .from(tournaments)
      .where(and(...conditions))
      .orderBy(asc(tournaments.startDate));
  }

  /**
   * Получает завершенные турниры
   * @param venueId ID площадки (опционально)
   * @param limit Лимит записей (опционально)
   * @returns Массив завершенных турниров
   */
  async getCompletedTournaments(venueId?: string, limit?: number): Promise<Tournament[]> {
    const conditions = [eq(tournaments.status, "completed")];

    if (venueId) {
      conditions.push(eq(tournaments.venueId, venueId));
    }

    const baseQuery = this.db
      .select()
      .from(tournaments)
      .where(and(...conditions))
      .orderBy(desc(tournaments.endDate));

    if (limit) {
      return await baseQuery.limit(limit);
    } else {
      return await baseQuery;
    }
  }

  /**
   * Получает предстоящие турниры
   * @param venueId ID площадки (опционально)
   * @param limit Лимит записей (опционально)
   * @returns Массив предстоящих турниров
   */
  async getUpcomingTournaments(venueId?: string, limit?: number): Promise<Tournament[]> {
    const conditions = [
      sql`${tournaments.status} IN ('upcoming', 'registration_open')`
    ];

    if (venueId) {
      conditions.push(eq(tournaments.venueId, venueId));
    }

    const baseQuery = this.db
      .select()
      .from(tournaments)
      .where(and(...conditions))
      .orderBy(asc(tournaments.startDate));

    if (limit) {
      return await baseQuery.limit(limit);
    } else {
      return await baseQuery;
    }
  }

  /**
   * Обновляет данные турнира
   * @param id ID турнира
   * @param updateData Данные для обновления
   * @returns Обновленный турнир или null, если не найден
   */
  async update(
    id: string,
    updateData: Partial<Omit<NewTournament, "venueId">>
  ): Promise<Tournament | null> {
    const [updatedTournament] = await this.db
      .update(tournaments)
      .set(updateData)
      .where(eq(tournaments.id, id))
      .returning();
    return updatedTournament || null;
  }

  /**
   * Обновляет статус турнира
   * @param id ID турнира
   * @param status Новый статус
   * @returns Обновленный турнир или null, если не найден
   */
  async updateStatus(
    id: string,
    status: "upcoming" | "registration_open" | "in_progress" | "completed" | "cancelled"
  ): Promise<Tournament | null> {
    const [updatedTournament] = await this.db
      .update(tournaments)
      .set({ status })
      .where(eq(tournaments.id, id))
      .returning();
    return updatedTournament || null;
  }

  /**
   * Удаляет турнир
   * @param id ID турнира
   * @returns true, если турнир был удален, false если не найден
   */
  async delete(id: string): Promise<boolean> {
    const [deletedTournament] = await this.db
      .delete(tournaments)
      .where(eq(tournaments.id, id))
      .returning();
    return !!deletedTournament;
  }

  /**
   * Получает количество турниров
   * @param venueId ID площадки (опционально)
   * @param status Статус турнира (опционально)
   * @returns Количество турниров
   */
  async getCount(
    venueId?: string,
    status?: "upcoming" | "registration_open" | "in_progress" | "completed" | "cancelled"
  ): Promise<number> {
    const conditions = [];

    if (venueId) {
      conditions.push(eq(tournaments.venueId, venueId));
    }
    if (status) {
      conditions.push(eq(tournaments.status, status));
    }

    const [result] = await this.db
      .select({ count: count() })
      .from(tournaments)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return result.count;
  }

  /**
   * Получает все записи турниров с пагинацией
   * @param limit Лимит записей (опционально)
   * @param offset Смещение (опционально)
   * @returns Массив турниров
   */
  async getAll(limit?: number, offset?: number): Promise<Tournament[]> {
    const baseQuery = this.db
      .select()
      .from(tournaments)
      .orderBy(desc(tournaments.startDate));

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
   * Получает статистику по турнирам
   * @param venueId ID площадки (опционально)
   * @returns Объект со статистикой
   */
  async getStats(venueId?: string): Promise<{
    totalTournaments: number;
    upcomingTournaments: number;
    registrationOpenTournaments: number;
    inProgressTournaments: number;
    completedTournaments: number;
    cancelledTournaments: number;
    averageRegistrationFee: string;
    totalParticipantsCapacity: number;
  }> {
    const conditions = [];
    if (venueId) {
      conditions.push(eq(tournaments.venueId, venueId));
    }

    const allTournaments = await this.db
      .select()
      .from(tournaments)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const totalTournaments = allTournaments.length;
    const upcomingTournaments = allTournaments.filter(t => t.status === "upcoming").length;
    const registrationOpenTournaments = allTournaments.filter(t => t.status === "registration_open").length;
    const inProgressTournaments = allTournaments.filter(t => t.status === "in_progress").length;
    const completedTournaments = allTournaments.filter(t => t.status === "completed").length;
    const cancelledTournaments = allTournaments.filter(t => t.status === "cancelled").length;

    const fees = allTournaments.map(t => parseFloat(t.registrationFee));
    const averageRegistrationFee = totalTournaments > 0
      ? (fees.reduce((sum, fee) => sum + fee, 0) / totalTournaments).toFixed(2)
      : "0.00";

    const totalParticipantsCapacity = allTournaments.reduce((sum, t) => sum + t.maxParticipants, 0);

    return {
      totalTournaments,
      upcomingTournaments,
      registrationOpenTournaments,
      inProgressTournaments,
      completedTournaments,
      cancelledTournaments,
      averageRegistrationFee,
      totalParticipantsCapacity,
    };
  }

  /**
   * Получает турниры с детальной информацией о площадке
   * @param venueId ID площадки (опционально)
   * @param limit Лимит записей (опционально)
   * @returns Массив турниров с информацией о площадке
   */
  async getWithVenueDetails(venueId?: string, limit?: number): Promise<Array<Tournament & {
    venue: { name: string; city: string; country: string; address: string };
  }>> {
    const conditions = [];
    if (venueId) {
      conditions.push(eq(tournaments.venueId, venueId));
    }

    const baseQuery = this.db
      .select({
        id: tournaments.id,
        venueId: tournaments.venueId,
        name: tournaments.name,
        description: tournaments.description,
        tournamentType: tournaments.tournamentType,
        skillLevelCategory: tournaments.skillLevelCategory,
        startDate: tournaments.startDate,
        endDate: tournaments.endDate,
        registrationFee: tournaments.registrationFee,
        currency: tournaments.currency,
        maxParticipants: tournaments.maxParticipants,
        status: tournaments.status,
        rulesUrl: tournaments.rulesUrl,
        createdAt: tournaments.createdAt,
        updatedAt: tournaments.updatedAt,
        venue: {
          name: schema.venues.name,
          city: schema.venues.city,
          country: schema.venues.country,
          address: schema.venues.address,
        },
      })
      .from(tournaments)
      .innerJoin(schema.venues, eq(tournaments.venueId, schema.venues.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(tournaments.startDate));

    if (limit) {
      return await baseQuery.limit(limit);
    } else {
      return await baseQuery;
    }
  }

  /**
   * Получает турниры по диапазону количества участников
   * @param minParticipants Минимальное количество участников
   * @param maxParticipants Максимальное количество участников
   * @returns Массив турниров
   */
  async getByParticipantsRange(minParticipants: number, maxParticipants: number): Promise<Tournament[]> {
    return await this.db
      .select()
      .from(tournaments)
      .where(and(
        gte(tournaments.maxParticipants, minParticipants),
        lte(tournaments.maxParticipants, maxParticipants)
      ))
      .orderBy(desc(tournaments.startDate));
  }

  /**
   * Получает турниры, которые начинаются в ближайшие дни
   * @param days Количество дней (по умолчанию 7)
   * @param venueId ID площадки (опционально)
   * @returns Массив турниров
   */
  async getTournamentsStartingSoon(days: number = 7, venueId?: string): Promise<Tournament[]> {
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const conditions = [
      gte(tournaments.startDate, now),
      lte(tournaments.startDate, futureDate)
    ];

    if (venueId) {
      conditions.push(eq(tournaments.venueId, venueId));
    }

    return await this.db
      .select()
      .from(tournaments)
      .where(and(...conditions))
      .orderBy(asc(tournaments.startDate));
  }

  /**
   * Получает турниры по валюте
   * @param currency Валюта (например, "USD", "EUR")
   * @returns Массив турниров
   */
  async getByCurrency(currency: string): Promise<Tournament[]> {
    return await this.db
      .select()
      .from(tournaments)
      .where(eq(tournaments.currency, currency))
      .orderBy(desc(tournaments.startDate));
  }

  /**
   * Получает бесплатные турниры (с нулевым взносом)
   * @param venueId ID площадки (опционально)
   * @returns Массив бесплатных турниров
   */
  async getFreeTournaments(venueId?: string): Promise<Tournament[]> {
    const conditions = [eq(tournaments.registrationFee, "0.00")];

    if (venueId) {
      conditions.push(eq(tournaments.venueId, venueId));
    }

    return await this.db
      .select()
      .from(tournaments)
      .where(and(...conditions))
      .orderBy(desc(tournaments.startDate));
  }

  /**
   * Получает турниры с правилами (где указан rulesUrl)
   * @param venueId ID площадки (опционально)
   * @returns Массив турниров с правилами
   */
  async getTournamentsWithRules(venueId?: string): Promise<Tournament[]> {
    const conditions = [sql`${tournaments.rulesUrl} IS NOT NULL`];

    if (venueId) {
      conditions.push(eq(tournaments.venueId, venueId));
    }

    return await this.db
      .select()
      .from(tournaments)
      .where(and(...conditions))
      .orderBy(desc(tournaments.startDate));
  }

  /**
   * Массовое обновление статуса турниров
   * @param tournamentIds Массив ID турниров
   * @param status Новый статус
   * @returns Количество обновленных турниров
   */
  async bulkUpdateStatus(
    tournamentIds: string[],
    status: "upcoming" | "registration_open" | "in_progress" | "completed" | "cancelled"
  ): Promise<number> {
    if (tournamentIds.length === 0) return 0;

    const updatedTournaments = await this.db
      .update(tournaments)
      .set({ status })
      .where(inArray(tournaments.id, tournamentIds))
      .returning();

    return updatedTournaments.length;
  }

  /**
   * Удаляет все турниры площадки
   * @param venueId ID площадки
   * @returns Количество удаленных турниров
   */
  async deleteAllByVenue(venueId: string): Promise<number> {
    const deletedTournaments = await this.db
      .delete(tournaments)
      .where(eq(tournaments.venueId, venueId))
      .returning();

    return deletedTournaments.length;
  }

  /**
   * Получает турниры, сгруппированные по месяцам
   * @param year Год (опционально, по умолчанию текущий)
   * @param venueId ID площадки (опционально)
   * @returns Массив с турнирами по месяцам
   */
  async getTournamentsByMonths(year?: number, venueId?: string): Promise<Array<{
    month: string;
    tournamentsCount: number;
    totalParticipantsCapacity: number;
  }>> {
    const conditions = [];
    const targetYear = year || new Date().getFullYear();

    conditions.push(sql`EXTRACT(YEAR FROM ${tournaments.startDate}) = ${targetYear}`);

    if (venueId) {
      conditions.push(eq(tournaments.venueId, venueId));
    }

    const result = await this.db
      .select({
        month: sql<string>`TO_CHAR(${tournaments.startDate}, 'YYYY-MM')`,
        tournamentsCount: sql<number>`count(*)::int`,
        totalParticipantsCapacity: sql<number>`sum(${tournaments.maxParticipants})::int`,
      })
      .from(tournaments)
      .where(and(...conditions))
      .groupBy(sql`TO_CHAR(${tournaments.startDate}, 'YYYY-MM')`)
      .orderBy(asc(sql`TO_CHAR(${tournaments.startDate}, 'YYYY-MM')`));

    return result;
  }

  /**
   * Получает самые популярные типы турниров
   * @param venueId ID площадки (опционально)
   * @returns Массив с типами турниров и их количеством
   */
  async getPopularTournamentTypes(venueId?: string): Promise<Array<{
    tournamentType: string;
    count: number;
    averageFee: string;
  }>> {
    const conditions = [];
    if (venueId) {
      conditions.push(eq(tournaments.venueId, venueId));
    }

    const result = await this.db
      .select({
        tournamentType: tournaments.tournamentType,
        count: sql<number>`count(*)::int`,
        averageFee: sql<number>`avg(${tournaments.registrationFee})::float`,
      })
      .from(tournaments)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .groupBy(tournaments.tournamentType)
      .orderBy(desc(sql`count(*)`));

    return result.map(row => ({
      tournamentType: row.tournamentType,
      count: row.count,
      averageFee: row.averageFee?.toFixed(2) || "0.00",
    }));
  }

  /**
   * Получает турниры с наибольшим количеством участников
   * @param limit Лимит записей (по умолчанию 10)
   * @param venueId ID площадки (опционально)
   * @returns Массив турниров с наибольшим количеством участников
   */
  async getLargestTournaments(limit: number = 10, venueId?: string): Promise<Tournament[]> {
    const conditions = [];
    if (venueId) {
      conditions.push(eq(tournaments.venueId, venueId));
    }

    return await this.db
      .select()
      .from(tournaments)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(tournaments.maxParticipants))
      .limit(limit);
  }
}
