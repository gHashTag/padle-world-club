#!/usr/bin/env node

/**
 * 🎤 MCP Voice Server для голосового управления падл-центром
 * Минимальная реализация с фокусом "Just To Be Done"
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";

// Импорт для реального BookingService
let bookingServiceInstance: any = null;

// Схемы валидации для инструментов
const PingToolSchema = z.object({
  message: z.string().optional().default("Hello from Voice Server!"),
});

const ParseCommandToolSchema = z.object({
  text: z.string().min(1, "Text cannot be empty"),
  language: z.enum(["ru-RU", "en-US", "th-TH"]).optional().default("ru-RU"),
});

const VoiceBookingToolSchema = z.object({
  text: z.string().min(1, "Voice command text cannot be empty"),
  userId: z.string().min(1, "User ID is required"),
  sessionId: z.string().min(1, "Session ID is required"),
  language: z.enum(["ru-RU", "en-US", "th-TH"]).optional().default("ru-RU"),
});

const SelfTestToolSchema = z.object({
  testType: z.enum(["ping", "parse_command", "voice_booking", "full_cycle"]).default("ping"),
  testData: z.string().optional().default("Test data"),
});

/**
 * 🏓 Простая функция ping для проверки работоспособности
 */
async function handlePing(args: z.infer<typeof PingToolSchema>) {
  const { message } = PingToolSchema.parse(args);

  return {
    success: true,
    message: `🎤 Voice Server is alive! ${message}`,
    timestamp: new Date().toISOString(),
    server: "MCP Voice Server v1.0.0",
  };
}

/**
 * 🏗️ Создание реального BookingService
 */
