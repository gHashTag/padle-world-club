/**
 * Схема для модели ProductCategory (Категории товаров)
 * Содержит определение таблицы product_category и связанных типов
 */

import { pgTable, uuid, varchar, text, timestamp, pgEnum } from "drizzle-orm/pg-core";

// Enum для типов категорий продуктов
export const productCategoryTypeEnum = pgEnum("product_category_type", [
  "court_gear",
  "apparel", 
  "drinks",
  "snacks",
  "other"
]);

export const productCategories = pgTable("product_category", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 100 }).unique().notNull(),
  description: text("description"),
  type: productCategoryTypeEnum("type").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Типы TypeScript
export type ProductCategory = typeof productCategories.$inferSelect;
export type NewProductCategory = typeof productCategories.$inferInsert;

// Дополнительные типы для удобства
export type UpdateProductCategory = Partial<Omit<NewProductCategory, "id" | "createdAt" | "updatedAt">>;

export type ProductCategoryWithStats = ProductCategory & {
  productsCount: number;
  activeProductsCount: number;
  totalStockValue: number;
  averagePrice: number;
};

export type ProductCategoryStats = {
  totalCategories: number;
  categoriesByType: Record<string, number>;
  averageProductsPerCategory: number;
  mostPopularCategory: {
    id: string;
    name: string;
    productsCount: number;
  } | null;
  leastPopularCategory: {
    id: string;
    name: string;
    productsCount: number;
  } | null;
};

// Константы для типов категорий
export const PRODUCT_CATEGORY_TYPES = {
  COURT_GEAR: "court_gear" as const,
  APPAREL: "apparel" as const,
  DRINKS: "drinks" as const,
  SNACKS: "snacks" as const,
  OTHER: "other" as const,
} as const;

export type ProductCategoryType = typeof PRODUCT_CATEGORY_TYPES[keyof typeof PRODUCT_CATEGORY_TYPES];
