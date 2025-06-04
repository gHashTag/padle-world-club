/**
 * Репозиторий для работы с моделью ClassSchedule
 * Содержит методы CRUD для работы с расписанием классов/тренировок
 */

import { eq, and, gte, lte, desc, asc, sql } from "drizzle-orm";


import { ClassSchedule, NewClassSchedule, classSchedules } from "../db/schema";
import { DatabaseType } from "./types";

export class ClassScheduleRepository {
  private db: DatabaseType;

  constructor(db: DatabaseType) {
    this.db = db;
  }

  /**
   * Создает новое расписание класса
   * @param scheduleData Данные расписания класса
   * @returns Созданное расписание класса
   */
  async create(scheduleData: NewClassSchedule): Promise<ClassSchedule> {
    const [schedule] = await this.db.insert(classSchedules).values(scheduleData).returning();
    return schedule;
  }

  /**
   * Получает расписание класса по ID
   * @param id ID расписания класса
   * @returns Расписание класса или null, если не найдено
   */
  async getById(id: string): Promise<ClassSchedule | null> {
    const result = await this.db
      .select()
      .from(classSchedules)
      .where(eq(classSchedules.id, id));

    return result.length > 0 ? result[0] : null;
  }

  /**
   * Получает расписания классов по определению класса
   * @param classDefinitionId ID определения класса
   * @param statusFilter Фильтр по статусу (опционально)
   * @returns Массив расписаний классов
   */
  async getByClassDefinition(
    classDefinitionId: string,
    statusFilter?: "scheduled" | "cancelled" | "completed" | "draft"
  ): Promise<ClassSchedule[]> {
    const conditions = [eq(classSchedules.classDefinitionId, classDefinitionId)];

    if (statusFilter) {
      conditions.push(eq(classSchedules.status, statusFilter));
    }

    return await this.db
      .select()
      .from(classSchedules)
      .where(and(...conditions))
      .orderBy(asc(classSchedules.startTime));
  }

  /**
   * Получает расписания классов по инструктору
   * @param instructorId ID инструктора
   * @param statusFilter Фильтр по статусу (опционально)
   * @returns Массив расписаний классов
   */
  async getByInstructor(
    instructorId: string,
    statusFilter?: "scheduled" | "cancelled" | "completed" | "draft"
  ): Promise<ClassSchedule[]> {
    const conditions = [eq(classSchedules.instructorId, instructorId)];

    if (statusFilter) {
      conditions.push(eq(classSchedules.status, statusFilter));
    }

    return await this.db
      .select()
      .from(classSchedules)
      .where(and(...conditions))
      .orderBy(asc(classSchedules.startTime));
  }

  /**
   * Получает расписания классов по площадке
   * @param venueId ID площадки
   * @param statusFilter Фильтр по статусу (опционально)
   * @returns Массив расписаний классов
   */
  async getByVenue(
    venueId: string,
    statusFilter?: "scheduled" | "cancelled" | "completed" | "draft"
  ): Promise<ClassSchedule[]> {
    const conditions = [eq(classSchedules.venueId, venueId)];

    if (statusFilter) {
      conditions.push(eq(classSchedules.status, statusFilter));
    }

    return await this.db
      .select()
      .from(classSchedules)
      .where(and(...conditions))
      .orderBy(asc(classSchedules.startTime));
  }

  /**
   * Получает расписания классов по корту
   * @param courtId ID корта
   * @param statusFilter Фильтр по статусу (опционально)
   * @returns Массив расписаний классов
   */
  async getByCourt(
    courtId: string,
    statusFilter?: "scheduled" | "cancelled" | "completed" | "draft"
  ): Promise<ClassSchedule[]> {
    const conditions = [eq(classSchedules.courtId, courtId)];

    if (statusFilter) {
      conditions.push(eq(classSchedules.status, statusFilter));
    }

    return await this.db
      .select()
      .from(classSchedules)
      .where(and(...conditions))
      .orderBy(asc(classSchedules.startTime));
  }

  /**
   * Получает расписания классов по временному диапазону
   * @param startDate Начальная дата
   * @param endDate Конечная дата
   * @param statusFilter Фильтр по статусу (опционально)
   * @returns Массив расписаний классов
   */
  async getByDateRange(
    startDate: Date,
    endDate: Date,
    statusFilter?: "scheduled" | "cancelled" | "completed" | "draft"
  ): Promise<ClassSchedule[]> {
    const conditions = [
      gte(classSchedules.startTime, startDate),
      lte(classSchedules.startTime, endDate)
    ];

    if (statusFilter) {
      conditions.push(eq(classSchedules.status, statusFilter));
    }

    return await this.db
      .select()
      .from(classSchedules)
      .where(and(...conditions))
      .orderBy(asc(classSchedules.startTime));
  }

