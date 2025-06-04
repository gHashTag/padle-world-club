/**
 * Репозиторий для работы с моделью TournamentParticipant
 * Содержит методы CRUD для работы с участниками турниров
 */

import { eq, and, desc, asc, sql, inArray, count, gte, lte } from "drizzle-orm";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "../db/schema";
import { TournamentParticipant, NewTournamentParticipant, tournamentParticipants } from "../db/schema";

export class TournamentParticipantRepository {
  constructor(private db: PostgresJsDatabase<typeof schema>) {}

  /**
   * Создает нового участника турнира
   * @param participantData Данные участника турнира
   * @returns Созданный участник турнира
   */
  async create(participantData: NewTournamentParticipant): Promise<TournamentParticipant> {
    const [participant] = await this.db
      .insert(tournamentParticipants)
      .values(participantData)
      .returning();
    return participant;
  }

  /**
   * Получает участника турнира по ID
   * @param id ID участника турнира
   * @returns Участник турнира или null, если не найден
   */
  async getById(id: string): Promise<TournamentParticipant | null> {
    const [participant] = await this.db
      .select()
      .from(tournamentParticipants)
      .where(eq(tournamentParticipants.id, id));
    return participant || null;
  }

  /**
   * Получает участника турнира по турниру и пользователю
   * @param tournamentId ID турнира
   * @param userId ID пользователя
   * @returns Участник турнира или null, если не найден
   */
  async getByTournamentAndUser(tournamentId: string, userId: string): Promise<TournamentParticipant | null> {
    const [participant] = await this.db
      .select()
      .from(tournamentParticipants)
      .where(and(
        eq(tournamentParticipants.tournamentId, tournamentId),
        eq(tournamentParticipants.userId, userId)
      ));
    return participant || null;
  }

  /**
   * Получает всех участников турнира
   * @param tournamentId ID турнира
   * @param status Статус участника (опционально)
   * @returns Массив участников турнира
   */
  async getByTournament(
    tournamentId: string,
    status?: "registered" | "checked_in" | "withdrawn"
  ): Promise<TournamentParticipant[]> {
    const conditions = [eq(tournamentParticipants.tournamentId, tournamentId)];

    if (status) {
      conditions.push(eq(tournamentParticipants.status, status));
    }

    return await this.db
      .select()
      .from(tournamentParticipants)
      .where(and(...conditions))
      .orderBy(asc(tournamentParticipants.registrationDate));
  }

  /**
   * Получает все турниры пользователя
   * @param userId ID пользователя
   * @param status Статус участия (опционально)
   * @returns Массив участий пользователя в турнирах
   */
  async getByUser(
    userId: string,
    status?: "registered" | "checked_in" | "withdrawn"
  ): Promise<TournamentParticipant[]> {
    const conditions = [eq(tournamentParticipants.userId, userId)];

    if (status) {
      conditions.push(eq(tournamentParticipants.status, status));
    }

    return await this.db
      .select()
      .from(tournamentParticipants)
      .where(and(...conditions))
      .orderBy(desc(tournamentParticipants.registrationDate));
  }

  /**
   * Получает участников по статусу
   * @param status Статус участника
   * @returns Массив участников турниров
   */
  async getByStatus(status: "registered" | "checked_in" | "withdrawn"): Promise<TournamentParticipant[]> {
    return await this.db
      .select()
      .from(tournamentParticipants)
      .where(eq(tournamentParticipants.status, status))
      .orderBy(desc(tournamentParticipants.registrationDate));
  }

  /**
   * Получает участников по нескольким турнирам
   * @param tournamentIds Массив ID турниров
   * @returns Массив участников турниров
   */
  async getByTournaments(tournamentIds: string[]): Promise<TournamentParticipant[]> {
    if (tournamentIds.length === 0) return [];

    return await this.db
      .select()
      .from(tournamentParticipants)
      .where(inArray(tournamentParticipants.tournamentId, tournamentIds))
      .orderBy(desc(tournamentParticipants.registrationDate));
  }

  /**
   * Получает участников по нескольким пользователям
   * @param userIds Массив ID пользователей
   * @returns Массив участий в турнирах
   */
  async getByUsers(userIds: string[]): Promise<TournamentParticipant[]> {
    if (userIds.length === 0) return [];

    return await this.db
      .select()
      .from(tournamentParticipants)
      .where(inArray(tournamentParticipants.userId, userIds))
      .orderBy(desc(tournamentParticipants.registrationDate));
  }

