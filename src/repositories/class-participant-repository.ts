/**
 * Репозиторий для работы с моделью ClassParticipant
 * Содержит методы CRUD для работы с участниками классов/тренировок
 */

import { eq, and, desc, sql } from "drizzle-orm";


import { ClassParticipant, NewClassParticipant, classParticipants } from "../db/schema";
import { DatabaseType } from "./types";

export class ClassParticipantRepository {
  private db: DatabaseType;

  constructor(db: DatabaseType) {
    this.db = db;
  }

  /**
   * Создает нового участника класса
   * @param participantData Данные участника класса
   * @returns Созданный участник класса
   */
  async create(participantData: NewClassParticipant): Promise<ClassParticipant> {
    const [participant] = await this.db.insert(classParticipants).values(participantData).returning();
    return participant;
  }

  /**
   * Получает участника класса по ID
   * @param id ID участника класса
   * @returns Участник класса или null, если не найден
   */
  async getById(id: string): Promise<ClassParticipant | null> {
    const result = await this.db
      .select()
      .from(classParticipants)
      .where(eq(classParticipants.id, id));

    return result.length > 0 ? result[0] : null;
  }

  /**
   * Получает участника класса по расписанию и пользователю
   * @param classScheduleId ID расписания класса
   * @param userId ID пользователя
   * @returns Участник класса или null, если не найден
   */
  async getByClassScheduleAndUser(classScheduleId: string, userId: string): Promise<ClassParticipant | null> {
    const result = await this.db
      .select()
      .from(classParticipants)
      .where(and(
        eq(classParticipants.classScheduleId, classScheduleId),
        eq(classParticipants.userId, userId)
      ));

    return result.length > 0 ? result[0] : null;
  }

  /**
   * Получает всех участников класса по расписанию
   * @param classScheduleId ID расписания класса
   * @param statusFilter Фильтр по статусу (опционально)
   * @returns Массив участников класса
   */
  async getByClassSchedule(
    classScheduleId: string,
    statusFilter?: "registered" | "attended" | "no_show" | "cancelled"
  ): Promise<ClassParticipant[]> {
    const conditions = [eq(classParticipants.classScheduleId, classScheduleId)];

    if (statusFilter) {
      conditions.push(eq(classParticipants.status, statusFilter));
    }

    return await this.db
      .select()
      .from(classParticipants)
      .where(and(...conditions))
      .orderBy(desc(classParticipants.createdAt));
  }

  /**
   * Получает всех участников пользователя
   * @param userId ID пользователя
   * @param statusFilter Фильтр по статусу (опционально)
   * @returns Массив участий пользователя в классах
   */
  async getByUser(
    userId: string,
    statusFilter?: "registered" | "attended" | "no_show" | "cancelled"
  ): Promise<ClassParticipant[]> {
    const conditions = [eq(classParticipants.userId, userId)];

    if (statusFilter) {
      conditions.push(eq(classParticipants.status, statusFilter));
    }

    return await this.db
      .select()
      .from(classParticipants)
      .where(and(...conditions))
      .orderBy(desc(classParticipants.createdAt));
  }

  /**
   * Получает участников по статусу
   * @param status Статус участника
   * @returns Массив участников класса
   */
  async getByStatus(status: "registered" | "attended" | "no_show" | "cancelled"): Promise<ClassParticipant[]> {
    return await this.db
      .select()
      .from(classParticipants)
      .where(eq(classParticipants.status, status))
      .orderBy(desc(classParticipants.createdAt));
  }

  /**
   * Получает участников, оплативших пакетом тренировок
   * @param packageId ID пакета тренировок (опционально)
   * @returns Массив участников класса
   */
  async getByTrainingPackage(packageId?: string): Promise<ClassParticipant[]> {
    const conditions = [];

    if (packageId) {
      conditions.push(eq(classParticipants.paidWithPackageId, packageId));
    } else {
      // Получаем всех, кто оплатил любым пакетом
      conditions.push(sql`${classParticipants.paidWithPackageId} IS NOT NULL`);
    }

    return await this.db
      .select()
      .from(classParticipants)
      .where(and(...conditions))
      .orderBy(desc(classParticipants.createdAt));
  }

