/**
 * Схема таблицы class_participant для Drizzle ORM
 * Соответствует модели ClassParticipant из MAIN_MODEL.mdc
 */

import {
  pgTable,
  uuid,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";
import { classParticipantStatusEnum } from "./enums";
import { classSchedules } from "./classSchedule";
import { users } from "./user";

export const classParticipants = pgTable("class_participant", {
  id: uuid("id").defaultRandom().primaryKey(),
  classScheduleId: uuid("class_schedule_id")
    .notNull()
    .references(() => classSchedules.id, { onDelete: "cascade" }),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  status: classParticipantStatusEnum("status").notNull(),
  paidWithPackageId: uuid("paid_with_package_id"),
    // TODO: Добавить ссылку на userTrainingPackages когда таблица будет создана
    // .references(() => userTrainingPackages.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
}, (table) => ({
  // Уникальное ограничение: участник может быть в расписании класса только один раз
  uniqueClassScheduleUser: unique().on(table.classScheduleId, table.userId),
}));
