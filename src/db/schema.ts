import {
  pgTable,
  serial,
  text,
  varchar,
  timestamp,
  boolean,
  integer,
  jsonb,
  uuid,
} from "drizzle-orm/pg-core";

/**
 * Пример таблицы для тестирования подключения
 */
export const testTable = pgTable("test_table", {
  id: serial("id").primaryKey(),
  name: text("name"),
});

/**
 * Таблица пользователей бота
 */
export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  telegram_id: integer("telegram_id").notNull().unique(),
  username: varchar("username", { length: 255 }),
  first_name: varchar("first_name", { length: 255 }),
  last_name: varchar("last_name", { length: 255 }),
  language_code: varchar("language_code", { length: 10 }),
  is_bot: boolean("is_bot").default(false),
  subscription_level: varchar("subscription_level", { length: 50 })
    .default("free")
    .notNull(),
  subscription_expires_at: timestamp("subscription_expires_at"),
  last_active_at: timestamp("last_active_at").defaultNow(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
});

/**
 * Таблица пользовательских настроек
 */
export const userSettingsTable = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  user_id: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  setting_key: varchar("setting_key", { length: 255 }).notNull(),
  setting_value: jsonb("setting_value"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

/**
 * Таблица для хранения состояний сцен
 */
export const sceneStatesTable = pgTable("scene_states", {
  id: serial("id").primaryKey(),
  user_id: uuid("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  scene_id: varchar("scene_id", { length: 255 }).notNull(),
  state_data: jsonb("state_data"),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

/**
 * Таблица для логирования действий
 */
export const activityLogsTable = pgTable("activity_logs", {
  id: serial("id").primaryKey(),
  user_id: uuid("user_id").references(() => usersTable.id, {
    onDelete: "set null",
  }),
  action_type: varchar("action_type", { length: 100 }).notNull(),
  action_details: jsonb("action_details"),
  performed_at: timestamp("performed_at").defaultNow().notNull(),
  ip_address: varchar("ip_address", { length: 50 }),
  created_at: timestamp("created_at").defaultNow().notNull(),
});
