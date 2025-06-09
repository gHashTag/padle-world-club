/**
 * 🎤 Базовые тесты для голосового фреймворка
 * Проверка основной функциональности без сложных зависимостей
 */

import { describe, it, expect } from "vitest";

describe("Voice Framework - Basic Tests", () => {
  describe("🟢 GREEN: Базовая проверка модулей", () => {
    it("должен импортировать voice-ai модуль", async () => {
      // Динамический импорт для избежания проблем с путями
      const voiceAi = await import("../../../services/voice-ai");
      
      expect(voiceAi.voiceToText).toBeDefined();
      expect(voiceAi.textToVoice).toBeDefined();
      expect(voiceAi.parseVoiceCommand).toBeDefined();
      expect(voiceAi.processVoiceBooking).toBeDefined();
    });

    it("должен импортировать voice-tools модуль", async () => {
      const voiceTools = await import("../../../mcp-voice-server/voice-tools");
      
      expect(voiceTools.voiceBookingTool).toBeDefined();
      expect(voiceTools.voiceAnalyticsTool).toBeDefined();
      expect(voiceTools.voiceTestTool).toBeDefined();
      expect(voiceTools.createMCPVoiceServer).toBeDefined();
    });
  });

  describe("🟢 GREEN: Базовая функциональность voice-ai", () => {
    it("должен обработать простую голосовую команду", async () => {
      const { parseVoiceCommand } = await import("../../../services/voice-ai");
      
      const result = await parseVoiceCommand("Забронируй корт на завтра в 14:00");
      
      expect(result).not.toBeNull();
      expect(result?.command).toBe("book_court");
    });

    it("должен преобразовать текст в голос", async () => {
      const { textToVoice } = await import("../../../services/voice-ai");
      
      const result = await textToVoice("Тестовое сообщение");
      
      expect(result.audioUrl).toBeDefined();
      expect(result.audioUrl).toContain("https://");
      expect(result.format).toBe("mp3");
    });

    it("должен преобразовать голос в текст", async () => {
      const { voiceToText } = await import("../../../services/voice-ai");
      
      const audioBuffer = new ArrayBuffer(1024);
      const result = await voiceToText(audioBuffer);
      
      expect(result.text).toBeDefined();
      expect(result.confidence).toBeGreaterThan(0.8);
      expect(result.language).toMatch(/^(ru-RU|en-US|th-TH)$/);
    });

    it("должен обработать бронирование", async () => {
      const { processVoiceBooking } = await import("../../../services/voice-ai");
      
      const request = {
        command: "book_court" as const,
        date: "2024-12-27",
        time: "14:00"
      };
      
      const result = await processVoiceBooking(request, "user-123");
      
      expect(result.success).toBe(true);
      expect(result.bookingId).toBeDefined();
      expect(result.message).toContain("забронирован");
    });
  });

  describe("🟢 GREEN: Базовая функциональность voice-tools", () => {
    it("должен создать MCP Voice Server", async () => {
      const { createMCPVoiceServer } = await import("../../../mcp-voice-server/voice-tools");
      
      const server = createMCPVoiceServer();
      
      expect(server.tools).toHaveLength(3);
      expect(server.tools.map(t => t.name)).toEqual([
        "voice_booking_tool",
        "voice_analytics_tool", 
        "voice_test_tool"
      ]);
      expect(server.handleToolCall).toBeDefined();
    });

    it("должен обработать голосовое бронирование через tool", async () => {
      const { voiceBookingTool } = await import("../../../mcp-voice-server/voice-tools");
      
      const args = {
        text: "Забронируй корт на завтра в 14:00",
        userId: "user-123",
        sessionId: "session-456"
      };
      
      const result = await voiceBookingTool(args);
      
      expect(result.success).toBe(true);
      expect(result.bookingId).toBeDefined();
      expect(result.audioResponse).toBeDefined();
    });

    it("должен получить аналитику через tool", async () => {
      const { voiceAnalyticsTool } = await import("../../../mcp-voice-server/voice-tools");
      
      const args = {
        metricType: "usage" as const
      };
      
      const result = await voiceAnalyticsTool(args);
      
      expect(result.success).toBe(true);
      expect(result.data.totalInteractions).toBeGreaterThan(0);
      expect(result.data.topCommands).toBeDefined();
    });

    it("должен протестировать голосовые функции через tool", async () => {
      const { voiceTestTool } = await import("../../../mcp-voice-server/voice-tools");
      
      const args = {
        testType: "command_parsing" as const,
        inputData: "Забронируй корт на завтра в 14:00"
      };
      
      const result = await voiceTestTool(args);
      
      expect(result.success).toBe(true);
      expect(result.testType).toBe("command_parsing");
      expect(result.result).not.toBeNull();
    });
  });

  describe("🟢 GREEN: Интеграционные тесты", () => {
    it("должен выполнить полный цикл голосового взаимодействия", async () => {
      const { voiceTestTool } = await import("../../../mcp-voice-server/voice-tools");
      
      const args = {
        testType: "full_cycle" as const,
        inputData: "Забронируй корт на завтра в 14:00"
      };
      
      const result = await voiceTestTool(args);
      
      expect(result.success).toBe(true);
      expect(result.result.command).toBeDefined();
      expect(result.result.booking).toBeDefined();
      expect(result.result.audioResponse).toBeDefined();
    });

    it("должен обработать ошибки валидации", async () => {
      const { voiceBookingTool } = await import("../../../mcp-voice-server/voice-tools");
      
      const invalidArgs = {
        text: "",
        userId: "",
        sessionId: "session-456"
      };
      
      const result = await voiceBookingTool(invalidArgs);
      
      expect(result.success).toBe(false);
      expect(result.message).toContain("Ошибка");
    });

    it("должен обработать нераспознанные команды", async () => {
      const { parseVoiceCommand } = await import("../../../services/voice-ai");
      
      const result = await parseVoiceCommand("Какая сегодня погода?");
      
      expect(result).toBeNull();
    });
  });
});
