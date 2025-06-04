/**
 * Схема таблицы game_session для Drizzle ORM
 * Соответствует модели GameSession из MAIN_MODEL.mdc
 */

import {
  pgTable,
  uuid,
  timestamp,
  integer,
  varchar,
} from "drizzle-orm/pg-core";
import { gameSessionStatusEnum, gameTypeEnum, userSkillLevelEnum } from "./enums";
import { venues } from "./venue";
import { courts } from "./court";
import { users } from "./user";
import { bookings } from "./booking";

export const gameSessions = pgTable("game_session", {
  id: uuid("id").defaultRandom().primaryKey(),
  venueId: uuid("venue_id")
    .notNull()
    .references(() => venues.id, { onDelete: "restrict" }),
  courtId: uuid("court_id")
    .references(() => courts.id, { onDelete: "set null" }),
  startTime: timestamp("start_time", { withTimezone: true })
    .notNull(),
  endTime: timestamp("end_time", { withTimezone: true })
    .notNull(),
  gameType: gameTypeEnum("game_type").notNull(),
  neededSkillLevel: userSkillLevelEnum("needed_skill_level").notNull(),
  maxPlayers: integer("max_players").notNull(),
  currentPlayers: integer("current_players").notNull().default(0),
  status: gameSessionStatusEnum("status").notNull(),
  createdByUserId: uuid("created_by_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  hostUserId: uuid("host_user_id")
    .references(() => users.id, { onDelete: "set null" }),
  matchScore: varchar("match_score", { length: 50 }),
  winnerUserIds: uuid("winner_user_ids").array(),
  relatedBookingId: uuid("related_booking_id")
    .references(() => bookings.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
