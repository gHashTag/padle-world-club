import { Telegraf, Scenes } from "telegraf";
import { session } from "telegraf";
import { config } from "./src/config";
import { logger, LogType } from "./src/logger";
import type { BaseBotContext } from "./src/types";
import { errorHandler } from "./src/middlewares/error-handler";
import { MemoryAdapter } from "./src/adapters/memory-adapter";
import { createExampleWizardScene } from "./src/templates/wizard-scene-template";
import { setupCommands } from "./src/commands";

// Экспорты для использования стартер-кита как библиотеки
export { Telegraf, Scenes };
export type { BaseBotContext } from "./src/types";
export type { StorageAdapter } from "./src/adapters/storage-adapter";
export { MemoryAdapter } from "./src/adapters/memory-adapter";
export { createExampleWizardScene } from "./src/templates/wizard-scene-template";
export { errorHandler } from "./src/middlewares/error-handler";
export { logger, LogType } from "./src/utils/logger";

// Запуск бота если файл выполняется напрямую
if (import.meta.url.endsWith("index.ts")) {
  // Создаем экземпляр бота
  const bot = new Telegraf<BaseBotContext>(config.BOT_TOKEN);

  // Создаем адаптер хранилища
  const storage = new MemoryAdapter();

  // Инициализируем хранилище
  await storage.initialize();

  // Добавляем хранилище в контекст бота
  bot.use((ctx, next) => {
    ctx.storage = storage;
    ctx.config = {
      telegramBotToken: config.BOT_TOKEN,
      ...config,
    };
    return next();
  });

  // Подключаем middleware для обработки ошибок
  bot.catch((err, ctx) => {
    errorHandler(err, ctx as any);
  });

  // Подключаем middleware
  bot.use(session());

  // Создаем и регистрируем сцены
  const exampleScene = createExampleWizardScene();
  const stage = new Scenes.Stage<BaseBotContext>([exampleScene]);
  bot.use(stage.middleware());

  // Регистрируем команды
  setupCommands(bot as any);

  // Запускаем бота
  bot
    .launch()
    .then(() => {
      logger.info("Бот успешно запущен");
    })
    .catch((err) => {
      logger.error("Ошибка при запуске бота", {
        error: err instanceof Error ? err : new Error(String(err)),
        type: LogType.ERROR,
      });
    });

  // Обработка завершения работы
  process.once("SIGINT", () => {
    bot.stop("SIGINT");
    storage.close().catch(console.error);
  });
  process.once("SIGTERM", () => {
    bot.stop("SIGTERM");
    storage.close().catch(console.error);
  });
}
