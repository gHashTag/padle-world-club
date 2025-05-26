/**
 * Репозиторий для работы с моделью UserTrainingPackage
 * Содержит методы CRUD для работы с пакетами тренировок пользователей
 */

import { eq, and, desc, sql, gte, lte, lt } from "drizzle-orm";


import { UserTrainingPackage, NewUserTrainingPackage, userTrainingPackages } from "../db/schema";
import { DatabaseType } from "./types";

export class UserTrainingPackageRepository {
  private db: DatabaseType;

  constructor(db: DatabaseType) {
    this.db = db;
  }

  /**
   * Создает новый пакет тренировок пользователя
   * @param packageData Данные пакета тренировок пользователя
   * @returns Созданный пакет тренировок пользователя
   */
  async create(packageData: NewUserTrainingPackage): Promise<UserTrainingPackage> {
    const [userPackage] = await this.db.insert(userTrainingPackages).values(packageData).returning();
    return userPackage;
  }

  /**
   * Получает пакет тренировок пользователя по ID
   * @param id ID пакета тренировок пользователя
   * @returns Пакет тренировок пользователя или null, если не найден
   */
  async getById(id: string): Promise<UserTrainingPackage | null> {
    const result = await this.db
      .select()
      .from(userTrainingPackages)
      .where(eq(userTrainingPackages.id, id));

    return result.length > 0 ? result[0] : null;
  }

  /**
   * Получает пакеты тренировок пользователя по ID пользователя
   * @param userId ID пользователя
   * @param statusFilter Фильтр по статусу (опционально)
   * @returns Массив пакетов тренировок пользователя
   */
  async getByUser(
    userId: string,
    statusFilter?: "active" | "expired" | "completed" | "cancelled"
  ): Promise<UserTrainingPackage[]> {
    const conditions = [eq(userTrainingPackages.userId, userId)];

    if (statusFilter) {
      conditions.push(eq(userTrainingPackages.status, statusFilter));
    }

    return await this.db
      .select()
      .from(userTrainingPackages)
      .where(and(...conditions))
      .orderBy(desc(userTrainingPackages.createdAt));
  }

  /**
   * Получает пакеты тренировок по определению пакета
   * @param packageDefinitionId ID определения пакета тренировок
   * @param statusFilter Фильтр по статусу (опционально)
   * @returns Массив пакетов тренировок пользователей
   */
  async getByPackageDefinition(
    packageDefinitionId: string,
    statusFilter?: "active" | "expired" | "completed" | "cancelled"
  ): Promise<UserTrainingPackage[]> {
    const conditions = [eq(userTrainingPackages.packageDefinitionId, packageDefinitionId)];

    if (statusFilter) {
      conditions.push(eq(userTrainingPackages.status, statusFilter));
    }

    return await this.db
      .select()
      .from(userTrainingPackages)
      .where(and(...conditions))
      .orderBy(desc(userTrainingPackages.createdAt));
  }

  /**
   * Получает пакеты тренировок по статусу
   * @param status Статус пакета тренировок
   * @returns Массив пакетов тренировок пользователей
   */
  async getByStatus(status: "active" | "expired" | "completed" | "cancelled"): Promise<UserTrainingPackage[]> {
    return await this.db
      .select()
      .from(userTrainingPackages)
      .where(eq(userTrainingPackages.status, status))
      .orderBy(desc(userTrainingPackages.createdAt));
  }

  /**
   * Получает активные пакеты тренировок пользователя
   * @param userId ID пользователя
   * @returns Массив активных пакетов тренировок
   */
  async getActiveByUser(userId: string): Promise<UserTrainingPackage[]> {
    return await this.getByUser(userId, "active");
  }

  /**
   * Получает пакеты тренировок с истекающим сроком действия
   * @param daysUntilExpiration Количество дней до истечения (по умолчанию 7)
   * @returns Массив пакетов тренировок с истекающим сроком
   */
  async getExpiringSoon(daysUntilExpiration: number = 7): Promise<UserTrainingPackage[]> {
    const now = new Date();
    const expirationThreshold = new Date();
    expirationThreshold.setDate(now.getDate() + daysUntilExpiration);

    return await this.db
      .select()
      .from(userTrainingPackages)
      .where(and(
        eq(userTrainingPackages.status, "active"),
        gte(userTrainingPackages.expirationDate, now),
        lte(userTrainingPackages.expirationDate, expirationThreshold)
      ))
      .orderBy(userTrainingPackages.expirationDate);
  }

