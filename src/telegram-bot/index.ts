/**
 * Telegram Bot for Database Interaction
 * Позволяет админам общаться с базой данных на естественном языке
 */

import { Telegraf, Context } from "telegraf";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../db/schema";
import { AITextToSQLService } from "./services/ai-text-to-sql.service";
import { DatabaseContextService } from "./services/database-context.service";

// Типы
interface BotContext extends Context {
  user?: {
    id: number;
    username?: string;
    isAdmin: boolean;
  };
}

// Конфигурация
const BOT_TOKEN = process.env.BOT_TOKEN;
const DATABASE_URL = process.env.DATABASE_URL;
const ADMIN_USER_IDS = process.env.ADMIN_USER_IDS?.split(',').map(id => parseInt(id)) || [];

if (!BOT_TOKEN) {
  throw new Error("BOT_TOKEN environment variable is required");
}

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Инициализация
const bot = new Telegraf<BotContext>(BOT_TOKEN);
const client = postgres(DATABASE_URL);
const db = drizzle(client, { schema });

// Сервисы
const aiTextToSQLService = new AITextToSQLService(db);
const databaseContextService = new DatabaseContextService(db);

// Middleware для проверки админских прав
bot.use(async (ctx, next) => {
  const userId = ctx.from?.id;
  const username = ctx.from?.username;

  if (!userId) {
    return;
  }

  ctx.user = {
    id: userId,
    username,
    isAdmin: ADMIN_USER_IDS.includes(userId)
  };

  if (!ctx.user.isAdmin) {
    await ctx.reply("❌ У вас нет прав для использования этого бота. Обратитесь к администратору.");
    return;
  }

  return next();
});

// Команда /start
bot.start(async (ctx) => {
  const welcomeMessage = `
🤖 **Добро пожаловать в Database Chat Bot!**

Я помогу вам работать с базой данных Padle World Club на естественном языке.

**Доступные команды:**
/help - показать справку
/stats - общая статистика БД
/schema - показать схему базы данных
/examples - примеры запросов

**Примеры запросов:**
• "Покажи всех пользователей"
• "Сколько бронирований на завтра?"
• "Топ 10 игроков по рейтингу"
• "Какие корты свободны сегодня?"

Просто напишите свой вопрос, и я переведу его в SQL запрос!
  `;

  await ctx.reply(welcomeMessage, { parse_mode: 'Markdown' });
});

// Команда /help
bot.help(async (ctx) => {
  const helpMessage = `
📚 **Справка по Database Chat Bot**

**Основные возможности:**
• Преобразование естественного языка в SQL
• Выполнение безопасных запросов к БД
• Получение статистики и аналитики
• Поиск по всем таблицам

**Команды:**
/start - начать работу
/stats - статистика базы данных
/schema - схема БД
/examples - примеры запросов
/clear - очистить контекст

**Безопасность:**
• Только SELECT запросы
• Ограничение на 100 записей
• Проверка SQL инъекций
• Доступ только для админов

**Поддерживаемые таблицы:**
• users - пользователи
• venues - площадки
• courts - корты
• bookings - бронирования
• game_sessions - игровые сессии
• tournaments - турниры
• payments - платежи
• и другие...
  `;

  await ctx.reply(helpMessage, { parse_mode: 'Markdown' });
});

