import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  text,
  boolean,
} from "drizzle-orm/pg-core";
import { externalSystemEnum, externalEntityMappingTypeEnum } from "./enums";

export const externalSystemMapping = pgTable("external_system_mapping", {
  id: uuid("id").primaryKey().defaultRandom(),

  // Внешняя система
  externalSystem: externalSystemEnum("external_system").notNull(),
  externalId: varchar("external_id", { length: 255 }).notNull(),

  // Внутренняя сущность
  internalEntityType: externalEntityMappingTypeEnum(
    "internal_entity_type"
  ).notNull(),
  internalEntityId: uuid("internal_entity_id").notNull(),

  // Метаданные синхронизации
  isActive: boolean("is_active").default(true).notNull(),
  lastSyncAt: timestamp("last_sync_at"),
  syncData: text("sync_data"), // JSON данные для синхронизации

  // Конфликты и ошибки
  hasConflict: boolean("has_conflict").default(false).notNull(),
  conflictData: text("conflict_data"), // JSON данные о конфликтах
  lastError: text("last_error"),

  // Timestamps
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Типы для TypeScript
export type ExternalSystemMapping = typeof externalSystemMapping.$inferSelect;
export type NewExternalSystemMapping =
  typeof externalSystemMapping.$inferInsert;
