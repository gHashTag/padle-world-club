/**
 * Схема таблицы tournament_team для Drizzle ORM
 * Соответствует модели TournamentTeam из MAIN_MODEL.mdc
 */
import { pgTable, uuid, varchar, timestamp, unique, } from "drizzle-orm/pg-core";
import { tournaments } from "./tournament";
import { users } from "./user";
export const tournamentTeams = pgTable("tournament_team", {
    id: uuid("id").defaultRandom().primaryKey(),
    tournamentId: uuid("tournament_id")
        .notNull()
        .references(() => tournaments.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    player1Id: uuid("player1_id")
        .notNull()
        .references(() => users.id, { onDelete: "restrict" }),
    player2Id: uuid("player2_id")
        .references(() => users.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
}, (table) => ({
    // Уникальное ограничение: название команды должно быть уникальным в рамках турнира
    uniqueTournamentName: unique().on(table.tournamentId, table.name),
}));
