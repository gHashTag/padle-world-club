import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../../../db/schema";
import {
  feedbacks,
  users,
  venues,
  NewFeedback,
  NewUser,
  NewVenue,
} from "../../../db/schema";
import { FeedbackRepository } from "../../../repositories/feedback-repository";
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
const feedbackRepository = new FeedbackRepository(db);

describe("FeedbackRepository", () => {
  let testUser1: schema.User;
  let testUser2: schema.User;
  let testVenue: schema.Venue;

  // Функция для очистки таблиц перед/после тестов
  const cleanupDatabase = async () => {
    await db.delete(feedbacks);
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

  // Вспомогательная функция для создания тестового отзыва
  const createTestFeedback = async (customData: Partial<NewFeedback> = {}): Promise<schema.Feedback> => {
    const defaultFeedbackData: NewFeedback = {
      userId: testUser1.id,
      venueId: testVenue.id,
      category: "court_quality",
      rating: 4,
      comment: "Great court quality!",
      status: "new",
      ...customData,
    };

    return await feedbackRepository.create(defaultFeedbackData);
  };

  describe("create", () => {
    it("должен создавать отзыв", async () => {
      const feedbackData: NewFeedback = {
        userId: testUser1.id,
        venueId: testVenue.id,
        category: "staff_service",
        rating: 5,
        comment: "Excellent staff service",
        status: "new",
      };

      const createdFeedback = await feedbackRepository.create(feedbackData);

      expect(createdFeedback).toBeDefined();
      expect(createdFeedback.id).toBeDefined();
      expect(createdFeedback.userId).toBe(testUser1.id);
      expect(createdFeedback.venueId).toBe(testVenue.id);
      expect(createdFeedback.category).toBe("staff_service");
      expect(createdFeedback.rating).toBe(5);
      expect(createdFeedback.comment).toBe("Excellent staff service");
      expect(createdFeedback.status).toBe("new");
    });
  });

  describe("getById", () => {
    it("должен возвращать отзыв по ID", async () => {
      const createdFeedback = await createTestFeedback();

      const foundFeedback = await feedbackRepository.getById(createdFeedback.id);

      expect(foundFeedback).toBeDefined();
      expect(foundFeedback?.id).toBe(createdFeedback.id);
      expect(foundFeedback?.comment).toBe("Great court quality!");
    });

    it("должен возвращать null для несуществующего отзыва", async () => {
      const foundFeedback = await feedbackRepository.getById("00000000-0000-0000-0000-000000000000");

      expect(foundFeedback).toBeNull();
    });
  });

  describe("getByUser", () => {
    it("должен возвращать отзывы пользователя", async () => {
      await createTestFeedback({ userId: testUser1.id });
      await createTestFeedback({ userId: testUser1.id, category: "game_experience" });
      await createTestFeedback({ userId: testUser2.id });

      const user1Feedbacks = await feedbackRepository.getByUser(testUser1.id);
      const user2Feedbacks = await feedbackRepository.getByUser(testUser2.id);
      const user1CourtFeedbacks = await feedbackRepository.getByUser(testUser1.id, "court_quality");

      expect(user1Feedbacks).toHaveLength(2);
      expect(user2Feedbacks).toHaveLength(1);
      expect(user1CourtFeedbacks).toHaveLength(1);
    });

    it("должен поддерживать лимит и смещение", async () => {
      await createTestFeedback({ userId: testUser1.id });
      await createTestFeedback({ userId: testUser1.id });
      await createTestFeedback({ userId: testUser1.id });

      const limitedFeedbacks = await feedbackRepository.getByUser(testUser1.id, undefined, 2);
      const offsetFeedbacks = await feedbackRepository.getByUser(testUser1.id, undefined, 2, 1);

      expect(limitedFeedbacks).toHaveLength(2);
      expect(offsetFeedbacks).toHaveLength(2);
    });
  });

  describe("getByVenue", () => {
    it("должен возвращать отзывы по площадке", async () => {
      await createTestFeedback({ venueId: testVenue.id });
      await createTestFeedback({ venueId: testVenue.id, category: "game_experience" });

      const venueFeedbacks = await feedbackRepository.getByVenue(testVenue.id);
      const venueCourtFeedbacks = await feedbackRepository.getByVenue(testVenue.id, "court_quality");

      expect(venueFeedbacks).toHaveLength(2);
      expect(venueCourtFeedbacks).toHaveLength(1);
    });
  });

  describe("getByCategory", () => {
    it("должен возвращать отзывы по категории", async () => {
      await createTestFeedback({ category: "court_quality" });
      await createTestFeedback({ category: "staff_service" });
      await createTestFeedback({ category: "court_quality", venueId: testVenue.id });

      const courtFeedbacks = await feedbackRepository.getByCategory("court_quality");
      const staffFeedbacks = await feedbackRepository.getByCategory("staff_service");
      const venueCourtFeedbacks = await feedbackRepository.getByCategory("court_quality", testVenue.id);

      expect(courtFeedbacks).toHaveLength(2);
      expect(staffFeedbacks).toHaveLength(1);
      expect(venueCourtFeedbacks).toHaveLength(2);
    });
  });

  describe("getByStatus", () => {
    it("должен возвращать отзывы по статусу", async () => {
      await createTestFeedback({ status: "new" });
      await createTestFeedback({ status: "resolved" });
      await createTestFeedback({ status: "new", venueId: testVenue.id });

      const newFeedbacks = await feedbackRepository.getByStatus("new");
      const resolvedFeedbacks = await feedbackRepository.getByStatus("resolved");
      const venueNewFeedbacks = await feedbackRepository.getByStatus("new", testVenue.id);

      expect(newFeedbacks).toHaveLength(2);
      expect(resolvedFeedbacks).toHaveLength(1);
      expect(venueNewFeedbacks).toHaveLength(2);
    });
  });

  describe("getByRating", () => {
    it("должен возвращать отзывы по рейтингу", async () => {
      await createTestFeedback({ rating: 5 });
      await createTestFeedback({ rating: 3 });
      await createTestFeedback({ rating: 5, venueId: testVenue.id });

      const rating5Feedbacks = await feedbackRepository.getByRating(5);
      const rating3Feedbacks = await feedbackRepository.getByRating(3);
      const venueRating5Feedbacks = await feedbackRepository.getByRating(5, testVenue.id);

      expect(rating5Feedbacks).toHaveLength(2);
      expect(rating3Feedbacks).toHaveLength(1);
      expect(venueRating5Feedbacks).toHaveLength(2);
    });
  });

  describe("getByRatingRange", () => {
    it("должен возвращать отзывы по диапазону рейтингов", async () => {
      await createTestFeedback({ rating: 2 });
      await createTestFeedback({ rating: 4 });
      await createTestFeedback({ rating: 5 });

      const midRangeFeedbacks = await feedbackRepository.getByRatingRange(3, 5);
      const venueMidRangeFeedbacks = await feedbackRepository.getByRatingRange(3, 5, testVenue.id);

      expect(midRangeFeedbacks).toHaveLength(2);
      expect(venueMidRangeFeedbacks).toHaveLength(2);
    });
  });

  describe("getUnresolved", () => {
    it("должен возвращать нерешенные отзывы", async () => {
      await createTestFeedback({ status: "new" });
      await createTestFeedback({ status: "in_review" });
      await createTestFeedback({ status: "resolved" }); // не должен попасть

      const unresolvedFeedbacks = await feedbackRepository.getUnresolved();
      const venueUnresolvedFeedbacks = await feedbackRepository.getUnresolved(testVenue.id);

      expect(unresolvedFeedbacks).toHaveLength(2);
      expect(venueUnresolvedFeedbacks).toHaveLength(2);
    });
  });

  describe("searchByComment", () => {
    it("должен искать отзывы по комментарию", async () => {
      await createTestFeedback({ comment: "Great court quality!" });
      await createTestFeedback({ comment: "Poor service experience" });
      await createTestFeedback({ comment: "Amazing court conditions", venueId: testVenue.id });

      const courtComments = await feedbackRepository.searchByComment("court");
      const serviceComments = await feedbackRepository.searchByComment("service");
      const venueCourtComments = await feedbackRepository.searchByComment("court", testVenue.id);

      expect(courtComments).toHaveLength(2);
      expect(serviceComments).toHaveLength(1);
      expect(venueCourtComments).toHaveLength(2);
    });
  });

  describe("getByDateRange", () => {
    it("должен возвращать отзывы по диапазону дат", async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      await createTestFeedback();
      await createTestFeedback({ venueId: testVenue.id });

      const feedbacksInRange = await feedbackRepository.getByDateRange(yesterday, tomorrow);
      const venueFeedbacksInRange = await feedbackRepository.getByDateRange(yesterday, tomorrow, testVenue.id);

      expect(feedbacksInRange).toHaveLength(2);
      expect(venueFeedbacksInRange).toHaveLength(2);
    });
  });

  describe("getAll", () => {
    it("должен возвращать все отзывы", async () => {
      await createTestFeedback();
      await createTestFeedback({ userId: testUser2.id });

      const allFeedbacks = await feedbackRepository.getAll();

      expect(allFeedbacks).toHaveLength(2);
    });

    it("должен поддерживать лимит и смещение", async () => {
      await createTestFeedback();
      await createTestFeedback();
      await createTestFeedback();

      const limitedFeedbacks = await feedbackRepository.getAll(2);
      const offsetFeedbacks = await feedbackRepository.getAll(2, 1);

      expect(limitedFeedbacks).toHaveLength(2);
      expect(offsetFeedbacks).toHaveLength(2);
    });
  });

  describe("getCount", () => {
    it("должен возвращать количество отзывов", async () => {
      await createTestFeedback({ venueId: testVenue.id });
      await createTestFeedback({ venueId: testVenue.id, status: "resolved" });

      const totalCount = await feedbackRepository.getCount();
      const venueCount = await feedbackRepository.getCount(testVenue.id);
      const resolvedCount = await feedbackRepository.getCount(undefined, "resolved");

      expect(totalCount).toBe(2);
      expect(venueCount).toBe(2);
      expect(resolvedCount).toBe(1);
    });
  });

  describe("update", () => {
    it("должен обновлять отзыв", async () => {
      const createdFeedback = await createTestFeedback();

      const updatedFeedback = await feedbackRepository.update(createdFeedback.id, {
        comment: "Updated comment",
        rating: 5,
        status: "in_review",
      });

      expect(updatedFeedback).toBeDefined();
      expect(updatedFeedback?.id).toBe(createdFeedback.id);
      expect(updatedFeedback?.comment).toBe("Updated comment");
      expect(updatedFeedback?.rating).toBe(5);
      expect(updatedFeedback?.status).toBe("in_review");
      expect(updatedFeedback?.updatedAt).not.toBe(createdFeedback.updatedAt);
    });

    it("должен возвращать null при обновлении несуществующего отзыва", async () => {
      const updatedFeedback = await feedbackRepository.update("00000000-0000-0000-0000-000000000000", {
        comment: "Updated comment",
      });

      expect(updatedFeedback).toBeNull();
    });
  });

  describe("updateStatus", () => {
    it("должен обновлять статус отзыва", async () => {
      const createdFeedback = await createTestFeedback({ status: "new" });

      const updatedFeedback = await feedbackRepository.updateStatus(createdFeedback.id, "resolved", testUser2.id);

      expect(updatedFeedback).toBeDefined();
      expect(updatedFeedback?.status).toBe("resolved");
      expect(updatedFeedback?.resolvedByUserId).toBe(testUser2.id);
    });

    it("должен обновлять статус без указания решившего пользователя", async () => {
      const createdFeedback = await createTestFeedback({ status: "new" });

      const updatedFeedback = await feedbackRepository.updateStatus(createdFeedback.id, "in_review");

      expect(updatedFeedback).toBeDefined();
      expect(updatedFeedback?.status).toBe("in_review");
      expect(updatedFeedback?.resolvedByUserId).toBeNull();
    });
  });

  describe("resolve", () => {
    it("должен решать отзыв", async () => {
      const createdFeedback = await createTestFeedback({ status: "in_review" });

      const updatedFeedback = await feedbackRepository.resolve(createdFeedback.id, testUser2.id);

      expect(updatedFeedback).toBeDefined();
      expect(updatedFeedback?.status).toBe("resolved");
      expect(updatedFeedback?.resolvedByUserId).toBe(testUser2.id);
    });
  });

  describe("takeInReview", () => {
    it("должен брать отзыв в работу", async () => {
      const createdFeedback = await createTestFeedback({ status: "new" });

      const updatedFeedback = await feedbackRepository.takeInReview(createdFeedback.id);

      expect(updatedFeedback).toBeDefined();
      expect(updatedFeedback?.status).toBe("in_review");
    });
  });

  describe("archive", () => {
    it("должен архивировать отзыв", async () => {
      const createdFeedback = await createTestFeedback({ status: "resolved" });

      const updatedFeedback = await feedbackRepository.archive(createdFeedback.id, testUser2.id);

      expect(updatedFeedback).toBeDefined();
      expect(updatedFeedback?.status).toBe("archived");
      expect(updatedFeedback?.resolvedByUserId).toBe(testUser2.id);
    });
  });

  describe("delete", () => {
    it("должен удалять отзыв", async () => {
      const createdFeedback = await createTestFeedback();

      const deleted = await feedbackRepository.delete(createdFeedback.id);
      const foundFeedback = await feedbackRepository.getById(createdFeedback.id);

      expect(deleted).toBe(true);
      expect(foundFeedback).toBeNull();
    });

    it("должен возвращать false при удалении несуществующего отзыва", async () => {
      const deleted = await feedbackRepository.delete("00000000-0000-0000-0000-000000000000");

      expect(deleted).toBe(false);
    });
  });

  describe("getStats", () => {
    it("должен возвращать статистику отзывов", async () => {
      await createTestFeedback({ status: "new", rating: 5, category: "court_quality" });
      await createTestFeedback({ status: "resolved", rating: 4, category: "staff_service" });
      await createTestFeedback({ status: "in_review", rating: 3, category: "court_quality" });
      await createTestFeedback({ status: "archived", rating: 2, category: "game_experience", venueId: testVenue.id });

      const allStats = await feedbackRepository.getStats();
      const venueStats = await feedbackRepository.getStats(testVenue.id);

      expect(allStats.totalFeedbacks).toBe(4);
      expect(allStats.newFeedbacks).toBe(1);
      expect(allStats.resolvedFeedbacks).toBe(1);
      expect(allStats.inReviewFeedbacks).toBe(1);
      expect(allStats.archivedFeedbacks).toBe(1);
      expect(allStats.feedbacksByCategory.court_quality).toBe(2);
      expect(allStats.feedbacksByCategory.staff_service).toBe(1);
      expect(allStats.feedbacksByCategory.game_experience).toBe(1);
      expect(allStats.feedbacksByRating[5]).toBe(1);
      expect(allStats.feedbacksByRating[4]).toBe(1);
      expect(allStats.feedbacksByRating[3]).toBe(1);
      expect(allStats.feedbacksByRating[2]).toBe(1);
      expect(allStats.averageRating).toBeGreaterThan(0);

      expect(venueStats.totalFeedbacks).toBe(4);
    });
  });

  describe("getGroupedByCategory", () => {
    it("должен возвращать отзывы, сгруппированные по категории", async () => {
      await createTestFeedback({ category: "court_quality", rating: 5, status: "resolved" });
      await createTestFeedback({ category: "court_quality", rating: 4, status: "new" });
      await createTestFeedback({ category: "staff_service", rating: 3, status: "resolved" });

      const grouped = await feedbackRepository.getGroupedByCategory();
      const venueGrouped = await feedbackRepository.getGroupedByCategory(testVenue.id);

      expect(grouped).toHaveLength(2);
      const courtGroup = grouped.find(g => g.category === "court_quality");
      expect(courtGroup?.feedbacksCount).toBe(2);
      expect(courtGroup?.resolvedCount).toBe(1);
      expect(courtGroup?.newCount).toBe(1);

      expect(venueGrouped.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe("getRecentFeedbacks", () => {
    it("должен возвращать недавние отзывы", async () => {
      await createTestFeedback();
      await createTestFeedback({ venueId: testVenue.id });

      const recentFeedbacks = await feedbackRepository.getRecentFeedbacks(30);
      const venueRecentFeedbacks = await feedbackRepository.getRecentFeedbacks(30, testVenue.id);

      expect(recentFeedbacks).toHaveLength(2);
      expect(venueRecentFeedbacks).toHaveLength(2);
    });
  });
});
