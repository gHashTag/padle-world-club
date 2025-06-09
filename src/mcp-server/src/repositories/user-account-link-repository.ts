/**
 * Репозиторий для работы с моделью UserAccountLink
 * Содержит методы CRUD для работы со связями аккаунтов пользователей
 */

import { and, eq } from "drizzle-orm";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "../db/schema";
import { UserAccountLink, NewUserAccountLink, userAccountLinks } from "../db/schema";
// import { NotificationChannel } from "../types";
type NotificationChannel = "whatsapp" | "telegram" | "email" | "app_push";

export class UserAccountLinkRepository {
  private db: PostgresJsDatabase<typeof schema>;

  constructor(db: PostgresJsDatabase<typeof schema>) {
    this.db = db;
  }

  /**
   * Создает новую связь аккаунта пользователя
   * @param linkData Данные связи
   * @returns Созданная связь
   */
  async create(linkData: NewUserAccountLink): Promise<UserAccountLink> {
    const [link] = await this.db
      .insert(userAccountLinks)
      .values(linkData)
      .returning();
    return link;
  }

  /**
   * Получает связь аккаунта по ID
   * @param id ID связи
   * @returns Связь или null, если связь не найдена
   */
  async getById(id: string): Promise<UserAccountLink | null> {
    const result = await this.db
      .select()
      .from(userAccountLinks)
      .where(eq(userAccountLinks.id, id));

    return result.length > 0 ? result[0] : null;
  }

  /**
   * Получает связь аккаунта по ID пользователя, платформе и ID пользователя на платформе
   * @param userId ID пользователя
   * @param platform Платформа
   * @param platformUserId ID пользователя на платформе
   * @returns Связь или null, если связь не найдена
   */
  async getByUserAndPlatform(
    userId: string,
    platform: NotificationChannel,
    platformUserId: string
  ): Promise<UserAccountLink | null> {
    const result = await this.db
      .select()
      .from(userAccountLinks)
      .where(
        and(
          eq(userAccountLinks.userId, userId),
          eq(userAccountLinks.platform, platform),
          eq(userAccountLinks.platformUserId, platformUserId)
        )
      );

    return result.length > 0 ? result[0] : null;
  }

  /**
   * Получает все связи аккаунтов пользователя
   * @param userId ID пользователя
   * @returns Массив связей
   */
  async getAllByUserId(userId: string): Promise<UserAccountLink[]> {
    return await this.db
      .select()
      .from(userAccountLinks)
      .where(eq(userAccountLinks.userId, userId));
  }

  /**
   * Получает все связи аккаунтов по платформе и ID пользователя на платформе
   * @param platform Платформа
   * @param platformUserId ID пользователя на платформе
   * @returns Массив связей
   */
  async getByPlatformAndId(
    platform: NotificationChannel,
    platformUserId: string
  ): Promise<UserAccountLink[]> {
    return await this.db
      .select()
      .from(userAccountLinks)
      .where(
        and(
          eq(userAccountLinks.platform, platform),
          eq(userAccountLinks.platformUserId, platformUserId)
        )
      );
  }

  /**
   * Обновляет данные связи аккаунта
   * @param id ID связи
   * @param linkData Данные для обновления
   * @returns Обновленная связь или null, если связь не найдена
   */
  async update(
    id: string,
    linkData: Partial<NewUserAccountLink>
  ): Promise<UserAccountLink | null> {
    const [updatedLink] = await this.db
      .update(userAccountLinks)
      .set(linkData)
      .where(eq(userAccountLinks.id, id))
      .returning();

    return updatedLink || null;
  }

  /**
   * Устанавливает связь как основную для пользователя
   * @param id ID связи
   * @returns Обновленная связь или null, если связь не найдена
   */
  async setPrimary(id: string): Promise<UserAccountLink | null> {
    // Сначала получаем связь, чтобы узнать ID пользователя
    const link = await this.getById(id);
    if (!link) return null;

    // Сбрасываем флаг isPrimary для всех связей пользователя
    await this.db
      .update(userAccountLinks)
      .set({ isPrimary: false })
      .where(eq(userAccountLinks.userId, link.userId));

    // Устанавливаем флаг isPrimary для указанной связи
    const [updatedLink] = await this.db
      .update(userAccountLinks)
      .set({ isPrimary: true })
      .where(eq(userAccountLinks.id, id))
      .returning();

    return updatedLink || null;
  }

  /**
   * Удаляет связь аккаунта
   * @param id ID связи
   * @returns true, если связь успешно удалена, иначе false
   */
  async delete(id: string): Promise<boolean> {
    const [deletedLink] = await this.db
      .delete(userAccountLinks)
      .where(eq(userAccountLinks.id, id))
      .returning();

    return !!deletedLink;
  }

  /**
   * Удаляет все связи аккаунтов пользователя
   * @param userId ID пользователя
   * @returns Количество удаленных связей
   */
  async deleteAllByUserId(userId: string): Promise<number> {
    const deletedLinks = await this.db
      .delete(userAccountLinks)
      .where(eq(userAccountLinks.userId, userId))
      .returning();

    return deletedLinks.length;
  }
}
