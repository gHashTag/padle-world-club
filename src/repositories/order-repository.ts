/**
 * Репозиторий для работы с моделью Order
 * Содержит методы CRUD для работы с заказами и позициями заказов
 */

import { eq, and, desc, sql, count, gte, lte } from "drizzle-orm";
import { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as schema from "../db/schema";
import {
  Order,
  NewOrder,
  orders,
  OrderItem,
  NewOrderItem,
  orderItems,
  UpdateOrder,
  OrderWithItems,
  OrderStats,
  OrderGroupedByStatus,
  OrderGroupedByDate,
  OrderGroupedByUser,
  TopSellingProduct,
  OrderSummary,
  ORDER_STATUSES,
  OrderStatus
} from "../db/schema";

export class OrderRepository {
  constructor(private db: PostgresJsDatabase<typeof schema>) {}

  /**
   * Создать новый заказ
   * @param data Данные для создания заказа
   * @returns Созданный заказ
   */
  async create(data: NewOrder): Promise<Order> {
    const [order] = await this.db.insert(orders).values(data).returning();
    return order;
  }

  /**
   * Создать позицию заказа
   * @param data Данные для создания позиции
   * @returns Созданная позиция
   */
  async createItem(data: NewOrderItem): Promise<OrderItem> {
    const [item] = await this.db.insert(orderItems).values(data).returning();
    return item;
  }

  /**
   * Создать заказ с позициями (транзакция)
   * @param orderData Данные заказа
   * @param itemsData Данные позиций
   * @returns Созданный заказ с позициями
   */
  async createWithItems(orderData: NewOrder, itemsData: NewOrderItem[]): Promise<OrderWithItems> {
    return await this.db.transaction(async (tx) => {
      const [order] = await tx.insert(orders).values(orderData).returning();

      const items = [];
      for (const itemData of itemsData) {
        const [item] = await tx.insert(orderItems).values({
          ...itemData,
          orderId: order.id
        }).returning();
        items.push(item);
      }

      return { ...order, items };
    });
  }

  /**
   * Получить заказ по ID
   * @param id ID заказа
   * @returns Заказ или null
   */
  async getById(id: string): Promise<Order | null> {
    const [order] = await this.db
      .select()
      .from(orders)
      .where(eq(orders.id, id));
    return order || null;
  }

  /**
   * Получить заказ с позициями
   * @param id ID заказа
   * @returns Заказ с позициями или null
   */
  async getByIdWithItems(id: string): Promise<OrderWithItems | null> {
    const order = await this.getById(id);
    if (!order) return null;

    const items = await this.db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, id));

    return { ...order, items };
  }

  /**
   * Получить все заказы пользователя
   * @param userId ID пользователя
   * @param limit Лимит записей
   * @param offset Смещение
   * @returns Массив заказов
   */
  async getByUser(userId: string, limit?: number, offset?: number): Promise<Order[]> {
    const baseQuery = this.db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(desc(orders.orderDate));

    if (limit && offset) {
      return await baseQuery.limit(limit).offset(offset);
    } else if (limit) {
      return await baseQuery.limit(limit);
    } else if (offset) {
      return await baseQuery.offset(offset);
    }

    return await baseQuery;
  }

  /**
   * Получить заказы по статусу
   * @param status Статус заказа
   * @param userId ID пользователя (опционально)
   * @param limit Лимит записей
   * @returns Массив заказов
   */
  async getByStatus(status: OrderStatus, userId?: string, limit?: number): Promise<Order[]> {
    const conditions = [eq(orders.status, status)];
    if (userId) {
      conditions.push(eq(orders.userId, userId));
    }

    const baseQuery = this.db
      .select()
      .from(orders)
      .where(and(...conditions))
      .orderBy(desc(orders.orderDate));

    if (limit) {
      return await baseQuery.limit(limit);
    }

    return await baseQuery;
  }

  /**
   * Получить заказы по диапазону дат
   * @param startDate Начальная дата
   * @param endDate Конечная дата
   * @param userId ID пользователя (опционально)
   * @returns Массив заказов
   */
  async getByDateRange(startDate: Date, endDate: Date, userId?: string): Promise<Order[]> {
    const conditions = [
      gte(orders.orderDate, startDate),
      lte(orders.orderDate, endDate)
    ];
    if (userId) {
      conditions.push(eq(orders.userId, userId));
    }

    return await this.db
      .select()
      .from(orders)
      .where(and(...conditions))
      .orderBy(desc(orders.orderDate));
  }

  /**
   * Получить заказы по диапазону сумм
   * @param minAmount Минимальная сумма
   * @param maxAmount Максимальная сумма
   * @param currency Валюта (опционально)
   * @returns Массив заказов
   */
  async getByAmountRange(minAmount: number, maxAmount: number, currency?: string): Promise<Order[]> {
    const conditions = [
      gte(sql`${orders.totalAmount}::numeric`, minAmount),
      lte(sql`${orders.totalAmount}::numeric`, maxAmount)
    ];
    if (currency) {
      conditions.push(eq(orders.currency, currency));
    }

    return await this.db
      .select()
      .from(orders)
      .where(and(...conditions))
      .orderBy(desc(orders.totalAmount));
  }

  /**
   * Получить позиции заказа
   * @param orderId ID заказа
   * @returns Массив позиций
   */
  async getOrderItems(orderId: string): Promise<OrderItem[]> {
    return await this.db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, orderId));
  }

  /**
   * Получить позиции по товару
   * @param productId ID товара
   * @param limit Лимит записей
   * @returns Массив позиций
   */
  async getItemsByProduct(productId: string, limit?: number): Promise<OrderItem[]> {
    const baseQuery = this.db
      .select()
      .from(orderItems)
      .where(eq(orderItems.productId, productId))
      .orderBy(desc(orderItems.createdAt));

    if (limit) {
      return await baseQuery.limit(limit);
    }

    return await baseQuery;
  }

  /**
   * Получить все заказы
   * @param limit Лимит записей
   * @param offset Смещение
   * @returns Массив заказов
   */
  async getAll(limit?: number, offset?: number): Promise<Order[]> {
    const baseQuery = this.db
      .select()
      .from(orders)
      .orderBy(desc(orders.orderDate));

    if (limit && offset) {
      return await baseQuery.limit(limit).offset(offset);
    } else if (limit) {
      return await baseQuery.limit(limit);
    } else if (offset) {
      return await baseQuery.offset(offset);
    }

    return await baseQuery;
  }

  /**
   * Получить количество заказов
   * @param userId ID пользователя (опционально)
   * @returns Количество заказов
   */
  async getCount(userId?: string): Promise<number> {
    const conditions = [];
    if (userId) {
      conditions.push(eq(orders.userId, userId));
    }

    const [result] = await this.db
      .select({ count: count() })
      .from(orders)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return result.count;
  }

  /**
   * Обновить заказ
   * @param id ID заказа
   * @param data Данные для обновления
   * @returns Обновленный заказ или null
   */
  async update(id: string, data: UpdateOrder): Promise<Order | null> {
    const [order] = await this.db
      .update(orders)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return order || null;
  }

  /**
   * Обновить статус заказа
   * @param id ID заказа
   * @param status Новый статус
   * @returns Обновленный заказ или null
   */
  async updateStatus(id: string, status: OrderStatus): Promise<Order | null> {
    return await this.update(id, { status });
  }

  /**
   * Обновить позицию заказа
   * @param id ID позиции
   * @param data Данные для обновления
   * @returns Обновленная позиция или null
   */
  async updateItem(id: string, data: Partial<NewOrderItem>): Promise<OrderItem | null> {
    const [item] = await this.db
      .update(orderItems)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(orderItems.id, id))
      .returning();
    return item || null;
  }

  /**
   * Удалить заказ
   * @param id ID заказа
   * @returns true, если заказ удален
   */
  async delete(id: string): Promise<boolean> {
    const [deletedOrder] = await this.db
      .delete(orders)
      .where(eq(orders.id, id))
      .returning();
    return !!deletedOrder;
  }

  /**
   * Удалить позицию заказа
   * @param id ID позиции
   * @returns true, если позиция удалена
   */
  async deleteItem(id: string): Promise<boolean> {
    const [deletedItem] = await this.db
      .delete(orderItems)
      .where(eq(orderItems.id, id))
      .returning();
    return !!deletedItem;
  }

  /**
   * Получить статистику заказов
   * @param userId ID пользователя (опционально)
   * @returns Статистика заказов
   */
  async getStats(userId?: string): Promise<OrderStats> {
    const conditions = [];
    if (userId) {
      conditions.push(eq(orders.userId, userId));
    }

    const [stats] = await this.db
      .select({
        totalOrders: count(),
        pendingOrders: sql<number>`count(*) filter (where ${orders.status} = 'pending')::int`,
        completedOrders: sql<number>`count(*) filter (where ${orders.status} = 'completed')::int`,
        cancelledOrders: sql<number>`count(*) filter (where ${orders.status} = 'cancelled')::int`,
        refundedOrders: sql<number>`count(*) filter (where ${orders.status} = 'refunded')::int`,
        totalRevenue: sql<number>`coalesce(sum(case when ${orders.status} = 'completed' then ${orders.totalAmount}::numeric else 0 end), 0)`,
        averageOrderValue: sql<number>`coalesce(avg(case when ${orders.status} = 'completed' then ${orders.totalAmount}::numeric else null end), 0)`,
      })
      .from(orders)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    // Получаем статистику по позициям
    const [itemStats] = await this.db
      .select({
        totalItemsSold: sql<number>`coalesce(sum(${orderItems.quantity}), 0)::int`,
        averageItemsPerOrder: sql<number>`coalesce(avg(order_item_counts.item_count), 0)`,
      })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .innerJoin(
        sql`(
          select order_id, sum(quantity) as item_count
          from order_item
          group by order_id
        ) as order_item_counts`,
        sql`order_item_counts.order_id = ${orders.id}`
      )
      .where(
        and(
          eq(orders.status, ORDER_STATUSES.COMPLETED),
          ...(conditions.length > 0 ? conditions : [])
        )
      );

    return {
      ...stats,
      totalItemsSold: itemStats.totalItemsSold,
      averageItemsPerOrder: Math.round(itemStats.averageItemsPerOrder * 100) / 100,
    };
  }

  /**
   * Получить заказы, сгруппированные по статусу
   * @param userId ID пользователя (опционально)
   * @returns Массив групп заказов по статусу
   */
  async getGroupedByStatus(userId?: string): Promise<OrderGroupedByStatus[]> {
    const conditions = [];
    if (userId) {
      conditions.push(eq(orders.userId, userId));
    }

    return await this.db
      .select({
        status: orders.status,
        ordersCount: sql<number>`count(*)::int`,
        totalRevenue: sql<number>`coalesce(sum(${orders.totalAmount}::numeric), 0)`,
        averageOrderValue: sql<number>`coalesce(avg(${orders.totalAmount}::numeric), 0)`,
      })
      .from(orders)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .groupBy(orders.status)
      .orderBy(desc(sql`count(*)`));
  }

  /**
   * Получить заказы, сгруппированные по дате
   * @param userId ID пользователя (опционально)
   * @param days Количество дней назад (по умолчанию 30)
   * @returns Массив групп заказов по дате
   */
  async getGroupedByDate(userId?: string, days: number = 30): Promise<OrderGroupedByDate[]> {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    const conditions = [gte(orders.orderDate, dateThreshold)];
    if (userId) {
      conditions.push(eq(orders.userId, userId));
    }

    return await this.db
      .select({
        date: sql<string>`date(${orders.orderDate})`,
        ordersCount: sql<number>`count(*)::int`,
        totalRevenue: sql<number>`coalesce(sum(case when ${orders.status} = 'completed' then ${orders.totalAmount}::numeric else 0 end), 0)`,
        averageOrderValue: sql<number>`coalesce(avg(case when ${orders.status} = 'completed' then ${orders.totalAmount}::numeric else null end), 0)`,
      })
      .from(orders)
      .where(and(...conditions))
      .groupBy(sql`date(${orders.orderDate})`)
      .orderBy(desc(sql`date(${orders.orderDate})`));
  }

  /**
   * Получить заказы, сгруппированные по пользователям
   * @param limit Лимит записей
   * @returns Массив групп заказов по пользователям
   */
  async getGroupedByUser(limit?: number): Promise<OrderGroupedByUser[]> {
    const baseQuery = this.db
      .select({
        userId: orders.userId,
        username: schema.users.username,
        firstName: schema.users.firstName,
        lastName: schema.users.lastName,
        ordersCount: sql<number>`count(*)::int`,
        totalSpent: sql<number>`coalesce(sum(case when ${orders.status} = 'completed' then ${orders.totalAmount}::numeric else 0 end), 0)`,
        averageOrderValue: sql<number>`coalesce(avg(case when ${orders.status} = 'completed' then ${orders.totalAmount}::numeric else null end), 0)`,
        lastOrderDate: sql<Date | null>`max(${orders.orderDate})`,
      })
      .from(orders)
      .innerJoin(schema.users, eq(orders.userId, schema.users.id))
      .groupBy(orders.userId, schema.users.username, schema.users.firstName, schema.users.lastName)
      .orderBy(desc(sql`sum(case when ${orders.status} = 'completed' then ${orders.totalAmount}::numeric else 0 end)`));

    if (limit) {
      return await baseQuery.limit(limit);
    }

    return await baseQuery;
  }

  /**
   * Получить топ продаваемых товаров
   * @param limit Лимит записей
   * @param days Количество дней назад (опционально)
   * @returns Массив топ товаров
   */
  async getTopSellingProducts(limit: number = 10, days?: number): Promise<TopSellingProduct[]> {
    const conditions = [eq(orders.status, ORDER_STATUSES.COMPLETED)];
    if (days) {
      const dateThreshold = new Date();
      dateThreshold.setDate(dateThreshold.getDate() - days);
      conditions.push(gte(orders.orderDate, dateThreshold));
    }

    return await this.db
      .select({
        productId: orderItems.productId,
        productName: schema.products.name,
        totalQuantitySold: sql<number>`sum(${orderItems.quantity})::int`,
        totalRevenue: sql<number>`sum(${orderItems.quantity} * ${orderItems.unitPriceAtSale}::numeric)`,
        ordersCount: sql<number>`count(distinct ${orders.id})::int`,
        averageQuantityPerOrder: sql<number>`avg(${orderItems.quantity})`,
      })
      .from(orderItems)
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .innerJoin(schema.products, eq(orderItems.productId, schema.products.id))
      .where(and(...conditions))
      .groupBy(orderItems.productId, schema.products.name)
      .orderBy(desc(sql`sum(${orderItems.quantity})`))
      .limit(limit);
  }

  /**
   * Получить сводку заказов
   * @param limit Лимит записей
   * @param offset Смещение
   * @returns Массив сводок заказов
   */
  async getOrderSummaries(limit?: number, offset?: number): Promise<OrderSummary[]> {
    const baseQuery = this.db
      .select({
        orderId: orders.id,
        orderDate: orders.orderDate,
        status: orders.status,
        totalAmount: sql<number>`${orders.totalAmount}::numeric`,
        currency: orders.currency,
        itemsCount: sql<number>`coalesce(order_item_counts.item_count, 0)::int`,
        customerName: sql<string>`${schema.users.firstName} || ' ' || ${schema.users.lastName}`,
        customerEmail: schema.users.email,
      })
      .from(orders)
      .innerJoin(schema.users, eq(orders.userId, schema.users.id))
      .leftJoin(
        sql`(
          select order_id, sum(quantity) as item_count
          from order_item
          group by order_id
        ) as order_item_counts`,
        sql`order_item_counts.order_id = ${orders.id}`
      )
      .orderBy(desc(orders.orderDate));

    if (limit && offset) {
      return await baseQuery.limit(limit).offset(offset);
    } else if (limit) {
      return await baseQuery.limit(limit);
    } else if (offset) {
      return await baseQuery.offset(offset);
    }

    return await baseQuery;
  }

  /**
   * Получить недавние заказы
   * @param days Количество дней назад
   * @param userId ID пользователя (опционально)
   * @returns Массив недавних заказов
   */
  async getRecentOrders(days: number, userId?: string): Promise<Order[]> {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    const conditions = [gte(orders.createdAt, dateThreshold)];
    if (userId) {
      conditions.push(eq(orders.userId, userId));
    }

    return await this.db
      .select()
      .from(orders)
      .where(and(...conditions))
      .orderBy(desc(orders.createdAt));
  }
}
