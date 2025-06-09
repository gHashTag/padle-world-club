import { eq, desc, like, and, gte, lte, sql } from "drizzle-orm";
import { products, productCategories, type Product, type NewProduct } from "../db/schema";
import { DatabaseType } from "./types";

export class ProductRepository {
  private db: DatabaseType;

  constructor(db: DatabaseType) {
    this.db = db;
  }
  /**
   * Создать новый продукт
   */
  async create(data: NewProduct): Promise<Product> {
    const [product] = await this.db
      .insert(products)
      .values(data)
      .returning();
    return product;
  }

  /**
   * Получить продукт по ID
   */
  async findById(id: string): Promise<Product | null> {
    const [product] = await this.db
      .select()
      .from(products)
      .where(eq(products.id, id));
    return product || null;
  }

  /**
   * Получить продукт по ID с информацией о категории
   */
  async findByIdWithCategory(id: string): Promise<(Product & { category: { name: string; description: string | null } }) | null> {
    const [result] = await this.db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        price: products.price,
        currency: products.currency,
        categoryId: products.categoryId,
        currentStock: products.currentStock,
        reorderThreshold: products.reorderThreshold,
        isActive: products.isActive,
        imageUrl: products.imageUrl,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        category: {
          name: productCategories.name,
          description: productCategories.description,
        },
      })
      .from(products)
      .innerJoin(productCategories, eq(products.categoryId, productCategories.id))
      .where(eq(products.id, id));

    return result || null;
  }

  /**
   * Получить все продукты с пагинацией
   */
  async findAll(limit = 50, offset = 0): Promise<Product[]> {
    return await this.db
      .select()
      .from(products)
      .orderBy(desc(products.createdAt))
      .limit(limit)
      .offset(offset);
  }

  /**
   * Найти продукты по названию
   */
  async findByName(name: string, limit = 50, offset = 0): Promise<Product[]> {
    return await this.db
      .select()
      .from(products)
      .where(like(products.name, `%${name}%`))
      .orderBy(products.name)
      .limit(limit)
      .offset(offset);
  }

  /**
   * Найти продукты по категории
   */
  async findByCategoryId(categoryId: string, limit = 50, offset = 0): Promise<Product[]> {
    return await this.db
      .select()
      .from(products)
      .where(eq(products.categoryId, categoryId))
      .orderBy(products.name)
      .limit(limit)
      .offset(offset);
  }

  /**
   * Найти активные продукты
   */
  async findActive(limit = 50, offset = 0): Promise<Product[]> {
    return await this.db
      .select()
      .from(products)
      .where(eq(products.isActive, true))
      .orderBy(products.name)
      .limit(limit)
      .offset(offset);
  }

  /**
   * Найти продукты в ценовом диапазоне
   */
  async findByPriceRange(minPrice: string, maxPrice: string, limit = 50, offset = 0): Promise<Product[]> {
    return await this.db
      .select()
      .from(products)
      .where(
        and(
          gte(products.price, minPrice),
          lte(products.price, maxPrice)
        )
      )
      .orderBy(products.price)
      .limit(limit)
      .offset(offset);
  }

  /**
   * Найти продукты с низким остатком
   */
  async findLowStock(threshold = 10, limit = 50, offset = 0): Promise<Product[]> {
    return await this.db
      .select()
      .from(products)
      .where(lte(products.currentStock, threshold))
      .orderBy(products.currentStock)
      .limit(limit)
      .offset(offset);
  }

  /**
   * Обновить продукт
   */
  async update(id: string, data: Partial<NewProduct>): Promise<Product | null> {
    const [updated] = await this.db
      .update(products)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return updated || null;
  }

  /**
   * Обновить количество на складе
   */
  async updateStock(id: string, newQuantity: number): Promise<Product | null> {
    const [updated] = await this.db
      .update(products)
      .set({
        currentStock: newQuantity,
        updatedAt: new Date()
      })
      .where(eq(products.id, id))
      .returning();
    return updated || null;
  }

  /**
   * Удалить продукт
   */
  async delete(id: string): Promise<boolean> {
    const [deletedProduct] = await this.db
      .delete(products)
      .where(eq(products.id, id))
      .returning();
    return !!deletedProduct;
  }

  /**
   * Подсчитать общее количество продуктов
   */
  async count(): Promise<number> {
    const [result] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(products);
    return result.count;
  }

  /**
   * Подсчитать количество продуктов в категории
   */
  async countByCategory(categoryId: string): Promise<number> {
    const [result] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(products)
      .where(eq(products.categoryId, categoryId));
    return result.count;
  }



  /**
   * Получить статистику по продуктам
   */
  async getStats(): Promise<{
    total: number;
    active: number;
    lowStock: number;
    totalValue: number;
  }> {
    const [stats] = await this.db
      .select({
        total: sql<number>`count(*)`,
        active: sql<number>`count(*) filter (where ${products.isActive} = true)`,
        lowStock: sql<number>`count(*) filter (where ${products.currentStock} <= 10)`,
        totalValue: sql<number>`sum(${products.price} * ${products.currentStock})`,
      })
      .from(products);

    return {
      total: stats.total || 0,
      active: stats.active || 0,
      lowStock: stats.lowStock || 0,
      totalValue: Number(stats.totalValue) || 0,
    };
  }
}