  /**
   * Получает расписания классов по статусу
   * @param status Статус расписания
   * @returns Массив расписаний классов
   */
  async getByStatus(status: "scheduled" | "cancelled" | "completed" | "draft"): Promise<ClassSchedule[]> {
    return await this.db
      .select()
      .from(classSchedules)
      .where(eq(classSchedules.status, status))
      .orderBy(asc(classSchedules.startTime));
  }

  /**
   * Получает расписания классов с доступными местами
   * @param venueId ID площадки (опционально)
   * @returns Массив расписаний классов с доступными местами
   */
  async getAvailableSchedules(venueId?: string): Promise<ClassSchedule[]> {
    const conditions = [
      eq(classSchedules.status, "scheduled"),
      sql`${classSchedules.currentParticipants} < ${classSchedules.maxParticipants}`
    ];

    if (venueId) {
      conditions.push(eq(classSchedules.venueId, venueId));
    }

    return await this.db
      .select()
      .from(classSchedules)
      .where(and(...conditions))
      .orderBy(asc(classSchedules.startTime));
  }

  /**
   * Получает полные расписания классов (без доступных мест)
   * @param venueId ID площадки (опционально)
   * @returns Массив полных расписаний классов
   */
  async getFullSchedules(venueId?: string): Promise<ClassSchedule[]> {
    const conditions = [
      eq(classSchedules.status, "scheduled"),
      sql`${classSchedules.currentParticipants} >= ${classSchedules.maxParticipants}`
    ];

    if (venueId) {
      conditions.push(eq(classSchedules.venueId, venueId));
    }

    return await this.db
      .select()
      .from(classSchedules)
      .where(and(...conditions))
      .orderBy(asc(classSchedules.startTime));
  }

  /**
   * Получает все расписания классов
   * @param limit Лимит записей (по умолчанию 100)
   * @param offset Смещение (по умолчанию 0)
   * @returns Массив расписаний классов
   */
  async getAll(limit: number = 100, offset: number = 0): Promise<ClassSchedule[]> {
    return await this.db
      .select()
      .from(classSchedules)
      .orderBy(desc(classSchedules.startTime))
      .limit(limit)
      .offset(offset);
  }

  /**
   * Обновляет данные расписания класса
   * @param id ID расписания класса
   * @param scheduleData Данные для обновления
   * @returns Обновленное расписание класса или null, если не найдено
   */
  async update(id: string, scheduleData: Partial<NewClassSchedule>): Promise<ClassSchedule | null> {
    const [updatedSchedule] = await this.db
      .update(classSchedules)
      .set(scheduleData)
      .where(eq(classSchedules.id, id))
      .returning();

    return updatedSchedule || null;
  }

  /**
   * Обновляет статус расписания класса
   * @param id ID расписания класса
   * @param status Новый статус
   * @returns Обновленное расписание класса или null, если не найдено
   */
  async updateStatus(
    id: string,
    status: "scheduled" | "cancelled" | "completed" | "draft"
  ): Promise<ClassSchedule | null> {
    return await this.update(id, { status });
  }

  /**
   * Обновляет количество текущих участников
   * @param id ID расписания класса
   * @param currentParticipants Новое количество участников
   * @returns Обновленное расписание класса или null, если не найдено
   */
  async updateCurrentParticipants(id: string, currentParticipants: number): Promise<ClassSchedule | null> {
    return await this.update(id, { currentParticipants });
  }

  /**
   * Увеличивает количество текущих участников на 1
   * @param id ID расписания класса
   * @returns Обновленное расписание класса или null, если не найдено
   */
  async incrementParticipants(id: string): Promise<ClassSchedule | null> {
    const [updatedSchedule] = await this.db
      .update(classSchedules)
      .set({
        currentParticipants: sql`${classSchedules.currentParticipants} + 1`
      })
      .where(eq(classSchedules.id, id))
      .returning();

    return updatedSchedule || null;
  }

  /**
   * Уменьшает количество текущих участников на 1
   * @param id ID расписания класса
   * @returns Обновленное расписание класса или null, если не найдено
   */
  async decrementParticipants(id: string): Promise<ClassSchedule | null> {
    const [updatedSchedule] = await this.db
      .update(classSchedules)
      .set({
        currentParticipants: sql`GREATEST(${classSchedules.currentParticipants} - 1, 0)`
      })
      .where(eq(classSchedules.id, id))
      .returning();

    return updatedSchedule || null;
  }

  /**
   * Удаляет расписание класса
   * @param id ID расписания класса
   * @returns true, если расписание класса успешно удалено, иначе false
   */
  async delete(id: string): Promise<boolean> {
    const [deletedSchedule] = await this.db
      .delete(classSchedules)
      .where(eq(classSchedules.id, id))
      .returning();

    return !!deletedSchedule;
  }

