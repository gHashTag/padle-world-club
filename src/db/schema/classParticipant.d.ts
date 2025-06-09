/**
 * Схема таблицы class_participant для Drizzle ORM
 * Соответствует модели ClassParticipant из MAIN_MODEL.mdc
 */
export declare const classParticipants: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "class_participant";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "class_participant";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        classScheduleId: import("drizzle-orm/pg-core").PgColumn<{
            name: "class_schedule_id";
            tableName: "class_participant";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        userId: import("drizzle-orm/pg-core").PgColumn<{
            name: "user_id";
            tableName: "class_participant";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        status: import("drizzle-orm/pg-core").PgColumn<{
            name: "status";
            tableName: "class_participant";
            dataType: "string";
            columnType: "PgEnumColumn";
            data: "cancelled" | "registered" | "attended" | "no_show";
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: ["registered", "attended", "no_show", "cancelled"];
            baseColumn: never;
        }, {}, {}>;
        paidWithPackageId: import("drizzle-orm/pg-core").PgColumn<{
            name: "paid_with_package_id";
            tableName: "class_participant";
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
            tableName: "class_participant";
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
            tableName: "class_participant";
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