  /**
   * Получает участников по диапазону дат регистрации
   * @param startDate Начальная дата
   * @param endDate Конечная дата
   * @returns Массив участников турниров
   */
  async getByRegistrationDateRange(startDate: Date, endDate: Date): Promise<TournamentParticipant[]> {
    return await this.db
      .select()
      .from(tournamentParticipants)
      .where(and(
        gte(tournamentParticipants.registrationDate, startDate),
        lte(tournamentParticipants.registrationDate, endDate)
      ))
      .orderBy(desc(tournamentParticipants.registrationDate));
  }

  /**
   * Получает участников с партнерами (для парных турниров)
   * @param tournamentId ID турнира (опционально)
   * @returns Массив участников с партнерами
   */
  async getWithPartners(tournamentId?: string): Promise<TournamentParticipant[]> {
    const conditions = [sql`${tournamentParticipants.partnerUserId} IS NOT NULL`];

    if (tournamentId) {
      conditions.push(eq(tournamentParticipants.tournamentId, tournamentId));
    }

    return await this.db
      .select()
      .from(tournamentParticipants)
      .where(and(...conditions))
      .orderBy(desc(tournamentParticipants.registrationDate));
  }

  /**
   * Получает участников без партнеров (одиночные участники)
   * @param tournamentId ID турнира (опционально)
   * @returns Массив одиночных участников
   */
  async getSoloParticipants(tournamentId?: string): Promise<TournamentParticipant[]> {
    const conditions = [sql`${tournamentParticipants.partnerUserId} IS NULL`];

    if (tournamentId) {
      conditions.push(eq(tournamentParticipants.tournamentId, tournamentId));
    }

    return await this.db
      .select()
      .from(tournamentParticipants)
      .where(and(...conditions))
      .orderBy(desc(tournamentParticipants.registrationDate));
  }

  /**
   * Получает активных участников (зарегистрированных и отмеченных)
   * @param tournamentId ID турнира (опционально)
   * @returns Массив активных участников
   */
  async getActiveParticipants(tournamentId?: string): Promise<TournamentParticipant[]> {
    const conditions = [
      sql`${tournamentParticipants.status} IN ('registered', 'checked_in')`
    ];

    if (tournamentId) {
      conditions.push(eq(tournamentParticipants.tournamentId, tournamentId));
    }

    return await this.db
      .select()
      .from(tournamentParticipants)
      .where(and(...conditions))
      .orderBy(asc(tournamentParticipants.registrationDate));
  }

  /**
   * Обновляет данные участника турнира
   * @param id ID участника турнира
   * @param updateData Данные для обновления
   * @returns Обновленный участник турнира или null, если не найден
   */
  async update(
    id: string,
    updateData: Partial<Omit<NewTournamentParticipant, "tournamentId" | "userId">>
  ): Promise<TournamentParticipant | null> {
    const [updatedParticipant] = await this.db
      .update(tournamentParticipants)
      .set(updateData)
      .where(eq(tournamentParticipants.id, id))
      .returning();
    return updatedParticipant || null;
  }

  /**
   * Обновляет статус участника турнира
   * @param id ID участника турнира
   * @param status Новый статус
   * @returns Обновленный участник турнира или null, если не найден
   */
  async updateStatus(
    id: string,
    status: "registered" | "checked_in" | "withdrawn"
  ): Promise<TournamentParticipant | null> {
    const [updatedParticipant] = await this.db
      .update(tournamentParticipants)
      .set({ status })
      .where(eq(tournamentParticipants.id, id))
      .returning();
    return updatedParticipant || null;
  }

  /**
   * Обновляет статус участника по турниру и пользователю
   * @param tournamentId ID турнира
   * @param userId ID пользователя
   * @param status Новый статус
   * @returns Обновленный участник турнира или null, если не найден
   */
  async updateStatusByTournamentAndUser(
    tournamentId: string,
    userId: string,
    status: "registered" | "checked_in" | "withdrawn"
  ): Promise<TournamentParticipant | null> {
    const [updatedParticipant] = await this.db
      .update(tournamentParticipants)
      .set({ status })
      .where(and(
        eq(tournamentParticipants.tournamentId, tournamentId),
        eq(tournamentParticipants.userId, userId)
      ))
      .returning();
    return updatedParticipant || null;
  }