  /**
   * Получает просроченные пакеты тренировок
   * @returns Массив просроченных пакетов тренировок
   */
  async getExpired(): Promise<UserTrainingPackage[]> {
    const now = new Date();

    return await this.db
      .select()
      .from(userTrainingPackages)
      .where(and(
        eq(userTrainingPackages.status, "active"),
        lt(userTrainingPackages.expirationDate, now)
      ))
      .orderBy(desc(userTrainingPackages.expirationDate));
  }

  /**
   * Получает пакеты тренировок по диапазону дат покупки
   * @param startDate Начальная дата
   * @param endDate Конечная дата
   * @returns Массив пакетов тренировок
   */
  async getByPurchaseDateRange(startDate: Date, endDate: Date): Promise<UserTrainingPackage[]> {
    return await this.db
      .select()
      .from(userTrainingPackages)
      .where(and(
        gte(userTrainingPackages.purchaseDate, startDate),
        lte(userTrainingPackages.purchaseDate, endDate)
      ))
      .orderBy(desc(userTrainingPackages.purchaseDate));
  }

  /**
   * Получает пакеты тренировок с доступными сессиями
   * @param userId ID пользователя (опционально)
   * @returns Массив пакетов тренировок с доступными сессиями
   */
  async getWithAvailableSessions(userId?: string): Promise<UserTrainingPackage[]> {
    const conditions = [
      eq(userTrainingPackages.status, "active"),
      sql`${userTrainingPackages.sessionsUsed} < ${userTrainingPackages.sessionsTotal}`
    ];

    if (userId) {
      conditions.push(eq(userTrainingPackages.userId, userId));
    }

    return await this.db
      .select()
      .from(userTrainingPackages)
      .where(and(...conditions))
      .orderBy(userTrainingPackages.expirationDate);
  }

  /**
   * Получает все пакеты тренировок пользователей
   * @param limit Лимит записей (по умолчанию 100)
   * @param offset Смещение (по умолчанию 0)
   * @returns Массив пакетов тренировок пользователей
   */
  async getAll(limit: number = 100, offset: number = 0): Promise<UserTrainingPackage[]> {
    return await this.db
      .select()
      .from(userTrainingPackages)
      .orderBy(desc(userTrainingPackages.createdAt))
      .limit(limit)
      .offset(offset);
  }

  /**
   * Обновляет данные пакета тренировок пользователя
   * @param id ID пакета тренировок пользователя
   * @param packageData Данные для обновления
   * @returns Обновленный пакет тренировок пользователя или null, если не найден
   */
  async update(id: string, packageData: Partial<NewUserTrainingPackage>): Promise<UserTrainingPackage | null> {
    const [updatedPackage] = await this.db
      .update(userTrainingPackages)
      .set(packageData)
      .where(eq(userTrainingPackages.id, id))
      .returning();

    return updatedPackage || null;
  }

  /**
   * Обновляет статус пакета тренировок пользователя
   * @param id ID пакета тренировок пользователя
   * @param status Новый статус
   * @returns Обновленный пакет тренировок пользователя или null, если не найден
   */
  async updateStatus(
    id: string,
    status: "active" | "expired" | "completed" | "cancelled"
  ): Promise<UserTrainingPackage | null> {
    return await this.update(id, { status });
  }

  /**
   * Использует сессию из пакета тренировок
   * @param id ID пакета тренировок пользователя
   * @returns Обновленный пакет тренировок пользователя или null, если не найден или нет доступных сессий
   */
  async useSession(id: string): Promise<UserTrainingPackage | null> {
    const userPackage = await this.getById(id);

    if (!userPackage || userPackage.sessionsUsed >= userPackage.sessionsTotal) {
      return null;
    }

    const newSessionsUsed = userPackage.sessionsUsed + 1;
    const newStatus = newSessionsUsed >= userPackage.sessionsTotal ? "completed" : userPackage.status;

    return await this.update(id, {
      sessionsUsed: newSessionsUsed,
      status: newStatus
    });
  }

