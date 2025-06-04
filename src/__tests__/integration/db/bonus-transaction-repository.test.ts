import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { eq } from "drizzle-orm";
import { db } from "../../../db/connection";
import { users, bonusTransactions } from "../../../db/schema";
import { BonusTransactionRepository } from "../../../repositories/bonus-transaction-repository";
import type { NewUser, NewBonusTransaction } from "../../../db/schema";

describe("BonusTransactionRepository", () => {
  let repository: BonusTransactionRepository;
  let testUserId: string;
  let testUserId2: string;

  beforeEach(async () => {
    if (!db) throw new Error("Database connection not available");

    repository = new BonusTransactionRepository(db);

    // Создаем тестовых пользователей
    const [user1] = await db
      .insert(users)
      .values({
        email: "bonus-test-user1@example.com",
        username: "bonus_test_user1",
        passwordHash: "test_hash",
        firstName: "Test",
        lastName: "User1",
        memberId: "BONUS_TEST_001",
        userRole: "player",
      } as NewUser)
      .returning();

    const [user2] = await db
      .insert(users)
      .values({
        email: "bonus-test-user2@example.com",
        username: "bonus_test_user2",
        passwordHash: "test_hash",
        firstName: "Test",
        lastName: "User2",
        memberId: "BONUS_TEST_002",
        userRole: "player",
      } as NewUser)
      .returning();

    testUserId = user1.id;
    testUserId2 = user2.id;
  });

  afterEach(async () => {
    if (!db) return;

    // Очищаем тестовые данные
    await db.delete(bonusTransactions).where(eq(bonusTransactions.userId, testUserId));
    await db.delete(bonusTransactions).where(eq(bonusTransactions.userId, testUserId2));
    await db.delete(users).where(eq(users.id, testUserId));
    await db.delete(users).where(eq(users.id, testUserId2));
  });

  describe("create", () => {
    it("должен создать новую бонусную транзакцию", async () => {
      const transactionData: NewBonusTransaction = {
        userId: testUserId,
        transactionType: "earned",
        pointsChange: 100,
        currentBalanceAfter: 100,
        description: "Бонус за регистрацию",
      };

      const transaction = await repository.create(transactionData);

      expect(transaction).toBeDefined();
      expect(transaction.id).toBeDefined();
      expect(transaction.userId).toBe(testUserId);
      expect(transaction.transactionType).toBe("earned");
      expect(transaction.pointsChange).toBe(100);
      expect(transaction.currentBalanceAfter).toBe(100);
      expect(transaction.description).toBe("Бонус за регистрацию");
    });

    it("должен создать транзакцию списания", async () => {
      const transactionData: NewBonusTransaction = {
        userId: testUserId,
        transactionType: "spent",
        pointsChange: 50,
        currentBalanceAfter: 50,
        description: "Оплата услуги бонусами",
      };

      const transaction = await repository.create(transactionData);

      expect(transaction.transactionType).toBe("spent");
      expect(transaction.pointsChange).toBe(50);
    });
  });

  describe("findById", () => {
    it("должен найти транзакцию по ID", async () => {
      const created = await repository.create({
        userId: testUserId,
        transactionType: "earned",
        pointsChange: 100,
        currentBalanceAfter: 100,
        description: "Тестовая транзакция",
      });

      const found = await repository.findById(created.id);

      expect(found).toBeDefined();
      expect(found!.id).toBe(created.id);
      expect(found!.description).toBe("Тестовая транзакция");
    });

    it("должен вернуть null для несуществующего ID", async () => {
      const found = await repository.findById("00000000-0000-0000-0000-000000000000");
      expect(found).toBeNull();
    });
  });

  describe("findByUserId", () => {
    it("должен найти все транзакции пользователя", async () => {
      // Создаем несколько транзакций
      await repository.create({
        userId: testUserId,
        transactionType: "earned",
        pointsChange: 100,
        currentBalanceAfter: 100,
        description: "Первая транзакция",
      });

      await repository.create({
        userId: testUserId,
        transactionType: "spent",
        pointsChange: 30,
        currentBalanceAfter: 70,
        description: "Вторая транзакция",
      });

      // Создаем транзакцию для другого пользователя
      await repository.create({
        userId: testUserId2,
        transactionType: "earned",
        pointsChange: 50,
        currentBalanceAfter: 50,
        description: "Транзакция другого пользователя",
      });

      const transactions = await repository.findByUserId(testUserId);

      expect(transactions).toHaveLength(2);
      expect(transactions.every(t => t.userId === testUserId)).toBe(true);
      // Проверяем сортировку по дате (новые первыми)
      expect(transactions[0].description).toBe("Вторая транзакция");
      expect(transactions[1].description).toBe("Первая транзакция");
    });

    it("должен поддерживать пагинацию", async () => {
      // Создаем 3 транзакции
      for (let i = 1; i <= 3; i++) {
        await repository.create({
          userId: testUserId,
          transactionType: "earned",
          pointsChange: i * 10,
          currentBalanceAfter: i * 10,
          description: `Транзакция ${i}`,
        });
      }

      const firstPage = await repository.findByUserId(testUserId, 2, 0);
      const secondPage = await repository.findByUserId(testUserId, 2, 2);

      expect(firstPage).toHaveLength(2);
      expect(secondPage).toHaveLength(1);
    });
  });

  describe("findByType", () => {
    it("должен найти транзакции по типу", async () => {
      await repository.create({
        userId: testUserId,
        transactionType: "earned",
        pointsChange: 100,
        currentBalanceAfter: 100,
        description: "Начисление",
      });

      await repository.create({
        userId: testUserId,
        transactionType: "spent",
        pointsChange: 30,
        currentBalanceAfter: 70,
        description: "Списание",
      });

      const earnedTransactions = await repository.findByType("earned");
      const spentTransactions = await repository.findByType("spent");

      expect(earnedTransactions.every(t => t.transactionType === "earned")).toBe(true);
      expect(spentTransactions.every(t => t.transactionType === "spent")).toBe(true);
    });
  });

  describe("findByUserIdAndType", () => {
    it("должен найти транзакции пользователя по типу", async () => {
      await repository.create({
        userId: testUserId,
        transactionType: "earned",
        pointsChange: 100,
        currentBalanceAfter: 100,
        description: "Начисление пользователю 1",
      });

      await repository.create({
        userId: testUserId2,
        transactionType: "earned",
        pointsChange: 50,
        currentBalanceAfter: 50,
        description: "Начисление пользователю 2",
      });

      const transactions = await repository.findByUserIdAndType(testUserId, "earned");

      expect(transactions).toHaveLength(1);
      expect(transactions[0].userId).toBe(testUserId);
      expect(transactions[0].transactionType).toBe("earned");
    });
  });

  describe("findByDateRange", () => {
    it("должен найти транзакции за период", async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      await repository.create({
        userId: testUserId,
        transactionType: "earned",
        pointsChange: 100,
        currentBalanceAfter: 100,
        description: "Транзакция в периоде",
      });

      const transactions = await repository.findByDateRange(yesterday, tomorrow);

      expect(transactions.length).toBeGreaterThan(0);
      expect(transactions.some(t => t.description === "Транзакция в периоде")).toBe(true);
    });
  });

  describe("getCurrentBalance", () => {
    it("должен правильно рассчитать текущий баланс", async () => {
      // Начисляем 100 бонусов
      await repository.create({
        userId: testUserId,
        transactionType: "earned",
        pointsChange: 100,
        currentBalanceAfter: 100,
        description: "Начисление 100",
      });

      // Тратим 30 бонусов
      await repository.create({
        userId: testUserId,
        transactionType: "spent",
        pointsChange: 30,
        currentBalanceAfter: 70,
        description: "Списание 30",
      });

      // Начисляем еще 20
      await repository.create({
        userId: testUserId,
        transactionType: "earned",
        pointsChange: 20,
        currentBalanceAfter: 90,
        description: "Начисление 20",
      });

      const balance = await repository.getCurrentBalance(testUserId);

      expect(balance).toBe(90); // 100 + 20 - 30 = 90
    });

    it("должен вернуть 0 для пользователя без транзакций", async () => {
      const balance = await repository.getCurrentBalance(testUserId);
      expect(balance).toBe(0);
    });
  });

  describe("getBalanceHistory", () => {
    it("должен вернуть историю баланса", async () => {
      await repository.create({
        userId: testUserId,
        transactionType: "earned",
        pointsChange: 100,
        currentBalanceAfter: 100,
        description: "Первая транзакция",
      });

      await repository.create({
        userId: testUserId,
        transactionType: "spent",
        pointsChange: 30,
        currentBalanceAfter: 70,
        description: "Вторая транзакция",
      });

      const history = await repository.getBalanceHistory(testUserId, 10);

      expect(history).toHaveLength(2);
      expect(history[0].description).toBe("Вторая транзакция");
      expect(history[1].description).toBe("Первая транзакция");
    });
  });

  describe("getUserBonusSummary", () => {
    it("должен вернуть сводку по бонусам пользователя", async () => {
      await repository.create({
        userId: testUserId,
        transactionType: "earned",
        pointsChange: 100,
        currentBalanceAfter: 100,
        description: "Начисление 1",
      });

      await repository.create({
        userId: testUserId,
        transactionType: "earned",
        pointsChange: 50,
        currentBalanceAfter: 150,
        description: "Начисление 2",
      });

      await repository.create({
        userId: testUserId,
        transactionType: "spent",
        pointsChange: 30,
        currentBalanceAfter: 120,
        description: "Списание",
      });

      const summary = await repository.getUserBonusSummary(testUserId);

      expect(summary.totalEarned).toBe(150);
      expect(summary.totalSpent).toBe(30);
      expect(summary.currentBalance).toBe(120);
      expect(summary.transactionCount).toBe(3);
    });
  });

  describe("findExpiringBonuses", () => {
    it("должен найти истекающие бонусы", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 15); // Истекает через 15 дней

      await repository.create({
        userId: testUserId,
        transactionType: "earned",
        pointsChange: 100,
        currentBalanceAfter: 100,
        description: "Истекающие бонусы",
        expiresAt: futureDate,
      });

      const expiring = await repository.findExpiringBonuses(30);

      expect(expiring).toHaveLength(1);
      expect(expiring[0].description).toBe("Истекающие бонусы");
    });
  });

  describe("findExpiredBonuses", () => {
    it("должен найти просроченные бонусы", async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1); // Истек вчера

      await repository.create({
        userId: testUserId,
        transactionType: "earned",
        pointsChange: 100,
        currentBalanceAfter: 100,
        description: "Просроченные бонусы",
        expiresAt: pastDate,
      });

      const expired = await repository.findExpiredBonuses();

      expect(expired).toHaveLength(1);
      expect(expired[0].description).toBe("Просроченные бонусы");
    });
  });

  describe("update", () => {
    it("должен обновить транзакцию", async () => {
      const created = await repository.create({
        userId: testUserId,
        transactionType: "earned",
        pointsChange: 100,
        currentBalanceAfter: 100,
        description: "Исходное описание",
      });

      const updated = await repository.update(created.id, {
        description: "Обновленное описание",
        pointsChange: 150,
      });

      expect(updated).toBeDefined();
      expect(updated!.description).toBe("Обновленное описание");
      expect(updated!.pointsChange).toBe(150);
    });

    it("должен вернуть null для несуществующего ID", async () => {
      const updated = await repository.update("00000000-0000-0000-0000-000000000000", {
        description: "Новое описание",
      });

      expect(updated).toBeNull();
    });
  });

  describe("delete", () => {
    it("должен удалить транзакцию", async () => {
      const created = await repository.create({
        userId: testUserId,
        transactionType: "earned",
        pointsChange: 100,
        currentBalanceAfter: 100,
        description: "Транзакция для удаления",
      });

      const deleted = await repository.delete(created.id);
      expect(deleted).toBe(true);

      const found = await repository.findById(created.id);
      expect(found).toBeNull();
    });

    it("должен вернуть false для несуществующего ID", async () => {
      const deleted = await repository.delete("00000000-0000-0000-0000-000000000000");
      expect(deleted).toBe(false);
    });
  });

  describe("count", () => {
    it("должен подсчитать общее количество транзакций", async () => {
      const initialCount = await repository.count();

      await repository.create({
        userId: testUserId,
        transactionType: "earned",
        pointsChange: 100,
        currentBalanceAfter: 100,
        description: "Транзакция 1",
      });

      await repository.create({
        userId: testUserId2,
        transactionType: "earned",
        pointsChange: 50,
        currentBalanceAfter: 50,
        description: "Транзакция 2",
      });

      const finalCount = await repository.count();
      expect(finalCount).toBe(initialCount + 2);
    });
  });

  describe("countByUserId", () => {
    it("должен подсчитать транзакции пользователя", async () => {
      await repository.create({
        userId: testUserId,
        transactionType: "earned",
        pointsChange: 100,
        currentBalanceAfter: 100,
        description: "Транзакция 1",
      });

      await repository.create({
        userId: testUserId,
        transactionType: "spent",
        pointsChange: 30,
        currentBalanceAfter: 70,
        description: "Транзакция 2",
      });

      await repository.create({
        userId: testUserId2,
        transactionType: "earned",
        pointsChange: 50,
        currentBalanceAfter: 50,
        description: "Транзакция другого пользователя",
      });

      const count = await repository.countByUserId(testUserId);
      expect(count).toBe(2);
    });
  });

  describe("getBonusStats", () => {
    it("должен вернуть общую статистику по бонусам", async () => {
      await repository.create({
        userId: testUserId,
        transactionType: "earned",
        pointsChange: 100,
        currentBalanceAfter: 100,
        description: "Начисление 1",
      });

      await repository.create({
        userId: testUserId2,
        transactionType: "earned",
        pointsChange: 50,
        currentBalanceAfter: 50,
        description: "Начисление 2",
      });

      await repository.create({
        userId: testUserId,
        transactionType: "spent",
        pointsChange: 30,
        currentBalanceAfter: 70,
        description: "Списание",
      });

      const stats = await repository.getBonusStats();

      expect(stats.totalTransactions).toBeGreaterThanOrEqual(3);
      expect(stats.totalEarned).toBeGreaterThanOrEqual(150);
      expect(stats.totalSpent).toBeGreaterThanOrEqual(30);
      expect(stats.activeUsers).toBeGreaterThanOrEqual(2);
    });
  });
});