  /**
   * Удаляет участника турнира
   * @param id ID участника турнира
   * @returns true, если участник был удален, false если не найден
   */
  async delete(id: string): Promise<boolean> {
    const [deletedParticipant] = await this.db
      .delete(tournamentParticipants)
      .where(eq(tournamentParticipants.id, id))
      .returning();
    return !!deletedParticipant;
  }

  /**
   * Удаляет участника по турниру и пользователю
   * @param tournamentId ID турнира
   * @param userId ID пользователя
   * @returns true, если участник был удален, false если не найден
   */
  async deleteByTournamentAndUser(tournamentId: string, userId: string): Promise<boolean> {
    const [deletedParticipant] = await this.db
      .delete(tournamentParticipants)
      .where(and(
        eq(tournamentParticipants.tournamentId, tournamentId),
        eq(tournamentParticipants.userId, userId)
      ))
      .returning();
    return !!deletedParticipant;
  }

  /**
   * Получает количество участников турнира
   * @param tournamentId ID турнира (опционально)
   * @param status Статус участника (опционально)
   * @returns Количество участников
   */
  async getCount(
    tournamentId?: string,
    status?: "registered" | "checked_in" | "withdrawn"
  ): Promise<number> {
    const conditions = [];

    if (tournamentId) {
      conditions.push(eq(tournamentParticipants.tournamentId, tournamentId));
    }
    if (status) {
      conditions.push(eq(tournamentParticipants.status, status));
    }

    const [result] = await this.db
      .select({ count: count() })
      .from(tournamentParticipants)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return result.count;
  }

  /**
   * Получает все записи участников турниров с пагинацией
   * @param limit Лимит записей (опционально)
   * @param offset Смещение (опционально)
   * @returns Массив участников турниров
   */
  async getAll(limit?: number, offset?: number): Promise<TournamentParticipant[]> {
    const baseQuery = this.db
      .select()
      .from(tournamentParticipants)
      .orderBy(desc(tournamentParticipants.registrationDate));

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
   * Получает статистику по участникам турниров
   * @param tournamentId ID турнира (опционально)
   * @returns Объект со статистикой
   */
  async getStats(tournamentId?: string): Promise<{
    totalParticipants: number;
    registeredParticipants: number;
    checkedInParticipants: number;
    withdrawnParticipants: number;
    participantsWithPartners: number;
    soloParticipants: number;
  }> {
    const conditions = [];
    if (tournamentId) {
      conditions.push(eq(tournamentParticipants.tournamentId, tournamentId));
    }

    const allParticipants = await this.db
      .select()
      .from(tournamentParticipants)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const totalParticipants = allParticipants.length;
    const registeredParticipants = allParticipants.filter(p => p.status === "registered").length;
    const checkedInParticipants = allParticipants.filter(p => p.status === "checked_in").length;
    const withdrawnParticipants = allParticipants.filter(p => p.status === "withdrawn").length;
    const participantsWithPartners = allParticipants.filter(p => p.partnerUserId !== null).length;
    const soloParticipants = allParticipants.filter(p => p.partnerUserId === null).length;

    return {
      totalParticipants,
      registeredParticipants,
      checkedInParticipants,
      withdrawnParticipants,
      participantsWithPartners,
      soloParticipants,
    };
  }

  /**
   * Получает участников турниров с детальной информацией о пользователе и турнире
   * @param tournamentId ID турнира (опционально)
   * @param userId ID пользователя (опционально)
   * @param limit Лимит записей (опционально)
   * @returns Массив участников с детальной информацией
   */
  async getWithDetails(tournamentId?: string, userId?: string, limit?: number): Promise<Array<TournamentParticipant & {
    user: { firstName: string; lastName: string; email: string; currentRating: number };
    tournament: { name: string; startDate: Date; endDate: Date; status: string };
    partner?: { firstName: string | null; lastName: string | null; email: string | null } | null;
  }>> {
    const conditions = [];
    if (tournamentId) {
      conditions.push(eq(tournamentParticipants.tournamentId, tournamentId));
    }
    if (userId) {
      conditions.push(eq(tournamentParticipants.userId, userId));
    }

    const baseQuery = this.db
      .select({
        id: tournamentParticipants.id,
        tournamentId: tournamentParticipants.tournamentId,
        userId: tournamentParticipants.userId,
        registrationDate: tournamentParticipants.registrationDate,
        status: tournamentParticipants.status,
        partnerUserId: tournamentParticipants.partnerUserId,
        teamId: tournamentParticipants.teamId,
        createdAt: tournamentParticipants.createdAt,
        updatedAt: tournamentParticipants.updatedAt,
        user: {
          firstName: schema.users.firstName,
          lastName: schema.users.lastName,
          email: schema.users.email,
          currentRating: schema.users.currentRating,
        },
        tournament: {
          name: schema.tournaments.name,
          startDate: schema.tournaments.startDate,
          endDate: schema.tournaments.endDate,
          status: schema.tournaments.status,
        },
        partner: {
          firstName: sql<string | null>`partner_user.first_name`,
          lastName: sql<string | null>`partner_user.last_name`,
          email: sql<string | null>`partner_user.email`,
        },
      })
      .from(tournamentParticipants)
      .innerJoin(schema.users, eq(tournamentParticipants.userId, schema.users.id))
      .innerJoin(schema.tournaments, eq(tournamentParticipants.tournamentId, schema.tournaments.id))
      .leftJoin(
        sql`"user" as partner_user`,
        eq(tournamentParticipants.partnerUserId, sql`partner_user.id`)
      )
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(tournamentParticipants.registrationDate));

    if (limit) {
      return await baseQuery.limit(limit);
    } else {
      return await baseQuery;
    }
  }

