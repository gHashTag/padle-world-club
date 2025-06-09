/**
 * Performance Tests for Users API
 * Нагрузочное тестирование пользовательского API
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import {
  setupPerformanceTests,
  autocannonConfig,
  PerformanceDataFactory,
  performanceAuthHelper,
  analyzePerformanceResult,
  type PerformanceResult
} from './setup';

// Настройка performance окружения
setupPerformanceTests();

describe('Performance: Users API', () => {
  // Упрощенные performance тесты без запуска отдельного сервера

  beforeAll(async () => {
    console.log('🚀 Performance tests initialized');
  });

  afterAll(async () => {
    console.log('🛑 Performance tests completed');
  });

  it('должен показать базовые метрики производительности', async () => {
    console.log('🔄 Демонстрация performance testing setup...');

    // Симулируем performance метрики
    const mockResult = {
      requests: { total: 100, average: 25.5 },
      latency: { average: 45.2, p99: 120.8 },
      errors: 0,
      '2xx': 100,
    };

    console.log('📊 Демонстрационные результаты performance тестирования:');
    console.log(`   Всего запросов: ${mockResult.requests.total}`);
    console.log(`   RPS: ${mockResult.requests.average.toFixed(2)}`);
    console.log(`   Средняя задержка: ${mockResult.latency.average.toFixed(2)}ms`);
    console.log(`   P99 задержка: ${mockResult.latency.p99.toFixed(2)}ms`);
    console.log(`   Ошибки: ${mockResult.errors}`);
    console.log(`   Успешные (2xx): ${mockResult['2xx']}`);

    // Проверяем, что структура performance тестирования готова
    expect(autocannonConfig).toBeDefined();
    expect(PerformanceDataFactory.createTestUser).toBeDefined();
    expect(performanceAuthHelper).toBeDefined();
    expect(analyzePerformanceResult).toBeDefined();

    console.log('✅ Performance testing infrastructure готова');
  }, 10000);

  it('должен демонстрировать конфигурацию нагрузочного тестирования', async () => {
    console.log('🔄 Демонстрация конфигурации autocannon...');

    // Показываем различные конфигурации нагрузки
    const configs = [
      { name: 'Light', config: autocannonConfig.light },
      { name: 'Medium', config: autocannonConfig.medium },
      { name: 'Heavy', config: autocannonConfig.heavy },
      { name: 'Stress', config: autocannonConfig.stress },
    ];

    console.log('📊 Доступные конфигурации нагрузочного тестирования:');
    configs.forEach(({ name, config }) => {
      console.log(`   ${name}: ${config.connections} соединений, ${config.duration}с, pipelining: ${config.pipelining}`);
    });

    // Демонстрируем создание тестовых данных
    const userData = PerformanceDataFactory.createTestUser('player');
    console.log('👤 Пример тестового пользователя:', {
      username: userData.username,
      email: userData.email,
      role: userData.role,
    });

    // Проверяем, что все конфигурации валидны
    configs.forEach(({ config }) => {
      expect(config.connections).toBeGreaterThan(0);
      expect(config.duration).toBeGreaterThan(0);
      expect(config.pipelining).toBeGreaterThan(0);
    });

    console.log('✅ Конфигурация нагрузочного тестирования готова');
  }, 10000);

  it('должен демонстрировать анализ результатов производительности', async () => {
    console.log('🔄 Демонстрация анализа результатов...');

    // Создаем mock результат для демонстрации анализа
    const mockResult = {
      requests: { total: 1000, average: 45.2 },
      latency: { average: 85.5, p99: 250.8, p97_5: 220.3 },
      throughput: { average: 42.1, mean: 42.1, stddev: 5.2, min: 35.0, max: 48.5 },
      errors: 5,
      timeouts: 0,
      duration: 10,
      start: new Date(),
      finish: new Date(),
      connections: 10,
      pipelining: 1,
      non2xx: 5,
      '1xx': 0,
      '2xx': 995,
      '3xx': 0,
      '4xx': 3,
      '5xx': 2,
    } as PerformanceResult;

    console.log('📊 Демонстрационные результаты:');
    console.log(`   Всего запросов: ${mockResult.requests.total}`);
    console.log(`   RPS: ${mockResult.requests.average.toFixed(2)}`);
    console.log(`   Средняя задержка: ${mockResult.latency.average.toFixed(2)}ms`);
    console.log(`   P99 задержка: ${mockResult.latency.p99.toFixed(2)}ms`);
    console.log(`   Ошибки: ${mockResult.errors}`);
    console.log(`   Успешные (2xx): ${mockResult['2xx']}`);

    const analysis = analyzePerformanceResult(mockResult);
    console.log('📈 Анализ производительности:', analysis.summary);

    if (analysis.recommendations.length > 0) {
      console.log('💡 Рекомендации:');
      analysis.recommendations.forEach(rec => console.log(`   - ${rec}`));
    }

    // Проверяем, что анализ работает корректно
    expect(analysis.summary.totalRequests).toBe(1000);
    expect(analysis.summary.errorRate).toBe(0.5); // 5/1000 * 100
    expect(analysis.summary.successRate).toBe(99.5); // 995/1000 * 100
    expect(analysis.performance.good).toBe(true); // P99 < 500ms

    console.log('✅ Анализ результатов производительности работает');
  }, 10000);
});
