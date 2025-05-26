/**
 * Репозиторий для работы с моделью Venue
 * Содержит методы CRUD для работы с клубами/площадками
 */

import { eq, like, and } from "drizzle-orm";
import { Venue, NewVenue, venues } from "../db/schema";
import { DatabaseType } from "./types";

export class VenueRepository {
  private db: DatabaseType;

  constructor(db: DatabaseType) {
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
   * Алиас для getById для совместимости с API handlers
   */
  async findById(id: string): Promise<Venue | null> {
    return this.getById(id);
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

  /**
   * Получает список площадок с пагинацией и фильтрацией
   * @param options Опции для фильтрации и сортировки
   * @returns Объект с данными и метаинформацией
   */
  async findMany(options: {
    page: number;
    limit: number;
    city?: string;
    status?: string;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  }): Promise<{ data: Venue[]; total: number; page: number; limit: number }> {
    const { page, limit, city, status, sortBy, sortOrder: _sortOrder } = options;
    const offset = (page - 1) * limit;

    // Строим условия фильтрации
    const conditions = [];
    if (city) {
      conditions.push(eq(venues.city, city));
    }
    if (status === 'active') {
      conditions.push(eq(venues.isActive, true));
    } else if (status === 'inactive') {
      conditions.push(eq(venues.isActive, false));
    }

    // Получаем общее количество записей
    const totalResult = await this.db
      .select({ count: venues.id })
      .from(venues)
      .where(conditions.length > 0 ? and(...conditions) : undefined);
    const total = totalResult.length;

    // Получаем данные с пагинацией и сортировкой
    const baseQuery = this.db
      .select()
      .from(venues)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    // Добавляем сортировку (пока игнорируем sortOrder, так как Drizzle требует специальной обработки)
    let data;
    if (sortBy === 'name') {
      data = await baseQuery.orderBy(venues.name).limit(limit).offset(offset);
    } else if (sortBy === 'city') {
      data = await baseQuery.orderBy(venues.city).limit(limit).offset(offset);
    } else if (sortBy === 'createdAt') {
      data = await baseQuery.orderBy(venues.createdAt).limit(limit).offset(offset);
    } else if (sortBy === 'updatedAt') {
      data = await baseQuery.orderBy(venues.updatedAt).limit(limit).offset(offset);
    } else {
      // По умолчанию сортируем по имени
      data = await baseQuery.orderBy(venues.name).limit(limit).offset(offset);
    }

    return {
      data,
      total,
      page,
      limit
    };
  }

  /**
   * Поиск площадок по геолокации
   * @param latitude Широта
   * @param longitude Долгота
   * @param radius Радиус поиска в км
   * @returns Массив площадок
   */
  async findByLocation(_latitude: number, _longitude: number, _radius: number): Promise<Venue[]> {
    // Простая реализация - возвращаем все активные площадки
    // В реальном проекте здесь должен быть расчет расстояния
    return await this.getAll(true);
  }

  /**
   * Обновляет статус площадки
   * @param id ID площадки
   * @param status Новый статус
   * @returns Обновленная площадка или null
   */
  async updateStatus(id: string, status: string): Promise<Venue | null> {
    const isActive = status === 'active';
    return await this.update(id, { isActive });
  }
}