  /**
   * Возвращает сессию в пакет тренировок (отмена использования)
   * @param id ID пакета тренировок пользователя
   * @returns Обновленный пакет тренировок пользователя или null, если не найден или нет использованных сессий
   */
  async returnSession(id: string): Promise<UserTrainingPackage | null> {
    const userPackage = await this.getById(id);

    if (!userPackage || userPackage.sessionsUsed <= 0) {
      return null;
    }

    const newSessionsUsed = userPackage.sessionsUsed - 1;
    const newStatus = userPackage.status === "completed" ? "active" : userPackage.status;

    return await this.update(id, {
      sessionsUsed: newSessionsUsed,
      status: newStatus
    });
  }

  /**
   * Удаляет пакет тренировок пользователя
   * @param id ID пакета тренировок пользователя
   * @returns true, если пакет тренировок пользователя успешно удален, иначе false
   */
  async delete(id: string): Promise<boolean> {
    const [deletedPackage] = await this.db
      .delete(userTrainingPackages)
      .where(eq(userTrainingPackages.id, id))
      .returning();

    return !!deletedPackage;
  }

  /**
   * Получает количество пакетов тренировок пользователей
   * @param statusFilter Фильтр по статусу (опционально)
   * @returns Количество пакетов тренировок пользователей
   */
  async getCount(statusFilter?: "active" | "expired" | "completed" | "cancelled"): Promise<number> {
    const conditions = [];

    if (statusFilter) {
      conditions.push(eq(userTrainingPackages.status, statusFilter));
    }

    const result = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(userTrainingPackages)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return Number(result[0]?.count) || 0;
  }

  /**
   * Получает статистику по пакетам тренировок пользователей
   * @param userId ID пользователя (опционально, для статистики конкретного пользователя)
   * @returns Объект со статистикой
   */
  async getStats(userId?: string): Promise<{
    totalPackages: number;
    activePackages: number;
    expiredPackages: number;
    completedPackages: number;
    cancelledPackages: number;
    totalSessionsUsed: number;
    totalSessionsAvailable: number;
    averageUsageRate: string;
    packagesExpiringSoon: number;
  }> {
    const conditions = [];
    if (userId) {
      conditions.push(eq(userTrainingPackages.userId, userId));
    }

    const allPackages = await this.db
      .select()
      .from(userTrainingPackages)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    const totalPackages = allPackages.length;
    const activePackages = allPackages.filter(p => p.status === "active").length;
    const expiredPackages = allPackages.filter(p => p.status === "expired").length;
    const completedPackages = allPackages.filter(p => p.status === "completed").length;
    const cancelledPackages = allPackages.filter(p => p.status === "cancelled").length;

    const totalSessionsUsed = allPackages.reduce((sum, p) => sum + p.sessionsUsed, 0);
    const totalSessionsAvailable = allPackages.reduce((sum, p) => sum + p.sessionsTotal, 0);

    const averageUsageRate = totalSessionsAvailable > 0
      ? ((totalSessionsUsed / totalSessionsAvailable) * 100).toFixed(2)
      : "0.00";

    // Пакеты, истекающие в течение 7 дней
    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(now.getDate() + 7);

    const packagesExpiringSoon = allPackages.filter(p =>
      p.status === "active" &&
      p.expirationDate >= now &&
      p.expirationDate <= sevenDaysFromNow
    ).length;

    return {
      totalPackages,
      activePackages,
      expiredPackages,
      completedPackages,
      cancelledPackages,
      totalSessionsUsed,
      totalSessionsAvailable,
      averageUsageRate,
      packagesExpiringSoon,
    };
  }

  /**
   * Массово обновляет статус просроченных пакетов
   * @returns Количество обновленных пакетов
   */
  async markExpiredPackages(): Promise<number> {
    const now = new Date();

    const updatedPackages = await this.db
      .update(userTrainingPackages)
      .set({ status: "expired" })
      .where(and(
        eq(userTrainingPackages.status, "active"),
        lt(userTrainingPackages.expirationDate, now)
      ))
      .returning();

    return updatedPackages.length;
  }

