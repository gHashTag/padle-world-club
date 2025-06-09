/**
 * Репозиторий для работы с моделью TrainingPackageDefinition
 * Содержит методы CRUD для работы с определениями пакетов тренировок
 */

import { eq, and, desc, sql, like, gte, lte, inArray } from "drizzle-orm";


import { TrainingPackageDefinition, NewTrainingPackageDefinition, trainingPackageDefinitions } from "../db/schema";
import { DatabaseType } from "./types";

export class TrainingPackageDefinitionRepository {
  private db: DatabaseType;

  constructor(db: DatabaseType) {
    this.db = db;
  }

  /**
   * Создает новое определение пакета тренировок
   * @param packageData Данные определения пакета тренировок
   * @returns Созданное определение пакета тренировок
   */
  async create(packageData: NewTrainingPackageDefinition): Promise<TrainingPackageDefinition> {
    const [packageDefinition] = await this.db.insert(trainingPackageDefinitions).values(packageData).returning();
    return packageDefinition;
  }

  /**
   * Получает определение пакета тренировок по ID
   * @param id ID определения пакета тренировок
   * @returns Определение пакета тренировок или null, если не найдено
   */
  async getById(id: string): Promise<TrainingPackageDefinition | null> {
    const result = await this.db
      .select()
      .from(trainingPackageDefinitions)
      .where(eq(trainingPackageDefinitions.id, id));

    return result.length > 0 ? result[0] : null;
  }

  /**
   * Получает определения пакетов тренировок по типу
   * @param packageType Тип пакета тренировок
   * @param activeOnly Только активные пакеты (по умолчанию true)
   * @returns Массив определений пакетов тренировок
   */
  async getByType(
    packageType: "group_training" | "private_training",
    activeOnly: boolean = true
  ): Promise<TrainingPackageDefinition[]> {
    const conditions = [eq(trainingPackageDefinitions.packageType, packageType)];

    if (activeOnly) {
      conditions.push(eq(trainingPackageDefinitions.isActive, true));
    }

    return await this.db
      .select()
      .from(trainingPackageDefinitions)
      .where(and(...conditions))
      .orderBy(desc(trainingPackageDefinitions.createdAt));
  }

  /**
   * Получает активные определения пакетов тренировок
   * @returns Массив активных определений пакетов тренировок
   */
  async getActive(): Promise<TrainingPackageDefinition[]> {
    return await this.db
      .select()
      .from(trainingPackageDefinitions)
      .where(eq(trainingPackageDefinitions.isActive, true))
      .orderBy(desc(trainingPackageDefinitions.createdAt));
  }

  /**
   * Получает определения пакетов тренировок по диапазону цен
   * @param minPrice Минимальная цена
   * @param maxPrice Максимальная цена
   * @param activeOnly Только активные пакеты (по умолчанию true)
   * @returns Массив определений пакетов тренировок
   */
  async getByPriceRange(
    minPrice: number,
    maxPrice: number,
    activeOnly: boolean = true
  ): Promise<TrainingPackageDefinition[]> {
    const conditions = [
      gte(trainingPackageDefinitions.price, minPrice.toString()),
      lte(trainingPackageDefinitions.price, maxPrice.toString())
    ];

    if (activeOnly) {
      conditions.push(eq(trainingPackageDefinitions.isActive, true));
    }

    return await this.db
      .select()
      .from(trainingPackageDefinitions)
      .where(and(...conditions))
      .orderBy(trainingPackageDefinitions.price);
  }

  /**
   * Получает определения пакетов тренировок по количеству сессий
   * @param minSessions Минимальное количество сессий
   * @param maxSessions Максимальное количество сессий (опционально)
   * @param activeOnly Только активные пакеты (по умолчанию true)
   * @returns Массив определений пакетов тренировок
   */
  async getBySessions(
    minSessions: number,
    maxSessions?: number,
    activeOnly: boolean = true
  ): Promise<TrainingPackageDefinition[]> {
    const conditions = [gte(trainingPackageDefinitions.numberOfSessions, minSessions)];

    if (maxSessions !== undefined) {
      conditions.push(lte(trainingPackageDefinitions.numberOfSessions, maxSessions));
    }

    if (activeOnly) {
      conditions.push(eq(trainingPackageDefinitions.isActive, true));
    }

    return await this.db
      .select()
      .from(trainingPackageDefinitions)
      .where(and(...conditions))
      .orderBy(trainingPackageDefinitions.numberOfSessions);
  }

  /**
   * Поиск определений пакетов тренировок по названию
   * @param searchTerm Поисковый термин
   * @param activeOnly Только активные пакеты (по умолчанию true)
   * @returns Массив определений пакетов тренировок
   */
  async searchByName(searchTerm: string, activeOnly: boolean = true): Promise<TrainingPackageDefinition[]> {
    const conditions = [like(trainingPackageDefinitions.name, `%${searchTerm}%`)];

    if (activeOnly) {
      conditions.push(eq(trainingPackageDefinitions.isActive, true));
    }

    return await this.db
      .select()
      .from(trainingPackageDefinitions)
      .where(and(...conditions))
      .orderBy(desc(trainingPackageDefinitions.createdAt));
  }

