/**
 * Схема таблицы user_training_package для Drizzle ORM
 * Соответствует модели UserTrainingPackage из MAIN_MODEL.mdc
 */
export declare const userTrainingPackages: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "user_training_package";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "user_training_package";
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
            tableName: "user_training_package";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        packageDefinitionId: import("drizzle-orm/pg-core").PgColumn<{
            name: "package_definition_id";
            tableName: "user_training_package";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        purchaseDate: import("drizzle-orm/pg-core").PgColumn<{
            name: "purchase_date";
            tableName: "user_training_package";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        expirationDate: import("drizzle-orm/pg-core").PgColumn<{
            name: "expiration_date";
            tableName: "user_training_package";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        sessionsUsed: import("drizzle-orm/pg-core").PgColumn<{
            name: "sessions_used";
            tableName: "user_training_package";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        sessionsTotal: import("drizzle-orm/pg-core").PgColumn<{
            name: "sessions_total";
            tableName: "user_training_package";
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
            tableName: "user_training_package";
            dataType: "string";
            columnType: "PgEnumColumn";
            data: "cancelled" | "completed" | "active" | "expired";
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: ["active", "expired", "completed", "cancelled"];
            baseColumn: never;
        }, {}, {}>;
        createdAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_at";
            tableName: "user_training_package";
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
            tableName: "user_training_package";
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
