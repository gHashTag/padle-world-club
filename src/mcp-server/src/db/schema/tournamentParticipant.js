/**
 * Схема таблицы tournament_participant для Drizzle ORM
 * Соответствует модели TournamentParticipant из MAIN_MODEL.mdc
 */
import { pgTable, uuid, timestamp, unique, } from "drizzle-orm/pg-core";
import { tournamentParticipantStatusEnum } from "./enums";
import { tournaments } from "./tournament";
import { users } from "./user";
import { tournamentTeams } from "./tournamentTeam";
export const tournamentParticipants = pgTable("tournament_participant", {
    id: uuid("id").defaultRandom().primaryKey(),
    tournamentId: uuid("tournament_id")
        .notNull()
        .references(() => tournaments.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    registrationDate: timestamp("registration_date", { withTimezone: true })
        .defaultNow()
        .notNull(),
    status: tournamentParticipantStatusEnum("status").notNull(),
    partnerUserId: uuid("partner_user_id")
        .references(() => users.id, { onDelete: "set null" }),
    teamId: uuid("team_id")
        .references(() => tournamentTeams.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
}, (table) => ({
    // Уникальное ограничение: участник может быть в турнире только один раз
    uniqueTournamentUser: unique().on(table.tournamentId, table.userId),
}));
