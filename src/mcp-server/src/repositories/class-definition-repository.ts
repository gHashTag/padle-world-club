/**
 * Репозиторий для работы с моделью ClassDefinition
 * Содержит методы CRUD для работы с определениями классов/тренировок
 */

import { eq, and, gte, lte, desc, ilike, ne } from "drizzle-orm";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "../db/schema";
import { ClassDefinition, NewClassDefinition, classDefinitions } from "../db/schema";

export class ClassDefinitionRepository {
  private db: PostgresJsDatabase<typeof schema>;

  constructor(db: PostgresJsDatabase<typeof schema>) {
    this.db = db;
  }

  /**
   * Создает новое определение класса
   * @param classData Данные определения класса
   * @returns Созданное определение класса
   */
  async create(classData: NewClassDefinition): Promise<ClassDefinition> {
    const [classDefinition] = await this.db.insert(classDefinitions).values(classData).returning();
    return classDefinition;
  }

  /**
   * Получает определение класса по ID
   * @param id ID определения класса
   * @returns Определение класса или null, если не найдено
   */
  async getById(id: string): Promise<ClassDefinition | null> {
    const result = await this.db
      .select()
      .from(classDefinitions)
      .where(eq(classDefinitions.id, id));

    return result.length > 0 ? result[0] : null;
  }

  /**
   * Получает определения классов по типу
   * @param classType Тип класса
   * @param activeOnly Только активные классы (по умолчанию true)
   * @returns Массив определений классов
   */
  async getByType(
    classType: "group_training" | "open_play_session" | "coached_drill",
    activeOnly: boolean = true
  ): Promise<ClassDefinition[]> {
    const conditions = [eq(classDefinitions.classType, classType)];

    if (activeOnly) {
      conditions.push(eq(classDefinitions.isActive, true));
    }

    return await this.db
      .select()
      .from(classDefinitions)
      .where(and(...conditions))
      .orderBy(desc(classDefinitions.createdAt));
  }

  /**
   * Получает определения классов по диапазону цен
   * @param minPrice Минимальная цена
   * @param maxPrice Максимальная цена
   * @param currency Валюта (опционально)
   * @param activeOnly Только активные классы (по умолчанию true)
   * @returns Массив определений классов
   */
  async getByPriceRange(
    minPrice: string,
    maxPrice: string,
    currency?: string,
    activeOnly: boolean = true
  ): Promise<ClassDefinition[]> {
    const conditions = [
      gte(classDefinitions.basePrice, minPrice),
      lte(classDefinitions.basePrice, maxPrice)
    ];

    if (currency) {
      conditions.push(eq(classDefinitions.currency, currency));
    }

    if (activeOnly) {
      conditions.push(eq(classDefinitions.isActive, true));
    }

    return await this.db
      .select()
      .from(classDefinitions)
      .where(and(...conditions))
      .orderBy(desc(classDefinitions.createdAt));
  }

