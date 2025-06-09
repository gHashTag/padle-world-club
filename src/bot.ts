import * as dotenv from "dotenv";
import { Telegraf, session, Scenes, Context, Markup } from "telegraf";
import { logger, LogLevel, LogType } from "./utils/logger";
import { StorageAdapter } from "./adapters/storage-adapter";
import { MemoryAdapter } from "./adapters/memory-adapter";
import { User } from "./schemas";
import { errorHandler } from "./middlewares/error-handler";
import { config } from "./config";

// --- Типы Контекста и Сессии ---
export interface SessionData
  extends Scenes.SceneSession<Scenes.WizardSessionData> {
  user?: User;
}

export interface CustomContext extends Context {
  storage: StorageAdapter;
  session: SessionData;
  scene: Scenes.SceneContextScene<CustomContext, Scenes.WizardSessionData>;
}

let bot: Telegraf<CustomContext>;

// --- Middleware ---
async function ensureUserMiddleware(
  ctx: CustomContext,
  next: () => Promise<void>
) {
  if (!ctx.from?.id) {
    logger.warn("ensureUserMiddleware: Обновление без ctx.from.id.", {
      type: LogType.SYSTEM,
    });
    return;
  }
  const telegramId = ctx.from.id;

  if (!ctx.storage) {
    logger.error("ensureUserMiddleware: ctx.storage не инициализирован.", {
      type: LogType.SYSTEM,
    });
    if (ctx.reply) {
      await ctx
        .reply(
          "Произошла внутренняя ошибка (storage not init). Пожалуйста, попробуйте позже."
        )
        .catch(() => {});
    }
    return;
  }

  try {
    let user = await ctx.storage.getUserByTelegramId(telegramId);

    if (!user) {
      logger.info(
        "ensureUserMiddleware: Пользователь " +
          telegramId +
          " не найден, создаем нового.",
        { type: LogType.USER_ACTION }
      );
      const username =
        ctx.from.username || ctx.from.first_name || "User_" + telegramId;
      const userData: Partial<User> = {
        telegram_id: telegramId,
        username: username,
        first_name: ctx.from.first_name,
        last_name: ctx.from.last_name,
      };
      user = await ctx.storage.createUser(userData);

      if (user) {
        logger.info(
          "ensureUserMiddleware: Пользователь " +
            telegramId +
            " (" +
            user.username +
            ") успешно создан. ID: " +
            user.id,
          { type: LogType.USER_ACTION }
        );
      } else {
        logger.error(
          "ensureUserMiddleware: createUser для " +
            telegramId +
            " вернул null/undefined.",
          { type: LogType.USER_ACTION }
        );
        if (ctx.reply) {
          await ctx
            .reply("Не удалось создать вашу учетную запись. Попробуйте позже.")
            .catch(() => {});
        }
        return;
      }
    } else {
      logger.debug(
        "ensureUserMiddleware: Пользователь " +
          telegramId +
          " (" +
          (user.username || "N/A") +
          ") найден. ID: " +
          user.id,
        { type: LogType.USER_ACTION }
      );
    }

    if (!ctx.session) {
      ctx.session = {} as SessionData;
    }
    ctx.session.user = user;
  } catch (error) {
    logger.error(
      "ensureUserMiddleware: Ошибка при работе с пользователем " + telegramId,
      {
        error: error instanceof Error ? error : new Error(String(error)),
        type: LogType.USER_ACTION,
      }
    );
    if (ctx.reply) {
      await ctx
        .reply(
          "Произошла ошибка при проверке вашей учетной записи. Попробуйте позже."
        )
        .catch(() => {});
    }
    return;
  }

  return next();
}

