import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../../../db/schema";
import {
  userTrainingPackages,
  trainingPackageDefinitions,
  users,
  venues,
  NewUserTrainingPackage,
  NewTrainingPackageDefinition,
  NewUser,
  NewVenue,
} from "../../../db/schema";
import { UserTrainingPackageRepository } from "../../../repositories/user-training-package-repository";
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
const userTrainingPackageRepository = new UserTrainingPackageRepository(db);

describe("UserTrainingPackageRepository", () => {
  let testVenue: schema.Venue;
  let testUser: schema.User;
  let testPackageDefinition: schema.TrainingPackageDefinition;

  // Функция для очистки таблиц перед/после тестов
  const cleanupDatabase = async () => {
    await db.delete(userTrainingPackages);
    await db.delete(trainingPackageDefinitions);
    await db.delete(users);
    await db.delete(venues);
  };

  beforeEach(async () => {
    await cleanupDatabase();

    // Создаем тестовые данные
    const venueData: NewVenue = {
      name: "Test Venue",
      address: "123 Test St",
      city: "Test City",
      country: "Test Country",
      isActive: true,
    };
    [testVenue] = await db.insert(venues).values(venueData).returning();

    const userData: NewUser = {
      username: "test_user",
      passwordHash: "hashed_password",
      firstName: "Test",
      lastName: "User",
      email: "user@test.com",
      memberId: "USER001",
      userRole: "player",
      homeVenueId: testVenue.id,
    };
    [testUser] = await db.insert(users).values(userData).returning();

    const packageDefData: NewTrainingPackageDefinition = {
      name: "Test Group Training Package",
      description: "Test package for group training",
      packageType: "group_training",
      numberOfSessions: 10,
      price: "150.00",
      currency: "USD",
      validityDurationDays: 30,
      isActive: true,
    };
    [testPackageDefinition] = await db.insert(trainingPackageDefinitions).values(packageDefData).returning();
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  // Вспомогательная функция для создания тестового пакета пользователя
  const createTestUserPackage = async (customData: Partial<NewUserTrainingPackage> = {}): Promise<schema.UserTrainingPackage> => {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() + 30); // 30 дней с текущей даты

    const defaultPackageData: NewUserTrainingPackage = {
      userId: testUser.id,
      packageDefinitionId: testPackageDefinition.id,
      expirationDate,
      sessionsUsed: 0,
      sessionsTotal: 10,
      status: "active",
      ...customData,
    };

    return await userTrainingPackageRepository.create(defaultPackageData);
  };

  describe("create", () => {
    it("должен создавать пакет тренировок пользователя с обязательными полями", async () => {
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 30);

      const packageData: NewUserTrainingPackage = {
        userId: testUser.id,
        packageDefinitionId: testPackageDefinition.id,
        expirationDate,
        sessionsUsed: 0,
        sessionsTotal: 10,
        status: "active",
      };

      const userPackage = await userTrainingPackageRepository.create(packageData);

      expect(userPackage).toBeDefined();
      expect(userPackage.id).toBeDefined();
      expect(userPackage.userId).toBe(testUser.id);
      expect(userPackage.packageDefinitionId).toBe(testPackageDefinition.id);
      expect(userPackage.sessionsUsed).toBe(0);
      expect(userPackage.sessionsTotal).toBe(10);
      expect(userPackage.status).toBe("active");
      expect(userPackage.purchaseDate).toBeDefined();
    });

    it("должен создавать пакет тренировок с частично использованными сессиями", async () => {
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 30);

      const packageData: NewUserTrainingPackage = {
        userId: testUser.id,
        packageDefinitionId: testPackageDefinition.id,
        expirationDate,
        sessionsUsed: 3,
        sessionsTotal: 10,
        status: "active",
      };

      const userPackage = await userTrainingPackageRepository.create(packageData);

      expect(userPackage).toBeDefined();
      expect(userPackage.sessionsUsed).toBe(3);
      expect(userPackage.sessionsTotal).toBe(10);
    });
  });

  describe("getById", () => {
    it("должен возвращать пакет тренировок пользователя по ID", async () => {
      const createdPackage = await createTestUserPackage();

      const userPackage = await userTrainingPackageRepository.getById(createdPackage.id);

      expect(userPackage).toBeDefined();
      expect(userPackage?.id).toBe(createdPackage.id);
      expect(userPackage?.userId).toBe(createdPackage.userId);
    });

    it("должен возвращать null, если пакет тренировок пользователя не найден", async () => {
      const userPackage = await userTrainingPackageRepository.getById("00000000-0000-0000-0000-000000000000");

      expect(userPackage).toBeNull();
    });
  });

  describe("getByUser", () => {
    it("должен возвращать все пакеты тренировок пользователя", async () => {
      await createTestUserPackage({ status: "active" });
      await createTestUserPackage({ status: "completed" });

      const userPackages = await userTrainingPackageRepository.getByUser(testUser.id);
      const activePackages = await userTrainingPackageRepository.getByUser(testUser.id, "active");

      expect(userPackages).toHaveLength(2);
      expect(userPackages.every(p => p.userId === testUser.id)).toBe(true);

      expect(activePackages).toHaveLength(1);
      expect(activePackages[0].status).toBe("active");
    });
  });

  describe("getByPackageDefinition", () => {
    it("должен возвращать пакеты тренировок по определению пакета", async () => {
      // Создаем второе определение пакета
      const anotherPackageDef = await db.insert(trainingPackageDefinitions).values({
        name: "Another Package",
        packageType: "private_training",
        numberOfSessions: 5,
        price: "200.00",
        currency: "USD",
        validityDurationDays: 60,
        isActive: true,
      }).returning();

      await createTestUserPackage({ packageDefinitionId: testPackageDefinition.id, status: "active" });
      await createTestUserPackage({ packageDefinitionId: anotherPackageDef[0].id, status: "active" });

      const packagesForDef1 = await userTrainingPackageRepository.getByPackageDefinition(testPackageDefinition.id);
      const packagesForDef2 = await userTrainingPackageRepository.getByPackageDefinition(anotherPackageDef[0].id);

      expect(packagesForDef1).toHaveLength(1);
      expect(packagesForDef1[0].packageDefinitionId).toBe(testPackageDefinition.id);

      expect(packagesForDef2).toHaveLength(1);
      expect(packagesForDef2[0].packageDefinitionId).toBe(anotherPackageDef[0].id);
    });
  });

  describe("getByStatus", () => {
    it("должен возвращать пакеты тренировок по статусу", async () => {
      await createTestUserPackage({ status: "active" });
      await createTestUserPackage({ status: "completed" });
      await createTestUserPackage({ status: "expired" });

      const activePackages = await userTrainingPackageRepository.getByStatus("active");
      const completedPackages = await userTrainingPackageRepository.getByStatus("completed");
      const expiredPackages = await userTrainingPackageRepository.getByStatus("expired");

      expect(activePackages).toHaveLength(1);
      expect(activePackages[0].status).toBe("active");

      expect(completedPackages).toHaveLength(1);
      expect(completedPackages[0].status).toBe("completed");

      expect(expiredPackages).toHaveLength(1);
      expect(expiredPackages[0].status).toBe("expired");
    });
  });

  describe("getActiveByUser", () => {
    it("должен возвращать только активные пакеты тренировок пользователя", async () => {
      await createTestUserPackage({ status: "active" });
      await createTestUserPackage({ status: "completed" });
      await createTestUserPackage({ status: "expired" });

      const activePackages = await userTrainingPackageRepository.getActiveByUser(testUser.id);

      expect(activePackages).toHaveLength(1);
      expect(activePackages[0].status).toBe("active");
      expect(activePackages[0].userId).toBe(testUser.id);
    });
  });

  describe("getExpiringSoon", () => {
    it("должен возвращать пакеты тренировок с истекающим сроком действия", async () => {
      const now = new Date();

      // Пакет, истекающий через 3 дня
      const expiringSoon = new Date();
      expiringSoon.setDate(now.getDate() + 3);

      // Пакет, истекающий через 15 дней
      const expiringLater = new Date();
      expiringLater.setDate(now.getDate() + 15);

      await createTestUserPackage({
        status: "active",
        expirationDate: expiringSoon
      });
      await createTestUserPackage({
        status: "active",
        expirationDate: expiringLater
      });

      const expiringSoonPackages = await userTrainingPackageRepository.getExpiringSoon(7);

      expect(expiringSoonPackages).toHaveLength(1);
      // Сравниваем даты без миллисекунд (PostgreSQL обрезает миллисекунды)
      expect(Math.floor(expiringSoonPackages[0].expirationDate.getTime() / 1000)).toBe(Math.floor(expiringSoon.getTime() / 1000));
    });
  });

  describe("getExpired", () => {
    it("должен возвращать просроченные пакеты тренировок", async () => {
      const now = new Date();

      // Просроченный пакет
      const expiredDate = new Date();
      expiredDate.setDate(now.getDate() - 5);

      // Активный пакет
      const futureDate = new Date();
      futureDate.setDate(now.getDate() + 5);

      await createTestUserPackage({
        status: "active",
        expirationDate: expiredDate
      });
      await createTestUserPackage({
        status: "active",
        expirationDate: futureDate
      });

      const expiredPackages = await userTrainingPackageRepository.getExpired();

      expect(expiredPackages).toHaveLength(1);
      // Сравниваем даты без миллисекунд (PostgreSQL обрезает миллисекунды)
      expect(Math.floor(expiredPackages[0].expirationDate.getTime() / 1000)).toBe(Math.floor(expiredDate.getTime() / 1000));
    });
  });

  describe("getByPurchaseDateRange", () => {
    it("должен возвращать пакеты тренировок по диапазону дат покупки", async () => {
      const now = new Date();
      const startDate = new Date();
      startDate.setDate(now.getDate() - 10);
      const endDate = new Date();
      endDate.setDate(now.getDate() - 5);

      // Пакет в диапазоне
      const inRangeDate = new Date();
      inRangeDate.setDate(now.getDate() - 7);

      // Пакет вне диапазона
      const outOfRangeDate = new Date();
      outOfRangeDate.setDate(now.getDate() - 2);

      await createTestUserPackage({ purchaseDate: inRangeDate });
      await createTestUserPackage({ purchaseDate: outOfRangeDate });

      const packagesInRange = await userTrainingPackageRepository.getByPurchaseDateRange(startDate, endDate);

      expect(packagesInRange).toHaveLength(1);
      // Сравниваем даты без миллисекунд (PostgreSQL обрезает миллисекунды)
      expect(Math.floor(packagesInRange[0].purchaseDate.getTime() / 1000)).toBe(Math.floor(inRangeDate.getTime() / 1000));
    });
  });

  describe("getWithAvailableSessions", () => {
    it("должен возвращать пакеты тренировок с доступными сессиями", async () => {
      await createTestUserPackage({
        status: "active",
        sessionsUsed: 3,
        sessionsTotal: 10
      });
      await createTestUserPackage({
        status: "active",
        sessionsUsed: 10,
        sessionsTotal: 10
      });
      await createTestUserPackage({
        status: "completed",
        sessionsUsed: 5,
        sessionsTotal: 10
      });

      const packagesWithSessions = await userTrainingPackageRepository.getWithAvailableSessions(testUser.id);

      expect(packagesWithSessions).toHaveLength(1);
      expect(packagesWithSessions[0].sessionsUsed).toBe(3);
      expect(packagesWithSessions[0].sessionsTotal).toBe(10);
      expect(packagesWithSessions[0].status).toBe("active");
    });
  });

  describe("update", () => {
    it("должен обновлять данные пакета тренировок пользователя", async () => {
      const createdPackage = await createTestUserPackage();

      const updatedPackage = await userTrainingPackageRepository.update(createdPackage.id, {
        sessionsUsed: 5,
        status: "active",
      });

      expect(updatedPackage).toBeDefined();
      expect(updatedPackage?.id).toBe(createdPackage.id);
      expect(updatedPackage?.sessionsUsed).toBe(5);
      expect(updatedPackage?.status).toBe("active");
    });

    it("должен возвращать null при обновлении несуществующего пакета", async () => {
      const updatedPackage = await userTrainingPackageRepository.update("00000000-0000-0000-0000-000000000000", {
        sessionsUsed: 5,
      });

      expect(updatedPackage).toBeNull();
    });
  });

  describe("updateStatus", () => {
    it("должен обновлять статус пакета тренировок пользователя", async () => {
      const createdPackage = await createTestUserPackage({ status: "active" });

      const updatedPackage = await userTrainingPackageRepository.updateStatus(createdPackage.id, "completed");

      expect(updatedPackage).toBeDefined();
      expect(updatedPackage?.status).toBe("completed");
    });
  });

  describe("useSession", () => {
    it("должен использовать сессию из пакета тренировок", async () => {
      const createdPackage = await createTestUserPackage({
        sessionsUsed: 3,
        sessionsTotal: 10,
        status: "active"
      });

      const updatedPackage = await userTrainingPackageRepository.useSession(createdPackage.id);

      expect(updatedPackage).toBeDefined();
      expect(updatedPackage?.sessionsUsed).toBe(4);
      expect(updatedPackage?.status).toBe("active");
    });

    it("должен завершать пакет при использовании последней сессии", async () => {
      const createdPackage = await createTestUserPackage({
        sessionsUsed: 9,
        sessionsTotal: 10,
        status: "active"
      });

      const updatedPackage = await userTrainingPackageRepository.useSession(createdPackage.id);

      expect(updatedPackage).toBeDefined();
      expect(updatedPackage?.sessionsUsed).toBe(10);
      expect(updatedPackage?.status).toBe("completed");
    });

    it("должен возвращать null, если нет доступных сессий", async () => {
      const createdPackage = await createTestUserPackage({
        sessionsUsed: 10,
        sessionsTotal: 10,
        status: "active"
      });

      const updatedPackage = await userTrainingPackageRepository.useSession(createdPackage.id);

      expect(updatedPackage).toBeNull();
    });
  });

  describe("returnSession", () => {
    it("должен возвращать сессию в пакет тренировок", async () => {
      const createdPackage = await createTestUserPackage({
        sessionsUsed: 5,
        sessionsTotal: 10,
        status: "active"
      });

      const updatedPackage = await userTrainingPackageRepository.returnSession(createdPackage.id);

      expect(updatedPackage).toBeDefined();
      expect(updatedPackage?.sessionsUsed).toBe(4);
      expect(updatedPackage?.status).toBe("active");
    });

    it("должен активировать завершенный пакет при возврате сессии", async () => {
      const createdPackage = await createTestUserPackage({
        sessionsUsed: 10,
        sessionsTotal: 10,
        status: "completed"
      });

      const updatedPackage = await userTrainingPackageRepository.returnSession(createdPackage.id);

      expect(updatedPackage).toBeDefined();
      expect(updatedPackage?.sessionsUsed).toBe(9);
      expect(updatedPackage?.status).toBe("active");
    });

    it("должен возвращать null, если нет использованных сессий", async () => {
      const createdPackage = await createTestUserPackage({
        sessionsUsed: 0,
        sessionsTotal: 10,
        status: "active"
      });

      const updatedPackage = await userTrainingPackageRepository.returnSession(createdPackage.id);

      expect(updatedPackage).toBeNull();
    });
  });

  describe("delete", () => {
    it("должен удалять пакет тренировок пользователя", async () => {
      const createdPackage = await createTestUserPackage();

      const result = await userTrainingPackageRepository.delete(createdPackage.id);

      expect(result).toBe(true);

      const deletedPackage = await userTrainingPackageRepository.getById(createdPackage.id);
      expect(deletedPackage).toBeNull();
    });

    it("должен возвращать false при удалении несуществующего пакета", async () => {
      const result = await userTrainingPackageRepository.delete("00000000-0000-0000-0000-000000000000");

      expect(result).toBe(false);
    });
  });

  describe("getCount", () => {
    it("должен возвращать количество пакетов тренировок пользователей", async () => {
      await createTestUserPackage({ status: "active" });
      await createTestUserPackage({ status: "completed" });
      await createTestUserPackage({ status: "expired" });

      const totalCount = await userTrainingPackageRepository.getCount();
      const activeCount = await userTrainingPackageRepository.getCount("active");

      expect(totalCount).toBe(3);
      expect(activeCount).toBe(1);
    });
  });

  describe("getStats", () => {
    it("должен возвращать статистику по пакетам тренировок пользователей", async () => {
      const now = new Date();
      const expiringSoon = new Date();
      expiringSoon.setDate(now.getDate() + 3);

      await createTestUserPackage({
        status: "active",
        sessionsUsed: 3,
        sessionsTotal: 10,
        expirationDate: expiringSoon
      });
      await createTestUserPackage({
        status: "completed",
        sessionsUsed: 8,
        sessionsTotal: 8
      });
      await createTestUserPackage({
        status: "expired",
        sessionsUsed: 2,
        sessionsTotal: 10
      });
      await createTestUserPackage({
        status: "cancelled",
        sessionsUsed: 0,
        sessionsTotal: 5
      });

      const stats = await userTrainingPackageRepository.getStats();

      expect(stats.totalPackages).toBe(4);
      expect(stats.activePackages).toBe(1);
      expect(stats.expiredPackages).toBe(1);
      expect(stats.completedPackages).toBe(1);
      expect(stats.cancelledPackages).toBe(1);
      expect(stats.totalSessionsUsed).toBe(13); // 3 + 8 + 2 + 0
      expect(stats.totalSessionsAvailable).toBe(33); // 10 + 8 + 10 + 5
      expect(stats.averageUsageRate).toBe("39.39"); // (13/33) * 100
      expect(stats.packagesExpiringSoon).toBe(1);
    });

    it("должен возвращать статистику для конкретного пользователя", async () => {
      // Создаем второго пользователя
      const anotherUser = await db.insert(users).values({
        username: "another_user",
        passwordHash: "hashed_password",
        firstName: "Another",
        lastName: "User",
        email: "another@test.com",
        memberId: "USER002",
        userRole: "player",
        homeVenueId: testVenue.id,
      }).returning();

      await createTestUserPackage({ userId: testUser.id, status: "active" });
      await createTestUserPackage({ userId: anotherUser[0].id, status: "completed" });

      const userStats = await userTrainingPackageRepository.getStats(testUser.id);

      expect(userStats.totalPackages).toBe(1);
      expect(userStats.activePackages).toBe(1);
      expect(userStats.completedPackages).toBe(0);
    });
  });

  describe("markExpiredPackages", () => {
    it("должен массово обновлять статус просроченных пакетов", async () => {
      const now = new Date();
      const expiredDate = new Date();
      expiredDate.setDate(now.getDate() - 5);
      const futureDate = new Date();
      futureDate.setDate(now.getDate() + 5);

      await createTestUserPackage({
        status: "active",
        expirationDate: expiredDate
      });
      await createTestUserPackage({
        status: "active",
        expirationDate: expiredDate
      });
      await createTestUserPackage({
        status: "active",
        expirationDate: futureDate
      });

      const updatedCount = await userTrainingPackageRepository.markExpiredPackages();

      expect(updatedCount).toBe(2);

      const expiredPackages = await userTrainingPackageRepository.getByStatus("expired");
      expect(expiredPackages).toHaveLength(2);
    });
  });

  describe("getUserPackagesWithRemainingSessions", () => {
    it("должен возвращать пакеты пользователя с информацией об оставшихся сессиях", async () => {
      await createTestUserPackage({
        status: "active",
        sessionsUsed: 3,
        sessionsTotal: 10
      });
      await createTestUserPackage({
        status: "active",
        sessionsUsed: 7,
        sessionsTotal: 8
      });

      const packagesWithRemaining = await userTrainingPackageRepository.getUserPackagesWithRemainingSessions(testUser.id);

      expect(packagesWithRemaining).toHaveLength(2);
      expect(packagesWithRemaining[0].remainingSessions).toBe(7); // 10 - 3
      expect(packagesWithRemaining[1].remainingSessions).toBe(1); // 8 - 7
    });
  });

  describe("findUsablePackageForUser", () => {
    it("должен находить подходящий пакет для использования", async () => {
      const now = new Date();
      const futureDate = new Date();
      futureDate.setDate(now.getDate() + 10);

      await createTestUserPackage({
        status: "active",
        sessionsUsed: 3,
        sessionsTotal: 10,
        expirationDate: futureDate
      });

      const usablePackage = await userTrainingPackageRepository.findUsablePackageForUser(testUser.id);

      expect(usablePackage).toBeDefined();
      expect(usablePackage?.userId).toBe(testUser.id);
      expect(usablePackage?.status).toBe("active");
      expect(usablePackage?.sessionsUsed).toBeLessThan(usablePackage?.sessionsTotal || 0);
    });

    it("должен возвращать null, если нет подходящих пакетов", async () => {
      await createTestUserPackage({
        status: "completed",
        sessionsUsed: 10,
        sessionsTotal: 10
      });

      const usablePackage = await userTrainingPackageRepository.findUsablePackageForUser(testUser.id);

      expect(usablePackage).toBeNull();
    });
  });

  describe("getUserPackageHistory", () => {
    it("должен возвращать историю пакетов пользователя", async () => {
      const now = new Date();
      const date1 = new Date();
      date1.setDate(now.getDate() - 10);
      const date2 = new Date();
      date2.setDate(now.getDate() - 5);

      await createTestUserPackage({ purchaseDate: date1 });
      await createTestUserPackage({ purchaseDate: date2 });

      const history = await userTrainingPackageRepository.getUserPackageHistory(testUser.id);

      expect(history).toHaveLength(2);
      // Должны быть отсортированы по дате покупки (новые первыми)
      // Сравниваем даты без миллисекунд (PostgreSQL обрезает миллисекунды)
      expect(Math.floor(history[0].purchaseDate.getTime() / 1000)).toBe(Math.floor(date2.getTime() / 1000));
      expect(Math.floor(history[1].purchaseDate.getTime() / 1000)).toBe(Math.floor(date1.getTime() / 1000));
    });
  });

  describe("getMostPopularPackageDefinitions", () => {
    it("должен возвращать самые популярные определения пакетов", async () => {
      // Создаем второе определение пакета
      const anotherPackageDef = await db.insert(trainingPackageDefinitions).values({
        name: "Popular Package",
        packageType: "private_training",
        numberOfSessions: 5,
        price: "200.00",
        currency: "USD",
        validityDurationDays: 60,
        isActive: true,
      }).returning();

      // Создаем пакеты пользователей
      await createTestUserPackage({ packageDefinitionId: testPackageDefinition.id });
      await createTestUserPackage({ packageDefinitionId: anotherPackageDef[0].id });
      await createTestUserPackage({ packageDefinitionId: anotherPackageDef[0].id });

      const popularPackages = await userTrainingPackageRepository.getMostPopularPackageDefinitions(2);

      expect(popularPackages).toHaveLength(2);
      expect(popularPackages[0].packageDefinitionId).toBe(anotherPackageDef[0].id);
      expect(popularPackages[0].purchaseCount).toBe(2);
      expect(popularPackages[1].packageDefinitionId).toBe(testPackageDefinition.id);
      expect(popularPackages[1].purchaseCount).toBe(1);
    });
  });

  describe("getBySessionsUsedRange", () => {
    it("должен возвращать пакеты по диапазону использованных сессий", async () => {
      await createTestUserPackage({ sessionsUsed: 2 });
      await createTestUserPackage({ sessionsUsed: 5 });
      await createTestUserPackage({ sessionsUsed: 8 });

      const packagesInRange = await userTrainingPackageRepository.getBySessionsUsedRange(3, 7);

      expect(packagesInRange).toHaveLength(1);
      expect(packagesInRange[0].sessionsUsed).toBe(5);
    });
  });

  describe("cancel/activate", () => {
    it("должен отменять пакет тренировок", async () => {
      const createdPackage = await createTestUserPackage({ status: "active" });

      const cancelledPackage = await userTrainingPackageRepository.cancel(createdPackage.id);

      expect(cancelledPackage).toBeDefined();
      expect(cancelledPackage?.status).toBe("cancelled");
    });

    it("должен активировать пакет тренировок", async () => {
      const createdPackage = await createTestUserPackage({ status: "cancelled" });

      const activatedPackage = await userTrainingPackageRepository.activate(createdPackage.id);

      expect(activatedPackage).toBeDefined();
      expect(activatedPackage?.status).toBe("active");
    });
  });

  describe("getAll", () => {
    it("должен возвращать все пакеты с пагинацией", async () => {
      // Создаем 5 пакетов
      for (let i = 0; i < 5; i++) {
        await createTestUserPackage();
      }

      const allPackages = await userTrainingPackageRepository.getAll();
      const limitedPackages = await userTrainingPackageRepository.getAll(3);
      const offsetPackages = await userTrainingPackageRepository.getAll(3, 2);

      expect(allPackages).toHaveLength(5);
      expect(limitedPackages).toHaveLength(3);
      expect(offsetPackages).toHaveLength(3);
    });
  });
});
