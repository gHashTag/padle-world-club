/**
 * Configuration for MCP Server
 */

export const config = {
  database: {
    url: process.env.DATABASE_URL || "postgresql://localhost:5432/padle_world_club"
  },
  server: {
    name: "padle-world-club-mcp-server",
    version: "1.0.0"
  }
};
