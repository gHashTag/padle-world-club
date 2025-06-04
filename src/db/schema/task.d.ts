/**
 * Схема для модели Task (Задачи)
 * Содержит определение таблицы task и связанных типов
 */
export declare const taskStatusEnum: import("drizzle-orm/pg-core").PgEnum<["open", "in_progress", "completed", "blocked"]>;
export declare const taskPriorityEnum: import("drizzle-orm/pg-core").PgEnum<["low", "medium", "high", "urgent"]>;
export declare const tasks: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "task";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "task";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        assignedToUserId: import("drizzle-orm/pg-core").PgColumn<{
            name: "assigned_to_user_id";
            tableName: "task";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        createdByUserId: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_by_user_id";
            tableName: "task";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        venueId: import("drizzle-orm/pg-core").PgColumn<{
            name: "venue_id";
            tableName: "task";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        title: import("drizzle-orm/pg-core").PgColumn<{
            name: "title";
            tableName: "task";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        description: import("drizzle-orm/pg-core").PgColumn<{
            name: "description";
            tableName: "task";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        dueDate: import("drizzle-orm/pg-core").PgColumn<{
            name: "due_date";
            tableName: "task";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        status: import("drizzle-orm/pg-core").PgColumn<{
            name: "status";
            tableName: "task";
            dataType: "string";
            columnType: "PgEnumColumn";
            data: "completed" | "in_progress" | "open" | "blocked";
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: ["open", "in_progress", "completed", "blocked"];
            baseColumn: never;
        }, {}, {}>;
        priority: import("drizzle-orm/pg-core").PgColumn<{
            name: "priority";
            tableName: "task";
            dataType: "string";
            columnType: "PgEnumColumn";
            data: "low" | "medium" | "high" | "urgent";
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: ["low", "medium", "high", "urgent"];
            baseColumn: never;
        }, {}, {}>;
        relatedEntityId: import("drizzle-orm/pg-core").PgColumn<{
            name: "related_entity_id";
            tableName: "task";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        relatedEntityType: import("drizzle-orm/pg-core").PgColumn<{
            name: "related_entity_type";
            tableName: "task";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        createdAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_at";
            tableName: "task";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        updatedAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "updated_at";
            tableName: "task";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
export type Task = typeof tasks.$inferSelect;
export type NewTask = typeof tasks.$inferInsert;
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
    averageCompletionTime: number;
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
    averageAge: number;
};
export type TaskGroupedByPriority = {
    priority: string;
    tasksCount: number;
    completedCount: number;
    completionRate: number;
};
export type TaskGroupedByAssignee = {
    assigneeId: string | null;
    assigneeName: string | null;
    assignedTasksCount: number;
    completedTasksCount: number;
    inProgressTasksCount: number;
    overdueTasksCount: number;
    averageCompletionTime: number;
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
export declare const TASK_STATUSES: {
    readonly OPEN: "open";
    readonly IN_PROGRESS: "in_progress";
    readonly COMPLETED: "completed";
    readonly BLOCKED: "blocked";
};
export declare const TASK_PRIORITIES: {
    readonly LOW: "low";
    readonly MEDIUM: "medium";
    readonly HIGH: "high";
    readonly URGENT: "urgent";
};
export declare const RELATED_ENTITY_TYPES: {
    readonly BOOKING: "booking";
    readonly USER: "user";
    readonly COURT: "court";
    readonly VENUE: "venue";
    readonly TOURNAMENT: "tournament";
    readonly CLASS_SCHEDULE: "class_schedule";
    readonly GAME_SESSION: "game_session";
    readonly ORDER: "order";
    readonly PAYMENT: "payment";
    readonly PRODUCT: "product";
};
export type TaskStatus = typeof TASK_STATUSES[keyof typeof TASK_STATUSES];
export type TaskPriority = typeof TASK_PRIORITIES[keyof typeof TASK_PRIORITIES];
export type RelatedEntityType = typeof RELATED_ENTITY_TYPES[keyof typeof RELATED_ENTITY_TYPES];
