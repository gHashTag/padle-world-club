/**
 * Репозиторий для работы с моделью Court
 * Содержит методы CRUD для работы с кортами
 */

import { eq, and, gte, lte } from "drizzle-orm";


import { Court, NewCourt, courts } from "../db/schema";
import { DatabaseType } from "./types";

export class CourtRepository {
  private db: DatabaseType;

  constructor(db: DatabaseType) {
    this.db = db;
  }

  /**
   * Создает новый корт
   * @param courtData Данные корта
   * @returns Созданный корт
   */
  async create(courtData: NewCourt): Promise<Court> {
    const [court] = await this.db.insert(courts).values(courtData).returning();
    return court;
  }

  /**
   * Получает корт по ID
   * @param id ID корта
   * @returns Корт или null, если не найден
   */
  async getById(id: string): Promise<Court | null> {
    const result = await this.db
      .select()
      .from(courts)
      .where(eq(courts.id, id));

    return result.length > 0 ? result[0] : null;
  }

  /**
   * Получает все корты
   * @param activeOnly Если true, возвращает только активные корты
   * @returns Массив кортов
   */
  async getAll(activeOnly: boolean = false): Promise<Court[]> {
    if (activeOnly) {
      return await this.db
        .select()
        .from(courts)
        .where(eq(courts.isActive, true));
    }

    return await this.db.select().from(courts);
  }

  /**
   * Получает все корты для определенного клуба
   * @param venueId ID клуба
   * @param activeOnly Если true, возвращает только активные корты
   * @returns Массив кортов
   */
  async getByVenueId(venueId: string, activeOnly: boolean = false): Promise<Court[]> {
    const conditions = [eq(courts.venueId, venueId)];

    if (activeOnly) {
      conditions.push(eq(courts.isActive, true));
    }

    return await this.db
      .select()
      .from(courts)
      .where(and(...conditions));
  }

  /**
   * Алиас для getByVenueId для совместимости с API handlers
   */
  async findByVenueId(venueId: string): Promise<Court[]> {
    return this.getByVenueId(venueId, true); // Возвращаем только активные корты
  }

  /**
   * Получает корты по типу
   * @param courtType Тип корта ('paddle' | 'tennis')
   * @param activeOnly Если true, возвращает только активные корты
   * @returns Массив кортов
   */
  async getByType(courtType: "paddle" | "tennis", activeOnly: boolean = false): Promise<Court[]> {
    const conditions = [eq(courts.courtType, courtType)];

    if (activeOnly) {
      conditions.push(eq(courts.isActive, true));
    }

    return await this.db
      .select()
      .from(courts)
      .where(and(...conditions));
  }

  /**
   * Получает корты по типу для определенного клуба
   * @param venueId ID клуба
   * @param courtType Тип корта ('paddle' | 'tennis')
   * @param activeOnly Если true, возвращает только активные корты
   * @returns Массив кортов
   */
  async getByVenueAndType(
    venueId: string,
    courtType: "paddle" | "tennis",
    activeOnly: boolean = false
  ): Promise<Court[]> {
    const conditions = [
      eq(courts.venueId, venueId),
      eq(courts.courtType, courtType)
    ];

    if (activeOnly) {
      conditions.push(eq(courts.isActive, true));
    }

    return await this.db
      .select()
      .from(courts)
      .where(and(...conditions));
  }

  /**
   * Получает корты в определенном ценовом диапазоне
   * @param minRate Минимальная почасовая ставка
   * @param maxRate Максимальная почасовая ставка
   * @param activeOnly Если true, возвращает только активные корты
   * @returns Массив кортов
   */
  async getByPriceRange(
    minRate: number,
    maxRate: number,
    activeOnly: boolean = false
  ): Promise<Court[]> {
    const conditions = [
      gte(courts.hourlyRate, minRate.toString()),
      lte(courts.hourlyRate, maxRate.toString())
    ];

    if (activeOnly) {
      conditions.push(eq(courts.isActive, true));
    }

    return await this.db
      .select()
      .from(courts)
      .where(and(...conditions));
  }

  /**
   * Обновляет данные корта
   * @param id ID корта
   * @param courtData Данные для обновления
   * @returns Обновленный корт или null, если не найден
   */
  async update(id: string, courtData: Partial<NewCourt>): Promise<Court | null> {
    const [updatedCourt] = await this.db
      .update(courts)
      .set(courtData)
      .where(eq(courts.id, id))
      .returning();

    return updatedCourt || null;
  }

