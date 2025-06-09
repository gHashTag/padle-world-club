#!/usr/bin/env bun
/**
 * 🧪 Минимальный пример real-time синхронизации
 * Работает без сложных зависимостей
 */

import express from "express";
import fs from "fs/promises";
import path from "path";

const app = express();
const PORT = 3001;

// Middleware
app.use(express.json());
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  next();
});

// Путь к файлам Obsidian
const OBSIDIAN_PATH = path.join(process.cwd(), "oxygen-world", "Database");

// Простая база данных в памяти
let users: any[] = [
  {
    id: 1,
    firstName: "David",
    lastName: "Smith",
    username: "david_smith",
    email: "david@example.com",
    userRole: "player",
    currentRating: 2485,
    bonusPoints: 150,
    memberId: "OXY12345",
  },
  {
    id: 2,
    firstName: "Anna",
    lastName: "Johnson",
    username: "anna_johnson",
    email: "anna@example.com",
    userRole: "admin",
    currentRating: 2200,
    bonusPoints: 300,
    memberId: "OXY54321",
  },
];

/**
 * 📝 Генерация markdown для пользователя
 */
function generateUserMarkdown(user: any): string {
  const roleEmoji = {
    player: "🎾",
    admin: "👨‍💼", 
    club_staff: "👷",
    trainer: "🎓"
  }[user.userRole] || "👤";
  
  return `---
title: "${user.firstName} ${user.lastName}"
username: "${user.username}"
first_name: "${user.firstName}"
last_name: "${user.lastName}"
email: "${user.email}"
user_role: "${user.userRole}"
current_rating: ${user.currentRating || 0}
bonus_points: ${user.bonusPoints || 0}
member_id: "${user.memberId || ""}"
status: "active"
tags: [user, ${user.userRole}, minimal_demo]
created_at: "${new Date().toISOString().split("T")[0]}"
sync_source: "minimal_demo"
last_sync: "${new Date().toISOString()}"
---

# ${roleEmoji} ${user.firstName} ${user.lastName}

## Профиль ${user.userRole === "admin" ? "администратора" : "игрока"}

- **Логин**: \`= this.username\`
- **Рейтинг**: \`= this.current_rating\` ⭐
- **Роль**: \`= this.user_role\`
- **Бонусы**: \`= this.bonus_points\` баллов
- **Email**: \`= this.email\`

## Статистика

- ID участника: \`= this.member_id\`
- Статус: \`= this.status\`
- Последняя синхронизация: \`= this.last_sync\`

---

*📡 Автоматически синхронизировано через Minimal Demo*
*🧪 Тестовый пример Real-time синхронизации*`;
}

/**
 * 👤 Синхронизация пользователя с Obsidian
 */
async function syncUserToObsidian(user: any) {
  try {
    const fileName = `User-${user.firstName}-${user.lastName}-Demo.md`;
    const filePath = path.join(OBSIDIAN_PATH, fileName);
    
    const content = generateUserMarkdown(user);
    
    // Убеждаемся, что директория существует
    await fs.mkdir(OBSIDIAN_PATH, { recursive: true });
    
    await fs.writeFile(filePath, content, "utf8");
    console.log(`✅ Синхронизирован: ${fileName}`);
    
    return { success: true, fileName };
    
  } catch (error) {
    console.error(`❌ Ошибка синхронизации:`, error);
    throw error;
  }
}

/**
 * 📊 Обновление сводной таблицы
 */
async function updateSummaryTable() {
  try {
    const filePath = path.join(OBSIDIAN_PATH, "👥 Users Demo - Minimal Real-time.md");
    
    const content = `---
title: "👥 Users Demo - Minimal Real-time"
tags: [database, users, demo, minimal]
last_sync: "${new Date().toISOString()}"
total_users: ${users.length}
---

# 👥 Users Demo - Minimal Real-time

> **🧪 Минимальный пример real-time синхронизации**  
> Последнее обновление: ${new Date().toLocaleString()}  
> Всего пользователей: **${users.length}**

## 📊 Список Пользователей

| 👤 Имя | 🔑 Логин | 🎭 Роль | ⭐ Рейтинг | 📧 Email |
|--------|----------|---------|------------|----------|
${users.map(u => 
  `| [[User-${u.firstName}-${u.lastName}-Demo\\|${u.firstName} ${u.lastName}]] | ${u.username} | ${u.userRole} | ${u.currentRating || 0} | ${u.email} |`
).join('\n')}

## 🔄 API Endpoints

- **GET /users** - Список пользователей
- **POST /users** - Создать пользователя
- **POST /sync** - Ручная синхронизация
- **POST /test-user** - Создать тестового пользователя

## 🧪 Тестирование

\`\`\`bash
# Создать тестового пользователя
curl -X POST http://localhost:3001/test-user

# Ручная синхронизация
curl -X POST http://localhost:3001/sync
\`\`\`

---

*🧪 Минимальный пример для демонстрации*
*🔄 Обновляется автоматически при изменениях*`;

    await fs.writeFile(filePath, content, "utf8");
    console.log("✅ Обновлена сводная таблица");
    
  } catch (error) {
    console.error("❌ Ошибка обновления сводной таблицы:", error);
  }
}

