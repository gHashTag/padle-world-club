import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { sql } from "drizzle-orm";
import * as schema from "../../../db/schema";
import { users, NewUser, bookings, gamePlayers, tournamentParticipants, tournamentTeams, ratingChanges, payments, userAccountLinks, userTrainingPackages, classParticipants, bookingParticipants, gameSessions } from "../../../db/schema";
import { UserRepository } from "../../../repositories/user-repository";
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

describe("UserRepository", () => {
  // Функция для очистки таблиц перед/после тестов
  const cleanupDatabase = async () => {
    try {
      // Используем TRUNCATE CASCADE для очистки всех связанных таблиц
      await db.execute(sql`TRUNCATE TABLE "user" CASCADE`);
    } catch (error) {
      console.error('Error cleaning up database:', error);
      // Если TRUNCATE не работает, попробуем удалить по одной таблице
      try {
        await db.delete(gameSessions);
        await db.delete(classParticipants);
        await db.delete(userTrainingPackages);
        await db.delete(userAccountLinks);
        await db.delete(payments);
        await db.delete(ratingChanges);
        await db.delete(tournamentTeams);
        await db.delete(tournamentParticipants);
        await db.delete(gamePlayers);
        await db.delete(bookingParticipants);
        await db.delete(bookings);
        await db.delete(users);
      } catch (deleteError) {
        console.error('Error deleting from tables:', deleteError);
      }
    }
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

  describe("create", () => {
    it("должен создавать пользователя с обязательными полями", async () => {
      const userData: NewUser = {
        username: "testuser1",
        passwordHash: "hash123",
        firstName: "Test",
        lastName: "User",
        email: "test1@example.com",
        memberId: "MEM001",
        userRole: "player",
      };

      const user = await userRepository.create(userData);

      expect(user).toBeDefined();
      expect(user.id).toBeDefined();
      expect(user.username).toBe(userData.username);
      expect(user.email).toBe(userData.email);
      expect(user.currentRating).toBe(1500.0); // Значение по умолчанию
      expect(user.bonusPoints).toBe(0); // Значение по умолчанию
      expect(user.isAccountVerified).toBe(false); // Значение по умолчанию
    });

    it("должен создавать пользователя с опциональными полями", async () => {
      const userData: NewUser = {
        username: "testuser2",
        passwordHash: "hash123",
        firstName: "Test",
        lastName: "User",
        email: "test2@example.com",
        phone: "123456789",
        memberId: "MEM002",
        userRole: "coach",
        profileImageUrl: "http://example.com/img.png",
        gender: "male",
        dateOfBirth: "1990-01-01",
      };

      const user = await userRepository.create(userData);

      expect(user).toBeDefined();
      expect(user.phone).toBe(userData.phone);
      expect(user.profileImageUrl).toBe(userData.profileImageUrl);
      expect(user.gender).toBe(userData.gender);
      // В PostgreSQL дата может возвращаться в разных форматах, поэтому проверяем только наличие даты
      expect(user.dateOfBirth).toBeDefined();
    });

    it("должен выбрасывать ошибку при создании пользователя с существующим username", async () => {
      await createTestUser({ username: "duplicate" });

      await expect(
        createTestUser({
          username: "duplicate",
          email: "unique@example.com",
          memberId: "MEM003"
        })
      ).rejects.toThrow();
    });

    it("должен выбрасывать ошибку при создании пользователя с существующим email", async () => {
      await createTestUser({ email: "duplicate@example.com" });

      await expect(
        createTestUser({
          username: "unique",
          email: "duplicate@example.com",
          memberId: "MEM004"
        })
      ).rejects.toThrow();
    });

    it("должен выбрасывать ошибку при создании пользователя с существующим phone", async () => {
      await createTestUser({ phone: "123456789" });

      await expect(
        createTestUser({
          username: "unique2",
          email: "unique2@example.com",
          phone: "123456789",
          memberId: "MEM005"
        })
      ).rejects.toThrow();
    });

    it("должен выбрасывать ошибку при создании пользователя с существующим memberId", async () => {
      await createTestUser({ memberId: "DUPLICATE" });

      await expect(
        createTestUser({
          username: "unique3",
          email: "unique3@example.com",
          memberId: "DUPLICATE"
        })
      ).rejects.toThrow();
    });
  });

  describe("getById", () => {
    it("должен возвращать пользователя по ID", async () => {
      const createdUser = await createTestUser();

      const user = await userRepository.getById(createdUser.id);

      expect(user).toBeDefined();
      expect(user?.id).toBe(createdUser.id);
      expect(user?.username).toBe(createdUser.username);
    });

    it("должен возвращать null, если пользователь не найден", async () => {
      const user = await userRepository.getById("00000000-0000-0000-0000-000000000000");

      expect(user).toBeNull();
    });
  });

  describe("getByUsername", () => {
    it("должен возвращать пользователя по username", async () => {
      const createdUser = await createTestUser({ username: "findbyusername" });

      const user = await userRepository.getByUsername("findbyusername");

      expect(user).toBeDefined();
      expect(user?.id).toBe(createdUser.id);
      expect(user?.username).toBe("findbyusername");
    });

    it("должен возвращать null, если пользователь не найден", async () => {
      const user = await userRepository.getByUsername("nonexistent");

      expect(user).toBeNull();
    });
  });

  describe("getByEmail", () => {
    it("должен возвращать пользователя по email", async () => {
      const createdUser = await createTestUser({ email: "findbyemail@example.com" });

      const user = await userRepository.getByEmail("findbyemail@example.com");

      expect(user).toBeDefined();
      expect(user?.id).toBe(createdUser.id);
      expect(user?.email).toBe("findbyemail@example.com");
    });

    it("должен возвращать null, если пользователь не найден", async () => {
      const user = await userRepository.getByEmail("nonexistent@example.com");

      expect(user).toBeNull();
    });
  });

  describe("getByPhone", () => {
    it("должен возвращать пользователя по phone", async () => {
      const createdUser = await createTestUser({ phone: "987654321" });

      const user = await userRepository.getByPhone("987654321");

      expect(user).toBeDefined();
      expect(user?.id).toBe(createdUser.id);
      expect(user?.phone).toBe("987654321");
    });

    it("должен возвращать null, если пользователь не найден", async () => {
      const user = await userRepository.getByPhone("nonexistent");

      expect(user).toBeNull();
    });
  });

  describe("getByMemberId", () => {
    it("должен возвращать пользователя по memberId", async () => {
      const createdUser = await createTestUser({ memberId: "FINDMEMBER" });

      const user = await userRepository.getByMemberId("FINDMEMBER");

      expect(user).toBeDefined();
      expect(user?.id).toBe(createdUser.id);
      expect(user?.memberId).toBe("FINDMEMBER");
    });

    it("должен возвращать null, если пользователь не найден", async () => {
      const user = await userRepository.getByMemberId("NONEXISTENT");

      expect(user).toBeNull();
    });
  });

  describe("getAll", () => {
    it("должен возвращать всех пользователей", async () => {
      await createTestUser({ username: "user1", email: "user1@example.com", memberId: "MEM101" });
      await createTestUser({ username: "user2", email: "user2@example.com", memberId: "MEM102" });
      await createTestUser({ username: "user3", email: "user3@example.com", memberId: "MEM103" });

      const allUsers = await userRepository.getAll();

      expect(allUsers).toHaveLength(3);
      expect(allUsers.map(u => u.username).sort()).toEqual(["user1", "user2", "user3"]);
    });

    it("должен возвращать пустой массив, если пользователей нет", async () => {
      const allUsers = await userRepository.getAll();

      expect(allUsers).toHaveLength(0);
    });
  });

  describe("update", () => {
    it("должен обновлять данные пользователя", async () => {
      const createdUser = await createTestUser();

      const updatedUser = await userRepository.update(createdUser.id, {
        firstName: "Updated",
        lastName: "Name",
        currentRating: 2000,
      });

      expect(updatedUser).toBeDefined();
      expect(updatedUser?.id).toBe(createdUser.id);
      expect(updatedUser?.firstName).toBe("Updated");
      expect(updatedUser?.lastName).toBe("Name");
      expect(updatedUser?.currentRating).toBe(2000);
      expect(updatedUser?.username).toBe(createdUser.username); // Не изменилось
    });

    it("должен возвращать null при обновлении несуществующего пользователя", async () => {
      const updatedUser = await userRepository.update("00000000-0000-0000-0000-000000000000", {
        firstName: "Updated",
      });

      expect(updatedUser).toBeNull();
    });

    it("должен выбрасывать ошибку при обновлении на существующий username", async () => {
      await createTestUser({ username: "existing", email: "existing@example.com", memberId: "MEM101" });
      const userToUpdate = await createTestUser({ username: "toupdate", email: "toupdate@example.com", memberId: "MEM102" });

      await expect(
        userRepository.update(userToUpdate.id, { username: "existing" })
      ).rejects.toThrow();
    });
  });

  describe("delete", () => {
    it("должен удалять пользователя", async () => {
      const createdUser = await createTestUser();

      const result = await userRepository.delete(createdUser.id);

      expect(result).toBe(true);

      const deletedUser = await userRepository.getById(createdUser.id);
      expect(deletedUser).toBeNull();
    });

    it("должен возвращать false при удалении несуществующего пользователя", async () => {
      const result = await userRepository.delete("00000000-0000-0000-0000-000000000000");

      expect(result).toBe(false);
    });
  });
});
