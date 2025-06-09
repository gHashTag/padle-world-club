/**
 * 🎤 Voice AI Service для падл-центра
 * Голосовое управление бронированием кортов
 */

// Типы для Voice AI функций
export interface VoiceToTextResult {
  text: string;
  confidence: number;
  language: string;
  duration: number;
}

export interface TextToVoiceResult {
  audioUrl: string;
  duration: number;
  format: "mp3" | "wav";
  size: number;
}

export interface VoiceBookingRequest {
  command: "book_court" | "cancel_booking" | "check_availability";
  courtType?: "indoor" | "outdoor";
  date?: string;
  time?: string;
  duration?: number;
  playerCount?: number;
  preferences?: string[];
}

export interface VoiceBookingResponse {
  success: boolean;
  bookingId?: string;
  message: string;
  availableSlots?: Array<{
    time: string;
    court: string;
    price: number;
  }>;
  nextSteps?: string[];
}

/**
 * 🎵 Конвертирует голос в текст
 */
export async function voiceToText(
  audioBuffer: ArrayBuffer,
  options?: {
    language?: string;
    enableNoiseReduction?: boolean;
  }
): Promise<VoiceToTextResult> {
  // Валидация входных данных
  if (!audioBuffer || audioBuffer.byteLength === 0) {
    throw new Error("Empty audio buffer provided");
  }

  // Mock реализация для начала
  const mockTexts = [
    "Забронируй корт на завтра в 14:00 на два часа",
    "Отмени мою бронь на завтра",
    "Покажи свободные корты на сегодня вечером",
    "Book a court for tomorrow at 2 PM",
    "จองคอร์ตพรุ่งนี้เวลา 14:00",
  ];

  const randomText = mockTexts[Math.floor(Math.random() * mockTexts.length)];
  const detectedLanguage = options?.language || detectLanguage(randomText);

  // Симуляция обработки
  await new Promise((resolve) => setTimeout(resolve, 100));

  return {
    text: randomText,
    confidence: 0.85 + Math.random() * 0.1, // 0.85-0.95
    language: detectedLanguage,
    duration: audioBuffer.byteLength / 1024, // примерная длительность
  };
}

/**
 * 🔊 Конвертирует текст в голос
 */
export async function textToVoice(
  text: string,
  options?: {
    voice?: string;
    speed?: number;
    emotion?: "neutral" | "excited" | "calm";
  }
): Promise<TextToVoiceResult> {
  if (!text || text.trim().length === 0) {
    throw new Error("Empty text provided");
  }

  // Симуляция обработки
  await new Promise((resolve) => setTimeout(resolve, 150));

  const mockAudioUrl = `https://voice-api.paddle-center.com/audio/${Date.now()}.mp3`;

  return {
    audioUrl: mockAudioUrl,
    duration: Math.ceil(text.length / 10), // примерная длительность
    format: "mp3",
    size: text.length * 50 + (options?.speed ? options.speed * 10 : 0), // используем options
  };
}

/**
 * 🧠 Парсит голосовые команды
 */
export async function parseVoiceCommand(
  text: string
): Promise<VoiceBookingRequest | null> {
  if (!text || text.trim().length === 0) {
    return null;
  }

  const normalizedText = text.toLowerCase().trim();

  // Обработка команд бронирования
  const bookingPatterns = [
    /заброни|заброниру|книгу|book|จอง/i,
    /корт|court|คอร์ต/i,
  ];

  const cancelPatterns = [/отмени|отменить|cancel|ยกเลิก/i, /бронь|booking/i];

  const checkPatterns = [
    /покажи|показать|свободн|доступн|check|available|ดู/i,
    /корт|court|คอร์ต/i,
  ];

  // Проверка команды бронирования
  if (bookingPatterns.every((pattern) => pattern.test(normalizedText))) {
    return {
      command: "book_court",
      courtType: extractCourtType(normalizedText),
      date: extractDate(normalizedText),
      time: extractTime(normalizedText),
      duration: extractDuration(normalizedText),
      playerCount: extractPlayerCount(normalizedText),
    };
  }

  // Проверка команды отмены
  if (cancelPatterns.every((pattern) => pattern.test(normalizedText))) {
    return {
      command: "cancel_booking",
      date: extractDate(normalizedText),
    };
  }

  // Проверка команды проверки доступности
  if (checkPatterns.some((pattern) => pattern.test(normalizedText))) {
    return {
      command: "check_availability",
      date: extractDate(normalizedText),
      courtType: extractCourtType(normalizedText),
    };
  }

  // Не распознанная команда
  return null;
}

