import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../../../db/schema";
import { users, NewUser } from "../../../db/schema";
// import { userAccountLinks, NewUserAccountLink, UserAccountLink } from "../../../db/schema"; // Закомментировано

// TODO: Перенести URL в переменные окружения, специфичные для тестов,
// и убедиться, что это отдельная тестовая база данных!
const DATABASE_URL_TEST =
  process.env.DATABASE_URL_TEST || process.env.DATABASE_URL;

if (!DATABASE_URL_TEST) {
  throw new Error(
    "DATABASE_URL_TEST или DATABASE_URL для тестов не установлена в переменных окружения"
  );
}

const pool = new Pool({
  connectionString: DATABASE_URL_TEST,
});

const db = drizzle(pool, { schema });

describe("User Model & UserAccountLink Model Integration Tests", () => {
  // Функция для очистки таблиц перед/после тестов
  const cleanupDatabase = async () => {
    // Очищаем в обратном порядке из-за внешних ключей
    // await db.delete(userAccountLinks); // Закомментировано, т.к. userAccountLinks импорт закомментирован
    await db.delete(users);
    // TODO: Очистить другие таблицы, если они будут добавлены и связаны
  };

  beforeEach(async () => {
    await cleanupDatabase();
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  describe("User Model", () => {
    it("должен успешно создавать пользователя со всеми обязательными полями", async () => {
      const newUserInput: NewUser = {
        username: "testuser1",
        passwordHash: "securepassword123",
        firstName: "Test",
        lastName: "UserOne",
        email: "testuser1@example.com",
        memberId: "MEM001",
        userRole: "player", // Используем значение из нашего enum
      };

      const [insertedUser] = await db
        .insert(users)
        .values(newUserInput)
        .returning();

      expect(insertedUser).toBeDefined();
      expect(insertedUser.id).toBeTypeOf("string"); // uuid
      expect(insertedUser.username).toBe(newUserInput.username);
      expect(insertedUser.passwordHash).toBe(newUserInput.passwordHash);
      expect(insertedUser.firstName).toBe(newUserInput.firstName);
      expect(insertedUser.lastName).toBe(newUserInput.lastName);
      expect(insertedUser.email).toBe(newUserInput.email);
      expect(insertedUser.memberId).toBe(newUserInput.memberId);
      expect(insertedUser.userRole).toBe(newUserInput.userRole);
      // Проверяем значения по умолчанию для обязательных полей, если они есть в схеме
      expect(insertedUser.currentRating).toBe(1500.0);
      expect(insertedUser.bonusPoints).toBe(0);
      expect(insertedUser.isAccountVerified).toBe(false);
      expect(insertedUser.createdAt).toBeInstanceOf(Date);
      expect(insertedUser.updatedAt).toBeInstanceOf(Date);

      // Опциональные поля должны быть null или undefined, если не указаны
      expect(insertedUser.profileImageUrl).toBeNull();
      expect(insertedUser.gender).toBeNull();
      expect(insertedUser.dateOfBirth).toBeNull();
      expect(insertedUser.homeVenueId).toBeNull();
      expect(insertedUser.lastLoginAt).toBeNull();
      expect(insertedUser.lastActivityAt).toBeNull();
    });

    it.todo(
      "должен успешно создавать пользователя с обязательными и опциональными полями"
    );
    it.todo("не должен создавать пользователя с неуникальным username");
    it.todo("не должен создавать пользователя с неуникальным email");
    it.todo(
      "не должен создавать пользователя с неуникальным phone (если указан)"
    );
    it.todo("не должен создавать пользователя с неуникальным memberId");
    it.todo(
      "должен корректно устанавливать значения по умолчанию (currentRating, bonusPoints, isAccountVerified)"
    );
    it.todo("должен успешно читать пользователя по ID");
    it.todo("должен успешно читать пользователя по username");
    it.todo("должен успешно читать пользователя по email");
    it.todo("должен успешно обновлять данные пользователя");
    it.todo("должен успешно удалять пользователя");
  });

  describe("UserAccountLink Model", () => {
    // let testUser: User; // Закомментировано

    beforeEach(async () => {
      // Создаем тестового пользователя для UserAccountLink тестов
      const newUser: NewUser = {
        username: "linktestuser",
        passwordHash: "testhash",
        firstName: "LinkTest",
        lastName: "User",
        email: "linktest@example.com",
        memberId: "LNK123",
        userRole: "player",
      };
      await db.insert(users).values(newUser).returning(); // Просто выполняем действие, если testUser не нужен далее
    });

    it.todo(
      "должен успешно создавать связь аккаунта для существующего пользователя"
    );
    it.todo(
      "не должен создавать связь, если userId не существует (TODO: проверить FK constraint)"
    );
    // it.todo("не должен создавать дублирующуюся связь (platform, platformUserId) - требует UNIQUE constraint");
    it.todo("должен корректно устанавливать isPrimary по умолчанию в false");
    it.todo("должен успешно обновлять данные связи (например, isPrimary)");
    it.todo(
      "должен каскадно удалять связи при удалении пользователя (если onDelete: cascade настроено)"
    );
  });
});
