/**
 * Схема таблицы tournament для Drizzle ORM
 * Соответствует модели Tournament из MAIN_MODEL.mdc
 */
import { pgTable, uuid, varchar, text, numeric, integer, timestamp, } from "drizzle-orm/pg-core";
import { tournamentTypeEnum, tournamentStatusEnum, userSkillLevelEnum } from "./enums";
import { venues } from "./venue";
export const tournaments = pgTable("tournament", {
    id: uuid("id").defaultRandom().primaryKey(),
    venueId: uuid("venue_id")
        .notNull()
        .references(() => venues.id, { onDelete: "restrict" }),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    tournamentType: tournamentTypeEnum("tournament_type").notNull(),
    skillLevelCategory: userSkillLevelEnum("skill_level_category").notNull(),
    startDate: timestamp("start_date", { withTimezone: true }).notNull(),
    endDate: timestamp("end_date", { withTimezone: true }).notNull(),
    registrationFee: numeric("registration_fee", { precision: 10, scale: 2 }).notNull(),
    currency: varchar("currency", { length: 3 }).notNull(),
    maxParticipants: integer("max_participants").notNull(),
    status: tournamentStatusEnum("status").notNull(),
    rulesUrl: text("rules_url"),
    createdAt: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
});
