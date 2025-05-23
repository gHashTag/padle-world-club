import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { drizzle } from "drizzle-orm/node-postgres";
import { eq } from "drizzle-orm";
import { Pool } from "pg";
import * as schema from "../../../db/schema";
import { users, userAccountLinks, NewUser, NewUserAccountLink } from "../../../db/schema";

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
    await db.delete(userAccountLinks);
    await db.delete(users);
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

      const insertedUsers = await db
        .insert(users)
        .values(newUserInput)
        .returning();
      const insertedUser = insertedUsers[0];

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

    it("должен успешно создавать пользователя с обязательными и опциональными полями", async () => {
      const newUserInput: NewUser = {
        username: "testuser2",
        passwordHash: "securepassword123",
        firstName: "Test",
        lastName: "UserTwo",
        email: "testuser2@example.com",
        phone: "123456789",
        memberId: "MEM002",
        userRole: "coach",
        profileImageUrl: "http://example.com/img.png",
        gender: "male",
        dateOfBirth: new Date("1990-01-01"),
      };

      const [insertedUser] = await db.insert(users).values(newUserInput).returning();

      expect(insertedUser.phone).toBe(newUserInput.phone);
      expect(insertedUser.profileImageUrl).toBe(newUserInput.profileImageUrl);
      expect(insertedUser.gender).toBe(newUserInput.gender);
      expect(insertedUser.dateOfBirth?.toISOString()).toBe(
        newUserInput.dateOfBirth!.toISOString(),
      );
    });

    it("не должен создавать пользователя с неуникальным username", async () => {
      const baseUser: NewUser = {
        username: "uniqueuser",
        passwordHash: "hash",
        firstName: "U",
        lastName: "One",
        email: "unique@example.com",
        memberId: "MEM003",
        userRole: "player",
      };
      await db.insert(users).values(baseUser);

      await expect(db.insert(users).values({ ...baseUser, email: "other@example.com", memberId: "MEM004" })).rejects.toThrow();
    });

    it("не должен создавать пользователя с неуникальным email", async () => {
      const baseUser: NewUser = {
        username: "emailuser",
        passwordHash: "hash",
        firstName: "E",
        lastName: "One",
        email: "email@example.com",
        memberId: "MEM005",
        userRole: "player",
      };
      await db.insert(users).values(baseUser);

      await expect(db.insert(users).values({ ...baseUser, username: "emailuser2", memberId: "MEM006" })).rejects.toThrow();
    });

    it("не должен создавать пользователя с неуникальным phone (если указан)", async () => {
      const baseUser: NewUser = {
        username: "phoneuser",
        passwordHash: "hash",
        firstName: "P",
        lastName: "One",
        email: "phone1@example.com",
        phone: "999999",
        memberId: "MEM007",
        userRole: "player",
      };
      await db.insert(users).values(baseUser);

      await expect(
        db.insert(users).values({
          ...baseUser,
          username: "phoneuser2",
          email: "phone2@example.com",
          memberId: "MEM008",
        }),
      ).rejects.toThrow();
    });

    it("не должен создавать пользователя с неуникальным memberId", async () => {
      const baseUser: NewUser = {
        username: "memberuser",
        passwordHash: "hash",
        firstName: "M",
        lastName: "One",
        email: "member1@example.com",
        memberId: "MEM009",
        userRole: "player",
      };
      await db.insert(users).values(baseUser);

      await expect(
        db.insert(users).values({
          ...baseUser,
          username: "memberuser2",
          email: "member2@example.com",
        }),
      ).rejects.toThrow();
    });

    it("должен корректно устанавливать значения по умолчанию (currentRating, bonusPoints, isAccountVerified)", async () => {
      const newUser: NewUser = {
        username: "defaultuser",
        passwordHash: "hash",
        firstName: "D",
        lastName: "User",
        email: "default@example.com",
        memberId: "MEM010",
        userRole: "player",
      };
      const [inserted] = await db.insert(users).values(newUser).returning();
      expect(inserted.currentRating).toBe(1500.0);
      expect(inserted.bonusPoints).toBe(0);
      expect(inserted.isAccountVerified).toBe(false);
    });

    it("должен успешно читать пользователя по ID", async () => {
      const userInput: NewUser = {
        username: "readid",
        passwordHash: "hash",
        firstName: "R",
        lastName: "Id",
        email: "readid@example.com",
        memberId: "MEM011",
        userRole: "player",
      };
      const [inserted] = await db.insert(users).values(userInput).returning();

      const result = await db
        .select()
        .from(users)
        .where(eq(users.id, inserted.id));
      expect(result[0]?.id).toBe(inserted.id);
    });

    it("должен успешно читать пользователя по username", async () => {
      const userInput: NewUser = {
        username: "readname",
        passwordHash: "hash",
        firstName: "R",
        lastName: "Name",
        email: "readname@example.com",
        memberId: "MEM012",
        userRole: "player",
      };
      await db.insert(users).values(userInput);

      const result = await db
        .select()
        .from(users)
        .where(eq(users.username, userInput.username));
      expect(result[0]?.username).toBe(userInput.username);
    });

    it("должен успешно читать пользователя по email", async () => {
      const userInput: NewUser = {
        username: "reademail",
        passwordHash: "hash",
        firstName: "R",
        lastName: "Email",
        email: "reademail@example.com",
        memberId: "MEM013",
        userRole: "player",
      };
      await db.insert(users).values(userInput);

      const result = await db
        .select()
        .from(users)
        .where(eq(users.email, userInput.email));
      expect(result[0]?.email).toBe(userInput.email);
    });

    it("должен успешно обновлять данные пользователя", async () => {
      const userInput: NewUser = {
        username: "updateuser",
        passwordHash: "hash",
        firstName: "U",
        lastName: "User",
        email: "update@example.com",
        memberId: "MEM014",
        userRole: "player",
      };
      const [inserted] = await db.insert(users).values(userInput).returning();

      const [updated] = await db
        .update(users)
        .set({ firstName: "Updated" })
        .where(eq(users.id, inserted.id))
        .returning();
      expect(updated.firstName).toBe("Updated");
    });

    it("должен успешно удалять пользователя", async () => {
      const userInput: NewUser = {
        username: "deleteuser",
        passwordHash: "hash",
        firstName: "D",
        lastName: "User",
        email: "delete@example.com",
        memberId: "MEM015",
        userRole: "player",
      };
      const [inserted] = await db.insert(users).values(userInput).returning();

      await db.delete(users).where(eq(users.id, inserted.id));
      const result = await db
        .select()
        .from(users)
        .where(eq(users.id, inserted.id));
      expect(result.length).toBe(0);
    });
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
      const insertedUsers = await db.insert(users).values(newUser).returning();
      // testUser = insertedUsers[0]; // Закомментировано
    });

    it("должен успешно создавать связь аккаунта для существующего пользователя", async () => {
      const user = (
        await db
          .select()
          .from(users)
          .where(eq(users.username, "linktestuser"))
      )[0]!;

      const link: NewUserAccountLink = {
        userId: user.id,
        platform: "telegram",
        platformUserId: "123",
      };

      const [inserted] = await db
        .insert(userAccountLinks)
        .values(link)
        .returning();

      expect(inserted.userId).toBe(user.id);
      expect(inserted.isPrimary).toBe(false);
    });

    it("не должен создавать связь, если userId не существует", async () => {
      const link: NewUserAccountLink = {
        userId: "00000000-0000-0000-0000-000000000000",
        platform: "telegram",
        platformUserId: "321",
      };
      await expect(db.insert(userAccountLinks).values(link)).rejects.toThrow();
    });

    it("должен корректно устанавливать isPrimary по умолчанию в false", async () => {
      const user = (
        await db
          .select()
          .from(users)
          .where(eq(users.username, "linktestuser"))
      )[0]!;

      const [inserted] = await db
        .insert(userAccountLinks)
        .values({
          userId: user.id,
          platform: "whatsapp",
          platformUserId: "w1",
        })
        .returning();

      expect(inserted.isPrimary).toBe(false);
    });

    it("должен успешно обновлять данные связи (например, isPrimary)", async () => {
      const user = (
        await db
          .select()
          .from(users)
          .where(eq(users.username, "linktestuser"))
      )[0]!;
      const [inserted] = await db
        .insert(userAccountLinks)
        .values({
          userId: user.id,
          platform: "email",
          platformUserId: "e1",
        })
        .returning();

      const [updated] = await db
        .update(userAccountLinks)
        .set({ isPrimary: true })
        .where(eq(userAccountLinks.id, inserted.id))
        .returning();
      expect(updated.isPrimary).toBe(true);
    });

    it("должен каскадно удалять связи при удалении пользователя", async () => {
      const user = (
        await db
          .select()
          .from(users)
          .where(eq(users.username, "linktestuser"))
      )[0]!;
      await db.insert(userAccountLinks).values({
        userId: user.id,
        platform: "telegram",
        platformUserId: "del1",
      });

      await db.delete(users).where(eq(users.id, user.id));
      const links = await db
        .select()
        .from(userAccountLinks)
        .where(eq(userAccountLinks.userId, user.id));
      expect(links.length).toBe(0);
    });
  });
});
