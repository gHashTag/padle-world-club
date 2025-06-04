/**
 * Express сервер для Padle World Club API
 */

import { createApp } from './app';
import { config, validateConfig } from './config';

// Функция для запуска сервера
const startServer = async (): Promise<void> => {
  try {
    // Валидация конфигурации
    console.log('🔧 Проверка конфигурации...');
    validateConfig();
    console.log('✅ Конфигурация валидна');

    // Создание Express приложения
    console.log('🚀 Создание Express приложения...');
    const app = createApp();
    console.log('✅ Express приложение создано');

    // Запуск сервера
    const server = app.listen(config.server.port, config.server.host, () => {
      console.log('🎉 Сервер запущен успешно!');
      console.log(`📍 Адрес: http://${config.server.host}:${config.server.port}`);
      console.log(`🏥 Health check: http://${config.server.host}:${config.server.port}/health`);
      console.log(`📊 API info: http://${config.server.host}:${config.server.port}/api`);
      
      if (config.swagger.enabled) {
        console.log(`📚 Swagger docs: http://${config.server.host}:${config.server.port}${config.swagger.path}`);
      }
      
      console.log('🔥 Готов к обработке запросов!');
    });

    // Graceful shutdown
    const gracefulShutdown = (signal: string) => {
      console.log(`\n🛑 Получен сигнал ${signal}, начинаем graceful shutdown...`);
      
      server.close((err) => {
        if (err) {
          console.error('❌ Ошибка при закрытии сервера:', err);
          process.exit(1);
        }
        
        console.log('✅ Сервер закрыт');
        console.log('👋 До свидания!');
        process.exit(0);
      });

      // Принудительное завершение через 10 секунд
      setTimeout(() => {
        console.error('⚠️ Принудительное завершение через 10 секунд');
        process.exit(1);
      }, 10000);
    };

    // Обработчики сигналов
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Обработка необработанных ошибок
    process.on('unhandledRejection', (reason, promise) => {
      console.error('💥 Необработанное отклонение Promise:', reason);
      console.error('Promise:', promise);
      // Не завершаем процесс, просто логируем
    });

    process.on('uncaughtException', (error) => {
      console.error('💥 Необработанное исключение:', error);
      // Завершаем процесс при необработанном исключении
      process.exit(1);
    });

  } catch (error) {
    console.error('💥 Ошибка при запуске сервера:', error);
    process.exit(1);
  }
};

// Запуск сервера только если файл запущен напрямую
if (require.main === module) {
  startServer();
}

export { startServer };
export default startServer;
