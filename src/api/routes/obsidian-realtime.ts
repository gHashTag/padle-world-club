/**
 * 🔄 Real-time Obsidian Sync Routes
 * Минимальный пример для тестирования синхронизации
 */

import { Router, Request, Response } from "express";
import { z } from "zod";
import { db } from "../../db";
import { user } from "../../db/schema";
import { eq } from "drizzle-orm";
import fs from "fs/promises";
import path from "path";

const router = Router();

// Схема для webhook данных
const webhookSchema = z.object({
  table: z.string(),
  action: z.enum(["INSERT", "UPDATE", "DELETE"]),
  data: z.record(z.any()),
  timestamp: z.string().optional(),
});

// Путь к файлам Obsidian
const OBSIDIAN_DB_PATH = path.join(process.cwd(), "oxygen-world", "Database");

/**
 * 🔗 Webhook endpoint для получения уведомлений от PostgreSQL
 */
router.post("/webhook", async (req: Request, res: Response) => {
  try {
    console.log("🔔 Получен webhook:", req.body);
    
    const { table, action, data } = webhookSchema.parse(req.body);
    
    // Обрабатываем только таблицу users для начала
    if (table === "user") {
      await syncUserToObsidian(action, data);
    }
    
    res.json({ 
      success: true, 
      message: `Sync completed for ${table}`,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("❌ Ошибка webhook:", error);
    res.status(400).json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});

/**
 * 📊 Endpoint для ручного запуска синхронизации
 */
router.post("/sync-users", async (req: Request, res: Response) => {
  try {
    console.log("🔄 Ручная синхронизация пользователей...");
    
    if (!db) {
      throw new Error("Database not connected");
    }
    
    // Получаем всех пользователей из БД
    const users = await db.select().from(user).limit(10);
    console.log(`📊 Найдено пользователей: ${users.length}`);
    
    // Синхронизируем каждого пользователя
    for (const userData of users) {
      await syncUserToObsidian("INSERT", userData);
    }
    
    // Обновляем сводную таблицу
    await updateUsersTable(users);
    
    res.json({ 
      success: true, 
      message: `Синхронизировано ${users.length} пользователей`,
      users: users.length,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("❌ Ошибка синхронизации:", error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});

/**
 * 🧪 Тестовый endpoint для создания пользователя
 */
router.post("/test-create-user", async (req: Request, res: Response) => {
  try {
    if (!db) {
      throw new Error("Database not connected");
    }
    
    const testUser = {
      username: `test_user_${Date.now()}`,
      firstName: "Test",
      lastName: "User",
      email: `test${Date.now()}@example.com`,
      phone: "+66-89-999-0000",
      userRole: "player" as const,
      currentRating: 1500,
      bonusPoints: 0,
      memberId: `TEST${Date.now()}`,
    };
    
    console.log("🧪 Создаем тестового пользователя:", testUser);
    
    // Создаем пользователя в БД
    const [newUser] = await db.insert(user).values(testUser).returning();
    
    // Синхронизируем с Obsidian
    await syncUserToObsidian("INSERT", newUser);
    
    // Обновляем сводную таблицу
    const allUsers = await db.select().from(user).limit(10);
    await updateUsersTable(allUsers);
    
    res.json({ 
      success: true, 
      message: "Тестовый пользователь создан и синхронизирован",
      user: newUser,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error("❌ Ошибка создания тестового пользователя:", error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});

/**
 * 👤 Синхронизация пользователя с Obsidian
 */
async function syncUserToObsidian(action: string, userData: any) {
  try {
    const fileName = `User-${userData.firstName}-${userData.lastName}.md`;
    const filePath = path.join(OBSIDIAN_DB_PATH, fileName);
    
    if (action === "DELETE") {
      // Удаляем файл
      try {
        await fs.unlink(filePath);
        console.log(`🗑️ Удален файл: ${fileName}`);
      } catch (error) {
        console.log(`⚠️ Файл не найден для удаления: ${fileName}`);
      }
      return;
    }
    
    // Создаем/обновляем файл пользователя
    const content = generateUserMarkdown(userData);
    
    // Убеждаемся, что директория существует
    await fs.mkdir(OBSIDIAN_DB_PATH, { recursive: true });
    
    await fs.writeFile(filePath, content, "utf8");
    console.log(`✅ ${action === "INSERT" ? "Создан" : "Обновлен"} файл: ${fileName}`);
    
  } catch (error) {
    console.error(`❌ Ошибка синхронизации пользователя:`, error);
    throw error;
  }
}

/**
 * 📝 Генерация markdown для пользователя
 */
function generateUserMarkdown(userData: any): string {
  const roleEmoji = {
    player: "🎾",
    admin: "👨‍💼", 
    club_staff: "👷",
    trainer: "🎓"
  }[userData.userRole] || "👤";
  
  return `---
title: "${userData.firstName} ${userData.lastName}"
username: "${userData.username}"
first_name: "${userData.firstName}"
last_name: "${userData.lastName}"
email: "${userData.email}"
phone: "${userData.phone || ""}"
user_role: "${userData.userRole}"
current_rating: ${userData.currentRating || 0}
bonus_points: ${userData.bonusPoints || 0}
member_id: "${userData.memberId || ""}"
status: "active"
tags: [user, ${userData.userRole}, realtime_sync]
created_at: "${new Date().toISOString().split("T")[0]}"
sync_source: "realtime_webhook"
last_sync: "${new Date().toISOString()}"
---

# ${roleEmoji} ${userData.firstName} ${userData.lastName}

## Профиль ${userData.userRole === "admin" ? "администратора" : userData.userRole === "player" ? "игрока" : "сотрудника"}

- **Логин**: \`= this.username\`
- **Рейтинг**: \`= this.current_rating\` ⭐
- **Роль**: \`= this.user_role\`
- **Бонусы**: \`= this.bonus_points\` баллов
- **Email**: \`= this.email\`
- **Телефон**: \`= this.phone\`

## Статистика

- Член клуба с: \`= this.created_at\`
- ID участника: \`= this.member_id\`
- Статус: \`= this.status\`
- Последняя синхронизация: \`= this.last_sync\`

## 🔗 **Связи в "Втором Мозге"**

### 🧠 **Модель**
- [[Technical/Models/🧠 MODEL - USER (Central Neuron)|👥 USER (Central Neuron)]] - Центральный нейрон

## 🔗 **Связанные Данные**

### 👥 **Другие Игроки**
- [[User-David-Smith|👤 David Smith - Топ игрок]]
- [[User-Anna-Johnson|👤 Anna Johnson - VIP Тренер]]

### 🎾 **Корты**
- [[Court-Tennis|🎾 Tennis Court - Основной корт]]
- [[Court-Padel|🏓 Padel Court - Премиум корт]]

### 📊 **Аналитика**
- [[👥 Users Data - Oxygen Padel Club Thailand|👥 Все пользователи]]
- [[🏠 MAIN DASHBOARD|🏠 Главный дашборд]]

### 🧠 **"Второй Мозг" Сервера**
- [[Technical/Models/🧠 MODELS NAVIGATOR - Все 31 Модель|🧠 Навигатор по Всем 31 Модели]]
- [[🧠 NEURAL NETWORK VISUALIZATION - Complete Connections Map|🧠 Карта Связей]]

---

*📡 Автоматически синхронизировано через Real-time Webhook*
*🧠 Часть "Второго Мозга" Сервера*
*🏝️ Phangan Padel Tennis Club Member*`;
}

/**
 * 📊 Обновление сводной таблицы пользователей
 */
async function updateUsersTable(users: any[]) {
  try {
    const filePath = path.join(OBSIDIAN_DB_PATH, "👥 Users Data - Real-time Sync.md");
    
    const content = `---
title: "👥 Users Data - Real-time Sync"
tags: [database, users, realtime]
last_sync: "${new Date().toISOString()}"
total_users: ${users.length}
---

# 👥 Users Data - Real-time Sync

> **🔄 Real-time синхронизация активна**  
> Последнее обновление: ${new Date().toLocaleString()}  
> Всего пользователей: **${users.length}**

## 📊 Список Пользователей

| 👤 Имя | 🔑 Логин | 🎭 Роль | ⭐ Рейтинг | 📧 Email |
|--------|----------|---------|------------|----------|
${users.map(u => 
  `| [[User-${u.firstName}-${u.lastName}\\|${u.firstName} ${u.lastName}]] | ${u.username} | ${u.userRole} | ${u.currentRating || 0} | ${u.email} |`
).join('\n')}

## 📈 Статистика

- **Всего пользователей**: ${users.length}
- **Игроков**: ${users.filter(u => u.userRole === 'player').length}
- **Администраторов**: ${users.filter(u => u.userRole === 'admin').length}
- **Сотрудников**: ${users.filter(u => u.userRole === 'club_staff').length}

## 🔄 Real-time Endpoints

- **Webhook**: \`POST /api/obsidian-realtime/webhook\`
- **Ручная синхронизация**: \`POST /api/obsidian-realtime/sync-users\`
- **Тест создания**: \`POST /api/obsidian-realtime/test-create-user\`

---

*🔄 Обновляется автоматически при изменениях в БД*`;

    await fs.writeFile(filePath, content, "utf8");
    console.log("✅ Обновлена сводная таблица пользователей");
    
  } catch (error) {
    console.error("❌ Ошибка обновления сводной таблицы:", error);
  }
}

export default router;
