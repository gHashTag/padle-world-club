/**
 * Схема таблицы game_player для Drizzle ORM
 * Соответствует модели GamePlayer из MAIN_MODEL.mdc
 */
import { pgTable, uuid, timestamp, unique, } from "drizzle-orm/pg-core";
import { classParticipantStatusEnum } from "./enums";
import { gameSessions } from "./gameSession";
import { users } from "./user";
export const gamePlayers = pgTable("game_player", {
    id: uuid("id").defaultRandom().primaryKey(),
    gameSessionId: uuid("game_session_id")
        .notNull()
        .references(() => gameSessions.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    participationStatus: classParticipantStatusEnum("participation_status").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
}, (table) => ({
    // Уникальная комбинация игровой сессии и пользователя
    uniqueGameSessionUser: unique().on(table.gameSessionId, table.userId),
}));