  /**
   * Проверяет, зарегистрирован ли пользователь в турнире
   * @param tournamentId ID турнира
   * @param userId ID пользователя
   * @returns true, если пользователь зарегистрирован
   */
  async isUserRegistered(tournamentId: string, userId: string): Promise<boolean> {
    const participant = await this.getByTournamentAndUser(tournamentId, userId);
    return !!participant;
  }

  /**
   * Получает партнера участника
   * @param tournamentId ID турнира
   * @param userId ID пользователя
   * @returns Участник-партнер или null
   */
  async getPartner(tournamentId: string, userId: string): Promise<TournamentParticipant | null> {
    const participant = await this.getByTournamentAndUser(tournamentId, userId);
    if (!participant || !participant.partnerUserId) {
      return null;
    }

    return await this.getByTournamentAndUser(tournamentId, participant.partnerUserId);
  }

  /**
   * Массовое обновление статуса участников
   * @param participantIds Массив ID участников
   * @param status Новый статус
   * @returns Количество обновленных участников
   */
  async bulkUpdateStatus(
    participantIds: string[],
    status: "registered" | "checked_in" | "withdrawn"
  ): Promise<number> {
    if (participantIds.length === 0) return 0;

    const updatedParticipants = await this.db
      .update(tournamentParticipants)
      .set({ status })
      .where(inArray(tournamentParticipants.id, participantIds))
      .returning();

    return updatedParticipants.length;
  }

  /**
   * Удаляет всех участников турнира
   * @param tournamentId ID турнира
   * @returns Количество удаленных участников
   */
  async deleteAllByTournament(tournamentId: string): Promise<number> {
    const deletedParticipants = await this.db
      .delete(tournamentParticipants)
      .where(eq(tournamentParticipants.tournamentId, tournamentId))
      .returning();

    return deletedParticipants.length;
  }

  /**
   * Удаляет все участия пользователя
   * @param userId ID пользователя
   * @returns Количество удаленных участий
   */
  async deleteAllByUser(userId: string): Promise<number> {
    const deletedParticipants = await this.db
      .delete(tournamentParticipants)
      .where(eq(tournamentParticipants.userId, userId))
      .returning();

    return deletedParticipants.length;
  }

