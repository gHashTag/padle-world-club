/**
 * Схема для модели Product (Товары/услуги)
 * Содержит определение таблицы product и связанных типов
 */

import { pgTable, uuid, varchar, text, numeric, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { productCategories } from "./productCategory";

export const products = pgTable("product", {
  id: uuid("id").defaultRandom().primaryKey(),
  categoryId: uuid("category_id")
    .notNull()
    .references(() => productCategories.id, { onDelete: "restrict" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull(),
  imageUrl: text("image_url"),
  currentStock: integer("current_stock").notNull(),
  reorderThreshold: integer("reorder_threshold").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Типы TypeScript
export type Product = typeof products.$inferSelect;
export type NewProduct = typeof products.$inferInsert;

// Дополнительные типы для удобства
export type UpdateProduct = Partial<Omit<NewProduct, "id" | "createdAt" | "updatedAt">>;

export type ProductWithCategory = Product & {
  category: {
    name: string;
    description: string | null;
    type: string;
  };
};

export type ProductStats = {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  totalStockValue: number;
  averagePrice: number;
  averageStockLevel: number;
};

export type ProductGroupedByCategory = {
  categoryId: string;
  categoryName: string;
  categoryType: string;
  productsCount: number;
  activeProductsCount: number;
  totalStockValue: number;
  averagePrice: number;
};

export type ProductStockAlert = {
  productId: string;
  productName: string;
  currentStock: number;
  reorderThreshold: number;
  stockStatus: "low_stock" | "out_of_stock";
  categoryName: string;
};

export type ProductSalesData = {
  productId: string;
  productName: string;
  totalSold: number;
  totalRevenue: number;
  averageOrderQuantity: number;
  lastSaleDate: Date | null;
  categoryName: string;
};

export type ProductPriceHistory = {
  productId: string;
  productName: string;
  currentPrice: number;
  priceChanges: Array<{
    date: Date;
    oldPrice: number;
    newPrice: number;
    changePercentage: number;
  }>;
};

export type ProductInventoryReport = {
  productId: string;
  productName: string;
  categoryName: string;
  currentStock: number;
  reorderThreshold: number;
  stockValue: number;
  lastRestockDate: Date | null;
  averageMonthlyUsage: number;
  recommendedOrderQuantity: number;
};
