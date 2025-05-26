/**
 * Репозиторий для работы с моделью Booking
 * Содержит методы CRUD для работы с бронированиями
 */

import { eq, and, gte, lte, ne } from "drizzle-orm";
import { Booking, NewBooking, bookings } from "../db/schema";
import { DatabaseType } from "./types";

export class BookingRepository {
  private db: DatabaseType;

  constructor(db: DatabaseType) {
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
   * Перегрузка метода isCourtAvailable для работы со строками
   * @param courtId ID корта
   * @param date Дата в формате строки (YYYY-MM-DD)
   * @param startTime Время начала в формате строки (HH:MM)
   * @param endTime Время окончания в формате строки (HH:MM)
   * @returns true, если корт доступен, иначе false
   */
  async isCourtAvailable(
    courtId: string,
    date: string,
    startTime: string,
    endTime: string
  ): Promise<boolean>;
  async isCourtAvailable(
    courtId: string,
    startTime: Date,
    endTime: Date,
    _excludeBookingId?: string
  ): Promise<boolean>;
  async isCourtAvailable(
    courtId: string,
    dateOrStartTime: string | Date,
    startTimeOrEndTime: string | Date,
    endTimeOrExcludeId?: string,
    _excludeBookingId?: string
  ): Promise<boolean> {
    // Если первый параметр - строка, то это новая сигнатура
    if (typeof dateOrStartTime === 'string' && typeof startTimeOrEndTime === 'string') {
      const date = dateOrStartTime;
      const startTime = startTimeOrEndTime;
      const endTime = endTimeOrExcludeId!;

      // Преобразуем строки в Date объекты
      const startDateTime = new Date(`${date}T${startTime}:00`);
      const endDateTime = new Date(`${date}T${endTime}:00`);

      return this.isCourtAvailable(courtId, startDateTime, endDateTime);
    } else {
      // Старая сигнатура с Date объектами
      const startTime = dateOrStartTime as Date;
      const endTime = startTimeOrEndTime as Date;
      const excludeId = endTimeOrExcludeId;

      let whereConditions = and(
        eq(bookings.courtId, courtId),
        // Проверяем пересечение временных интервалов
        and(
          lte(bookings.startTime, endTime),
          gte(bookings.endTime, startTime)
        )
      );

      // Исключаем текущее бронирование при обновлении
      if (excludeId) {
        whereConditions = and(
          whereConditions,
          ne(bookings.id, excludeId)
        );
      }

      const conflictingBookings = await this.db
        .select()
        .from(bookings)
        .where(whereConditions);

      return conflictingBookings.length === 0;
    }
  }
}