// --- Основная функция запуска бота ---
async function startBot() {
  dotenv.config();

  logger.configure({
    logToConsole: true,
    minLevel: LogLevel.DEBUG,
  });
  logger.info("Запуск бота...", { type: LogType.SYSTEM });

  const BOT_TOKEN = process.env.BOT_TOKEN || config.BOT_TOKEN;
  if (!BOT_TOKEN) {
    logger.fatal("BOT_TOKEN не найден в .env файле или конфигурации.", {
      type: LogType.SYSTEM,
    });
    process.exit(1);
  }

  bot = new Telegraf<CustomContext>(BOT_TOKEN);

  const storage = new MemoryAdapter();
  try {
    logger.info("Хранилище (MemoryAdapter) готово к использованию.", {
      type: LogType.SYSTEM,
    });
  } catch (error) {
    logger.fatal("Ошибка инициализации хранилища.", {
      error: error instanceof Error ? error : new Error(String(error)),
      type: LogType.SYSTEM,
    });
    process.exit(1);
  }

  bot.use(
    session({
      defaultSession: () => ({}) as SessionData,
    })
  );

  bot.use((ctx: CustomContext, next) => {
    ctx.storage = storage;
    return next();
  });

  bot.use(ensureUserMiddleware);

  bot.start(async (ctx) => {
    const userFirstName =
      ctx.session?.user?.first_name || ctx.from?.first_name || "незнакомец";
    await ctx.reply(
      `🏓 Привет, ${userFirstName}! Добро пожаловать в падл-центр!\n\n` +
      `🎤 Я умею обрабатывать голосовые команды для бронирования кортов.\n\n` +
      `📋 Используй /help для списка команд или /voice_help для голосовых функций.\n\n` +
      `🎙️ Попробуй отправить голосовое сообщение: "Забронируй корт на завтра в 14:00"`,
      Markup.removeKeyboard()
    );
  });

  bot.help(async (ctx) => {
    const helpMessage =
      "🏓 Падл-центр бот - Доступные команды:\n\n" +
      "📋 Основные команды:\n" +
      "/start - Начальное приветствие\n" +
      "/help - Это сообщение\n" +
      "/status - Статус системы\n\n" +
      "🎤 Голосовые функции:\n" +
      "/voice_help - Справка по голосовым командам\n" +
      "/voice_test - Тестирование голосового фреймворка\n\n" +
      "🎙️ Отправьте голосовое сообщение для бронирования кортов!\n" +
      "Например: 'Забронируй корт на завтра в 14:00'";
    await ctx.reply(helpMessage);
  });

  bot.catch((err: any, ctx: CustomContext) => {
    errorHandler(err, ctx);
  });
  logger.info("Telegraf global error handler registered.");

  logger.info("Запуск Telegraf...", { type: LogType.SYSTEM });

  try {
    if (process.env.NODE_ENV === "development") {
      logger.info("Bot is running in development mode with polling.");
      await bot.telegram.deleteWebhook({ drop_pending_updates: true });
      await bot.launch();
      logger.info(`Bot @${bot.botInfo?.username} started! (Telegraf)`);
    } else {
      logger.info("Bot is running in production mode (webhook setup pending).");
      logger.warn(
        "Production mode with webhook is not fully implemented for Telegraf. Falling back to polling for now."
      );
      await bot.telegram.deleteWebhook({ drop_pending_updates: true });
      await bot.launch();
      logger.info(`Bot @${bot.botInfo?.username} started! (Telegraf)`);
    }
  } catch (err) {
    logger.error("Error starting Telegraf bot", {
      error: err instanceof Error ? err : new Error(String(err)),
      type: LogType.SYSTEM,
    });
    process.exit(1);
  }

  logger.info("Telegraf bot setup complete. Waiting for messages...");
}

startBot().catch((error: unknown) => {
  logger.fatal("Критическая ошибка при запуске бота", {
    error: error instanceof Error ? error : new Error(String(error)),
    type: LogType.SYSTEM,
  });
  process.exit(1);
});

process.once("SIGINT", () => {
  logger.info("SIGINT received, shutting down Telegraf bot gracefully...");
  if (bot) {
    bot.stop("SIGINT");
  }
  logger.info("Telegraf bot stopped.");
  process.exit(0);
});
process.once("SIGTERM", () => {
  logger.info("SIGTERM received, shutting down Telegraf bot gracefully...");
  if (bot) {
    bot.stop("SIGTERM");
  }
  logger.info("Telegraf bot stopped.");
  process.exit(0);
});

export { bot };
