import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../../../db/schema";
import {
  trainingPackageDefinitions,
  NewTrainingPackageDefinition,
} from "../../../db/schema";
import { TrainingPackageDefinitionRepository } from "../../../repositories/training-package-definition-repository";
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
const trainingPackageDefinitionRepository = new TrainingPackageDefinitionRepository(db);

describe("TrainingPackageDefinitionRepository", () => {
  // Функция для очистки таблиц перед/после тестов
  const cleanupDatabase = async () => {
    await db.delete(trainingPackageDefinitions);
  };

  beforeEach(async () => {
    await cleanupDatabase();
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  // Вспомогательная функция для создания тестового пакета тренировок
  const createTestPackage = async (customData: Partial<NewTrainingPackageDefinition> = {}): Promise<schema.TrainingPackageDefinition> => {
    const defaultPackageData: NewTrainingPackageDefinition = {
      name: "Test Group Training Package",
      description: "Test package for group training",
      packageType: "group_training",
      numberOfSessions: 10,
      price: "150.00",
      currency: "USD",
      validityDurationDays: 30,
      isActive: true,
      ...customData,
    };

    return await trainingPackageDefinitionRepository.create(defaultPackageData);
  };

  describe("create", () => {
    it("должен создавать пакет тренировок с обязательными полями", async () => {
      const packageData: NewTrainingPackageDefinition = {
        name: "Basic Group Training",
        packageType: "group_training",
        numberOfSessions: 5,
        price: "75.00",
        currency: "USD",
        validityDurationDays: 30,
        isActive: true,
      };

      const packageDef = await trainingPackageDefinitionRepository.create(packageData);

      expect(packageDef).toBeDefined();
      expect(packageDef.id).toBeDefined();
      expect(packageDef.name).toBe("Basic Group Training");
      expect(packageDef.packageType).toBe("group_training");
      expect(packageDef.numberOfSessions).toBe(5);
      expect(packageDef.price).toBe("75.00");
      expect(packageDef.currency).toBe("USD");
      expect(packageDef.validityDurationDays).toBe(30);
      expect(packageDef.isActive).toBe(true);
      expect(packageDef.description).toBeNull();
    });

    it("должен создавать пакет тренировок с описанием", async () => {
      const packageData: NewTrainingPackageDefinition = {
        name: "Premium Private Training",
        description: "Premium package with personal trainer",
        packageType: "private_training",
        numberOfSessions: 8,
        price: "400.00",
        currency: "USD",
        validityDurationDays: 60,
        isActive: true,
      };

      const packageDef = await trainingPackageDefinitionRepository.create(packageData);

      expect(packageDef).toBeDefined();
      expect(packageDef.description).toBe("Premium package with personal trainer");
      expect(packageDef.packageType).toBe("private_training");
    });
  });

  describe("getById", () => {
    it("должен возвращать пакет тренировок по ID", async () => {
      const createdPackage = await createTestPackage();

      const packageDef = await trainingPackageDefinitionRepository.getById(createdPackage.id);

      expect(packageDef).toBeDefined();
      expect(packageDef?.id).toBe(createdPackage.id);
      expect(packageDef?.name).toBe(createdPackage.name);
    });

    it("должен возвращать null, если пакет тренировок не найден", async () => {
      const packageDef = await trainingPackageDefinitionRepository.getById("00000000-0000-0000-0000-000000000000");

      expect(packageDef).toBeNull();
    });
  });

  describe("getByType", () => {
    it("должен возвращать пакеты тренировок по типу", async () => {
      await createTestPackage({ packageType: "group_training", name: "Group Package 1" });
      await createTestPackage({ packageType: "group_training", name: "Group Package 2" });
      await createTestPackage({ packageType: "private_training", name: "Private Package 1" });

      const groupPackages = await trainingPackageDefinitionRepository.getByType("group_training");
      const privatePackages = await trainingPackageDefinitionRepository.getByType("private_training");

      expect(groupPackages).toHaveLength(2);
      expect(groupPackages.every(p => p.packageType === "group_training")).toBe(true);

      expect(privatePackages).toHaveLength(1);
      expect(privatePackages[0].packageType).toBe("private_training");
    });

    it("должен возвращать только активные пакеты по умолчанию", async () => {
      await createTestPackage({ packageType: "group_training", isActive: true });
      await createTestPackage({ packageType: "group_training", isActive: false });

      const activePackages = await trainingPackageDefinitionRepository.getByType("group_training");
      const allPackages = await trainingPackageDefinitionRepository.getByType("group_training", false);

      expect(activePackages).toHaveLength(1);
      expect(activePackages[0].isActive).toBe(true);

      expect(allPackages).toHaveLength(2);
    });
  });

  describe("getActive", () => {
    it("должен возвращать только активные пакеты тренировок", async () => {
      await createTestPackage({ isActive: true, name: "Active Package 1" });
      await createTestPackage({ isActive: true, name: "Active Package 2" });
      await createTestPackage({ isActive: false, name: "Inactive Package" });

      const activePackages = await trainingPackageDefinitionRepository.getActive();

      expect(activePackages).toHaveLength(2);
      expect(activePackages.every(p => p.isActive)).toBe(true);
    });
  });

  describe("getByPriceRange", () => {
    it("должен возвращать пакеты тренировок в диапазоне цен", async () => {
      await createTestPackage({ price: "50.00", name: "Cheap Package" });
      await createTestPackage({ price: "100.00", name: "Medium Package" });
      await createTestPackage({ price: "200.00", name: "Expensive Package" });

      const midRangePackages = await trainingPackageDefinitionRepository.getByPriceRange(75, 150);

      expect(midRangePackages).toHaveLength(1);
      expect(midRangePackages[0].name).toBe("Medium Package");
      expect(Number(midRangePackages[0].price)).toBe(100);
    });
  });

  describe("getBySessions", () => {
    it("должен возвращать пакеты тренировок по количеству сессий", async () => {
      await createTestPackage({ numberOfSessions: 5, name: "Small Package" });
      await createTestPackage({ numberOfSessions: 10, name: "Medium Package" });
      await createTestPackage({ numberOfSessions: 20, name: "Large Package" });

      const mediumToLargePackages = await trainingPackageDefinitionRepository.getBySessions(8, 15);

      expect(mediumToLargePackages).toHaveLength(1);
      expect(mediumToLargePackages[0].name).toBe("Medium Package");
      expect(mediumToLargePackages[0].numberOfSessions).toBe(10);
    });

    it("должен возвращать пакеты тренировок с минимальным количеством сессий", async () => {
      await createTestPackage({ numberOfSessions: 5, name: "Small Package" });
      await createTestPackage({ numberOfSessions: 10, name: "Medium Package" });
      await createTestPackage({ numberOfSessions: 20, name: "Large Package" });

      const largePackages = await trainingPackageDefinitionRepository.getBySessions(10);

      expect(largePackages).toHaveLength(2);
      expect(largePackages.every(p => p.numberOfSessions >= 10)).toBe(true);
    });
  });

  describe("searchByName", () => {
    it("должен находить пакеты тренировок по названию", async () => {
      await createTestPackage({ name: "Beginner Group Training" });
      await createTestPackage({ name: "Advanced Group Training" });
      await createTestPackage({ name: "Private Coaching Session" });

      const groupPackages = await trainingPackageDefinitionRepository.searchByName("Group");

      expect(groupPackages).toHaveLength(2);
      expect(groupPackages.every(p => p.name.includes("Group"))).toBe(true);
    });
  });

  describe("update", () => {
    it("должен обновлять данные пакета тренировок", async () => {
      const createdPackage = await createTestPackage();

      const updatedPackage = await trainingPackageDefinitionRepository.update(createdPackage.id, {
        name: "Updated Package Name",
        price: "200.00",
        numberOfSessions: 15,
      });

      expect(updatedPackage).toBeDefined();
      expect(updatedPackage?.id).toBe(createdPackage.id);
      expect(updatedPackage?.name).toBe("Updated Package Name");
      expect(updatedPackage?.price).toBe("200.00");
      expect(updatedPackage?.numberOfSessions).toBe(15);
    });

    it("должен возвращать null при обновлении несуществующего пакета", async () => {
      const updatedPackage = await trainingPackageDefinitionRepository.update("00000000-0000-0000-0000-000000000000", {
        name: "Non-existent Package",
      });

      expect(updatedPackage).toBeNull();
    });
  });

  describe("activate/deactivate", () => {
    it("должен активировать пакет тренировок", async () => {
      const createdPackage = await createTestPackage({ isActive: false });

      const activatedPackage = await trainingPackageDefinitionRepository.activate(createdPackage.id);

      expect(activatedPackage).toBeDefined();
      expect(activatedPackage?.isActive).toBe(true);
    });

    it("должен деактивировать пакет тренировок", async () => {
      const createdPackage = await createTestPackage({ isActive: true });

      const deactivatedPackage = await trainingPackageDefinitionRepository.deactivate(createdPackage.id);

      expect(deactivatedPackage).toBeDefined();
      expect(deactivatedPackage?.isActive).toBe(false);
    });
  });

  describe("updatePrice", () => {
    it("должен обновлять цену пакета тренировок", async () => {
      const createdPackage = await createTestPackage({ price: "100.00" });

      const updatedPackage = await trainingPackageDefinitionRepository.updatePrice(createdPackage.id, 250);

      expect(updatedPackage).toBeDefined();
      expect(updatedPackage?.price).toBe("250.00");
    });
  });

  describe("delete", () => {
    it("должен удалять пакет тренировок", async () => {
      const createdPackage = await createTestPackage();

      const result = await trainingPackageDefinitionRepository.delete(createdPackage.id);

      expect(result).toBe(true);

      const deletedPackage = await trainingPackageDefinitionRepository.getById(createdPackage.id);
      expect(deletedPackage).toBeNull();
    });

    it("должен возвращать false при удалении несуществующего пакета", async () => {
      const result = await trainingPackageDefinitionRepository.delete("00000000-0000-0000-0000-000000000000");

      expect(result).toBe(false);
    });
  });

  describe("getCount", () => {
    it("должен возвращать общее количество пакетов тренировок", async () => {
      await createTestPackage({ isActive: true });
      await createTestPackage({ isActive: true });
      await createTestPackage({ isActive: false });

      const totalCount = await trainingPackageDefinitionRepository.getCount();
      const activeCount = await trainingPackageDefinitionRepository.getCount(true);

      expect(totalCount).toBe(3);
      expect(activeCount).toBe(2);
    });
  });

  describe("getStats", () => {
    it("должен возвращать статистику по пакетам тренировок", async () => {
      await createTestPackage({
        packageType: "group_training",
        isActive: true,
        price: "100.00",
        numberOfSessions: 10,
        validityDurationDays: 30
      });
      await createTestPackage({
        packageType: "group_training",
        isActive: false,
        price: "150.00",
        numberOfSessions: 15,
        validityDurationDays: 45
      });
      await createTestPackage({
        packageType: "private_training",
        isActive: true,
        price: "300.00",
        numberOfSessions: 8,
        validityDurationDays: 60
      });

      const stats = await trainingPackageDefinitionRepository.getStats();

      expect(stats.totalPackages).toBe(3);
      expect(stats.activePackages).toBe(2);
      expect(stats.inactivePackages).toBe(1);
      expect(stats.groupTrainingPackages).toBe(2);
      expect(stats.privateTrainingPackages).toBe(1);
      expect(stats.averagePrice).toBe("183.33"); // (100 + 150 + 300) / 3
      expect(stats.averageSessions).toBe("11.0"); // (10 + 15 + 8) / 3
      expect(stats.averageValidityDays).toBe("45.0"); // (30 + 45 + 60) / 3
    });

    it("должен возвращать нулевую статистику для пустой базы", async () => {
      const stats = await trainingPackageDefinitionRepository.getStats();

      expect(stats.totalPackages).toBe(0);
      expect(stats.activePackages).toBe(0);
      expect(stats.inactivePackages).toBe(0);
      expect(stats.groupTrainingPackages).toBe(0);
      expect(stats.privateTrainingPackages).toBe(0);
      expect(stats.averagePrice).toBe("0.00");
      expect(stats.averageSessions).toBe("0.0");
      expect(stats.averageValidityDays).toBe("0.0");
    });
  });

  describe("getMostPopular", () => {
    it("должен возвращать самые популярные пакеты по количеству сессий", async () => {
      await createTestPackage({ numberOfSessions: 5, name: "Small Package" });
      await createTestPackage({ numberOfSessions: 20, name: "Large Package" });
      await createTestPackage({ numberOfSessions: 10, name: "Medium Package" });

      const popularPackages = await trainingPackageDefinitionRepository.getMostPopular(2);

      expect(popularPackages).toHaveLength(2);
      expect(popularPackages[0].name).toBe("Large Package");
      expect(popularPackages[0].numberOfSessions).toBe(20);
      expect(popularPackages[1].name).toBe("Medium Package");
      expect(popularPackages[1].numberOfSessions).toBe(10);
    });
  });

  describe("getMostAffordable", () => {
    it("должен возвращать самые доступные пакеты по цене", async () => {
      await createTestPackage({ price: "200.00", name: "Expensive Package" });
      await createTestPackage({ price: "50.00", name: "Cheap Package" });
      await createTestPackage({ price: "100.00", name: "Medium Package" });

      const affordablePackages = await trainingPackageDefinitionRepository.getMostAffordable(2);

      expect(affordablePackages).toHaveLength(2);
      expect(affordablePackages[0].name).toBe("Cheap Package");
      expect(affordablePackages[0].price).toBe("50.00");
      expect(affordablePackages[1].name).toBe("Medium Package");
      expect(affordablePackages[1].price).toBe("100.00");
    });
  });

  describe("getLongestValidity", () => {
    it("должен возвращать пакеты с самым длительным сроком действия", async () => {
      await createTestPackage({ validityDurationDays: 30, name: "Short Package" });
      await createTestPackage({ validityDurationDays: 90, name: "Long Package" });
      await createTestPackage({ validityDurationDays: 60, name: "Medium Package" });

      const longValidityPackages = await trainingPackageDefinitionRepository.getLongestValidity(2);

      expect(longValidityPackages).toHaveLength(2);
      expect(longValidityPackages[0].name).toBe("Long Package");
      expect(longValidityPackages[0].validityDurationDays).toBe(90);
      expect(longValidityPackages[1].name).toBe("Medium Package");
      expect(longValidityPackages[1].validityDurationDays).toBe(60);
    });
  });

  describe("bulkUpdateActiveStatus", () => {
    it("должен массово обновлять статус активности", async () => {
      const package1 = await createTestPackage({ isActive: true, name: "Package 1" });
      const package2 = await createTestPackage({ isActive: true, name: "Package 2" });
      const package3 = await createTestPackage({ isActive: true, name: "Package 3" });

      const updatedCount = await trainingPackageDefinitionRepository.bulkUpdateActiveStatus(
        [package1.id, package2.id],
        false
      );

      expect(updatedCount).toBe(2);

      const updatedPackage1 = await trainingPackageDefinitionRepository.getById(package1.id);
      const updatedPackage2 = await trainingPackageDefinitionRepository.getById(package2.id);
      const unchangedPackage3 = await trainingPackageDefinitionRepository.getById(package3.id);

      expect(updatedPackage1?.isActive).toBe(false);
      expect(updatedPackage2?.isActive).toBe(false);
      expect(unchangedPackage3?.isActive).toBe(true);
    });

    it("должен возвращать 0 для пустого массива ID", async () => {
      const updatedCount = await trainingPackageDefinitionRepository.bulkUpdateActiveStatus([], true);

      expect(updatedCount).toBe(0);
    });
  });

  describe("existsByName", () => {
    it("должен проверять существование пакета по названию", async () => {
      await createTestPackage({ name: "Unique Package Name" });

      const exists = await trainingPackageDefinitionRepository.existsByName("Unique Package Name");
      const notExists = await trainingPackageDefinitionRepository.existsByName("Non-existent Package");

      expect(exists).toBe(true);
      expect(notExists).toBe(false);
    });

    it("должен исключать определенный ID при проверке", async () => {
      const existingPackage = await createTestPackage({ name: "Test Package" });

      const existsWithExclusion = await trainingPackageDefinitionRepository.existsByName(
        "Test Package",
        existingPackage.id
      );

      expect(existsWithExclusion).toBe(false);
    });
  });

  describe("getByCurrency", () => {
    it("должен возвращать пакеты по валюте", async () => {
      await createTestPackage({ currency: "USD", name: "USD Package 1" });
      await createTestPackage({ currency: "USD", name: "USD Package 2" });
      await createTestPackage({ currency: "EUR", name: "EUR Package" });

      const usdPackages = await trainingPackageDefinitionRepository.getByCurrency("USD");
      const eurPackages = await trainingPackageDefinitionRepository.getByCurrency("EUR");

      expect(usdPackages).toHaveLength(2);
      expect(usdPackages.every(p => p.currency === "USD")).toBe(true);

      expect(eurPackages).toHaveLength(1);
      expect(eurPackages[0].currency).toBe("EUR");
    });
  });

  describe("getByValidityRange", () => {
    it("должен возвращать пакеты по диапазону срока действия", async () => {
      await createTestPackage({ validityDurationDays: 15, name: "Short Package" });
      await createTestPackage({ validityDurationDays: 45, name: "Medium Package" });
      await createTestPackage({ validityDurationDays: 90, name: "Long Package" });

      const mediumRangePackages = await trainingPackageDefinitionRepository.getByValidityRange(30, 60);

      expect(mediumRangePackages).toHaveLength(1);
      expect(mediumRangePackages[0].name).toBe("Medium Package");
      expect(mediumRangePackages[0].validityDurationDays).toBe(45);
    });

    it("должен возвращать пакеты с минимальным сроком действия", async () => {
      await createTestPackage({ validityDurationDays: 15, name: "Short Package" });
      await createTestPackage({ validityDurationDays: 45, name: "Medium Package" });
      await createTestPackage({ validityDurationDays: 90, name: "Long Package" });

      const longValidityPackages = await trainingPackageDefinitionRepository.getByValidityRange(30);

      expect(longValidityPackages).toHaveLength(2);
      expect(longValidityPackages.every(p => p.validityDurationDays >= 30)).toBe(true);
    });
  });

  describe("getAll", () => {
    it("должен возвращать все пакеты с пагинацией", async () => {
      // Создаем 5 пакетов
      for (let i = 0; i < 5; i++) {
        await createTestPackage({
          name: `Package ${i}`,
          isActive: i % 2 === 0 // Четные активные, нечетные неактивные
        });
      }

      const allPackages = await trainingPackageDefinitionRepository.getAll();
      const limitedPackages = await trainingPackageDefinitionRepository.getAll(3);
      const offsetPackages = await trainingPackageDefinitionRepository.getAll(3, 2);
      const activeOnlyPackages = await trainingPackageDefinitionRepository.getAll(100, 0, true);

      expect(allPackages).toHaveLength(5);
      expect(limitedPackages).toHaveLength(3);
      expect(offsetPackages).toHaveLength(3);
      expect(activeOnlyPackages).toHaveLength(3); // Пакеты 0, 2, 4 активные
      expect(activeOnlyPackages.every(p => p.isActive)).toBe(true);
    });
  });
});
