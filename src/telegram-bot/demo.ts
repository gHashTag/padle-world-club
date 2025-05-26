/**
 * Демо-скрипт для тестирования AI Text-to-SQL функциональности
 * Запускает несколько примеров запросов без реального Telegram бота
 */

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../db/schema";
import { AITextToSQLService } from "./services/ai-text-to-sql.service";

// Используем тот же URL что и в других скриптах
const DATABASE_URL = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_z6BWURv1GHbu@ep-dry-base-a1uf8xwo-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

async function runDemo() {
  console.log("🤖 Демо AI Text-to-SQL для Padle World Club");
  console.log("=" .repeat(50));

  // Подключаемся к БД
  const client = postgres(DATABASE_URL);
  const db = drizzle(client, { schema });

  // Создаем AI сервис
  const aiService = new AITextToSQLService(db);

  // Примеры запросов на русском языке
  const testQueries = [
    "Покажи всех пользователей",
    "Сколько всего площадок в системе?",
    "Найди топ 5 игроков по рейтингу",
    "Покажи все корты типа paddle",
    "Сколько бронирований было сделано сегодня?",
    "Найди все турниры со статусом 'upcoming'",
    "Покажи игровые сессии на завтра",
    "Какие площадки находятся в Москве?",
    "Покажи последние 10 платежей",
    "Найди пользователей с рейтингом выше 1800"
  ];

  console.log(`\n🧪 Тестируем ${testQueries.length} запросов...\n`);

  for (let i = 0; i < testQueries.length; i++) {
    const query = testQueries[i];
    console.log(`\n${i + 1}. 📝 Запрос: "${query}"`);
    console.log("-".repeat(40));

    try {
      // Преобразуем в SQL с помощью AI
      const sqlResult = await aiService.convertToSQL(query);

      if (!sqlResult.success) {
        console.log(`❌ Ошибка AI: ${sqlResult.error}`);
        continue;
      }

      console.log(`🎯 Уверенность AI: ${Math.round((sqlResult.confidence || 0) * 100)}%`);
      console.log(`🔧 SQL: ${sqlResult.sql}`);
      console.log(`💡 Объяснение: ${sqlResult.explanation}`);

      // Выполняем запрос
      const queryResult = await aiService.executeQuery(sqlResult.sql!);

      if (!queryResult.success) {
        console.log(`❌ Ошибка выполнения: ${queryResult.error}`);
        continue;
      }

      console.log(`✅ Результат: ${queryResult.rowCount} записей за ${queryResult.executionTime}ms`);

      // Показываем первые несколько записей
      if (queryResult.data && queryResult.data.length > 0) {
        console.log("📊 Первые записи:");
        const preview = queryResult.data.slice(0, 3);
        preview.forEach((record, idx) => {
          const fields = Object.entries(record)
            .slice(0, 3)
            .map(([key, value]) => `${key}: ${value}`)
            .join(", ");
          console.log(`   ${idx + 1}. ${fields}`);
        });

        if (queryResult.data.length > 3) {
          console.log(`   ... и еще ${queryResult.data.length - 3} записей`);
        }
      }

    } catch (error) {
      console.log(`💥 Неожиданная ошибка: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  console.log("\n" + "=".repeat(50));
  console.log("🎉 Демо завершено!");
  console.log("\n💡 Для запуска реального бота:");
  console.log("1. Получите токен бота от @BotFather в Telegram");
  console.log("2. Получите API ключ OpenAI");
  console.log("3. Обновите .env файл с токенами");
  console.log("4. Запустите: npm run bot:dev");

  // Закрываем соединение
  await client.end();
}

// Запускаем демо
if (require.main === module) {
  runDemo().catch((error) => {
    console.error("💥 Ошибка демо:", error);
    process.exit(1);
  });
}
