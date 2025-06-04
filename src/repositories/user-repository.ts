/**
 * Репозиторий для работы с моделью User
 * Содержит методы CRUD для работы с пользователями
 */

import { eq } from "drizzle-orm";
import { User, NewUser, users } from "../db/schema";
import { DatabaseType } from "./types";
import { BonusTransactionRepository } from "./bonus-transaction-repository";

export class UserRepository {
  private db: DatabaseType;
  private bonusTransactionRepository: BonusTransactionRepository;

  constructor(db: DatabaseType) {
    this.db = db;
    this.bonusTransactionRepository = new BonusTransactionRepository(db);
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
    const result = await this.db.select().from(users).where(eq(users.id, id));

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

  /**
   * Получает текущий бонусный баланс пользователя
   * @param userId ID пользователя
   * @returns Текущий баланс бонусов
   */
  async getBonusBalance(userId: string): Promise<number> {
    return await this.bonusTransactionRepository.getCurrentBalance(userId);
  }

  /**
   * Получает сводку по бонусам пользователя
   * @param userId ID пользователя
   * @returns Объект с информацией о бонусах
   */
  async getBonusSummary(userId: string): Promise<{
    totalEarned: number;
    totalSpent: number;
    currentBalance: number;
    transactionCount: number;
  }> {
    return await this.bonusTransactionRepository.getUserBonusSummary(userId);
  }

  /**
   * Получает историю бонусных операций пользователя
   * @param userId ID пользователя
   * @param limit Количество записей (по умолчанию 20)
   * @returns Массив бонусных транзакций
   */
  async getBonusHistory(userId: string, limit: number = 20): Promise<any[]> {
    return await this.bonusTransactionRepository.getBalanceHistory(
      userId,
      limit
    );
  }

  /**
   * Начисляет бонусы пользователю
   * @param userId ID пользователя
   * @param points Количество бонусов для начисления
   * @param description Описание операции
   * @param relatedOrderId ID связанного заказа (опционально)
   * @param relatedBookingId ID связанного бронирования (опционально)
   * @param expiresAt Дата истечения бонусов (опционально)
   * @returns Созданная бонусная транзакция
   */
  async earnBonusPoints(
    userId: string,
    points: number,
    description: string,
    relatedOrderId?: string,
    relatedBookingId?: string,
    expiresAt?: Date
  ): Promise<any> {
    const currentBalance = await this.getBonusBalance(userId);

    return await this.bonusTransactionRepository.create({
      userId,
      transactionType: "earned",
      pointsChange: points,
      currentBalanceAfter: currentBalance + points,
      description,
      relatedOrderId,
      relatedBookingId,
      expiresAt,
    });
  }

  /**
   * Списывает бонусы у пользователя
   * @param userId ID пользователя
   * @param points Количество бонусов для списания
   * @param description Описание операции
   * @param relatedOrderId ID связанного заказа (опционально)
   * @param relatedBookingId ID связанного бронирования (опционально)
   * @returns Созданная бонусная транзакция или null, если недостаточно бонусов
   */
  async spendBonusPoints(
    userId: string,
    points: number,
    description: string,
    relatedOrderId?: string,
    relatedBookingId?: string
  ): Promise<any | null> {
    const currentBalance = await this.getBonusBalance(userId);

    if (currentBalance < points) {
      return null; // Недостаточно бонусов
    }

    return await this.bonusTransactionRepository.create({
      userId,
      transactionType: "spent",
      pointsChange: points,
      currentBalanceAfter: currentBalance - points,
      description,
      relatedOrderId,
      relatedBookingId,
    });
  }

  /**
   * Проверяет, достаточно ли у пользователя бонусов
   * @param userId ID пользователя
   * @param requiredPoints Требуемое количество бонусов
   * @returns true, если бонусов достаточно
   */
  async hasSufficientBonusPoints(
    userId: string,
    requiredPoints: number
  ): Promise<boolean> {
    const currentBalance = await this.getBonusBalance(userId);
    return currentBalance >= requiredPoints;
  }

  /**
   * Получает пользователей с истекающими бонусами
   * @param daysAhead Количество дней вперед для поиска (по умолчанию 7)
   * @returns Массив пользователей с истекающими бонусами
   */
  async getUsersWithExpiringBonuses(daysAhead: number = 7): Promise<User[]> {
    const expiringBonuses =
      await this.bonusTransactionRepository.findExpiringBonuses(daysAhead);
    const userIds = [...new Set(expiringBonuses.map((bonus) => bonus.userId))];

    const usersWithExpiringBonuses = [];
    for (const userId of userIds) {
      const user = await this.getById(userId);
      if (user) {
        usersWithExpiringBonuses.push(user);
      }
    }

    return usersWithExpiringBonuses;
  }

  /**
   * Получает топ пользователей по бонусному балансу
   * @param limit Количество пользователей (по умолчанию 10)
   * @returns Массив пользователей с их бонусными балансами
   */
  async getTopUsersByBonusBalance(
    limit: number = 10
  ): Promise<Array<User & { bonusBalance: number }>> {
    const allUsers = await this.getAll();
    const usersWithBalances = [];

    for (const user of allUsers) {
      const bonusBalance = await this.getBonusBalance(user.id);
      usersWithBalances.push({ ...user, bonusBalance });
    }

    return usersWithBalances
      .sort((a, b) => b.bonusBalance - a.bonusBalance)
      .slice(0, limit);
  }
}
