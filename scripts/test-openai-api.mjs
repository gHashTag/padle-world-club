#!/usr/bin/env node

/**
 * 🧪 Тест OpenAI API для диагностики проблем
 */

import * as dotenv from "dotenv";
import OpenAI from "openai";

// Загружаем переменные окружения
dotenv.config();

const apiKey = process.env.OPENAI_API_KEY;

console.log("🧪 Тестирование OpenAI API...");
console.log("===============================");

if (!apiKey) {
  console.error("❌ OPENAI_API_KEY не найден в .env файле");
  process.exit(1);
}

console.log(`🔑 API ключ: ${apiKey.substring(0, 20)}...`);

const openai = new OpenAI({ apiKey });

async function testOpenAI() {
  try {
    console.log("\n1️⃣ Тестируем базовое подключение...");
    
    // Тест 1: Простой запрос к модели
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: "Привет! Это тест." }],
      max_tokens: 10,
    });
    
    console.log("✅ Базовое подключение работает!");
    console.log(`💬 Ответ: ${completion.choices[0].message.content}`);
    
    console.log("\n2️⃣ Тестируем Whisper API...");
    
    // Тест 2: Проверяем доступность Whisper
    // Создаем минимальный аудио файл для теста
    const testAudio = Buffer.from("fake audio data");
    
    try {
      // Это должно вызвать ошибку, но покажет доступность API
      await openai.audio.transcriptions.create({
        file: new File([testAudio], "test.wav", { type: "audio/wav" }),
        model: "whisper-1",
      });
    } catch (error) {
      if (error.message.includes("Invalid file format")) {
        console.log("✅ Whisper API доступен (ошибка формата файла ожидаема)");
      } else if (error.message.includes("billing") || error.message.includes("429")) {
        console.log("❌ Проблема с биллингом:");
        console.log(`   ${error.message}`);
        return false;
      } else {
        console.log(`⚠️ Другая ошибка Whisper: ${error.message}`);
      }
    }
    
    console.log("\n3️⃣ Проверяем лимиты аккаунта...");
    
    // Тест 3: Проверяем информацию об аккаунте
    try {
      const models = await openai.models.list();
      console.log(`✅ Доступно моделей: ${models.data.length}`);
      
      const hasWhisper = models.data.some(model => model.id.includes("whisper"));
      console.log(`🎤 Whisper доступен: ${hasWhisper ? "✅ Да" : "❌ Нет"}`);
      
    } catch (error) {
      console.log(`⚠️ Не удалось получить список моделей: ${error.message}`);
    }
    
    return true;
    
  } catch (error) {
    console.error("❌ Ошибка при тестировании OpenAI API:");
    console.error(`   Код: ${error.status || "неизвестно"}`);
    console.error(`   Сообщение: ${error.message}`);
    console.error(`   Тип: ${error.type || "неизвестно"}`);
    
    if (error.message.includes("billing") || error.status === 429) {
      console.log("\n💡 Возможные решения:");
      console.log("1. Проверьте баланс на https://platform.openai.com/settings/organization/billing");
      console.log("2. Убедитесь, что карта привязана и активна");
      console.log("3. Проверьте лимиты на https://platform.openai.com/settings/organization/limits");
      console.log("4. Попробуйте создать новый API ключ");
    }
    
    return false;
  }
}

// Запускаем тест
testOpenAI().then(success => {
  if (success) {
    console.log("\n🎉 OpenAI API работает корректно!");
    console.log("Проблема может быть в обработке аудио файлов.");
  } else {
    console.log("\n❌ Есть проблемы с OpenAI API");
    console.log("Бот будет использовать mock STT");
  }
}).catch(error => {
  console.error("💥 Критическая ошибка:", error.message);
});
