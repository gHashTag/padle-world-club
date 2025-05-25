/**
 * Репозиторий для работы с моделью Payment
 * Содержит методы CRUD для работы с платежами
 */

import { eq, and, gte, lte, desc } from "drizzle-orm";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "../db/schema";
import { Payment, NewPayment, payments } from "../db/schema";

export class PaymentRepository {
  private db: PostgresJsDatabase<typeof schema>;

  constructor(db: PostgresJsDatabase<typeof schema>) {
    this.db = db;
  }

  /**
   * Создает новый платеж
   * @param paymentData Данные платежа
   * @returns Созданный платеж
   */
  async create(paymentData: NewPayment): Promise<Payment> {
    const [payment] = await this.db.insert(payments).values(paymentData).returning();
    return payment;
  }

  /**
   * Получает платеж по ID
   * @param id ID платежа
   * @returns Платеж или null, если платеж не найден
   */
  async getById(id: string): Promise<Payment | null> {
    const result = await this.db
      .select()
      .from(payments)
      .where(eq(payments.id, id));

    return result.length > 0 ? result[0] : null;
  }

  /**
   * Получает все платежи пользователя
   * @param userId ID пользователя
   * @returns Массив платежей
   */
  async getByUserId(userId: string): Promise<Payment[]> {
    return await this.db
      .select()
      .from(payments)
      .where(eq(payments.userId, userId))
      .orderBy(desc(payments.createdAt));
  }

  /**
   * Получает платежи с определенным статусом
   * @param status Статус платежа
   * @returns Массив платежей
   */
  async getByStatus(status: "success" | "failed" | "pending" | "refunded" | "partial"): Promise<Payment[]> {
    return await this.db
      .select()
      .from(payments)
      .where(eq(payments.status, status))
      .orderBy(desc(payments.createdAt));
  }

  /**
   * Получает платежи по методу оплаты
   * @param paymentMethod Метод оплаты
   * @returns Массив платежей
   */
  async getByPaymentMethod(paymentMethod: "card" | "cash" | "bank_transfer" | "bonus_points"): Promise<Payment[]> {
    return await this.db
      .select()
      .from(payments)
      .where(eq(payments.paymentMethod, paymentMethod))
      .orderBy(desc(payments.createdAt));
  }

  /**
   * Получает платежи пользователя с определенным статусом
   * @param userId ID пользователя
   * @param status Статус платежа
   * @returns Массив платежей
   */
  async getByUserAndStatus(
    userId: string,
    status: "success" | "failed" | "pending" | "refunded" | "partial"
  ): Promise<Payment[]> {
    return await this.db
      .select()
      .from(payments)
      .where(
        and(
          eq(payments.userId, userId),
          eq(payments.status, status)
        )
      )
      .orderBy(desc(payments.createdAt));
  }

  /**
   * Получает платежи в определенном диапазоне сумм
   * @param minAmount Минимальная сумма
   * @param maxAmount Максимальная сумма
   * @param currency Валюта (опционально)
   * @returns Массив платежей
   */
  async getByAmountRange(minAmount: string, maxAmount: string, currency?: string): Promise<Payment[]> {
    let whereConditions = and(
      gte(payments.amount, minAmount),
      lte(payments.amount, maxAmount)
    );

    if (currency) {
      whereConditions = and(
        whereConditions,
        eq(payments.currency, currency)
      );
    }

    return await this.db
      .select()
      .from(payments)
      .where(whereConditions)
      .orderBy(desc(payments.createdAt));
  }

  /**
   * Получает платежи в определенном временном диапазоне
   * @param startDate Начальная дата
   * @param endDate Конечная дата
   * @returns Массив платежей
   */
  async getByDateRange(startDate: Date, endDate: Date): Promise<Payment[]> {
    return await this.db
      .select()
      .from(payments)
      .where(
        and(
          gte(payments.createdAt, startDate),
          lte(payments.createdAt, endDate)
        )
      )
      .orderBy(desc(payments.createdAt));
  }

  /**
   * Получает платежи связанные с участником бронирования
   * @param bookingParticipantId ID участника бронирования
   * @returns Массив платежей
   */
  async getByBookingParticipantId(bookingParticipantId: string): Promise<Payment[]> {
    return await this.db
      .select()
      .from(payments)
      .where(eq(payments.relatedBookingParticipantId, bookingParticipantId))
      .orderBy(desc(payments.createdAt));
  }

  /**
   * Получает платежи связанные с заказом
   * @param orderId ID заказа
   * @returns Массив платежей
   */
  async getByOrderId(orderId: string): Promise<Payment[]> {
    return await this.db
      .select()
      .from(payments)
      .where(eq(payments.relatedOrderId, orderId))
      .orderBy(desc(payments.createdAt));
  }

