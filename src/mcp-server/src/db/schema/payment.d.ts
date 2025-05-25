/**
 * Схема таблицы payment для Drizzle ORM
 * Соответствует модели Payment из MAIN_MODEL.mdc
 */
export declare const payments: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "payment";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "payment";
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
            tableName: "payment";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        amount: import("drizzle-orm/pg-core").PgColumn<{
            name: "amount";
            tableName: "payment";
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
            tableName: "payment";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        status: import("drizzle-orm/pg-core").PgColumn<{
            name: "status";
            tableName: "payment";
            dataType: "string";
            columnType: "PgEnumColumn";
            data: "success" | "failed" | "pending" | "refunded" | "partial";
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: ["success", "failed", "pending", "refunded", "partial"];
            baseColumn: never;
        }, {}, {}>;
        paymentMethod: import("drizzle-orm/pg-core").PgColumn<{
            name: "payment_method";
            tableName: "payment";
            dataType: "string";
            columnType: "PgEnumColumn";
            data: "card" | "cash" | "bank_transfer" | "bonus_points";
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: ["card", "cash", "bank_transfer", "bonus_points"];
            baseColumn: never;
        }, {}, {}>;
        gatewayTransactionId: import("drizzle-orm/pg-core").PgColumn<{
            name: "gateway_transaction_id";
            tableName: "payment";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        description: import("drizzle-orm/pg-core").PgColumn<{
            name: "description";
            tableName: "payment";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        relatedBookingParticipantId: import("drizzle-orm/pg-core").PgColumn<{
            name: "related_booking_participant_id";
            tableName: "payment";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        relatedOrderId: import("drizzle-orm/pg-core").PgColumn<{
            name: "related_order_id";
            tableName: "payment";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        relatedUserTrainingPackageId: import("drizzle-orm/pg-core").PgColumn<{
            name: "related_user_training_package_id";
            tableName: "payment";
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
            tableName: "payment";
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
            tableName: "payment";
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
