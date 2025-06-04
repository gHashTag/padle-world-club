/**
 * E2E тестов setup и утилиты
 * Настройка окружения для end-to-end тестирования
 */

import { beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import createApp from '../../app';
import { db } from '../../../db';
// import { users, venues, courts, bookings, payments } from '../../../db/schema';

// Express приложение для тестов
export const app = createApp();

// Тестовые данные
export const testUsers = {
  admin: {
    username: 'e2e_admin',
    email: 'e2e_admin@test.com',
    password: 'AdminPass123!',
    firstName: 'Admin',
    lastName: 'User',
    memberId: 'E2E_ADMIN_001',
    userRole: 'admin'
  },
  coach: {
    username: 'e2e_coach',
    email: 'e2e_coach@test.com',
    password: 'CoachPass123!',
    firstName: 'Coach',
    lastName: 'User',
    memberId: 'E2E_COACH_001',
    userRole: 'coach'
  },
  player: {
    username: 'e2e_player',
    email: 'e2e_player@test.com',
    password: 'PlayerPass123!',
    firstName: 'Player',
    lastName: 'User',
    memberId: 'E2E_PLAYER_001',
    userRole: 'player'
  }
};

export const testVenue = {
  name: 'E2E Test Venue',
  address: '123 Test Street',
  city: 'Test City',
  country: 'Test Country',
  latitude: 55.7558,
  longitude: 37.6176,
  description: 'Test venue for E2E testing',
  amenities: ['parking', 'wifi', 'changing_rooms'],
  contactPhone: '+1234567890',
  contactEmail: 'venue@test.com'
};

export const testCourt = {
  name: 'E2E Test Court',
  courtType: 'paddle',
  hourlyRate: 50.00,
  isActive: true
};

// Утилиты для аутентификации
export class AuthHelper {
  private tokens: Map<string, string> = new Map();

  async registerUser(userData: any): Promise<{ user: any; token: string }> {
    const response = await request(app)
      .post('/api/users/auth/register')
      .send(userData)
      .expect(201);

    return {
      user: response.body.data.user,
      token: response.body.data.token
    };
  }

  async loginUser(username: string, password: string): Promise<{ user: any; token: string }> {
    const response = await request(app)
      .post('/api/users/auth/login')
      .send({ username, password })
      .expect(200);

    const token = response.body.data.token;
    this.tokens.set(username, token);

    return {
      user: response.body.data.user,
      token
    };
  }

  getToken(username: string): string | undefined {
    return this.tokens.get(username);
  }

  getAuthHeader(username: string): { Authorization: string } | {} {
    const token = this.getToken(username);
    return token ? { Authorization: `Bearer ${token}` } : {};
  }
}

// Утилиты для очистки данных
export class DataCleanup {
  static async cleanupTestData(): Promise<void> {
    if (!db) {
      console.warn('Database not available for cleanup');
      return;
    }

    try {
      // Удаляем тестовые данные в правильном порядке (учитывая foreign keys)
      // Используем простые условия для очистки
      console.log('Cleaning up E2E test data...');

      // Пропускаем очистку БД в E2E тестах, так как это может вызывать проблемы
      // В реальных E2E тестах лучше использовать отдельную тестовую БД

      console.log('E2E test data cleanup skipped (using shared DB)');
    } catch (error) {
      console.warn('Error during E2E cleanup:', error);
    }
  }
}

// Утилиты для создания тестовых данных
export class TestDataFactory {
  static generateUniqueId(): string {
    return `e2e_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  static createTestUser(role: 'admin' | 'coach' | 'player' = 'player', overrides: any = {}) {
    const baseUser = testUsers[role];
    const uniqueId = this.generateUniqueId();

    return {
      ...baseUser,
      username: `${baseUser.username}_${uniqueId}`,
      email: `${uniqueId}_${baseUser.email}`,
      memberId: `${baseUser.memberId}_${uniqueId}`,
      ...overrides
    };
  }

  static createTestVenue(overrides: any = {}) {
    const uniqueId = this.generateUniqueId();

    return {
      ...testVenue,
      name: `${testVenue.name} ${uniqueId}`,
      ...overrides
    };
  }

  static createTestCourt(venueId: string, overrides: any = {}) {
    const uniqueId = this.generateUniqueId();

    return {
      ...testCourt,
      name: `${testCourt.name} ${uniqueId}`,
      venueId,
      ...overrides
    };
  }
}

// Глобальная настройка для E2E тестов
export function setupE2ETests() {
  beforeAll(async () => {
    console.log('Setting up E2E tests environment...');
    // Дополнительная настройка если нужна
  });

  afterAll(async () => {
    console.log('Cleaning up E2E tests environment...');
    await DataCleanup.cleanupTestData();
  });

  beforeEach(async () => {
    // Очистка перед каждым тестом для изоляции
    await DataCleanup.cleanupTestData();
  });
}

// Экспорт для использования в тестах
export const authHelper = new AuthHelper();
export const testDataFactory = TestDataFactory;
export const dataCleanup = DataCleanup;
