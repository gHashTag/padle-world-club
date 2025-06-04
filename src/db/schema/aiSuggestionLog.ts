import {
  pgTable,
  uuid,
  timestamp,
  text,
  jsonb,
  boolean,
  numeric,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { users } from "./user";
import { aiSuggestionTypeEnum } from "./enums";

export const aiSuggestionLogs = pgTable("ai_suggestion_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  suggestionType: aiSuggestionTypeEnum("suggestion_type").notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }), // Пользователь, для которого сделано предложение
  inputData: jsonb("input_data").notNull(), // Входные данные для AI
  suggestionData: jsonb("suggestion_data").notNull(), // Результат работы AI
  confidenceScore: numeric("confidence_score", { precision: 5, scale: 4 }), // Уверенность AI (0.0000-1.0000)
  wasAccepted: boolean("was_accepted"), // Было ли принято предложение пользователем
  userFeedback: text("user_feedback"), // Обратная связь от пользователя
  executionTimeMs: numeric("execution_time_ms", { precision: 10, scale: 2 }), // Время выполнения в миллисекундах
  modelVersion: text("model_version"), // Версия модели AI
  contextData: jsonb("context_data"), // Дополнительный контекст
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Отношения
export const aiSuggestionLogsRelations = relations(
  aiSuggestionLogs,
  ({ one }) => ({
    user: one(users, {
      fields: [aiSuggestionLogs.userId],
      references: [users.id],
    }),
  })
);

// Типы для TypeScript
export type AISuggestionLog = typeof aiSuggestionLogs.$inferSelect;
export type NewAISuggestionLog = typeof aiSuggestionLogs.$inferInsert;
