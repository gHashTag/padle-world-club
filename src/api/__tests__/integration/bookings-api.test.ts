/**
 * Integration тесты для Bookings API endpoints
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import createApp from '../../app';

const app = createApp();

describe('Bookings API Integration Tests', () => {
  beforeAll(async () => {
    console.log('Setting up Bookings API integration tests...');
  });

  afterAll(async () => {
    console.log('Cleaning up Bookings API integration tests...');
  });

  describe('Protected Routes Authentication', () => {
    it('POST /api/bookings должен требовать аутентификации', async () => {
      await request(app)
        .post('/api/bookings')
        .send({ courtId: 'test', startTime: '2024-01-01T10:00:00Z' })
        .expect(401);
    });

    it('GET /api/bookings/:id должен требовать аутентификации', async () => {
      await request(app)
        .get('/api/bookings/test-id')
        .expect(401);
    });

    it('PUT /api/bookings/:id должен требовать аутентификации', async () => {
      await request(app)
        .put('/api/bookings/test-id')
        .send({ status: 'confirmed' })
        .expect(401);
    });

    it('DELETE /api/bookings/:id должен требовать аутентификации', async () => {
      await request(app)
        .delete('/api/bookings/test-id')
        .expect(401);
    });

    it('GET /api/bookings должен требовать аутентификации', async () => {
      await request(app)
        .get('/api/bookings')
        .expect(401);
    });

    it('POST /api/bookings/:id/confirm должен требовать аутентификации', async () => {
      await request(app)
        .post('/api/bookings/test-id/confirm')
        .expect(401);
    });

    it('DELETE /api/bookings/:id (cancel) должен требовать аутентификации', async () => {
      await request(app)
        .delete('/api/bookings/test-id')
        .expect(401);
    });

    it('POST /api/bookings/:id/participants должен требовать аутентификации', async () => {
      await request(app)
        .post('/api/bookings/test-id/participants')
        .send({ userId: 'test-user' })
        .expect(401);
    });

    it('DELETE /api/bookings/:id/participants/:userId должен требовать аутентификации', async () => {
      await request(app)
        .delete('/api/bookings/test-id/participants/test-user')
        .expect(401);
    });

    it('GET /api/bookings/:id/participants должен требовать аутентификации', async () => {
      await request(app)
        .get('/api/bookings/test-id/participants')
        .expect(401);
    });
  });

  describe('Route Structure Validation', () => {
    it('должен правильно обрабатывать неверные HTTP методы', async () => {
      await request(app)
        .patch('/api/bookings/test-id')
        .expect(404);
    });

    it('должен правильно обрабатывать несуществующие подмаршруты', async () => {
      await request(app)
        .get('/api/bookings/test-id/nonexistent')
        .expect(404);
    });
  });

  describe('API Response Format', () => {
    it('все endpoints должны возвращать JSON', async () => {
      const response = await request(app)
        .get('/api/bookings/test-id')
        .expect(401);

      expect(response.headers['content-type']).toMatch(/application\/json/);
      expect(response.body).toHaveProperty('success');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body.success).toBe(false);
    });
  });

  describe('CORS and Headers', () => {
    it('должен правильно обрабатывать CORS preflight', async () => {
      await request(app)
        .options('/api/bookings')
        .expect(204);
    });

    it('должен возвращать правильные Content-Type headers', async () => {
      const response = await request(app)
        .get('/api/bookings/test-id')
        .expect(401);

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });
  });
});