async function createBookingService() {
  if (bookingServiceInstance) {
    return bookingServiceInstance;
  }

  try {
    // Динамический импорт для избежания циклических зависимостей
    const { VoiceBookingService } = await import("../../services/booking-service");
    const { BookingRepository } = await import("../../repositories/booking-repository");
    const { CourtRepository } = await import("../../repositories/court-repository");
    const { UserRepository } = await import("../../repositories/user-repository");
    const { db } = await import("../../db");

    // Создаем репозитории
    const bookingRepo = new BookingRepository(db);
    const courtRepo = new CourtRepository(db);
    const userRepo = new UserRepository(db);

    // Создаем сервис с конфигурацией для падл-центра
    bookingServiceInstance = new VoiceBookingService(
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

    return bookingServiceInstance;
  } catch (error) {
    console.error("Failed to create BookingService:", error);
    // Fallback к mock сервису
    const { processVoiceBooking } = await import("../../services/voice-ai");
    return { processVoiceBooking };
  }
}

/**
 * 🧠 Парсинг голосовых команд (интеграция с существующим кодом)
 */
async function handleParseCommand(args: z.infer<typeof ParseCommandToolSchema>) {
  const { text, language } = ParseCommandToolSchema.parse(args);

  try {
    // Импортируем функцию из нашего voice-ai сервиса
    const { parseVoiceCommand } = await import("../../services/voice-ai");

    const result = await parseVoiceCommand(text);

    return {
      success: true,
      command: result,
      originalText: text,
      language,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      originalText: text,
      language,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * 🎤 Полноценное голосовое бронирование с реальными API
 */
async function handleVoiceBooking(args: z.infer<typeof VoiceBookingToolSchema>) {
  const { text, userId, sessionId, language } = VoiceBookingToolSchema.parse(args);

  try {
    // Импортируем функции из voice-ai сервиса
    const { parseVoiceCommand, textToVoice } = await import("../../services/voice-ai");

    // 1. Парсим голосовую команду
    const command = await parseVoiceCommand(text);
    if (!command) {
      return {
        success: false,
        error: "Voice command not recognized",
        suggestion: "Try saying: 'Book a court for tomorrow at 2 PM'",
        originalText: text,
        userId,
        sessionId,
        language,
        timestamp: new Date().toISOString(),
      };
    }

    // 2. Создаем реальный BookingService
    const bookingService = await createBookingService();

    // 3. Обрабатываем бронирование через реальный сервис
    const booking = await bookingService.processVoiceBooking(command, userId);

    // 4. Генерируем голосовой ответ
    const audioResponse = await textToVoice(booking.message, {
      emotion: booking.success ? "excited" : "calm",
    });

    // 5. Логируем взаимодействие
    console.error(`📝 Voice Booking: ${userId} - ${command.command} - ${booking.success}`);

    return {
      success: booking.success,
      bookingId: booking.bookingId,
      message: booking.message,
      audioResponse: audioResponse.audioUrl,
      nextSteps: booking.nextSteps,
      availableSlots: booking.availableSlots,
      command: command,
      originalText: text,
      userId,
      sessionId,
      language,
      timestamp: new Date().toISOString(),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      originalText: text,
      userId,
      sessionId,
      language,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * 🧪 Самотестирование MCP сервера
 */
async function handleSelfTest(args: z.infer<typeof SelfTestToolSchema>) {
  const { testType, testData } = SelfTestToolSchema.parse(args);
  const startTime = Date.now();

  try {
    let result: any;

    switch (testType) {
      case "ping":
        result = await handlePing({ message: "Self-test ping" });
        break;

      case "parse_command":
        result = await handleParseCommand({
          text: testData || "Забронируй корт на завтра в 14:00",
          language: "ru-RU"
        });
        break;

      case "voice_booking":
        result = await handleVoiceBooking({
          text: testData || "Забронируй корт на завтра в 14:00",
          userId: "test-user-123",
          sessionId: "test-session-456",
          language: "ru-RU"
        });
        break;

      case "full_cycle":
        // Полный цикл: ping -> parse -> booking
        const pingResult = await handlePing({ message: "Full cycle test" });
        const parseResult = await handleParseCommand({
          text: testData || "Забронируй корт на завтра в 14:00",
          language: "ru-RU"
        });
        const bookingResult = await handleVoiceBooking({
          text: testData || "Забронируй корт на завтра в 14:00",
          userId: "test-user-123",
          sessionId: "test-session-456",
          language: "ru-RU"
        });

        result = {
          ping: pingResult,
          parse: parseResult,
          booking: bookingResult,
          allSuccessful: pingResult.success && parseResult.success && bookingResult.success
        };
        break;

      default:
        throw new Error(`Unknown test type: ${testType}`);
    }

    const responseTime = Date.now() - startTime;

    return {
      success: true,
      testType,
      result,
      performance: {
        responseTime,
        timestamp: new Date().toISOString(),
      },
      server: "MCP Voice Server v1.0.0",
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;

    return {
      success: false,
      testType,
      error: error instanceof Error ? error.message : "Unknown error",
      performance: {
        responseTime,
        timestamp: new Date().toISOString(),
      },
      server: "MCP Voice Server v1.0.0",
    };
  }
}

/**
 * 🚀 Создание и настройка MCP сервера
 */
async function createVoiceServer() {
  const server = new Server(
    {
      name: "padle-voice-server",
      version: "1.0.0",
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // 📋 Регистрация инструментов
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: [
        {
          name: "ping",
          description: "🏓 Проверка работоспособности Voice Server",
          inputSchema: {
            type: "object",
            properties: {
              message: {
                type: "string",
                description: "Опциональное сообщение для проверки",
                default: "Hello from Voice Server!",
              },
            },
          },
        },
        {
          name: "parse_voice_command",
          description: "🧠 Парсинг голосовых команд для бронирования кортов",
          inputSchema: {
            type: "object",
            properties: {
              text: {
                type: "string",
                description: "Текст голосовой команды для парсинга",
              },
              language: {
                type: "string",
                enum: ["ru-RU", "en-US", "th-TH"],
                description: "Язык команды",
                default: "ru-RU",
              },
            },
            required: ["text"],
          },
        },
        {
          name: "voice_booking",
          description: "🎤 Полноценное голосовое бронирование кортов с генерацией аудио ответа",
          inputSchema: {
            type: "object",
            properties: {
              text: {
                type: "string",
                description: "Голосовая команда для бронирования",
              },
              userId: {
                type: "string",
                description: "ID пользователя",
              },
              sessionId: {
                type: "string",
                description: "ID сессии для отслеживания",
              },
              language: {
                type: "string",
                enum: ["ru-RU", "en-US", "th-TH"],
                description: "Язык команды",
                default: "ru-RU",
              },
            },
            required: ["text", "userId", "sessionId"],
          },
        },
        {
          name: "self_test",
          description: "🧪 Самотестирование MCP сервера для проверки всех функций",
          inputSchema: {
            type: "object",
            properties: {
              testType: {
                type: "string",
                enum: ["ping", "parse_command", "voice_booking", "full_cycle"],
                description: "Тип теста для выполнения",
                default: "ping",
              },
              testData: {
                type: "string",
                description: "Тестовые данные для проверки",
                default: "Test data",
              },
            },
          },
        },
      ],
    };
  });

  // 🔧 Обработка вызовов инструментов
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      switch (name) {
        case "ping":
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(await handlePing(args), null, 2),
              },
            ],
          };

        case "parse_voice_command":
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(await handleParseCommand(args), null, 2),
              },
            ],
          };

        case "voice_booking":
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(await handleVoiceBooking(args), null, 2),
              },
            ],
          };

        case "self_test":
          return {
            content: [
              {
                type: "text",
                text: JSON.stringify(await handleSelfTest(args), null, 2),
              },
            ],
          };

        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    } catch (error) {
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              success: false,
              error: error instanceof Error ? error.message : "Unknown error",
              tool: name,
              timestamp: new Date().toISOString(),
            }, null, 2),
          },
        ],
        isError: true,
      };
    }
  });

  return server;
}

/**
 * 🎯 Запуск сервера
 */
async function main() {
  try {
    console.error("🎤 Starting MCP Voice Server...");
    
    const server = await createVoiceServer();
    const transport = new StdioServerTransport();
    
    console.error("✅ Voice Server initialized successfully");
    console.error("🔗 Connecting to transport...");
    
    await server.connect(transport);
    
    console.error("🚀 MCP Voice Server is running!");
    console.error("📋 Available tools: ping, parse_voice_command, voice_booking, self_test");
    
  } catch (error) {
    console.error("❌ Failed to start Voice Server:", error);
    process.exit(1);
  }
}

// Запуск сервера только если файл запущен напрямую
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("💥 Fatal error:", error);
    process.exit(1);
  });
}

export { createVoiceServer, handlePing, handleParseCommand, handleVoiceBooking, handleSelfTest };
