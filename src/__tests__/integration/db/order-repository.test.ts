import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../../../db/schema";
import {
  orders,
  orderItems,
  users,
  products,
  productCategories,
  NewOrder,
  NewOrderItem,
  NewUser,
  NewProduct,
  NewProductCategory,
} from "../../../db/schema";
import { OrderRepository } from "../../../repositories/order-repository";
import dotenv from "dotenv";

// Загружаем переменные окружения из файла .env
dotenv.config();

// Используем тестовую базу данных
const DATABASE_URL_TEST =
  process.env.DATABASE_URL_TEST || process.env.DATABASE_URL;

if (!DATABASE_URL_TEST) {
  throw new Error("DATABASE_URL_TEST или DATABASE_URL должен быть установлен");
}

const pool = new Pool({
  connectionString: DATABASE_URL_TEST,
});

const db = drizzle(pool, { schema });
const orderRepository = new OrderRepository(db);

describe("OrderRepository", () => {
  let testUser1: schema.User;
  let testUser2: schema.User;
  let testCategory: schema.ProductCategory;
  let testProduct1: schema.Product;
  let testProduct2: schema.Product;

  // Функция для очистки таблиц перед/после тестов
  const cleanupDatabase = async () => {
    await db.delete(orderItems);
    await db.delete(orders);
    await db.delete(products);
    await db.delete(productCategories);
    await db.delete(users);
  };

  beforeEach(async () => {
    await cleanupDatabase();

    // Создаем тестовых пользователей
    const userData1: NewUser = {
      username: "test_user1",
      passwordHash: "hashed_password",
      firstName: "Test",
      lastName: "User1",
      email: "user1@test.com",
      memberId: "USER001",
      userRole: "player",
      currentRating: 1500,
    };
    [testUser1] = await db.insert(users).values(userData1).returning();

    const userData2: NewUser = {
      username: "test_user2",
      passwordHash: "hashed_password",
      firstName: "Test",
      lastName: "User2",
      email: "user2@test.com",
      memberId: "USER002",
      userRole: "player",
      currentRating: 1600,
    };
    [testUser2] = await db.insert(users).values(userData2).returning();

    // Создаем тестовую категорию товаров
    const categoryData: NewProductCategory = {
      name: "Test Category",
      type: "court_gear",
    };
    [testCategory] = await db.insert(productCategories).values(categoryData).returning();

    // Создаем тестовые товары
    const productData1: NewProduct = {
      categoryId: testCategory.id,
      name: "Test Product 1",
      description: "Test product description 1",
      price: "29.99",
      currency: "USD",
      currentStock: 100,
      reorderThreshold: 10,
      isActive: true,
    };
    [testProduct1] = await db.insert(products).values(productData1).returning();

    const productData2: NewProduct = {
      categoryId: testCategory.id,
      name: "Test Product 2",
      description: "Test product description 2",
      price: "49.99",
      currency: "USD",
      currentStock: 50,
      reorderThreshold: 5,
      isActive: true,
    };
    [testProduct2] = await db.insert(products).values(productData2).returning();
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  // Вспомогательная функция для создания тестового заказа
  const createTestOrder = async (customData: Partial<NewOrder> = {}): Promise<schema.Order> => {
    const defaultOrderData: NewOrder = {
      userId: testUser1.id,
      totalAmount: "79.98",
      currency: "USD",
      status: "pending",
      ...customData,
    };

    return await orderRepository.create(defaultOrderData);
  };

  // Вспомогательная функция для создания тестовой позиции заказа
  const createTestOrderItem = async (orderId: string, customData: Partial<NewOrderItem> = {}): Promise<schema.OrderItem> => {
    const defaultItemData: NewOrderItem = {
      orderId,
      productId: testProduct1.id,
      quantity: 2,
      unitPriceAtSale: "29.99",
      ...customData,
    };

    return await orderRepository.createItem(defaultItemData);
  };

  describe("create", () => {
    it("должен создавать заказ", async () => {
      const orderData: NewOrder = {
        userId: testUser1.id,
        totalAmount: "59.98",
        currency: "USD",
        status: "pending",
      };

      const createdOrder = await orderRepository.create(orderData);

      expect(createdOrder).toBeDefined();
      expect(createdOrder.id).toBeDefined();
      expect(createdOrder.userId).toBe(testUser1.id);
      expect(createdOrder.totalAmount).toBe("59.98");
      expect(createdOrder.currency).toBe("USD");
      expect(createdOrder.status).toBe("pending");
      expect(createdOrder.createdAt).toBeDefined();
      expect(createdOrder.updatedAt).toBeDefined();
    });
  });

  describe("createItem", () => {
    it("должен создавать позицию заказа", async () => {
      const order = await createTestOrder();

      const itemData: NewOrderItem = {
        orderId: order.id,
        productId: testProduct1.id,
        quantity: 3,
        unitPriceAtSale: "29.99",
      };

      const createdItem = await orderRepository.createItem(itemData);

      expect(createdItem).toBeDefined();
      expect(createdItem.id).toBeDefined();
      expect(createdItem.orderId).toBe(order.id);
      expect(createdItem.productId).toBe(testProduct1.id);
      expect(createdItem.quantity).toBe(3);
      expect(createdItem.unitPriceAtSale).toBe("29.99");
    });
  });

  describe("createWithItems", () => {
    it("должен создавать заказ с позициями в транзакции", async () => {
      const orderData: NewOrder = {
        userId: testUser1.id,
        totalAmount: "109.97",
        currency: "USD",
        status: "pending",
      };

      const itemsData: NewOrderItem[] = [
        {
          orderId: "", // будет заполнено автоматически
          productId: testProduct1.id,
          quantity: 2,
          unitPriceAtSale: "29.99",
        },
        {
          orderId: "", // будет заполнено автоматически
          productId: testProduct2.id,
          quantity: 1,
          unitPriceAtSale: "49.99",
        },
      ];

      const orderWithItems = await orderRepository.createWithItems(orderData, itemsData);

      expect(orderWithItems).toBeDefined();
      expect(orderWithItems.id).toBeDefined();
      expect(orderWithItems.userId).toBe(testUser1.id);
      expect(orderWithItems.items).toHaveLength(2);
      expect(orderWithItems.items[0].orderId).toBe(orderWithItems.id);
      expect(orderWithItems.items[1].orderId).toBe(orderWithItems.id);
    });
  });

  describe("getById", () => {
    it("должен возвращать заказ по ID", async () => {
      const createdOrder = await createTestOrder();

      const foundOrder = await orderRepository.getById(createdOrder.id);

      expect(foundOrder).toBeDefined();
      expect(foundOrder?.id).toBe(createdOrder.id);
      expect(foundOrder?.userId).toBe(testUser1.id);
    });

    it("должен возвращать null для несуществующего заказа", async () => {
      const foundOrder = await orderRepository.getById("00000000-0000-0000-0000-000000000000");

      expect(foundOrder).toBeNull();
    });
  });

  describe("getByIdWithItems", () => {
    it("должен возвращать заказ с позициями", async () => {
      const order = await createTestOrder();
      await createTestOrderItem(order.id);
      await createTestOrderItem(order.id, { productId: testProduct2.id, quantity: 1, unitPriceAtSale: "49.99" });

      const orderWithItems = await orderRepository.getByIdWithItems(order.id);

      expect(orderWithItems).toBeDefined();
      expect(orderWithItems?.id).toBe(order.id);
      expect(orderWithItems?.items).toHaveLength(2);
    });

    it("должен возвращать null для несуществующего заказа", async () => {
      const orderWithItems = await orderRepository.getByIdWithItems("00000000-0000-0000-0000-000000000000");

      expect(orderWithItems).toBeNull();
    });
  });

  describe("getByUser", () => {
    it("должен возвращать заказы пользователя", async () => {
      await createTestOrder({ userId: testUser1.id });
      await createTestOrder({ userId: testUser1.id, status: "completed" });
      await createTestOrder({ userId: testUser2.id });

      const user1Orders = await orderRepository.getByUser(testUser1.id);
      const user2Orders = await orderRepository.getByUser(testUser2.id);

      expect(user1Orders).toHaveLength(2);
      expect(user2Orders).toHaveLength(1);
      expect(user1Orders.every(order => order.userId === testUser1.id)).toBe(true);
    });

    it("должен поддерживать лимит и смещение", async () => {
      await createTestOrder({ userId: testUser1.id });
      await createTestOrder({ userId: testUser1.id });
      await createTestOrder({ userId: testUser1.id });

      const limitedOrders = await orderRepository.getByUser(testUser1.id, 2);
      const offsetOrders = await orderRepository.getByUser(testUser1.id, 2, 1);

      expect(limitedOrders).toHaveLength(2);
      expect(offsetOrders).toHaveLength(2);
    });
  });

  describe("getByStatus", () => {
    it("должен возвращать заказы по статусу", async () => {
      await createTestOrder({ status: "pending" });
      await createTestOrder({ status: "completed" });
      await createTestOrder({ status: "pending", userId: testUser2.id });

      const pendingOrders = await orderRepository.getByStatus("pending");
      const completedOrders = await orderRepository.getByStatus("completed");
      const user1PendingOrders = await orderRepository.getByStatus("pending", testUser1.id);

      expect(pendingOrders).toHaveLength(2);
      expect(completedOrders).toHaveLength(1);
      expect(user1PendingOrders).toHaveLength(1);
    });

    it("должен поддерживать лимит", async () => {
      await createTestOrder({ status: "pending" });
      await createTestOrder({ status: "pending" });
      await createTestOrder({ status: "pending" });

      const limitedOrders = await orderRepository.getByStatus("pending", undefined, 2);

      expect(limitedOrders).toHaveLength(2);
    });
  });

  describe("getByDateRange", () => {
    it("должен возвращать заказы по диапазону дат", async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      await createTestOrder();
      await createTestOrder({ userId: testUser2.id });

      const ordersInRange = await orderRepository.getByDateRange(yesterday, tomorrow);
      const user1OrdersInRange = await orderRepository.getByDateRange(yesterday, tomorrow, testUser1.id);

      expect(ordersInRange).toHaveLength(2);
      expect(user1OrdersInRange).toHaveLength(1);
    });
  });

  describe("getByAmountRange", () => {
    it("должен возвращать заказы по диапазону сумм", async () => {
      await createTestOrder({ totalAmount: "25.00" });
      await createTestOrder({ totalAmount: "75.00" });
      await createTestOrder({ totalAmount: "125.00" });

      const ordersInRange = await orderRepository.getByAmountRange(50, 100);
      const ordersInRangeUSD = await orderRepository.getByAmountRange(50, 100, "USD");

      expect(ordersInRange).toHaveLength(1);
      expect(ordersInRangeUSD).toHaveLength(1);
      expect(ordersInRange[0].totalAmount).toBe("75.00");
    });
  });

  describe("getOrderItems", () => {
    it("должен возвращать позиции заказа", async () => {
      const order = await createTestOrder();
      await createTestOrderItem(order.id);
      await createTestOrderItem(order.id, { productId: testProduct2.id });

      const items = await orderRepository.getOrderItems(order.id);

      expect(items).toHaveLength(2);
      expect(items.every(item => item.orderId === order.id)).toBe(true);
    });
  });

  describe("getItemsByProduct", () => {
    it("должен возвращать позиции по товару", async () => {
      const order1 = await createTestOrder();
      const order2 = await createTestOrder({ userId: testUser2.id });

      await createTestOrderItem(order1.id, { productId: testProduct1.id });
      await createTestOrderItem(order2.id, { productId: testProduct1.id });
      await createTestOrderItem(order1.id, { productId: testProduct2.id });

      const product1Items = await orderRepository.getItemsByProduct(testProduct1.id);
      const product2Items = await orderRepository.getItemsByProduct(testProduct2.id);
      const limitedItems = await orderRepository.getItemsByProduct(testProduct1.id, 1);

      expect(product1Items).toHaveLength(2);
      expect(product2Items).toHaveLength(1);
      expect(limitedItems).toHaveLength(1);
    });
  });

  describe("getAll", () => {
    it("должен возвращать все заказы", async () => {
      await createTestOrder();
      await createTestOrder({ userId: testUser2.id });

      const allOrders = await orderRepository.getAll();

      expect(allOrders).toHaveLength(2);
    });

    it("должен поддерживать лимит и смещение", async () => {
      await createTestOrder();
      await createTestOrder();
      await createTestOrder();

      const limitedOrders = await orderRepository.getAll(2);
      const offsetOrders = await orderRepository.getAll(2, 1);

      expect(limitedOrders).toHaveLength(2);
      expect(offsetOrders).toHaveLength(2);
    });
  });

  describe("getCount", () => {
    it("должен возвращать количество заказов", async () => {
      await createTestOrder();
      await createTestOrder({ userId: testUser2.id });

      const totalCount = await orderRepository.getCount();
      const user1Count = await orderRepository.getCount(testUser1.id);

      expect(totalCount).toBe(2);
      expect(user1Count).toBe(1);
    });
  });

  describe("update", () => {
    it("должен обновлять заказ", async () => {
      const createdOrder = await createTestOrder();

      const updatedOrder = await orderRepository.update(createdOrder.id, {
        status: "completed",
        totalAmount: "99.99",
      });

      expect(updatedOrder).toBeDefined();
      expect(updatedOrder?.id).toBe(createdOrder.id);
      expect(updatedOrder?.status).toBe("completed");
      expect(updatedOrder?.totalAmount).toBe("99.99");
      expect(updatedOrder?.updatedAt).not.toBe(createdOrder.updatedAt);
    });

    it("должен возвращать null при обновлении несуществующего заказа", async () => {
      const updatedOrder = await orderRepository.update("00000000-0000-0000-0000-000000000000", {
        status: "completed",
      });

      expect(updatedOrder).toBeNull();
    });
  });

  describe("updateStatus", () => {
    it("должен обновлять статус заказа", async () => {
      const createdOrder = await createTestOrder({ status: "pending" });

      const updatedOrder = await orderRepository.updateStatus(createdOrder.id, "completed");

      expect(updatedOrder).toBeDefined();
      expect(updatedOrder?.status).toBe("completed");
    });
  });

  describe("updateItem", () => {
    it("должен обновлять позицию заказа", async () => {
      const order = await createTestOrder();
      const item = await createTestOrderItem(order.id);

      const updatedItem = await orderRepository.updateItem(item.id, {
        quantity: 5,
        unitPriceAtSale: "24.99",
      });

      expect(updatedItem).toBeDefined();
      expect(updatedItem?.quantity).toBe(5);
      expect(updatedItem?.unitPriceAtSale).toBe("24.99");
    });
  });

  describe("delete", () => {
    it("должен удалять заказ", async () => {
      const createdOrder = await createTestOrder();

      const deleted = await orderRepository.delete(createdOrder.id);
      const foundOrder = await orderRepository.getById(createdOrder.id);

      expect(deleted).toBe(true);
      expect(foundOrder).toBeNull();
    });

    it("должен возвращать false при удалении несуществующего заказа", async () => {
      const deleted = await orderRepository.delete("00000000-0000-0000-0000-000000000000");

      expect(deleted).toBe(false);
    });
  });

  describe("deleteItem", () => {
    it("должен удалять позицию заказа", async () => {
      const order = await createTestOrder();
      const item = await createTestOrderItem(order.id);

      const deleted = await orderRepository.deleteItem(item.id);
      const items = await orderRepository.getOrderItems(order.id);

      expect(deleted).toBe(true);
      expect(items).toHaveLength(0);
    });
  });

  describe("getStats", () => {
    it("должен возвращать статистику заказов", async () => {
      await createTestOrder({ status: "pending", totalAmount: "50.00" });
      await createTestOrder({ status: "completed", totalAmount: "100.00" });
      await createTestOrder({ status: "cancelled", totalAmount: "75.00" });
      await createTestOrder({ status: "completed", totalAmount: "200.00", userId: testUser2.id });

      const allStats = await orderRepository.getStats();
      const user1Stats = await orderRepository.getStats(testUser1.id);

      expect(allStats.totalOrders).toBe(4);
      expect(allStats.pendingOrders).toBe(1);
      expect(allStats.completedOrders).toBe(2);
      expect(allStats.cancelledOrders).toBe(1);
      expect(Number(allStats.totalRevenue)).toBe(300); // только completed заказы

      expect(user1Stats.totalOrders).toBe(3);
      expect(user1Stats.completedOrders).toBe(1);
    });
  });

  describe("getGroupedByStatus", () => {
    it("должен возвращать заказы, сгруппированные по статусу", async () => {
      await createTestOrder({ status: "pending", totalAmount: "50.00" });
      await createTestOrder({ status: "pending", totalAmount: "75.00" });
      await createTestOrder({ status: "completed", totalAmount: "100.00" });

      const grouped = await orderRepository.getGroupedByStatus();
      const user1Grouped = await orderRepository.getGroupedByStatus(testUser1.id);

      expect(grouped).toHaveLength(2);
      const pendingGroup = grouped.find(g => g.status === "pending");
      expect(pendingGroup?.ordersCount).toBe(2);
      expect(Number(pendingGroup?.totalRevenue)).toBe(125);

      expect(user1Grouped).toHaveLength(2);
    });
  });

  describe("getGroupedByDate", () => {
    it("должен возвращать заказы, сгруппированные по дате", async () => {
      await createTestOrder({ status: "completed", totalAmount: "50.00" });
      await createTestOrder({ status: "completed", totalAmount: "75.00" });

      const grouped = await orderRepository.getGroupedByDate();
      const user1Grouped = await orderRepository.getGroupedByDate(testUser1.id);

      expect(grouped.length).toBeGreaterThan(0);
      expect(user1Grouped.length).toBeGreaterThan(0);
    });
  });

  describe("getGroupedByUser", () => {
    it("должен возвращать заказы, сгруппированные по пользователям", async () => {
      await createTestOrder({ status: "completed", totalAmount: "50.00", userId: testUser1.id });
      await createTestOrder({ status: "completed", totalAmount: "75.00", userId: testUser1.id });
      await createTestOrder({ status: "completed", totalAmount: "100.00", userId: testUser2.id });

      const grouped = await orderRepository.getGroupedByUser();
      const limitedGrouped = await orderRepository.getGroupedByUser(1);

      expect(grouped).toHaveLength(2);
      const user1Group = grouped.find(g => g.userId === testUser1.id);
      expect(user1Group?.ordersCount).toBe(2);
      expect(Number(user1Group?.totalSpent)).toBe(125);

      expect(limitedGrouped).toHaveLength(1);
    });
  });

  describe("getTopSellingProducts", () => {
    it("должен возвращать топ продаваемых товаров", async () => {
      const order1 = await createTestOrder({ status: "completed" });
      const order2 = await createTestOrder({ status: "completed" });

      await createTestOrderItem(order1.id, { productId: testProduct1.id, quantity: 5 });
      await createTestOrderItem(order2.id, { productId: testProduct1.id, quantity: 3 });
      await createTestOrderItem(order1.id, { productId: testProduct2.id, quantity: 2 });

      const topProducts = await orderRepository.getTopSellingProducts(10);
      const limitedProducts = await orderRepository.getTopSellingProducts(1);

      expect(topProducts).toHaveLength(2);
      expect(topProducts[0].productId).toBe(testProduct1.id);
      expect(topProducts[0].totalQuantitySold).toBe(8);

      expect(limitedProducts).toHaveLength(1);
    });
  });

  describe("getOrderSummaries", () => {
    it("должен возвращать сводки заказов", async () => {
      await createTestOrder({ totalAmount: "50.00" });
      await createTestOrder({ totalAmount: "75.00", userId: testUser2.id });

      const summaries = await orderRepository.getOrderSummaries();
      const limitedSummaries = await orderRepository.getOrderSummaries(1);
      const offsetSummaries = await orderRepository.getOrderSummaries(1, 1);

      expect(summaries).toHaveLength(2);
      expect(summaries[0].totalAmount).toBeDefined();
      expect(summaries[0].customerName).toBeDefined();

      expect(limitedSummaries).toHaveLength(1);
      expect(offsetSummaries).toHaveLength(1);
    });
  });

  describe("getRecentOrders", () => {
    it("должен возвращать недавние заказы", async () => {
      await createTestOrder();
      await createTestOrder({ userId: testUser2.id });

      const recentOrders = await orderRepository.getRecentOrders(30);
      const user1RecentOrders = await orderRepository.getRecentOrders(30, testUser1.id);

      expect(recentOrders).toHaveLength(2);
      expect(user1RecentOrders).toHaveLength(1);
    });
  });
});
