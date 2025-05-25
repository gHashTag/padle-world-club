/**
 * Схема таблицы class_schedule для Drizzle ORM
 * Соответствует модели ClassSchedule из MAIN_MODEL.mdc
 */
export declare const classSchedules: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "class_schedule";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "class_schedule";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        classDefinitionId: import("drizzle-orm/pg-core").PgColumn<{
            name: "class_definition_id";
            tableName: "class_schedule";
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
            tableName: "class_schedule";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        instructorId: import("drizzle-orm/pg-core").PgColumn<{
            name: "instructor_id";
            tableName: "class_schedule";
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
            tableName: "class_schedule";
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
            tableName: "class_schedule";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        courtId: import("drizzle-orm/pg-core").PgColumn<{
            name: "court_id";
            tableName: "class_schedule";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        maxParticipants: import("drizzle-orm/pg-core").PgColumn<{
            name: "max_participants";
            tableName: "class_schedule";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        currentParticipants: import("drizzle-orm/pg-core").PgColumn<{
            name: "current_participants";
            tableName: "class_schedule";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        status: import("drizzle-orm/pg-core").PgColumn<{
            name: "status";
            tableName: "class_schedule";
            dataType: "string";
            columnType: "PgEnumColumn";
            data: "cancelled" | "completed" | "scheduled" | "draft";
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: ["scheduled", "cancelled", "completed", "draft"];
            baseColumn: never;
        }, {}, {}>;
        relatedBookingId: import("drizzle-orm/pg-core").PgColumn<{
            name: "related_booking_id";
            tableName: "class_schedule";
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
            tableName: "class_schedule";
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
            tableName: "class_schedule";
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
