/**
 * Репозиторий для работы с моделью User
 * Содержит методы CRUD для работы с пользователями
 */

import { eq } from "drizzle-orm";
import { User, NewUser, users } from "../db/schema";
import { DatabaseType } from "./types";

export class UserRepository {
  private db: DatabaseType;

  constructor(db: DatabaseType) {
    this.db = db;
  }

  /**
   * Создает нового пользователя
   * @param userData Данные пользователя
   * @returns Созданный пользователь
   */
  async create(userData: NewUser): Promise<User> {
    const [user] = await this.db.insert(users).values(userData).returning();
    return user;
  }

  /**
   * Получает пользователя по ID
   * @param id ID пользователя
   * @returns Пользователь или null, если пользователь не найден
   */
  async getById(id: string): Promise<User | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.id, id));

    return result.length > 0 ? result[0] : null;
  }

  /**
   * Получает пользователя по имени пользователя
   * @param username Имя пользователя
   * @returns Пользователь или null, если пользователь не найден
   */
  async getByUsername(username: string): Promise<User | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.username, username));

    return result.length > 0 ? result[0] : null;
  }

  /**
   * Получает пользователя по email
   * @param email Email пользователя
   * @returns Пользователь или null, если пользователь не найден
   */
  async getByEmail(email: string): Promise<User | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.email, email));

    return result.length > 0 ? result[0] : null;
  }

  /**
   * Получает пользователя по номеру телефона
   * @param phone Номер телефона пользователя
   * @returns Пользователь или null, если пользователь не найден
   */
  async getByPhone(phone: string): Promise<User | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.phone, phone));

    return result.length > 0 ? result[0] : null;
  }

  /**
   * Получает пользователя по ID члена клуба
   * @param memberId ID члена клуба
   * @returns Пользователь или null, если пользователь не найден
   */
  async getByMemberId(memberId: string): Promise<User | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.memberId, memberId));

    return result.length > 0 ? result[0] : null;
  }

  /**
   * Получает всех пользователей
   * @returns Массив пользователей
   */
  async getAll(): Promise<User[]> {
    return await this.db.select().from(users);
  }

  /**
   * Обновляет данные пользователя
   * @param id ID пользователя
   * @param userData Данные для обновления
   * @returns Обновленный пользователь или null, если пользователь не найден
   */
  async update(id: string, userData: Partial<NewUser>): Promise<User | null> {
    const [updatedUser] = await this.db
      .update(users)
      .set(userData)
      .where(eq(users.id, id))
      .returning();

    return updatedUser || null;
  }

  /**
   * Удаляет пользователя
   * @param id ID пользователя
   * @returns true, если пользователь успешно удален, иначе false
   */
  async delete(id: string): Promise<boolean> {
    const [deletedUser] = await this.db
      .delete(users)
      .where(eq(users.id, id))
      .returning();

    return !!deletedUser;
  }
}
