import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../../../db/schema";
import {
  bookings,
  NewBooking,
  users,
  NewUser,
  venues,
  NewVenue,
  courts,
  NewCourt
} from "../../../db/schema";
import { BookingRepository } from "../../../repositories/booking-repository";
import dotenv from "dotenv";

// Загружаем переменные окружения из файла .env
dotenv.config();

// Используем тестовую базу данных
const DATABASE_URL_TEST =
  process.env.DATABASE_URL_TEST || process.env.DATABASE_URL;

console.log("DATABASE_URL_TEST:", DATABASE_URL_TEST);

if (!DATABASE_URL_TEST) {
  throw new Error(
    "DATABASE_URL_TEST или DATABASE_URL для тестов не установлена в переменных окружения"
  );
}

const pool = new Pool({
  connectionString: DATABASE_URL_TEST,
});

const db = drizzle(pool, { schema });
const bookingRepository = new BookingRepository(db);

describe("BookingRepository", () => {
  let testUser: schema.User;
  let testVenue: schema.Venue;
  let testCourt: schema.Court;

  // Функция для очистки таблиц перед/после тестов
  const cleanupDatabase = async () => {
    // Очищаем в обратном порядке из-за внешних ключей
    await db.delete(bookings);
    await db.delete(courts);
    await db.delete(venues);
    await db.delete(users);
  };

  beforeEach(async () => {
    await cleanupDatabase();

    // Создаем тестового пользователя
    const userData: NewUser = {
      username: "testuser",
      passwordHash: "hash123",
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      memberId: "MEM001",
      userRole: "player",
    };
    [testUser] = await db.insert(users).values(userData).returning();

    // Создаем тестовую площадку
    const venueData: NewVenue = {
      name: "Test Venue",
      address: "123 Test Street",
      city: "Test City",
      country: "Test Country",
    };
    [testVenue] = await db.insert(venues).values(venueData).returning();

    // Создаем тестовый корт
    const courtData: NewCourt = {
      venueId: testVenue.id,
      name: "Test Court 1",
      courtType: "paddle",
      hourlyRate: "50.00",
    };
    [testCourt] = await db.insert(courts).values(courtData).returning();
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  // Вспомогательная функция для создания тестового бронирования
  const createTestBooking = async (customData: Partial<NewBooking> = {}): Promise<schema.Booking> => {
    const startTime = new Date("2024-01-15T10:00:00Z");
    const endTime = new Date("2024-01-15T12:00:00Z");

    const defaultBookingData: NewBooking = {
      courtId: testCourt.id,
      startTime,
      endTime,
      durationMinutes: 120,
      status: "confirmed",
      totalAmount: "100.00",
      currency: "USD",
      bookedByUserId: testUser.id,
      bookingPurpose: "free_play",
      ...customData,
    };

    return await bookingRepository.create(defaultBookingData);
  };

  describe("create", () => {
    it("должен создавать бронирование с обязательными полями", async () => {
      const startTime = new Date("2024-01-15T10:00:00Z");
      const endTime = new Date("2024-01-15T12:00:00Z");

      const bookingData: NewBooking = {
        courtId: testCourt.id,
        startTime,
        endTime,
        durationMinutes: 120,
        status: "confirmed",
        totalAmount: "100.00",
        currency: "USD",
        bookedByUserId: testUser.id,
        bookingPurpose: "free_play",
      };

      const booking = await bookingRepository.create(bookingData);

      expect(booking).toBeDefined();
      expect(booking.id).toBeDefined();
      expect(booking.courtId).toBe(testCourt.id);
      expect(booking.bookedByUserId).toBe(testUser.id);
      expect(booking.status).toBe("confirmed");
      expect(booking.totalAmount).toBe("100.00");
      expect(booking.currency).toBe("USD");
      expect(booking.durationMinutes).toBe(120);
      expect(booking.bookingPurpose).toBe("free_play");
      expect(booking.startTime).toEqual(startTime);
      expect(booking.endTime).toEqual(endTime);
    });

    it("должен создавать бронирование с опциональными полями", async () => {
      const startTime = new Date("2024-01-15T14:00:00Z");
      const endTime = new Date("2024-01-15T16:00:00Z");

      const bookingData: NewBooking = {
        courtId: testCourt.id,
        startTime,
        endTime,
        durationMinutes: 120,
        status: "pending_payment",
        totalAmount: "150.00",
        currency: "EUR",
        bookedByUserId: testUser.id,
        bookingPurpose: "group_training",
        relatedEntityId: "550e8400-e29b-41d4-a716-446655440000",
        notes: "Групповая тренировка для начинающих",
      };

      const booking = await bookingRepository.create(bookingData);

      expect(booking).toBeDefined();
      expect(booking.status).toBe("pending_payment");
      expect(booking.bookingPurpose).toBe("group_training");
      expect(booking.relatedEntityId).toBe("550e8400-e29b-41d4-a716-446655440000");
      expect(booking.notes).toBe("Групповая тренировка для начинающих");
    });
  });

  describe("getById", () => {
    it("должен возвращать бронирование по ID", async () => {
      const createdBooking = await createTestBooking();

      const booking = await bookingRepository.getById(createdBooking.id);

      expect(booking).toBeDefined();
      expect(booking?.id).toBe(createdBooking.id);
      expect(booking?.courtId).toBe(createdBooking.courtId);
    });

    it("должен возвращать null, если бронирование не найдено", async () => {
      const booking = await bookingRepository.getById("00000000-0000-0000-0000-000000000000");

      expect(booking).toBeNull();
    });
  });

  describe("getByCourtId", () => {
    it("должен возвращать все бронирования для корта", async () => {
      await createTestBooking({
        startTime: new Date("2024-01-15T10:00:00Z"),
        endTime: new Date("2024-01-15T12:00:00Z")
      });
      await createTestBooking({
        startTime: new Date("2024-01-15T14:00:00Z"),
        endTime: new Date("2024-01-15T16:00:00Z")
      });

      const bookings = await bookingRepository.getByCourtId(testCourt.id);

      expect(bookings).toHaveLength(2);
      expect(bookings.every(b => b.courtId === testCourt.id)).toBe(true);
    });

    it("должен возвращать пустой массив, если бронирований нет", async () => {
      const bookings = await bookingRepository.getByCourtId(testCourt.id);

      expect(bookings).toHaveLength(0);
    });
  });

  describe("getByUserId", () => {
    it("должен возвращать все бронирования пользователя", async () => {
      await createTestBooking({
        startTime: new Date("2024-01-15T10:00:00Z"),
        endTime: new Date("2024-01-15T12:00:00Z")
      });
      await createTestBooking({
        startTime: new Date("2024-01-16T10:00:00Z"),
        endTime: new Date("2024-01-16T12:00:00Z")
      });

      const bookings = await bookingRepository.getByUserId(testUser.id);

      expect(bookings).toHaveLength(2);
      expect(bookings.every(b => b.bookedByUserId === testUser.id)).toBe(true);
    });

    it("должен возвращать пустой массив, если бронирований нет", async () => {
      const bookings = await bookingRepository.getByUserId(testUser.id);

      expect(bookings).toHaveLength(0);
    });
  });

  describe("getByCourtAndTimeRange", () => {
    it("должен возвращать бронирования корта в указанном временном диапазоне", async () => {
      // Создаем бронирования в разное время
      await createTestBooking({
        startTime: new Date("2024-01-15T10:00:00Z"),
        endTime: new Date("2024-01-15T12:00:00Z")
      });
      await createTestBooking({
        startTime: new Date("2024-01-15T14:00:00Z"),
        endTime: new Date("2024-01-15T16:00:00Z")
      });
      await createTestBooking({
        startTime: new Date("2024-01-16T10:00:00Z"),
        endTime: new Date("2024-01-16T12:00:00Z")
      });

      // Ищем бронирования в диапазоне 15 января
      const bookings = await bookingRepository.getByCourtAndTimeRange(
        testCourt.id,
        new Date("2024-01-15T09:00:00Z"),
        new Date("2024-01-15T17:00:00Z")
      );

      expect(bookings).toHaveLength(2);
      expect(bookings.every(b => b.courtId === testCourt.id)).toBe(true);
    });

    it("должен возвращать пустой массив, если нет пересекающихся бронирований", async () => {
      await createTestBooking({
        startTime: new Date("2024-01-15T10:00:00Z"),
        endTime: new Date("2024-01-15T12:00:00Z")
      });

      const bookings = await bookingRepository.getByCourtAndTimeRange(
        testCourt.id,
        new Date("2024-01-15T14:00:00Z"),
        new Date("2024-01-15T16:00:00Z")
      );

      expect(bookings).toHaveLength(0);
    });
  });

  describe("getByTimeRange", () => {
    it("должен возвращать все бронирования в указанном временном диапазоне", async () => {
      await createTestBooking({
        startTime: new Date("2024-01-15T10:00:00Z"),
        endTime: new Date("2024-01-15T12:00:00Z")
      });
      await createTestBooking({
        startTime: new Date("2024-01-15T14:00:00Z"),
        endTime: new Date("2024-01-15T16:00:00Z")
      });
      await createTestBooking({
        startTime: new Date("2024-01-16T10:00:00Z"),
        endTime: new Date("2024-01-16T12:00:00Z")
      });

      const bookings = await bookingRepository.getByTimeRange(
        new Date("2024-01-15T08:00:00Z"),
        new Date("2024-01-15T18:00:00Z")
      );

      expect(bookings).toHaveLength(2);
    });
  });

  describe("getAll", () => {
    it("должен возвращать все бронирования", async () => {
      await createTestBooking({
        startTime: new Date("2024-01-15T10:00:00Z"),
        endTime: new Date("2024-01-15T12:00:00Z")
      });
      await createTestBooking({
        startTime: new Date("2024-01-15T14:00:00Z"),
        endTime: new Date("2024-01-15T16:00:00Z")
      });
      await createTestBooking({
        startTime: new Date("2024-01-16T10:00:00Z"),
        endTime: new Date("2024-01-16T12:00:00Z")
      });

      const allBookings = await bookingRepository.getAll();

      expect(allBookings).toHaveLength(3);
    });

    it("должен возвращать пустой массив, если бронирований нет", async () => {
      const allBookings = await bookingRepository.getAll();

      expect(allBookings).toHaveLength(0);
    });
  });

  describe("update", () => {
    it("должен обновлять данные бронирования", async () => {
      const createdBooking = await createTestBooking();

      const updatedBooking = await bookingRepository.update(createdBooking.id, {
        status: "completed",
        notes: "Игра завершена успешно",
        totalAmount: "120.00",
      });

      expect(updatedBooking).toBeDefined();
      expect(updatedBooking?.id).toBe(createdBooking.id);
      expect(updatedBooking?.status).toBe("completed");
      expect(updatedBooking?.notes).toBe("Игра завершена успешно");
      expect(updatedBooking?.totalAmount).toBe("120.00");
      expect(updatedBooking?.courtId).toBe(createdBooking.courtId); // Не изменилось
    });

    it("должен возвращать null при обновлении несуществующего бронирования", async () => {
      const updatedBooking = await bookingRepository.update("00000000-0000-0000-0000-000000000000", {
        status: "completed",
      });

      expect(updatedBooking).toBeNull();
    });
  });

  describe("delete", () => {
    it("должен удалять бронирование", async () => {
      const createdBooking = await createTestBooking();

      const result = await bookingRepository.delete(createdBooking.id);

      expect(result).toBe(true);

      const deletedBooking = await bookingRepository.getById(createdBooking.id);
      expect(deletedBooking).toBeNull();
    });

    it("должен возвращать false при удалении несуществующего бронирования", async () => {
      const result = await bookingRepository.delete("00000000-0000-0000-0000-000000000000");

      expect(result).toBe(false);
    });
  });

  describe("isCourtAvailable", () => {
    it("должен возвращать true, если корт доступен", async () => {
      const isAvailable = await bookingRepository.isCourtAvailable(
        testCourt.id,
        new Date("2024-01-15T10:00:00Z"),
        new Date("2024-01-15T12:00:00Z")
      );

      expect(isAvailable).toBe(true);
    });

    it("должен возвращать false, если корт занят", async () => {
      await createTestBooking({
        startTime: new Date("2024-01-15T10:00:00Z"),
        endTime: new Date("2024-01-15T12:00:00Z")
      });

      const isAvailable = await bookingRepository.isCourtAvailable(
        testCourt.id,
        new Date("2024-01-15T11:00:00Z"),
        new Date("2024-01-15T13:00:00Z")
      );

      expect(isAvailable).toBe(false);
    });

    it("должен исключать указанное бронирование при проверке", async () => {
      const existingBooking = await createTestBooking({
        startTime: new Date("2024-01-15T10:00:00Z"),
        endTime: new Date("2024-01-15T12:00:00Z")
      });

      const isAvailable = await bookingRepository.isCourtAvailable(
        testCourt.id,
        new Date("2024-01-15T11:00:00Z"),
        new Date("2024-01-15T13:00:00Z"),
        existingBooking.id
      );

      expect(isAvailable).toBe(true);
    });

    it("должен возвращать true для неперекрывающихся временных интервалов", async () => {
      await createTestBooking({
        startTime: new Date("2024-01-15T10:00:00Z"),
        endTime: new Date("2024-01-15T12:00:00Z")
      });

      const isAvailable = await bookingRepository.isCourtAvailable(
        testCourt.id,
        new Date("2024-01-15T14:00:00Z"),
        new Date("2024-01-15T16:00:00Z")
      );

      expect(isAvailable).toBe(true);
    });
  });
});
