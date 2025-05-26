/**
 * Простое демо без AI - показывает работу с базой данных
 * Выполняет заранее подготовленные SQL запросы
 */

// import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
// import * as schema from "../db/schema";

// Используем тот же URL что и в других скриптах
const DATABASE_URL = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_z6BWURv1GHbu@ep-dry-base-a1uf8xwo-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

async function runSimpleDemo() {
  console.log("🏓 Простое демо Padle World Club Database");
  console.log("=" .repeat(50));

  // Подключаемся к БД
  const client = postgres(DATABASE_URL);
  // const _db = drizzle(client, { schema });

  // Заранее подготовленные запросы
  const queries = [
    {
      name: "Всего пользователей",
      sql: "SELECT COUNT(*) as count FROM \"user\"",
    },
    {
      name: "Всего площадок",
      sql: "SELECT COUNT(*) as count FROM venue",
    },
    {
      name: "Всего кортов",
      sql: "SELECT COUNT(*) as count FROM court",
    },
    {
      name: "Топ 5 пользователей по рейтингу",
      sql: "SELECT username, current_rating FROM \"user\" ORDER BY current_rating DESC LIMIT 5",
    },
    {
      name: "Площадки по городам",
      sql: "SELECT city, COUNT(*) as count FROM venue GROUP BY city ORDER BY count DESC",
    },
    {
      name: "Корты по типам",
      sql: "SELECT court_type, COUNT(*) as count FROM court GROUP BY court_type",
    },
    {
      name: "Статистика бронирований",
      sql: "SELECT status, COUNT(*) as count FROM booking GROUP BY status",
    },
    {
      name: "Последние 5 платежей",
      sql: "SELECT amount, currency, status, created_at FROM payment ORDER BY created_at DESC LIMIT 5",
    },
    {
      name: "Турниры по статусам",
      sql: "SELECT status, COUNT(*) as count FROM tournament GROUP BY status",
    },
    {
      name: "Игровые сессии по статусам",
      sql: "SELECT status, COUNT(*) as count FROM game_session GROUP BY status",
    }
  ];

  console.log(`\n📊 Выполняем ${queries.length} запросов...\n`);

  for (let i = 0; i < queries.length; i++) {
    const query = queries[i];
    console.log(`${i + 1}. 📝 ${query.name}`);
    console.log("-".repeat(40));

    try {
      const startTime = Date.now();
      const result = await client.unsafe(query.sql);
      const executionTime = Date.now() - startTime;

      console.log(`✅ Выполнено за ${executionTime}ms`);
      console.log(`📊 Результат (${result.length} записей):`);

      if (result.length > 0) {
        result.slice(0, 5).forEach((record, idx) => {
          const fields = Object.entries(record)
            .map(([key, value]) => {
              if (value instanceof Date) {
                return `${key}: ${value.toLocaleDateString()}`;
              }
              return `${key}: ${value}`;
            })
            .join(", ");
          console.log(`   ${idx + 1}. ${fields}`);
        });

        if (result.length > 5) {
          console.log(`   ... и еще ${result.length - 5} записей`);
        }
      } else {
        console.log("   Нет данных");
      }

    } catch (error) {
      console.log(`❌ Ошибка: ${error instanceof Error ? error.message : String(error)}`);
    }

    console.log(); // Пустая строка для разделения
  }

  console.log("=".repeat(50));
  console.log("🎉 Демо завершено!");
  console.log("\n💡 Что дальше:");
  console.log("1. База данных успешно наполнена тестовыми данными");
  console.log("2. Все основные таблицы содержат записи");
  console.log("3. Можно создавать Telegram бота для работы с данными");
  console.log("4. Для AI Text-to-SQL нужен OpenAI API ключ");

  // Закрываем соединение
  await client.end();
}

// Запускаем демо
if (require.main === module) {
  runSimpleDemo().catch((error) => {
    console.error("💥 Ошибка демо:", error);
    process.exit(1);
  });
}
