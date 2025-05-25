import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../../../db/schema";
import {
  payments,
  NewPayment,
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
import { PaymentRepository } from "../../../repositories/payment-repository";
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
const paymentRepository = new PaymentRepository(db);

describe("PaymentRepository", () => {
  let testUser1: schema.User;
  let testUser2: schema.User;
  let testVenue: schema.Venue;
  let testCourt: schema.Court;
  let testBooking: schema.Booking;
  let testBookingParticipant: schema.BookingParticipant;

  // Функция для очистки таблиц перед/после тестов
  const cleanupDatabase = async () => {
    // Очищаем в обратном порядке из-за внешних ключей
    await db.delete(payments);
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

    // Создаем тестового участника бронирования
    const participantData: NewBookingParticipant = {
      bookingId: testBooking.id,
      userId: testUser1.id,
      amountOwed: "50.00",
      amountPaid: "0.00",
      paymentStatus: "pending",
      participationStatus: "registered",
      isHost: true,
    };
    [testBookingParticipant] = await db.insert(bookingParticipants).values(participantData).returning();
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  // Вспомогательная функция для создания тестового платежа
  const createTestPayment = async (customData: Partial<NewPayment> = {}): Promise<schema.Payment> => {
    const defaultPaymentData: NewPayment = {
      userId: testUser1.id,
      amount: "50.00",
      currency: "USD",
      status: "success",
      paymentMethod: "card",
      description: "Test payment",
      relatedBookingParticipantId: testBookingParticipant.id,
      ...customData,
    };

    return await paymentRepository.create(defaultPaymentData);
  };

  describe("create", () => {
    it("должен создавать платеж с обязательными полями", async () => {
      const paymentData: NewPayment = {
        userId: testUser1.id,
        amount: "50.00",
        currency: "USD",
        status: "success",
        paymentMethod: "card",
        description: "Test payment",
      };

      const payment = await paymentRepository.create(paymentData);

      expect(payment).toBeDefined();
      expect(payment.id).toBeDefined();
      expect(payment.userId).toBe(testUser1.id);
      expect(payment.amount).toBe("50.00");
      expect(payment.currency).toBe("USD");
      expect(payment.status).toBe("success");
      expect(payment.paymentMethod).toBe("card");
      expect(payment.description).toBe("Test payment");
    });

    it("должен создавать платеж с полиморфными связями", async () => {
      const paymentData: NewPayment = {
        userId: testUser1.id,
        amount: "100.00",
        currency: "EUR",
        status: "pending",
        paymentMethod: "bank_transfer",
        gatewayTransactionId: "TXN123456",
        description: "Payment for booking",
        relatedBookingParticipantId: testBookingParticipant.id,
      };

      const payment = await paymentRepository.create(paymentData);

      expect(payment).toBeDefined();
      expect(payment.gatewayTransactionId).toBe("TXN123456");
      expect(payment.relatedBookingParticipantId).toBe(testBookingParticipant.id);
      expect(payment.status).toBe("pending");
      expect(payment.paymentMethod).toBe("bank_transfer");
    });
  });

  describe("getById", () => {
    it("должен возвращать платеж по ID", async () => {
      const createdPayment = await createTestPayment();

      const payment = await paymentRepository.getById(createdPayment.id);

      expect(payment).toBeDefined();
      expect(payment?.id).toBe(createdPayment.id);
      expect(payment?.userId).toBe(createdPayment.userId);
    });

    it("должен возвращать null, если платеж не найден", async () => {
      const payment = await paymentRepository.getById("00000000-0000-0000-0000-000000000000");

      expect(payment).toBeNull();
    });
  });

  describe("getByUserId", () => {
    it("должен возвращать все платежи пользователя", async () => {
      await createTestPayment({ userId: testUser1.id, amount: "25.00" });
      await createTestPayment({ userId: testUser1.id, amount: "75.00" });
      await createTestPayment({ userId: testUser2.id, amount: "100.00" });

      const payments = await paymentRepository.getByUserId(testUser1.id);

      expect(payments).toHaveLength(2);
      expect(payments.every(p => p.userId === testUser1.id)).toBe(true);
      expect(payments[0].amount).toBe("75.00"); // Последний созданный должен быть первым (desc order)
    });

    it("должен возвращать пустой массив, если платежей нет", async () => {
      const payments = await paymentRepository.getByUserId(testUser2.id);

      expect(payments).toHaveLength(0);
    });
  });

  describe("getByStatus", () => {
    it("должен возвращать платежи с определенным статусом", async () => {
      await createTestPayment({ status: "success", amount: "50.00" });
      await createTestPayment({ status: "pending", amount: "75.00" });
      await createTestPayment({ status: "success", amount: "100.00" });

      const successPayments = await paymentRepository.getByStatus("success");
      const pendingPayments = await paymentRepository.getByStatus("pending");

      expect(successPayments).toHaveLength(2);
      expect(successPayments.every(p => p.status === "success")).toBe(true);

      expect(pendingPayments).toHaveLength(1);
      expect(pendingPayments[0].status).toBe("pending");
    });

    it("должен возвращать пустой массив, если платежей с таким статусом нет", async () => {
      await createTestPayment({ status: "success" });

      const failedPayments = await paymentRepository.getByStatus("failed");

      expect(failedPayments).toHaveLength(0);
    });
  });

  describe("getByPaymentMethod", () => {
    it("должен возвращать платежи по методу оплаты", async () => {
      await createTestPayment({ paymentMethod: "card", amount: "50.00" });
      await createTestPayment({ paymentMethod: "cash", amount: "75.00" });
      await createTestPayment({ paymentMethod: "card", amount: "100.00" });

      const cardPayments = await paymentRepository.getByPaymentMethod("card");
      const cashPayments = await paymentRepository.getByPaymentMethod("cash");

      expect(cardPayments).toHaveLength(2);
      expect(cardPayments.every(p => p.paymentMethod === "card")).toBe(true);

      expect(cashPayments).toHaveLength(1);
      expect(cashPayments[0].paymentMethod).toBe("cash");
    });
  });

  describe("getByUserAndStatus", () => {
    it("должен возвращать платежи пользователя с определенным статусом", async () => {
      await createTestPayment({ userId: testUser1.id, status: "success" });
      await createTestPayment({ userId: testUser1.id, status: "pending" });
      await createTestPayment({ userId: testUser2.id, status: "success" });

      const user1SuccessPayments = await paymentRepository.getByUserAndStatus(testUser1.id, "success");
      const user1PendingPayments = await paymentRepository.getByUserAndStatus(testUser1.id, "pending");

      expect(user1SuccessPayments).toHaveLength(1);
      expect(user1SuccessPayments[0].userId).toBe(testUser1.id);
      expect(user1SuccessPayments[0].status).toBe("success");

      expect(user1PendingPayments).toHaveLength(1);
      expect(user1PendingPayments[0].userId).toBe(testUser1.id);
      expect(user1PendingPayments[0].status).toBe("pending");
    });
  });

  describe("getByAmountRange", () => {
    it("должен возвращать платежи в диапазоне сумм", async () => {
      await createTestPayment({ amount: "25.00", currency: "USD" });
      await createTestPayment({ amount: "50.00", currency: "USD" });
      await createTestPayment({ amount: "75.00", currency: "USD" });
      await createTestPayment({ amount: "100.00", currency: "USD" });

      const paymentsInRange = await paymentRepository.getByAmountRange("40.00", "80.00", "USD");

      expect(paymentsInRange).toHaveLength(2);
      expect(paymentsInRange.some(p => p.amount === "50.00")).toBe(true);
      expect(paymentsInRange.some(p => p.amount === "75.00")).toBe(true);
    });

    it("должен фильтровать по валюте", async () => {
      await createTestPayment({ amount: "50.00", currency: "USD" });
      await createTestPayment({ amount: "50.00", currency: "EUR" });

      const usdPayments = await paymentRepository.getByAmountRange("0.00", "100.00", "USD");
      const eurPayments = await paymentRepository.getByAmountRange("0.00", "100.00", "EUR");

      expect(usdPayments).toHaveLength(1);
      expect(usdPayments[0].currency).toBe("USD");

      expect(eurPayments).toHaveLength(1);
      expect(eurPayments[0].currency).toBe("EUR");
    });
  });

  describe("getByDateRange", () => {
    it("должен возвращать платежи в временном диапазоне", async () => {
      const now = new Date();
      const startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 часа назад
      const endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 часа вперед

      await createTestPayment({ amount: "50.00" });

      const paymentsInRange = await paymentRepository.getByDateRange(startDate, endDate);

      expect(paymentsInRange).toHaveLength(1);
    });
  });

  describe("getByBookingParticipantId", () => {
    it("должен возвращать платежи связанные с участником бронирования", async () => {
      await createTestPayment({ relatedBookingParticipantId: testBookingParticipant.id });
      await createTestPayment({ relatedBookingParticipantId: null });

      const participantPayments = await paymentRepository.getByBookingParticipantId(testBookingParticipant.id);

      expect(participantPayments).toHaveLength(1);
      expect(participantPayments[0].relatedBookingParticipantId).toBe(testBookingParticipant.id);
    });
  });

  describe("getByOrderId", () => {
    it("должен возвращать платежи связанные с заказом", async () => {
      const orderId = "550e8400-e29b-41d4-a716-446655440000"; // Валидный UUID
      await createTestPayment({ relatedOrderId: orderId });
      await createTestPayment({ relatedOrderId: null });

      const orderPayments = await paymentRepository.getByOrderId(orderId);

      expect(orderPayments).toHaveLength(1);
      expect(orderPayments[0].relatedOrderId).toBe(orderId);
    });
  });

  describe("getByUserTrainingPackageId", () => {
    it("должен возвращать платежи связанные с пакетом тренировок", async () => {
      const packageId = "660e8400-e29b-41d4-a716-446655440000"; // Валидный UUID
      await createTestPayment({ relatedUserTrainingPackageId: packageId });
      await createTestPayment({ relatedUserTrainingPackageId: null });

      const packagePayments = await paymentRepository.getByUserTrainingPackageId(packageId);

      expect(packagePayments).toHaveLength(1);
      expect(packagePayments[0].relatedUserTrainingPackageId).toBe(packageId);
    });
  });

  describe("getByGatewayTransactionId", () => {
    it("должен возвращать платеж по ID транзакции платежного шлюза", async () => {
      const transactionId = "TXN123456";
      const createdPayment = await createTestPayment({ gatewayTransactionId: transactionId });

      const payment = await paymentRepository.getByGatewayTransactionId(transactionId);

      expect(payment).toBeDefined();
      expect(payment?.id).toBe(createdPayment.id);
      expect(payment?.gatewayTransactionId).toBe(transactionId);
    });

    it("должен возвращать null, если платеж не найден", async () => {
      const payment = await paymentRepository.getByGatewayTransactionId("NONEXISTENT");

      expect(payment).toBeNull();
    });
  });

  describe("getAll", () => {
    it("должен возвращать все платежи", async () => {
      await createTestPayment({ amount: "25.00" });
      await createTestPayment({ amount: "50.00" });

      const allPayments = await paymentRepository.getAll();

      expect(allPayments).toHaveLength(2);
    });

    it("должен возвращать пустой массив, если платежей нет", async () => {
      const allPayments = await paymentRepository.getAll();

      expect(allPayments).toHaveLength(0);
    });
  });

  describe("update", () => {
    it("должен обновлять данные платежа", async () => {
      const createdPayment = await createTestPayment();

      const updatedPayment = await paymentRepository.update(createdPayment.id, {
        amount: "75.00",
        status: "pending",
        description: "Updated payment",
      });

      expect(updatedPayment).toBeDefined();
      expect(updatedPayment?.id).toBe(createdPayment.id);
      expect(updatedPayment?.amount).toBe("75.00");
      expect(updatedPayment?.status).toBe("pending");
      expect(updatedPayment?.description).toBe("Updated payment");
      expect(updatedPayment?.userId).toBe(createdPayment.userId); // Не изменилось
    });

    it("должен возвращать null при обновлении несуществующего платежа", async () => {
      const updatedPayment = await paymentRepository.update("00000000-0000-0000-0000-000000000000", {
        status: "success",
      });

      expect(updatedPayment).toBeNull();
    });
  });

  describe("updateStatus", () => {
    it("должен обновлять статус платежа", async () => {
      const createdPayment = await createTestPayment({ status: "pending" });

      const updatedPayment = await paymentRepository.updateStatus(createdPayment.id, "success");

      expect(updatedPayment).toBeDefined();
      expect(updatedPayment?.status).toBe("success");
    });
  });

  describe("updateGatewayTransactionId", () => {
    it("должен обновлять ID транзакции платежного шлюза", async () => {
      const createdPayment = await createTestPayment();

      const updatedPayment = await paymentRepository.updateGatewayTransactionId(
        createdPayment.id,
        "NEW_TXN_123"
      );

      expect(updatedPayment).toBeDefined();
      expect(updatedPayment?.gatewayTransactionId).toBe("NEW_TXN_123");
    });
  });

  describe("delete", () => {
    it("должен удалять платеж", async () => {
      const createdPayment = await createTestPayment();

      const result = await paymentRepository.delete(createdPayment.id);

      expect(result).toBe(true);

      const deletedPayment = await paymentRepository.getById(createdPayment.id);
      expect(deletedPayment).toBeNull();
    });

    it("должен возвращать false при удалении несуществующего платежа", async () => {
      const result = await paymentRepository.delete("00000000-0000-0000-0000-000000000000");

      expect(result).toBe(false);
    });
  });

  describe("getUserPaymentStats", () => {
    it("должен возвращать статистику платежей пользователя", async () => {
      await createTestPayment({
        userId: testUser1.id,
        amount: "50.00",
        status: "success"
      });
      await createTestPayment({
        userId: testUser1.id,
        amount: "30.00",
        status: "success"
      });
      await createTestPayment({
        userId: testUser1.id,
        amount: "20.00",
        status: "failed"
      });
      await createTestPayment({
        userId: testUser1.id,
        amount: "40.00",
        status: "pending"
      });

      const stats = await paymentRepository.getUserPaymentStats(testUser1.id);

      expect(stats.totalAmount).toBe("80.00"); // Только успешные платежи
      expect(stats.successfulPayments).toBe(2);
      expect(stats.failedPayments).toBe(1);
      expect(stats.pendingPayments).toBe(1);
      expect(stats.totalPayments).toBe(4);
    });

    it("должен возвращать нулевую статистику для пользователя без платежей", async () => {
      const stats = await paymentRepository.getUserPaymentStats(testUser2.id);

      expect(stats.totalAmount).toBe("0.00");
      expect(stats.successfulPayments).toBe(0);
      expect(stats.failedPayments).toBe(0);
      expect(stats.pendingPayments).toBe(0);
      expect(stats.totalPayments).toBe(0);
    });
  });

  describe("getOverallStats", () => {
    it("должен возвращать общую статистику платежей", async () => {
      await createTestPayment({ amount: "100.00", status: "success", currency: "USD" });
      await createTestPayment({ amount: "50.00", status: "success", currency: "USD" });
      await createTestPayment({ amount: "25.00", status: "failed", currency: "USD" });
      await createTestPayment({ amount: "75.00", status: "pending", currency: "USD" });

      const stats = await paymentRepository.getOverallStats();

      expect(stats.totalAmount).toBe("150.00"); // Только успешные платежи
      expect(stats.successfulPayments).toBe(2);
      expect(stats.failedPayments).toBe(1);
      expect(stats.pendingPayments).toBe(1);
      expect(stats.totalPayments).toBe(4);
      expect(stats.averagePayment).toBe("75.00"); // 150 / 2
    });

    it("должен фильтровать статистику по валюте", async () => {
      await createTestPayment({ amount: "100.00", status: "success", currency: "USD" });
      await createTestPayment({ amount: "50.00", status: "success", currency: "EUR" });

      const usdStats = await paymentRepository.getOverallStats("USD");
      const eurStats = await paymentRepository.getOverallStats("EUR");

      expect(usdStats.totalAmount).toBe("100.00");
      expect(usdStats.totalPayments).toBe(1);

      expect(eurStats.totalAmount).toBe("50.00");
      expect(eurStats.totalPayments).toBe(1);
    });

    it("должен возвращать нулевую статистику при отсутствии платежей", async () => {
      const stats = await paymentRepository.getOverallStats();

      expect(stats.totalAmount).toBe("0.00");
      expect(stats.successfulPayments).toBe(0);
      expect(stats.failedPayments).toBe(0);
      expect(stats.pendingPayments).toBe(0);
      expect(stats.totalPayments).toBe(0);
      expect(stats.averagePayment).toBe("0.00");
    });
  });
});
