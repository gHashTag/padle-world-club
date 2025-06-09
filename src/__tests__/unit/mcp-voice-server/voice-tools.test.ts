/**
 * 🎤 Unit тесты для MCP Voice Server Tools
 * TDD для голосовых инструментов Claude интеграции
 */

import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";
import {
  voiceBookingTool,
  voiceAnalyticsTool,
  voiceTestTool,
  createMCPVoiceServer,
  type VoiceBookingToolArgs,
  type VoiceAnalyticsToolArgs,
  type VoiceTestToolArgs,
} from "../../../mcp-voice-server/voice-tools";

describe("MCP Voice Server Tools - TDD", () => {
  let originalEnv: typeof process.env;

  beforeAll(() => {
    originalEnv = { ...process.env };
    process.env.NODE_ENV = "test";
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe("🟢 GREEN: voice_booking_tool - голосовое бронирование через Claude", () => {
    it("должен обработать голосовую команду бронирования", async () => {
      const args: VoiceBookingToolArgs = {
        text: "Забронируй корт на завтра в 14:00 на два часа",
        userId: "user-123",
        sessionId: "session-456",
      };

      const result = await voiceBookingTool(args);

      expect(result.success).toBe(true);
      expect(result.bookingId).toEqual(expect.stringContaining("booking-"));
      expect(result.message).toContain("забронирован");
      expect(result.audioResponse).toEqual(expect.stringContaining("https://"));
      expect(result.nextSteps).toEqual(
        expect.arrayContaining([expect.any(String)])
      );
    });

    it("должен валидировать входные параметры", async () => {
      const invalidArgs = {
        text: "", // пустой текст
        userId: "",
        sessionId: "session-456",
      };

      const result = await voiceBookingTool(
        invalidArgs as VoiceBookingToolArgs
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain("Ошибка");
    });

    it("должен возвращать детали успешного бронирования", async () => {
      const args: VoiceBookingToolArgs = {
        text: "Забронируй корт на завтра в 14:00",
        userId: "user-123",
        sessionId: "session-456",
      };

      const result = await voiceBookingTool(args);

      expect(result.success).toBe(true);
      expect(result.bookingId).toBeDefined();
      expect(result.audioResponse).toBeDefined();
    });

    it("должен обрабатывать многоязычные команды", async () => {
      const commands = [
        "Book a court for tomorrow at 2 PM",
        "Забронируй корт на завтра в 14:00",
      ];

      for (const text of commands) {
        const args: VoiceBookingToolArgs = {
          text,
          userId: "user-123",
          sessionId: "session-456",
        };

        const result = await voiceBookingTool(args);
        expect(result.success).toBe(true);
      }
    });

    it("должен сохранять контекст сессии", async () => {
      const sessionId = "session-789";
      const args: VoiceBookingToolArgs = {
        text: "Забронируй корт на завтра в 14:00",
        userId: "user-123",
        sessionId,
      };

      const result = await voiceBookingTool(args);

      expect(result.success).toBe(true);
      // В реальной реализации здесь будет проверка сохранения контекста
    });
  });

  describe("🟢 GREEN: voice_analytics_tool - аналитика голосовых взаимодействий", () => {
    it("должен возвращать статистику использования", async () => {
      const args: VoiceAnalyticsToolArgs = {
        metricType: "usage",
      };

      const result = await voiceAnalyticsTool(args);

      expect(result.success).toBe(true);
      expect(result.data.totalInteractions).toBeGreaterThan(0);
      expect(result.data.topCommands).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            command: expect.any(String),
            count: expect.any(Number),
          }),
        ])
      );
    });

    it("должен возвращать метрики точности распознавания", async () => {
      const args: VoiceAnalyticsToolArgs = {
        metricType: "accuracy",
      };

      const result = await voiceAnalyticsTool(args);

      expect(result.success).toBe(true);
      expect(result.data.averageAccuracy).toBeGreaterThan(0);
      expect(result.data.averageAccuracy).toBeLessThanOrEqual(1);
    });

    it("должен возвращать рейтинги удовлетворенности пользователей", async () => {
      const args: VoiceAnalyticsToolArgs = {
        metricType: "satisfaction",
      };

      const result = await voiceAnalyticsTool(args);

      expect(result.success).toBe(true);
      expect(result.data.satisfactionScore).toBeGreaterThan(0);
      expect(result.data.satisfactionScore).toBeLessThanOrEqual(5);
    });

    it("должен поддерживать фильтрацию по пользователям", async () => {
      const args: VoiceAnalyticsToolArgs = {
        metricType: "usage",
        userId: "user-123",
      };

      const result = await voiceAnalyticsTool(args);

      expect(result.success).toBe(true);
      expect(result.data.userStats).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            userId: "user-123",
            interactions: expect.any(Number),
          }),
        ])
      );
    });
  });

  describe("🟢 GREEN: voice_test_tool - тестирование голосовых функций", () => {
    it("должен тестировать преобразование речи в текст", async () => {
      const args: VoiceTestToolArgs = {
        testType: "speech_to_text",
        inputData: new ArrayBuffer(1024),
        options: { language: "ru-RU" },
      };

      const result = await voiceTestTool(args);

      expect(result.success).toBe(true);
      expect(result.testType).toBe("speech_to_text");
      expect(result.performance.responseTime).toBeGreaterThan(0);
      expect(result.performance.accuracy).toBeGreaterThan(0.8);
    });

    it("должен тестировать преобразование текста в речь", async () => {
      const args: VoiceTestToolArgs = {
        testType: "text_to_speech",
        inputData: "Тестовое сообщение для преобразования в речь",
        options: { voice: "maria" },
      };

      const result = await voiceTestTool(args);

      expect(result.success).toBe(true);
      expect(result.testType).toBe("text_to_speech");
      expect(result.performance.accuracy).toBe(1.0);
    });

    it("должен тестировать парсинг команд", async () => {
      const args: VoiceTestToolArgs = {
        testType: "command_parsing",
        inputData: "Забронируй корт на завтра в 14:00",
      };

      const result = await voiceTestTool(args);

      expect(result.success).toBe(true);
      expect(result.testType).toBe("command_parsing");
      expect(result.result).not.toBeNull();
    });

    it("должен тестировать полный цикл взаимодействия", async () => {
      const args: VoiceTestToolArgs = {
        testType: "full_cycle",
        inputData: "Забронируй корт на завтра в 14:00",
      };

      const result = await voiceTestTool(args);

      expect(result.success).toBe(true);
      expect(result.testType).toBe("full_cycle");
      expect(result.result.command).toBeDefined();
      expect(result.result.booking).toBeDefined();
      expect(result.result.audioResponse).toBeDefined();
    });

    it("должен обрабатывать ошибки тестирования", async () => {
      const args: VoiceTestToolArgs = {
        testType: "speech_to_text",
        inputData: "invalid data type", // неправильный тип данных
      };

      const result = await voiceTestTool(args);

      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.length).toBeGreaterThan(0);
    });
  });

  describe("🟢 GREEN: Integration Tests - MCP Voice Server", () => {
    it("должен регистрировать все voice tools", async () => {
      const server = createMCPVoiceServer();

      expect(server.tools).toHaveLength(3);
      expect(server.tools.map((t) => t.name)).toEqual([
        "voice_booking_tool",
        "voice_analytics_tool",
        "voice_test_tool",
      ]);
    });

    it("должен обрабатывать одновременные запросы", async () => {
      const server = createMCPVoiceServer();

      const promises = [
        server.handleToolCall("voice_booking_tool", {
          text: "Забронируй корт на завтра в 14:00",
          userId: "user-1",
          sessionId: "session-1",
        }),
        server.handleToolCall("voice_analytics_tool", {
          metricType: "usage",
        }),
        server.handleToolCall("voice_test_tool", {
          testType: "command_parsing",
          inputData: "Покажи свободные корты",
        }),
      ];

      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      results.forEach((result) => {
        expect(result.success).toBe(true);
      });
    });

    it("должен передавать ошибки Claude в понятном формате", async () => {
      const server = createMCPVoiceServer();

      await expect(server.handleToolCall("unknown_tool", {})).rejects.toThrow(
        "Неизвестный инструмент"
      );
    });

    it("должен логировать все операции для debugging", async () => {
      const server = createMCPVoiceServer();
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

      await server.handleToolCall("voice_booking_tool", {
        text: "Забронируй корт на завтра в 14:00",
        userId: "user-123",
        sessionId: "session-456",
      });

      expect(consoleSpy).toHaveBeenCalledWith(
        "📝 Voice Interaction Logged:",
        expect.objectContaining({
          userId: "user-123",
          command: "book_court",
          success: true,
        })
      );

      consoleSpy.mockRestore();
    });
  });
});
