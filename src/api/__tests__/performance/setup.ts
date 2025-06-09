/**
 * Performance Testing Setup
 * Настройка для нагрузочного тестирования API
 */

import { beforeAll, afterAll } from 'vitest';
import createApp from '../../app';
import { db } from '../../../db';

// Express приложение для performance тестов
export const app = createApp();

// Настройка performance тестирования
export const setupPerformanceTests = () => {
  beforeAll(async () => {
    console.log('Setting up Performance tests environment...');

    // Проверяем подключение к БД
    if (!db) {
      throw new Error('Database connection not available for performance tests');
    }

    console.log('Performance tests environment ready');
  });

  afterAll(async () => {
    console.log('Cleaning up Performance tests environment...');
    // Очистка не требуется для performance тестов
    console.log('Performance tests cleanup completed');
  });
};

// Конфигурация для autocannon
export const autocannonConfig = {
  // Базовые настройки
  connections: 10,        // Количество одновременных соединений
  pipelining: 1,         // Количество запросов в pipeline
  duration: 10,          // Длительность теста в секундах

  // Настройки для разных типов тестов
  light: {
    connections: 5,
    duration: 5,
    pipelining: 1,
  },

  medium: {
    connections: 10,
    duration: 10,
    pipelining: 1,
  },

  heavy: {
    connections: 20,
    duration: 15,
    pipelining: 2,
  },

  stress: {
    connections: 50,
    duration: 30,
    pipelining: 5,
  }
};

// Утилиты для создания тестовых данных
export class PerformanceDataFactory {
  static createTestUser(role: 'player' | 'coach' | 'admin' = 'player') {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);

    return {
      username: `perf_${role}_${timestamp}_${random}`,
      email: `perf_${role}_${timestamp}_${random}@test.com`,
      password: 'TestPassword123!',
      firstName: `Performance`,
      lastName: `User ${random}`,
      role,
      isActive: true,
    };
  }

  static createTestVenue() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);

    return {
      name: `Performance Test Venue ${timestamp}_${random}`,
      address: '123 Performance Street',
      city: 'Test City',
      country: 'Test Country',
      latitude: 40.7128,
      longitude: -74.0060,
      isActive: true,
    };
  }

  static createTestCourt(venueId: string) {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(7);

    return {
      name: `Performance Test Court ${timestamp}_${random}`,
      venueId,
      courtType: 'paddle' as const,
      hourlyRate: 50.00,
      isActive: true,
    };
  }

  static createTestBooking(courtId: string, userId: string) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(14, 0, 0, 0); // 14:00

    const endTime = new Date(tomorrow);
    endTime.setHours(15, 30, 0, 0); // 15:30 (1.5 часа)

    return {
      courtId,
      bookedByUserId: userId,
      startTime: tomorrow.toISOString(),
      endTime: endTime.toISOString(),
      durationMinutes: 90,
      totalAmount: 75.00,
      bookingPurpose: 'free_play' as const,
      notes: 'Performance test booking',
    };
  }
}

// Утилиты для аутентификации в performance тестах
export class PerformanceAuthHelper {
  private tokens: Map<string, string> = new Map();

  async registerUser(userData: any): Promise<{ user: any; token: string }> {
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });

    if (!response.ok) {
      throw new Error(`Registration failed: ${response.status}`);
    }

    const result = await response.json();
    const token = result.data.token;

    this.tokens.set(userData.username, token);

    return {
      user: result.data.user,
      token,
    };
  }

  async loginUser(username: string, password: string): Promise<string> {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error(`Login failed: ${response.status}`);
    }

    const result = await response.json();
    const token = result.data.token;

    this.tokens.set(username, token);

    return token;
  }

  getToken(username: string): string | undefined {
    return this.tokens.get(username);
  }

  clearTokens(): void {
    this.tokens.clear();
  }
}

// Экспорт утилит
export const performanceAuthHelper = new PerformanceAuthHelper();

// Базовый URL для тестов
export const BASE_URL = 'http://localhost:3000';

// Утилиты для анализа результатов
export interface PerformanceResult {
  requests: {
    total: number;
    average: number;
    mean: number;
    stddev: number;
    min: number;
    max: number;
    p0_001: number;
    p0_01: number;
    p0_1: number;
    p1: number;
    p2_5: number;
    p10: number;
    p25: number;
    p50: number;
    p75: number;
    p90: number;
    p97_5: number;
    p99: number;
    p99_9: number;
    p99_99: number;
    p99_999: number;
  };
  latency: {
    average: number;
    mean: number;
    stddev: number;
    min: number;
    max: number;
    p0_001: number;
    p0_01: number;
    p0_1: number;
    p1: number;
    p2_5: number;
    p10: number;
    p25: number;
    p50: number;
    p75: number;
    p90: number;
    p97_5: number;
    p99: number;
    p99_9: number;
    p99_99: number;
    p99_999: number;
  };
  throughput: {
    average: number;
    mean: number;
    stddev: number;
    min: number;
    max: number;
  };
  errors: number;
  timeouts: number;
  duration: number;
  start: Date;
  finish: Date;
  connections: number;
  pipelining: number;
  non2xx: number;
  '1xx': number;
  '2xx': number;
  '3xx': number;
  '4xx': number;
  '5xx': number;
}

export const analyzePerformanceResult = (result: PerformanceResult) => {
  const analysis = {
    summary: {
      totalRequests: result.requests.total,
      requestsPerSecond: result.requests.average,
      averageLatency: result.latency.average,
      p95Latency: result.latency.p97_5,
      p99Latency: result.latency.p99,
      errorRate: (result.errors / result.requests.total) * 100,
      successRate: (result['2xx'] / result.requests.total) * 100,
    },
    performance: {
      excellent: result.latency.p99 < 100, // < 100ms p99
      good: result.latency.p99 < 500,      // < 500ms p99
      acceptable: result.latency.p99 < 1000, // < 1s p99
      poor: result.latency.p99 >= 1000,    // >= 1s p99
    },
    recommendations: [] as string[],
  };

  // Генерируем рекомендации
  if (analysis.summary.errorRate > 1) {
    analysis.recommendations.push('Высокий уровень ошибок (>1%) - проверьте стабильность API');
  }

  if (analysis.summary.p99Latency > 1000) {
    analysis.recommendations.push('Высокая задержка p99 (>1s) - оптимизируйте производительность');
  }

  if (analysis.summary.requestsPerSecond < 100) {
    analysis.recommendations.push('Низкая пропускная способность (<100 RPS) - проверьте узкие места');
  }

  return analysis;
};
