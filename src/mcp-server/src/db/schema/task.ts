/**
 * Схема для модели Task (Задачи)
 * Содержит определение таблицы task и связанных типов
 */

import { pgTable, uuid, varchar, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { users } from "./user";
import { venues } from "./venue";

// Enum для статусов задач
export const taskStatusEnum = pgEnum("task_status", [
  "open",
  "in_progress",
  "completed",
  "blocked"
]);

// Enum для приоритетов задач
export const taskPriorityEnum = pgEnum("task_priority", [
  "low",
  "medium", 
  "high",
  "urgent"
]);

// Таблица задач
export const tasks = pgTable("task", {
  id: uuid("id").defaultRandom().primaryKey(),
  assignedToUserId: uuid("assigned_to_user_id")
    .references(() => users.id, { onDelete: "set null" }),
  createdByUserId: uuid("created_by_user_id")
    .notNull()
    .references(() => users.id, { onDelete: "restrict" }),
  venueId: uuid("venue_id")
    .references(() => venues.id, { onDelete: "set null" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  dueDate: timestamp("due_date", { withTimezone: true }),
  status: taskStatusEnum("status").notNull(),
  priority: taskPriorityEnum("priority").notNull(),
  // Полиморфные связи
  relatedEntityId: uuid("related_entity_id"),
  relatedEntityType: varchar("related_entity_type", { length: 50 }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// Типы TypeScript
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;

// Дополнительные типы для удобства
export type UpdateTask = Partial<Omit<NewTask, "id" | "createdAt" | "updatedAt">>;

export type TaskWithDetails = Task & {
  assignedToUser?: {
    username: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  createdByUser: {
    username: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  venue?: {
    name: string;
    city: string;
    country: string;
  } | null;
};

export type TaskStats = {
  totalTasks: number;
  openTasks: number;
  inProgressTasks: number;
  completedTasks: number;
  blockedTasks: number;
  overdueTasks: number;
  tasksWithoutAssignee: number;
  averageCompletionTime: number; // в днях
  tasksByPriority: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
};

export type TaskGroupedByStatus = {
  status: string;
  tasksCount: number;
  averageAge: number; // в днях
};

export type TaskGroupedByPriority = {
  priority: string;
  tasksCount: number;
  completedCount: number;
  completionRate: number; // в процентах
};

export type TaskGroupedByAssignee = {
  assigneeId: string | null;
  assigneeName: string | null;
  assignedTasksCount: number;
  completedTasksCount: number;
  inProgressTasksCount: number;
  overdueTasksCount: number;
  averageCompletionTime: number; // в днях
};

export type TaskGroupedByVenue = {
  venueId: string | null;
  venueName: string | null;
  tasksCount: number;
  completedCount: number;
  pendingCount: number;
};

export type TaskGroupedByDate = {
  date: string;
  createdCount: number;
  completedCount: number;
  overdueCount: number;
};

export type TaskSummary = {
  taskId: string;
  title: string;
  status: string;
  priority: string;
  assigneeName: string | null;
  createdByName: string;
  venueName: string | null;
  dueDate: Date | null;
  createdAt: Date;
  isOverdue: boolean;
  daysSinceCreated: number;
  daysUntilDue: number | null;
};

export type OverdueTask = {
  taskId: string;
  title: string;
  priority: string;
  assigneeName: string | null;
  assigneeEmail: string | null;
  venueName: string | null;
  dueDate: Date;
  daysOverdue: number;
  createdByName: string;
};

// Константы для статусов задач
export const TASK_STATUSES = {
  OPEN: "open" as const,
  IN_PROGRESS: "in_progress" as const,
  COMPLETED: "completed" as const,
  BLOCKED: "blocked" as const,
} as const;

// Константы для приоритетов задач
export const TASK_PRIORITIES = {
  LOW: "low" as const,
  MEDIUM: "medium" as const,
  HIGH: "high" as const,
  URGENT: "urgent" as const,
} as const;

// Константы для типов связанных сущностей
export const RELATED_ENTITY_TYPES = {
  BOOKING: "booking" as const,
  USER: "user" as const,
  COURT: "court" as const,
  VENUE: "venue" as const,
  TOURNAMENT: "tournament" as const,
  CLASS_SCHEDULE: "class_schedule" as const,
  GAME_SESSION: "game_session" as const,
  ORDER: "order" as const,
  PAYMENT: "payment" as const,
  PRODUCT: "product" as const,
} as const;

export type TaskStatus = typeof TASK_STATUSES[keyof typeof TASK_STATUSES];
export type TaskPriority = typeof TASK_PRIORITIES[keyof typeof TASK_PRIORITIES];
export type RelatedEntityType = typeof RELATED_ENTITY_TYPES[keyof typeof RELATED_ENTITY_TYPES];
