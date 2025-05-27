import { eq, desc, like, sql } from "drizzle-orm";
import { productCategories, type ProductCategory, type NewProductCategory } from "../db/schema";
import { DatabaseType } from "./types";

export class ProductCategoryRepository {
  private db: DatabaseType;

  constructor(db: DatabaseType) {
    this.db = db;
  }
  /**
   * Создать новую категорию продукта
   */
  async create(data: NewProductCategory): Promise<ProductCategory> {
    const [category] = await this.db
      .insert(productCategories)
      .values(data)
      .returning();
    return category;
  }

  /**
   * Получить категорию по ID
   */
  async findById(id: string): Promise<ProductCategory | null> {
    const [category] = await this.db
      .select()
      .from(productCategories)
      .where(eq(productCategories.id, id));
    return category || null;
  }

  /**
   * Получить все категории с пагинацией
   */
  async findAll(limit = 50, offset = 0): Promise<ProductCategory[]> {
    return await this.db
      .select()
      .from(productCategories)
      .orderBy(desc(productCategories.createdAt))
      .limit(limit)
      .offset(offset);
  }

  /**
   * Найти категории по названию
   */
  async findByName(name: string): Promise<ProductCategory[]> {
    return await this.db
      .select()
      .from(productCategories)
      .where(like(productCategories.name, `%${name}%`))
      .orderBy(productCategories.name);
  }

  /**
   * Обновить категорию
   */
  async update(id: string, data: Partial<NewProductCategory>): Promise<ProductCategory | null> {
    const [updated] = await this.db
      .update(productCategories)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(productCategories.id, id))
      .returning();
    return updated || null;
  }

  /**
   * Удалить категорию
   */
  async delete(id: string): Promise<boolean> {
    const [deletedCategory] = await this.db
      .delete(productCategories)
      .where(eq(productCategories.id, id))
      .returning();
    return !!deletedCategory;
  }

  /**
   * Подсчитать общее количество категорий
   */
  async count(): Promise<number> {
    const [result] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(productCategories);
    return result.count;
  }

  /**
   * Проверить существование категории по названию
   */
  async existsByName(name: string, excludeId?: string): Promise<boolean> {
    const conditions = [eq(productCategories.name, name)];
    if (excludeId) {
      conditions.push(sql`${productCategories.id} != ${excludeId}`);
    }

    const [result] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(productCategories)
      .where(sql`${conditions.join(' AND ')}`);

    return result.count > 0;
  }
}
