/**
 * Схема таблицы training_package_definition для Drizzle ORM
 * Соответствует модели TrainingPackageDefinition из MAIN_MODEL.mdc
 */

import {
  pgTable,
  uuid,
  varchar,
  text,
  numeric,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { trainingPackageTypeEnum } from "./enums";

export const trainingPackageDefinitions = pgTable("training_package_definition", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  packageType: trainingPackageTypeEnum("package_type").notNull(),
  numberOfSessions: integer("number_of_sessions").notNull(),
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull(),
  validityDurationDays: integer("validity_duration_days").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