// API Routes

/**
 * 📊 Получить всех пользователей
 */
app.get("/users", (req, res) => {
  res.json({ 
    success: true, 
    data: users,
    count: users.length 
  });
});

/**
 * 👤 Создать нового пользователя
 */
app.post("/users", async (req, res) => {
  try {
    const newUser = {
      id: users.length + 1,
      ...req.body,
      createdAt: new Date().toISOString(),
    };
    
    users.push(newUser);
    
    // Синхронизируем с Obsidian
    await syncUserToObsidian(newUser);
    await updateSummaryTable();
    
    res.json({ 
      success: true, 
      message: "Пользователь создан и синхронизирован",
      data: newUser 
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});

/**
 * 🧪 Создать тестового пользователя
 */
app.post("/test-user", async (req, res) => {
  try {
    const testUser = {
      id: users.length + 1,
      firstName: "Test",
      lastName: `User${Date.now()}`,
      username: `test_user_${Date.now()}`,
      email: `test${Date.now()}@example.com`,
      userRole: "player",
      currentRating: Math.floor(Math.random() * 1000) + 1000,
      bonusPoints: Math.floor(Math.random() * 100),
      memberId: `TEST${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    
    users.push(testUser);
    
    // Синхронизируем с Obsidian
    await syncUserToObsidian(testUser);
    await updateSummaryTable();
    
    res.json({ 
      success: true, 
      message: "Тестовый пользователь создан и синхронизирован",
      data: testUser 
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});

/**
 * 🔄 Ручная синхронизация всех пользователей
 */
app.post("/sync", async (req, res) => {
  try {
    console.log("🔄 Ручная синхронизация всех пользователей...");
    
    for (const user of users) {
      await syncUserToObsidian(user);
    }
    
    await updateSummaryTable();
    
    res.json({ 
      success: true, 
      message: `Синхронизировано ${users.length} пользователей`,
      count: users.length 
    });
    
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});

/**
 * 🏠 Главная страница
 */
app.get("/", (req, res) => {
  res.json({
    name: "Minimal Real-time Sync Demo",
    version: "1.0.0",
    endpoints: {
      users: "GET /users",
      createUser: "POST /users",
      testUser: "POST /test-user", 
      sync: "POST /sync",
    },
    obsidianPath: OBSIDIAN_PATH,
    usersCount: users.length,
  });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log("🚀 Minimal Real-time Sync Demo");
  console.log("=" .repeat(50));
  console.log(`📍 Сервер запущен: http://localhost:${PORT}`);
  console.log(`📁 Obsidian путь: ${OBSIDIAN_PATH}`);
  console.log(`👥 Пользователей в памяти: ${users.length}`);
  console.log("");
  console.log("🧪 Тестовые команды:");
  console.log(`   curl http://localhost:${PORT}/users`);
  console.log(`   curl -X POST http://localhost:${PORT}/test-user`);
  console.log(`   curl -X POST http://localhost:${PORT}/sync`);
  console.log("");
  console.log("🔄 Готов к тестированию real-time синхронизации!");
  
  // Выполняем начальную синхронизацию
  setTimeout(async () => {
    try {
      console.log("🔄 Выполняем начальную синхронизацию...");
      for (const user of users) {
        await syncUserToObsidian(user);
      }
      await updateSummaryTable();
      console.log("✅ Начальная синхронизация завершена!");
    } catch (error) {
      console.error("❌ Ошибка начальной синхронизации:", error);
    }
  }, 1000);
});
