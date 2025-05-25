/**
 * Схема таблицы rating_change для Drizzle ORM
 * Соответствует модели RatingChange из MAIN_MODEL.mdc
 */
export declare const ratingChanges: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "rating_change";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "rating_change";
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
            tableName: "rating_change";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        oldRating: import("drizzle-orm/pg-core").PgColumn<{
            name: "old_rating";
            tableName: "rating_change";
            dataType: "number";
            columnType: "PgReal";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        newRating: import("drizzle-orm/pg-core").PgColumn<{
            name: "new_rating";
            tableName: "rating_change";
            dataType: "number";
            columnType: "PgReal";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        changeReason: import("drizzle-orm/pg-core").PgColumn<{
            name: "change_reason";
            tableName: "rating_change";
            dataType: "string";
            columnType: "PgEnumColumn";
            data: "tournament_match" | "game_session" | "manual_adjustment";
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: ["game_session", "tournament_match", "manual_adjustment"];
            baseColumn: never;
        }, {}, {}>;
        relatedGameSessionId: import("drizzle-orm/pg-core").PgColumn<{
            name: "related_game_session_id";
            tableName: "rating_change";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        relatedTournamentMatchId: import("drizzle-orm/pg-core").PgColumn<{
            name: "related_tournament_match_id";
            tableName: "rating_change";
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
            tableName: "rating_change";
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
            tableName: "rating_change";
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
            tableName: "rating_change";
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
