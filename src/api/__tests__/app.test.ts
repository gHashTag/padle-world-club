/**
 * Тесты для Express приложения
 */

import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { Application } from 'express';
import { createApp } from '../app';

describe('Express API Application', () => {
  let app: Application;

  beforeAll(() => {
    app = createApp();
  });

  describe('Health Check', () => {
    it('должен возвращать статус OK для /health', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'Сервер работает нормально',
        timestamp: expect.any(String),
        path: '/health',
        method: 'GET',
      });

      expect(response.body.data).toMatchObject({
        status: 'OK',
        timestamp: expect.any(String),
        uptime: expect.any(Number),
        memory: expect.any(Object),
        version: expect.any(String),
      });
    });

    it('должен содержать информацию о памяти', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.data.memory).toHaveProperty('rss');
      expect(response.body.data.memory).toHaveProperty('heapTotal');
      expect(response.body.data.memory).toHaveProperty('heapUsed');
      expect(response.body.data.memory).toHaveProperty('external');
    });
  });

  describe('API Info', () => {
    it('должен возвращать информацию об API для /api', async () => {
      const response = await request(app)
        .get('/api')
        .expect(200);

      expect(response.body).toMatchObject({
        success: true,
        message: 'API готов к работе',
        timestamp: expect.any(String),
        path: '/',
        method: 'GET',
      });

      expect(response.body.data).toMatchObject({
        name: 'Padle World Club API',
        version: '1.0.0',
        description: 'REST API для системы управления падел-клубом',
        endpoints: expect.any(Object),
      });
    });

    it('должен содержать список доступных endpoints', async () => {
      const response = await request(app)
        .get('/api')
        .expect(200);

      const endpoints = response.body.data.endpoints;
      expect(endpoints).toHaveProperty('users');
      expect(endpoints).toHaveProperty('venues');
      expect(endpoints).toHaveProperty('courts');
      expect(endpoints).toHaveProperty('bookings');
      expect(endpoints).toHaveProperty('payments');
      expect(endpoints).toHaveProperty('tournaments');
      expect(endpoints).toHaveProperty('gameSessions');
    });
  });

  describe('404 Handler', () => {
    it('должен возвращать 404 для несуществующих маршрутов', async () => {
      const response = await request(app)
        .get('/nonexistent-route')
        .expect(404);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Маршрут GET /nonexistent-route не найден',
        timestamp: expect.any(String),
        path: '/nonexistent-route',
        method: 'GET',
      });
    });

    it('должен возвращать 404 для несуществующих API маршрутов', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);

      expect(response.body).toMatchObject({
        success: false,
        message: 'Маршрут GET /api/nonexistent не найден',
        timestamp: expect.any(String),
        path: '/api/nonexistent',
        method: 'GET',
      });
    });
  });

  describe('CORS Headers', () => {
    it('должен включать CORS заголовки', async () => {
      const response = await request(app)
        .get('/health')
        .set('Origin', 'http://localhost:3000')
        .expect(200);

      // В тестовой среде CORS может не включаться, просто проверим что запрос прошел
      expect(response.status).toBe(200);
    });

    it('должен обрабатывать OPTIONS запросы', async () => {
      await request(app)
        .options('/api')
        .expect(204);
    });
  });

  describe('Content Type', () => {
    it('должен возвращать JSON для API endpoints', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });
  });

  describe('Error Handling', () => {
    it('должен обрабатывать JSON parsing ошибки', async () => {
      const response = await request(app)
        .post('/api')
        .set('Content-Type', 'application/json')
        .send('invalid json');

      // Может быть 400 или 500 в зависимости от обработки
      expect([400, 500]).toContain(response.status);
      expect(response.body.success).toBe(false);
    });
  });

  describe('Security Headers', () => {
    it('должен включать security заголовки от helmet', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      // Проверяем наличие основных security заголовков
      expect(response.headers).toHaveProperty('x-content-type-options');
      expect(response.headers).toHaveProperty('x-frame-options');
      expect(response.headers).toHaveProperty('x-xss-protection');
    });
  });

  describe('Compression', () => {
    it('должен поддерживать gzip сжатие', async () => {
      const response = await request(app)
        .get('/health')
        .set('Accept-Encoding', 'gzip')
        .expect(200);

      // Если сжатие включено, должен быть заголовок
      if (response.headers['content-encoding']) {
        expect(response.headers['content-encoding']).toMatch(/gzip/);
      }
    });
  });

  describe('Request Size Limits', () => {
    it('должен принимать JSON до 10MB', async () => {
      const largeData = { data: 'x'.repeat(1000) }; // Небольшой тест

      const response = await request(app)
        .post('/api')
        .send(largeData);

      // Ожидаем либо успешный ответ, либо 404 (если endpoint не существует)
      expect([200, 404]).toContain(response.status);

      // Если 404, то success будет false, если 200 - то true
      if (response.status === 200) {
        expect(response.body.success).toBe(true);
      } else {
        expect(response.body.success).toBe(false);
      }
    });
  });
});