  /**
   * Получает всех участников классов
   * @param limit Лимит записей (по умолчанию 100)
   * @param offset Смещение (по умолчанию 0)
   * @returns Массив участников классов
   */
  async getAll(limit: number = 100, offset: number = 0): Promise<ClassParticipant[]> {
    return await this.db
      .select()
      .from(classParticipants)
      .orderBy(desc(classParticipants.createdAt))
      .limit(limit)
      .offset(offset);
  }

  /**
   * Обновляет данные участника класса
   * @param id ID участника класса
   * @param participantData Данные для обновления
   * @returns Обновленный участник класса или null, если не найден
   */
  async update(id: string, participantData: Partial<NewClassParticipant>): Promise<ClassParticipant | null> {
    const [updatedParticipant] = await this.db
      .update(classParticipants)
      .set(participantData)
      .where(eq(classParticipants.id, id))
      .returning();

    return updatedParticipant || null;
  }

  /**
   * Обновляет статус участника класса
   * @param id ID участника класса
   * @param status Новый статус
   * @returns Обновленный участник класса или null, если не найден
   */
  async updateStatus(
    id: string,
    status: "registered" | "attended" | "no_show" | "cancelled"
  ): Promise<ClassParticipant | null> {
    return await this.update(id, { status });
  }

  /**
   * Обновляет статус участника по расписанию и пользователю
   * @param classScheduleId ID расписания класса
   * @param userId ID пользователя
   * @param status Новый статус
   * @returns Обновленный участник класса или null, если не найден
   */
  async updateStatusByClassScheduleAndUser(
    classScheduleId: string,
    userId: string,
    status: "registered" | "attended" | "no_show" | "cancelled"
  ): Promise<ClassParticipant | null> {
    const [updatedParticipant] = await this.db
      .update(classParticipants)
      .set({ status })
      .where(and(
        eq(classParticipants.classScheduleId, classScheduleId),
        eq(classParticipants.userId, userId)
      ))
      .returning();

    return updatedParticipant || null;
  }

  /**
   * Устанавливает пакет тренировок для участника
   * @param id ID участника класса
   * @param packageId ID пакета тренировок
   * @returns Обновленный участник класса или null, если не найден
   */
  async setTrainingPackage(id: string, packageId: string): Promise<ClassParticipant | null> {
    return await this.update(id, { paidWithPackageId: packageId });
  }

  /**
   * Удаляет участника класса
   * @param id ID участника класса
   * @returns true, если участник класса успешно удален, иначе false
   */
  async delete(id: string): Promise<boolean> {
    const [deletedParticipant] = await this.db
      .delete(classParticipants)
      .where(eq(classParticipants.id, id))
      .returning();

    return !!deletedParticipant;
  }

  /**
   * Удаляет участника по расписанию и пользователю
   * @param classScheduleId ID расписания класса
   * @param userId ID пользователя
   * @returns true, если участник класса успешно удален, иначе false
   */
  async deleteByClassScheduleAndUser(classScheduleId: string, userId: string): Promise<boolean> {
    const [deletedParticipant] = await this.db
      .delete(classParticipants)
      .where(and(
        eq(classParticipants.classScheduleId, classScheduleId),
        eq(classParticipants.userId, userId)
      ))
      .returning();

    return !!deletedParticipant;
  }

  /**
   * Удаляет всех участников класса
   * @param classScheduleId ID расписания класса
   * @returns Количество удаленных участников
   */
  async deleteAllByClassSchedule(classScheduleId: string): Promise<number> {
    const deletedParticipants = await this.db
      .delete(classParticipants)
      .where(eq(classParticipants.classScheduleId, classScheduleId))
      .returning();

    return deletedParticipants.length;
  }

  /**
   * Проверяет, является ли пользователь участником класса
   * @param classScheduleId ID расписания класса
   * @param userId ID пользователя
   * @returns true, если пользователь является участником
   */
  async isUserParticipant(classScheduleId: string, userId: string): Promise<boolean> {
    const participant = await this.getByClassScheduleAndUser(classScheduleId, userId);
    return !!participant;
  }

