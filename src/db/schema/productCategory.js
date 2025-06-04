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
// Константы для типов категорий
export const PRODUCT_CATEGORY_TYPES = {
    COURT_GEAR: "court_gear",
    APPAREL: "apparel",
    DRINKS: "drinks",
    SNACKS: "snacks",
    OTHER: "other",
};
