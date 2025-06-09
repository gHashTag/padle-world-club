import { Telegraf } from "telegraf";
import { CustomContext } from "./bot"; // Исправленный путь
import { logger, LogType } from "./utils/logger"; // Исправленный путь
import { voiceHandler } from "./telegram/voice-handler";

export const setupCommands = (bot: Telegraf<CustomContext>): void => {
  // 🎤 Команда для тестирования голосового фреймворка
  bot.command("voice_test", async (ctx) => {
    logger.info("/voice_test command executed", {
      type: LogType.COMMAND,
      userId: ctx.from?.id,
    });

    await voiceHandler.handleTestCommand(ctx);
  });

  // 🎤 Команда для информации о голосовых функциях
  bot.command("voice_help", async (ctx) => {
    logger.info("/voice_help command executed", {
      type: LogType.COMMAND,
      userId: ctx.from?.id,
    });

    const helpText = `🎤 Голосовые функции падл-центра

📋 Доступные команды:
/voice_test - Тестирование голосового фреймворка
/voice_help - Эта справка

🎤 Голосовые команды:
Отправьте голосовое сообщение с одной из команд:

🏓 Бронирование:
• "Забронируй корт на завтра в 14:00"
• "Book a court for tomorrow at 2 PM"

🔍 Проверка доступности:
• "Покажи свободные корты"
• "Show available courts"

❌ Отмена бронирования:
• "Отмени мою бронь"
• "Cancel my booking"

💡 Совет: Говорите четко и не слишком быстро для лучшего распознавания.`;

    await ctx.reply(helpText);
  });

  // 🎤 Обработка голосовых сообщений
  bot.on("voice", async (ctx) => {
    logger.info("Voice message received", {
      type: LogType.VOICE,
      userId: ctx.from?.id,
      duration: ctx.message.voice.duration,
    });

    await voiceHandler.handleVoiceMessage(ctx as any);
  });

  // 📋 Команда для статуса системы
  bot.command("status", async (ctx) => {
    logger.info("/status command executed", {
      type: LogType.COMMAND,
      userId: ctx.from?.id,
    });

    const statusText = `📊 Статус системы падл-центра

🎤 Голосовой фреймворк: ✅ Активен
🏓 Booking API: ✅ Подключен
🤖 MCP Server: ✅ Готов
📱 Telegram Bot: ✅ Работает

🔧 Версия: Voice Framework v1.0.0
⏰ Время: ${new Date().toLocaleString("ru-RU", { timeZone: "Asia/Bangkok" })}

Используйте /voice_help для информации о голосовых командах.`;

    await ctx.reply(statusText);
  });

  // 🎯 Команда для тестирования конкретных голосовых команд
  bot.command("voice_mock", async (ctx) => {
    const keyboard = {
      inline_keyboard: [
        [
          { text: "🏓 Забронировать корт", callback_data: "mock_book" },
          { text: "🔍 Показать корты", callback_data: "mock_show" },
        ],
        [
          { text: "❌ Отменить бронь", callback_data: "mock_cancel" },
          { text: "📅 Проверить доступность", callback_data: "mock_check" },
        ],
      ],
    };

    await ctx.reply(
      "🎯 Выберите команду для тестирования:\n\n💡 Это поможет протестировать конкретные команды без голосового ввода",
      { reply_markup: keyboard }
    );
  });

  // Обработчик кнопок для mock команд
  bot.on("callback_query", async (ctx) => {
    const data = ctx.callbackQuery.data;

    if (data?.startsWith("mock_")) {
      const mockCommands = {
        mock_book: "Забронируй корт на завтра в 14:00",
        mock_show: "Покажи свободные корты на сегодня",
        mock_cancel: "Отмени мою бронь на завтра",
        mock_check: "Проверь доступность кортов",
      };

      const command = mockCommands[data as keyof typeof mockCommands];

      if (command) {
        await ctx.answerCbQuery();
        await ctx.reply(`🎤 Тестирую команду: "${command}"`);

        // Симулируем обработку через VoiceHandler
        try {
          const testVoiceMessage = {
            duration: 4,
            file_id: `mock_${data}`,
            file_unique_id: `mock_unique_${data}`,
            file_size: 2048,
          };

          const response = await voiceHandler.handleVoiceMessage(
            testVoiceMessage,
            ctx.from?.id?.toString() || "test_user",
            command // Передаем конкретную команду
          );

          await ctx.reply(response, { parse_mode: "HTML" });
        } catch (error) {
          await ctx.reply("❌ Ошибка при обработке команды");
        }
      }
    }
  });

  // 🎯 Команда для mock тестирования голосовых команд
  bot.command("voice_mock", async (ctx) => {
    const keyboard = {
      inline_keyboard: [
        [
          { text: "🏓 Забронировать корт", callback_data: "mock_book" },
          { text: "🔍 Показать корты", callback_data: "mock_show" },
        ],
        [
          { text: "❌ Отменить бронь", callback_data: "mock_cancel" },
          { text: "📅 Проверить доступность", callback_data: "mock_check" },
        ],
      ],
    };

    await ctx.reply(
      "🎯 Выберите команду для симуляции голосового ввода:\n\n💡 Это поможет протестировать бот без реального STT или проблем с OpenAI биллингом",
      { reply_markup: keyboard }
    );
  });

  // Обработчик кнопок для mock команд
  bot.on("callback_query", async (ctx) => {
    const data = ctx.callbackQuery.data;

    if (data?.startsWith("mock_")) {
      const mockCommands = {
        mock_book: "Забронируй корт на завтра в 14:00",
        mock_show: "Покажи свободные корты на сегодня",
        mock_cancel: "Отмени мою бронь на завтра",
        mock_check: "Проверь доступность кортов",
      };

      const command = mockCommands[data as keyof typeof mockCommands];

      if (command) {
        await ctx.answerCbQuery();
        await ctx.reply(`🎤 Симулирую голосовую команду: "${command}"`);

        // Симулируем обработку голосовой команды
        try {
          const testVoiceMessage = {
            duration: 4,
            file_id: `mock_${data}`,
            file_unique_id: `mock_unique_${data}`,
            file_size: 2048,
          };

          const response = await voiceHandler.handleVoiceMessage(
            testVoiceMessage,
            ctx.from?.id?.toString() || "test_user",
            command // Передаем конкретную команду для mock
          );

          await ctx.reply(response, { parse_mode: "HTML" });
        } catch (error) {
          await ctx.reply("❌ Ошибка при обработке mock команды");
        }
      }
    }
  });

  // Пример регистрации команды /start (может быть переопределен в bot.ts, если там есть свой)
  // bot.start(async (ctx) => {
  //   logger.info('/start command handled by commands.ts', { type: LogType.COMMAND, userId: ctx.from?.id });
  //   const userFirstName =
  //     ctx.session?.user?.first_name || ctx.from?.first_name || "незнакомец";
  //   await ctx.reply(
  //     `Привет из commands.ts, ${userFirstName}! Используй /help для списка команд.`
  //   );
  // });

  // Пример регистрации команды /help (может быть переопределен в bot.ts)
  // _bot.help(async (ctx) => {
  //   logger.info('/help command handled by commands.ts', { type: LogType.COMMAND, userId: ctx.from?.id });
  //   const helpMessage =
  //     "Команды из commands.ts:\n" +
  //     "/start - Начальное приветствие\n" +
  //     "/help - Это сообщение";
  //   await ctx.reply(helpMessage);
  // });

  // Сюда можно добавлять другие команды
  // _bot.command('mycommand', (ctx) => {
  //   logger.info('/mycommand handled', { type: LogType.COMMAND, userId: ctx.from?.id });
  //   ctx.reply('Вы вызвали мою кастомную команду!');
  // });

  logger.info(
    "setupCommands function called (currently a stub or with examples). Actual commands might be in bot.ts or added here.",
    {
      type: LogType.SYSTEM,
    }
  );
};
