#!/usr/bin/env node
/**
 * Тест подключения к Neon Database
 */

import { Pool } from "pg";
import dotenv from "dotenv";

// Загружаем переменные окружения
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.log("❌ DATABASE_URL не найден в переменных окружения");
  process.exit(1);
}

console.log("🔄 Тестируем подключение к Neon Database...");
console.log("📍 Host:", DATABASE_URL.split("@")[1]?.split("/")[0] || "Unknown");

const pool = new Pool({
  connectionString: DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
});

try {
  // Тестируем подключение
  const client = await pool.connect();

  // Выполняем простой запрос
  const result = await client.query(
    "SELECT NOW() as current_time, version() as db_version"
  );

  console.log("✅ Подключение к Neon Database УСПЕШНО!");
  console.log("🕐 Текущее время БД:", result.rows[0].current_time);
  console.log("📊 Версия PostgreSQL:", result.rows[0].db_version.split(" ")[0]);

  // Проверяем существующие таблицы
  const tables = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name
  `);

  console.log("📋 Найдено таблиц в БД:", tables.rows.length);
  if (tables.rows.length > 0) {
    console.log(
      "📄 Некоторые таблицы:",
      tables.rows
        .slice(0, 5)
        .map((r) => r.table_name)
        .join(", ")
    );
  }

  client.release();
} catch (error) {
  console.log("❌ Ошибка подключения к Neon Database:");
  console.log("🔍 Детали:", error.message);

  if (error.code) {
    console.log("📝 Код ошибки:", error.code);
  }

  process.exit(1);
} finally {
  await pool.end();
}

console.log("�� Тест завершен");
