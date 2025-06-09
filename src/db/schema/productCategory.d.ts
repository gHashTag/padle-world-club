/**
 * Схема для модели ProductCategory (Категории товаров)
 * Содержит определение таблицы product_category и связанных типов
 */
export declare const productCategoryTypeEnum: import("drizzle-orm/pg-core").PgEnum<["court_gear", "apparel", "drinks", "snacks", "other"]>;
export declare const productCategories: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "product_category";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "product_category";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        name: import("drizzle-orm/pg-core").PgColumn<{
            name: "name";
            tableName: "product_category";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        description: import("drizzle-orm/pg-core").PgColumn<{
            name: "description";
            tableName: "product_category";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        type: import("drizzle-orm/pg-core").PgColumn<{
            name: "type";
            tableName: "product_category";
            dataType: "string";
            columnType: "PgEnumColumn";
            data: "other" | "court_gear" | "apparel" | "drinks" | "snacks";
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: ["court_gear", "apparel", "drinks", "snacks", "other"];
            baseColumn: never;
        }, {}, {}>;
        createdAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_at";
            tableName: "product_category";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        updatedAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "updated_at";
            tableName: "product_category";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
export type ProductCategory = typeof productCategories.$inferSelect;
export type NewProductCategory = typeof productCategories.$inferInsert;
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
export declare const PRODUCT_CATEGORY_TYPES: {
    readonly COURT_GEAR: "court_gear";
    readonly APPAREL: "apparel";
    readonly DRINKS: "drinks";
    readonly SNACKS: "snacks";
    readonly OTHER: "other";
};
export type ProductCategoryType = typeof PRODUCT_CATEGORY_TYPES[keyof typeof PRODUCT_CATEGORY_TYPES];
