/**
 * Схема для модели TournamentMatch (Матчи турниров)
 * Содержит определение таблицы tournament_match и связанных типов
 */

import { pgTable, uuid, integer, varchar, timestamp } from "drizzle-orm/pg-core";
import { tournaments } from "./tournament";
import { courts } from "./court";
import { tournamentTeams } from "./tournamentTeam";
import { tournamentStatusEnum } from "./enums";

export const tournamentMatches = pgTable("tournament_match", {
  id: uuid("id").defaultRandom().primaryKey(),
  tournamentId: uuid("tournament_id")
    .notNull()
    .references(() => tournaments.id, { onDelete: "cascade" }),
  courtId: uuid("court_id")
    .references(() => courts.id, { onDelete: "set null" }),
  matchNumber: integer("match_number").notNull(),
  round: varchar("round", { length: 50 }).notNull(),
  startTime: timestamp("start_time", { withTimezone: true }).notNull(),
  endTime: timestamp("end_time", { withTimezone: true }).notNull(),
  status: tournamentStatusEnum("status").notNull(),
  score: varchar("score", { length: 50 }),
  winnerTeamId: uuid("winner_team_id")
    .references(() => tournamentTeams.id, { onDelete: "set null" }),
  loserTeamId: uuid("loser_team_id")
    .references(() => tournamentTeams.id, { onDelete: "set null" }),
  winnerPlayerIds: uuid("winner_player_ids").array(),
  loserPlayerIds: uuid("loser_player_ids").array(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
}, (table) => ({
  // Уникальное ограничение: номер матча должен быть уникальным в рамках турнира
  uniqueMatchNumber: {
    name: "tournament_match_tournament_id_match_number_unique",
    columns: [table.tournamentId, table.matchNumber],
  },
}));

// Базовые типы для валидации
export type TournamentMatchStatus = "upcoming" | "registration_open" | "in_progress" | "completed" | "cancelled";

// Типы TypeScript
export type TournamentMatch = typeof tournamentMatches.$inferSelect;
export type NewTournamentMatch = typeof tournamentMatches.$inferInsert;

// Дополнительные типы для удобства
export type UpdateTournamentMatch = Partial<Omit<NewTournamentMatch, "id" | "createdAt" | "updatedAt">>;
export type TournamentMatchWithDetails = TournamentMatch & {
  tournament: {
    name: string;
    startDate: Date;
    endDate: Date;
    status: string;
  };
  court?: {
    name: string;
    courtType: string;
  } | null;
  winnerTeam?: {
    name: string;
    player1: { firstName: string; lastName: string };
    player2?: { firstName: string; lastName: string } | null;
  } | null;
  loserTeam?: {
    name: string;
    player1: { firstName: string; lastName: string };
    player2?: { firstName: string; lastName: string } | null;
  } | null;
};

export type TournamentMatchStats = {
  totalMatches: number;
  completedMatches: number;
  upcomingMatches: number;
  inProgressMatches: number;
  cancelledMatches: number;
  averageMatchDuration: number; // в минутах
  averageMatchesPerTournament: number;
};

export type TournamentMatchGroupedByTournament = {
  tournamentId: string;
  tournamentName: string;
  matchesCount: number;
  completedMatchesCount: number;
  upcomingMatchesCount: number;
  inProgressMatchesCount: number;
};

export type TournamentMatchGroupedByRound = {
  round: string;
  matchesCount: number;
  completedMatchesCount: number;
  upcomingMatchesCount: number;
};

export type TournamentMatchByDay = {
  date: string; // YYYY-MM-DD
  matchesCount: number;
  completedMatchesCount: number;
  upcomingMatchesCount: number;
};
