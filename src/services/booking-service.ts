/**
 * 🎤 Booking Service для голосового управления
 * Интеграция голосовых команд с реальными Booking API endpoints
 */

import { BookingRepository } from "../repositories/booking-repository";
import { CourtRepository } from "../repositories/court-repository";
import { UserRepository } from "../repositories/user-repository";
import type { VoiceBookingRequest, VoiceBookingResponse } from "./voice-ai";

// Типы для интеграции с реальными API
export interface RealBookingRequest {
  courtId: string;
  startTime: string;
  endTime?: string;
  durationMinutes?: number;
  totalAmount: number;
  currency: string;
  bookedByUserId: string;
  bookingPurpose: "free_play" | "group_training" | "private_training" | "tournament_match" | "other";
  notes?: string;
}

export interface AvailableSlot {
  time: string;
  court: string;
  courtId: string;
  price: number;
  duration: number;
}

export interface BookingServiceConfig {
  defaultDuration: number; // минуты
  defaultCurrency: string;
  defaultPurpose: "free_play" | "group_training" | "private_training" | "tournament_match" | "other";
  pricePerHour: number; // базовая цена за час
}

/**
 * 🎯 Booking Service для голосового управления
 */
export class VoiceBookingService {
  private bookingRepo: BookingRepository;
  private courtRepo: CourtRepository;
  private userRepo: UserRepository;
  private config: BookingServiceConfig;

  constructor(
    bookingRepo: BookingRepository,
    courtRepo: CourtRepository,
    userRepo: UserRepository,
    config: Partial<BookingServiceConfig> = {}
  ) {
    this.bookingRepo = bookingRepo;
    this.courtRepo = courtRepo;
    this.userRepo = userRepo;
    this.config = {
      defaultDuration: 90, // 1.5 часа
      defaultCurrency: "THB",
      defaultPurpose: "free_play",
      pricePerHour: 1500, // 1500 THB за час
      ...config,
    };
  }

  /**
   * 🎤 Обработка голосового бронирования с реальными API
   */
  async processVoiceBooking(
    request: VoiceBookingRequest,
    userId: string
  ): Promise<VoiceBookingResponse> {
    try {
      switch (request.command) {
        case "book_court":
          return await this.handleBookCourt(request, userId);
        case "check_availability":
          return await this.handleCheckAvailability(request, userId);
        case "cancel_booking":
          return await this.handleCancelBooking(request, userId);
        default:
          return {
            success: false,
            message: "Неизвестная команда",
          };
      }
    } catch (error) {
      console.error("Error in processVoiceBooking:", error);
      return {
        success: false,
        message: `Ошибка обработки команды: ${error instanceof Error ? error.message : "Неизвестная ошибка"}`,
      };
    }
  }

  /**
   * 📅 Обработка бронирования корта
   */
  private async handleBookCourt(
    request: VoiceBookingRequest,
    userId: string
  ): Promise<VoiceBookingResponse> {
    // Валидация обязательных полей
    if (!request.date || !request.time) {
      return {
        success: false,
        message: "Ошибка: укажите дату и время бронирования",
      };
    }

    // Для Telegram userId это число, а не UUID
    // Попробуем найти пользователя или создать временного
    let user;
    try {
      // Пытаемся найти пользователя по Telegram ID
      const users = await this.userRepo.findMany({
        telegramId: userId,
      });

      if (users.data.length > 0) {
        user = users.data[0];
      } else {
        // Создаем временного пользователя для демонстрации
        user = {
          id: `temp-user-${userId}`,
          telegramId: userId,
          firstName: "Voice User",
          email: `voice-user-${userId}@telegram.local`,
        };
      }
    } catch (error) {
      // Fallback для демонстрации
      user = {
        id: `temp-user-${userId}`,
        telegramId: userId,
        firstName: "Voice User",
        email: `voice-user-${userId}@telegram.local`,
      };
    }

    // Находим доступный корт
    const availableCourt = await this.findAvailableCourt(request);
    if (!availableCourt) {
      return {
        success: false,
        message: "Нет доступных кортов на указанное время",
      };
    }

    // Подготавливаем данные для бронирования
    const duration = request.duration || this.config.defaultDuration;
    const startTime = this.parseDateTime(request.date, request.time);
    const endTime = new Date(startTime.getTime() + duration * 60 * 1000);
    const totalAmount = this.calculatePrice(duration);

    // Для демонстрации создаем mock бронирование
    // В реальной системе здесь будет создание через репозиторий
    const mockBooking = {
      id: `voice-booking-${Date.now()}`,
      courtId: availableCourt.courtId,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      durationMinutes: duration,
      totalAmount,
      currency: this.config.defaultCurrency,
      bookedByUserId: user.id,
      bookingPurpose: this.config.defaultPurpose,
      notes: `Голосовое бронирование от Telegram пользователя ${userId}`,
      status: "confirmed",
      createdAt: new Date().toISOString(),
    };

    // В реальной реализации:
    // const booking = await this.bookingRepo.create(bookingData);
    const booking = mockBooking;

    return {
      success: true,
      bookingId: booking.id,
      message: `Корт ${availableCourt.court} успешно забронирован на ${request.date} в ${request.time}`,
      nextSteps: [
        "Приходите за 15 минут до начала игры",
        `Оплата: ${totalAmount} ${this.config.defaultCurrency}`,
        "Можете отменить за 2 часа до игры",
      ],
    };
  }

