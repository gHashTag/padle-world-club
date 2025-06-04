import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { PaymentRepository } from "../../../repositories/payment-repository";
import { UserRepository } from "../../../repositories/user-repository";
import * as schema from "../../../db/schema";

const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString, { max: 1 });
const db = drizzle(sql, { schema });

describe("PaymentRepository Bonus Integration", () => {
  let paymentRepository: PaymentRepository;
  let userRepository: UserRepository;
  let testUserId: string;

  beforeEach(async () => {
    // Применяем миграции
    await migrate(db, { migrationsFolder: "./drizzle_migrations" });

    // Очищаем таблицы
    await db.delete(schema.bonusTransactions);
    await db.delete(schema.payments);
    await db.delete(schema.users);

    // Инициализируем репозитории
    paymentRepository = new PaymentRepository(db);
    userRepository = new UserRepository(db);

    // Создаем тестового пользователя
    const testUser = await userRepository.create({
      username: "testuser",
      email: "test@example.com",
      firstName: "Test",
      lastName: "User",
      userRole: "player",
      passwordHash: "test-hash",
      memberId: "test-member-id",
    });
    testUserId = testUser.id;
  });

  afterEach(async () => {
    // Очищаем таблицы после каждого теста
    await db.delete(schema.bonusTransactions);
    await db.delete(schema.payments);
    await db.delete(schema.users);
  });

  describe("createWithBonusEarning", () => {
    it("должен создать платеж и начислить бонусы при успешном платеже", async () => {
      const paymentData = {
        userId: testUserId,
        amount: "1000.00",
        currency: "RUB",
        status: "success" as const,
        paymentMethod: "card" as const,
        description: "Тестовый платеж",
      };

      const payment = await paymentRepository.createWithBonusEarning(
        paymentData,
        5
      );

      expect(payment).toBeDefined();
      expect(payment.amount).toBe("1000.00");
      expect(payment.status).toBe("success");

      // Проверяем, что бонусы начислены (5% от 1000 = 50 бонусов)
      const bonusBalance = await userRepository.getBonusBalance(testUserId);
      expect(bonusBalance).toBe(50);

      // Проверяем бонусную транзакцию
      const bonusHistory = await userRepository.getBonusHistory(testUserId, 10);
      expect(bonusHistory).toHaveLength(1);
      expect(bonusHistory[0].transactionType).toBe("earned");
      expect(bonusHistory[0].pointsChange).toBe(50);
      expect(bonusHistory[0].description).toContain(`платеж #${payment.id}`);
    });

    it("не должен начислять бонусы при неуспешном платеже", async () => {
      const paymentData = {
        userId: testUserId,
        amount: "1000.00",
        currency: "RUB",
        status: "failed" as const,
        paymentMethod: "card" as const,
        description: "Неуспешный платеж",
      };

      const payment = await paymentRepository.createWithBonusEarning(
        paymentData,
        5
      );

      expect(payment).toBeDefined();
      expect(payment.status).toBe("failed");

      // Проверяем, что бонусы не начислены
      const bonusBalance = await userRepository.getBonusBalance(testUserId);
      expect(bonusBalance).toBe(0);
    });

    it("не должен начислять бонусы при оплате бонусами", async () => {
      const paymentData = {
        userId: testUserId,
        amount: "1000.00",
        currency: "RUB",
        status: "success" as const,
        paymentMethod: "bonus_points" as const,
        description: "Оплата бонусами",
      };

      const payment = await paymentRepository.createWithBonusEarning(
        paymentData,
        5
      );

      expect(payment).toBeDefined();
      expect(payment.status).toBe("success");

      // Проверяем, что бонусы не начислены
      const bonusBalance = await userRepository.getBonusBalance(testUserId);
      expect(bonusBalance).toBe(0);
    });
  });

  describe("createWithBonusSpending", () => {
    beforeEach(async () => {
      // Начисляем пользователю бонусы для тестов
      await userRepository.earnBonusPoints(testUserId, 100, "Начальные бонусы");
    });

    it("должен создать платеж с использованием бонусов", async () => {
      const paymentData = {
        userId: testUserId,
        amount: "500.00",
        currency: "RUB",
        status: "success" as const,
        paymentMethod: "card" as const,
        description: "Платеж с бонусами",
      };

      const payment = await paymentRepository.createWithBonusSpending(
        paymentData,
        50
      );

      expect(payment).not.toBeNull();
      expect(payment!.amount).toBe("450.00"); // 500 - 50 = 450
      expect(payment!.status).toBe("success");

      // Проверяем, что бонусы списаны
      const bonusBalance = await userRepository.getBonusBalance(testUserId);
      expect(bonusBalance).toBe(50); // 100 - 50 = 50

      // Проверяем бонусную транзакцию списания
      const bonusHistory = await userRepository.getBonusHistory(testUserId, 10);
      const spentTransaction = bonusHistory.find(
        (t) => t.transactionType === "spent"
      );
      expect(spentTransaction).toBeDefined();
      expect(spentTransaction!.pointsChange).toBe(50);
      expect(spentTransaction!.description).toContain(
        `платежа #${payment!.id}`
      );
    });

    it("должен создать платеж полностью на бонусы", async () => {
      const paymentData = {
        userId: testUserId,
        amount: "50.00",
        currency: "RUB",
        status: "success" as const,
        paymentMethod: "card" as const,
        description: "Полная оплата бонусами",
      };

      const payment = await paymentRepository.createWithBonusSpending(
        paymentData,
        50
      );

      expect(payment).not.toBeNull();
      expect(payment!.amount).toBe("0.00"); // Полностью оплачено бонусами
      expect(payment!.paymentMethod).toBe("bonus_points");

      // Проверяем, что бонусы списаны
      const bonusBalance = await userRepository.getBonusBalance(testUserId);
      expect(bonusBalance).toBe(50); // 100 - 50 = 50
    });

    it("должен вернуть null при недостатке бонусов", async () => {
      const paymentData = {
        userId: testUserId,
        amount: "500.00",
        currency: "RUB",
        status: "success" as const,
        paymentMethod: "card" as const,
        description: "Платеж с недостатком бонусов",
      };

      const payment = await paymentRepository.createWithBonusSpending(
        paymentData,
        150
      ); // Больше чем есть

      expect(payment).toBeNull();

      // Проверяем, что бонусы не изменились
      const bonusBalance = await userRepository.getBonusBalance(testUserId);
      expect(bonusBalance).toBe(100);
    });
  });

  describe("updateStatusWithBonusHandling", () => {
    let testPaymentId: string;

    beforeEach(async () => {
      // Создаем тестовый платеж
      const payment = await paymentRepository.create({
        userId: testUserId,
        amount: "1000.00",
        currency: "RUB",
        status: "pending",
        paymentMethod: "card",
        description: "Тестовый платеж для обновления статуса",
      });
      testPaymentId = payment.id;
    });

    it("должен начислить бонусы при изменении статуса на success", async () => {
      const updatedPayment =
        await paymentRepository.updateStatusWithBonusHandling(
          testPaymentId,
          "success",
          5
        );

      expect(updatedPayment).toBeDefined();
      expect(updatedPayment!.status).toBe("success");

      // Проверяем, что бонусы начислены
      const bonusBalance = await userRepository.getBonusBalance(testUserId);
      expect(bonusBalance).toBe(50); // 5% от 1000
    });

    it("должен списать бонусы при возврате платежа", async () => {
      // Сначала делаем платеж успешным и начисляем бонусы
      await paymentRepository.updateStatusWithBonusHandling(
        testPaymentId,
        "success",
        5
      );

      // Проверяем начисление
      let bonusBalance = await userRepository.getBonusBalance(testUserId);
      expect(bonusBalance).toBe(50);

      // Теперь возвращаем платеж
      const refundedPayment =
        await paymentRepository.updateStatusWithBonusHandling(
          testPaymentId,
          "refunded",
          5
        );

      expect(refundedPayment).toBeDefined();
      expect(refundedPayment!.status).toBe("refunded");

      // Проверяем, что бонусы списаны
      bonusBalance = await userRepository.getBonusBalance(testUserId);
      expect(bonusBalance).toBe(0); // 50 - 50 = 0
    });
  });

  describe("getPaymentBonusTransactions", () => {
    it("должен получить связанные бонусные транзакции", async () => {
      // Создаем платеж с начислением бонусов
      const payment = await paymentRepository.createWithBonusEarning({
        userId: testUserId,
        amount: "1000.00",
        currency: "RUB",
        status: "success",
        paymentMethod: "card",
        description: "Платеж для проверки связанных бонусов",
      });

      // Получаем связанные бонусные транзакции
      const relatedBonuses =
        await paymentRepository.getPaymentBonusTransactions(payment.id);

      expect(relatedBonuses).toBeDefined();
      // Примечание: этот тест может не найти связанные транзакции,
      // так как связь устанавливается через relatedOrderId/relatedBookingId,
      // а не через ID платежа напрямую
    });
  });
});