  /**
   * Получает все определения пакетов тренировок
   * @param limit Лимит записей (по умолчанию 100)
   * @param offset Смещение (по умолчанию 0)
   * @param activeOnly Только активные пакеты (по умолчанию false)
   * @returns Массив определений пакетов тренировок
   */
  async getAll(
    limit: number = 100,
    offset: number = 0,
    activeOnly: boolean = false
  ): Promise<TrainingPackageDefinition[]> {
    const conditions = [];

    if (activeOnly) {
      conditions.push(eq(trainingPackageDefinitions.isActive, true));
    }

    return await this.db
      .select()
      .from(trainingPackageDefinitions)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(trainingPackageDefinitions.createdAt))
      .limit(limit)
      .offset(offset);
  }

  /**
   * Обновляет данные определения пакета тренировок
   * @param id ID определения пакета тренировок
   * @param packageData Данные для обновления
   * @returns Обновленное определение пакета тренировок или null, если не найдено
   */
  async update(id: string, packageData: Partial<NewTrainingPackageDefinition>): Promise<TrainingPackageDefinition | null> {
    const [updatedPackage] = await this.db
      .update(trainingPackageDefinitions)
      .set(packageData)
      .where(eq(trainingPackageDefinitions.id, id))
      .returning();

    return updatedPackage || null;
  }

  /**
   * Активирует определение пакета тренировок
   * @param id ID определения пакета тренировок
   * @returns Обновленное определение пакета тренировок или null, если не найдено
   */
  async activate(id: string): Promise<TrainingPackageDefinition | null> {
    return await this.update(id, { isActive: true });
  }

  /**
   * Деактивирует определение пакета тренировок
   * @param id ID определения пакета тренировок
   * @returns Обновленное определение пакета тренировок или null, если не найдено
   */
  async deactivate(id: string): Promise<TrainingPackageDefinition | null> {
    return await this.update(id, { isActive: false });
  }

  /**
   * Обновляет цену определения пакета тренировок
   * @param id ID определения пакета тренировок
   * @param newPrice Новая цена
   * @returns Обновленное определение пакета тренировок или null, если не найдено
   */
  async updatePrice(id: string, newPrice: number): Promise<TrainingPackageDefinition | null> {
    return await this.update(id, { price: newPrice.toString() });
  }

  /**
   * Удаляет определение пакета тренировок
   * @param id ID определения пакета тренировок
   * @returns true, если определение пакета тренировок успешно удалено, иначе false
   */
  async delete(id: string): Promise<boolean> {
    const [deletedPackage] = await this.db
      .delete(trainingPackageDefinitions)
      .where(eq(trainingPackageDefinitions.id, id))
      .returning();

    return !!deletedPackage;
  }

  /**
   * Получает количество определений пакетов тренировок
   * @param activeOnly Только активные пакеты (по умолчанию false)
   * @returns Количество определений пакетов тренировок
   */
  async getCount(activeOnly: boolean = false): Promise<number> {
    const conditions = [];

    if (activeOnly) {
      conditions.push(eq(trainingPackageDefinitions.isActive, true));
    }

    const result = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(trainingPackageDefinitions)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return Number(result[0]?.count) || 0;
  }

  /**
   * Получает статистику по определениям пакетов тренировок
   * @returns Объект со статистикой
   */
  async getStats(): Promise<{
    totalPackages: number;
    activePackages: number;
    inactivePackages: number;
    groupTrainingPackages: number;
    privateTrainingPackages: number;
    averagePrice: string;
    averageSessions: string;
    averageValidityDays: string;
  }> {
    const allPackages = await this.db.select().from(trainingPackageDefinitions);

    const totalPackages = allPackages.length;
    const activePackages = allPackages.filter(p => p.isActive).length;
    const inactivePackages = totalPackages - activePackages;
    const groupTrainingPackages = allPackages.filter(p => p.packageType === "group_training").length;
    const privateTrainingPackages = allPackages.filter(p => p.packageType === "private_training").length;

    const averagePrice = totalPackages > 0
      ? (allPackages.reduce((sum, p) => sum + Number(p.price), 0) / totalPackages).toFixed(2)
      : "0.00";

    const averageSessions = totalPackages > 0
      ? (allPackages.reduce((sum, p) => sum + p.numberOfSessions, 0) / totalPackages).toFixed(1)
      : "0.0";

    const averageValidityDays = totalPackages > 0
      ? (allPackages.reduce((sum, p) => sum + p.validityDurationDays, 0) / totalPackages).toFixed(1)
      : "0.0";

    return {
      totalPackages,
      activePackages,
      inactivePackages,
      groupTrainingPackages,
      privateTrainingPackages,
      averagePrice,
      averageSessions,
      averageValidityDays,
    };
  }

  /**
   * Получает самые популярные пакеты тренировок (по количеству сессий)
   * @param limit Лимит записей (по умолчанию 5)
   * @param activeOnly Только активные пакеты (по умолчанию true)
   * @returns Массив определений пакетов тренировок
   */
  async getMostPopular(limit: number = 5, activeOnly: boolean = true): Promise<TrainingPackageDefinition[]> {
    const conditions = [];

    if (activeOnly) {
      conditions.push(eq(trainingPackageDefinitions.isActive, true));
    }

    return await this.db
      .select()
      .from(trainingPackageDefinitions)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(trainingPackageDefinitions.numberOfSessions))
      .limit(limit);
  }

  /**
   * Получает самые доступные пакеты тренировок (по цене)
   * @param limit Лимит записей (по умолчанию 5)
   * @param activeOnly Только активные пакеты (по умолчанию true)
   * @returns Массив определений пакетов тренировок
   */
  async getMostAffordable(limit: number = 5, activeOnly: boolean = true): Promise<TrainingPackageDefinition[]> {
    const conditions = [];

    if (activeOnly) {
      conditions.push(eq(trainingPackageDefinitions.isActive, true));
    }

    return await this.db
      .select()
      .from(trainingPackageDefinitions)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(trainingPackageDefinitions.price)
      .limit(limit);
  }

  /**
   * Получает пакеты тренировок с самым длительным сроком действия
   * @param limit Лимит записей (по умолчанию 5)
   * @param activeOnly Только активные пакеты (по умолчанию true)
   * @returns Массив определений пакетов тренировок
   */
  async getLongestValidity(limit: number = 5, activeOnly: boolean = true): Promise<TrainingPackageDefinition[]> {
    const conditions = [];

    if (activeOnly) {
      conditions.push(eq(trainingPackageDefinitions.isActive, true));
    }

    return await this.db
      .select()
      .from(trainingPackageDefinitions)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(trainingPackageDefinitions.validityDurationDays))
      .limit(limit);
  }

  /**
   * Массовое обновление статуса активности
   * @param ids Массив ID определений пакетов тренировок
   * @param isActive Новый статус активности
   * @returns Количество обновленных записей
   */
  async bulkUpdateActiveStatus(ids: string[], isActive: boolean): Promise<number> {
    if (ids.length === 0) return 0;

    const updatedPackages = await this.db
      .update(trainingPackageDefinitions)
      .set({ isActive })
      .where(inArray(trainingPackageDefinitions.id, ids))
      .returning();

    return updatedPackages.length;
  }

  /**
   * Проверяет, существует ли пакет тренировок с таким названием
   * @param name Название пакета тренировок
   * @param excludeId ID пакета для исключения из проверки (для обновления)
   * @returns true, если пакет с таким названием существует
   */
  async existsByName(name: string, excludeId?: string): Promise<boolean> {
    const conditions = [eq(trainingPackageDefinitions.name, name)];

    if (excludeId) {
      conditions.push(sql`${trainingPackageDefinitions.id} != ${excludeId}`);
    }

    const result = await this.db
      .select({ id: trainingPackageDefinitions.id })
      .from(trainingPackageDefinitions)
      .where(and(...conditions))
      .limit(1);

    return result.length > 0;
  }

  /**
   * Получает пакеты тренировок по валюте
   * @param currency Код валюты (например, "USD", "EUR")
   * @param activeOnly Только активные пакеты (по умолчанию true)
   * @returns Массив определений пакетов тренировок
   */
  async getByCurrency(currency: string, activeOnly: boolean = true): Promise<TrainingPackageDefinition[]> {
    const conditions = [eq(trainingPackageDefinitions.currency, currency)];

    if (activeOnly) {
      conditions.push(eq(trainingPackageDefinitions.isActive, true));
    }

    return await this.db
      .select()
      .from(trainingPackageDefinitions)
      .where(and(...conditions))
      .orderBy(desc(trainingPackageDefinitions.createdAt));
  }

  /**
   * Получает пакеты тренировок по диапазону срока действия
   * @param minDays Минимальное количество дней
   * @param maxDays Максимальное количество дней (опционально)
   * @param activeOnly Только активные пакеты (по умолчанию true)
   * @returns Массив определений пакетов тренировок
   */
  async getByValidityRange(
    minDays: number,
    maxDays?: number,
    activeOnly: boolean = true
  ): Promise<TrainingPackageDefinition[]> {
    const conditions = [gte(trainingPackageDefinitions.validityDurationDays, minDays)];

    if (maxDays !== undefined) {
      conditions.push(lte(trainingPackageDefinitions.validityDurationDays, maxDays));
    }

    if (activeOnly) {
      conditions.push(eq(trainingPackageDefinitions.isActive, true));
    }

    return await this.db
      .select()
      .from(trainingPackageDefinitions)
      .where(and(...conditions))
      .orderBy(trainingPackageDefinitions.validityDurationDays);
  }
}
