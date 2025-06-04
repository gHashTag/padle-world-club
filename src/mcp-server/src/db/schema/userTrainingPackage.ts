/**
 * Схема таблицы user_training_package для Drizzle ORM
 * Соответствует модели UserTrainingPackage из MAIN_MODEL.mdc
 */

import {
  pgTable,
  uuid,
  timestamp,
  integer,
} from "drizzle-orm/pg-core";
import { userTrainingPackageStatusEnum } from "./enums";
import { users } from "./user";
import { trainingPackageDefinitions } from "./trainingPackageDefinition";

export const userTrainingPackages = pgTable("user_training_package", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  packageDefinitionId: uuid("package_definition_id")
    .notNull()
    .references(() => trainingPackageDefinitions.id, { onDelete: "cascade" }),
  purchaseDate: timestamp("purchase_date", { withTimezone: true })
    .defaultNow()
    .notNull(),
  expirationDate: timestamp("expiration_date", { withTimezone: true })
    .notNull(),
  sessionsUsed: integer("sessions_used").notNull().default(0),
  sessionsTotal: integer("sessions_total").notNull(),
  status: userTrainingPackageStatusEnum("status").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
