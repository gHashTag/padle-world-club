/**
 * Integration тесты для Courts API endpoints
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import createApp from '../../app';

const app = createApp();

describe('Courts API Integration Tests', () => {
  beforeAll(async () => {
    console.log('Setting up Courts API integration tests...');
  });

  afterAll(async () => {
    console.log('Cleaning up Courts API integration tests...');
  });

  describe('Protected Routes Authentication', () => {
    it('POST /api/courts должен требовать аутентификации', async () => {
      await request(app)
        .post('/api/courts')
        .send({ name: 'Test Court', venueId: 'test-venue' })
        .expect(401);
    });

    it('GET /api/courts/:id должен требовать аутентификации', async () => {
      await request(app)
        .get('/api/courts/test-id')
        .expect(401);
    });

    it('PUT /api/courts/:id должен требовать аутентификации', async () => {
      await request(app)
        .put('/api/courts/test-id')
        .send({ name: 'Updated Court' })
        .expect(401);
    });

    it('DELETE /api/courts/:id должен требовать аутентификации', async () => {
      await request(app)
        .delete('/api/courts/test-id')
        .expect(401);
    });

    it('GET /api/courts должен требовать аутентификации', async () => {
      await request(app)
        .get('/api/courts')
        .expect(401);
    });

    it('GET /api/courts/venue/:venueId должен требовать аутентификации', async () => {
      await request(app)
        .get('/api/courts/venue/test-venue')
        .expect(401);
    });

    it('GET /api/courts/:id/availability должен требовать аутентификации', async () => {
      await request(app)
        .get('/api/courts/test-id/availability')
        .expect(401);
    });

    it('GET /api/courts/:id/stats должен требовать аутентификации', async () => {
      await request(app)
        .get('/api/courts/test-id/stats')
        .expect(401);
    });
  });

  describe('Route Structure Validation', () => {
    it('должен правильно обрабатывать неверные HTTP методы', async () => {
      await request(app)
        .patch('/api/courts/test-id')
        .expect(404);
    });

    it('должен правильно обрабатывать несуществующие подмаршруты', async () => {
      await request(app)
        .get('/api/courts/test-id/nonexistent')
        .expect(404);
    });
  });

  describe('API Response Format', () => {
    it('все endpoints должны возвращать JSON', async () => {
      const response = await request(app)
        .get('/api/courts/test-id')
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
        .options('/api/courts')
        .expect(204);
    });

    it('должен возвращать правильные Content-Type headers', async () => {
      const response = await request(app)
        .get('/api/courts/test-id')
        .expect(401);

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });
  });
});
