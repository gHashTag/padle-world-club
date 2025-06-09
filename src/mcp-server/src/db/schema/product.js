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
