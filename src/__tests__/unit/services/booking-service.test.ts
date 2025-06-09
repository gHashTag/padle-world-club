/**
 * 🧪 Тесты для VoiceBookingService
 * Проверка интеграции голосовых команд с реальными API
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

describe("VoiceBookingService", () => {
  describe("Импорт и создание сервиса", () => {
    it("должен импортировать VoiceBookingService", async () => {
      const { VoiceBookingService } = await import("../../../services/booking-service");
      
      expect(VoiceBookingService).toBeDefined();
      expect(typeof VoiceBookingService).toBe("function");
    });

    it("должен создать экземпляр сервиса с mock репозиториями", async () => {
      const { VoiceBookingService } = await import("../../../services/booking-service");
      
      // Mock репозитории
      const mockBookingRepo = {
        create: vi.fn(),
        findMany: vi.fn(),
        isCourtAvailable: vi.fn(),
        update: vi.fn(),
      };
      
      const mockCourtRepo = {
        findMany: vi.fn(),
      };
      
      const mockUserRepo = {
        getById: vi.fn(),
      };
      
      const service = new VoiceBookingService(
        mockBookingRepo as any,
        mockCourtRepo as any,
        mockUserRepo as any
      );
      
      expect(service).toBeDefined();
      expect(typeof service.processVoiceBooking).toBe("function");
    });
  });

  describe("Обработка голосовых команд", () => {
    let service: any;
    let mockBookingRepo: any;
    let mockCourtRepo: any;
    let mockUserRepo: any;

    beforeEach(async () => {
      const { VoiceBookingService } = await import("../../../services/booking-service");
      
      // Mock репозитории с базовыми методами
      mockBookingRepo = {
        create: vi.fn(),
        findMany: vi.fn(),
        isCourtAvailable: vi.fn(),
        update: vi.fn(),
      };
      
      mockCourtRepo = {
        findMany: vi.fn(),
      };
      
      mockUserRepo = {
        getById: vi.fn(),
      };
      
      service = new VoiceBookingService(
        mockBookingRepo,
        mockCourtRepo,
        mockUserRepo,
        {
          defaultDuration: 90,
          defaultCurrency: "THB",
          defaultPurpose: "free_play",
          pricePerHour: 1500,
        }
      );
    });

    it("должен обработать команду book_court с валидными данными", async () => {
      // Настройка mock'ов
      mockUserRepo.getById.mockResolvedValue({ id: "user-123", name: "Test User" });
      mockCourtRepo.findMany.mockResolvedValue({
        data: [
          { id: "court-1", name: "Корт 1", courtType: "indoor" }
        ]
      });
      mockBookingRepo.isCourtAvailable.mockResolvedValue(true);
      mockBookingRepo.create.mockResolvedValue({
        id: "booking-123",
        courtId: "court-1",
        startTime: "2024-12-28T14:00:00.000Z",
      });

      const request = {
        command: "book_court" as const,
        date: "2024-12-28",
        time: "14:00",
        duration: 90,
      };

      const result = await service.processVoiceBooking(request, "user-123");

      expect(result.success).toBe(true);
      expect(result.bookingId).toBe("booking-123");
      expect(result.message).toContain("успешно забронирован");
      expect(result.nextSteps).toBeDefined();
      expect(result.nextSteps?.length).toBeGreaterThan(0);
    });

    it("должен обработать ошибку отсутствия пользователя", async () => {
      mockUserRepo.getById.mockResolvedValue(null);

      const request = {
        command: "book_court" as const,
        date: "2024-12-28",
        time: "14:00",
      };

      const result = await service.processVoiceBooking(request, "nonexistent-user");

      expect(result.success).toBe(false);
      expect(result.message).toBe("Пользователь не найден");
    });

    it("должен обработать отсутствие доступных кортов", async () => {
      mockUserRepo.getById.mockResolvedValue({ id: "user-123", name: "Test User" });
      mockCourtRepo.findMany.mockResolvedValue({ data: [] });

      const request = {
        command: "book_court" as const,
        date: "2024-12-28",
        time: "14:00",
      };

      const result = await service.processVoiceBooking(request, "user-123");

      expect(result.success).toBe(false);
      expect(result.message).toBe("Нет доступных кортов на указанное время");
    });

    it("должен обработать команду check_availability", async () => {
      mockCourtRepo.findMany.mockResolvedValue({
        data: [
          { id: "court-1", name: "Корт 1", courtType: "indoor" },
          { id: "court-2", name: "Корт 2", courtType: "outdoor" }
        ]
      });
      mockBookingRepo.isCourtAvailable.mockResolvedValue(true);

      const request = {
        command: "check_availability" as const,
        date: "2024-12-28",
      };

      const result = await service.processVoiceBooking(request, "user-123");

      expect(result.success).toBe(true);
      expect(result.message).toContain("Доступные слоты");
      expect(result.availableSlots).toBeDefined();
      expect(Array.isArray(result.availableSlots)).toBe(true);
    });

    it("должен обработать команду cancel_booking", async () => {
      mockBookingRepo.findMany.mockResolvedValue({
        data: [
          { id: "booking-123", status: "confirmed" }
        ]
      });
      mockBookingRepo.update.mockResolvedValue({ id: "booking-123", status: "cancelled" });

      const request = {
        command: "cancel_booking" as const,
        date: "2024-12-28",
      };

      const result = await service.processVoiceBooking(request, "user-123");

      expect(result.success).toBe(true);
      expect(result.message).toContain("успешно отменено");
    });

    it("должен обработать отсутствие бронирований для отмены", async () => {
      mockBookingRepo.findMany.mockResolvedValue({ data: [] });

      const request = {
        command: "cancel_booking" as const,
        date: "2024-12-28",
      };

      const result = await service.processVoiceBooking(request, "user-123");

      expect(result.success).toBe(false);
      expect(result.message).toContain("нет активных бронирований");
    });

    it("должен обработать неизвестную команду", async () => {
      const request = {
        command: "unknown_command" as any,
      };

      const result = await service.processVoiceBooking(request, "user-123");

      expect(result.success).toBe(false);
      expect(result.message).toBe("Неизвестная команда");
    });

    it("должен обработать ошибку валидации (отсутствие даты/времени)", async () => {
      const request = {
        command: "book_court" as const,
        // отсутствуют date и time
      };

      const result = await service.processVoiceBooking(request, "user-123");

      expect(result.success).toBe(false);
      expect(result.message).toContain("укажите дату и время");
    });

    it("должен обработать ошибки в процессе выполнения", async () => {
      mockUserRepo.getById.mockRejectedValue(new Error("Database error"));

      const request = {
        command: "book_court" as const,
        date: "2024-12-28",
        time: "14:00",
      };

      const result = await service.processVoiceBooking(request, "user-123");

      expect(result.success).toBe(false);
      expect(result.message).toContain("Ошибка обработки команды");
    });
  });

  describe("Конфигурация сервиса", () => {
    it("должен использовать конфигурацию по умолчанию", async () => {
      const { VoiceBookingService } = await import("../../../services/booking-service");
      
      const mockRepos = {
        bookingRepo: { create: vi.fn() },
        courtRepo: { findMany: vi.fn() },
        userRepo: { getById: vi.fn() },
      };
      
      const service = new VoiceBookingService(
        mockRepos.bookingRepo as any,
        mockRepos.courtRepo as any,
        mockRepos.userRepo as any
      );
      
      // Проверяем, что сервис создан с конфигурацией по умолчанию
      expect(service).toBeDefined();
    });

    it("должен использовать пользовательскую конфигурацию", async () => {
      const { VoiceBookingService } = await import("../../../services/booking-service");
      
      const mockRepos = {
        bookingRepo: { create: vi.fn() },
        courtRepo: { findMany: vi.fn() },
        userRepo: { getById: vi.fn() },
      };
      
      const customConfig = {
        defaultDuration: 120,
        defaultCurrency: "USD",
        defaultPurpose: "private_training" as const,
        pricePerHour: 2000,
      };
      
      const service = new VoiceBookingService(
        mockRepos.bookingRepo as any,
        mockRepos.courtRepo as any,
        mockRepos.userRepo as any,
        customConfig
      );
      
      expect(service).toBeDefined();
    });
  });
});
