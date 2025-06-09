#!/usr/bin/env bun
/**
 * 🧪 Простой тест подключения к базе данных
 */

import { config } from "../src/config";
import { db, testConnection } from "../src/db";

console.log("🔍 Тестирование подключения к базе данных");
console.log("=" .repeat(50));

console.log("📊 Конфигурация:");
console.log(`   NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`   DATABASE_URL: ${process.env.DATABASE_URL ? "✅ Установлен" : "❌ Не установлен"}`);

if (process.env.DATABASE_URL) {
  const url = new URL(process.env.DATABASE_URL);
  console.log(`   Host: ${url.hostname}`);
  console.log(`   Database: ${url.pathname.slice(1)}`);
}

console.log("\n🔗 Тестирование подключения...");

try {
  if (!db) {
    console.log("❌ Database instance не создан");
    process.exit(1);
  }
  
  const isConnected = await testConnection();
  
  if (isConnected) {
    console.log("✅ Подключение к базе данных успешно!");
    
    // Попробуем выполнить простой запрос
    console.log("\n📊 Тестирование запроса...");
    const result = await db.execute("SELECT 1 as test");
    console.log("✅ Тестовый запрос выполнен:", result);
    
  } else {
    console.log("❌ Не удалось подключиться к базе данных");
    process.exit(1);
  }
  
} catch (error) {
  console.error("💥 Ошибка:", error);
  process.exit(1);
}

console.log("\n🏁 Тест завершен успешно");
process.exit(0);
