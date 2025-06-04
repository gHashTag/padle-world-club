/**
 * Схема таблицы booking для Drizzle ORM
 * Соответствует модели Booking из MAIN_MODEL.mdc
 */
export declare const bookings: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "booking";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "booking";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        courtId: import("drizzle-orm/pg-core").PgColumn<{
            name: "court_id";
            tableName: "booking";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        startTime: import("drizzle-orm/pg-core").PgColumn<{
            name: "start_time";
            tableName: "booking";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        endTime: import("drizzle-orm/pg-core").PgColumn<{
            name: "end_time";
            tableName: "booking";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        durationMinutes: import("drizzle-orm/pg-core").PgColumn<{
            name: "duration_minutes";
            tableName: "booking";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        status: import("drizzle-orm/pg-core").PgColumn<{
            name: "status";
            tableName: "booking";
            dataType: "string";
            columnType: "PgEnumColumn";
            data: "confirmed" | "pending_payment" | "cancelled" | "completed";
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: ["confirmed", "pending_payment", "cancelled", "completed"];
            baseColumn: never;
        }, {}, {}>;
        totalAmount: import("drizzle-orm/pg-core").PgColumn<{
            name: "total_amount";
            tableName: "booking";
            dataType: "string";
            columnType: "PgNumeric";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        currency: import("drizzle-orm/pg-core").PgColumn<{
            name: "currency";
            tableName: "booking";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        bookedByUserId: import("drizzle-orm/pg-core").PgColumn<{
            name: "booked_by_user_id";
            tableName: "booking";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        bookingPurpose: import("drizzle-orm/pg-core").PgColumn<{
            name: "booking_purpose";
            tableName: "booking";
            dataType: "string";
            columnType: "PgEnumColumn";
            data: "other" | "free_play" | "group_training" | "private_training" | "tournament_match";
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: ["free_play", "group_training", "private_training", "tournament_match", "other"];
            baseColumn: never;
        }, {}, {}>;
        relatedEntityId: import("drizzle-orm/pg-core").PgColumn<{
            name: "related_entity_id";
            tableName: "booking";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        notes: import("drizzle-orm/pg-core").PgColumn<{
            name: "notes";
            tableName: "booking";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        createdAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_at";
            tableName: "booking";
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
            tableName: "booking";
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
