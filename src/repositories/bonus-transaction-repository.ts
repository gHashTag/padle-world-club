import { eq, desc, and, gte, lte, sql, isNotNull, lt } from "drizzle-orm";
import { bonusTransactions, type BonusTransaction, type NewBonusTransaction } from "../db/schema";
import { DatabaseType } from "./types";

export class BonusTransactionRepository {
  private db: DatabaseType;

  constructor(db: DatabaseType) {
    this.db = db;
  }

  /**
   * Создать новую бонусную транзакцию
   */
  async create(data: NewBonusTransaction): Promise<BonusTransaction> {
    const [transaction] = await this.db
      .insert(bonusTransactions)
      .values(data)
      .returning();
    return transaction;
  }

  /**
   * Получить транзакцию по ID
   */
  async findById(id: string): Promise<BonusTransaction | null> {
    const [transaction] = await this.db
      .select()
      .from(bonusTransactions)
      .where(eq(bonusTransactions.id, id));
    return transaction || null;
  }

  /**
   * Получить все транзакции пользователя с пагинацией
   */
  async findByUserId(userId: string, limit = 50, offset = 0): Promise<BonusTransaction[]> {
    return await this.db
      .select()
      .from(bonusTransactions)
      .where(eq(bonusTransactions.userId, userId))
      .orderBy(desc(bonusTransactions.createdAt))
      .limit(limit)
      .offset(offset);
  }

  /**
   * Найти транзакции по типу
   */
  async findByType(type: "earned" | "spent", limit = 50, offset = 0): Promise<BonusTransaction[]> {
    return await this.db
      .select()
      .from(bonusTransactions)
      .where(eq(bonusTransactions.transactionType, type))
      .orderBy(desc(bonusTransactions.createdAt))
      .limit(limit)
      .offset(offset);
  }

  /**
   * Найти транзакции пользователя по типу
   */
  async findByUserIdAndType(
    userId: string,
    type: "earned" | "spent",
    limit = 50,
    offset = 0
  ): Promise<BonusTransaction[]> {
    return await this.db
      .select()
      .from(bonusTransactions)
      .where(
        and(
          eq(bonusTransactions.userId, userId),
          eq(bonusTransactions.transactionType, type)
        )
      )
      .orderBy(desc(bonusTransactions.createdAt))
      .limit(limit)
      .offset(offset);
  }

  /**
   * Найти транзакции за период
   */
  async findByDateRange(
    startDate: Date,
    endDate: Date,
    limit = 50,
    offset = 0
  ): Promise<BonusTransaction[]> {
    return await this.db
      .select()
      .from(bonusTransactions)
      .where(
        and(
          gte(bonusTransactions.createdAt, startDate),
          lte(bonusTransactions.createdAt, endDate)
        )
      )
      .orderBy(desc(bonusTransactions.createdAt))
      .limit(limit)
      .offset(offset);
  }

  /**
   * Получить текущий баланс бонусов пользователя
   */
  async getCurrentBalance(userId: string): Promise<number> {
    const [result] = await this.db
      .select({
        earned: sql<number>`COALESCE(SUM(CASE WHEN ${bonusTransactions.transactionType} = 'earned' THEN ${bonusTransactions.pointsChange} ELSE 0 END), 0)`,
        spent: sql<number>`COALESCE(SUM(CASE WHEN ${bonusTransactions.transactionType} = 'spent' THEN ${bonusTransactions.pointsChange} ELSE 0 END), 0)`,
      })
      .from(bonusTransactions)
      .where(eq(bonusTransactions.userId, userId));

    const earned = Number(result.earned) || 0;
    const spent = Number(result.spent) || 0;
    return earned - spent;
  }

  /**
   * Получить историю баланса пользователя (последние транзакции с балансом)
   */
  async getBalanceHistory(userId: string, limit = 20): Promise<BonusTransaction[]> {
    return await this.db
      .select()
      .from(bonusTransactions)
      .where(eq(bonusTransactions.userId, userId))
      .orderBy(desc(bonusTransactions.createdAt))
      .limit(limit);
  }