// Команда /stats
bot.command('stats', async (ctx) => {
  try {
    const stats = await databaseContextService.getDatabaseStats();

    const statsMessage = `
📊 **Статистика базы данных**

👥 **Пользователи:** ${stats.users.total}
   • Активных: ${stats.users.verified}
   • Средний рейтинг: ${stats.users.averageRating}

🏢 **Площадки:** ${stats.venues.total}
   • Активных: ${stats.venues.active}

🎾 **Корты:** ${stats.courts.total}
   • Крытых: ${stats.courts.indoor}
   • Открытых: ${stats.courts.outdoor}

📅 **Бронирования:** ${stats.bookings.total}
   • Подтвержденных: ${stats.bookings.confirmed}
   • На сегодня: ${stats.bookings.today}

🎮 **Игровые сессии:** ${stats.gameSessions.total}
   • Завершенных: ${stats.gameSessions.completed}

🏆 **Турниры:** ${stats.tournaments.total}
   • Активных: ${stats.tournaments.active}

💰 **Платежи:** ${stats.payments.total}
   • Сумма: ${stats.payments.totalAmount} ₽
    `;

    await ctx.reply(statsMessage, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Error getting stats:', error);
    await ctx.reply("❌ Ошибка при получении статистики");
  }
});

// Команда /schema
bot.command('schema', async (ctx) => {
  try {
    const schemaInfo = await databaseContextService.getSchemaInfo();

    let schemaMessage = "🗄️ **Схема базы данных**\n\n";

    for (const table of schemaInfo) {
      schemaMessage += `**${table.name}** (${table.recordCount} записей)\n`;
      schemaMessage += `${table.description}\n`;
      schemaMessage += `Поля: ${table.columns.slice(0, 5).join(', ')}`;
      if (table.columns.length > 5) {
        schemaMessage += ` и еще ${table.columns.length - 5}...`;
      }
      schemaMessage += "\n\n";
    }

    await ctx.reply(schemaMessage, { parse_mode: 'Markdown' });
  } catch (error) {
    console.error('Error getting schema:', error);
    await ctx.reply("❌ Ошибка при получении схемы БД");
  }
});

// Команда /examples
bot.command('examples', async (ctx) => {
  const examplesMessage = `
💡 **Примеры запросов**

**Пользователи:**
• "Покажи топ 10 игроков по рейтингу"
• "Сколько новых пользователей за последнюю неделю?"
• "Найди пользователя с email admin@example.com"

**Бронирования:**
• "Какие корты забронированы на завтра?"
• "Покажи все отмененные бронирования"
• "Сколько заработали за последний месяц?"

**Игровые сессии:**
• "Покажи последние 5 завершенных игр"
• "Кто играл больше всего игр?"
• "Статистика по типам игр"

**Турниры:**
• "Какие турниры проходят сейчас?"
• "Покажи участников турнира X"
• "Призовой фонд всех турниров"

**Аналитика:**
• "Самые популярные корты"
• "Доходы по месяцам"
• "Активность пользователей по дням недели"

Просто напишите свой вопрос естественным языком!
  `;

  await ctx.reply(examplesMessage, { parse_mode: 'Markdown' });
});

// Обработка текстовых сообщений
bot.on('text', async (ctx) => {
  const userMessage = ctx.message.text;

  if (!userMessage || userMessage.startsWith('/')) {
    return;
  }

  try {
    // Показываем индикатор печати
    await ctx.sendChatAction('typing');

    // Преобразуем текст в SQL с помощью AI
    const sqlResult = await aiTextToSQLService.convertToSQL(userMessage);

    if (!sqlResult.success) {
      await ctx.reply(`❌ **Ошибка:** ${sqlResult.error}`, { parse_mode: 'Markdown' });
      return;
    }

    // Показываем уверенность AI в запросе
    if (sqlResult.confidence && sqlResult.confidence < 0.7) {
      await ctx.reply(`⚠️ **Внимание:** Уверенность AI в запросе низкая (${Math.round(sqlResult.confidence * 100)}%). Результат может быть неточным.`, { parse_mode: 'Markdown' });
    }

    // Выполняем запрос
    const queryResult = await aiTextToSQLService.executeQuery(sqlResult.sql!);

    if (!queryResult.success) {
      await ctx.reply(`❌ **Ошибка выполнения:** ${queryResult.error}`, { parse_mode: 'Markdown' });
      return;
    }

    // Форматируем результат с помощью AI
    const formattedResult = await aiTextToSQLService.formatResultWithAI(
      userMessage,
      sqlResult.sql!,
      queryResult.data!
    );

    // Добавляем информацию о производительности
    let performanceInfo = '';
    if (queryResult.executionTime) {
      performanceInfo = `\n\n⏱️ **Время выполнения:** ${queryResult.executionTime}ms`;
    }
    if (sqlResult.confidence) {
      performanceInfo += `\n🎯 **Уверенность AI:** ${Math.round(sqlResult.confidence * 100)}%`;
    }

    await ctx.reply(formattedResult + performanceInfo, { parse_mode: 'Markdown' });

  } catch (error) {
    console.error('Error processing message:', error);
    await ctx.reply("❌ Произошла ошибка при обработке запроса");
  }
});

// Обработка ошибок
bot.catch((err, ctx) => {
  console.error('Bot error:', err);
  ctx.reply("❌ Произошла ошибка. Попробуйте позже.");
});

// Запуск бота
export async function startBot() {
  console.log("🤖 Запуск Telegram бота...");

  try {
    await bot.launch();
    console.log("✅ Telegram бот запущен успешно!");

    // Graceful shutdown
    process.once('SIGINT', () => bot.stop('SIGINT'));
    process.once('SIGTERM', () => bot.stop('SIGTERM'));

  } catch (error) {
    console.error("❌ Ошибка запуска бота:", error);
    throw error;
  }
}

// Запуск если файл выполняется напрямую
if (require.main === module) {
  startBot().catch(console.error);
}
