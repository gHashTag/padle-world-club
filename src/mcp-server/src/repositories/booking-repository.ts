/**
 * Репозиторий для работы с моделью Booking
 * Содержит методы CRUD для работы с бронированиями
 */

import { eq, and, gte, lte, ne } from "drizzle-orm";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "../db/schema";
import { Booking, NewBooking, bookings } from "../db/schema";

export class BookingRepository {
  private db: PostgresJsDatabase<typeof schema>;

  constructor(db: PostgresJsDatabase<typeof schema>) {
    this.db = db;
  }

  /**
   * Создает новое бронирование
   * @param bookingData Данные бронирования
   * @returns Созданное бронирование
   */
  async create(bookingData: NewBooking): Promise<Booking> {
    const [booking] = await this.db.insert(bookings).values(bookingData).returning();
    return booking;
  }

  /**
   * Получает бронирование по ID
   * @param id ID бронирования
   * @returns Бронирование или null, если бронирование не найдено
   */
  async getById(id: string): Promise<Booking | null> {
    const result = await this.db
      .select()
      .from(bookings)
      .where(eq(bookings.id, id));

    return result.length > 0 ? result[0] : null;
  }

  /**
   * Получает все бронирования для конкретного корта
   * @param courtId ID корта
   * @returns Массив бронирований
   */
  async getByCourtId(courtId: string): Promise<Booking[]> {
    return await this.db
      .select()
      .from(bookings)
      .where(eq(bookings.courtId, courtId));
  }

  /**
   * Получает все бронирования пользователя
   * @param userId ID пользователя
   * @returns Массив бронирований
   */
  async getByUserId(userId: string): Promise<Booking[]> {
    return await this.db
      .select()
      .from(bookings)
      .where(eq(bookings.bookedByUserId, userId));
  }

  /**
   * Получает бронирования корта в определенном временном диапазоне
   * @param courtId ID корта
   * @param startTime Начальное время
   * @param endTime Конечное время
   * @returns Массив бронирований
   */
  async getByCourtAndTimeRange(
    courtId: string,
    startTime: Date,
    endTime: Date
  ): Promise<Booking[]> {
    return await this.db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.courtId, courtId),
          // Проверяем пересечение временных интервалов
          and(
            lte(bookings.startTime, endTime),
            gte(bookings.endTime, startTime)
          )
        )
      );
  }

  /**
   * Получает бронирования в определенном временном диапазоне
   * @param startTime Начальное время
   * @param endTime Конечное время
   * @returns Массив бронирований
   */
  async getByTimeRange(startTime: Date, endTime: Date): Promise<Booking[]> {
    return await this.db
      .select()
      .from(bookings)
      .where(
        and(
          gte(bookings.startTime, startTime),
          lte(bookings.endTime, endTime)
        )
      );
  }

  /**
   * Получает все бронирования
   * @returns Массив бронирований
   */
  async getAll(): Promise<Booking[]> {
    return await this.db.select().from(bookings);
  }

  /**
   * Обновляет данные бронирования
   * @param id ID бронирования
   * @param bookingData Данные для обновления
   * @returns Обновленное бронирование или null, если бронирование не найдено
   */
  async update(id: string, bookingData: Partial<NewBooking>): Promise<Booking | null> {
    const [updatedBooking] = await this.db
      .update(bookings)
      .set(bookingData)
      .where(eq(bookings.id, id))
      .returning();

    return updatedBooking || null;
  }

  /**
   * Удаляет бронирование
   * @param id ID бронирования
   * @returns true, если бронирование успешно удалено, иначе false
   */
  async delete(id: string): Promise<boolean> {
    const [deletedBooking] = await this.db
      .delete(bookings)
      .where(eq(bookings.id, id))
      .returning();

    return !!deletedBooking;
  }

  /**
   * Проверяет доступность корта в указанное время
   * @param courtId ID корта
   * @param startTime Начальное время
   * @param endTime Конечное время
   * @param excludeBookingId ID бронирования для исключения (при обновлении)
   * @returns true, если корт доступен, иначе false
   */
  async isCourtAvailable(
    courtId: string,
    startTime: Date,
    endTime: Date,
    excludeBookingId?: string
  ): Promise<boolean> {
    let whereConditions = and(
      eq(bookings.courtId, courtId),
      // Проверяем пересечение временных интервалов
      and(
        lte(bookings.startTime, endTime),
        gte(bookings.endTime, startTime)
      )
    );

    // Исключаем текущее бронирование при обновлении
    if (excludeBookingId) {
      whereConditions = and(
        whereConditions,
        ne(bookings.id, excludeBookingId)
      );
    }

    const conflictingBookings = await this.db
      .select()
      .from(bookings)
      .where(whereConditions);

    return conflictingBookings.length === 0;
  }
}
