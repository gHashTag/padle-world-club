/**
 * Репозиторий для работы с моделью Venue
 * Содержит методы CRUD для работы с клубами/площадками
 */

import { eq, like, and } from "drizzle-orm";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "../db/schema";
import { Venue, NewVenue, venues } from "../db/schema";

export class VenueRepository {
  private db: PostgresJsDatabase<typeof schema>;

  constructor(db: PostgresJsDatabase<typeof schema>) {
    this.db = db;
  }

  /**
   * Создает новый клуб/площадку
   * @param venueData Данные клуба/площадки
   * @returns Созданный клуб/площадка
   */
  async create(venueData: NewVenue): Promise<Venue> {
    const [venue] = await this.db.insert(venues).values(venueData).returning();
    return venue;
  }

  /**
   * Получает клуб/площадку по ID
   * @param id ID клуба/площадки
   * @returns Клуб/площадка или null, если не найден
   */
  async getById(id: string): Promise<Venue | null> {
    const result = await this.db
      .select()
      .from(venues)
      .where(eq(venues.id, id));
    
    return result.length > 0 ? result[0] : null;
  }

  /**
   * Получает клуб/площадку по названию
   * @param name Название клуба/площадки
   * @returns Клуб/площадка или null, если не найден
   */
  async getByName(name: string): Promise<Venue | null> {
    const result = await this.db
      .select()
      .from(venues)
      .where(eq(venues.name, name));
    
    return result.length > 0 ? result[0] : null;
  }

  /**
   * Получает все клубы/площадки
   * @param activeOnly Если true, возвращает только активные клубы
   * @returns Массив клубов/площадок
   */
  async getAll(activeOnly: boolean = false): Promise<Venue[]> {
    if (activeOnly) {
      return await this.db
        .select()
        .from(venues)
        .where(eq(venues.isActive, true));
    }
    
    return await this.db.select().from(venues);
  }

  /**
   * Поиск клубов/площадок по городу
   * @param city Город
   * @param activeOnly Если true, возвращает только активные клубы
   * @returns Массив клубов/площадок
   */
  async getByCity(city: string, activeOnly: boolean = false): Promise<Venue[]> {
    const conditions = [eq(venues.city, city)];
    
    if (activeOnly) {
      conditions.push(eq(venues.isActive, true));
    }
    
    return await this.db
      .select()
      .from(venues)
      .where(and(...conditions));
  }

  /**
   * Поиск клубов/площадок по стране
   * @param country Страна
   * @param activeOnly Если true, возвращает только активные клубы
   * @returns Массив клубов/площадок
   */
  async getByCountry(country: string, activeOnly: boolean = false): Promise<Venue[]> {
    const conditions = [eq(venues.country, country)];
    
    if (activeOnly) {
      conditions.push(eq(venues.isActive, true));
    }
    
    return await this.db
      .select()
      .from(venues)
      .where(and(...conditions));
  }

  /**
   * Поиск клубов/площадок по названию (частичное совпадение)
   * @param searchTerm Поисковый термин
   * @param activeOnly Если true, возвращает только активные клубы
   * @returns Массив клубов/площадок
   */
  async searchByName(searchTerm: string, activeOnly: boolean = false): Promise<Venue[]> {
    const conditions = [like(venues.name, `%${searchTerm}%`)];
    
    if (activeOnly) {
      conditions.push(eq(venues.isActive, true));
    }
    
    return await this.db
      .select()
      .from(venues)
      .where(and(...conditions));
  }

  /**
   * Обновляет данные клуба/площадки
   * @param id ID клуба/площадки
   * @param venueData Данные для обновления
   * @returns Обновленный клуб/площадка или null, если не найден
   */
  async update(id: string, venueData: Partial<NewVenue>): Promise<Venue | null> {
    const [updatedVenue] = await this.db
      .update(venues)
      .set(venueData)
      .where(eq(venues.id, id))
      .returning();
    
    return updatedVenue || null;
  }

  /**
   * Деактивирует клуб/площадку (мягкое удаление)
   * @param id ID клуба/площадки
   * @returns true, если клуб успешно деактивирован, иначе false
   */
  async deactivate(id: string): Promise<boolean> {
    const [deactivatedVenue] = await this.db
      .update(venues)
      .set({ isActive: false })
      .where(eq(venues.id, id))
      .returning();
    
    return !!deactivatedVenue;
  }

  /**
   * Активирует клуб/площадку
   * @param id ID клуба/площадки
   * @returns true, если клуб успешно активирован, иначе false
   */
  async activate(id: string): Promise<boolean> {
    const [activatedVenue] = await this.db
      .update(venues)
      .set({ isActive: true })
      .where(eq(venues.id, id))
      .returning();
    
    return !!activatedVenue;
  }

  /**
   * Удаляет клуб/площадку (жесткое удаление)
   * @param id ID клуба/площадки
   * @returns true, если клуб успешно удален, иначе false
   */
  async delete(id: string): Promise<boolean> {
    const [deletedVenue] = await this.db
      .delete(venues)
      .where(eq(venues.id, id))
      .returning();
    
    return !!deletedVenue;
  }
}
