/**
 * Применение миграций программно
 * Использует drizzle-kit API для автоматического применения изменений схемы
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';

async function applyMigrations() {
  console.log('🔄 Применение миграций базы данных...');

  try {
    // Читаем конфигурацию drizzle
    const configPath = './drizzle.config.ts';
    console.log(`📋 Используем конфигурацию: ${configPath}`);

    // Применяем миграции с автоматическим подтверждением
    console.log('🚀 Запускаем drizzle-kit push...');
    
    // Используем execSync с автоматическим ответом
    const command = 'echo "Yes, I want to execute all statements" | npx drizzle-kit push';
    
    try {
      const output = execSync(command, { 
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 120000 // 2 минуты таймаут
      });
      
      console.log('📤 Вывод drizzle-kit:');
      console.log(output);
      
      if (output.includes('All changes were aborted')) {
        console.log('⚠️  Изменения были отменены. Возможно нет изменений для применения.');
        return;
      }
      
      console.log('✅ Миграции успешно применены!');
      
    } catch (error) {
      // Если команда с pipe не работает, пробуем альтернативный подход
      console.log('⚠️  Первый способ не сработал, пробуем альтернативный...');
      
      try {
        // Создаем временный файл с ответом
        const fs = require('fs');
        const tempFile = '/tmp/drizzle_response.txt';
        fs.writeFileSync(tempFile, 'Yes, I want to execute all statements\n');
        
        const altCommand = `npx drizzle-kit push < ${tempFile}`;
        const altOutput = execSync(altCommand, { 
          encoding: 'utf8',
          stdio: 'pipe',
          timeout: 120000
        });
        
        console.log('📤 Вывод drizzle-kit (альтернативный способ):');
        console.log(altOutput);
        
        // Удаляем временный файл
        fs.unlinkSync(tempFile);
        
        console.log('✅ Миграции успешно применены!');
        
      } catch (altError) {
        console.error('❌ Ошибка при применении миграций:', altError.message);
        console.log('\n🔧 Ручное применение:');
        console.log('1. Запустите: npx drizzle-kit push');
        console.log('2. Выберите: "Yes, I want to execute all statements"');
        throw altError;
      }
    }

  } catch (error) {
    console.error('💥 Ошибка:', error.message);
    throw error;
  }
}

// Запуск если файл выполняется напрямую
if (require.main === module) {
  applyMigrations()
    .then(() => {
      console.log('🎉 Готово! Теперь можно запустить: npm run seed:db');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Ошибка:', error);
      process.exit(1);
    });
}
