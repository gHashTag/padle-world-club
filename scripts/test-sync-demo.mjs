#!/usr/bin/env node
/**
 * 🧪 Демонстрация работы синхронизации Obsidian ↔️ Neon Database
 */

import { Pool } from "pg";
import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";

// Загружаем переменные окружения
dotenv.config();

const DATABASE_URL = process.env.DATABASE_URL;
const OBSIDIAN_VAULT_PATH =
  process.env.OBSIDIAN_VAULT_PATH ||
  "/Users/playra/padle-world-club/oxygen-world";
const TEST_DATABASE_FOLDER = path.join(OBSIDIAN_VAULT_PATH, "Database");

class SyncTester {
  constructor() {
    this.pool = new Pool({
      connectionString: DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
  }

  async createTestObsidianFile() {
    console.log("📝 Создаем тестовый файл в Obsidian...");

    const timestamp = new Date().toISOString();
    const testContent = `---
title: "🧪 TEST Sync Demo ${timestamp}"
type: database-test
table: "user"
sync_enabled: true
last_sync: "${timestamp}"
test_mode: true
---

# 🧪 Тест Синхронизации

**Время создания:** ${new Date().toLocaleString()}

## 📊 Тестовые данные пользователей

\`\`\`dataview
TABLE
  username as "👤 Логин",
  first_name as "📝 Имя", 
  last_name as "📝 Фамилия",
  email as "📧 Email",
  user_role as "🎭 Роль",
  current_rating as "⭐ Рейтинг",
  created_at as "📅 Создан"
FROM "oxygen-world/Database"
WHERE contains(file.name, "user") 
SORT created_at DESC
LIMIT 5
\`\`\`

## 🔄 Тест Статус

- ✅ Файл создан: ${timestamp}
- 🔄 Ожидание синхронизации...
- 📊 Данные из БД будут отображены выше

## 📝 Инструкции для тестирования

1. **Измените этот файл** - добавьте текст ниже
2. **Сохраните файл** (Cmd+S)  
3. **Проверьте логи** синхронизации в терминале
4. **Проверьте БД** через наш скрипт

---

### 🖊️ МЕСТО ДЛЯ ВАШИХ ИЗМЕНЕНИЙ:

**Добавьте сюда любой текст для тестирования изменений:**



---

*Автоматически создано для демонстрации синхронизации*
`;

    // Создаем папку если её нет
    await fs.mkdir(TEST_DATABASE_FOLDER, { recursive: true });

    const testFilePath = path.join(
      TEST_DATABASE_FOLDER,
      `🧪 Sync Test - ${Date.now()}.md`
    );
    await fs.writeFile(testFilePath, testContent, "utf8");

    console.log(`✅ Тестовый файл создан: ${testFilePath}`);
    return testFilePath;
  }

  async checkDatabaseData() {
    console.log("🔍 Проверяем данные в Neon Database...");

    try {
      const client = await this.pool.connect();

      // Проверяем пользователей
      const usersResult = await client.query(`
        SELECT 
          username, 
          first_name, 
          last_name, 
          email, 
          user_role, 
          current_rating,
          created_at 
        FROM "user" 
        ORDER BY created_at DESC 
        LIMIT 5
      `);

      console.log("👥 Последние пользователи в БД:");
      console.table(usersResult.rows);

      // Проверяем общую статистику
      const statsResult = await client.query(`
        SELECT 
          'users' as table_name,
          COUNT(*) as total_records
        FROM "user"
        UNION ALL
        SELECT 
          'bookings' as table_name,
          COUNT(*) as total_records  
        FROM "booking"
        UNION ALL
        SELECT 
          'payments' as table_name,
          COUNT(*) as total_records
        FROM "payment"
      `);

      console.log("\n📊 Статистика таблиц:");
      console.table(statsResult.rows);

      client.release();
    } catch (error) {
      console.error("❌ Ошибка при проверке БД:", error.message);
    }
  }

  async addTestUser() {
    console.log("➕ Добавляем тестового пользователя в БД...");

    try {
      const client = await this.pool.connect();

      const timestamp = new Date().toISOString();
      const testUser = {
        username: `test_user_${Date.now()}`,
        password_hash: "hashed_password_demo",
        first_name: "Тест",
        last_name: "Пользователь",
        email: `test${Date.now()}@example.com`,
        member_id: `MEMBER_${Date.now()}`,
        user_role: "player",
      };

      const result = await client.query(
        `
        INSERT INTO "user" (
          username, password_hash, first_name, last_name, 
          email, member_id, user_role
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, username, first_name, last_name, email
      `,
        [
          testUser.username,
          testUser.password_hash,
          testUser.first_name,
          testUser.last_name,
          testUser.email,
          testUser.member_id,
          testUser.user_role,
        ]
      );

      console.log("✅ Тестовый пользователь добавлен:");
      console.table(result.rows);

      client.release();
    } catch (error) {
      console.error("❌ Ошибка при добавлении пользователя:", error.message);
    }
  }

  async monitorFileChanges(filePath) {
    console.log(`👀 Мониторинг изменений файла: ${path.basename(filePath)}`);
    console.log("💡 Откройте файл в Obsidian и внесите изменения!");
    console.log("🔄 Нажмите Ctrl+C для завершения мониторинга\n");

    let lastModified = 0;

    const checkFile = async () => {
      try {
        const stats = await fs.stat(filePath);
        const currentModified = stats.mtime.getTime();

        if (currentModified > lastModified) {
          lastModified = currentModified;
          console.log(`📝 Файл изменен в ${new Date().toLocaleTimeString()}`);

          // Читаем содержимое
          const content = await fs.readFile(filePath, "utf8");
          const lines = content.split("\n").length;
          console.log(`📄 Строк в файле: ${lines}`);
        }
      } catch (error) {
        console.error("❌ Ошибка при чтении файла:", error.message);
      }
    };

    // Проверяем каждые 2 секунды
    const interval = setInterval(checkFile, 2000);

    // Первоначальная проверка
    checkFile();

    // Graceful shutdown
    process.on("SIGINT", () => {
      clearInterval(interval);
      console.log("\n🛑 Мониторинг завершен");
      process.exit(0);
    });
  }

  async close() {
    await this.pool.end();
  }
}

// Основная функция демонстрации
async function runDemo() {
  console.log("🧪 ДЕМОНСТРАЦИЯ СИНХРОНИЗАЦИИ OBSIDIAN ↔️ NEON DATABASE");
  console.log("=".repeat(60));

  const tester = new SyncTester();

  try {
    // 1. Проверяем текущие данные в БД
    await tester.checkDatabaseData();

    console.log("\n" + "=".repeat(60));

    // 2. Добавляем тестового пользователя
    await tester.addTestUser();

    console.log("\n" + "=".repeat(60));

    // 3. Создаем тестовый файл в Obsidian
    const testFilePath = await tester.createTestObsidianFile();

    console.log("\n" + "=".repeat(60));
    console.log("🎯 ИНСТРУКЦИИ ДЛЯ ТЕСТИРОВАНИЯ:");
    console.log("1. Откройте Obsidian");
    console.log(`2. Найдите файл: ${path.basename(testFilePath)}`);
    console.log("3. Внесите изменения в раздел 'МЕСТО ДЛЯ ВАШИХ ИЗМЕНЕНИЙ'");
    console.log("4. Сохраните файл (Cmd+S или Ctrl+S)");
    console.log("5. Проверьте логи синхронизации в другом терминале");
    console.log("\n🔄 Запуск мониторинга файла...");

    // 4. Мониторим изменения файла
    await tester.monitorFileChanges(testFilePath);
  } catch (error) {
    console.error("❌ Ошибка демонстрации:", error.message);
  } finally {
    await tester.close();
  }
}

// Запуск
runDemo();
