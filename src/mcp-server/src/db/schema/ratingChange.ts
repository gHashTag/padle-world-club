/**
 * Схема таблицы rating_change для Drizzle ORM
 * Соответствует модели RatingChange из MAIN_MODEL.mdc
 */

import {
  pgTable,
  uuid,
  real,
  text,
  timestamp,
} from "drizzle-orm/pg-core";
import { ratingChangeReasonEnum } from "./enums";
import { users } from "./user";
import { gameSessions } from "./gameSession";

export const ratingChanges = pgTable("rating_change", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  oldRating: real("old_rating").notNull(),
  newRating: real("new_rating").notNull(),
  changeReason: ratingChangeReasonEnum("change_reason").notNull(),
  relatedGameSessionId: uuid("related_game_session_id")
    .references(() => gameSessions.id, { onDelete: "set null" }),
  relatedTournamentMatchId: uuid("related_tournament_match_id"), // TODO: добавить ссылку на TournamentMatch когда будет создана
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