  /**
   * Получить сводку по бонусным операциям пользователя
   */
  async getUserBonusSummary(userId: string): Promise<{
    totalEarned: number;
    totalSpent: number;
    currentBalance: number;
    transactionCount: number;
  }> {
    const [result] = await this.db
      .select({
        totalEarned: sql<number>`COALESCE(SUM(CASE WHEN ${bonusTransactions.transactionType} = 'earned' THEN ${bonusTransactions.pointsChange} ELSE 0 END), 0)`,
        totalSpent: sql<number>`COALESCE(SUM(CASE WHEN ${bonusTransactions.transactionType} = 'spent' THEN ${bonusTransactions.pointsChange} ELSE 0 END), 0)`,
        transactionCount: sql<number>`COUNT(*)`,
      })
      .from(bonusTransactions)
      .where(eq(bonusTransactions.userId, userId));

    const totalEarned = Number(result.totalEarned) || 0;
    const totalSpent = Number(result.totalSpent) || 0;
    const currentBalance = totalEarned - totalSpent;
    const transactionCount = Number(result.transactionCount) || 0;

    return {
      totalEarned,
      totalSpent,
      currentBalance,
      transactionCount,
    };
  }

  /**
   * Найти истекающие бонусы (с датой истечения в ближайшие дни)
   */
  async findExpiringBonuses(daysAhead = 30): Promise<BonusTransaction[]> {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + daysAhead);

    return await this.db
      .select()
      .from(bonusTransactions)
      .where(
        and(
          eq(bonusTransactions.transactionType, "earned"),
          lte(bonusTransactions.expiresAt, expirationDate),
          isNotNull(bonusTransactions.expiresAt)
        )
      )
      .orderBy(bonusTransactions.expiresAt);
  }

  /**
   * Найти просроченные бонусы
   */
  async findExpiredBonuses(): Promise<BonusTransaction[]> {
    const now = new Date();

    return await this.db
      .select()
      .from(bonusTransactions)
      .where(
        and(
          eq(bonusTransactions.transactionType, "earned"),
          lt(bonusTransactions.expiresAt, now),
          isNotNull(bonusTransactions.expiresAt)
        )
      )
      .orderBy(bonusTransactions.expiresAt);
  }

  /**
   * Обновить транзакцию
   */
  async update(id: string, data: Partial<NewBonusTransaction>): Promise<BonusTransaction | null> {
    const [updated] = await this.db
      .update(bonusTransactions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(bonusTransactions.id, id))
      .returning();
    return updated || null;
  }

  /**
   * Удалить транзакцию
   */
  async delete(id: string): Promise<boolean> {
    const [deletedTransaction] = await this.db
      .delete(bonusTransactions)
      .where(eq(bonusTransactions.id, id))
      .returning();
    return !!deletedTransaction;
  }

  /**
   * Подсчитать общее количество транзакций
   */
  async count(): Promise<number> {
    const [result] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(bonusTransactions);
    return Number(result.count);
  }

  /**
   * Подсчитать количество транзакций пользователя
   */
  async countByUserId(userId: string): Promise<number> {
    const [result] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(bonusTransactions)
      .where(eq(bonusTransactions.userId, userId));
    return Number(result.count);
  }

  /**
   * Получить статистику по бонусной программе
   */
  async getBonusStats(): Promise<{
    totalTransactions: number;
    totalEarned: number;
    totalSpent: number;
    activeUsers: number;
  }> {
    const [stats] = await this.db
      .select({
        totalTransactions: sql<number>`COUNT(*)`,
        totalEarned: sql<number>`COALESCE(SUM(CASE WHEN ${bonusTransactions.transactionType} = 'earned' THEN ${bonusTransactions.pointsChange} ELSE 0 END), 0)`,
        totalSpent: sql<number>`COALESCE(SUM(CASE WHEN ${bonusTransactions.transactionType} = 'spent' THEN ${bonusTransactions.pointsChange} ELSE 0 END), 0)`,
        activeUsers: sql<number>`COUNT(DISTINCT ${bonusTransactions.userId})`,
      })
      .from(bonusTransactions);

    return {
      totalTransactions: Number(stats.totalTransactions) || 0,
      totalEarned: Number(stats.totalEarned) || 0,
      totalSpent: Number(stats.totalSpent) || 0,
      activeUsers: Number(stats.activeUsers) || 0,
    };
  }
}
