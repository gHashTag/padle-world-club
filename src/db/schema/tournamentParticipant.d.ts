/**
 * Схема таблицы tournament_participant для Drizzle ORM
 * Соответствует модели TournamentParticipant из MAIN_MODEL.mdc
 */
export declare const tournamentParticipants: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "tournament_participant";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "tournament_participant";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        tournamentId: import("drizzle-orm/pg-core").PgColumn<{
            name: "tournament_id";
            tableName: "tournament_participant";
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
            tableName: "tournament_participant";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        registrationDate: import("drizzle-orm/pg-core").PgColumn<{
            name: "registration_date";
            tableName: "tournament_participant";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        status: import("drizzle-orm/pg-core").PgColumn<{
            name: "status";
            tableName: "tournament_participant";
            dataType: "string";
            columnType: "PgEnumColumn";
            data: "registered" | "checked_in" | "withdrawn";
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: ["registered", "checked_in", "withdrawn"];
            baseColumn: never;
        }, {}, {}>;
        partnerUserId: import("drizzle-orm/pg-core").PgColumn<{
            name: "partner_user_id";
            tableName: "tournament_participant";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        teamId: import("drizzle-orm/pg-core").PgColumn<{
            name: "team_id";
            tableName: "tournament_participant";
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
            tableName: "tournament_participant";
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
            tableName: "tournament_participant";
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
