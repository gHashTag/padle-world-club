/**
 * Integration тесты для Payments API endpoints
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import createApp from '../../app';

const app = createApp();

describe('Payments API Integration Tests', () => {
  beforeAll(async () => {
    console.log('Setting up Payments API integration tests...');
  });

  afterAll(async () => {
    console.log('Cleaning up Payments API integration tests...');
  });

  describe('Protected Routes Authentication', () => {
    it('POST /api/payments должен требовать аутентификации', async () => {
      await request(app)
        .post('/api/payments')
        .send({ amount: 100, bookingId: 'test-booking' })
        .expect(401);
    });

    it('GET /api/payments/:id должен требовать аутентификации', async () => {
      await request(app)
        .get('/api/payments/test-id')
        .expect(401);
    });

    it('PUT /api/payments/:id должен требовать аутентификации', async () => {
      await request(app)
        .put('/api/payments/test-id')
        .send({ status: 'completed' })
        .expect(401);
    });

    it('DELETE /api/payments/:id должен требовать аутентификации', async () => {
      await request(app)
        .delete('/api/payments/test-id')
        .expect(401);
    });

    it('GET /api/payments должен требовать аутентификации', async () => {
      await request(app)
        .get('/api/payments')
        .expect(401);
    });

    it('PUT /api/payments/:id/status должен требовать аутентификации', async () => {
      await request(app)
        .put('/api/payments/test-id/status')
        .send({ status: 'completed' })
        .expect(401);
    });

    it('POST /api/payments/:id/refund должен требовать аутентификации', async () => {
      await request(app)
        .post('/api/payments/test-id/refund')
        .send({ reason: 'test refund' })
        .expect(401);
    });

    it('GET /api/payments/user/:userId должен требовать аутентификации', async () => {
      await request(app)
        .get('/api/payments/user/test-user')
        .expect(401);
    });

    it('GET /api/payments/stats должен требовать аутентификации', async () => {
      await request(app)
        .get('/api/payments/stats')
        .expect(401);
    });

    it('POST /api/payments/webhook должен быть доступен без аутентификации', async () => {
      const response = await request(app)
        .post('/api/payments/webhook')
        .send({ event: 'payment.completed', data: {} });

      // Webhook может вернуть разные коды в зависимости от реализации
      expect([200, 400, 422]).toContain(response.status);
    });
  });

  describe('Route Structure Validation', () => {
    it('должен правильно обрабатывать неверные HTTP методы', async () => {
      await request(app)
        .patch('/api/payments/test-id')
        .expect(404);
    });

    it('должен правильно обрабатывать несуществующие подмаршруты', async () => {
      await request(app)
        .get('/api/payments/test-id/nonexistent')
        .expect(404);
    });
  });

  describe('API Response Format', () => {
    it('все endpoints должны возвращать JSON', async () => {
      const response = await request(app)
        .get('/api/payments/test-id')
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
        .options('/api/payments')
        .expect(204);
    });

    it('должен возвращать правильные Content-Type headers', async () => {
      const response = await request(app)
        .get('/api/payments/test-id')
        .expect(401);

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });
  });
});