  /**
   * Получает платежи связанные с пакетом тренировок
   * @param userTrainingPackageId ID пакета тренировок пользователя
   * @returns Массив платежей
   */
  async getByUserTrainingPackageId(userTrainingPackageId: string): Promise<Payment[]> {
    return await this.db
      .select()
      .from(payments)
      .where(eq(payments.relatedUserTrainingPackageId, userTrainingPackageId))
      .orderBy(desc(payments.createdAt));
  }

  /**
   * Получает платеж по ID транзакции платежного шлюза
   * @param gatewayTransactionId ID транзакции в платежной системе
   * @returns Платеж или null, если платеж не найден
   */
  async getByGatewayTransactionId(gatewayTransactionId: string): Promise<Payment | null> {
    const result = await this.db
      .select()
      .from(payments)
      .where(eq(payments.gatewayTransactionId, gatewayTransactionId));

    return result.length > 0 ? result[0] : null;
  }

  /**
   * Получает все платежи
   * @returns Массив платежей
   */
  async getAll(): Promise<Payment[]> {
    return await this.db
      .select()
      .from(payments)
      .orderBy(desc(payments.createdAt));
  }

  /**
   * Обновляет данные платежа
   * @param id ID платежа
   * @param paymentData Данные для обновления
   * @returns Обновленный платеж или null, если платеж не найден
   */
  async update(id: string, paymentData: Partial<NewPayment>): Promise<Payment | null> {
    const [updatedPayment] = await this.db
      .update(payments)
      .set(paymentData)
      .where(eq(payments.id, id))
      .returning();

    return updatedPayment || null;
  }

  /**
   * Обновляет статус платежа
   * @param id ID платежа
   * @param status Новый статус платежа
   * @returns Обновленный платеж или null, если платеж не найден
   */
  async updateStatus(
    id: string,
    status: "success" | "failed" | "pending" | "refunded" | "partial"
  ): Promise<Payment | null> {
    return await this.update(id, { status });
  }

  /**
   * Обновляет ID транзакции платежного шлюза
   * @param id ID платежа
   * @param gatewayTransactionId ID транзакции в платежной системе
   * @returns Обновленный платеж или null, если платеж не найден
   */
  async updateGatewayTransactionId(id: string, gatewayTransactionId: string): Promise<Payment | null> {
    return await this.update(id, { gatewayTransactionId });
  }

  /**
   * Удаляет платеж
   * @param id ID платежа
   * @returns true, если платеж успешно удален, иначе false
   */
  async delete(id: string): Promise<boolean> {
    const [deletedPayment] = await this.db
      .delete(payments)
      .where(eq(payments.id, id))
      .returning();

    return !!deletedPayment;
  }

  /**
   * Получает статистику платежей пользователя
   * @param userId ID пользователя
   * @returns Объект со статистикой платежей
   */
  async getUserPaymentStats(userId: string): Promise<{
    totalAmount: string;
    successfulPayments: number;
    failedPayments: number;
    pendingPayments: number;
    totalPayments: number;
  }> {
    const userPayments = await this.getByUserId(userId);

    const totalAmount = userPayments
      .filter(p => p.status === "success")
      .reduce((sum, p) => sum + parseFloat(p.amount), 0);

    const successfulPayments = userPayments.filter(p => p.status === "success").length;
    const failedPayments = userPayments.filter(p => p.status === "failed").length;
    const pendingPayments = userPayments.filter(p => p.status === "pending").length;
    const totalPayments = userPayments.length;

    return {
      totalAmount: totalAmount.toFixed(2),
      successfulPayments,
      failedPayments,
      pendingPayments,
      totalPayments,
    };
  }

  /**
   * Получает общую статистику платежей
   * @param currency Валюта для фильтрации (опционально)
   * @returns Объект с общей статистикой платежей
   */
  async getOverallStats(currency?: string): Promise<{
    totalAmount: string;
    successfulPayments: number;
    failedPayments: number;
    pendingPayments: number;
    totalPayments: number;
    averagePayment: string;
  }> {
    let allPayments = await this.getAll();

    if (currency) {
      allPayments = allPayments.filter(p => p.currency === currency);
    }

    const successfulPayments = allPayments.filter(p => p.status === "success");
    const totalAmount = successfulPayments.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const averagePayment = successfulPayments.length > 0 ? totalAmount / successfulPayments.length : 0;

    const failedPayments = allPayments.filter(p => p.status === "failed").length;
    const pendingPayments = allPayments.filter(p => p.status === "pending").length;
    const totalPayments = allPayments.length;

    return {
      totalAmount: totalAmount.toFixed(2),
      successfulPayments: successfulPayments.length,
      failedPayments,
      pendingPayments,
      totalPayments,
      averagePayment: averagePayment.toFixed(2),
    };
  }
}