  /**
   * Проверяет конфликт времени для корта
   * @param courtId ID корта
   * @param startTime Время начала
   * @param endTime Время окончания
   * @param excludeScheduleId ID расписания для исключения (при обновлении)
   * @returns true, если есть конфликт времени
   */
  async hasTimeConflict(
    courtId: string,
    startTime: Date,
    endTime: Date,
    excludeScheduleId?: string
  ): Promise<boolean> {
    const conditions = [
      eq(classSchedules.courtId, courtId),
      eq(classSchedules.status, "scheduled"),
      // Проверяем пересечение временных интервалов
      sql`(${classSchedules.startTime} < ${endTime} AND ${classSchedules.endTime} > ${startTime})`
    ];

    if (excludeScheduleId) {
      conditions.push(sql`${classSchedules.id} != ${excludeScheduleId}`);
    }

    const result = await this.db
      .select()
      .from(classSchedules)
      .where(and(...conditions));

    return result.length > 0;
  }

  /**
   * Получает статистику по расписаниям классов
   * @param venueId ID площадки (опционально)
   * @returns Объект со статистикой
   */
  async getStats(venueId?: string): Promise<{
    totalSchedules: number;
    scheduledCount: number;
    completedCount: number;
    cancelledCount: number;
    draftCount: number;
    totalParticipants: number;
    averageParticipants: string;
    utilizationRate: string; // Процент заполненности
  }> {
    const conditions = [];
    if (venueId) {
      conditions.push(eq(classSchedules.venueId, venueId));
    }

    const allSchedules = await this.db
      .select()
      .from(classSchedules)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const totalSchedules = allSchedules.length;
    const scheduledCount = allSchedules.filter(s => s.status === "scheduled").length;
    const completedCount = allSchedules.filter(s => s.status === "completed").length;
    const cancelledCount = allSchedules.filter(s => s.status === "cancelled").length;
    const draftCount = allSchedules.filter(s => s.status === "draft").length;

    const totalParticipants = allSchedules.reduce((sum, s) => sum + s.currentParticipants, 0);
    const totalCapacity = allSchedules.reduce((sum, s) => sum + s.maxParticipants, 0);

    const averageParticipants = totalSchedules > 0
      ? (totalParticipants / totalSchedules).toFixed(2)
      : "0.00";

    const utilizationRate = totalCapacity > 0
      ? ((totalParticipants / totalCapacity) * 100).toFixed(2)
      : "0.00";

    return {
      totalSchedules,
      scheduledCount,
      completedCount,
      cancelledCount,
      draftCount,
      totalParticipants,
      averageParticipants,
      utilizationRate,
    };
  }

  /**
   * Получает расписания классов для инструктора на определенную дату
   * @param instructorId ID инструктора
   * @param date Дата
   * @returns Массив расписаний классов
   */
  async getInstructorScheduleForDate(instructorId: string, date: Date): Promise<ClassSchedule[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await this.db
      .select()
      .from(classSchedules)
      .where(and(
        eq(classSchedules.instructorId, instructorId),
        gte(classSchedules.startTime, startOfDay),
        lte(classSchedules.startTime, endOfDay)
      ))
      .orderBy(asc(classSchedules.startTime));
  }

  /**
   * Получает расписания классов для корта на определенную дату
   * @param courtId ID корта
   * @param date Дата
   * @returns Массив расписаний классов
   */
  async getCourtScheduleForDate(courtId: string, date: Date): Promise<ClassSchedule[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await this.db
      .select()
      .from(classSchedules)
      .where(and(
        eq(classSchedules.courtId, courtId),
        gte(classSchedules.startTime, startOfDay),
        lte(classSchedules.startTime, endOfDay)
      ))
      .orderBy(asc(classSchedules.startTime));
  }

  /**
   * Получает предстоящие расписания классов
   * @param limit Лимит записей (по умолчанию 50)
   * @param venueId ID площадки (опционально)
   * @returns Массив предстоящих расписаний классов
   */
  async getUpcoming(limit: number = 50, venueId?: string): Promise<ClassSchedule[]> {
    const now = new Date();
    const conditions = [
      eq(classSchedules.status, "scheduled"),
      gte(classSchedules.startTime, now)
    ];

    if (venueId) {
      conditions.push(eq(classSchedules.venueId, venueId));
    }

    return await this.db
      .select()
      .from(classSchedules)
      .where(and(...conditions))
      .orderBy(asc(classSchedules.startTime))
      .limit(limit);
  }

  /**
   * Получает прошедшие расписания классов
   * @param limit Лимит записей (по умолчанию 50)
   * @param venueId ID площадки (опционально)
   * @returns Массив прошедших расписаний классов
   */
  async getPast(limit: number = 50, venueId?: string): Promise<ClassSchedule[]> {
    const now = new Date();
    const conditions = [
      lte(classSchedules.endTime, now)
    ];

    if (venueId) {
      conditions.push(eq(classSchedules.venueId, venueId));
    }

    return await this.db
      .select()
      .from(classSchedules)
      .where(and(...conditions))
      .orderBy(desc(classSchedules.startTime))
      .limit(limit);
  }
}
