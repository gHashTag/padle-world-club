import { eq, desc, and, gte, lte, sum, sql } from "drizzle-orm";
import { stockTransactions, products, type StockTransaction, type NewStockTransaction } from "../db/schema";
import { DatabaseType } from "./types";

export class StockTransactionRepository {
  private db: DatabaseType;

  constructor(db: DatabaseType) {
    this.db = db;
  }
  /**
   * Создать новую складскую транзакцию
   */
  async create(data: NewStockTransaction): Promise<StockTransaction> {
    const [transaction] = await this.db
      .insert(stockTransactions)
      .values(data)
      .returning();
    return transaction;
  }

  /**
   * Получить транзакцию по ID
   */
  async findById(id: string): Promise<StockTransaction | null> {
    const [transaction] = await this.db
      .select()
      .from(stockTransactions)
      .where(eq(stockTransactions.id, id));
    return transaction || null;
  }

  /**
   * Получить все транзакции с пагинацией
   */
  async findAll(limit = 50, offset = 0): Promise<StockTransaction[]> {
    return await this.db
      .select()
      .from(stockTransactions)
      .orderBy(desc(stockTransactions.createdAt))
      .limit(limit)
      .offset(offset);
  }

  /**
   * Получить транзакции по продукту
   */
  async findByProductId(productId: string, limit = 50, offset = 0): Promise<StockTransaction[]> {
    return await this.db
      .select()
      .from(stockTransactions)
      .where(eq(stockTransactions.productId, productId))
      .orderBy(desc(stockTransactions.createdAt))
      .limit(limit)
      .offset(offset);
  }

  /**
   * Получить транзакции по типу
   */
  async findByType(type: "sale" | "purchase" | "adjustment" | "return", limit = 50, offset = 0): Promise<StockTransaction[]> {
    return await this.db
      .select()
      .from(stockTransactions)
      .where(eq(stockTransactions.transactionType, type))
      .orderBy(desc(stockTransactions.createdAt))
      .limit(limit)
      .offset(offset);
  }

  /**
   * Получить транзакции за период
   */
  async findByDateRange(startDate: Date, endDate: Date, limit = 100, offset = 0): Promise<StockTransaction[]> {
    return await this.db
      .select()
      .from(stockTransactions)
      .where(
        and(
          gte(stockTransactions.createdAt, startDate),
          lte(stockTransactions.createdAt, endDate)
        )
      )
      .orderBy(desc(stockTransactions.createdAt))
      .limit(limit)
      .offset(offset);
  }

  /**
   * Обновить транзакцию
   */
  async update(id: string, data: Partial<NewStockTransaction>): Promise<StockTransaction | null> {
    const [updated] = await this.db
      .update(stockTransactions)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(stockTransactions.id, id))
      .returning();
    return updated || null;
  }

  /**
   * Удалить транзакцию
   */
  async delete(id: string): Promise<boolean> {
    const [deletedTransaction] = await this.db
      .delete(stockTransactions)
      .where(eq(stockTransactions.id, id))
      .returning();
    return !!deletedTransaction;
  }

  /**
   * Получить текущий остаток товара (последняя транзакция)
   */
  async getCurrentStock(productId: string): Promise<number> {
    const [lastTransaction] = await this.db
      .select({ currentStock: stockTransactions.currentStockAfter })
      .from(stockTransactions)
      .where(eq(stockTransactions.productId, productId))
      .orderBy(desc(stockTransactions.createdAt))
      .limit(1);

    return lastTransaction?.currentStock || 0;
  }

  /**
   * Получить сумму изменений по типу транзакции за период
   */
  async getStockMovementSummary(
    productId?: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    sales: number;
    purchases: number;
    adjustments: number;
    returns: number;
  }> {
    const conditions = [];

    if (productId) {
      conditions.push(eq(stockTransactions.productId, productId));
    }
    if (startDate) {
      conditions.push(gte(stockTransactions.createdAt, startDate));
    }
    if (endDate) {
      conditions.push(lte(stockTransactions.createdAt, endDate));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const result = await this.db
      .select({
        transactionType: stockTransactions.transactionType,
        totalChange: sum(stockTransactions.quantityChange),
      })
      .from(stockTransactions)
      .where(whereClause)
      .groupBy(stockTransactions.transactionType);

    const summary = {
      sales: 0,
      purchases: 0,
      adjustments: 0,
      returns: 0,
    };

    result.forEach((row) => {
      const total = Number(row.totalChange) || 0;
      switch (row.transactionType) {
        case "sale":
          summary.sales = Math.abs(total); // Продажи всегда отрицательные, показываем положительно
          break;
        case "purchase":
          summary.purchases = total;
          break;
        case "adjustment":
          summary.adjustments = total;
          break;
        case "return":
          summary.returns = total;
          break;
      }
    });

    return summary;
  }

  /**
   * Получить товары с низким остатком
   */
  async getLowStockProducts(threshold = 10): Promise<Array<{
    productId: string;
    productName: string;
    currentStock: number;
  }>> {
    // Получаем последние остатки для каждого продукта
    const latestStocks = await this.db
      .select({
        productId: stockTransactions.productId,
        currentStock: stockTransactions.currentStockAfter,
        productName: products.name,
      })
      .from(stockTransactions)
      .innerJoin(products, eq(stockTransactions.productId, products.id))
      .where(
        sql`(${stockTransactions.productId}, ${stockTransactions.createdAt}) IN (
          SELECT product_id, MAX(created_at)
          FROM ${stockTransactions}
          GROUP BY product_id
        )`
      )
      .having(lte(stockTransactions.currentStockAfter, threshold));

    return latestStocks;
  }

  /**
   * Подсчитать общее количество транзакций
   */
  async count(): Promise<number> {
    const [result] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(stockTransactions);
    return Number(result.count);
  }

  /**
   * Подсчитать количество транзакций по продукту
   */
  async countByProductId(productId: string): Promise<number> {
    const [result] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(stockTransactions)
      .where(eq(stockTransactions.productId, productId));
    return Number(result.count);
  }
}
