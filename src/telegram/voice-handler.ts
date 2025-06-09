/**
 * 🎤 Telegram Voice Handler
 * Обработка голосовых сообщений в Telegram-боте с интеграцией Voice Framework
 */

import { Context } from "telegraf";
import { Message } from "telegraf/typings/core/types/typegram";
import { logger, LogType } from "../utils/logger";
import { VoiceBookingService } from "../services/booking-service";
import { parseVoiceCommand, textToVoice } from "../services/voice-ai";
import { voiceProcessor } from "./voice-processor";

// Типы для голосовых сообщений
interface VoiceMessage extends Message.VoiceMessage {
  voice: {
    file_id: string;
    file_unique_id: string;
    duration: number;
    mime_type?: string;
    file_size?: number;
  };
}

interface TelegramVoiceContext extends Context {
  message: VoiceMessage;
  session?: {
    user?: {
      id: string;
      first_name?: string;
    };
  };
}

/**
 * 🎤 Класс для обработки голосовых сообщений в Telegram
 */
export class TelegramVoiceHandler {
  private bookingService: VoiceBookingService | null = null;

  constructor() {
    this.initializeBookingService();
  }

  /**
   * 🏗️ Инициализация BookingService
   */
  private async initializeBookingService() {
    try {
      const { VoiceBookingService } = await import("../services/booking-service");
      const { BookingRepository } = await import("../repositories/booking-repository");
      const { CourtRepository } = await import("../repositories/court-repository");
      const { UserRepository } = await import("../repositories/user-repository");
      const { db } = await import("../db");

      // Создаем репозитории
      const bookingRepo = new BookingRepository(db);
      const courtRepo = new CourtRepository(db);
      const userRepo = new UserRepository(db);

      // Создаем сервис
      this.bookingService = new VoiceBookingService(
        bookingRepo,
        courtRepo,
        userRepo,
        {
          defaultDuration: 90, // 1.5 часа
          defaultCurrency: "THB",
          defaultPurpose: "free_play",
          pricePerHour: 1500, // 1500 THB за час
        }
      );

      logger.info("VoiceBookingService инициализирован для Telegram", {
        type: LogType.SYSTEM,
      });
    } catch (error) {
      logger.error("Ошибка инициализации VoiceBookingService", {
        error: error instanceof Error ? error : new Error(String(error)),
        type: LogType.ERROR,
      });
    }
  }

  /**
   * 🎤 Обработка голосового сообщения
   */
  async handleVoiceMessage(ctx: TelegramVoiceContext): Promise<void> {
    try {
      const userId = ctx.from?.id?.toString() || "unknown";
      const sessionId = `telegram-${userId}-${Date.now()}`;

      logger.info("Получено голосовое сообщение", {
        userId,
        duration: ctx.message.voice.duration,
        type: LogType.VOICE,
      });

      // Отправляем сообщение о начале обработки
      await ctx.reply("🎤 Обрабатываю голосовое сообщение...");

      // 1. Обрабатываем голосовой файл через VoiceProcessor
      const voiceResult = await voiceProcessor.processVoiceMessage(ctx, {
        language: "ru-RU",
      });

      if (!voiceResult.success || !voiceResult.text) {
        await ctx.reply(`❌ ${voiceResult.error || "Не удалось распознать речь. Попробуйте еще раз."}`);
        return;
      }

      const voiceText = voiceResult.text;

      logger.info("Голос распознан", {
        userId,
        text: voiceText,
        type: LogType.VOICE,
      });

      // Дополнительное логирование для отладки
      console.log(`🎤 РАСПОЗНАННЫЙ ТЕКСТ: "${voiceText}"`);
      console.log(`👤 ПОЛЬЗОВАТЕЛЬ: ${userId}`);

      // 2. Парсим голосовую команду
      const command = await parseVoiceCommand(voiceText);
      
      if (!command) {
        await ctx.reply(
          `❓ Не удалось понять команду: "${voiceText}"\n\n` +
          "Попробуйте сказать:\n" +
          "• Забронируй корт на завтра в 14:00\n" +
          "• Покажи свободные корты\n" +
          "• Отмени мою бронь"
        );
        return;
      }

      // 3. Обрабатываем команду через BookingService
      const result = await this.processVoiceCommand(command, userId, voiceText);

      // 4. Отправляем результат пользователю
      await this.sendResponse(ctx, result, voiceText);

    } catch (error) {
      logger.error("Ошибка обработки голосового сообщения", {
        error: error instanceof Error ? error : new Error(String(error)),
        userId: ctx.from?.id?.toString(),
        type: LogType.ERROR,
      });

      await ctx.reply(
        "❌ Произошла ошибка при обработке голосового сообщения. Попробуйте позже."
      );
    }
  }



