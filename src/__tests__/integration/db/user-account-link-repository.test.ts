import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../../../db/schema";
import { users, NewUser, userAccountLinks, NewUserAccountLink } from "../../../db/schema";
import { UserRepository } from "../../../repositories/user-repository";
import { UserAccountLinkRepository } from "../../../repositories/user-account-link-repository";
import { NotificationChannel } from "../../../types";
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
const userRepository = new UserRepository(db);
const userAccountLinkRepository = new UserAccountLinkRepository(db);

describe("UserAccountLinkRepository", () => {
  // Функция для очистки таблиц перед/после тестов
  const cleanupDatabase = async () => {
    await db.delete(userAccountLinks);
    await db.delete(users);
  };

  beforeEach(async () => {
    await cleanupDatabase();
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  // Вспомогательная функция для создания тестового пользователя
  const createTestUser = async (customData: Partial<NewUser> = {}): Promise<schema.User> => {
    const defaultUserData: NewUser = {
      username: "testuser",
      passwordHash: "hash123",
      firstName: "Test",
      lastName: "User",
      email: "test@example.com",
      memberId: "MEM001",
      userRole: "player",
      ...customData,
    };

    return await userRepository.create(defaultUserData);
  };

  // Вспомогательная функция для создания тестовой связи аккаунта
  const createTestLink = async (
    userId: string,
    platform: NotificationChannel = "telegram",
    platformUserId: string = "123456789",
    isPrimary: boolean = false
  ): Promise<schema.UserAccountLink> => {
    const linkData: NewUserAccountLink = {
      userId,
      platform,
      platformUserId,
      isPrimary,
    };

    return await userAccountLinkRepository.create(linkData);
  };

  describe("create", () => {
    it("должен создавать связь аккаунта", async () => {
      const user = await createTestUser();

      const linkData: NewUserAccountLink = {
        userId: user.id,
        platform: "telegram",
        platformUserId: "123456789",
      };

      const link = await userAccountLinkRepository.create(linkData);

      expect(link).toBeDefined();
      expect(link.id).toBeDefined();
      expect(link.userId).toBe(user.id);
      expect(link.platform).toBe("telegram");
      expect(link.platformUserId).toBe("123456789");
      expect(link.isPrimary).toBe(false); // Значение по умолчанию
    });

    it("должен создавать связь аккаунта с isPrimary = true", async () => {
      const user = await createTestUser();

      const linkData: NewUserAccountLink = {
        userId: user.id,
        platform: "telegram",
        platformUserId: "123456789",
        isPrimary: true,
      };

      const link = await userAccountLinkRepository.create(linkData);

      expect(link).toBeDefined();
      expect(link.isPrimary).toBe(true);
    });

    it("должен выбрасывать ошибку при создании связи для несуществующего пользователя", async () => {
      const linkData: NewUserAccountLink = {
        userId: "00000000-0000-0000-0000-000000000000",
        platform: "telegram",
        platformUserId: "123456789",
      };

      await expect(userAccountLinkRepository.create(linkData)).rejects.toThrow();
    });
  });

  describe("getById", () => {
    it("должен возвращать связь аккаунта по ID", async () => {
      const user = await createTestUser();
      const createdLink = await createTestLink(user.id);

      const link = await userAccountLinkRepository.getById(createdLink.id);

      expect(link).toBeDefined();
      expect(link?.id).toBe(createdLink.id);
      expect(link?.userId).toBe(user.id);
      expect(link?.platform).toBe("telegram");
      expect(link?.platformUserId).toBe("123456789");
    });

    it("должен возвращать null, если связь не найдена", async () => {
      const link = await userAccountLinkRepository.getById("00000000-0000-0000-0000-000000000000");

      expect(link).toBeNull();
    });
  });

  describe("getByUserAndPlatform", () => {
    it("должен возвращать связь аккаунта по userId, platform и platformUserId", async () => {
      const user = await createTestUser();
      await createTestLink(user.id, "telegram", "123456789");

      const link = await userAccountLinkRepository.getByUserAndPlatform(
        user.id,
        "telegram",
        "123456789"
      );

      expect(link).toBeDefined();
      expect(link?.userId).toBe(user.id);
      expect(link?.platform).toBe("telegram");
      expect(link?.platformUserId).toBe("123456789");
    });

    it("должен возвращать null, если связь не найдена", async () => {
      const user = await createTestUser();

      const link = await userAccountLinkRepository.getByUserAndPlatform(
        user.id,
        "telegram",
        "nonexistent"
      );

      expect(link).toBeNull();
    });
  });

  describe("getAllByUserId", () => {
    it("должен возвращать все связи аккаунтов пользователя", async () => {
      const user = await createTestUser();
      await createTestLink(user.id, "telegram", "123456789");
      await createTestLink(user.id, "whatsapp", "987654321");
      await createTestLink(user.id, "email", "test@example.com");

      const links = await userAccountLinkRepository.getAllByUserId(user.id);

      expect(links).toHaveLength(3);
      expect(links.map(l => l.platform).sort()).toEqual(["email", "telegram", "whatsapp"]);
    });

    it("должен возвращать пустой массив, если у пользователя нет связей", async () => {
      const user = await createTestUser();

      const links = await userAccountLinkRepository.getAllByUserId(user.id);

      expect(links).toHaveLength(0);
    });
  });

  describe("getByPlatformAndId", () => {
    it("должен возвращать связи аккаунтов по platform и platformUserId", async () => {
      const user1 = await createTestUser({ username: "user1", email: "user1@example.com", memberId: "MEM101" });
      const user2 = await createTestUser({ username: "user2", email: "user2@example.com", memberId: "MEM102" });

      await createTestLink(user1.id, "telegram", "shared");
      await createTestLink(user2.id, "telegram", "shared");

      const links = await userAccountLinkRepository.getByPlatformAndId("telegram", "shared");

      expect(links).toHaveLength(2);
      expect(links.map(l => l.userId).sort()).toEqual([user1.id, user2.id].sort());
    });

    it("должен возвращать пустой массив, если связи не найдены", async () => {
      const links = await userAccountLinkRepository.getByPlatformAndId("telegram", "nonexistent");

      expect(links).toHaveLength(0);
    });
  });

  describe("update", () => {
    it("должен обновлять данные связи аккаунта", async () => {
      const user = await createTestUser();
      const createdLink = await createTestLink(user.id);

      const updatedLink = await userAccountLinkRepository.update(createdLink.id, {
        platformUserId: "updated",
        isPrimary: true,
      });

      expect(updatedLink).toBeDefined();
      expect(updatedLink?.id).toBe(createdLink.id);
      expect(updatedLink?.platformUserId).toBe("updated");
      expect(updatedLink?.isPrimary).toBe(true);
      expect(updatedLink?.platform).toBe(createdLink.platform); // Не изменилось
    });

    it("должен возвращать null при обновлении несуществующей связи", async () => {
      const updatedLink = await userAccountLinkRepository.update("00000000-0000-0000-0000-000000000000", {
        platformUserId: "updated",
      });

      expect(updatedLink).toBeNull();
    });
  });

  describe("setPrimary", () => {
    it("должен устанавливать связь как основную и сбрасывать флаг для других связей", async () => {
      const user = await createTestUser();
      const link1 = await createTestLink(user.id, "telegram", "123", true);
      const link2 = await createTestLink(user.id, "whatsapp", "456", false);
      const link3 = await createTestLink(user.id, "email", "789", false);

      // Проверяем, что link1 изначально основной
      expect(link1.isPrimary).toBe(true);
      expect(link2.isPrimary).toBe(false);
      expect(link3.isPrimary).toBe(false);

      // Устанавливаем link2 как основной
      const updatedLink = await userAccountLinkRepository.setPrimary(link2.id);

      expect(updatedLink).toBeDefined();
      expect(updatedLink?.id).toBe(link2.id);
      expect(updatedLink?.isPrimary).toBe(true);

      // Проверяем, что остальные связи не основные
      const allLinks = await userAccountLinkRepository.getAllByUserId(user.id);
      const primaryLinks = allLinks.filter(l => l.isPrimary);

      expect(primaryLinks).toHaveLength(1);
      expect(primaryLinks[0].id).toBe(link2.id);
    });

    it("должен возвращать null при установке несуществующей связи как основной", async () => {
      const result = await userAccountLinkRepository.setPrimary("00000000-0000-0000-0000-000000000000");

      expect(result).toBeNull();
    });
  });

  describe("delete", () => {
    it("должен удалять связь аккаунта", async () => {
      const user = await createTestUser();
      const createdLink = await createTestLink(user.id);

      const result = await userAccountLinkRepository.delete(createdLink.id);

      expect(result).toBe(true);

      const deletedLink = await userAccountLinkRepository.getById(createdLink.id);
      expect(deletedLink).toBeNull();
    });

    it("должен возвращать false при удалении несуществующей связи", async () => {
      const result = await userAccountLinkRepository.delete("00000000-0000-0000-0000-000000000000");

      expect(result).toBe(false);
    });
  });

  describe("deleteAllByUserId", () => {
    it("должен удалять все связи аккаунтов пользователя", async () => {
      const user = await createTestUser();
      await createTestLink(user.id, "telegram", "123");
      await createTestLink(user.id, "whatsapp", "456");
      await createTestLink(user.id, "email", "789");

      const deletedCount = await userAccountLinkRepository.deleteAllByUserId(user.id);

      expect(deletedCount).toBe(3);

      const remainingLinks = await userAccountLinkRepository.getAllByUserId(user.id);
      expect(remainingLinks).toHaveLength(0);
    });

    it("должен возвращать 0 при удалении связей несуществующего пользователя", async () => {
      const deletedCount = await userAccountLinkRepository.deleteAllByUserId("00000000-0000-0000-0000-000000000000");

      expect(deletedCount).toBe(0);
    });
  });
});
