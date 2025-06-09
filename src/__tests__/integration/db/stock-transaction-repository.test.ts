import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../../../db/schema";
import { stockTransactions, products, productCategories } from "../../../db/schema";
import { StockTransactionRepository } from "../../../repositories/stock-transaction-repository";
import { ProductRepository } from "../../../repositories/product-repository";
import { ProductCategoryRepository } from "../../../repositories/product-category-repository";
import dotenv from "dotenv";

// Загружаем переменные окружения из файла .env
dotenv.config();

// Используем тестовую базу данных
const DATABASE_URL_TEST = process.env.DATABASE_URL_TEST || process.env.DATABASE_URL;

if (!DATABASE_URL_TEST) {
  throw new Error("DATABASE_URL_TEST is not defined");
}

const pool = new Pool({
  connectionString: DATABASE_URL_TEST,
});

const testDb = drizzle(pool, { schema });

describe("StockTransactionRepository", () => {
  let stockTransactionRepo: StockTransactionRepository;
  let productRepo: ProductRepository;
  let categoryRepo: ProductCategoryRepository;
  let testProductId: string;
  let testCategoryId: string;

  beforeEach(async () => {
    stockTransactionRepo = new StockTransactionRepository(testDb);
    productRepo = new ProductRepository(testDb);
    categoryRepo = new ProductCategoryRepository(testDb);

    // Создаем тестовую категорию
    const category = await categoryRepo.create({
      name: "Test Category",
      description: "Test category for stock transactions",
      type: "other",
    });
    testCategoryId = category.id;

    // Создаем тестовый продукт
    const product = await productRepo.create({
      name: "Test Product",
      description: "Test product for stock transactions",
      price: "100.00",
      currency: "USD",
      categoryId: testCategoryId,
      currentStock: 0,
      reorderThreshold: 10,
      isActive: true,
    });
    testProductId = product.id;
  });

  afterEach(async () => {
    // Очищаем тестовые данные
    await testDb.delete(stockTransactions);
    await testDb.delete(products);
    await testDb.delete(productCategories);
  });

  describe("create", () => {
    it("должен создать новую складскую транзакцию", async () => {
      const transactionData = {
        productId: testProductId,
        transactionType: "purchase" as const,
        quantityChange: 50,
        currentStockAfter: 50,
        notes: "Initial stock purchase",
      };

      const transaction = await stockTransactionRepo.create(transactionData);

      expect(transaction).toBeDefined();
      expect(transaction.id).toBeDefined();
      expect(transaction.productId).toBe(testProductId);
      expect(transaction.transactionType).toBe("purchase");
      expect(transaction.quantityChange).toBe(50);
      expect(transaction.currentStockAfter).toBe(50);
      expect(transaction.notes).toBe("Initial stock purchase");
    });
  });

  describe("findById", () => {
    it("должен найти транзакцию по ID", async () => {
      const created = await stockTransactionRepo.create({
        productId: testProductId,
        transactionType: "purchase" as const,
        quantityChange: 30,
        currentStockAfter: 30,
      });

      const found = await stockTransactionRepo.findById(created.id);

      expect(found).toBeDefined();
      expect(found!.id).toBe(created.id);
      expect(found!.quantityChange).toBe(30);
    });

    it("должен вернуть null для несуществующего ID", async () => {
      const found = await stockTransactionRepo.findById("00000000-0000-0000-0000-000000000000");
      expect(found).toBeNull();
    });
  });

  describe("findByProductId", () => {
    it("должен найти все транзакции для продукта", async () => {
      // Создаем несколько транзакций
      await stockTransactionRepo.create({
        productId: testProductId,
        transactionType: "purchase" as const,
        quantityChange: 100,
        currentStockAfter: 100,
      });

      await stockTransactionRepo.create({
        productId: testProductId,
        transactionType: "sale" as const,
        quantityChange: -20,
        currentStockAfter: 80,
      });

      const transactions = await stockTransactionRepo.findByProductId(testProductId);

      expect(transactions).toHaveLength(2);
      expect(transactions.every(t => t.productId === testProductId)).toBe(true);
    });
  });

  describe("findByType", () => {
    it("должен найти транзакции по типу", async () => {
      await stockTransactionRepo.create({
        productId: testProductId,
        transactionType: "purchase" as const,
        quantityChange: 100,
        currentStockAfter: 100,
      });

      await stockTransactionRepo.create({
        productId: testProductId,
        transactionType: "sale" as const,
        quantityChange: -20,
        currentStockAfter: 80,
      });

      const purchases = await stockTransactionRepo.findByType("purchase");
      const sales = await stockTransactionRepo.findByType("sale");

      expect(purchases).toHaveLength(1);
      expect(purchases[0].transactionType).toBe("purchase");

      expect(sales).toHaveLength(1);
      expect(sales[0].transactionType).toBe("sale");
    });
  });

  describe("getCurrentStock", () => {
    it("должен вернуть текущий остаток товара", async () => {
      // Создаем последовательность транзакций
      await stockTransactionRepo.create({
        productId: testProductId,
        transactionType: "purchase" as const,
        quantityChange: 100,
        currentStockAfter: 100,
      });

      await stockTransactionRepo.create({
        productId: testProductId,
        transactionType: "sale" as const,
        quantityChange: -30,
        currentStockAfter: 70,
      });

      const currentStock = await stockTransactionRepo.getCurrentStock(testProductId);
      expect(currentStock).toBe(70);
    });

    it("должен вернуть 0 для продукта без транзакций", async () => {
      const currentStock = await stockTransactionRepo.getCurrentStock("00000000-0000-0000-0000-000000000000");
      expect(currentStock).toBe(0);
    });
  });

  describe("getStockMovementSummary", () => {
    it("должен вернуть сводку движения товаров", async () => {
      // Создаем различные типы транзакций
      await stockTransactionRepo.create({
        productId: testProductId,
        transactionType: "purchase" as const,
        quantityChange: 100,
        currentStockAfter: 100,
      });

      await stockTransactionRepo.create({
        productId: testProductId,
        transactionType: "sale" as const,
        quantityChange: -30,
        currentStockAfter: 70,
      });

      await stockTransactionRepo.create({
        productId: testProductId,
        transactionType: "adjustment" as const,
        quantityChange: -5,
        currentStockAfter: 65,
      });

      await stockTransactionRepo.create({
        productId: testProductId,
        transactionType: "return" as const,
        quantityChange: 10,
        currentStockAfter: 75,
      });

      const summary = await stockTransactionRepo.getStockMovementSummary(testProductId);

      expect(summary.purchases).toBe(100);
      expect(summary.sales).toBe(30); // Абсолютное значение
      expect(summary.adjustments).toBe(-5);
      expect(summary.returns).toBe(10);
    });
  });

  describe("update", () => {
    it("должен обновить транзакцию", async () => {
      const created = await stockTransactionRepo.create({
        productId: testProductId,
        transactionType: "purchase" as const,
        quantityChange: 50,
        currentStockAfter: 50,
      });

      const updated = await stockTransactionRepo.update(created.id, {
        notes: "Updated notes",
      });

      expect(updated).toBeDefined();
      expect(updated!.notes).toBe("Updated notes");
      expect(updated!.updatedAt).not.toEqual(created.updatedAt);
    });
  });

  describe("delete", () => {
    it("должен удалить транзакцию", async () => {
      const created = await stockTransactionRepo.create({
        productId: testProductId,
        transactionType: "purchase" as const,
        quantityChange: 50,
        currentStockAfter: 50,
      });

      const deleted = await stockTransactionRepo.delete(created.id);
      expect(deleted).toBe(true);

      const found = await stockTransactionRepo.findById(created.id);
      expect(found).toBeNull();
    });
  });

  describe("count", () => {
    it("должен подсчитать общее количество транзакций", async () => {
      await stockTransactionRepo.create({
        productId: testProductId,
        transactionType: "purchase" as const,
        quantityChange: 50,
        currentStockAfter: 50,
      });

      await stockTransactionRepo.create({
        productId: testProductId,
        transactionType: "sale" as const,
        quantityChange: -10,
        currentStockAfter: 40,
      });

      const count = await stockTransactionRepo.count();
      expect(count).toBe(2);
    });
  });
});