  /**
   * Деактивирует корт (мягкое удаление)
   * @param id ID корта
   * @returns true, если корт успешно деактивирован, иначе false
   */
  async deactivate(id: string): Promise<boolean> {
    const [deactivatedCourt] = await this.db
      .update(courts)
      .set({ isActive: false })
      .where(eq(courts.id, id))
      .returning();

    return !!deactivatedCourt;
  }

  /**
   * Активирует корт
   * @param id ID корта
   * @returns true, если корт успешно активирован, иначе false
   */
  async activate(id: string): Promise<boolean> {
    const [activatedCourt] = await this.db
      .update(courts)
      .set({ isActive: true })
      .where(eq(courts.id, id))
      .returning();

    return !!activatedCourt;
  }

  /**
   * Удаляет корт (жесткое удаление)
   * @param id ID корта
   * @returns true, если корт успешно удален, иначе false
   */
  async delete(id: string): Promise<boolean> {
    const [deletedCourt] = await this.db
      .delete(courts)
      .where(eq(courts.id, id))
      .returning();

    return !!deletedCourt;
  }

  /**
   * Получает список кортов с пагинацией и фильтрацией
   * @param options Опции для фильтрации и сортировки
   * @returns Объект с данными и метаинформацией
   */
  async findMany(options: {
    page: number;
    limit: number;
    venueId?: string;
    courtType?: string;
    isActive?: boolean;
    minHourlyRate?: number;
    maxHourlyRate?: number;
    createdAfter?: string;
    createdBefore?: string;
    search?: string;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  }): Promise<{ data: Court[]; total: number; page: number; limit: number }> {
    const { page, limit, venueId, courtType, isActive, minHourlyRate, maxHourlyRate, createdAfter, createdBefore, sortBy, sortOrder: _sortOrder } = options;
    const offset = (page - 1) * limit;

    // Строим условия фильтрации
    const conditions = [];
    if (venueId) {
      conditions.push(eq(courts.venueId, venueId));
    }
    if (courtType) {
      conditions.push(eq(courts.courtType, courtType as any));
    }
    if (isActive !== undefined) {
      conditions.push(eq(courts.isActive, isActive));
    }
    if (minHourlyRate !== undefined) {
      conditions.push(gte(courts.hourlyRate, minHourlyRate.toString()));
    }
    if (maxHourlyRate !== undefined) {
      conditions.push(lte(courts.hourlyRate, maxHourlyRate.toString()));
    }
    if (createdAfter) {
      conditions.push(gte(courts.createdAt, new Date(createdAfter)));
    }
    if (createdBefore) {
      conditions.push(lte(courts.createdAt, new Date(createdBefore)));
    }

    // Получаем общее количество записей
    const totalResult = await this.db
      .select({ count: courts.id })
      .from(courts)
      .where(conditions.length > 0 ? and(...conditions) : undefined);
    const total = totalResult.length;

    // Получаем данные с пагинацией и сортировкой
    const baseQuery = this.db
      .select()
      .from(courts)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    // Добавляем сортировку
    let data;
    if (sortBy === 'name') {
      data = await baseQuery.orderBy(courts.name).limit(limit).offset(offset);
    } else if (sortBy === 'courtType') {
      data = await baseQuery.orderBy(courts.courtType).limit(limit).offset(offset);
    } else if (sortBy === 'hourlyRate') {
      data = await baseQuery.orderBy(courts.hourlyRate).limit(limit).offset(offset);
    } else if (sortBy === 'createdAt') {
      data = await baseQuery.orderBy(courts.createdAt).limit(limit).offset(offset);
    } else if (sortBy === 'updatedAt') {
      data = await baseQuery.orderBy(courts.updatedAt).limit(limit).offset(offset);
    } else {
      // По умолчанию сортируем по имени
      data = await baseQuery.orderBy(courts.name).limit(limit).offset(offset);
    }

    return {
      data,
      total,
      page,
      limit
    };
  }

  /**
   * Получает статистику использования корта
   * @param courtId ID корта
   * @returns Объект со статистикой
   */
  async getCourtStats(_courtId: string): Promise<{
    totalBookings: number;
    upcomingBookings: number;
    completedBookings: number;
    cancelledBookings: number;
    totalRevenue: string;
    averageBookingDuration: number;
    utilizationRate: string;
  }> {
    // Базовая статистика - возвращаем заглушку
    // В реальном проекте здесь были бы сложные запросы к таблице bookings
    return {
      totalBookings: 0,
      upcomingBookings: 0,
      completedBookings: 0,
      cancelledBookings: 0,
      totalRevenue: '0.00',
      averageBookingDuration: 0,
      utilizationRate: '0.00'
    };
  }
}
