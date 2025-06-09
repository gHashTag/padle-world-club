#!/usr/bin/env node
/**
 * 🔄 Синхронизация пользователей из Neon Database в файлы Obsidian
 */

import { Pool } from "pg";
import fs from "fs/promises";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

const OBSIDIAN_DATABASE_PATH = "oxygen-world/Database";

async function syncUsersToObsidian() {
  console.log("🔄 Синхронизация пользователей из БД в Obsidian...");

  const client = await pool.connect();

  try {
    // Получаем пользователей из БД
    const result = await client.query(`
      SELECT 
        username, first_name, last_name, email, phone,
        user_role, current_rating, bonus_points, member_id,
        created_at
      FROM "user" 
      ORDER BY current_rating DESC 
      LIMIT 10
    `);

    console.log(`📊 Найдено пользователей в БД: ${result.rows.length}`);

    // Создаем файлы для каждого пользователя
    for (const user of result.rows) {
      await createUserFile(user);
    }

    console.log("✅ Синхронизация завершена!");
  } catch (error) {
    console.error("❌ Ошибка синхронизации:", error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

async function createUserFile(user) {
  const fileName = `User-${user.first_name}-${user.last_name.replace(
    /'/g,
    ""
  )}.md`;
  const filePath = path.join(OBSIDIAN_DATABASE_PATH, fileName);

  // Определяем эмодзи роли
  const roleEmoji =
    {
      player: "🎾",
      admin: "👨‍💼",
      coach: "🏃‍♂️",
      club_staff: "👷",
    }[user.user_role] || "👤";

  const content = `---
title: "${user.first_name} ${user.last_name}"
username: "${user.username}"
first_name: "${user.first_name}"
last_name: "${user.last_name}"
email: "${user.email}"
phone: "${user.phone || ""}"
user_role: "${user.user_role}"
current_rating: ${user.current_rating || 0}
bonus_points: ${user.bonus_points || 0}
member_id: "${user.member_id || ""}"
status: "active"
tags: [user, ${user.user_role}, thailand]
created_at: "${
    user.created_at ? user.created_at.toISOString().split("T")[0] : "2025-05-30"
  }"
sync_source: "neon_database"
last_sync: "${new Date().toISOString()}"
---

# ${roleEmoji} ${user.first_name} ${user.last_name}

## Профиль ${
    user.user_role === "admin"
      ? "администратора"
      : user.user_role === "player"
      ? "игрока"
      : user.user_role === "coach"
      ? "тренера"
      : "сотрудника"
  }

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

---

*Автоматически синхронизировано с Neon Database*`;

  await fs.writeFile(filePath, content, "utf8");
  console.log(`✅ Создан файл: ${fileName}`);
}

// Запуск
syncUsersToObsidian();
