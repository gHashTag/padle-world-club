/**
 * Схема для модели Feedback (Обратная связь)
 * Содержит определение таблицы feedback и связанных типов
 */
export declare const feedbackCategoryEnum: import("drizzle-orm/pg-core").PgEnum<["court_quality", "game_experience", "training_quality", "staff_service", "system_suggestion", "other"]>;
export declare const feedbackStatusEnum: import("drizzle-orm/pg-core").PgEnum<["new", "in_review", "resolved", "archived"]>;
export declare const feedbacks: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "feedback";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "feedback";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        userId: import("drizzle-orm/pg-core").PgColumn<{
            name: "user_id";
            tableName: "feedback";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        venueId: import("drizzle-orm/pg-core").PgColumn<{
            name: "venue_id";
            tableName: "feedback";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        category: import("drizzle-orm/pg-core").PgColumn<{
            name: "category";
            tableName: "feedback";
            dataType: "string";
            columnType: "PgEnumColumn";
            data: "other" | "court_quality" | "game_experience" | "training_quality" | "staff_service" | "system_suggestion";
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: ["court_quality", "game_experience", "training_quality", "staff_service", "system_suggestion", "other"];
            baseColumn: never;
        }, {}, {}>;
        rating: import("drizzle-orm/pg-core").PgColumn<{
            name: "rating";
            tableName: "feedback";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        comment: import("drizzle-orm/pg-core").PgColumn<{
            name: "comment";
            tableName: "feedback";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        status: import("drizzle-orm/pg-core").PgColumn<{
            name: "status";
            tableName: "feedback";
            dataType: "string";
            columnType: "PgEnumColumn";
            data: "new" | "in_review" | "resolved" | "archived";
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: ["new", "in_review", "resolved", "archived"];
            baseColumn: never;
        }, {}, {}>;
        resolvedByUserId: import("drizzle-orm/pg-core").PgColumn<{
            name: "resolved_by_user_id";
            tableName: "feedback";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        createdAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_at";
            tableName: "feedback";
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
            tableName: "feedback";
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
export type Feedback = typeof feedbacks.$inferSelect;
export type NewFeedback = typeof feedbacks.$inferInsert;
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
    averageResolutionTime: number;
    resolutionRate: number;
};
export type FeedbackGroupedByCategory = {
    category: string;
    feedbacksCount: number;
    averageRating: number;
    newCount: number;
    resolvedCount: number;
    resolutionRate: number;
};
export type FeedbackGroupedByVenue = {
    venueId: string | null;
    venueName: string | null;
    feedbacksCount: number;
    averageRating: number;
    newCount: number;
    resolvedCount: number;
    resolutionRate: number;
};
export type FeedbackGroupedByRating = {
    rating: number;
    feedbacksCount: number;
    percentage: number;
    averageResolutionTime: number;
};
export type FeedbackGroupedByStatus = {
    status: string;
    feedbacksCount: number;
    averageAge: number;
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
    priority: "high" | "medium" | "low";
};
export type FeedbackTrend = {
    period: string;
    feedbacksCount: number;
    averageRating: number;
    resolutionRate: number;
    topCategory: string;
    improvementScore: number;
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
export declare const FEEDBACK_CATEGORIES: {
    readonly COURT_QUALITY: "court_quality";
    readonly GAME_EXPERIENCE: "game_experience";
    readonly TRAINING_QUALITY: "training_quality";
    readonly STAFF_SERVICE: "staff_service";
    readonly SYSTEM_SUGGESTION: "system_suggestion";
    readonly OTHER: "other";
};
export declare const FEEDBACK_STATUSES: {
    readonly NEW: "new";
    readonly IN_REVIEW: "in_review";
    readonly RESOLVED: "resolved";
    readonly ARCHIVED: "archived";
};
export declare const FEEDBACK_RATINGS: {
    readonly VERY_BAD: 1;
    readonly BAD: 2;
    readonly NEUTRAL: 3;
    readonly GOOD: 4;
    readonly EXCELLENT: 5;
};
export type FeedbackCategory = typeof FEEDBACK_CATEGORIES[keyof typeof FEEDBACK_CATEGORIES];
export type FeedbackStatus = typeof FEEDBACK_STATUSES[keyof typeof FEEDBACK_STATUSES];
export type FeedbackRating = typeof FEEDBACK_RATINGS[keyof typeof FEEDBACK_RATINGS];
