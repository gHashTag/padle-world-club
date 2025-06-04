/**
 * Автоматическое применение миграций Drizzle
 * Использует spawn для запуска drizzle-kit push и автоматически отвечает "Yes"
 */

import { spawn } from 'child_process';

async function autoMigrate() {
  console.log('🔄 Автоматическое применение миграций базы данных...');

  return new Promise<void>((resolve, reject) => {
    // Запускаем drizzle-kit push
    const drizzleProcess = spawn('npx', ['drizzle-kit', 'push'], {
      stdio: ['pipe', 'pipe', 'inherit']
    });

    let output = '';
    let hasPrompt = false;

    // Слушаем вывод
    drizzleProcess.stdout?.on('data', (data) => {
      const text = data.toString();
      output += text;
      process.stdout.write(text);

      // Ищем промпт для подтверждения
      if (text.includes('Yes, I want to execute all statements') && !hasPrompt) {
        hasPrompt = true;
        console.log('\n🤖 Автоматически выбираем "Yes, I want to execute all statements"');
        
        // Отправляем стрелку вниз и Enter для выбора "Yes"
        setTimeout(() => {
          drizzleProcess.stdin?.write('\x1B[B'); // Стрелка вниз
          setTimeout(() => {
            drizzleProcess.stdin?.write('\r'); // Enter
          }, 100);
        }, 500);
      }
    });

    // Обработка завершения процесса
    drizzleProcess.on('close', (code) => {
      if (code === 0) {
        console.log('✅ Миграции успешно применены!');
        resolve();
      } else {
        console.error(`❌ Ошибка при применении миграций. Код выхода: ${code}`);
        reject(new Error(`Migration failed with code ${code}`));
      }
    });

    // Обработка ошибок
    drizzleProcess.on('error', (error) => {
      console.error('❌ Ошибка запуска drizzle-kit:', error);
      reject(error);
    });

    // Таймаут на случай зависания
    setTimeout(() => {
      if (!drizzleProcess.killed) {
        console.log('⏰ Таймаут - завершаем процесс');
        drizzleProcess.kill();
        reject(new Error('Migration timeout'));
      }
    }, 120000); // 2 минуты
  });
}

// Запуск если файл выполняется напрямую
if (require.main === module) {
  autoMigrate()
    .then(() => {
      console.log('🎉 Готово! Теперь можно запустить: npm run seed:db');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Ошибка:', error);
      process.exit(1);
    });
}
