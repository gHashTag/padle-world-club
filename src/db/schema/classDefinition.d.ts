/**
 * Схема таблицы class_definition для Drizzle ORM
 * Соответствует модели ClassDefinition из MAIN_MODEL.mdc
 */
export declare const classDefinitions: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "class_definition";
    schema: undefined;
    columns: {
        id: import("drizzle-orm/pg-core").PgColumn<{
            name: "id";
            tableName: "class_definition";
            dataType: "string";
            columnType: "PgUUID";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            enumValues: undefined;
            baseColumn: never;
        }, {}, {}>;
        name: import("drizzle-orm/pg-core").PgColumn<{
            name: "name";
            tableName: "class_definition";
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
            tableName: "class_definition";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        classType: import("drizzle-orm/pg-core").PgColumn<{
            name: "class_type";
            tableName: "class_definition";
            dataType: "string";
            columnType: "PgEnumColumn";
            data: "group_training" | "open_play_session" | "coached_drill";
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: ["group_training", "open_play_session", "coached_drill"];
            baseColumn: never;
        }, {}, {}>;
        basePrice: import("drizzle-orm/pg-core").PgColumn<{
            name: "base_price";
            tableName: "class_definition";
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
            tableName: "class_definition";
            dataType: "string";
            columnType: "PgVarchar";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
        }, {}, {}>;
        minSkillLevel: import("drizzle-orm/pg-core").PgColumn<{
            name: "min_skill_level";
            tableName: "class_definition";
            dataType: "string";
            columnType: "PgEnumColumn";
            data: "beginner" | "intermediate" | "advanced" | "professional";
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: ["beginner", "intermediate", "advanced", "professional"];
            baseColumn: never;
        }, {}, {}>;
        maxSkillLevel: import("drizzle-orm/pg-core").PgColumn<{
            name: "max_skill_level";
            tableName: "class_definition";
            dataType: "string";
            columnType: "PgEnumColumn";
            data: "beginner" | "intermediate" | "advanced" | "professional";
            driverParam: string;
            notNull: false;
            hasDefault: false;
            enumValues: ["beginner", "intermediate", "advanced", "professional"];
            baseColumn: never;
        }, {}, {}>;
        isActive: import("drizzle-orm/pg-core").PgColumn<{
            name: "is_active";
            tableName: "class_definition";
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
            tableName: "class_definition";
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
            tableName: "class_definition";
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
