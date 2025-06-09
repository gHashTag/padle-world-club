/**
 * Схема таблицы class_definition для Drizzle ORM
 * Соответствует модели ClassDefinition из MAIN_MODEL.mdc
 */

import {
  pgTable,
  uuid,
  timestamp,
  numeric,
  varchar,
  text,
  boolean,
} from "drizzle-orm/pg-core";
import { classTypeEnum, userSkillLevelEnum } from "./enums";

export const classDefinitions = pgTable("class_definition", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  classType: classTypeEnum("class_type").notNull(),
  basePrice: numeric("base_price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).notNull(),
  minSkillLevel: userSkillLevelEnum("min_skill_level"),
  maxSkillLevel: userSkillLevelEnum("max_skill_level"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
