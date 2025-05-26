/**
 * Vercel Serverless Function Entry Point
 * Простая версия для демонстрации
 */

const express = require('express');
const app = express();

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Главная страница
app.get('/', (req: any, res: any) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ru">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Padel World Club</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #2c3e50; text-align: center; }
        .status { background: #e8f5e8; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .endpoints { background: #f8f9fa; padding: 20px; border-radius: 5px; }
        .endpoint { margin: 10px 0; }
        .endpoint a { color: #3498db; text-decoration: none; }
        .endpoint a:hover { text-decoration: underline; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🏓 Padel World Club API</h1>
        <div class="status">
          <h3>✅ Статус: Работает</h3>
          <p>API успешно развернут на Vercel</p>
          <p><strong>Режим:</strong> Demo (без подключения к базе данных)</p>
        </div>
        <div class="endpoints">
          <h3>📋 Доступные эндпоинты:</h3>
          <div class="endpoint">🏥 <a href="/health">Health Check</a> - проверка состояния API</div>
          <div class="endpoint">📊 <a href="/api">API Info</a> - информация об API</div>
          <div class="endpoint">📚 <a href="/docs">Swagger Documentation</a> - документация API</div>
        </div>
      </div>
    </body>
    </html>
  `);
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
      docs: '/docs'
    },
    status: 'demo mode - database not connected'
  });
});

// Docs endpoint
app.get('/docs', (req: any, res: any) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="ru">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Padel World Club API - Documentation</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
        .container { max-width: 1000px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        h1 { color: #2c3e50; text-align: center; }
        h2 { color: #34495e; border-bottom: 2px solid #3498db; padding-bottom: 10px; }
        .endpoint { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #3498db; }
        .method { background: #27ae60; color: white; padding: 4px 8px; border-radius: 3px; font-size: 12px; font-weight: bold; }
        .url { font-family: monospace; background: #ecf0f1; padding: 4px 8px; border-radius: 3px; }
        .back { text-align: center; margin-top: 30px; }
        .back a { color: #3498db; text-decoration: none; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>📚 Padel World Club API Documentation</h1>

        <h2>Доступные эндпоинты</h2>

        <div class="endpoint">
          <h3><span class="method">GET</span> <span class="url">/</span></h3>
          <p>Главная страница API с информацией о доступных эндпоинтах</p>
        </div>

        <div class="endpoint">
          <h3><span class="method">GET</span> <span class="url">/health</span></h3>
          <p>Проверка состояния API. Возвращает JSON с информацией о статусе сервиса.</p>
        </div>

        <div class="endpoint">
          <h3><span class="method">GET</span> <span class="url">/api</span></h3>
          <p>Информация об API. Возвращает JSON с метаданными API.</p>
        </div>

        <div class="endpoint">
          <h3><span class="method">GET</span> <span class="url">/docs</span></h3>
          <p>Документация API (эта страница).</p>
        </div>

        <div class="back">
          <a href="/">← Вернуться на главную</a>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Catch all
app.get('*', (req: any, res: any) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.path} not found`,
    availableRoutes: ['/', '/health', '/api']
  });
});

module.exports = app;
