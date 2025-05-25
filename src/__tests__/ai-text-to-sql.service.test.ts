/**
 * Tests for AI Text-to-SQL Service
 * Использует AI SDK test helpers для мокирования AI ответов
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
// import { MockLanguageModelV1 } from 'ai/test';
import { AITextToSQLService } from '../telegram-bot/services/ai-text-to-sql.service';

// Мокаем drizzle database
const mockDb = {
  execute: vi.fn()
} as any;

describe('AITextToSQLService', () => {
  let service: AITextToSQLService;

  beforeEach(() => {
    service = new AITextToSQLService(mockDb);
    vi.clearAllMocks();
  });

  describe('convertToSQL', () => {
    it('should convert Russian query to SQL successfully', async () => {
      // Мокаем AI ответ
      const mockAIResponse = {
        sql: "SELECT first_name, last_name, current_rating FROM users ORDER BY current_rating DESC LIMIT 10",
        explanation: "Запрос возвращает топ 10 пользователей по рейтингу",
        confidence: 0.95,
        tables: ["users"],
        safety: {
          isReadOnly: true,
          hasLimit: true,
          riskLevel: "low" as const
        }
      };

      // Мокаем generateObject из AI SDK
      vi.doMock('ai', () => ({
        generateObject: vi.fn().mockResolvedValue({
          object: mockAIResponse
        })
      }));

      const result = await service.convertToSQL("Покажи топ 10 игроков по рейтингу");

      expect(result.success).toBe(true);
      expect(result.sql).toContain("SELECT");
      expect(result.sql).toContain("users");
      expect(result.sql).toContain("ORDER BY");
      expect(result.sql).toContain("LIMIT 10");
      expect(result.confidence).toBeGreaterThan(0.9);
      expect(result.safety?.isReadOnly).toBe(true);
    });

    it('should reject unsafe SQL queries', async () => {
      const mockUnsafeResponse = {
        sql: "DROP TABLE users",
        explanation: "Удаление таблицы пользователей",
        confidence: 0.8,
        tables: ["users"],
        safety: {
          isReadOnly: false,
          hasLimit: false,
          riskLevel: "high" as const
        }
      };

      vi.doMock('ai', () => ({
        generateObject: vi.fn().mockResolvedValue({
          object: mockUnsafeResponse
        })
      }));

      const result = await service.convertToSQL("Удали всех пользователей");

      expect(result.success).toBe(false);
      expect(result.error).toContain("Небезопасный запрос");
    });

    it('should handle AI errors gracefully', async () => {
      vi.doMock('ai', () => ({
        generateObject: vi.fn().mockRejectedValue(new Error("AI service unavailable"))
      }));

      const result = await service.convertToSQL("Покажи пользователей");

      expect(result.success).toBe(false);
      expect(result.error).toContain("Ошибка AI обработки");
    });
  });

  describe('executeQuery', () => {
    it('should execute safe SQL query successfully', async () => {
      const mockData = [
        { id: '1', first_name: 'Иван', last_name: 'Петров', current_rating: 1800 },
        { id: '2', first_name: 'Мария', last_name: 'Сидорова', current_rating: 1750 }
      ];

      mockDb.execute.mockResolvedValue(mockData);

      const result = await service.executeQuery("SELECT * FROM users LIMIT 2");

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
      expect(result.rowCount).toBe(2);
      expect(result.executionTime).toBeGreaterThan(0);
    });

    it('should add LIMIT if missing', async () => {
      mockDb.execute.mockResolvedValue([]);

      await service.executeQuery("SELECT * FROM users");

      expect(mockDb.execute).toHaveBeenCalledWith(
        expect.objectContaining({
          sql: expect.stringContaining("LIMIT 100")
        })
      );
    });

    it('should reject unsafe queries', async () => {
      const result = await service.executeQuery("DROP TABLE users");

      expect(result.success).toBe(false);
      expect(result.error).toContain("Запрос заблокирован");
      expect(mockDb.execute).not.toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      mockDb.execute.mockRejectedValue(new Error("Database connection failed"));

      const result = await service.executeQuery("SELECT * FROM users LIMIT 10");

      expect(result.success).toBe(false);
      expect(result.error).toContain("Ошибка выполнения SQL");
    });
  });

  describe('formatResultWithAI', () => {
    it('should format results using AI when available', async () => {
      const mockData = [
        { first_name: 'Иван', last_name: 'Петров', current_rating: 1800 },
        { first_name: 'Мария', last_name: 'Сидорова', current_rating: 1750 }
      ];

      const mockFormattedResponse = `
🏆 **Топ игроки по рейтингу**

1. **Иван Петров** - 1800 очков
2. **Мария Сидорова** - 1750 очков

Найдено 2 игрока с высоким рейтингом.
      `;

      vi.doMock('ai', () => ({
        generateText: vi.fn().mockResolvedValue({
          text: mockFormattedResponse
        })
      }));

      const result = await service.formatResultWithAI(
        "Покажи топ игроков",
        "SELECT * FROM users ORDER BY current_rating DESC LIMIT 2",
        mockData
      );

      expect(result).toContain("Топ игроки");
      expect(result).toContain("Иван Петров");
      expect(result).toContain("1800 очков");
      expect(result).toContain("SQL:");
    });

    it('should fallback to simple formatting on AI error', async () => {
      const mockData = [
        { first_name: 'Иван', current_rating: 1800 }
      ];

      vi.doMock('ai', () => ({
        generateText: vi.fn().mockRejectedValue(new Error("AI formatting failed"))
      }));

      const result = await service.formatResultWithAI(
        "Покажи игроков",
        "SELECT * FROM users LIMIT 1",
        mockData
      );

      expect(result).toContain("Запрос:");
      expect(result).toContain("Найдено записей:");
      expect(result).toContain("SQL:");
    });

    it('should handle empty results', async () => {
      const result = await service.formatResultWithAI(
        "Найди несуществующих пользователей",
        "SELECT * FROM users WHERE id = 'nonexistent'",
        []
      );

      expect(result).toContain("Данные не найдены");
    });
  });

  describe('SQL Safety Validation', () => {
    it('should allow safe SELECT queries', () => {
      const safeQueries = [
        "SELECT * FROM users LIMIT 10",
        "SELECT COUNT(*) FROM bookings",
        "SELECT u.first_name, b.total_price FROM users u JOIN bookings b ON u.id = b.user_id"
      ];

      safeQueries.forEach(query => {
        const validation = (service as any).validateSQLSafety(query);
        expect(validation.isValid).toBe(true);
      });
    });

    it('should reject dangerous queries', () => {
      const dangerousQueries = [
        "DROP TABLE users",
        "DELETE FROM users",
        "UPDATE users SET password = 'hacked'",
        "INSERT INTO users VALUES (...)",
        "ALTER TABLE users ADD COLUMN malicious TEXT",
        "TRUNCATE TABLE bookings",
        "GRANT ALL ON users TO public"
      ];

      dangerousQueries.forEach(query => {
        const validation = (service as any).validateSQLSafety(query);
        expect(validation.isValid).toBe(false);
        expect(validation.reason).toBeDefined();
      });
    });

    it('should detect SQL injection attempts', () => {
      const injectionAttempts = [
        "SELECT * FROM users; DROP TABLE users; --",
        "SELECT * FROM users WHERE id = '1' OR '1'='1'",
        "SELECT * FROM users /* malicious comment */ WHERE id = 1"
      ];

      injectionAttempts.forEach(query => {
        const validation = (service as any).validateSQLSafety(query);
        expect(validation.isValid).toBe(false);
      });
    });
  });

  describe('Performance Monitoring', () => {
    it('should measure query execution time', async () => {
      mockDb.execute.mockImplementation(() =>
        new Promise(resolve => setTimeout(() => resolve([]), 100))
      );

      const result = await service.executeQuery("SELECT * FROM users LIMIT 1");

      expect(result.executionTime).toBeGreaterThan(90);
      expect(result.executionTime).toBeLessThan(200);
    });
  });

  describe('Error Handling', () => {
    it('should handle network timeouts gracefully', async () => {
      mockDb.execute.mockImplementation(() =>
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("Connection timeout")), 100)
        )
      );

      const result = await service.executeQuery("SELECT * FROM users LIMIT 1");

      expect(result.success).toBe(false);
      expect(result.error).toContain("Connection timeout");
      expect(result.executionTime).toBeGreaterThan(90);
    });

    it('should handle malformed SQL gracefully', async () => {
      mockDb.execute.mockRejectedValue(new Error("Syntax error near 'SELCT'"));

      const result = await service.executeQuery("SELCT * FROM users");

      expect(result.success).toBe(false);
      expect(result.error).toContain("Syntax error");
    });
  });
});
