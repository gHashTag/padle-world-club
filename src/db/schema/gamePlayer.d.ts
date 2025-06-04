/**
 * Схема таблицы game_player для Drizzle ORM
 * Соответствует модели GamePlayer из MAIN_MODEL.mdc
 */
export declare const gamePlayers: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "game_player";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "game_player";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        gameSessionId: import("drizzle-orm/pg-core").PgColumn<{
            name: "game_session_id";
            tableName: "game_player";
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
            tableName: "game_player";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        participationStatus: import("drizzle-orm/pg-core").PgColumn<{
            name: "participation_status";
            tableName: "game_player";
            dataType: "string";
            columnType: "PgEnumColumn";
            data: "cancelled" | "registered" | "attended" | "no_show";
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: ["registered", "attended", "no_show", "cancelled"];
            baseColumn: never;
        }, {}, {}>;
        createdAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_at";
            tableName: "game_player";
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
            tableName: "game_player";
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