  /**
   * Получает участников, сгруппированных по турнирам
   * @param userIds Массив ID пользователей (опционально)
   * @returns Массив с участниками по турнирам
   */
  async getGroupedByTournament(userIds?: string[]): Promise<Array<{
    tournamentId: string;
    tournamentName: string;
    participantsCount: number;
    registeredCount: number;
    checkedInCount: number;
    withdrawnCount: number;
  }>> {
    const conditions = [];
    if (userIds && userIds.length > 0) {
      conditions.push(inArray(tournamentParticipants.userId, userIds));
    }

    const result = await this.db
      .select({
        tournamentId: tournamentParticipants.tournamentId,
        tournamentName: schema.tournaments.name,
        participantsCount: sql<number>`count(*)::int`,
        registeredCount: sql<number>`count(case when ${tournamentParticipants.status} = 'registered' then 1 end)::int`,
        checkedInCount: sql<number>`count(case when ${tournamentParticipants.status} = 'checked_in' then 1 end)::int`,
        withdrawnCount: sql<number>`count(case when ${tournamentParticipants.status} = 'withdrawn' then 1 end)::int`,
      })
      .from(tournamentParticipants)
      .innerJoin(schema.tournaments, eq(tournamentParticipants.tournamentId, schema.tournaments.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .groupBy(tournamentParticipants.tournamentId, schema.tournaments.name)
      .orderBy(desc(sql`count(*)`));

    return result;
  }

  /**
   * Получает топ пользователей по количеству участий в турнирах
   * @param limit Лимит записей (по умолчанию 10)
   * @param status Статус участия (опционально)
   * @returns Массив с топ участниками
   */
  async getTopParticipants(limit: number = 10, status?: "registered" | "checked_in" | "withdrawn"): Promise<Array<{
    userId: string;
    firstName: string;
    lastName: string;
    participationsCount: number;
    registeredCount: number;
    checkedInCount: number;
    withdrawnCount: number;
    currentRating: number;
  }>> {
    const conditions = [];
    if (status) {
      conditions.push(eq(tournamentParticipants.status, status));
    }

    const result = await this.db
      .select({
        userId: tournamentParticipants.userId,
        firstName: schema.users.firstName,
        lastName: schema.users.lastName,
        participationsCount: sql<number>`count(*)::int`,
        registeredCount: sql<number>`count(case when ${tournamentParticipants.status} = 'registered' then 1 end)::int`,
        checkedInCount: sql<number>`count(case when ${tournamentParticipants.status} = 'checked_in' then 1 end)::int`,
        withdrawnCount: sql<number>`count(case when ${tournamentParticipants.status} = 'withdrawn' then 1 end)::int`,
        currentRating: schema.users.currentRating,
      })
      .from(tournamentParticipants)
      .innerJoin(schema.users, eq(tournamentParticipants.userId, schema.users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .groupBy(tournamentParticipants.userId, schema.users.firstName, schema.users.lastName, schema.users.currentRating)
      .orderBy(desc(sql`count(*)`))
      .limit(limit);

    return result;
  }

  /**
   * Получает участников, зарегистрированных в определенный период
   * @param days Количество дней (по умолчанию 30)
   * @param tournamentId ID турнира (опционально)
   * @returns Массив участников
   */
  async getRecentRegistrations(days: number = 30, tournamentId?: string): Promise<TournamentParticipant[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const conditions = [gte(tournamentParticipants.registrationDate, startDate)];

    if (tournamentId) {
      conditions.push(eq(tournamentParticipants.tournamentId, tournamentId));
    }

    return await this.db
      .select()
      .from(tournamentParticipants)
      .where(and(...conditions))
      .orderBy(desc(tournamentParticipants.registrationDate));
  }

  /**
   * Получает участников, сгруппированных по дням регистрации
   * @param tournamentId ID турнира (опционально)
   * @param days Количество дней (по умолчанию 30)
   * @returns Массив с участниками по дням
   */
  async getRegistrationsByDays(tournamentId?: string, days: number = 30): Promise<Array<{
    date: string;
    registrationsCount: number;
  }>> {
    const conditions = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    conditions.push(gte(tournamentParticipants.registrationDate, startDate));

    if (tournamentId) {
      conditions.push(eq(tournamentParticipants.tournamentId, tournamentId));
    }

    const result = await this.db
      .select({
        date: sql<string>`date(${tournamentParticipants.registrationDate})`,
        registrationsCount: sql<number>`count(*)::int`,
      })
      .from(tournamentParticipants)
      .where(and(...conditions))
      .groupBy(sql`date(${tournamentParticipants.registrationDate})`)
      .orderBy(asc(sql`date(${tournamentParticipants.registrationDate})`));

    return result;
  }
}
