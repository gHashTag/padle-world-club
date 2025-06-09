#!/usr/bin/env bun
/**
 * 🧪 Тестовый скрипт для проверки real-time синхронизации
 */

import { config } from "../src/config";

const API_BASE = "http://localhost:3000/api";

interface TestResult {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

/**
 * 🌐 Выполнение HTTP запроса
 */
async function makeRequest(
  endpoint: string, 
  method: string = "GET", 
  body?: any
): Promise<TestResult> {
  try {
    const url = `${API_BASE}${endpoint}`;
    console.log(`📡 ${method} ${url}`);
    
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return {
        success: false,
        message: `HTTP ${response.status}: ${response.statusText}`,
        error: data.error || data.message,
      };
    }
    
    return {
      success: true,
      message: data.message || "Success",
      data,
    };
    
  } catch (error) {
    return {
      success: false,
      message: "Network error",
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * 🧪 Тест 1: Проверка API
 */
async function testApiHealth(): Promise<TestResult> {
  console.log("\n🧪 Тест 1: Проверка API");
  return await makeRequest("/health");
}

/**
 * 🧪 Тест 2: Ручная синхронизация пользователей
 */
async function testManualSync(): Promise<TestResult> {
  console.log("\n🧪 Тест 2: Ручная синхронизация пользователей");
  return await makeRequest("/obsidian-realtime/sync-users", "POST");
}

/**
 * 🧪 Тест 3: Создание тестового пользователя
 */
async function testCreateUser(): Promise<TestResult> {
  console.log("\n🧪 Тест 3: Создание тестового пользователя");
  return await makeRequest("/obsidian-realtime/test-create-user", "POST");
}

/**
 * 🧪 Тест 4: Проверка webhook endpoint
 */
async function testWebhook(): Promise<TestResult> {
  console.log("\n🧪 Тест 4: Проверка webhook endpoint");
  
  const webhookData = {
    table: "user",
    action: "INSERT",
    data: {
      id: 999,
      firstName: "Webhook",
      lastName: "Test",
      username: "webhook_test",
      email: "webhook@test.com",
      userRole: "player",
      currentRating: 1200,
    },
    timestamp: new Date().toISOString(),
  };
  
  return await makeRequest("/obsidian-realtime/webhook", "POST", webhookData);
}

/**
 * 📊 Отображение результата теста
 */
function displayResult(testName: string, result: TestResult) {
  const status = result.success ? "✅" : "❌";
  console.log(`${status} ${testName}: ${result.message}`);
  
  if (result.data) {
    console.log(`   📊 Данные:`, JSON.stringify(result.data, null, 2));
  }
  
  if (result.error) {
    console.log(`   ❌ Ошибка:`, result.error);
  }
}

/**
 * 🚀 Основная функция тестирования
 */
async function runTests() {
  console.log("🚀 Запуск тестов real-time синхронизации");
  console.log("=" .repeat(50));
  
  const tests = [
    { name: "API Health Check", fn: testApiHealth },
    { name: "Manual Sync", fn: testManualSync },
    { name: "Create Test User", fn: testCreateUser },
    { name: "Webhook Test", fn: testWebhook },
  ];
  
  let passed = 0;
  let failed = 0;
  
  for (const test of tests) {
    try {
      const result = await test.fn();
      displayResult(test.name, result);
      
      if (result.success) {
        passed++;
      } else {
        failed++;
      }
      
      // Пауза между тестами
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.log(`❌ ${test.name}: Unexpected error`);
      console.log(`   ❌ Ошибка:`, error);
      failed++;
    }
  }
  
  console.log("\n" + "=" .repeat(50));
  console.log(`📊 Результаты тестирования:`);
  console.log(`   ✅ Пройдено: ${passed}`);
  console.log(`   ❌ Провалено: ${failed}`);
  console.log(`   📈 Успешность: ${Math.round((passed / (passed + failed)) * 100)}%`);
  
  if (failed === 0) {
    console.log("\n🎉 Все тесты пройдены! Real-time синхронизация работает!");
  } else {
    console.log("\n⚠️ Некоторые тесты провалились. Проверьте настройки.");
  }
}

/**
 * 📁 Проверка файлов Obsidian
 */
async function checkObsidianFiles() {
  console.log("\n📁 Проверка созданных файлов в Obsidian:");
  
  try {
    const fs = await import("fs/promises");
    const path = await import("path");
    
    const obsidianPath = path.join(process.cwd(), "oxygen-world", "Database");
    
    // Проверяем, существует ли директория
    try {
      await fs.access(obsidianPath);
      console.log(`✅ Директория существует: ${obsidianPath}`);
    } catch {
      console.log(`❌ Директория не найдена: ${obsidianPath}`);
      return;
    }
    
    // Ищем файлы с real-time синхронизацией
    const files = await fs.readdir(obsidianPath);
    const realtimeFiles = files.filter(f => 
      f.includes("Real-time") || f.includes("Test") || f.includes("Webhook")
    );
    
    if (realtimeFiles.length > 0) {
      console.log(`✅ Найдено файлов с real-time синхронизацией: ${realtimeFiles.length}`);
      realtimeFiles.forEach(file => {
        console.log(`   📄 ${file}`);
      });
    } else {
      console.log(`⚠️ Файлы с real-time синхронизацией не найдены`);
    }
    
  } catch (error) {
    console.log(`❌ Ошибка проверки файлов:`, error);
  }
}

// Запуск тестов
if (import.meta.main) {
  console.log("🔄 Real-time Sync Tester");
  console.log("Убедитесь, что API сервер запущен на http://localhost:3000");
  console.log("");
  
  runTests()
    .then(() => checkObsidianFiles())
    .then(() => {
      console.log("\n🏁 Тестирование завершено");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Критическая ошибка:", error);
      process.exit(1);
    });
}
