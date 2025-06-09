/**
 * Репозиторий для работы с моделью Booking
 * Содержит методы CRUD для работы с бронированиями
 */

import { eq, and, gte, lte, ne, sql } from "drizzle-orm";
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

  /**
   * Получает список бронирований с пагинацией и фильтрацией
   * @param options Опции для фильтрации и сортировки
   * @returns Объект с данными и метаинформацией
   */
  async findMany(options: {
    page: number;
    limit: number;
    courtId?: string;
    bookedByUserId?: string;
    status?: string;
    bookingPurpose?: string;
    startTimeAfter?: string;
    startTimeBefore?: string;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  }): Promise<{ data: Booking[]; total: number; page: number; limit: number }> {
    const { page, limit, courtId, bookedByUserId, status, bookingPurpose, startTimeAfter, startTimeBefore, sortBy, sortOrder: _sortOrder } = options;
    const offset = (page - 1) * limit;

    // Строим условия фильтрации
    const conditions = [];
    if (courtId) {
      conditions.push(eq(bookings.courtId, courtId));
    }
    if (bookedByUserId) {
      conditions.push(eq(bookings.bookedByUserId, bookedByUserId));
    }
    if (status) {
      conditions.push(eq(bookings.status, status as any));
    }
    if (bookingPurpose) {
      conditions.push(eq(bookings.bookingPurpose, bookingPurpose as any));
    }
    if (startTimeAfter) {
      conditions.push(gte(bookings.startTime, new Date(startTimeAfter)));
    }
    if (startTimeBefore) {
      conditions.push(lte(bookings.startTime, new Date(startTimeBefore)));
    }

    // Получаем общее количество записей
    const totalResult = await this.db
      .select({ count: bookings.id })
      .from(bookings)
      .where(conditions.length > 0 ? and(...conditions) : undefined);
    const total = totalResult.length;

    // Получаем данные с пагинацией и сортировкой
    const baseQuery = this.db
      .select()
      .from(bookings)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    // Добавляем сортировку
    let data;
    if (sortBy === 'startTime') {
      data = await baseQuery.orderBy(bookings.startTime).limit(limit).offset(offset);
    } else if (sortBy === 'endTime') {
      data = await baseQuery.orderBy(bookings.endTime).limit(limit).offset(offset);
    } else if (sortBy === 'status') {
      data = await baseQuery.orderBy(bookings.status).limit(limit).offset(offset);
    } else if (sortBy === 'totalAmount') {
      data = await baseQuery.orderBy(bookings.totalAmount).limit(limit).offset(offset);
    } else if (sortBy === 'createdAt') {
      data = await baseQuery.orderBy(bookings.createdAt).limit(limit).offset(offset);
    } else if (sortBy === 'updatedAt') {
      data = await baseQuery.orderBy(bookings.updatedAt).limit(limit).offset(offset);
    } else {
      // По умолчанию сортируем по времени начала
      data = await baseQuery.orderBy(bookings.startTime).limit(limit).offset(offset);
    }

    return {
      data,
      total,
      page,
      limit
    };
  }

  /**
   * Получает активные бронирования для корта
   * @param courtId ID корта
   * @returns Массив активных бронирований
   */
  async findActiveBookingsByCourtId(courtId: string): Promise<Booking[]> {
    const now = new Date();

    return await this.db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.courtId, courtId),
          // Активные статусы
          sql`${bookings.status} IN ('confirmed', 'pending_payment')`,
          // Бронирования, которые еще не завершились
          gte(bookings.endTime, now)
        )
      );
  }
}
