/**
 * Database connection and configuration for MCP Server
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { users } from "./simple-user-schema.js";

// Simple schema for MCP server
const schema = { users };

// Database connection
let db: ReturnType<typeof drizzle<typeof schema>> | null = null;

/**
 * Initialize database connection
 */
export function initializeDatabase(): ReturnType<typeof drizzle<typeof schema>> {
  if (db) {
    return db;
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  const client = postgres(databaseUrl);
  db = drizzle(client, { schema });

  return db;
}

/**
 * Get database instance
 */
export function getDatabase(): ReturnType<typeof drizzle<typeof schema>> {
  if (!db) {
    return initializeDatabase();
  }
  return db;
}