  /**
   * Получает пакеты тренировок пользователя с оставшимися сессиями
   * @param userId ID пользователя
   * @returns Массив пакетов с информацией об оставшихся сессиях
   */
  async getUserPackagesWithRemainingSessions(userId: string): Promise<Array<UserTrainingPackage & { remainingSessions: number }>> {
    const packages = await this.getWithAvailableSessions(userId);

    return packages.map(pkg => ({
      ...pkg,
      remainingSessions: pkg.sessionsTotal - pkg.sessionsUsed
    }));
  }

  /**
   * Проверяет, может ли пользователь использовать пакет для тренировки
   * @param userId ID пользователя
   * @param packageDefinitionId ID определения пакета (опционально)
   * @returns Пакет тренировок, который можно использовать, или null
   */
  async findUsablePackageForUser(userId: string, packageDefinitionId?: string): Promise<UserTrainingPackage | null> {
    const conditions = [
      eq(userTrainingPackages.userId, userId),
      eq(userTrainingPackages.status, "active"),
      sql`${userTrainingPackages.sessionsUsed} < ${userTrainingPackages.sessionsTotal}`,
      gte(userTrainingPackages.expirationDate, new Date())
    ];

    if (packageDefinitionId) {
      conditions.push(eq(userTrainingPackages.packageDefinitionId, packageDefinitionId));
    }

    const result = await this.db
      .select()
      .from(userTrainingPackages)
      .where(and(...conditions))
      .orderBy(userTrainingPackages.expirationDate) // Используем пакеты, которые скоро истекают, в первую очередь
      .limit(1);

    return result.length > 0 ? result[0] : null;
  }

  /**
   * Получает историю использования пакетов пользователя
   * @param userId ID пользователя
   * @param limit Лимит записей (по умолчанию 50)
   * @returns Массив пакетов тренировок пользователя, отсортированный по дате покупки
   */
  async getUserPackageHistory(userId: string, limit: number = 50): Promise<UserTrainingPackage[]> {
    return await this.db
      .select()
      .from(userTrainingPackages)
      .where(eq(userTrainingPackages.userId, userId))
      .orderBy(desc(userTrainingPackages.purchaseDate))
      .limit(limit);
  }

  /**
   * Получает самые популярные определения пакетов (по количеству покупок)
   * @param limit Лимит записей (по умолчанию 10)
   * @returns Массив с ID определений пакетов и количеством покупок
   */
  async getMostPopularPackageDefinitions(limit: number = 10): Promise<Array<{ packageDefinitionId: string; purchaseCount: number }>> {
    const result = await this.db
      .select({
        packageDefinitionId: userTrainingPackages.packageDefinitionId,
        purchaseCount: sql<number>`count(*)::int`
      })
      .from(userTrainingPackages)
      .groupBy(userTrainingPackages.packageDefinitionId)
      .orderBy(desc(sql`count(*)`))
      .limit(limit);

    return result.map(row => ({
      packageDefinitionId: row.packageDefinitionId,
      purchaseCount: Number(row.purchaseCount)
    }));
  }

  /**
   * Получает пакеты тренировок по диапазону использованных сессий
   * @param minUsed Минимальное количество использованных сессий
   * @param maxUsed Максимальное количество использованных сессий (опционально)
   * @returns Массив пакетов тренировок
   */
  async getBySessionsUsedRange(minUsed: number, maxUsed?: number): Promise<UserTrainingPackage[]> {
    const conditions = [gte(userTrainingPackages.sessionsUsed, minUsed)];

    if (maxUsed !== undefined) {
      conditions.push(lte(userTrainingPackages.sessionsUsed, maxUsed));
    }

    return await this.db
      .select()
      .from(userTrainingPackages)
      .where(and(...conditions))
      .orderBy(desc(userTrainingPackages.sessionsUsed));
  }

  /**
   * Отменяет пакет тренировок (устанавливает статус "cancelled")
   * @param id ID пакета тренировок пользователя
   * @returns Обновленный пакет тренировок пользователя или null, если не найден
   */
  async cancel(id: string): Promise<UserTrainingPackage | null> {
    return await this.updateStatus(id, "cancelled");
  }

  /**
   * Активирует пакет тренировок (устанавливает статус "active")
   * @param id ID пакета тренировок пользователя
   * @returns Обновленный пакет тренировок пользователя или null, если не найден
   */
  async activate(id: string): Promise<UserTrainingPackage | null> {
    return await this.updateStatus(id, "active");
  }
}
