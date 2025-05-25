/**
 * Telegram Bot Configuration
 */

export interface BotConfig {
  botToken: string;
  databaseUrl: string;
  adminUserIds: number[];
  maxQueryResults: number;
  queryTimeout: number;
  enableLogging: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export function getBotConfig(): BotConfig {
  const botToken = process.env.BOT_TOKEN;
  const databaseUrl = process.env.DATABASE_URL;
  const adminUserIds = process.env.ADMIN_USER_IDS?.split(',').map(id => parseInt(id.trim())) || [];

  if (!botToken) {
    throw new Error("BOT_TOKEN environment variable is required");
  }

  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  if (adminUserIds.length === 0) {
    console.warn("Warning: No admin user IDs configured. Set ADMIN_USER_IDS environment variable.");
  }

  return {
    botToken,
    databaseUrl,
    adminUserIds,
    maxQueryResults: parseInt(process.env.MAX_QUERY_RESULTS || '100'),
    queryTimeout: parseInt(process.env.QUERY_TIMEOUT || '30000'),
    enableLogging: process.env.ENABLE_LOGGING !== 'false',
    logLevel: (process.env.LOG_LEVEL as any) || 'info',
  };
}

// Примеры переменных окружения для .env файла
export const ENV_EXAMPLE = `
# Telegram Bot Configuration
BOT_TOKEN=your_bot_token_here
ADMIN_USER_IDS=123456789,987654321

# Database Configuration  
DATABASE_URL=postgresql://postgres:password@localhost:5432/padle_world_club

# Optional Settings
MAX_QUERY_RESULTS=100
QUERY_TIMEOUT=30000
ENABLE_LOGGING=true
LOG_LEVEL=info
`;
