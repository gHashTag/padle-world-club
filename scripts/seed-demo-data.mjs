#!/usr/bin/env node
/**
 * 🌱 Скрипт для наполнения БД демонстрационными данными
 */

import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

async function seedDemoData() {
  console.log("🌱 Добавляем демонстрационные данные...");

  const client = await pool.connect();

  try {
    // Проверяем, есть ли уже данные
    const userCount = await client.query(
      'SELECT COUNT(*) as count FROM "user"'
    );
    console.log(`👥 Текущих пользователей в БД: ${userCount.rows[0].count}`);

    if (parseInt(userCount.rows[0].count) === 0) {
      console.log("➕ Добавляем тестовых пользователей...");

      // Добавляем демо пользователей
      const demoUsers = [
        {
          username: "alex_tennis",
          password_hash: "demo_hash_1",
          first_name: "Александр",
          last_name: "Теннисов",
          email: "alex@phangan-padel.com",
          phone: "+66801234567",
          member_id: "MEMBER_001",
          user_role: "player",
          current_rating: 1650,
          bonus_points: 150,
        },
        {
          username: "maria_coach",
          password_hash: "demo_hash_2",
          first_name: "Мария",
          last_name: "Коучева",
          email: "maria@phangan-padel.com",
          phone: "+66801234568",
          member_id: "MEMBER_002",
          user_role: "coach",
          current_rating: 1850,
          bonus_points: 250,
        },
        {
          username: "john_player",
          password_hash: "demo_hash_3",
          first_name: "John",
          last_name: "Smith",
          email: "john@phangan-padel.com",
          phone: "+66801234569",
          member_id: "MEMBER_003",
          user_role: "player",
          current_rating: 1450,
          bonus_points: 75,
        },
        {
          username: "thai_admin",
          password_hash: "demo_hash_4",
          first_name: "สมชาย",
          last_name: "ผู้จัดการ",
          email: "admin@phangan-padel.com",
          phone: "+66801234570",
          member_id: "MEMBER_004",
          user_role: "admin",
          current_rating: 1500,
          bonus_points: 500,
        },
        {
          username: "anna_beginner",
          password_hash: "demo_hash_5",
          first_name: "Anna",
          last_name: "Novak",
          email: "anna@phangan-padel.com",
          phone: "+66801234571",
          member_id: "MEMBER_005",
          user_role: "player",
          current_rating: 1200,
          bonus_points: 25,
        },
      ];

      for (const user of demoUsers) {
        await client.query(
          `
          INSERT INTO "user" (
            username, password_hash, first_name, last_name, email, phone,
            member_id, user_role, current_rating, bonus_points
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        `,
          [
            user.username,
            user.password_hash,
            user.first_name,
            user.last_name,
            user.email,
            user.phone,
            user.member_id,
            user.user_role,
            user.current_rating,
            user.bonus_points,
          ]
        );

        console.log(
          `✅ Добавлен пользователь: ${user.first_name} ${user.last_name} (${user.user_role})`
        );
      }
    } else {
      console.log("ℹ️ Пользователи уже существуют, пропускаем создание");
    }

    // Проверяем venues
    const venueCount = await client.query(
      'SELECT COUNT(*) as count FROM "venue"'
    );
    console.log(`🏟️ Текущих площадок в БД: ${venueCount.rows[0].count}`);

    if (parseInt(venueCount.rows[0].count) === 0) {
      console.log("➕ Добавляем демонстрационные площадки...");

      const demoVenues = [
        {
          name: "Phangan Padel Club Main",
          address: "123 Haad Rin Beach Road, Koh Phangan",
          city: "Surat Thani",
          country: "Thailand",
          phone_number: "+66801234567",
          email: "info@phangan-padel.com",
        },
        {
          name: "Sunset Tennis Courts",
          address: "456 Thong Nai Pan Beach, Koh Phangan",
          city: "Surat Thani",
          country: "Thailand",
          phone_number: "+66801234568",
          email: "sunset@phangan-padel.com",
        },
      ];

      for (const venue of demoVenues) {
        await client.query(
          `
          INSERT INTO "venue" (name, address, city, country, phone_number, email)
          VALUES ($1, $2, $3, $4, $5, $6)
        `,
          [
            venue.name,
            venue.address,
            venue.city,
            venue.country,
            venue.phone_number,
            venue.email,
          ]
        );

        console.log(`✅ Добавлена площадка: ${venue.name}`);
      }
    }

    // Получаем финальную статистику
    console.log("\n📊 ФИНАЛЬНАЯ СТАТИСТИКА:");

    const finalStats = await client.query(`
      SELECT 
        'users' as table_name,
        COUNT(*) as total_records
      FROM "user"
      UNION ALL
      SELECT 
        'venues' as table_name,
        COUNT(*) as total_records  
      FROM "venue"
      UNION ALL
      SELECT 
        'courts' as table_name,
        COUNT(*) as total_records
      FROM "court"  
      UNION ALL
      SELECT 
        'bookings' as table_name,
        COUNT(*) as total_records
      FROM "booking"
    `);

    console.table(finalStats.rows);

    // Показываем пример данных пользователей
    console.log("\n👥 ПРИМЕР ПОЛЬЗОВАТЕЛЕЙ:");
    const usersPreview = await client.query(`
      SELECT 
        username as "Логин",
        first_name as "Имя",
        last_name as "Фамилия", 
        user_role as "Роль",
        current_rating as "Рейтинг",
        bonus_points as "Бонусы"
      FROM "user" 
      ORDER BY current_rating DESC 
      LIMIT 5
    `);

    console.table(usersPreview.rows);
  } catch (error) {
    console.error("❌ Ошибка при добавлении данных:", error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

// Запуск
seedDemoData();
