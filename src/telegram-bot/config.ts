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
  openaiApiKey: string;
  aiModel: string;
  aiTemperature: number;
  aiMaxTokens: number;
}

export function getBotConfig(): BotConfig {
  const botToken = process.env.BOT_TOKEN;
  const databaseUrl = process.env.DATABASE_URL;
  const openaiApiKey = process.env.OPENAI_API_KEY;
  const adminUserIds = process.env.ADMIN_USER_IDS?.split(',').map(id => parseInt(id.trim())) || [];

  if (!botToken) {
    throw new Error("BOT_TOKEN environment variable is required");
  }

  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is required");
  }

  if (!openaiApiKey) {
    throw new Error("OPENAI_API_KEY environment variable is required for AI-powered Text-to-SQL");
  }

  if (adminUserIds.length === 0) {
    console.warn("Warning: No admin user IDs configured. Set ADMIN_USER_IDS environment variable.");
  }

  return {
    botToken,
    databaseUrl,
    openaiApiKey,
    adminUserIds,
    maxQueryResults: parseInt(process.env.MAX_QUERY_RESULTS || '100'),
    queryTimeout: parseInt(process.env.QUERY_TIMEOUT || '30000'),
    enableLogging: process.env.ENABLE_LOGGING !== 'false',
    logLevel: (process.env.LOG_LEVEL as any) || 'info',
    aiModel: process.env.AI_MODEL || 'gpt-4o-mini',
    aiTemperature: parseFloat(process.env.AI_TEMPERATURE || '0.1'),
    aiMaxTokens: parseInt(process.env.AI_MAX_TOKENS || '1000'),
  };
}

// Примеры переменных окружения для .env файла
export const ENV_EXAMPLE = `
# Telegram Bot Configuration
BOT_TOKEN=your_bot_token_here
ADMIN_USER_IDS=123456789,987654321

# Database Configuration
DATABASE_URL=postgresql://postgres:password@localhost:5432/padle_world_club

# OpenAI API Configuration (for AI-powered Text-to-SQL)
OPENAI_API_KEY=your_openai_api_key_here

# Optional Settings
MAX_QUERY_RESULTS=100
QUERY_TIMEOUT=30000
ENABLE_LOGGING=true
LOG_LEVEL=info

# AI Settings
AI_MODEL=gpt-4o-mini
AI_TEMPERATURE=0.1
AI_MAX_TOKENS=1000
`;
