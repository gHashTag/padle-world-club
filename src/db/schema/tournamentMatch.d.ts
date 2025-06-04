/**
 * Схема для модели TournamentMatch (Матчи турниров)
 * Содержит определение таблицы tournament_match и связанных типов
 */
export declare const tournamentMatches: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "tournament_match";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "tournament_match";
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
            tableName: "tournament_match";
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
            tableName: "tournament_match";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        matchNumber: import("drizzle-orm/pg-core").PgColumn<{
            name: "match_number";
            tableName: "tournament_match";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        round: import("drizzle-orm/pg-core").PgColumn<{
            name: "round";
            tableName: "tournament_match";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        startTime: import("drizzle-orm/pg-core").PgColumn<{
            name: "start_time";
            tableName: "tournament_match";
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
            tableName: "tournament_match";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        status: import("drizzle-orm/pg-core").PgColumn<{
            name: "status";
            tableName: "tournament_match";
            dataType: "string";
            columnType: "PgEnumColumn";
            data: "cancelled" | "completed" | "in_progress" | "upcoming" | "registration_open";
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: ["upcoming", "registration_open", "in_progress", "completed", "cancelled"];
            baseColumn: never;
        }, {}, {}>;
        score: import("drizzle-orm/pg-core").PgColumn<{
            name: "score";
            tableName: "tournament_match";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        winnerTeamId: import("drizzle-orm/pg-core").PgColumn<{
            name: "winner_team_id";
            tableName: "tournament_match";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        loserTeamId: import("drizzle-orm/pg-core").PgColumn<{
            name: "loser_team_id";
            tableName: "tournament_match";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        winnerPlayerIds: import("drizzle-orm/pg-core").PgColumn<{
            name: "winner_player_ids";
            tableName: "tournament_match";
            dataType: "array";
            columnType: "PgArray";
            data: string[];
            driverParam: string | string[];
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: import("drizzle-orm").Column<{
                name: "winner_player_ids";
                tableName: "tournament_match";
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
        loserPlayerIds: import("drizzle-orm/pg-core").PgColumn<{
            name: "loser_player_ids";
            tableName: "tournament_match";
            dataType: "array";
            columnType: "PgArray";
            data: string[];
            driverParam: string | string[];
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: import("drizzle-orm").Column<{
                name: "loser_player_ids";
                tableName: "tournament_match";
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
        createdAt: import("drizzle-orm/pg-core").PgColumn<{
            name: "created_at";
            tableName: "tournament_match";
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
            tableName: "tournament_match";
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
export type TournamentMatchStatus = "upcoming" | "registration_open" | "in_progress" | "completed" | "cancelled";
export type TournamentMatch = typeof tournamentMatches.$inferSelect;
export type NewTournamentMatch = typeof tournamentMatches.$inferInsert;
export type UpdateTournamentMatch = Partial<Omit<NewTournamentMatch, "id" | "createdAt" | "updatedAt">>;
export type TournamentMatchWithDetails = TournamentMatch & {
    tournament: {
        name: string;
        startDate: Date;
        endDate: Date;
        status: string;
    };
    court?: {
        name: string;
        courtType: string;
    } | null;
    winnerTeam?: {
        name: string;
        player1: {
            firstName: string;
            lastName: string;
        };
        player2?: {
            firstName: string;
            lastName: string;
        } | null;
    } | null;
    loserTeam?: {
        name: string;
        player1: {
            firstName: string;
            lastName: string;
        };
        player2?: {
            firstName: string;
            lastName: string;
        } | null;
    } | null;
};
export type TournamentMatchStats = {
    totalMatches: number;
    completedMatches: number;
    upcomingMatches: number;
    inProgressMatches: number;
    cancelledMatches: number;
    averageMatchDuration: number;
    averageMatchesPerTournament: number;
};
export type TournamentMatchGroupedByTournament = {
    tournamentId: string;
    tournamentName: string;
    matchesCount: number;
    completedMatchesCount: number;
    upcomingMatchesCount: number;
    inProgressMatchesCount: number;
};
export type TournamentMatchGroupedByRound = {
    round: string;
    matchesCount: number;
    completedMatchesCount: number;
    upcomingMatchesCount: number;
};
export type TournamentMatchByDay = {
    date: string;
    matchesCount: number;
    completedMatchesCount: number;
    upcomingMatchesCount: number;
};
