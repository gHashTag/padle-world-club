/**
 * Репозиторий для работы с моделью Court
 * Содержит методы CRUD для работы с кортами
 */

import { eq, and, gte, lte } from "drizzle-orm";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "../db/schema";
import { Court, NewCourt, courts } from "../db/schema";

export class CourtRepository {
  private db: PostgresJsDatabase<typeof schema>;

  constructor(db: PostgresJsDatabase<typeof schema>) {
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
}
