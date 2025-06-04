#!/usr/bin/env node

/**
 * Padle World Club MCP Server
 * 
 * Model Context Protocol server for database operations
 * Provides tools, resources, and prompts for User management
 */

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { initializeDatabase } from "./database.js";
import { registerUserTools } from "./tools/user-tools.js";
import { registerUserResources } from "./resources/user-resources.js";
import { registerUserPrompts } from "./prompts/user-prompts.js";

/**
 * Main function to start the MCP server
 */
async function main() {
  try {
    // Initialize database connection
    console.error("🔌 Initializing database connection...");
    initializeDatabase();
    console.error("✅ Database connected successfully");

    // Create MCP server
    const server = new McpServer({
      name: "padle-world-club-mcp-server",
      version: "1.0.0",
      description: "MCP Server for Padle World Club database operations"
    });

    console.error("🚀 Starting Padle World Club MCP Server...");

    // Register User tools
    console.error("🔧 Registering User tools...");
    registerUserTools(server);

    // Register User resources  
    console.error("📚 Registering User resources...");
    registerUserResources(server);

    // Register User prompts
    console.error("💬 Registering User prompts...");
    registerUserPrompts(server);

    console.error("✅ All components registered successfully");

    // Create stdio transport
    const transport = new StdioServerTransport();
    
    console.error("🔗 Connecting to stdio transport...");
    await server.connect(transport);
    
    console.error("🎉 Padle World Club MCP Server is running!");
    console.error("📋 Available tools:");
    console.error("   - create_user: Create a new user");
    console.error("   - get_user_by_id: Get user by ID");
    console.error("   - get_user_by_username: Get user by username");
    console.error("   - get_user_by_email: Get user by email");
    console.error("   - update_user: Update user data");
    console.error("   - delete_user: Delete user");
    console.error("   - list_users: List all users");
    console.error("");
    console.error("📚 Available resources:");
    console.error("   - user://profile/{userId}: Get user profile");
    console.error("   - user://search/{username}: Search user by username");
    console.error("   - users://list: Get all users list");
    console.error("   - users://stats: Get user statistics");
    console.error("");
    console.error("💬 Available prompts:");
    console.error("   - user-registration: Help with user registration");
    console.error("   - user-profile-analysis: Analyze user profile");
    console.error("   - user-search-compare: Search and compare users");
    console.error("   - user-management: Manage user actions");
    console.error("   - user-stats-report: Generate user statistics report");
    console.error("   - user-onboarding: Help with user onboarding");

  } catch (error) {
    console.error("❌ Failed to start MCP server:", error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.error("\n🛑 Shutting down MCP server...");
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.error("\n🛑 Shutting down MCP server...");
  process.exit(0);
});

// Start the server
main().catch((error) => {
  console.error("❌ Unhandled error:", error);
  process.exit(1);
});