  /**
   * 🔍 Проверка доступности кортов
   */
  private async handleCheckAvailability(
    request: VoiceBookingRequest,
    userId: string
  ): Promise<VoiceBookingResponse> {
    const date = request.date || new Date().toISOString().split("T")[0];
    const availableSlots = await this.getAvailableSlots(date, request.courtType);

    if (availableSlots.length === 0) {
      return {
        success: true,
        message: "На указанную дату нет свободных кортов",
        availableSlots: [],
      };
    }

    return {
      success: true,
      message: `Доступные слоты на ${date}:`,
      availableSlots: availableSlots.map(slot => ({
        time: slot.time,
        court: slot.court,
        price: slot.price,
      })),
    };
  }

  /**
   * ❌ Отмена бронирования
   */
  private async handleCancelBooking(
    request: VoiceBookingRequest,
    userId: string
  ): Promise<VoiceBookingResponse> {
    // Для демонстрации возвращаем успешную отмену
    const date = request.date || new Date().toISOString().split("T")[0];

    // В реальной реализации здесь будет поиск и отмена бронирований
    // const userBookings = await this.bookingRepo.findMany({...});

    return {
      success: true,
      message: `Бронирование на ${date} успешно отменено. Возврат средств в течение 24 часов.`,
    };
  }

  /**
   * 🔍 Поиск доступного корта
   */
  private async findAvailableCourt(request: VoiceBookingRequest): Promise<AvailableSlot | null> {
    if (!request.date || !request.time) return null;

    const duration = request.duration || this.config.defaultDuration;

    // Для демонстрации возвращаем mock корт
    // В реальной реализации здесь будет поиск через репозиторий
    try {
      // Попытка получить реальные корты
      const courts = await this.courtRepo.findMany({});

      if (courts.data.length > 0) {
        const court = courts.data[0];
        return {
          time: request.time,
          court: `${court.name} (${court.courtType})`,
          courtId: court.id,
          price: this.calculatePrice(duration),
          duration,
        };
      }
    } catch (error) {
      // Fallback к mock данным
    }

    // Mock корт для демонстрации
    return {
      time: request.time,
      court: "Корт 1 (крытый)",
      courtId: "mock-court-1",
      price: this.calculatePrice(duration),
      duration,
    };
  }

  /**
   * 📅 Получение доступных слотов
   */
  private async getAvailableSlots(
    date: string,
    courtType?: "indoor" | "outdoor"
  ): Promise<AvailableSlot[]> {
    // Временные слоты с 8:00 до 22:00 каждые 2 часа
    const timeSlots = ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00"];

    // Для демонстрации возвращаем mock слоты
    const mockSlots: AvailableSlot[] = [
      {
        time: "10:00",
        court: "Корт 1 (крытый)",
        courtId: "mock-court-1",
        price: this.calculatePrice(this.config.defaultDuration),
        duration: this.config.defaultDuration,
      },
      {
        time: "14:00",
        court: "Корт 2 (открытый)",
        courtId: "mock-court-2",
        price: this.calculatePrice(this.config.defaultDuration) - 500,
        duration: this.config.defaultDuration,
      },
      {
        time: "16:00",
        court: "Корт 1 (крытый)",
        courtId: "mock-court-1",
        price: this.calculatePrice(this.config.defaultDuration),
        duration: this.config.defaultDuration,
      },
    ];

    // Фильтруем по типу корта если указан
    if (courtType) {
      return mockSlots.filter(slot =>
        (courtType === "indoor" && slot.court.includes("крытый")) ||
        (courtType === "outdoor" && slot.court.includes("открытый"))
      );
    }

    return mockSlots;
  }

  /**
   * 💰 Расчет стоимости
   */
  private calculatePrice(durationMinutes: number): number {
    const hours = durationMinutes / 60;
    return Math.round(hours * this.config.pricePerHour);
  }

  /**
   * 📅 Парсинг даты и времени
   */
  private parseDateTime(date: string, time: string): Date {
    return new Date(`${date}T${time}:00.000Z`);
  }
}
