import * as dotenv from "dotenv";
import { LogLevel } from "./utils/logger"; // Предполагается, что LogLevel экспортируется

// Загружаем переменные из .env файла
dotenv.config();

export interface AppConfig {
  BOT_TOKEN: string;
  NODE_ENV: "development" | "production" | "test";
  LOG_LEVEL: LogLevel;
  // Добавьте другие необходимые параметры конфигурации
  // WEBHOOK_DOMAIN?: string;
  // PORT?: number;
}

/**
 * Проверяет, что BOT_TOKEN определен
 * @param token Значение токена для проверки
 * @returns Исходный токен, если он валиден
 * @throws Ошибку, если токен не определен
 */
const validateBotToken = (token: string | undefined): string => {
  if (!token) {
    throw new Error(
      "BOT_TOKEN is not defined in .env or environment variables."
    );
  }
  return token;
};

/**
 * Создает объект конфигурации на основе переменных окружения
 * @returns Объект AppConfig с параметрами приложения
 */
const createConfig = (): AppConfig => ({
  BOT_TOKEN: validateBotToken(process.env.BOT_TOKEN),
  NODE_ENV: (process.env.NODE_ENV as AppConfig["NODE_ENV"]) || "development",
  LOG_LEVEL: (process.env.LOG_LEVEL as LogLevel) || LogLevel.INFO,
  // WEBHOOK_DOMAIN: process.env.WEBHOOK_DOMAIN,
  // PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
});

// Создаем конфигурацию
let config: AppConfig;

try {
  config = createConfig();
} catch (error) {
  console.error(`FATAL: ${(error as Error).message}`);
  process.exit(1);
}

export { config };