/**
 * 📋 Обрабатывает голосовое бронирование
 * DEPRECATED: Используйте VoiceBookingService для реальной интеграции
 */
export async function processVoiceBooking(
  request: VoiceBookingRequest,
  userId: string
): Promise<VoiceBookingResponse> {
  // Валидация входных данных
  if (!request.command || !userId) {
    return {
      success: false,
      message: "Ошибка валидации: неполные данные запроса",
    };
  }

  // Симуляция обработки для обратной совместимости
  await new Promise((resolve) => setTimeout(resolve, 200));

  switch (request.command) {
    case "book_court":
      if (!request.date || !request.time) {
        return {
          success: false,
          message: "Ошибка: укажите дату и время бронирования",
        };
      }

      return {
        success: true,
        bookingId: `mock-booking-${Date.now()}`,
        message: `[MOCK] Корт успешно забронирован на ${request.date} в ${request.time}`,
        nextSteps: [
          "Приходите за 15 минут до начала игры",
          "Оплата при регистрации",
          "Можете отменить за 2 часа до игры",
        ],
      };

    case "check_availability":
      return {
        success: true,
        message: "[MOCK] Доступные слоты для бронирования:",
        availableSlots: [
          { time: "10:00", court: "Корт 1 (крытый)", price: 2000 },
          { time: "14:00", court: "Корт 2 (открытый)", price: 1500 },
          { time: "16:00", court: "Корт 1 (крытый)", price: 2000 },
          { time: "18:00", court: "Корт 3 (открытый)", price: 1800 },
        ],
      };

    case "cancel_booking":
      return {
        success: true,
        message:
          "[MOCK] Бронирование успешно отменено. Возврат средств в течение 24 часов.",
      };

    default:
      return {
        success: false,
        message: "Неизвестная команда",
      };
  }
}

// 🔧 Вспомогательные функции

function detectLanguage(text: string): string {
  const russianPattern = /[а-яё]/i;
  const thaiPattern = /[ก-๙]/;

  if (russianPattern.test(text)) return "ru-RU";
  if (thaiPattern.test(text)) return "th-TH";
  return "en-US";
}

function extractCourtType(text: string): "indoor" | "outdoor" | undefined {
  if (/внутренн|крыт|indoor|covered/i.test(text)) return "indoor";
  if (/открыт|улич|outdoor|outside/i.test(text)) return "outdoor";
  return undefined;
}

function extractDate(text: string): string | undefined {
  if (/завтра|tomorrow|พรุ่งนี้/i.test(text)) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  }
  if (/сегодня|today|วันนี้/i.test(text)) {
    return new Date().toISOString().split("T")[0];
  }

  // Поиск конкретной даты (например, "26 декабря")
  const dateMatch = text.match(
    /(\d{1,2})\s*(декабря|января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября)/i
  );
  if (dateMatch) {
    const day = dateMatch[1];
    const year = new Date().getFullYear();
    // Упрощенное извлечение месяца
    return `${year}-12-${day.padStart(2, "0")}`; // Для примера декабрь
  }

  return undefined;
}

function extractTime(text: string): string | undefined {
  // Поиск времени в формате "14:00", "2 PM", "14 часов"
  const timePatterns = [
    /(\d{1,2}):(\d{2})/,
    /(\d{1,2})\s*(час|pm|am)/i,
    /(\d{1,2})\s*(утра|дня|вечера)/i,
  ];

  for (const pattern of timePatterns) {
    const match = text.match(pattern);
    if (match) {
      let hour = parseInt(match[1]);
      if (match[2] && /pm|дня|вечера/i.test(match[2]) && hour < 12) {
        hour += 12;
      }
      return `${hour.toString().padStart(2, "0")}:00`;
    }
  }

  return undefined;
}

function extractDuration(text: string): number | undefined {
  const durationMatch = text.match(/(\d+)\s*(час|hour)/i);
  if (durationMatch) {
    return parseInt(durationMatch[1]);
  }

  if (/полтора|1.5|1,5/i.test(text)) return 1.5;
  if (/два|2|двух/i.test(text)) return 2;

  return undefined;
}

function extractPlayerCount(text: string): number | undefined {
  const playerMatch = text.match(/(\d+)\s*(игрок|player|คน)/i);
  if (playerMatch) {
    return parseInt(playerMatch[1]);
  }
  return undefined;
}
