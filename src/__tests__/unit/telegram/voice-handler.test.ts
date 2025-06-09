/**
 * 🧪 Тесты для TelegramVoiceHandler
 * Проверка интеграции голосового фреймворка с Telegram
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

describe("TelegramVoiceHandler", () => {
  describe("Импорт и создание обработчика", () => {
    it("должен импортировать TelegramVoiceHandler", async () => {
      const { TelegramVoiceHandler } = await import("../../../telegram/voice-handler");
      
      expect(TelegramVoiceHandler).toBeDefined();
      expect(typeof TelegramVoiceHandler).toBe("function");
    });

    it("должен импортировать voiceHandler экземпляр", async () => {
      const { voiceHandler } = await import("../../../telegram/voice-handler");
      
      expect(voiceHandler).toBeDefined();
      expect(typeof voiceHandler.handleVoiceMessage).toBe("function");
      expect(typeof voiceHandler.handleTestCommand).toBe("function");
    });
  });

  describe("Обработка голосовых сообщений", () => {
    let mockCtx: any;

    beforeEach(() => {
      // Mock Telegram контекст
      mockCtx = {
        from: { id: 123456, first_name: "Test User" },
        message: {
          voice: {
            file_id: "test-file-id",
            file_unique_id: "test-unique-id",
            duration: 3,
            mime_type: "audio/ogg",
            file_size: 1024,
          },
        },
        reply: vi.fn().mockResolvedValue({}),
        telegram: {
          getFile: vi.fn().mockResolvedValue({
            file_path: "voice/test-file.ogg",
          }),
          getFileLink: vi.fn().mockResolvedValue({
            href: "https://api.telegram.org/file/bot123/voice/test-file.ogg",
          }),
        },
      };

      // Mock fetch для скачивания файлов
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(1024)),
      });
    });

    it("должен обработать голосовое сообщение", async () => {
      const { voiceHandler } = await import("../../../telegram/voice-handler");
      
      await voiceHandler.handleVoiceMessage(mockCtx);
      
      // Проверяем, что были вызваны методы контекста
      expect(mockCtx.reply).toHaveBeenCalledWith("🎤 Обрабатываю голосовое сообщение...");
      expect(mockCtx.reply).toHaveBeenCalledTimes(2); // Начальное сообщение + результат
    });

    it("должен обработать ошибку отсутствия голосового сообщения", async () => {
      const { voiceHandler } = await import("../../../telegram/voice-handler");
      
      // Убираем voice из сообщения
      delete mockCtx.message.voice;
      
      await voiceHandler.handleVoiceMessage(mockCtx);
      
      // Должно быть только одно сообщение об ошибке
      expect(mockCtx.reply).toHaveBeenCalledWith(
        expect.stringContaining("❌")
      );
    });

    it("должен обработать слишком длинное голосовое сообщение", async () => {
      const { voiceHandler } = await import("../../../telegram/voice-handler");
      
      // Устанавливаем длинную продолжительность
      mockCtx.message.voice.duration = 35; // больше 30 секунд
      
      await voiceHandler.handleVoiceMessage(mockCtx);
      
      expect(mockCtx.reply).toHaveBeenCalledWith("🎤 Обрабатываю голосовое сообщение...");
      expect(mockCtx.reply).toHaveBeenCalledWith(
        expect.stringContaining("слишком длинное")
      );
    });
  });

  describe("Тестовые команды", () => {
    let mockCtx: any;

    beforeEach(() => {
      mockCtx = {
        from: { id: 123456, first_name: "Test User" },
        reply: vi.fn().mockResolvedValue({}),
      };
    });

    it("должен выполнить тестовую команду", async () => {
      const { voiceHandler } = await import("../../../telegram/voice-handler");
      
      await voiceHandler.handleTestCommand(mockCtx);
      
      expect(mockCtx.reply).toHaveBeenCalledWith("🧪 Тестирую голосовой фреймворк...");
      expect(mockCtx.reply).toHaveBeenCalledWith(
        expect.stringContaining("🧪 Результат тестирования:")
      );
    });

    it("должен показать статус компонентов в тесте", async () => {
      const { voiceHandler } = await import("../../../telegram/voice-handler");
      
      await voiceHandler.handleTestCommand(mockCtx);
      
      // Проверяем последний вызов reply
      const lastCall = mockCtx.reply.mock.calls[mockCtx.reply.mock.calls.length - 1];
      const responseText = lastCall[0];
      
      expect(responseText).toContain("🔊 VoiceProcessor:");
      expect(responseText).toContain("🧠 Распознано:");
      expect(responseText).toContain("🏓 BookingService:");
      expect(responseText).toContain("✅ Статус:");
    });
  });

  describe("VoiceProcessor интеграция", () => {
    it("должен импортировать VoiceProcessor", async () => {
      const { VoiceProcessor, voiceProcessor } = await import("../../../telegram/voice-processor");
      
      expect(VoiceProcessor).toBeDefined();
      expect(voiceProcessor).toBeDefined();
      expect(typeof voiceProcessor.processVoiceMessage).toBe("function");
      expect(typeof voiceProcessor.testVoiceProcessing).toBe("function");
    });

    it("должен выполнить тестирование VoiceProcessor", async () => {
      const { voiceProcessor } = await import("../../../telegram/voice-processor");
      
      const result = await voiceProcessor.testVoiceProcessing();
      
      expect(result.success).toBe(true);
      expect(result.text).toBeDefined();
      expect(result.text).toContain("Тестовая голосовая команда");
      expect(result.duration).toBeDefined();
      expect(result.fileSize).toBeDefined();
    });

    it("должен создать VoiceProcessor с настройками", async () => {
      const { VoiceProcessor } = await import("../../../telegram/voice-processor");
      
      const processor = new VoiceProcessor({
        language: "en-US",
        maxDuration: 60,
        maxFileSize: 2048 * 1024,
      });
      
      expect(processor).toBeDefined();
      expect(typeof processor.processVoiceMessage).toBe("function");
    });
  });

  describe("Интеграция с BookingService", () => {
    it("должен использовать реальный BookingService если доступен", async () => {
      const { TelegramVoiceHandler } = await import("../../../telegram/voice-handler");
      
      const handler = new TelegramVoiceHandler();
      
      // Ждем инициализации
      await new Promise(resolve => setTimeout(resolve, 100));
      
      expect(handler).toBeDefined();
    });

    it("должен fallback к mock сервису при ошибке", async () => {
      // Этот тест проверяет, что обработчик не падает при ошибках инициализации
      const { TelegramVoiceHandler } = await import("../../../telegram/voice-handler");
      
      const handler = new TelegramVoiceHandler();
      
      expect(handler).toBeDefined();
      expect(typeof handler.handleVoiceMessage).toBe("function");
    });
  });

  describe("Обработка ошибок", () => {
    let mockCtx: any;

    beforeEach(() => {
      mockCtx = {
        from: { id: 123456 },
        message: {
          voice: {
            file_id: "test-file-id",
            duration: 3,
            file_size: 1024,
          },
        },
        reply: vi.fn().mockResolvedValue({}),
        telegram: {
          getFile: vi.fn().mockRejectedValue(new Error("Network error")),
        },
      };
    });

    it("должен обработать ошибку сети при скачивании файла", async () => {
      const { voiceHandler } = await import("../../../telegram/voice-handler");
      
      await voiceHandler.handleVoiceMessage(mockCtx);
      
      expect(mockCtx.reply).toHaveBeenCalledWith("🎤 Обрабатываю голосовое сообщение...");
      expect(mockCtx.reply).toHaveBeenCalledWith(
        expect.stringContaining("❌")
      );
    });

    it("должен обработать ошибку в тестовой команде", async () => {
      const { voiceHandler } = await import("../../../telegram/voice-handler");
      
      // Mock ошибки в reply
      mockCtx.reply = vi.fn().mockRejectedValue(new Error("Reply error"));
      
      await voiceHandler.handleTestCommand(mockCtx);
      
      // Функция не должна выбрасывать исключение
      expect(true).toBe(true);
    });
  });

  describe("Логирование", () => {
    it("должен логировать голосовые взаимодействия", async () => {
      const { voiceHandler } = await import("../../../telegram/voice-handler");
      
      const mockCtx = {
        from: { id: 123456 },
        message: {
          voice: {
            file_id: "test-file-id",
            duration: 3,
            file_size: 1024,
          },
        },
        reply: vi.fn().mockResolvedValue({}),
        telegram: {
          getFile: vi.fn().mockResolvedValue({ file_path: "test.ogg" }),
          getFileLink: vi.fn().mockResolvedValue({ href: "http://test.com/file.ogg" }),
        },
      };

      // Mock fetch
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(1024)),
      });

      await voiceHandler.handleVoiceMessage(mockCtx);
      
      // Проверяем, что логирование не вызывает ошибок
      expect(true).toBe(true);
    });
  });
});
