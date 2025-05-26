/**
 * Vercel Serverless Function Entry Point
 * Этот файл экспортирует Express приложение для Vercel
 */

import { createApp } from '../src/api/app';
import { validateConfig } from '../src/api/config';

// Валидация конфигурации при старте
try {
  console.log('🔧 Проверка конфигурации для Vercel...');
  validateConfig();
  console.log('✅ Конфигурация валидна');
} catch (error) {
  console.error('💥 Ошибка конфигурации:', error);
  // В Vercel не можем завершить процесс, просто логируем
}

// Создание Express приложения
console.log('🚀 Создание Express приложения для Vercel...');
const app = createApp();
console.log('✅ Express приложение создано для Vercel');

// Экспорт для Vercel
export default app;
