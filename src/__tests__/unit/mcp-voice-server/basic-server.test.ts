/**
 * 🎤 Базовые тесты для MCP Voice Server
 * TDD для минимального MCP сервера - "Just To Be Done"
 */

import { describe, it, expect } from "vitest";

describe("MCP Voice Server - Basic Tests", () => {
  describe("🟢 GREEN: Базовая функциональность сервера", () => {
    it("должен импортировать функции сервера", async () => {
      // Динамический импорт для избежания проблем с путями
      const serverModule = await import("../../../mcp-voice-server/src/index");

      expect(serverModule.createVoiceServer).toBeDefined();
      expect(serverModule.handlePing).toBeDefined();
      expect(serverModule.handleParseCommand).toBeDefined();
      expect(serverModule.handleVoiceBooking).toBeDefined();
      expect(serverModule.handleSelfTest).toBeDefined();
    });

    it("должен обработать ping команду", async () => {
      const { handlePing } = await import("../../../mcp-voice-server/src/index");
      
      const result = await handlePing({ message: "Test ping" });
      
      expect(result.success).toBe(true);
      expect(result.message).toContain("Voice Server is alive!");
      expect(result.message).toContain("Test ping");
      expect(result.timestamp).toBeDefined();
      expect(result.server).toBe("MCP Voice Server v1.0.0");
    });

    it("должен обработать ping с дефолтным сообщением", async () => {
      const { handlePing } = await import("../../../mcp-voice-server/src/index");
      
      const result = await handlePing({});
      
      expect(result.success).toBe(true);
      expect(result.message).toContain("Hello from Voice Server!");
      expect(result.timestamp).toBeDefined();
    });

    it("должен парсить голосовую команду", async () => {
      const { handleParseCommand } = await import("../../../mcp-voice-server/src/index");
      
      const result = await handleParseCommand({
        text: "Забронируй корт на завтра в 14:00",
        language: "ru-RU"
      });
      
      expect(result.success).toBe(true);
      expect(result.command).not.toBeNull();
      expect(result.command?.command).toBe("book_court");
      expect(result.originalText).toBe("Забронируй корт на завтра в 14:00");
      expect(result.language).toBe("ru-RU");
      expect(result.timestamp).toBeDefined();
    });

    it("должен обработать нераспознанную команду", async () => {
      const { handleParseCommand } = await import("../../../mcp-voice-server/src/index");
      
      const result = await handleParseCommand({
        text: "Какая сегодня погода?",
        language: "ru-RU"
      });
      
      expect(result.success).toBe(true);
      expect(result.command).toBeNull();
      expect(result.originalText).toBe("Какая сегодня погода?");
    });

    it("должен использовать дефолтный язык", async () => {
      const { handleParseCommand } = await import("../../../mcp-voice-server/src/index");
      
      const result = await handleParseCommand({
        text: "Забронируй корт на завтра в 14:00"
      });
      
      expect(result.success).toBe(true);
      expect(result.language).toBe("ru-RU");
    });

    it("должен обрабатывать ошибки валидации", async () => {
      const { handleParseCommand } = await import("../../../mcp-voice-server/src/index");
      
      try {
        await handleParseCommand({
          text: "", // пустой текст
          language: "ru-RU"
        });
        // Если дошли сюда, то ошибка не была выброшена
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("должен создать MCP сервер", async () => {
      const { createVoiceServer } = await import("../../../mcp-voice-server/src/index");

      const server = await createVoiceServer();

      expect(server).toBeDefined();
      // Проверяем, что сервер имеет необходимые методы
      expect(typeof server.setRequestHandler).toBe("function");
      expect(typeof server.connect).toBe("function");
    });

    it("должен обработать голосовое бронирование", async () => {
      const { handleVoiceBooking } = await import("../../../mcp-voice-server/src/index");

      const result = await handleVoiceBooking({
        text: "Забронируй корт на завтра в 14:00",
        userId: "user-123",
        sessionId: "session-456",
        language: "ru-RU"
      });

      expect(result.success).toBe(true);
      expect(result.bookingId).toBeDefined();
      expect(result.message).toContain("забронирован");
      expect(result.audioResponse).toBeDefined();
      expect(result.audioResponse).toContain("https://");
      expect(result.command?.command).toBe("book_court");
      expect(result.userId).toBe("user-123");
      expect(result.sessionId).toBe("session-456");
    });

    it("должен обработать ошибку нераспознанной команды в voice_booking", async () => {
      const { handleVoiceBooking } = await import("../../../mcp-voice-server/src/index");

      const result = await handleVoiceBooking({
        text: "Какая сегодня погода?",
        userId: "user-123",
        sessionId: "session-456",
        language: "ru-RU"
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Voice command not recognized");
      expect(result.suggestion).toContain("Try saying");
    });

    it("должен валидировать параметры voice_booking", async () => {
      const { handleVoiceBooking } = await import("../../../mcp-voice-server/src/index");

      try {
        await handleVoiceBooking({
          text: "", // пустой текст
          userId: "user-123",
          sessionId: "session-456"
        });
        expect(true).toBe(false); // не должно дойти сюда
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it("должен выполнить самотестирование ping", async () => {
      const { handleSelfTest } = await import("../../../mcp-voice-server/src/index");

      const result = await handleSelfTest({
        testType: "ping",
        testData: "Self-test data"
      });

      expect(result.success).toBe(true);
      expect(result.testType).toBe("ping");
      expect(result.result.success).toBe(true);
      expect(result.result.message).toContain("Voice Server is alive!");
      expect(result.performance.responseTime).toBeGreaterThan(0);
    });

    it("должен выполнить самотестирование parse_command", async () => {
      const { handleSelfTest } = await import("../../../mcp-voice-server/src/index");

      const result = await handleSelfTest({
        testType: "parse_command",
        testData: "Забронируй корт на завтра в 14:00"
      });

      expect(result.success).toBe(true);
      expect(result.testType).toBe("parse_command");
      expect(result.result.success).toBe(true);
      expect(result.result.command?.command).toBe("book_court");
    });

    it("должен выполнить самотестирование voice_booking", async () => {
      const { handleSelfTest } = await import("../../../mcp-voice-server/src/index");

      const result = await handleSelfTest({
        testType: "voice_booking",
        testData: "Забронируй корт на завтра в 14:00"
      });

      expect(result.success).toBe(true);
      expect(result.testType).toBe("voice_booking");
      expect(result.result.success).toBe(true);
      expect(result.result.bookingId).toBeDefined();
      expect(result.result.message).toContain("забронирован");
    });

    it("должен выполнить полный цикл самотестирования", async () => {
      const { handleSelfTest } = await import("../../../mcp-voice-server/src/index");

      const result = await handleSelfTest({
        testType: "full_cycle",
        testData: "Забронируй корт на завтра в 14:00"
      });

      expect(result.success).toBe(true);
      expect(result.testType).toBe("full_cycle");
      expect(result.result.ping.success).toBe(true);
      expect(result.result.parse.success).toBe(true);
      expect(result.result.booking.success).toBe(true);
      expect(result.result.allSuccessful).toBe(true);
    });

    it("должен обработать ошибку в самотестировании", async () => {
      const { handleSelfTest } = await import("../../../mcp-voice-server/src/index");

      const result = await handleSelfTest({
        testType: "unknown_test" as any,
        testData: "Test data"
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain("Unknown test type");
    });
  });

  describe("🟢 GREEN: Интеграционные тесты", () => {
    it("должен обработать различные языки команд", async () => {
      const { handleParseCommand } = await import("../../../mcp-voice-server/src/index");
      
      const commands = [
        { text: "Забронируй корт на завтра в 14:00", language: "ru-RU" as const },
        { text: "Book a court for tomorrow at 2 PM", language: "en-US" as const },
        { text: "จองคอร์ตพรุ่งนี้เวลา 14:00", language: "th-TH" as const },
      ];
      
      for (const cmd of commands) {
        const result = await handleParseCommand(cmd);
        expect(result.success).toBe(true);
        expect(result.language).toBe(cmd.language);
        expect(result.command?.command).toBe("book_court");
      }
    });

    it("должен обработать команды проверки доступности", async () => {
      const { handleParseCommand } = await import("../../../mcp-voice-server/src/index");
      
      const result = await handleParseCommand({
        text: "Покажи свободные корты на сегодня",
        language: "ru-RU"
      });
      
      expect(result.success).toBe(true);
      expect(result.command?.command).toBe("check_availability");
    });

    it("должен обработать команды отмены", async () => {
      const { handleParseCommand } = await import("../../../mcp-voice-server/src/index");
      
      const result = await handleParseCommand({
        text: "Отмени мою бронь на завтра",
        language: "ru-RU"
      });
      
      expect(result.success).toBe(true);
      expect(result.command?.command).toBe("cancel_booking");
    });

    it("должен сохранять метаданные в ответах", async () => {
      const { handlePing, handleParseCommand } = await import("../../../mcp-voice-server/src/index");
      
      const pingResult = await handlePing({ message: "Test" });
      const parseResult = await handleParseCommand({
        text: "Забронируй корт на завтра в 14:00"
      });
      
      // Проверяем, что все ответы содержат timestamp
      expect(pingResult.timestamp).toBeDefined();
      expect(parseResult.timestamp).toBeDefined();
      
      // Проверяем формат timestamp
      expect(new Date(pingResult.timestamp).getTime()).toBeGreaterThan(0);
      expect(new Date(parseResult.timestamp).getTime()).toBeGreaterThan(0);
    });
  });
});
