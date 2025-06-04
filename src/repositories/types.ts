/**
 * Общие типы для репозиториев
 */

import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import * as schema from "../db/schema";

// Общий тип для базы данных, поддерживающий и postgres-js и node-postgres
export type DatabaseType = PostgresJsDatabase<typeof schema> | NodePgDatabase<typeof schema>;
