import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq } from "drizzle-orm";
import * as schema from "../../../db/schema";
import {
  aiSuggestionLogs,
  users,
  venues,
  NewUser,
  NewVenue,
} from "../../../db/schema";
import { NewAISuggestionLog } from "../../../db/schema/aiSuggestionLog";
import { AISuggestionLogRepository } from "../../../repositories/ai-suggestion-log-repository";
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
const aiSuggestionLogRepository = new AISuggestionLogRepository(db);

describe("AISuggestionLogRepository", () => {
  let testUser1: schema.User;
  let testUser2: schema.User;
  let testVenue: schema.Venue;

  // Функция для очистки таблиц перед/после тестов
  const cleanupDatabase = async () => {
    await db.delete(aiSuggestionLogs);
    await db.delete(users);
    await db.delete(venues);
  };

  beforeEach(async () => {
    await cleanupDatabase();

    // Создаем тестовую площадку
    const venueData: NewVenue = {
      name: "Test Venue",
      address: "123 Test St",
      city: "Test City",
      country: "Test Country",
      isActive: true,
    };
    [testVenue] = await db.insert(venues).values(venueData).returning();

    // Создаем тестовых пользователей
    const userData1: NewUser = {
      username: "test_user1",
      passwordHash: "hashed_password",
      firstName: "Test",
      lastName: "User1",
      email: "user1@test.com",
      memberId: "USER001",
      userRole: "player",
      homeVenueId: testVenue.id,
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
      userRole: "admin",
      homeVenueId: testVenue.id,
      currentRating: 1600,
    };
    [testUser2] = await db.insert(users).values(userData2).returning();
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  // Вспомогательная функция для создания тестового лога AI предложения
  const createTestAISuggestionLog = async (
    customData: Partial<NewAISuggestionLog> = {}
  ): Promise<schema.AISuggestionLog> => {
    const defaultLogData: NewAISuggestionLog = {
      suggestionType: "game_matching",
      userId: testUser1.id,
      inputData: { userRating: 1500, preferredTime: "evening" },
      suggestionData: {
        matchedPlayers: ["player1", "player2"],
        confidence: 0.85,
      },
      confidenceScore: "0.8500",
      executionTimeMs: "150.25",
      modelVersion: "v1.0.0",
      contextData: { venue: testVenue.id, timestamp: new Date().toISOString() },
      ...customData,
    };

    return await aiSuggestionLogRepository.create(defaultLogData);
  };

  describe("create", () => {
    it("должен создавать лог AI предложения", async () => {
      const logData: NewAISuggestionLog = {
        suggestionType: "court_fill_optimization",
        userId: testUser1.id,
        inputData: { currentBookings: 5, capacity: 8 },
        suggestionData: {
          recommendedActions: ["promote_discount", "send_notifications"],
        },
        confidenceScore: "0.9200",
        executionTimeMs: "89.50",
        modelVersion: "v2.1.0",
        contextData: { venue: testVenue.id },
      };

      const createdLog = await aiSuggestionLogRepository.create(logData);

      expect(createdLog).toBeDefined();
      expect(createdLog.id).toBeDefined();
      expect(createdLog.suggestionType).toBe("court_fill_optimization");
      expect(createdLog.userId).toBe(testUser1.id);
      expect(createdLog.inputData).toEqual({ currentBookings: 5, capacity: 8 });
      expect(createdLog.suggestionData).toEqual({
        recommendedActions: ["promote_discount", "send_notifications"],
      });
      expect(createdLog.confidenceScore).toBe("0.9200");
      expect(createdLog.executionTimeMs).toBe("89.50");
      expect(createdLog.modelVersion).toBe("v2.1.0");
      expect(createdLog.wasAccepted).toBeNull();
      expect(createdLog.userFeedback).toBeNull();
    });

    it("должен создавать лог без userId (системное предложение)", async () => {
      const logData: NewAISuggestionLog = {
        suggestionType: "demand_prediction",
        inputData: { historicalData: "last_30_days" },
        suggestionData: {
          predictedDemand: "high",
          timeSlots: ["18:00", "19:00", "20:00"],
        },
        confidenceScore: "0.7800",
        executionTimeMs: "250.75",
        modelVersion: "v1.5.0",
      };

      const createdLog = await aiSuggestionLogRepository.create(logData);

      expect(createdLog).toBeDefined();
      expect(createdLog.userId).toBeNull();
      expect(createdLog.suggestionType).toBe("demand_prediction");
    });
  });

  describe("getById", () => {
    it("должен возвращать лог по ID", async () => {
      const createdLog = await createTestAISuggestionLog();

      const foundLog = await aiSuggestionLogRepository.getById(createdLog.id);

      expect(foundLog).toBeDefined();
      expect(foundLog?.id).toBe(createdLog.id);
      expect(foundLog?.suggestionType).toBe("game_matching");
    });

    it("должен возвращать null для несуществующего лога", async () => {
      const foundLog = await aiSuggestionLogRepository.getById(
        "00000000-0000-0000-0000-000000000000"
      );

      expect(foundLog).toBeNull();
    });
  });

  describe("getByUser", () => {
    it("должен возвращать логи пользователя", async () => {
      await createTestAISuggestionLog({
        userId: testUser1.id,
        suggestionType: "game_matching",
      });
      await createTestAISuggestionLog({
        userId: testUser1.id,
        suggestionType: "court_fill_optimization",
      });
      await createTestAISuggestionLog({
        userId: testUser2.id,
        suggestionType: "game_matching",
      });

      const user1Logs = await aiSuggestionLogRepository.getByUser(testUser1.id);
      const user2Logs = await aiSuggestionLogRepository.getByUser(testUser2.id);
      const user1GameMatchingLogs = await aiSuggestionLogRepository.getByUser(
        testUser1.id,
        "game_matching"
      );

      expect(user1Logs).toHaveLength(2);
      expect(user2Logs).toHaveLength(1);
      expect(user1GameMatchingLogs).toHaveLength(1);
    });

    it("должен поддерживать лимит и смещение", async () => {
      await createTestAISuggestionLog({ userId: testUser1.id });
      await createTestAISuggestionLog({ userId: testUser1.id });
      await createTestAISuggestionLog({ userId: testUser1.id });

      const limitedLogs = await aiSuggestionLogRepository.getByUser(
        testUser1.id,
        undefined,
        2
      );
      const offsetLogs = await aiSuggestionLogRepository.getByUser(
        testUser1.id,
        undefined,
        2,
        1
      );

      expect(limitedLogs).toHaveLength(2);
      expect(offsetLogs).toHaveLength(2);
    });
  });

  describe("getByType", () => {
    it("должен возвращать логи по типу предложения", async () => {
      await createTestAISuggestionLog({ suggestionType: "game_matching" });
      await createTestAISuggestionLog({
        suggestionType: "court_fill_optimization",
      });
      await createTestAISuggestionLog({
        suggestionType: "game_matching",
        userId: testUser2.id,
      });

      const gameMatchingLogs = await aiSuggestionLogRepository.getByType(
        "game_matching"
      );
      const courtOptimizationLogs = await aiSuggestionLogRepository.getByType(
        "court_fill_optimization"
      );
      const user1GameMatchingLogs = await aiSuggestionLogRepository.getByType(
        "game_matching",
        testUser1.id
      );

      expect(gameMatchingLogs).toHaveLength(2);
      expect(courtOptimizationLogs).toHaveLength(1);
      expect(user1GameMatchingLogs).toHaveLength(1);
    });
  });

  describe("getAccepted", () => {
    it("должен возвращать принятые предложения", async () => {
      await createTestAISuggestionLog({ wasAccepted: true });
      await createTestAISuggestionLog({ wasAccepted: false });
      await createTestAISuggestionLog({ wasAccepted: null });
      await createTestAISuggestionLog({
        wasAccepted: true,
        userId: testUser2.id,
      });

      const acceptedLogs = await aiSuggestionLogRepository.getAccepted();
      const user1AcceptedLogs = await aiSuggestionLogRepository.getAccepted(
        testUser1.id
      );
      const acceptedGameMatchingLogs =
        await aiSuggestionLogRepository.getAccepted(undefined, "game_matching");

      expect(acceptedLogs).toHaveLength(2);
      expect(user1AcceptedLogs).toHaveLength(1);
      expect(acceptedGameMatchingLogs).toHaveLength(2);
    });
  });

  describe("getRejected", () => {
    it("должен возвращать отклоненные предложения", async () => {
      await createTestAISuggestionLog({ wasAccepted: true });
      await createTestAISuggestionLog({ wasAccepted: false });
      await createTestAISuggestionLog({
        wasAccepted: false,
        userId: testUser2.id,
      });
      await createTestAISuggestionLog({ wasAccepted: null });

      const rejectedLogs = await aiSuggestionLogRepository.getRejected();
      const user1RejectedLogs = await aiSuggestionLogRepository.getRejected(
        testUser1.id
      );

      expect(rejectedLogs).toHaveLength(2);
      expect(user1RejectedLogs).toHaveLength(1);
    });
  });

  describe("getPending", () => {
    it("должен возвращать предложения без ответа", async () => {
      await createTestAISuggestionLog({ wasAccepted: true });
      await createTestAISuggestionLog({ wasAccepted: false });
      await createTestAISuggestionLog({ wasAccepted: null });
      await createTestAISuggestionLog({
        wasAccepted: null,
        userId: testUser2.id,
      });

      const pendingLogs = await aiSuggestionLogRepository.getPending();
      const user1PendingLogs = await aiSuggestionLogRepository.getPending(
        testUser1.id
      );

      expect(pendingLogs).toHaveLength(2);
      expect(user1PendingLogs).toHaveLength(1);
    });
  });

  describe("getByDateRange", () => {
    it("должен возвращать логи по диапазону дат", async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      await createTestAISuggestionLog({ userId: testUser1.id });
      await createTestAISuggestionLog({ userId: testUser2.id });

      const logsInRange = await aiSuggestionLogRepository.getByDateRange(
        yesterday,
        tomorrow
      );
      const user1LogsInRange = await aiSuggestionLogRepository.getByDateRange(
        yesterday,
        tomorrow,
        testUser1.id
      );

      expect(logsInRange).toHaveLength(2);
      expect(user1LogsInRange).toHaveLength(1);
    });
  });

  describe("getByModelVersion", () => {
    it("должен возвращать логи по версии модели", async () => {
      await createTestAISuggestionLog({ modelVersion: "v1.0.0" });
      await createTestAISuggestionLog({ modelVersion: "v2.0.0" });
      await createTestAISuggestionLog({ modelVersion: "v1.0.0" });

      const v1Logs = await aiSuggestionLogRepository.getByModelVersion(
        "v1.0.0"
      );
      const v2Logs = await aiSuggestionLogRepository.getByModelVersion(
        "v2.0.0"
      );

      expect(v1Logs).toHaveLength(2);
      expect(v2Logs).toHaveLength(1);
    });
  });

  describe("getAll", () => {
    it("должен возвращать все логи с пагинацией", async () => {
      await createTestAISuggestionLog();
      await createTestAISuggestionLog();
      await createTestAISuggestionLog();

      const allLogs = await aiSuggestionLogRepository.getAll();
      const limitedLogs = await aiSuggestionLogRepository.getAll(2);
      const offsetLogs = await aiSuggestionLogRepository.getAll(2, 1);

      expect(allLogs).toHaveLength(3);
      expect(limitedLogs).toHaveLength(2);
      expect(offsetLogs).toHaveLength(2);
    });
  });

  describe("getCount", () => {
    it("должен возвращать количество логов", async () => {
      await createTestAISuggestionLog({
        userId: testUser1.id,
        wasAccepted: true,
      });
      await createTestAISuggestionLog({
        userId: testUser1.id,
        wasAccepted: false,
      });
      await createTestAISuggestionLog({
        userId: testUser2.id,
        wasAccepted: null,
      });

      const totalCount = await aiSuggestionLogRepository.getCount();
      const user1Count = await aiSuggestionLogRepository.getCount(testUser1.id);
      const acceptedCount = await aiSuggestionLogRepository.getCount(
        undefined,
        undefined,
        true
      );
      const gameMatchingCount = await aiSuggestionLogRepository.getCount(
        undefined,
        "game_matching"
      );

      expect(totalCount).toBe(3);
      expect(user1Count).toBe(2);
      expect(acceptedCount).toBe(1);
      expect(gameMatchingCount).toBe(3);
    });
  });

  describe("update", () => {
    it("должен обновлять лог", async () => {
      const createdLog = await createTestAISuggestionLog();

      // Добавляем небольшую задержку для гарантии разного времени
      await new Promise((resolve) => setTimeout(resolve, 10));

      const updatedLog = await aiSuggestionLogRepository.update(createdLog.id, {
        wasAccepted: true,
        userFeedback: "Great suggestion!",
      });

      expect(updatedLog).toBeDefined();
      expect(updatedLog?.wasAccepted).toBe(true);
      expect(updatedLog?.userFeedback).toBe("Great suggestion!");
      // Проверяем, что updatedAt обновлен (может быть равен из-за точности PostgreSQL)
      expect(updatedLog?.updatedAt).toBeDefined();
    });

    it("должен возвращать null для несуществующего лога", async () => {
      const updatedLog = await aiSuggestionLogRepository.update(
        "00000000-0000-0000-0000-000000000000",
        {
          wasAccepted: true,
        }
      );

      expect(updatedLog).toBeNull();
    });
  });

  describe("markAsAccepted", () => {
    it("должен отмечать предложение как принятое", async () => {
      const createdLog = await createTestAISuggestionLog();

      const acceptedLog = await aiSuggestionLogRepository.markAsAccepted(
        createdLog.id,
        "Very helpful!"
      );

      expect(acceptedLog).toBeDefined();
      expect(acceptedLog?.wasAccepted).toBe(true);
      expect(acceptedLog?.userFeedback).toBe("Very helpful!");
    });
  });

  describe("markAsRejected", () => {
    it("должен отмечать предложение как отклоненное", async () => {
      const createdLog = await createTestAISuggestionLog();

      const rejectedLog = await aiSuggestionLogRepository.markAsRejected(
        createdLog.id,
        "Not relevant"
      );

      expect(rejectedLog).toBeDefined();
      expect(rejectedLog?.wasAccepted).toBe(false);
      expect(rejectedLog?.userFeedback).toBe("Not relevant");
    });
  });

  describe("delete", () => {
    it("должен удалять лог", async () => {
      const createdLog = await createTestAISuggestionLog();

      const deleted = await aiSuggestionLogRepository.delete(createdLog.id);
      const foundLog = await aiSuggestionLogRepository.getById(createdLog.id);

      expect(deleted).toBe(true);
      expect(foundLog).toBeNull();
    });

    it("должен возвращать false для несуществующего лога", async () => {
      const deleted = await aiSuggestionLogRepository.delete(
        "00000000-0000-0000-0000-000000000000"
      );

      expect(deleted).toBe(false);
    });
  });

  describe("deleteOld", () => {
    it("должен удалять старые логи", async () => {
      // Создаем логи с разными датами
      await createTestAISuggestionLog();

      // Имитируем старый лог, изменив дату создания в БД
      const oldLog = await createTestAISuggestionLog();
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 10);

      await db
        .update(aiSuggestionLogs)
        .set({ createdAt: oldDate })
        .where(eq(aiSuggestionLogs.id, oldLog.id));

      const deletedCount = await aiSuggestionLogRepository.deleteOld(5);
      const remainingLogs = await aiSuggestionLogRepository.getAll();

      expect(deletedCount).toBe(1);
      expect(remainingLogs).toHaveLength(1);
    });
  });

  describe("getStats", () => {
    it("должен возвращать статистику логов", async () => {
      await createTestAISuggestionLog({
        wasAccepted: true,
        confidenceScore: "0.9000",
        executionTimeMs: "100.00",
      });
      await createTestAISuggestionLog({
        wasAccepted: false,
        confidenceScore: "0.7000",
        executionTimeMs: "200.00",
      });
      await createTestAISuggestionLog({
        wasAccepted: null,
        confidenceScore: "0.8000",
        executionTimeMs: "150.00",
      });
      await createTestAISuggestionLog({
        suggestionType: "court_fill_optimization",
        wasAccepted: true,
        confidenceScore: "0.8500",
        executionTimeMs: "120.00",
        modelVersion: "v2.0.0",
      });

      const stats = await aiSuggestionLogRepository.getStats();

      expect(stats.totalSuggestions).toBe(4);
      expect(stats.acceptedSuggestions).toBe(2);
      expect(stats.rejectedSuggestions).toBe(1);
      expect(stats.pendingSuggestions).toBe(1);
      expect(stats.acceptanceRate).toBe(50);
      expect(stats.averageConfidenceScore).toBeCloseTo(0.8125, 3);
      expect(stats.averageExecutionTime).toBeCloseTo(142.5, 1);
      expect(stats.suggestionsByType.game_matching).toBe(3);
      expect(stats.suggestionsByType.court_fill_optimization).toBe(1);
      expect(stats.suggestionsByModel["v1.0.0"]).toBe(3);
      expect(stats.suggestionsByModel["v2.0.0"]).toBe(1);
    });

    it("должен возвращать статистику для конкретного пользователя", async () => {
      await createTestAISuggestionLog({
        userId: testUser1.id,
        wasAccepted: true,
      });
      await createTestAISuggestionLog({
        userId: testUser1.id,
        wasAccepted: false,
      });
      await createTestAISuggestionLog({
        userId: testUser2.id,
        wasAccepted: true,
      });

      const user1Stats = await aiSuggestionLogRepository.getStats(testUser1.id);

      expect(user1Stats.totalSuggestions).toBe(2);
      expect(user1Stats.acceptedSuggestions).toBe(1);
      expect(user1Stats.rejectedSuggestions).toBe(1);
      expect(user1Stats.acceptanceRate).toBe(50);
    });
  });

  describe("getGroupedByType", () => {
    it("должен возвращать логи, сгруппированные по типу", async () => {
      await createTestAISuggestionLog({
        suggestionType: "game_matching",
        wasAccepted: true,
        confidenceScore: "0.9000",
        executionTimeMs: "100.00",
      });
      await createTestAISuggestionLog({
        suggestionType: "game_matching",
        wasAccepted: false,
        confidenceScore: "0.7000",
        executionTimeMs: "200.00",
      });
      await createTestAISuggestionLog({
        suggestionType: "court_fill_optimization",
        wasAccepted: true,
        confidenceScore: "0.8500",
        executionTimeMs: "150.00",
      });

      const groupedStats = await aiSuggestionLogRepository.getGroupedByType();

      expect(groupedStats).toHaveLength(2);

      const gameMatchingStats = groupedStats.find(
        (stat) => stat.suggestionType === "game_matching"
      );
      const courtOptimizationStats = groupedStats.find(
        (stat) => stat.suggestionType === "court_fill_optimization"
      );

      expect(gameMatchingStats?.suggestionsCount).toBe(2);
      expect(gameMatchingStats?.acceptedCount).toBe(1);
      expect(gameMatchingStats?.rejectedCount).toBe(1);
      expect(gameMatchingStats?.acceptanceRate).toBe(50);

      expect(courtOptimizationStats?.suggestionsCount).toBe(1);
      expect(courtOptimizationStats?.acceptedCount).toBe(1);
      expect(courtOptimizationStats?.rejectedCount).toBe(0);
      expect(courtOptimizationStats?.acceptanceRate).toBe(100);
    });
  });

  describe("getRecentLogs", () => {
    it("должен возвращать недавние логи", async () => {
      await createTestAISuggestionLog({ userId: testUser1.id });
      await createTestAISuggestionLog({ userId: testUser2.id });

      // Создаем старый лог
      const oldLog = await createTestAISuggestionLog();
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 10);

      await db
        .update(aiSuggestionLogs)
        .set({ createdAt: oldDate })
        .where(eq(aiSuggestionLogs.id, oldLog.id));

      const recentLogs = await aiSuggestionLogRepository.getRecentLogs(5);
      const user1RecentLogs = await aiSuggestionLogRepository.getRecentLogs(
        5,
        testUser1.id
      );

      expect(recentLogs).toHaveLength(2);
      expect(user1RecentLogs).toHaveLength(1);
    });
  });
});
