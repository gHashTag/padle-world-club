/**
 * Репозиторий для работы с моделью BookingParticipant
 * Содержит методы CRUD для работы с участниками бронирований
 */

import { eq, and } from "drizzle-orm";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "../db/schema";
import { BookingParticipant, NewBookingParticipant, bookingParticipants } from "../db/schema";

export class BookingParticipantRepository {
  private db: PostgresJsDatabase<typeof schema>;

  constructor(db: PostgresJsDatabase<typeof schema>) {
    this.db = db;
  }

  /**
   * Создает нового участника бронирования
   * @param participantData Данные участника
   * @returns Созданный участник
   */
  async create(participantData: NewBookingParticipant): Promise<BookingParticipant> {
    const [participant] = await this.db.insert(bookingParticipants).values(participantData).returning();
    return participant;
  }

  /**
   * Получает участника по ID
   * @param id ID участника
   * @returns Участник или null, если участник не найден
   */
  async getById(id: string): Promise<BookingParticipant | null> {
    const result = await this.db
      .select()
      .from(bookingParticipants)
      .where(eq(bookingParticipants.id, id));

    return result.length > 0 ? result[0] : null;
  }

  /**
   * Получает участника по ID бронирования и ID пользователя
   * @param bookingId ID бронирования
   * @param userId ID пользователя
   * @returns Участник или null, если участник не найден
   */
  async getByBookingAndUser(bookingId: string, userId: string): Promise<BookingParticipant | null> {
    const result = await this.db
      .select()
      .from(bookingParticipants)
      .where(
        and(
          eq(bookingParticipants.bookingId, bookingId),
          eq(bookingParticipants.userId, userId)
        )
      );

    return result.length > 0 ? result[0] : null;
  }

  /**
   * Получает всех участников бронирования
   * @param bookingId ID бронирования
   * @returns Массив участников
   */
  async getByBookingId(bookingId: string): Promise<BookingParticipant[]> {
    return await this.db
      .select()
      .from(bookingParticipants)
      .where(eq(bookingParticipants.bookingId, bookingId));
  }

  /**
   * Получает все бронирования пользователя как участника
   * @param userId ID пользователя
   * @returns Массив участий в бронированиях
   */
  async getByUserId(userId: string): Promise<BookingParticipant[]> {
    return await this.db
      .select()
      .from(bookingParticipants)
      .where(eq(bookingParticipants.userId, userId));
  }

  /**
   * Получает хоста (инициатора) бронирования
   * @param bookingId ID бронирования
   * @returns Участник-хост или null, если хост не найден
   */
  async getHostByBookingId(bookingId: string): Promise<BookingParticipant | null> {
    const result = await this.db
      .select()
      .from(bookingParticipants)
      .where(
        and(
          eq(bookingParticipants.bookingId, bookingId),
          eq(bookingParticipants.isHost, true)
        )
      );

    return result.length > 0 ? result[0] : null;
  }

  /**
   * Получает участников с определенным статусом оплаты
   * @param bookingId ID бронирования
   * @param paymentStatus Статус оплаты
   * @returns Массив участников
   */
  async getByBookingAndPaymentStatus(
    bookingId: string,
    paymentStatus: "success" | "failed" | "pending" | "refunded" | "partial"
  ): Promise<BookingParticipant[]> {
    return await this.db
      .select()
      .from(bookingParticipants)
      .where(
        and(
          eq(bookingParticipants.bookingId, bookingId),
          eq(bookingParticipants.paymentStatus, paymentStatus)
        )
      );
  }

  /**
   * Получает участников с определенным статусом участия
   * @param bookingId ID бронирования
   * @param participationStatus Статус участия
   * @returns Массив участников
   */
  async getByBookingAndParticipationStatus(
    bookingId: string,
    participationStatus: "registered" | "attended" | "no_show" | "cancelled"
  ): Promise<BookingParticipant[]> {
    return await this.db
      .select()
      .from(bookingParticipants)
      .where(
        and(
          eq(bookingParticipants.bookingId, bookingId),
          eq(bookingParticipants.participationStatus, participationStatus)
        )
      );
  }

