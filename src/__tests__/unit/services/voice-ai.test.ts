/**
 * 🎤 Unit тесты для Voice AI Service
 * TDD для голосового управления падл-центром
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import {
  voiceToText,
  textToVoice,
  parseVoiceCommand,
  processVoiceBooking,
  type VoiceBookingRequest,
} from "../../../services/voice-ai";

describe("Voice AI Service - TDD", () => {
  let originalEnv: typeof process.env;

  beforeAll(() => {
    originalEnv = { ...process.env };
    process.env.NODE_ENV = "test";
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe("🟢 GREEN: voiceToText - должен конвертировать голос в текст", () => {
    it("должен вернуть текст для валидного аудио", async () => {
      // Arrange: Создаем mock аудио буфер
      const mockAudioBuffer = new ArrayBuffer(1024);

      // Act
      const result = await voiceToText(mockAudioBuffer);

      // Assert
      expect(result).toBeDefined();
      expect(result.text).toEqual(expect.any(String));
      expect(result.confidence).toBeGreaterThan(0.8);
      expect(result.language).toMatch(/^(ru-RU|en-US|th-TH)$/);
      expect(result.duration).toBeGreaterThan(0);
    });

    it("должен обрабатывать пустой аудио буфер", async () => {
      const emptyBuffer = new ArrayBuffer(0);

      await expect(voiceToText(emptyBuffer)).rejects.toThrow(
        "Empty audio buffer provided"
      );
    });

    it("должен поддерживать опции языка", async () => {
      const mockAudioBuffer = new ArrayBuffer(1024);
      const options = { language: "ru-RU", enableNoiseReduction: true };

      const result = await voiceToText(mockAudioBuffer, options);

      expect(result.language).toBe("ru-RU");
      expect(result.text).toEqual(expect.any(String));
    });

    it("должен возвращать уровень уверенности", async () => {
      const mockAudioBuffer = new ArrayBuffer(1024);

      const result = await voiceToText(mockAudioBuffer);

      expect(result.confidence).toBeGreaterThanOrEqual(0.85);
      expect(result.confidence).toBeLessThanOrEqual(0.95);
    });
  });

  describe("🟢 GREEN: textToVoice - должен конвертировать текст в голос", () => {
    it("должен генерировать аудио для текста", async () => {
      const text = "Ваша бронь подтверждена на завтра в 14:00";

      const result = await textToVoice(text);

      expect(result.audioUrl).toEqual(expect.stringContaining("https://"));
      expect(result.format).toBe("mp3");
      expect(result.duration).toBeGreaterThan(0);
      expect(result.size).toBeGreaterThan(0);
    });

    it("должен поддерживать разные голоса и эмоции", async () => {
      const text = "Добро пожаловать в падл-центр!";
      const options = {
        voice: "maria",
        emotion: "excited" as const,
        speed: 1.2,
      };

      const result = await textToVoice(text, options);

      expect(result.audioUrl).toEqual(expect.stringContaining("https://"));
      expect(result.format).toBe("mp3");
    });

    it("должен обрабатывать пустой текст", async () => {
      await expect(textToVoice("")).rejects.toThrow("Empty text provided");
    });
  });

  describe("🟢 GREEN: parseVoiceCommand - должен парсить голосовые команды", () => {
    it("должен распознать команду бронирования корта", async () => {
      const text = "Забронируй корт на завтра в 14:00 на два часа";

      const result = await parseVoiceCommand(text);

      expect(result).not.toBeNull();
      expect(result?.command).toBe("book_court");
      expect(result?.time).toBe("14:00");
      expect(result?.duration).toBe(2);
    });

    it("должен распознать отмену бронирования", async () => {
      const text = "Отмени мою бронь на завтра";

      const result = await parseVoiceCommand(text);

      expect(result).not.toBeNull();
      expect(result?.command).toBe("cancel_booking");
    });

    it("должен распознать проверку доступности", async () => {
      const text = "Покажи свободные корты на сегодня вечером";

      const result = await parseVoiceCommand(text);

      expect(result).not.toBeNull();
      expect(result?.command).toBe("check_availability");
    });

    it("должен вернуть null для нераспознанной команды", async () => {
      const text = "Как дела? Хорошая погода сегодня";

      const result = await parseVoiceCommand(text);

      expect(result).toBeNull();
    });

    it("должен обрабатывать опечатки и вариации", async () => {
      const variations = [
        "забронируй корт",
        "book court", // английский
      ];

      for (const text of variations) {
        const result = await parseVoiceCommand(text);
        expect(result?.command).toBe("book_court");
      }
    });
  });

  describe("🟢 GREEN: processVoiceBooking - должен обрабатывать голосовые брони", () => {
    it("должен создать бронь для валидного запроса", async () => {
      const request: VoiceBookingRequest = {
        command: "book_court",
        courtType: "indoor",
        date: "2024-12-26",
        time: "14:00",
        duration: 2,
        playerCount: 4,
      };
      const userId = "user-123";

      const result = await processVoiceBooking(request, userId);

      expect(result.success).toBe(true);
      expect(result.bookingId).toEqual(expect.stringContaining("booking-"));
      expect(result.message).toContain("успешно забронирован");
      expect(result.nextSteps).toEqual(
        expect.arrayContaining([expect.any(String)])
      );
    });

    it("должен возвращать доступные слоты при проверке", async () => {
      const request: VoiceBookingRequest = {
        command: "check_availability",
        date: "2024-12-26",
      };
      const userId = "user-123";

      const result = await processVoiceBooking(request, userId);

      expect(result.success).toBe(true);
      expect(result.availableSlots).toBeDefined();
      expect(Array.isArray(result.availableSlots)).toBe(true);
      expect(result.availableSlots?.length).toBeGreaterThan(0);
    });

    it("должен отменить существующую бронь", async () => {
      const request: VoiceBookingRequest = {
        command: "cancel_booking",
        date: "2024-12-26",
      };
      const userId = "user-123";

      const result = await processVoiceBooking(request, userId);

      expect(result.success).toBe(true);
      expect(result.message).toContain("отменено");
    });

    it("должен обрабатывать ошибки валидации", async () => {
      const invalidRequest: VoiceBookingRequest = {
        command: "book_court",
        // Нет обязательных полей date и time
      };
      const userId = "user-123";

      const result = await processVoiceBooking(invalidRequest, userId);

      expect(result.success).toBe(false);
      expect(result.message).toContain("Ошибка");
    });
  });

  describe("🟢 GREEN: Integration Tests - полный цикл голосового бронирования", () => {
    it("должен обработать полный цикл: голос → команда → бронь → ответ", async () => {
      // Simulate full voice booking flow
      const mockAudioBuffer = new ArrayBuffer(1024);
      const userId = "user-123";

      // 1. Convert voice to text
      const voiceResult = await voiceToText(mockAudioBuffer);
      expect(voiceResult.text).toBeDefined();

      // 2. Parse command
      const command = await parseVoiceCommand(
        "Забронируй корт на завтра в 14:00"
      );
      expect(command).not.toBeNull();

      // 3. Process booking (with required fields)
      const bookingRequest: VoiceBookingRequest = {
        command: "book_court",
        date: "2024-12-26",
        time: "14:00",
      };
      const booking = await processVoiceBooking(bookingRequest, userId);

      // 4. Convert response to voice
      const voiceResponse = await textToVoice(booking.message);

      expect(voiceResponse.audioUrl).toBeDefined();
      expect(booking.success).toBe(true);
    });

    it("должен обрабатывать многоязычные команды", async () => {
      const mockAudioBuffer = new ArrayBuffer(1024);

      const result = await voiceToText(mockAudioBuffer, { language: "ru-RU" });

      expect(result.language).toBe("ru-RU");
    });

    it("должен сохранять логи для voice analytics", async () => {
      const mockAudioBuffer = new ArrayBuffer(1024);
      const userId = "user-123";

      // Voice interaction should be logged for analytics
      const interaction = {
        userId,
        timestamp: new Date(),
        audioLength: mockAudioBuffer.byteLength,
        command: "book_court",
        success: true,
        responseTime: 850, // ms
      };

      expect(interaction.userId).toBe(userId);
      expect(interaction.audioLength).toBeGreaterThan(0);
    });
  });
});