  /**
   * Получает определения классов по уровню навыков
   * @param skillLevel Уровень навыков
   * @param activeOnly Только активные классы (по умолчанию true)
   * @returns Массив определений классов
   */
  async getBySkillLevel(
    _skillLevel: "beginner" | "intermediate" | "advanced" | "professional",
    activeOnly: boolean = true
  ): Promise<ClassDefinition[]> {
    // TODO: Реализовать логику фильтрации по уровню навыков
    // Класс подходит, если уровень пользователя находится в диапазоне min-max
    // или если ограничения не установлены
    // Для простоты сейчас возвращаем все классы

    const conditions = [];

    if (activeOnly) {
      conditions.push(eq(classDefinitions.isActive, true));
    }

    return await this.db
      .select()
      .from(classDefinitions)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(classDefinitions.createdAt));
  }

  /**
   * Поиск определений классов по названию
   * @param searchTerm Поисковый запрос
   * @param activeOnly Только активные классы (по умолчанию true)
   * @returns Массив определений классов
   */
  async searchByName(searchTerm: string, activeOnly: boolean = true): Promise<ClassDefinition[]> {
    const conditions = [ilike(classDefinitions.name, `%${searchTerm}%`)];

    if (activeOnly) {
      conditions.push(eq(classDefinitions.isActive, true));
    }

    return await this.db
      .select()
      .from(classDefinitions)
      .where(and(...conditions))
      .orderBy(desc(classDefinitions.createdAt));
  }

  /**
   * Получает все определения классов
   * @param activeOnly Только активные классы (по умолчанию true)
   * @returns Массив определений классов
   */
  async getAll(activeOnly: boolean = true): Promise<ClassDefinition[]> {
    const whereCondition = activeOnly ? eq(classDefinitions.isActive, true) : undefined;

    return await this.db
      .select()
      .from(classDefinitions)
      .where(whereCondition)
      .orderBy(desc(classDefinitions.createdAt));
  }

  /**
   * Получает активные определения классов
   * @returns Массив активных определений классов
   */
  async getActive(): Promise<ClassDefinition[]> {
    return await this.getAll(true);
  }

  /**
   * Получает неактивные определения классов
   * @returns Массив неактивных определений классов
   */
  async getInactive(): Promise<ClassDefinition[]> {
    return await this.db
      .select()
      .from(classDefinitions)
      .where(eq(classDefinitions.isActive, false))
      .orderBy(desc(classDefinitions.createdAt));
  }

  /**
   * Обновляет данные определения класса
   * @param id ID определения класса
   * @param classData Данные для обновления
   * @returns Обновленное определение класса или null, если не найдено
   */
  async update(id: string, classData: Partial<NewClassDefinition>): Promise<ClassDefinition | null> {
    const [updatedClass] = await this.db
      .update(classDefinitions)
      .set(classData)
      .where(eq(classDefinitions.id, id))
      .returning();

    return updatedClass || null;
  }

  /**
   * Активирует определение класса
   * @param id ID определения класса
   * @returns Обновленное определение класса или null, если не найдено
   */
  async activate(id: string): Promise<ClassDefinition | null> {
    return await this.update(id, { isActive: true });
  }

  /**
   * Деактивирует определение класса
   * @param id ID определения класса
   * @returns Обновленное определение класса или null, если не найдено
   */
  async deactivate(id: string): Promise<ClassDefinition | null> {
    return await this.update(id, { isActive: false });
  }

  /**
   * Обновляет цену определения класса
   * @param id ID определения класса
   * @param newPrice Новая цена
   * @returns Обновленное определение класса или null, если не найдено
   */
  async updatePrice(id: string, newPrice: string): Promise<ClassDefinition | null> {
    return await this.update(id, { basePrice: newPrice });
  }

  /**
   * Удаляет определение класса
   * @param id ID определения класса
   * @returns true, если определение класса успешно удалено, иначе false
   */
  async delete(id: string): Promise<boolean> {
    const [deletedClass] = await this.db
      .delete(classDefinitions)
      .where(eq(classDefinitions.id, id))
      .returning();

    return !!deletedClass;
  }

  /**
   * Получает статистику по определениям классов
   * @returns Объект со статистикой
   */
  async getStats(): Promise<{
    totalClasses: number;
    activeClasses: number;
    inactiveClasses: number;
    classesByType: Record<string, number>;
    averagePrice: string;
  }> {
    const allClasses = await this.getAll(false);

    const totalClasses = allClasses.length;
    const activeClasses = allClasses.filter(c => c.isActive).length;
    const inactiveClasses = totalClasses - activeClasses;

    const classesByType = allClasses.reduce((acc, classItem) => {
      acc[classItem.classType] = (acc[classItem.classType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalPrice = allClasses
      .filter(c => c.isActive)
      .reduce((sum, c) => sum + parseFloat(c.basePrice), 0);
    const averagePrice = activeClasses > 0 ? (totalPrice / activeClasses).toFixed(2) : "0.00";

    return {
      totalClasses,
      activeClasses,
      inactiveClasses,
      classesByType,
      averagePrice,
    };
  }

  /**
   * Проверяет, существует ли определение класса с таким названием
   * @param name Название класса
   * @param excludeId ID для исключения из проверки (для обновления)
   * @returns true, если название уже существует
   */
  async isNameExists(name: string, excludeId?: string): Promise<boolean> {
    const conditions = [eq(classDefinitions.name, name)];

    if (excludeId) {
      conditions.push(ne(classDefinitions.id, excludeId));
    }

    const result = await this.db
      .select()
      .from(classDefinitions)
      .where(and(...conditions));

    return result.length > 0;
  }
}
