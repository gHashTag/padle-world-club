/**
 * Схема базы данных Drizzle ORM
 * Этот файл содержит определения таблиц и отношений между ними
 */

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
  primaryKey,
  foreignKey,
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

/**
 * Таблица пользователей
 * Хранит основную информацию о пользователях Telegram
 */
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  telegram_id: text("telegram_id").notNull().unique(),
  username: text("username"),
  first_name: text("first_name"),
  last_name: text("last_name"),
  language_code: text("language_code"),
  is_bot: boolean("is_bot").default(false),
  is_premium: boolean("is_premium").default(false),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  metadata: json("metadata").$type<Record<string, unknown>>(),
});

/**
 * Таблица настроек пользователей
 * Хранит настройки и предпочтения пользователей
 */
export const userSettings = pgTable(
  "user_settings",
  {
    id: serial("id").primaryKey(),
    user_id: integer("user_id").notNull(),
    notifications_enabled: boolean("notifications_enabled").default(true),
    preferred_language: text("preferred_language").default("ru"),
    theme: text("theme").default("light"),
    created_at: timestamp("created_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => {
    return {
      user_fk: foreignKey({
        columns: [table.user_id],
        foreignColumns: [users.id],
        name: "user_settings_user_id_fk",
      }),
    };
  }
);

/**
 * Таблица сообщений
 * Хранит историю сообщений пользователей
 */
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(),
  chat_id: text("chat_id").notNull(),
  message_text: text("message_text"),
  message_type: text("message_type").notNull(),
  telegram_message_id: integer("telegram_message_id"),
  sent_at: timestamp("sent_at").defaultNow().notNull(),
  metadata: json("metadata").$type<Record<string, unknown>>(),
});

/**
 * Таблица сессий Wizard
 * Хранит состояние wizard-сцен для восстановления при перезапуске бота
 */
export const wizardSessions = pgTable("wizard_sessions", {
  id: serial("id").primaryKey(),
  user_id: integer("user_id").notNull(),
  scene_id: text("scene_id").notNull(),
  step: integer("step").notNull(),
  state: json("state").notNull(),
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull(),
  expires_at: timestamp("expires_at"),
});

/**
 * Соединительная таблица для пользователей и их ролей
 */
export const userRoles = pgTable(
  "user_roles",
  {
    user_id: integer("user_id").notNull(),
    role_id: integer("role_id").notNull(),
    assigned_at: timestamp("assigned_at").defaultNow().notNull(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.user_id, table.role_id] }),
  })
);

/**
 * Таблица ролей пользователей
 */
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  created_at: timestamp("created_at").defaultNow().notNull(),
});

// Типы на основе схемы

// Тип для пользователя из базы данных
export type User = typeof users.$inferSelect;

// Тип для создания нового пользователя
export type NewUser = typeof users.$inferInsert;

// Тип для настроек пользователя
export type UserSettings = typeof userSettings.$inferSelect;

// Тип для сообщения
export type Message = typeof messages.$inferSelect;

// Тип для сессии wizard
export type WizardSession = typeof wizardSessions.$inferSelect;
