import { pgTable, uuid, timestamp, text, jsonb, boolean, pgEnum } from "drizzle-orm/pg-core";

// Локальные определения enum для избежания проблем с импортом
const externalSystemEnum = pgEnum("external_system", [
  "exporta",
  "google_calendar",
  "whatsapp_api",
  "telegram_api",
  "payment_gateway_api",
  "other"
]);

const externalEntityMappingTypeEnum = pgEnum("external_entity_mapping_type", [
  "user",
  "booking",
  "court",
  "class",
  "venue",
  "class_schedule",
  "product",
  "training_package_definition"
]);

export const externalSystemMappings = pgTable("external_system_mapping", {
  id: uuid("id").primaryKey().defaultRandom(),
  externalSystem: externalSystemEnum("external_system").notNull(),
  entityType: externalEntityMappingTypeEnum("entity_type").notNull(),
  internalEntityId: uuid("internal_entity_id").notNull(), // ID сущности в нашей системе
  externalEntityId: text("external_entity_id").notNull(), // ID сущности во внешней системе
  externalEntityData: jsonb("external_entity_data"), // Дополнительные данные из внешней системы
  syncDirection: text("sync_direction").notNull().default("bidirectional"), // "to_external", "from_external", "bidirectional"
  isActive: boolean("is_active").notNull().default(true),
  lastSyncAt: timestamp("last_sync_at", { withTimezone: true }),
  syncErrors: text("sync_errors"), // Последние ошибки синхронизации
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// Типы для TypeScript
export type ExternalSystemMapping = typeof externalSystemMappings.$inferSelect;
export type NewExternalSystemMapping = typeof externalSystemMappings.$inferInsert;
