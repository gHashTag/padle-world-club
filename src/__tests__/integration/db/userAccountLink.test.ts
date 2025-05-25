import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../../../db/schema";
import { users, NewUser } from "../../../db/schema";
import {
  userAccountLinks,
  NewUserAccountLink,
  // UserAccountLink, // Закомментировано, так как не используется
} from "../../../db/schema";
import { notificationChannelEnum } from "../../../db/schema/enums";

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

describe("UserAccountLink Model Integration Tests", () => {
  let testUser: schema.User;

  // Функция для очистки таблиц перед/после тестов
  const cleanupDatabase = async () => {
    // Очищаем в обратном порядке из-за внешних ключей
    await db.delete(userAccountLinks);
    await db.delete(users);
  };

  beforeEach(async () => {
    await cleanupDatabase();
    // Создаем тестового пользователя для UserAccountLink тестов
    const newUserInput: NewUser = {
      username: "linktestuser",
      passwordHash: "securepassword123",
      firstName: "LinkTest",
      lastName: "User",
      email: "linktest@example.com",
      memberId: "LNK001",
      userRole: "player",
    };
    const [insertedUser] = await db
      .insert(users)
      .values(newUserInput)
      .returning();
    testUser = insertedUser;
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  it("должен успешно создавать связь аккаунта для существующего пользователя", async () => {
    const newUserAccountLinkInput: NewUserAccountLink = {
      userId: testUser.id,
      platform: notificationChannelEnum.enumValues[0], // Берем первое значение из enum для теста
      platformUserId: "platform_specific_id_123",
    };

    const [insertedLink] = await db
      .insert(userAccountLinks)
      .values(newUserAccountLinkInput)
      .returning();

    expect(insertedLink).toBeDefined();
    expect(insertedLink.id).toBeTypeOf("string"); // uuid
    expect(insertedLink.userId).toBe(testUser.id);
    expect(insertedLink.platform).toBe(newUserAccountLinkInput.platform);
    expect(insertedLink.platformUserId).toBe(
      newUserAccountLinkInput.platformUserId
    );
    // Проверяем значения по умолчанию
    expect(insertedLink.isPrimary).toBe(false);
    expect(insertedLink.createdAt).toBeInstanceOf(Date);
    expect(insertedLink.updatedAt).toBeInstanceOf(Date);
  });

  it.todo(
    "не должен создавать связь, если userId не существует (проверить FK constraint)"
  );
  it.todo(
    "не должен создавать дублирующуюся связь (platform, platformUserId) - требует UNIQUE constraint в SQL"
  );
  it.todo("должен успешно обновлять данные связи (например, isPrimary)");
  it.todo(
    "должен каскадно удалять связи при удалении пользователя (проверить onDelete: cascade)"
  );
  // TODO: Добавить больше тестов по мере необходимости
});
