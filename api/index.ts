/**
 * Vercel Serverless Function Entry Point
 * Простая версия для демонстрации
 */

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Главная страница
app.get('/', (req: any, res: any) => {
  try {
    // Читаем HTML файл
    const htmlPath = path.join(process.cwd(), 'src/api/views/index-detailed.html');
    const html = fs.readFileSync(htmlPath, 'utf8');
    res.send(html);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to load page',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Health check
app.get('/health', (req: any, res: any) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: 'vercel',
    message: 'Padel World Club API is running'
  });
});

// API info
app.get('/api', (req: any, res: any) => {
  res.json({
    name: 'Padel World Club API',
    version: '1.0.0',
    description: 'REST API для системы управления падел-клубом',
    endpoints: {
      health: '/health',
      api: '/api',
      docs: '/api/docs'
    },
    status: 'demo mode - database not connected'
  });
});

// Catch all
app.get('*', (req: any, res: any) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.path} not found`,
    availableRoutes: ['/', '/health', '/api']
  });
});

export default app;
