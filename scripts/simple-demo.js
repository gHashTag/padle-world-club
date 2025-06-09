#!/usr/bin/env node
/**
 * 🧪 Простейший пример real-time синхронизации
 * Чистый JavaScript без TypeScript
 */

const express = require("express");
const fs = require("fs").promises;
const path = require("path");

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
let users = [
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
function generateUserMarkdown(user) {
  const roleEmojis = {
    player: "🎾",
    admin: "👨‍💼", 
    club_staff: "👷",
    trainer: "🎓"
  };
  
  const roleEmoji = roleEmojis[user.userRole] || "👤";
  
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
tags: [user, ${user.userRole}, simple_demo]
created_at: "${new Date().toISOString().split("T")[0]}"
sync_source: "simple_demo"
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

## 🔗 **Связи в "Втором Мозге"**

### 👥 **Другие Игроки**
- [[User-David-Smith-Demo|👤 David Smith - Топ игрок]]
- [[User-Anna-Johnson-Demo|👤 Anna Johnson - Администратор]]

### 📊 **Аналитика**
- [[👥 Users Demo - Simple Real-time|👥 Все пользователи]]

---

*📡 Автоматически синхронизировано через Simple Demo*
*🧪 Тестовый пример Real-time синхронизации*
*🏝️ Phangan Padel Tennis Club Member*`;
}

/**
 * 👤 Синхронизация пользователя с Obsidian
 */
async function syncUserToObsidian(user) {
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
    const filePath = path.join(OBSIDIAN_PATH, "👥 Users Demo - Simple Real-time.md");
    
    const content = `---
title: "👥 Users Demo - Simple Real-time"
tags: [database, users, demo, simple]
last_sync: "${new Date().toISOString()}"
total_users: ${users.length}
---

# 👥 Users Demo - Simple Real-time

> **🧪 Простейший пример real-time синхронизации**  
> Последнее обновление: ${new Date().toLocaleString()}  
> Всего пользователей: **${users.length}**

## 📊 Список Пользователей

| 👤 Имя | 🔑 Логин | 🎭 Роль | ⭐ Рейтинг | 📧 Email |
|--------|----------|---------|------------|----------|
${users.map(u => 
  `| [[User-${u.firstName}-${u.lastName}-Demo\\|${u.firstName} ${u.lastName}]] | ${u.username} | ${u.userRole} | ${u.currentRating || 0} | ${u.email} |`
).join('\n')}

## 🔄 API Endpoints (http://localhost:3001)

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

# Получить список пользователей
curl http://localhost:3001/users
\`\`\`

## 🎯 **Как это работает**

1. **API создает/изменяет пользователя** → Сохраняется в памяти
2. **Автоматически вызывается syncUserToObsidian()** → Создается .md файл
3. **Обновляется сводная таблица** → Этот файл обновляется
4. **Obsidian видит изменения** → Файлы появляются в графе

### ✅ **Преимущества этого подхода:**
- **Мгновенная синхронизация** - изменения видны сразу
- **Двусторонняя связь** - API ↔ Obsidian
- **Простота** - минимум кода
- **Масштабируемость** - легко добавить новые таблицы

---

*🧪 Простейший пример для демонстрации концепции*
*🔄 Обновляется автоматически при изменениях через API*`;

    await fs.writeFile(filePath, content, "utf8");
    console.log("✅ Обновлена сводная таблица");
    
  } catch (error) {
    console.error("❌ Ошибка обновления сводной таблицы:", error);
  }
}

// API Routes

/**
 * 🏠 Главная страница
 */
app.get("/", (req, res) => {
  res.json({
    name: "Simple Real-time Sync Demo",
    version: "1.0.0",
    description: "Простейший пример синхронизации API ↔ Obsidian",
    endpoints: {
      users: "GET /users - Список пользователей",
      createUser: "POST /users - Создать пользователя",
      testUser: "POST /test-user - Создать тестового пользователя", 
      sync: "POST /sync - Ручная синхронизация",
    },
    obsidianPath: OBSIDIAN_PATH,
    usersCount: users.length,
    status: "🔄 Ready for real-time sync testing!"
  });
});

/**
 * 📊 Получить всех пользователей
 */
app.get("/users", (req, res) => {
  res.json({ 
    success: true, 
    data: users,
    count: users.length,
    message: "Список пользователей получен"
  });
});

/**
 * 🧪 Создать тестового пользователя
 */
app.post("/test-user", async (req, res) => {
  try {
    const timestamp = Date.now();
    const testUser = {
      id: users.length + 1,
      firstName: "Test",
      lastName: `User${timestamp}`,
      username: `test_user_${timestamp}`,
      email: `test${timestamp}@example.com`,
      userRole: "player",
      currentRating: Math.floor(Math.random() * 1000) + 1000,
      bonusPoints: Math.floor(Math.random() * 100),
      memberId: `TEST${timestamp}`,
      createdAt: new Date().toISOString(),
    };
    
    users.push(testUser);
    console.log(`🧪 Создан тестовый пользователь: ${testUser.firstName} ${testUser.lastName}`);
    
    // Синхронизируем с Obsidian
    await syncUserToObsidian(testUser);
    await updateSummaryTable();
    
    res.json({ 
      success: true, 
      message: "Тестовый пользователь создан и синхронизирован с Obsidian",
      data: testUser,
      obsidianFile: `User-${testUser.firstName}-${testUser.lastName}-Demo.md`
    });
    
  } catch (error) {
    console.error("❌ Ошибка создания тестового пользователя:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message || "Unknown error" 
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
      message: `Синхронизировано ${users.length} пользователей с Obsidian`,
      count: users.length,
      obsidianPath: OBSIDIAN_PATH
    });
    
  } catch (error) {
    console.error("❌ Ошибка синхронизации:", error);
    res.status(500).json({ 
      success: false, 
      error: error.message || "Unknown error" 
    });
  }
});

// Запуск сервера
app.listen(PORT, () => {
  console.log("🚀 Simple Real-time Sync Demo");
  console.log("=" .repeat(60));
  console.log(`📍 Сервер запущен: http://localhost:${PORT}`);
  console.log(`📁 Obsidian путь: ${OBSIDIAN_PATH}`);
  console.log(`👥 Пользователей в памяти: ${users.length}`);
  console.log("");
  console.log("🧪 Тестовые команды:");
  console.log(`   curl http://localhost:${PORT}`);
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
      console.log("📁 Проверьте файлы в oxygen-world/Database/");
    } catch (error) {
      console.error("❌ Ошибка начальной синхронизации:", error);
    }
  }, 1000);
});
