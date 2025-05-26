/**
 * Vercel Serverless Function Entry Point
 * Этот файл экспортирует Express приложение для Vercel
 */

import { createApp } from '../src/api/app';

let app: any = null;

// Создание приложения с обработкой ошибок
const getApp = () => {
  if (!app) {
    try {
      console.log('🚀 Создание Express приложения для Vercel...');
      app = createApp();
      console.log('✅ Express приложение создано для Vercel');
    } catch (error) {
      console.error('💥 Ошибка создания приложения:', error);
      // Создаем минимальное приложение для отображения ошибки
      const express = require('express');
      app = express();
      app.get('*', (req: any, res: any) => {
        res.status(500).json({
          error: 'Application failed to initialize',
          message: error instanceof Error ? error.message : 'Unknown error'
        });
      });
    }
  }
  return app;
};

// Экспорт для Vercel
export default getApp();
