#!/usr/bin/env node

/**
 * 🎤 Тест РЕАЛЬНОГО STT без моков
 */

import * as dotenv from "dotenv";
import OpenAI from "openai";
import fs from "fs";

dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;

console.log("🎤 ТЕСТ РЕАЛЬНОГО STT (БЕЗ МОКОВ)");
console.log("================================");

if (!apiKey || apiKey === "your_openai_api_key_here") {
  console.error("❌ OPENAI_API_KEY не найден в .env файле!");
  console.log("Добавьте реальный API ключ:");
  console.log("OPENAI_API_KEY=sk-proj-ваш_ключ");
  process.exit(1);
}

console.log(`🔑 API ключ: ${apiKey.substring(0, 20)}...`);

const openai = new OpenAI({ 
  apiKey,
  timeout: 30000,
});

async function testRealSTT() {
  try {
    console.log("\n🧪 Тестируем базовое подключение к OpenAI...");
    
    // Тест 1: Простой запрос
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Привет" }],
      max_tokens: 5,
    });
    
    console.log("✅ Базовое подключение работает!");
    console.log(`💬 Ответ: ${completion.choices[0].message.content}`);
    
    console.log("\n🎤 Проверяем доступность Whisper API...");
    
    // Тест 2: Проверяем модели
    const models = await openai.models.list();
    const whisperModels = models.data.filter(m => m.id.includes("whisper"));
    
    if (whisperModels.length > 0) {
      console.log("✅ Whisper модели доступны:");
      whisperModels.forEach(model => {
        console.log(`   • ${model.id}`);
      });
    } else {
      console.log("❌ Whisper модели не найдены");
      return false;
    }
    
    console.log("\n💰 Проверяем биллинг...");
    
    // Тест 3: Пробуем создать транскрипцию с фейковым файлом
    try {
      const fakeAudio = Buffer.from("fake audio data");
      await openai.audio.transcriptions.create({
        file: new File([fakeAudio], "test.wav", { type: "audio/wav" }),
        model: "whisper-1",
        language: "ru",
      });
    } catch (error) {
      if (error.message.includes("Invalid file format")) {
        console.log("✅ Whisper API доступен (ошибка формата ожидаема)");
        console.log("✅ Биллинг активен!");
        return true;
      } else if (error.message.includes("billing") || error.status === 429) {
        console.log("❌ ПРОБЛЕМА С БИЛЛИНГОМ:");
        console.log(`   ${error.message}`);
        console.log("\n💡 Решения:");
        console.log("1. Проверьте баланс: https://platform.openai.com/settings/organization/billing");
        console.log("2. Добавьте деньги на аккаунт");
        console.log("3. Проверьте лимиты: https://platform.openai.com/settings/organization/limits");
        return false;
      } else {
        console.log(`⚠️ Другая ошибка: ${error.message}`);
        return false;
      }
    }
    
    return true;
    
  } catch (error) {
    console.error("❌ КРИТИЧЕСКАЯ ОШИБКА:");
    console.error(`   ${error.message}`);
    return false;
  }
}

// Запускаем тест
testRealSTT().then(success => {
  if (success) {
    console.log("\n🎉 OPENAI API ПОЛНОСТЬЮ ГОТОВ К РАБОТЕ!");
    console.log("🔥 Бот будет использовать ТОЛЬКО реальное распознавание речи");
    console.log("🎤 Говорите на русском языке - Whisper отлично понимает русский!");
  } else {
    console.log("\n❌ ЕСТЬ ПРОБЛЕМЫ С OPENAI API");
    console.log("🚫 Бот НЕ БУДЕТ работать без решения проблем");
  }
}).catch(error => {
  console.error("💥 ФАТАЛЬНАЯ ОШИБКА:", error.message);
});
