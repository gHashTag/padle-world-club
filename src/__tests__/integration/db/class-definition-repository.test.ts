import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../../../db/schema";
import {
  classDefinitions,
  NewClassDefinition,
} from "../../../db/schema";
import { ClassDefinitionRepository } from "../../../repositories/class-definition-repository";
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
const classDefinitionRepository = new ClassDefinitionRepository(db);

describe("ClassDefinitionRepository", () => {
  // Функция для очистки таблиц перед/после тестов
  const cleanupDatabase = async () => {
    await db.delete(classDefinitions);
  };

  beforeEach(async () => {
    await cleanupDatabase();
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  // Вспомогательная функция для создания тестового определения класса
  const createTestClassDefinition = async (customData: Partial<NewClassDefinition> = {}): Promise<schema.ClassDefinition> => {
    const defaultClassData: NewClassDefinition = {
      name: "Test Group Training",
      description: "Test group training class",
      classType: "group_training",
      basePrice: "50.00",
      currency: "USD",
      minSkillLevel: "beginner",
      maxSkillLevel: "intermediate",
      isActive: true,
      ...customData,
    };

    return await classDefinitionRepository.create(defaultClassData);
  };

  describe("create", () => {
    it("должен создавать определение класса с обязательными полями", async () => {
      const classData: NewClassDefinition = {
        name: "Beginner Paddle Training",
        description: "Training for beginners",
        classType: "group_training",
        basePrice: "40.00",
        currency: "USD",
        isActive: true,
      };

      const classDefinition = await classDefinitionRepository.create(classData);

      expect(classDefinition).toBeDefined();
      expect(classDefinition.id).toBeDefined();
      expect(classDefinition.name).toBe("Beginner Paddle Training");
      expect(classDefinition.description).toBe("Training for beginners");
      expect(classDefinition.classType).toBe("group_training");
      expect(classDefinition.basePrice).toBe("40.00");
      expect(classDefinition.currency).toBe("USD");
      expect(classDefinition.isActive).toBe(true);
    });

    it("должен создавать определение класса с ограничениями по уровню навыков", async () => {
      const classData: NewClassDefinition = {
        name: "Advanced Paddle Training",
        classType: "coached_drill",
        basePrice: "80.00",
        currency: "EUR",
        minSkillLevel: "advanced",
        maxSkillLevel: "professional",
        isActive: true,
      };

      const classDefinition = await classDefinitionRepository.create(classData);

      expect(classDefinition).toBeDefined();
      expect(classDefinition.minSkillLevel).toBe("advanced");
      expect(classDefinition.maxSkillLevel).toBe("professional");
      expect(classDefinition.classType).toBe("coached_drill");
    });
  });

  describe("getById", () => {
    it("должен возвращать определение класса по ID", async () => {
      const createdClass = await createTestClassDefinition();

      const classDefinition = await classDefinitionRepository.getById(createdClass.id);

      expect(classDefinition).toBeDefined();
      expect(classDefinition?.id).toBe(createdClass.id);
      expect(classDefinition?.name).toBe(createdClass.name);
    });

    it("должен возвращать null, если определение класса не найдено", async () => {
      const classDefinition = await classDefinitionRepository.getById("00000000-0000-0000-0000-000000000000");

      expect(classDefinition).toBeNull();
    });
  });

  describe("getByType", () => {
    it("должен возвращать определения классов по типу", async () => {
      await createTestClassDefinition({ classType: "group_training", name: "Group Training 1" });
      await createTestClassDefinition({ classType: "open_play_session", name: "Open Play 1" });
      await createTestClassDefinition({ classType: "group_training", name: "Group Training 2" });

      const groupTrainingClasses = await classDefinitionRepository.getByType("group_training");
      const openPlayClasses = await classDefinitionRepository.getByType("open_play_session");

      expect(groupTrainingClasses).toHaveLength(2);
      expect(groupTrainingClasses.every(c => c.classType === "group_training")).toBe(true);

      expect(openPlayClasses).toHaveLength(1);
      expect(openPlayClasses[0].classType).toBe("open_play_session");
    });

    it("должен фильтровать только активные классы по умолчанию", async () => {
      await createTestClassDefinition({ classType: "group_training", isActive: true });
      await createTestClassDefinition({ classType: "group_training", isActive: false });

      const activeClasses = await classDefinitionRepository.getByType("group_training");
      const allClasses = await classDefinitionRepository.getByType("group_training", false);

      expect(activeClasses).toHaveLength(1);
      expect(activeClasses[0].isActive).toBe(true);

      expect(allClasses).toHaveLength(2);
    });
  });

  describe("getByPriceRange", () => {
    it("должен возвращать классы в диапазоне цен", async () => {
      await createTestClassDefinition({ basePrice: "30.00", currency: "USD" });
      await createTestClassDefinition({ basePrice: "50.00", currency: "USD" });
      await createTestClassDefinition({ basePrice: "70.00", currency: "USD" });
      await createTestClassDefinition({ basePrice: "90.00", currency: "USD" });

      const classesInRange = await classDefinitionRepository.getByPriceRange("40.00", "80.00");

      expect(classesInRange).toHaveLength(2);
      expect(classesInRange.some(c => c.basePrice === "50.00")).toBe(true);
      expect(classesInRange.some(c => c.basePrice === "70.00")).toBe(true);
    });

    it("должен фильтровать по валюте", async () => {
      await createTestClassDefinition({ basePrice: "50.00", currency: "USD" });
      await createTestClassDefinition({ basePrice: "50.00", currency: "EUR" });

      const usdClasses = await classDefinitionRepository.getByPriceRange("0.00", "100.00", "USD");
      const eurClasses = await classDefinitionRepository.getByPriceRange("0.00", "100.00", "EUR");

      expect(usdClasses).toHaveLength(1);
      expect(usdClasses[0].currency).toBe("USD");

      expect(eurClasses).toHaveLength(1);
      expect(eurClasses[0].currency).toBe("EUR");
    });
  });

  describe("getBySkillLevel", () => {
    it("должен возвращать классы (пока без фильтрации по уровню)", async () => {
      await createTestClassDefinition({ minSkillLevel: "beginner", maxSkillLevel: "intermediate" });
      await createTestClassDefinition({ minSkillLevel: "advanced", maxSkillLevel: "professional" });

      const classes = await classDefinitionRepository.getBySkillLevel("intermediate");

      // Пока метод возвращает все классы, так как логика фильтрации не реализована
      expect(classes).toHaveLength(2);
    });
  });

  describe("searchByName", () => {
    it("должен искать классы по названию", async () => {
      await createTestClassDefinition({ name: "Beginner Paddle Training" });
      await createTestClassDefinition({ name: "Advanced Tennis Training" });
      await createTestClassDefinition({ name: "Open Paddle Session" });

      const paddleClasses = await classDefinitionRepository.searchByName("Paddle");
      const trainingClasses = await classDefinitionRepository.searchByName("Training");

      expect(paddleClasses).toHaveLength(2);
      expect(paddleClasses.every(c => c.name.includes("Paddle"))).toBe(true);

      expect(trainingClasses).toHaveLength(2);
      expect(trainingClasses.every(c => c.name.includes("Training"))).toBe(true);
    });

    it("должен быть нечувствительным к регистру", async () => {
      await createTestClassDefinition({ name: "Beginner Paddle Training" });

      const classes = await classDefinitionRepository.searchByName("paddle");

      expect(classes).toHaveLength(1);
      expect(classes[0].name).toBe("Beginner Paddle Training");
    });
  });

  describe("getAll", () => {
    it("должен возвращать все определения классов", async () => {
      await createTestClassDefinition({ name: "Class 1" });
      await createTestClassDefinition({ name: "Class 2" });

      const allClasses = await classDefinitionRepository.getAll(false);

      expect(allClasses).toHaveLength(2);
    });

    it("должен возвращать только активные классы по умолчанию", async () => {
      await createTestClassDefinition({ name: "Active Class", isActive: true });
      await createTestClassDefinition({ name: "Inactive Class", isActive: false });

      const activeClasses = await classDefinitionRepository.getAll();
      const allClasses = await classDefinitionRepository.getAll(false);

      expect(activeClasses).toHaveLength(1);
      expect(activeClasses[0].isActive).toBe(true);

      expect(allClasses).toHaveLength(2);
    });
  });

  describe("getActive", () => {
    it("должен возвращать только активные классы", async () => {
      await createTestClassDefinition({ isActive: true });
      await createTestClassDefinition({ isActive: false });

      const activeClasses = await classDefinitionRepository.getActive();

      expect(activeClasses).toHaveLength(1);
      expect(activeClasses[0].isActive).toBe(true);
    });
  });

  describe("getInactive", () => {
    it("должен возвращать только неактивные классы", async () => {
      await createTestClassDefinition({ isActive: true });
      await createTestClassDefinition({ isActive: false });

      const inactiveClasses = await classDefinitionRepository.getInactive();

      expect(inactiveClasses).toHaveLength(1);
      expect(inactiveClasses[0].isActive).toBe(false);
    });
  });

  describe("update", () => {
    it("должен обновлять данные определения класса", async () => {
      const createdClass = await createTestClassDefinition();

      const updatedClass = await classDefinitionRepository.update(createdClass.id, {
        name: "Updated Class Name",
        basePrice: "75.00",
        description: "Updated description",
      });

      expect(updatedClass).toBeDefined();
      expect(updatedClass?.id).toBe(createdClass.id);
      expect(updatedClass?.name).toBe("Updated Class Name");
      expect(updatedClass?.basePrice).toBe("75.00");
      expect(updatedClass?.description).toBe("Updated description");
      expect(updatedClass?.classType).toBe(createdClass.classType); // Не изменилось
    });

    it("должен возвращать null при обновлении несуществующего класса", async () => {
      const updatedClass = await classDefinitionRepository.update("00000000-0000-0000-0000-000000000000", {
        name: "Non-existent Class",
      });

      expect(updatedClass).toBeNull();
    });
  });

  describe("activate", () => {
    it("должен активировать определение класса", async () => {
      const createdClass = await createTestClassDefinition({ isActive: false });

      const activatedClass = await classDefinitionRepository.activate(createdClass.id);

      expect(activatedClass).toBeDefined();
      expect(activatedClass?.isActive).toBe(true);
    });
  });

  describe("deactivate", () => {
    it("должен деактивировать определение класса", async () => {
      const createdClass = await createTestClassDefinition({ isActive: true });

      const deactivatedClass = await classDefinitionRepository.deactivate(createdClass.id);

      expect(deactivatedClass).toBeDefined();
      expect(deactivatedClass?.isActive).toBe(false);
    });
  });

  describe("updatePrice", () => {
    it("должен обновлять цену определения класса", async () => {
      const createdClass = await createTestClassDefinition({ basePrice: "50.00" });

      const updatedClass = await classDefinitionRepository.updatePrice(createdClass.id, "75.00");

      expect(updatedClass).toBeDefined();
      expect(updatedClass?.basePrice).toBe("75.00");
    });
  });

  describe("delete", () => {
    it("должен удалять определение класса", async () => {
      const createdClass = await createTestClassDefinition();

      const result = await classDefinitionRepository.delete(createdClass.id);

      expect(result).toBe(true);

      const deletedClass = await classDefinitionRepository.getById(createdClass.id);
      expect(deletedClass).toBeNull();
    });

    it("должен возвращать false при удалении несуществующего класса", async () => {
      const result = await classDefinitionRepository.delete("00000000-0000-0000-0000-000000000000");

      expect(result).toBe(false);
    });
  });

  describe("getStats", () => {
    it("должен возвращать статистику по определениям классов", async () => {
      await createTestClassDefinition({
        classType: "group_training",
        basePrice: "50.00",
        isActive: true
      });
      await createTestClassDefinition({
        classType: "group_training",
        basePrice: "60.00",
        isActive: true
      });
      await createTestClassDefinition({
        classType: "open_play_session",
        basePrice: "30.00",
        isActive: true
      });
      await createTestClassDefinition({
        classType: "coached_drill",
        basePrice: "80.00",
        isActive: false
      });

      const stats = await classDefinitionRepository.getStats();

      expect(stats.totalClasses).toBe(4);
      expect(stats.activeClasses).toBe(3);
      expect(stats.inactiveClasses).toBe(1);
      expect(stats.classesByType.group_training).toBe(2);
      expect(stats.classesByType.open_play_session).toBe(1);
      expect(stats.classesByType.coached_drill).toBe(1);
      expect(stats.averagePrice).toBe("46.67"); // (50 + 60 + 30) / 3
    });

    it("должен возвращать нулевую статистику для пустой базы", async () => {
      const stats = await classDefinitionRepository.getStats();

      expect(stats.totalClasses).toBe(0);
      expect(stats.activeClasses).toBe(0);
      expect(stats.inactiveClasses).toBe(0);
      expect(stats.classesByType).toEqual({});
      expect(stats.averagePrice).toBe("0.00");
    });
  });

  describe("isNameExists", () => {
    it("должен возвращать true, если название уже существует", async () => {
      await createTestClassDefinition({ name: "Unique Class Name" });

      const exists = await classDefinitionRepository.isNameExists("Unique Class Name");

      expect(exists).toBe(true);
    });

    it("должен возвращать false, если название не существует", async () => {
      const exists = await classDefinitionRepository.isNameExists("Non-existent Class Name");

      expect(exists).toBe(false);
    });

    it("должен исключать определенный ID при проверке", async () => {
      const createdClass = await createTestClassDefinition({ name: "Test Class" });

      // Проверяем существование того же названия, исключая созданный класс
      const exists = await classDefinitionRepository.isNameExists("Test Class", createdClass.id);

      // Должно вернуть false, так как мы исключили единственный класс с таким названием
      expect(exists).toBe(false);
    });
  });
});
