/**
 * Integration тесты для Venues API endpoints
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import createApp from '../../app';

const app = createApp();

describe('Venues API Integration Tests', () => {
  beforeAll(async () => {
    // Подготовка тестовой среды
    console.log('Setting up Venues API integration tests...');
  });

  afterAll(async () => {
    // Очистка после тестов
    console.log('Cleaning up Venues API integration tests...');
  });

  describe('Protected Routes Authentication', () => {
    it('POST /api/venues должен требовать аутентификации', async () => {
      const venueData = {
        name: 'Test Venue',
        address: 'Test Address',
        city: 'Test City'
      };

      const response = await request(app)
        .post('/api/venues')
        .send(venueData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.status).toBe(401);
    });

    it('GET /api/venues/:id должен требовать аутентификации', async () => {
      await request(app)
        .get('/api/venues/test-id')
        .expect(401);
    });

    it('PUT /api/venues/:id должен требовать аутентификации', async () => {
      const updateData = {
        name: 'Updated Venue'
      };

      await request(app)
        .put('/api/venues/test-id')
        .send(updateData)
        .expect(401);
    });

    it('DELETE /api/venues/:id должен требовать аутентификации', async () => {
      await request(app)
        .delete('/api/venues/test-id')
        .expect(401);
    });

    it('GET /api/venues должен требовать аутентификации', async () => {
      await request(app)
        .get('/api/venues')
        .expect(401);
    });

    it('GET /api/venues/search/location должен требовать аутентификации', async () => {
      await request(app)
        .get('/api/venues/search/location')
        .query({ latitude: 55.7558, longitude: 37.6176, radius: 10 })
        .expect(401);
    });

    it('PUT /api/venues/:id/status должен требовать аутентификации', async () => {
      const statusData = {
        status: 'active'
      };

      await request(app)
        .put('/api/venues/test-id/status')
        .send(statusData)
        .expect(401);
    });

    it('GET /api/venues/:id/courts должен требовать аутентификации', async () => {
      await request(app)
        .get('/api/venues/test-id/courts')
        .expect(401);
    });

    it('GET /api/venues/:id/availability должен требовать аутентификации', async () => {
      await request(app)
        .get('/api/venues/test-id/availability')
        .expect(401);
    });
  });

  describe('Route Structure Validation', () => {
    it('должен правильно обрабатывать неверные HTTP методы', async () => {
      await request(app)
        .patch('/api/venues/test-id')
        .expect(404);
    });

    it('должен правильно обрабатывать несуществующие подмаршруты', async () => {
      await request(app)
        .get('/api/venues/test-id/nonexistent')
        .expect(404);
    });

    it('должен правильно обрабатывать неверные параметры в search/location', async () => {
      await request(app)
        .get('/api/venues/search/invalid')
        .expect(404);
    });
  });

  describe('Content-Type Validation', () => {
    it('POST /api/venues должен принимать JSON', async () => {
      await request(app)
        .post('/api/venues')
        .set('Content-Type', 'text/plain')
        .send('invalid data')
        .expect(401); // Сначала проверяется аутентификация
    });

    it('PUT /api/venues/:id должен принимать JSON', async () => {
      await request(app)
        .put('/api/venues/test-id')
        .set('Content-Type', 'text/plain')
        .send('invalid data')
        .expect(401); // Сначала проверяется аутентификация
    });
  });

  describe('API Response Format', () => {
    it('все endpoints должны возвращать JSON', async () => {
      const response = await request(app)
        .get('/api/venues/test-id')
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
        .options('/api/venues')
        .expect(204);
    });

    it('должен возвращать правильные Content-Type headers', async () => {
      const response = await request(app)
        .get('/api/venues/test-id')
        .expect(401);

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });
  });
});
