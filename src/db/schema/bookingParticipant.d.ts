/**
 * Схема таблицы booking_participant для Drizzle ORM
 * Соответствует модели BookingParticipant из MAIN_MODEL.mdc
 */
export declare const bookingParticipants: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "booking_participant";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "booking_participant";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        bookingId: import("drizzle-orm/pg-core").PgColumn<{
            name: "booking_id";
            tableName: "booking_participant";
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
            tableName: "booking_participant";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        amountOwed: import("drizzle-orm/pg-core").PgColumn<{
            name: "amount_owed";
            tableName: "booking_participant";
            dataType: "string";
            columnType: "PgNumeric";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        amountPaid: import("drizzle-orm/pg-core").PgColumn<{
            name: "amount_paid";
            tableName: "booking_participant";
            dataType: "string";
            columnType: "PgNumeric";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        paymentStatus: import("drizzle-orm/pg-core").PgColumn<{
            name: "payment_status";
            tableName: "booking_participant";
            dataType: "string";
            columnType: "PgEnumColumn";
            data: "success" | "failed" | "pending" | "refunded" | "partial";
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: ["success", "failed", "pending", "refunded", "partial"];
            baseColumn: never;
        }, {}, {}>;
        participationStatus: import("drizzle-orm/pg-core").PgColumn<{
            name: "participation_status";
            tableName: "booking_participant";
            dataType: "string";
            columnType: "PgEnumColumn";
            data: "cancelled" | "registered" | "attended" | "no_show";
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: ["registered", "attended", "no_show", "cancelled"];
            baseColumn: never;
        }, {}, {}>;
        isHost: import("drizzle-orm/pg-core").PgColumn<{
            name: "is_host";
            tableName: "booking_participant";
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
            tableName: "booking_participant";
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
            tableName: "booking_participant";
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
