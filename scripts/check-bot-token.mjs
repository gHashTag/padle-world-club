#!/usr/bin/env node

/**
 * 🤖 Проверка валидности BOT_TOKEN
 * Простая проверка токена бота перед запуском
 */

import * as dotenv from "dotenv";

// Загружаем переменные окружения
dotenv.config();

const BOT_TOKEN = process.env.BOT_TOKEN;

console.log("🤖 Проверка BOT_TOKEN...");
console.log("========================");

// Проверяем наличие токена
if (!BOT_TOKEN) {
  console.error("❌ BOT_TOKEN не найден в .env файле");
  console.log("\n💡 Что делать:");
  console.log("1. Откройте @BotFather в Telegram");
  console.log("2. Создайте нового бота: /newbot");
  console.log("3. Скопируйте токен");
  console.log("4. Добавьте в .env файл: BOT_TOKEN=your_token_here");
  process.exit(1);
}

if (BOT_TOKEN === "YOUR_NEW_BOT_TOKEN_HERE" || BOT_TOKEN === "your_bot_token_here") {
  console.error("❌ BOT_TOKEN содержит placeholder значение");
  console.log("\n💡 Замените placeholder на реальный токен от @BotFather");
  process.exit(1);
}

// Проверяем формат токена
const tokenPattern = /^\d+:[A-Za-z0-9_-]+$/;
if (!tokenPattern.test(BOT_TOKEN)) {
  console.error("❌ BOT_TOKEN имеет неверный формат");
  console.log("Ожидаемый формат: 123456789:ABCdefGHIjklMNOpqrsTUVwxyz");
  console.log(`Текущий токен: ${BOT_TOKEN.substring(0, 20)}...`);
  process.exit(1);
}

console.log("✅ BOT_TOKEN найден и имеет правильный формат");

// Проверяем токен через Telegram API
console.log("\n🔍 Проверяем токен через Telegram API...");

try {
  const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getMe`);
  const data = await response.json();
  
  if (data.ok) {
    console.log("✅ Токен валиден!");
    console.log(`🤖 Бот: ${data.result.first_name} (@${data.result.username})`);
    console.log(`🆔 ID: ${data.result.id}`);
    console.log(`🔧 Может получать сообщения: ${data.result.can_read_all_group_messages ? 'Да' : 'Нет'}`);
    
    console.log("\n🚀 Готово к запуску!");
    console.log("Запустите бота командой: bun dev");
  } else {
    console.error("❌ Токен недействителен");
    console.error(`Ошибка: ${data.error_code} - ${data.description}`);
    
    console.log("\n💡 Что делать:");
    console.log("1. Проверьте токен у @BotFather");
    console.log("2. Убедитесь, что бот не был удален");
    console.log("3. Создайте нового бота если нужно");
    
    process.exit(1);
  }
} catch (error) {
  console.error("❌ Ошибка при проверке токена:");
  console.error(error.message);
  
  console.log("\n💡 Возможные причины:");
  console.log("- Нет интернет соединения");
  console.log("- Проблемы с Telegram API");
  console.log("- Неверный формат токена");
  
  process.exit(1);
}

console.log("\n🎤 Голосовые функции готовы!");
console.log("После запуска бота используйте:");
console.log("• /start - для начала");
console.log("• /voice_help - для справки по голосовым командам");
console.log("• Отправьте голосовое сообщение для бронирования");
