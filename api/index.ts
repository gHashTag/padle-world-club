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
    // Пробуем разные пути для HTML файла
    const possiblePaths = [
      path.join(process.cwd(), 'src/api/views/index-detailed.html'),
      path.join(__dirname, '../src/api/views/index-detailed.html'),
      path.join(__dirname, '../../src/api/views/index-detailed.html'),
    ];

    let html = '';
    let foundPath = '';

    for (const htmlPath of possiblePaths) {
      try {
        if (fs.existsSync(htmlPath)) {
          html = fs.readFileSync(htmlPath, 'utf8');
          foundPath = htmlPath;
          break;
        }
      } catch (e) {
        // Продолжаем поиск
      }
    }

    if (html) {
      res.send(html);
    } else {
      // Fallback HTML
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
              <div class="endpoint">📚 <a href="/api/docs">Swagger Documentation</a> - документация API</div>
            </div>
          </div>
        </body>
        </html>
      `);
    }
  } catch (error) {
    res.status(500).json({
      error: 'Failed to load page',
      message: error instanceof Error ? error.message : 'Unknown error',
      cwd: process.cwd(),
      dirname: __dirname
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
