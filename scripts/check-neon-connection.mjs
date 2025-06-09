#!/usr/bin/env node

import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function checkConnection() {
  console.log('🔗 Проверяем подключение к Neon Database...');
  console.log('📍 URL:', process.env.DATABASE_URL?.substring(0, 50) + '...');
  
  const client = await pool.connect();
  
  try {
    console.log('✅ Подключение успешно!');
    
    // Проверяем версию PostgreSQL
    const version = await client.query('SELECT version()');
    console.log('🐘 PostgreSQL:', version.rows[0].version.split(' ')[1]);
    
    // Проверяем таблицы
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log(`📋 Найдено таблиц: ${tables.rows.length}`);
    tables.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    // Проверяем данные в основных таблицах
    const mainTables = ['user', 'venue', 'court', 'booking', 'payment'];
    
    for (const tableName of mainTables) {
      try {
        const count = await client.query(`SELECT COUNT(*) FROM "${tableName}"`);
        console.log(`📊 ${tableName}: ${count.rows[0].count} записей`);
      } catch (e) {
        console.log(`❌ ${tableName}: таблица не найдена или пуста`);
      }
    }
    
  } catch (error) {
    console.error('❌ Ошибка подключения:', error.message);
  } finally {
    client.release();
    await pool.end();
  }
}

checkConnection().catch(console.error);