  /**
   * Получает количество участников класса
   * @param classScheduleId ID расписания класса
   * @param statusFilter Фильтр по статусу (опционально)
   * @returns Количество участников
   */
  async getParticipantCount(
    classScheduleId: string,
    statusFilter?: "registered" | "attended" | "no_show" | "cancelled"
  ): Promise<number> {
    const conditions = [eq(classParticipants.classScheduleId, classScheduleId)];

    if (statusFilter) {
      conditions.push(eq(classParticipants.status, statusFilter));
    }

    const result = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(classParticipants)
      .where(and(...conditions));

    return Number(result[0]?.count) || 0;
  }

  /**
   * Получает статистику по участникам класса
   * @param classScheduleId ID расписания класса (опционально)
   * @returns Объект со статистикой
   */
  async getStats(classScheduleId?: string): Promise<{
    totalParticipants: number;
    registeredCount: number;
    attendedCount: number;
    noShowCount: number;
    cancelledCount: number;
    paidWithPackageCount: number;
    attendanceRate: string; // Процент посещаемости
  }> {
    const conditions = [];
    if (classScheduleId) {
      conditions.push(eq(classParticipants.classScheduleId, classScheduleId));
    }

    const allParticipants = await this.db
      .select()
      .from(classParticipants)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const totalParticipants = allParticipants.length;
    const registeredCount = allParticipants.filter(p => p.status === "registered").length;
    const attendedCount = allParticipants.filter(p => p.status === "attended").length;
    const noShowCount = allParticipants.filter(p => p.status === "no_show").length;
    const cancelledCount = allParticipants.filter(p => p.status === "cancelled").length;
    const paidWithPackageCount = allParticipants.filter(p => p.paidWithPackageId !== null).length;

    // Процент посещаемости = (attended / (attended + no_show)) * 100
    const totalAttendanceEligible = attendedCount + noShowCount;
    const attendanceRate = totalAttendanceEligible > 0
      ? ((attendedCount / totalAttendanceEligible) * 100).toFixed(2)
      : "0.00";

    return {
      totalParticipants,
      registeredCount,
      attendedCount,
      noShowCount,
      cancelledCount,
      paidWithPackageCount,
      attendanceRate,
    };
  }

  /**
   * Массовое обновление статуса участников класса
   * @param classScheduleId ID расписания класса
   * @param fromStatus Исходный статус
   * @param toStatus Целевой статус
   * @returns Количество обновленных участников
   */
  async bulkUpdateStatus(
    classScheduleId: string,
    fromStatus: "registered" | "attended" | "no_show" | "cancelled",
    toStatus: "registered" | "attended" | "no_show" | "cancelled"
  ): Promise<number> {
    const updatedParticipants = await this.db
      .update(classParticipants)
      .set({ status: toStatus })
      .where(and(
        eq(classParticipants.classScheduleId, classScheduleId),
        eq(classParticipants.status, fromStatus)
      ))
      .returning();

    return updatedParticipants.length;
  }

  /**
   * Получает участников с истекшими пакетами тренировок
   * @returns Массив участников с истекшими пакетами
   */
  async getParticipantsWithExpiredPackages(): Promise<ClassParticipant[]> {
    // TODO: Реализовать после создания таблицы UserTrainingPackage
    // Пока возвращаем пустой массив
    return [];
  }

  /**
   * Получает участников, которые не посетили класс (no_show)
   * @param classScheduleId ID расписания класса (опционально)
   * @returns Массив участников, которые не пришли
   */
  async getNoShowParticipants(classScheduleId?: string): Promise<ClassParticipant[]> {
    const conditions = [eq(classParticipants.status, "no_show")];

    if (classScheduleId) {
      conditions.push(eq(classParticipants.classScheduleId, classScheduleId));
    }

    return await this.db
      .select()
      .from(classParticipants)
      .where(and(...conditions))
      .orderBy(desc(classParticipants.createdAt));
  }

  /**
   * Получает активных участников (зарегистрированных или посетивших)
   * @param classScheduleId ID расписания класса (опционально)
   * @returns Массив активных участников
   */
  async getActiveParticipants(classScheduleId?: string): Promise<ClassParticipant[]> {
    const conditions = [
      sql`${classParticipants.status} IN ('registered', 'attended')`
    ];

    if (classScheduleId) {
      conditions.push(eq(classParticipants.classScheduleId, classScheduleId));
    }

    return await this.db
      .select()
      .from(classParticipants)
      .where(and(...conditions))
      .orderBy(desc(classParticipants.createdAt));
  }
}
