/**
 * Схема для модели Feedback (Обратная связь)
 * Содержит определение таблицы feedback и связанных типов
 */

import { pgTable, uuid, integer, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./user";
import { venues } from "./venue";

// Enum для категорий обратной связи
export const feedbackCategoryEnum = pgEnum("feedback_category", [
  "court_quality",
  "game_experience",
  "training_quality",
  "staff_service",
  "system_suggestion",
  "other"
]);

// Enum для статусов обратной связи
export const feedbackStatusEnum = pgEnum("feedback_status", [
  "new",
  "in_review",
  "resolved",
  "archived"
]);

// Таблица обратной связи
export const feedbacks = pgTable("feedback", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id")
    .references(() => users.id, { onDelete: "set null" }),
  venueId: uuid("venue_id")
    .references(() => venues.id, { onDelete: "set null" }),
  category: feedbackCategoryEnum("category").notNull(),
  rating: integer("rating"), // От 1 до 5
  comment: text("comment"),
  status: feedbackStatusEnum("status").default("new").notNull(),
  resolvedByUserId: uuid("resolved_by_user_id")
    .references(() => users.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Типы TypeScript
export type Feedback = typeof feedbacks.$inferSelect;
export type NewFeedback = typeof feedbacks.$inferInsert;

// Дополнительные типы для удобства
export type UpdateFeedback = Partial<Omit<NewFeedback, "id" | "createdAt" | "updatedAt">>;

export type FeedbackWithDetails = Feedback & {
  user?: {
    username: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  venue?: {
    name: string;
    city: string;
    country: string;
  } | null;
  resolvedByUser?: {
    username: string;
    firstName: string;
    lastName: string;
  } | null;
};

export type FeedbackStats = {
  totalFeedbacks: number;
  newFeedbacks: number;
  inReviewFeedbacks: number;
  resolvedFeedbacks: number;
  archivedFeedbacks: number;
  averageRating: number;
  feedbacksByCategory: Record<string, number>;
  feedbacksByRating: Record<number, number>;
  averageResolutionTime: number; // в днях
  resolutionRate: number; // в процентах
};

export type FeedbackGroupedByCategory = {
  category: string;
  feedbacksCount: number;
  averageRating: number;
  newCount: number;
  resolvedCount: number;
  resolutionRate: number; // в процентах
};

export type FeedbackGroupedByVenue = {
  venueId: string | null;
  venueName: string | null;
  feedbacksCount: number;
  averageRating: number;
  newCount: number;
  resolvedCount: number;
  resolutionRate: number; // в процентах
};

export type FeedbackGroupedByRating = {
  rating: number;
  feedbacksCount: number;
  percentage: number;
  averageResolutionTime: number; // в днях
};

export type FeedbackGroupedByStatus = {
  status: string;
  feedbacksCount: number;
  averageAge: number; // в днях
  averageRating: number;
};

export type FeedbackGroupedByDate = {
  date: string;
  feedbacksCount: number;
  averageRating: number;
  newCount: number;
  resolvedCount: number;
};

export type FeedbackSummary = {
  feedbackId: string;
  category: string;
  rating: number | null;
  comment: string | null;
  status: string;
  authorName: string | null;
  authorEmail: string | null;
  venueName: string | null;
  resolverName: string | null;
  createdAt: Date;
  updatedAt: Date;
  daysSinceCreated: number;
  isAnonymous: boolean;
};

export type UnresolvedFeedback = {
  feedbackId: string;
  category: string;
  rating: number | null;
  comment: string | null;
  authorName: string | null;
  venueName: string | null;
  createdAt: Date;
  daysSinceCreated: number;
  priority: "high" | "medium" | "low"; // на основе рейтинга и времени
};

export type FeedbackTrend = {
  period: string; // месяц/неделя
  feedbacksCount: number;
  averageRating: number;
  resolutionRate: number;
  topCategory: string;
  improvementScore: number; // изменение среднего рейтинга
};

export type VenueFeedbackReport = {
  venueId: string;
  venueName: string;
  totalFeedbacks: number;
  averageRating: number;
  categoryBreakdown: Record<string, {
    count: number;
    averageRating: number;
  }>;
  resolutionRate: number;
  averageResolutionTime: number;
  trendDirection: "improving" | "declining" | "stable";
};

// Константы для категорий обратной связи
export const FEEDBACK_CATEGORIES = {
  COURT_QUALITY: "court_quality" as const,
  GAME_EXPERIENCE: "game_experience" as const,
  TRAINING_QUALITY: "training_quality" as const,
  STAFF_SERVICE: "staff_service" as const,
  SYSTEM_SUGGESTION: "system_suggestion" as const,
  OTHER: "other" as const,
} as const;

// Константы для статусов обратной связи
export const FEEDBACK_STATUSES = {
  NEW: "new" as const,
  IN_REVIEW: "in_review" as const,
  RESOLVED: "resolved" as const,
  ARCHIVED: "archived" as const,
} as const;

// Константы для рейтингов
export const FEEDBACK_RATINGS = {
  VERY_BAD: 1,
  BAD: 2,
  NEUTRAL: 3,
  GOOD: 4,
  EXCELLENT: 5,
} as const;

export type FeedbackCategory = typeof FEEDBACK_CATEGORIES[keyof typeof FEEDBACK_CATEGORIES];
export type FeedbackStatus = typeof FEEDBACK_STATUSES[keyof typeof FEEDBACK_STATUSES];
export type FeedbackRating = typeof FEEDBACK_RATINGS[keyof typeof FEEDBACK_RATINGS];
