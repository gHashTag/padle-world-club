#!/usr/bin/env node

/**
 * Telegram Database Chat Bot
 * Точка входа для запуска бота
 */

import dotenv from "dotenv";
import { startBot } from "./index";
import { getBotConfig } from "./config";

// Загружаем переменные окружения
dotenv.config();

async function main() {
  try {
    console.log("🚀 Запуск Telegram Database Chat Bot...");
    
    // Проверяем конфигурацию
    const config = getBotConfig();
    console.log(`📋 Конфигурация загружена:`);
    console.log(`   - Админов: ${config.adminUserIds.length}`);
    console.log(`   - Макс. результатов: ${config.maxQueryResults}`);
    console.log(`   - Таймаут запросов: ${config.queryTimeout}ms`);
    
    // Запускаем бота
    await startBot();
    
  } catch (error) {
    console.error("❌ Ошибка запуска бота:", error);
    process.exit(1);
  }
}

// Обработка сигналов завершения
process.on('SIGINT', () => {
  console.log('\n🛑 Получен сигнал SIGINT, завершение работы...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Получен сигнал SIGTERM, завершение работы...');
  process.exit(0);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Запуск
main();
