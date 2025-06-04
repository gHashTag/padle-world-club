/**
 * Схема таблицы tournament для Drizzle ORM
 * Соответствует модели Tournament из MAIN_MODEL.mdc
 */
export declare const tournaments: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "tournament";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "tournament";
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
            tableName: "tournament";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        name: import("drizzle-orm/pg-core").PgColumn<{
            name: "name";
            tableName: "tournament";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        description: import("drizzle-orm/pg-core").PgColumn<{
            name: "description";
            tableName: "tournament";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        tournamentType: import("drizzle-orm/pg-core").PgColumn<{
            name: "tournament_type";
            tableName: "tournament";
            dataType: "string";
            columnType: "PgEnumColumn";
            data: "other" | "singles_elimination" | "doubles_round_robin";
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: ["singles_elimination", "doubles_round_robin", "other"];
            baseColumn: never;
        }, {}, {}>;
        skillLevelCategory: import("drizzle-orm/pg-core").PgColumn<{
            name: "skill_level_category";
            tableName: "tournament";
            dataType: "string";
            columnType: "PgEnumColumn";
            data: "beginner" | "intermediate" | "advanced" | "professional";
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: ["beginner", "intermediate", "advanced", "professional"];
            baseColumn: never;
        }, {}, {}>;
        startDate: import("drizzle-orm/pg-core").PgColumn<{
            name: "start_date";
            tableName: "tournament";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        endDate: import("drizzle-orm/pg-core").PgColumn<{
            name: "end_date";
            tableName: "tournament";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        registrationFee: import("drizzle-orm/pg-core").PgColumn<{
            name: "registration_fee";
            tableName: "tournament";
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
            tableName: "tournament";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        maxParticipants: import("drizzle-orm/pg-core").PgColumn<{
            name: "max_participants";
            tableName: "tournament";
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
            tableName: "tournament";
            dataType: "string";
            columnType: "PgEnumColumn";
            data: "cancelled" | "completed" | "in_progress" | "upcoming" | "registration_open";
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: ["upcoming", "registration_open", "in_progress", "completed", "cancelled"];
            baseColumn: never;
        }, {}, {}>;
        rulesUrl: import("drizzle-orm/pg-core").PgColumn<{
            name: "rules_url";
            tableName: "tournament";
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
            tableName: "tournament";
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
            tableName: "tournament";
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
