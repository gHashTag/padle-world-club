import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../../../db/schema";
import {
  bookingParticipants,
  NewBookingParticipant,
  bookings,
  NewBooking,
  users,
  NewUser,
  venues,
  NewVenue,
  courts,
  NewCourt
} from "../../../db/schema";
import { BookingParticipantRepository } from "../../../repositories/booking-participant-repository";
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
const participantRepository = new BookingParticipantRepository(db);

describe("BookingParticipantRepository", () => {
  let testUser1: schema.User;
  let testUser2: schema.User;
  let testVenue: schema.Venue;
  let testCourt: schema.Court;
  let testBooking: schema.Booking;

  // Функция для очистки таблиц перед/после тестов
  const cleanupDatabase = async () => {
    // Очищаем в обратном порядке из-за внешних ключей
    await db.delete(bookingParticipants);
    await db.delete(bookings);
    await db.delete(courts);
    await db.delete(venues);
    await db.delete(users);
  };

  beforeEach(async () => {
    await cleanupDatabase();

    // Создаем тестовых пользователей
    const userData1: NewUser = {
      username: "testuser1",
      passwordHash: "hash123",
      firstName: "Test",
      lastName: "User1",
      email: "test1@example.com",
      memberId: "MEM001",
      userRole: "player",
    };
    [testUser1] = await db.insert(users).values(userData1).returning();

    const userData2: NewUser = {
      username: "testuser2",
      passwordHash: "hash123",
      firstName: "Test",
      lastName: "User2",
      email: "test2@example.com",
      memberId: "MEM002",
      userRole: "player",
    };
    [testUser2] = await db.insert(users).values(userData2).returning();

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

    // Создаем тестовое бронирование
    const bookingData: NewBooking = {
      courtId: testCourt.id,
      startTime: new Date("2024-01-15T10:00:00Z"),
      endTime: new Date("2024-01-15T12:00:00Z"),
      durationMinutes: 120,
      status: "confirmed",
      totalAmount: "100.00",
      currency: "USD",
      bookedByUserId: testUser1.id,
      bookingPurpose: "free_play",
    };
    [testBooking] = await db.insert(bookings).values(bookingData).returning();
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  // Вспомогательная функция для создания тестового участника
  const createTestParticipant = async (customData: Partial<NewBookingParticipant> = {}): Promise<schema.BookingParticipant> => {
    const defaultParticipantData: NewBookingParticipant = {
      bookingId: testBooking.id,
      userId: testUser1.id,
      amountOwed: "50.00",
      amountPaid: "0.00",
      paymentStatus: "pending",
      participationStatus: "registered",
      isHost: false,
      ...customData,
    };

    return await participantRepository.create(defaultParticipantData);
  };

  describe("create", () => {
    it("должен создавать участника с обязательными полями", async () => {
      const participantData: NewBookingParticipant = {
        bookingId: testBooking.id,
        userId: testUser1.id,
        amountOwed: "50.00",
        amountPaid: "0.00",
        paymentStatus: "pending",
        participationStatus: "registered",
        isHost: false,
      };

      const participant = await participantRepository.create(participantData);

      expect(participant).toBeDefined();
      expect(participant.id).toBeDefined();
      expect(participant.bookingId).toBe(testBooking.id);
      expect(participant.userId).toBe(testUser1.id);
      expect(participant.amountOwed).toBe("50.00");
      expect(participant.amountPaid).toBe("0.00");
      expect(participant.paymentStatus).toBe("pending");
      expect(participant.participationStatus).toBe("registered");
      expect(participant.isHost).toBe(false);
    });

    it("должен создавать участника-хоста", async () => {
      const participantData: NewBookingParticipant = {
        bookingId: testBooking.id,
        userId: testUser1.id,
        amountOwed: "100.00",
        amountPaid: "100.00",
        paymentStatus: "success",
        participationStatus: "registered",
        isHost: true,
      };

      const participant = await participantRepository.create(participantData);

      expect(participant).toBeDefined();
      expect(participant.isHost).toBe(true);
      expect(participant.paymentStatus).toBe("success");
      expect(participant.amountPaid).toBe("100.00");
    });
  });

  describe("getById", () => {
    it("должен возвращать участника по ID", async () => {
      const createdParticipant = await createTestParticipant();

      const participant = await participantRepository.getById(createdParticipant.id);

      expect(participant).toBeDefined();
      expect(participant?.id).toBe(createdParticipant.id);
      expect(participant?.bookingId).toBe(createdParticipant.bookingId);
    });

    it("должен возвращать null, если участник не найден", async () => {
      const participant = await participantRepository.getById("00000000-0000-0000-0000-000000000000");

      expect(participant).toBeNull();
    });
  });

  describe("getByBookingAndUser", () => {
    it("должен возвращать участника по ID бронирования и пользователя", async () => {
      const createdParticipant = await createTestParticipant();

      const participant = await participantRepository.getByBookingAndUser(testBooking.id, testUser1.id);

      expect(participant).toBeDefined();
      expect(participant?.id).toBe(createdParticipant.id);
      expect(participant?.bookingId).toBe(testBooking.id);
      expect(participant?.userId).toBe(testUser1.id);
    });

    it("должен возвращать null, если участник не найден", async () => {
      const participant = await participantRepository.getByBookingAndUser(testBooking.id, testUser2.id);

      expect(participant).toBeNull();
    });
  });

  describe("getByBookingId", () => {
    it("должен возвращать всех участников бронирования", async () => {
      await createTestParticipant({ userId: testUser1.id, isHost: true });
      await createTestParticipant({ userId: testUser2.id, isHost: false });

      const participants = await participantRepository.getByBookingId(testBooking.id);

      expect(participants).toHaveLength(2);
      expect(participants.every(p => p.bookingId === testBooking.id)).toBe(true);
      expect(participants.some(p => p.isHost === true)).toBe(true);
      expect(participants.some(p => p.isHost === false)).toBe(true);
    });

    it("должен возвращать пустой массив, если участников нет", async () => {
      const participants = await participantRepository.getByBookingId(testBooking.id);

      expect(participants).toHaveLength(0);
    });
  });

  describe("getByUserId", () => {
    it("должен возвращать все участия пользователя", async () => {
      // Создаем второе бронирование
      const bookingData2: NewBooking = {
        courtId: testCourt.id,
        startTime: new Date("2024-01-16T10:00:00Z"),
        endTime: new Date("2024-01-16T12:00:00Z"),
        durationMinutes: 120,
        status: "confirmed",
        totalAmount: "100.00",
        currency: "USD",
        bookedByUserId: testUser2.id,
        bookingPurpose: "free_play",
      };
      const [testBooking2] = await db.insert(bookings).values(bookingData2).returning();

      await createTestParticipant({ userId: testUser1.id, bookingId: testBooking.id });
      await createTestParticipant({ userId: testUser1.id, bookingId: testBooking2.id });

      const participants = await participantRepository.getByUserId(testUser1.id);

      expect(participants).toHaveLength(2);
      expect(participants.every(p => p.userId === testUser1.id)).toBe(true);
    });

    it("должен возвращать пустой массив, если участий нет", async () => {
      const participants = await participantRepository.getByUserId(testUser2.id);

      expect(participants).toHaveLength(0);
    });
  });

  describe("getHostByBookingId", () => {
    it("должен возвращать хоста бронирования", async () => {
      await createTestParticipant({ userId: testUser1.id, isHost: true });
      await createTestParticipant({ userId: testUser2.id, isHost: false });

      const host = await participantRepository.getHostByBookingId(testBooking.id);

      expect(host).toBeDefined();
      expect(host?.userId).toBe(testUser1.id);
      expect(host?.isHost).toBe(true);
    });

    it("должен возвращать null, если хост не найден", async () => {
      await createTestParticipant({ userId: testUser1.id, isHost: false });

      const host = await participantRepository.getHostByBookingId(testBooking.id);

      expect(host).toBeNull();
    });
  });

  describe("getByBookingAndPaymentStatus", () => {
    it("должен возвращать участников с определенным статусом оплаты", async () => {
      await createTestParticipant({ userId: testUser1.id, paymentStatus: "success" });
      await createTestParticipant({ userId: testUser2.id, paymentStatus: "pending" });

      const paidParticipants = await participantRepository.getByBookingAndPaymentStatus(testBooking.id, "success");
      const pendingParticipants = await participantRepository.getByBookingAndPaymentStatus(testBooking.id, "pending");

      expect(paidParticipants).toHaveLength(1);
      expect(paidParticipants[0].userId).toBe(testUser1.id);
      expect(paidParticipants[0].paymentStatus).toBe("success");

      expect(pendingParticipants).toHaveLength(1);
      expect(pendingParticipants[0].userId).toBe(testUser2.id);
      expect(pendingParticipants[0].paymentStatus).toBe("pending");
    });

    it("должен возвращать пустой массив, если участников с таким статусом нет", async () => {
      await createTestParticipant({ paymentStatus: "pending" });

      const participants = await participantRepository.getByBookingAndPaymentStatus(testBooking.id, "success");

      expect(participants).toHaveLength(0);
    });
  });

  describe("getByBookingAndParticipationStatus", () => {
    it("должен возвращать участников с определенным статусом участия", async () => {
      await createTestParticipant({ userId: testUser1.id, participationStatus: "attended" });
      await createTestParticipant({ userId: testUser2.id, participationStatus: "no_show" });

      const attendedParticipants = await participantRepository.getByBookingAndParticipationStatus(testBooking.id, "attended");
      const noShowParticipants = await participantRepository.getByBookingAndParticipationStatus(testBooking.id, "no_show");

      expect(attendedParticipants).toHaveLength(1);
      expect(attendedParticipants[0].userId).toBe(testUser1.id);
      expect(attendedParticipants[0].participationStatus).toBe("attended");

      expect(noShowParticipants).toHaveLength(1);
      expect(noShowParticipants[0].userId).toBe(testUser2.id);
      expect(noShowParticipants[0].participationStatus).toBe("no_show");
    });

    it("должен возвращать пустой массив, если участников с таким статусом нет", async () => {
      await createTestParticipant({ participationStatus: "registered" });

      const participants = await participantRepository.getByBookingAndParticipationStatus(testBooking.id, "attended");

      expect(participants).toHaveLength(0);
    });
  });

  describe("getAll", () => {
    it("должен возвращать всех участников", async () => {
      await createTestParticipant({ userId: testUser1.id });
      await createTestParticipant({ userId: testUser2.id });

      const allParticipants = await participantRepository.getAll();

      expect(allParticipants).toHaveLength(2);
    });

    it("должен возвращать пустой массив, если участников нет", async () => {
      const allParticipants = await participantRepository.getAll();

      expect(allParticipants).toHaveLength(0);
    });
  });

  describe("update", () => {
    it("должен обновлять данные участника", async () => {
      const createdParticipant = await createTestParticipant();

      const updatedParticipant = await participantRepository.update(createdParticipant.id, {
        amountPaid: "50.00",
        paymentStatus: "success",
        participationStatus: "attended",
      });

      expect(updatedParticipant).toBeDefined();
      expect(updatedParticipant?.id).toBe(createdParticipant.id);
      expect(updatedParticipant?.amountPaid).toBe("50.00");
      expect(updatedParticipant?.paymentStatus).toBe("success");
      expect(updatedParticipant?.participationStatus).toBe("attended");
      expect(updatedParticipant?.bookingId).toBe(createdParticipant.bookingId); // Не изменилось
    });

    it("должен возвращать null при обновлении несуществующего участника", async () => {
      const updatedParticipant = await participantRepository.update("00000000-0000-0000-0000-000000000000", {
        paymentStatus: "success",
      });

      expect(updatedParticipant).toBeNull();
    });
  });

  describe("updatePaymentStatus", () => {
    it("должен обновлять статус оплаты и сумму", async () => {
      const createdParticipant = await createTestParticipant();

      const updatedParticipant = await participantRepository.updatePaymentStatus(
        createdParticipant.id,
        "success",
        "50.00"
      );

      expect(updatedParticipant).toBeDefined();
      expect(updatedParticipant?.paymentStatus).toBe("success");
      expect(updatedParticipant?.amountPaid).toBe("50.00");
    });

    it("должен обновлять только статус оплаты без суммы", async () => {
      const createdParticipant = await createTestParticipant();

      const updatedParticipant = await participantRepository.updatePaymentStatus(
        createdParticipant.id,
        "failed"
      );

      expect(updatedParticipant).toBeDefined();
      expect(updatedParticipant?.paymentStatus).toBe("failed");
      expect(updatedParticipant?.amountPaid).toBe("0.00"); // Не изменилось
    });
  });

  describe("updateParticipationStatus", () => {
    it("должен обновлять статус участия", async () => {
      const createdParticipant = await createTestParticipant();

      const updatedParticipant = await participantRepository.updateParticipationStatus(
        createdParticipant.id,
        "attended"
      );

      expect(updatedParticipant).toBeDefined();
      expect(updatedParticipant?.participationStatus).toBe("attended");
    });
  });

  describe("delete", () => {
    it("должен удалять участника", async () => {
      const createdParticipant = await createTestParticipant();

      const result = await participantRepository.delete(createdParticipant.id);

      expect(result).toBe(true);

      const deletedParticipant = await participantRepository.getById(createdParticipant.id);
      expect(deletedParticipant).toBeNull();
    });

    it("должен возвращать false при удалении несуществующего участника", async () => {
      const result = await participantRepository.delete("00000000-0000-0000-0000-000000000000");

      expect(result).toBe(false);
    });
  });

  describe("deleteAllByBookingId", () => {
    it("должен удалять всех участников бронирования", async () => {
      await createTestParticipant({ userId: testUser1.id });
      await createTestParticipant({ userId: testUser2.id });

      const deletedCount = await participantRepository.deleteAllByBookingId(testBooking.id);

      expect(deletedCount).toBe(2);

      const remainingParticipants = await participantRepository.getByBookingId(testBooking.id);
      expect(remainingParticipants).toHaveLength(0);
    });

    it("должен возвращать 0, если участников для удаления нет", async () => {
      const deletedCount = await participantRepository.deleteAllByBookingId(testBooking.id);

      expect(deletedCount).toBe(0);
    });
  });

  describe("getPaymentStats", () => {
    it("должен возвращать статистику по оплатам", async () => {
      await createTestParticipant({
        userId: testUser1.id,
        amountOwed: "50.00",
        amountPaid: "50.00"
      });
      await createTestParticipant({
        userId: testUser2.id,
        amountOwed: "30.00",
        amountPaid: "15.00"
      });

      const stats = await participantRepository.getPaymentStats(testBooking.id);

      expect(stats.totalOwed).toBe("80.00");
      expect(stats.totalPaid).toBe("65.00");
      expect(stats.participantCount).toBe(2);
      expect(stats.fullyPaidCount).toBe(1);
    });

    it("должен возвращать нулевую статистику для пустого бронирования", async () => {
      const stats = await participantRepository.getPaymentStats(testBooking.id);

      expect(stats.totalOwed).toBe("0.00");
      expect(stats.totalPaid).toBe("0.00");
      expect(stats.participantCount).toBe(0);
      expect(stats.fullyPaidCount).toBe(0);
    });
  });

  describe("isUserParticipant", () => {
    it("должен возвращать true, если пользователь является участником", async () => {
      await createTestParticipant({ userId: testUser1.id });

      const isParticipant = await participantRepository.isUserParticipant(testBooking.id, testUser1.id);

      expect(isParticipant).toBe(true);
    });

    it("должен возвращать false, если пользователь не является участником", async () => {
      const isParticipant = await participantRepository.isUserParticipant(testBooking.id, testUser2.id);

      expect(isParticipant).toBe(false);
    });
  });

  describe("isUserHost", () => {
    it("должен возвращать true, если пользователь является хостом", async () => {
      await createTestParticipant({ userId: testUser1.id, isHost: true });

      const isHost = await participantRepository.isUserHost(testBooking.id, testUser1.id);

      expect(isHost).toBe(true);
    });

    it("должен возвращать false, если пользователь не является хостом", async () => {
      await createTestParticipant({ userId: testUser1.id, isHost: false });

      const isHost = await participantRepository.isUserHost(testBooking.id, testUser1.id);

      expect(isHost).toBe(false);
    });

    it("должен возвращать false, если пользователь не является участником", async () => {
      const isHost = await participantRepository.isUserHost(testBooking.id, testUser2.id);

      expect(isHost).toBe(false);
    });
  });
});
