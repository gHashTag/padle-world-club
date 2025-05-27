/**
 * Integration тесты для Bonus Transactions API endpoints
 */

import { describe, it, expect } from 'vitest';
import request from 'supertest';
import createApp from '../../app';

const app = createApp();

describe('Bonus Transactions API Integration Tests', () => {
  it('должен вернуть 401 для неавторизованных запросов', async () => {
    const response = await request(app)
      .get('/api/bonus-transactions/stats')
      .expect(401);

    expect(response.body.success).toBe(false);
  });

  it('должен иметь правильные маршруты', async () => {
    // Проверяем, что маршруты существуют (вернут 401, а не 404)
    await request(app)
      .post('/api/bonus-transactions')
      .expect(401);

    await request(app)
      .get('/api/bonus-transactions/stats')
      .expect(401);
  });

});