  /**
   * Получает все участия пользователя
   * @returns Массив всех участий
   */
  async getAll(): Promise<BookingParticipant[]> {
    return await this.db.select().from(bookingParticipants);
  }

  /**
   * Обновляет данные участника
   * @param id ID участника
   * @param participantData Данные для обновления
   * @returns Обновленный участник или null, если участник не найден
   */
  async update(id: string, participantData: Partial<NewBookingParticipant>): Promise<BookingParticipant | null> {
    const [updatedParticipant] = await this.db
      .update(bookingParticipants)
      .set(participantData)
      .where(eq(bookingParticipants.id, id))
      .returning();

    return updatedParticipant || null;
  }

  /**
   * Обновляет статус оплаты участника
   * @param id ID участника
   * @param paymentStatus Новый статус оплаты
   * @param amountPaid Сумма оплаты (опционально)
   * @returns Обновленный участник или null, если участник не найден
   */
  async updatePaymentStatus(
    id: string,
    paymentStatus: "success" | "failed" | "pending" | "refunded" | "partial",
    amountPaid?: string
  ): Promise<BookingParticipant | null> {
    const updateData: Partial<NewBookingParticipant> = { paymentStatus };
    if (amountPaid !== undefined) {
      updateData.amountPaid = amountPaid;
    }

    return await this.update(id, updateData);
  }

  /**
   * Обновляет статус участия
   * @param id ID участника
   * @param participationStatus Новый статус участия
   * @returns Обновленный участник или null, если участник не найден
   */
  async updateParticipationStatus(
    id: string,
    participationStatus: "registered" | "attended" | "no_show" | "cancelled"
  ): Promise<BookingParticipant | null> {
    return await this.update(id, { participationStatus });
  }

  /**
   * Удаляет участника из бронирования
   * @param id ID участника
   * @returns true, если участник успешно удален, иначе false
   */
  async delete(id: string): Promise<boolean> {
    const [deletedParticipant] = await this.db
      .delete(bookingParticipants)
      .where(eq(bookingParticipants.id, id))
      .returning();

    return !!deletedParticipant;
  }

  /**
   * Удаляет всех участников бронирования
   * @param bookingId ID бронирования
   * @returns Количество удаленных участников
   */
  async deleteAllByBookingId(bookingId: string): Promise<number> {
    const deletedParticipants = await this.db
      .delete(bookingParticipants)
      .where(eq(bookingParticipants.bookingId, bookingId))
      .returning();

    return deletedParticipants.length;
  }

  /**
   * Получает статистику по оплатам для бронирования
   * @param bookingId ID бронирования
   * @returns Объект со статистикой оплат
   */
  async getPaymentStats(bookingId: string): Promise<{
    totalOwed: string;
    totalPaid: string;
    participantCount: number;
    fullyPaidCount: number;
  }> {
    const participants = await this.getByBookingId(bookingId);

    const totalOwed = participants.reduce((sum, p) => sum + parseFloat(p.amountOwed), 0);
    const totalPaid = participants.reduce((sum, p) => sum + parseFloat(p.amountPaid), 0);
    const participantCount = participants.length;
    const fullyPaidCount = participants.filter(p =>
      parseFloat(p.amountPaid) >= parseFloat(p.amountOwed)
    ).length;

    return {
      totalOwed: totalOwed.toFixed(2),
      totalPaid: totalPaid.toFixed(2),
      participantCount,
      fullyPaidCount,
    };
  }

  /**
   * Проверяет, является ли пользователь участником бронирования
   * @param bookingId ID бронирования
   * @param userId ID пользователя
   * @returns true, если пользователь является участником
   */
  async isUserParticipant(bookingId: string, userId: string): Promise<boolean> {
    const participant = await this.getByBookingAndUser(bookingId, userId);
    return participant !== null;
  }

  /**
   * Проверяет, является ли пользователь хостом бронирования
   * @param bookingId ID бронирования
   * @param userId ID пользователя
   * @returns true, если пользователь является хостом
   */
  async isUserHost(bookingId: string, userId: string): Promise<boolean> {
    const participant = await this.getByBookingAndUser(bookingId, userId);
    return participant?.isHost === true;
  }
}
