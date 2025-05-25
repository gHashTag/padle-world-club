/**
 * Схема таблицы game_session для Drizzle ORM
 * Соответствует модели GameSession из MAIN_MODEL.mdc
 */
export declare const gameSessions: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "game_session";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "game_session";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        venueId: import("drizzle-orm/pg-core").PgColumn<{
            name: "venue_id";
            tableName: "game_session";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        courtId: import("drizzle-orm/pg-core").PgColumn<{
            name: "court_id";
            tableName: "game_session";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        startTime: import("drizzle-orm/pg-core").PgColumn<{
            name: "start_time";
            tableName: "game_session";
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
            tableName: "game_session";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        gameType: import("drizzle-orm/pg-core").PgColumn<{
            name: "game_type";
            tableName: "game_session";
            dataType: "string";
            columnType: "PgEnumColumn";
            data: "public_match" | "private_match";
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: ["public_match", "private_match"];
            baseColumn: never;
        }, {}, {}>;
        neededSkillLevel: import("drizzle-orm/pg-core").PgColumn<{
            name: "needed_skill_level";
            tableName: "game_session";
            dataType: "string";
            columnType: "PgEnumColumn";
            data: "beginner" | "intermediate" | "advanced" | "professional";
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: ["beginner", "intermediate", "advanced", "professional"];
            baseColumn: never;
        }, {}, {}>;
        maxPlayers: import("drizzle-orm/pg-core").PgColumn<{
            name: "max_players";
            tableName: "game_session";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        currentPlayers: import("drizzle-orm/pg-core").PgColumn<{
            name: "current_players";
            tableName: "game_session";
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
            tableName: "game_session";
            dataType: "string";
            columnType: "PgEnumColumn";
            data: "cancelled" | "completed" | "open_for_players" | "full" | "in_progress";
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: ["open_for_players", "full", "in_progress", "completed", "cancelled"];
            baseColumn: never;
        }, {}, {}>;
        createdByUserId: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_by_user_id";
            tableName: "game_session";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        hostUserId: import("drizzle-orm/pg-core").PgColumn<{
            name: "host_user_id";
            tableName: "game_session";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        matchScore: import("drizzle-orm/pg-core").PgColumn<{
            name: "match_score";
            tableName: "game_session";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        winnerUserIds: import("drizzle-orm/pg-core").PgColumn<{
            name: "winner_user_ids";
            tableName: "game_session";
            dataType: "array";
            columnType: "PgArray";
            data: string[];
            driverParam: string | string[];
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: import("drizzle-orm").Column<{
                name: "winner_user_ids";
                tableName: "game_session";
                dataType: "string";
                columnType: "PgUUID";
                data: string;
                driverParam: string;
                notNull: false;
                hasDefault: false;
                enumValues: undefined;
                baseColumn: never;
            }, object, object>;
        }, {}, {}>;
        relatedBookingId: import("drizzle-orm/pg-core").PgColumn<{
            name: "related_booking_id";
            tableName: "game_session";
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
            tableName: "game_session";
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
            tableName: "game_session";
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