  /**
   * 📋 Обработка голосовой команды
   */
  private async processVoiceCommand(
    command: any,
    userId: string,
    originalText: string
  ): Promise<any> {
    if (!this.bookingService) {
      // Fallback к mock сервису
      const { processVoiceBooking } = await import("../services/voice-ai");
      return await processVoiceBooking(command, userId);
    }

    return await this.bookingService.processVoiceBooking(command, userId);
  }

  /**
   * 📤 Отправка ответа пользователю
   */
  private async sendResponse(
    ctx: TelegramVoiceContext,
    result: any,
    originalText: string
  ): Promise<void> {
    try {
      let responseText = "";

      if (result.success) {
        responseText = `✅ ${result.message}`;

        // Добавляем дополнительную информацию
        if (result.bookingId) {
          responseText += `\n\n📋 ID бронирования: ${result.bookingId}`;
        }

        if (result.nextSteps && result.nextSteps.length > 0) {
          responseText += "\n\n📝 Следующие шаги:";
          result.nextSteps.forEach((step: string, index: number) => {
            responseText += `\n${index + 1}. ${step}`;
          });
        }

        if (result.availableSlots && result.availableSlots.length > 0) {
          responseText += "\n\n🏓 Доступные слоты:";
          result.availableSlots.forEach((slot: any) => {
            responseText += `\n• ${slot.time} - ${slot.court} (${slot.price} THB)`;
          });
        }
      } else {
        responseText = `❌ ${result.message}`;
      }

      // Добавляем информацию о распознанном тексте
      responseText += `\n\n🎤 Распознано: "${originalText}"`;

      await ctx.reply(responseText);

      // Логируем результат
      logger.info("Голосовая команда обработана", {
        userId: ctx.from?.id?.toString(),
        command: result.command || "unknown",
        success: result.success,
        originalText,
        type: LogType.VOICE,
      });

    } catch (error) {
      logger.error("Ошибка отправки ответа", {
        error: error instanceof Error ? error : new Error(String(error)),
        type: LogType.ERROR,
      });

      await ctx.reply("❌ Ошибка при отправке ответа");
    }
  }

  /**
   * 🧪 Тестирование голосового фреймворка
   */
  async handleTestCommand(ctx: Context): Promise<void> {
    try {
      const userId = ctx.from?.id?.toString() || "test-user";

      await ctx.reply("🧪 Тестирую голосовой фреймворк...");

      // 1. Тестируем VoiceProcessor
      const voiceTest = await voiceProcessor.testVoiceProcessing();

      // 2. Тестируем парсинг команды
      const testText = voiceTest.text || "Забронируй корт на завтра в 14:00";
      const command = await parseVoiceCommand(testText);

      if (!command) {
        await ctx.reply("❌ Ошибка парсинга команды");
        return;
      }

      // 3. Тестируем бронирование
      const result = await this.processVoiceCommand(command, userId, testText);

      let responseText = "🧪 Результат тестирования:\n\n";
      responseText += `🔊 VoiceProcessor: ${voiceTest.success ? "✅" : "❌"}\n`;
      responseText += `📝 Команда: ${testText}\n`;
      responseText += `🧠 Распознано: ${command.command}\n`;
      responseText += `🏓 BookingService: ${this.bookingService ? "✅ Реальный" : "⚠️ Mock"}\n`;
      responseText += `✅ Статус: ${result.success ? "Успешно" : "Ошибка"}\n`;
      responseText += `💬 Ответ: ${result.message}`;

      await ctx.reply(responseText);

    } catch (error) {
      logger.error("Ошибка тестирования", {
        error: error instanceof Error ? error : new Error(String(error)),
        type: LogType.ERROR,
      });

      await ctx.reply("❌ Ошибка при тестировании");
    }
  }
}

// Создаем глобальный экземпляр обработчика
export const voiceHandler = new TelegramVoiceHandler();
