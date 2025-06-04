export declare const userAccountLinks: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "user_account_link";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "user_account_link";
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
            tableName: "user_account_link";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        platform: import("drizzle-orm/pg-core").PgColumn<{
            name: "platform";
            tableName: "user_account_link";
            dataType: "string";
            columnType: "PgEnumColumn";
            data: "whatsapp" | "telegram" | "email" | "app_push";
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: ["whatsapp", "telegram", "email", "app_push"];
            baseColumn: never;
        }, {}, {}>;
        platformUserId: import("drizzle-orm/pg-core").PgColumn<{
            name: "platform_user_id";
            tableName: "user_account_link";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        isPrimary: import("drizzle-orm/pg-core").PgColumn<{
            name: "is_primary";
            tableName: "user_account_link";
            dataType: "boolean";
            columnType: "PgBoolean";
            data: boolean;
            driverParam: boolean;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        createdAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_at";
            tableName: "user_account_link";
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
            tableName: "user_account_link";
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
export declare const userAccountLinksRelations: import("drizzle-orm").Relations<"user_account_link", {
    user: import("drizzle-orm").One<"user", true>;
}>;
