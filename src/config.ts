import * as dotenv from "dotenv";
import { LogLevel } from "./utils/logger"; // Предполагается, что LogLevel экспортируется

dotenv.config(); // Загружаем переменные из .env файла

export interface AppConfig {
  BOT_TOKEN: string;
  NODE_ENV: "development" | "production" | "test";
  LOG_LEVEL: LogLevel;
  // Добавьте другие необходимые параметры конфигурации
  // WEBHOOK_DOMAIN?: string;
  // PORT?: number;
}

const config: AppConfig = {
  BOT_TOKEN: process.env.BOT_TOKEN || "",
  NODE_ENV: (process.env.NODE_ENV as AppConfig["NODE_ENV"]) || "development",
  LOG_LEVEL: (process.env.LOG_LEVEL as LogLevel) || LogLevel.INFO,
  // WEBHOOK_DOMAIN: process.env.WEBHOOK_DOMAIN,
  // PORT: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000,
};

// Валидация критически важных параметров
if (!config.BOT_TOKEN) {
  console.error(
    "FATAL: BOT_TOKEN is not defined in .env or environment variables."
  );
  // В реальном приложении лучше использовать logger, если он уже инициализирован,
  // но на этом этапе он может быть еще не доступен.
  process.exit(1);
}

export { config };
