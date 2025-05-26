/**
 * Integration тесты для Users API endpoints
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import createApp from '../../app';

const app = createApp();

describe('Users API Integration Tests', () => {
  beforeAll(async () => {
    // Подготовка тестовой среды
    console.log('Setting up Users API integration tests...');
  });

  afterAll(async () => {
    // Очистка после тестов
    console.log('Cleaning up Users API integration tests...');
  });

  describe('POST /api/users/auth/register', () => {
    it('должен зарегистрировать нового пользователя', async () => {
      const userData = {
        username: 'testuser',
        email: 'test@example.com',
        firstName: 'Test',
        lastName: 'User',
        password: 'TestPassword123',
        memberId: 'TEST001',
        userRole: 'player'
      };

      const response = await request(app)
        .post('/api/users/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.username).toBe(userData.username);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user).not.toHaveProperty('password');
      expect(response.body.data.user).not.toHaveProperty('passwordHash');
    });

    it('должен вернуть ошибку при дублировании username', async () => {
      const userData = {
        username: 'duplicateuser',
        email: 'duplicate1@example.com',
        firstName: 'Duplicate',
        lastName: 'User',
        password: 'TestPassword123',
        memberId: 'DUP001',
        userRole: 'player'
      };

      // Создаем первого пользователя
      await request(app)
        .post('/api/users/auth/register')
        .send(userData)
        .expect(201);

      // Пытаемся создать второго с тем же username
      const duplicateData = {
        ...userData,
        email: 'duplicate2@example.com',
        memberId: 'DUP002'
      };

      const response = await request(app)
        .post('/api/users/auth/register')
        .send(duplicateData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('username');
    });

    it('должен вернуть ошибку при дублировании email', async () => {
      const userData = {
        username: 'uniqueuser1',
        email: 'duplicate@example.com',
        firstName: 'Unique',
        lastName: 'User',
        password: 'TestPassword123',
        memberId: 'UNI001',
        userRole: 'player'
      };

      // Создаем первого пользователя
      await request(app)
        .post('/api/users/auth/register')
        .send(userData)
        .expect(201);

      // Пытаемся создать второго с тем же email
      const duplicateData = {
        ...userData,
        username: 'uniqueuser2',
        memberId: 'UNI002'
      };

      const response = await request(app)
        .post('/api/users/auth/register')
        .send(duplicateData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('email');
    });

    it('должен вернуть ошибку валидации при неверных данных', async () => {
      const invalidData = {
        username: 'a', // слишком короткий
        email: 'invalid-email', // неверный формат
        password: '123' // слишком короткий
      };

      const response = await request(app)
        .post('/api/users/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('валидации');
    });
  });

  describe('POST /api/users/auth/login', () => {
    it('должен войти в систему с правильными данными', async () => {
      // Сначала регистрируем пользователя
      const userData = {
        username: 'loginuser',
        email: 'loginuser@example.com',
        firstName: 'Login',
        lastName: 'User',
        password: 'TestPassword123',
        memberId: 'LOG001',
        userRole: 'player'
      };

      await request(app)
        .post('/api/users/auth/register')
        .send(userData)
        .expect(201);

      // Теперь входим в систему
      const loginData = {
        username: userData.username,
        password: userData.password
      };

      const response = await request(app)
        .post('/api/users/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('user');
      expect(response.body.data).toHaveProperty('token');
      expect(response.body.data.user.username).toBe(userData.username);
      expect(response.body.data.user).not.toHaveProperty('password');
    });

    it('должен вернуть ошибку при неверных данных входа', async () => {
      const loginData = {
        username: 'nonexistent',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/users/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.message).toContain('Invalid');
    });
  });

  describe('API Health Check', () => {
    it('должен вернуть информацию о здоровье API', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('status');
      expect(response.body.data.status).toBe('OK');
      expect(response.body.data).toHaveProperty('uptime');
      expect(response.body.data).toHaveProperty('memory');
    });

    it('должен вернуть информацию об API', async () => {
      const response = await request(app)
        .get('/api')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('name');
      expect(response.body.data).toHaveProperty('version');
      expect(response.body.data).toHaveProperty('endpoints');
      expect(response.body.data.name).toBe('Padle World Club API');
    });
  });

  describe('Protected Routes', () => {
    it('должен вернуть 401 для защищенных маршрутов без токена', async () => {
      const response = await request(app)
        .get('/api/users/users')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('должен вернуть 404 для несуществующих маршрутов', async () => {
      const response = await request(app)
        .get('/api/nonexistent')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('не найден');
    });
  });
});
