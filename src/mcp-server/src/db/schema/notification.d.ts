/**
 * Схема для модели Notification (Уведомления)
 * Содержит определение таблицы notification и связанных типов
 */
export declare const notificationTypeEnum: import("drizzle-orm/pg-core").PgEnum<["booking_reminder", "game_invite", "tournament_update", "payment_confirmation", "package_expiration", "custom_message", "stock_alert"]>;
export declare const notifications: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "notification";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "notification";
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
            tableName: "notification";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        type: import("drizzle-orm/pg-core").PgColumn<{
            name: "type";
            tableName: "notification";
            dataType: "string";
            columnType: "PgEnumColumn";
            data: "booking_reminder" | "game_invite" | "tournament_update" | "payment_confirmation" | "package_expiration" | "custom_message" | "stock_alert";
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: ["booking_reminder", "game_invite", "tournament_update", "payment_confirmation", "package_expiration", "custom_message", "stock_alert"];
            baseColumn: never;
        }, {}, {}>;
        message: import("drizzle-orm/pg-core").PgColumn<{
            name: "message";
            tableName: "notification";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        channel: import("drizzle-orm/pg-core").PgColumn<{
            name: "channel";
            tableName: "notification";
            dataType: "string";
            columnType: "PgEnumColumn";
            data: "whatsapp" | "telegram" | "email" | "app_push";
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: ["whatsapp", "telegram", "email", "app_push"];
            baseColumn: never;
        }, {}, {}>;
        isSent: import("drizzle-orm/pg-core").PgColumn<{
            name: "is_sent";
            tableName: "notification";
            dataType: "boolean";
            columnType: "PgBoolean";
            data: boolean;
            driverParam: boolean;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        sentAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "sent_at";
            tableName: "notification";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        isRead: import("drizzle-orm/pg-core").PgColumn<{
            name: "is_read";
            tableName: "notification";
            dataType: "boolean";
            columnType: "PgBoolean";
            data: boolean;
            driverParam: boolean;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        readAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "read_at";
            tableName: "notification";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        relatedEntityId: import("drizzle-orm/pg-core").PgColumn<{
            name: "related_entity_id";
            tableName: "notification";
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
            tableName: "notification";
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
            tableName: "notification";
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
            tableName: "notification";
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
export type Notification = typeof notifications.$inferSelect;
export type NewNotification = typeof notifications.$inferInsert;
export type UpdateNotification = Partial<Omit<NewNotification, "id" | "createdAt" | "updatedAt">>;
export type NotificationWithUser = Notification & {
    user?: {
        username: string;
        firstName: string;
        lastName: string;
        email: string;
        phone: string | null;
    } | null;
};
export type NotificationStats = {
    totalNotifications: number;
    sentNotifications: number;
    unsentNotifications: number;
    readNotifications: number;
    unreadNotifications: number;
    notificationsByType: Record<string, number>;
    notificationsByChannel: Record<string, number>;
    averageDeliveryTime: number;
    deliverySuccessRate: number;
};
export type NotificationGroupedByType = {
    type: string;
    notificationsCount: number;
    sentCount: number;
    readCount: number;
    deliveryRate: number;
    readRate: number;
};
export type NotificationGroupedByChannel = {
    channel: string;
    notificationsCount: number;
    sentCount: number;
    readCount: number;
    deliveryRate: number;
    readRate: number;
    averageDeliveryTime: number;
};
export type NotificationGroupedByUser = {
    userId: string | null;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
    notificationsCount: number;
    unreadCount: number;
    lastNotificationDate: Date | null;
    preferredChannel: string | null;
};
export type NotificationGroupedByDate = {
    date: string;
    sentCount: number;
    readCount: number;
    deliveryRate: number;
    readRate: number;
};
export type NotificationSummary = {
    notificationId: string;
    type: string;
    channel: string;
    message: string;
    recipientName: string | null;
    recipientEmail: string | null;
    isSent: boolean;
    isRead: boolean;
    sentAt: Date | null;
    readAt: Date | null;
    createdAt: Date;
    relatedEntityType: string | null;
    relatedEntityId: string | null;
};
export type UnsentNotification = {
    notificationId: string;
    type: string;
    channel: string;
    message: string;
    recipientName: string | null;
    recipientContact: string | null;
    createdAt: Date;
    minutesSinceCreated: number;
    relatedEntityType: string | null;
};
export type NotificationDeliveryReport = {
    channel: string;
    totalSent: number;
    successfulDeliveries: number;
    failedDeliveries: number;
    deliveryRate: number;
    averageDeliveryTime: number;
    lastDeliveryAt: Date | null;
};
export declare const NOTIFICATION_TYPES: {
    readonly BOOKING_REMINDER: "booking_reminder";
    readonly GAME_INVITE: "game_invite";
    readonly TOURNAMENT_UPDATE: "tournament_update";
    readonly PAYMENT_CONFIRMATION: "payment_confirmation";
    readonly PACKAGE_EXPIRATION: "package_expiration";
    readonly CUSTOM_MESSAGE: "custom_message";
    readonly STOCK_ALERT: "stock_alert";
};
export declare const NOTIFICATION_CHANNELS: {
    readonly WHATSAPP: "whatsapp";
    readonly TELEGRAM: "telegram";
    readonly EMAIL: "email";
    readonly APP_PUSH: "app_push";
};
export declare const NOTIFICATION_RELATED_ENTITY_TYPES: {
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
    readonly TRAINING_PACKAGE: "training_package";
    readonly TASK: "task";
};
export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES];
export type NotificationChannel = typeof NOTIFICATION_CHANNELS[keyof typeof NOTIFICATION_CHANNELS];
export type NotificationRelatedEntityType = typeof NOTIFICATION_RELATED_ENTITY_TYPES[keyof typeof NOTIFICATION_RELATED_ENTITY_TYPES];
