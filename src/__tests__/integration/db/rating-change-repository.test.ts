import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../../../db/schema";
import {
  ratingChanges,
  users,
  venues,
  courts,
  gameSessions,
  NewRatingChange,
  NewUser,
  NewVenue,
  NewCourt,
  NewGameSession,
} from "../../../db/schema";
import { RatingChangeRepository } from "../../../repositories/rating-change-repository";
import dotenv from "dotenv";

// Загружаем переменные окружения из файла .env
dotenv.config();

// Используем тестовую базу данных
const DATABASE_URL_TEST =
  process.env.DATABASE_URL_TEST || process.env.DATABASE_URL;

console.log("DATABASE_URL_TEST:", DATABASE_URL_TEST);

if (!DATABASE_URL_TEST) {
  throw new Error(
    "DATABASE_URL_TEST или DATABASE_URL для тестов не установлена в переменных окружения"
  );
}

const pool = new Pool({
  connectionString: DATABASE_URL_TEST,
});

const db = drizzle(pool, { schema });
const ratingChangeRepository = new RatingChangeRepository(db);

describe("RatingChangeRepository", () => {
  let testVenue: schema.Venue;
  let testUser1: schema.User;
  let testUser2: schema.User;
  let testCourt: schema.Court;
  let testGameSession: schema.GameSession;

  // Функция для очистки таблиц перед/после тестов
  const cleanupDatabase = async () => {
    await db.delete(ratingChanges);
    await db.delete(gameSessions);
    await db.delete(courts);
    await db.delete(users);
    await db.delete(venues);
  };

  beforeEach(async () => {
    await cleanupDatabase();

    // Создаем тестовые данные
    const venueData: NewVenue = {
      name: "Test Venue",
      address: "123 Test St",
      city: "Test City",
      country: "Test Country",
      isActive: true,
    };
    [testVenue] = await db.insert(venues).values(venueData).returning();

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
      userRole: "player",
      homeVenueId: testVenue.id,
      currentRating: 1600,
    };
    [testUser2] = await db.insert(users).values(userData2).returning();

    const courtData: NewCourt = {
      venueId: testVenue.id,
      name: "Test Court 1",
      courtType: "paddle",
      hourlyRate: "50.00",
      isActive: true,
    };
    [testCourt] = await db.insert(courts).values(courtData).returning();

    const startTime = new Date();
    startTime.setHours(startTime.getHours() + 1);
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + 1);

    const gameSessionData: NewGameSession = {
      venueId: testVenue.id,
      courtId: testCourt.id,
      startTime,
      endTime,
      gameType: "public_match",
      neededSkillLevel: "intermediate",
      maxPlayers: 4,
      currentPlayers: 0,
      status: "open_for_players",
      createdByUserId: testUser1.id,
    };
    [testGameSession] = await db.insert(gameSessions).values(gameSessionData).returning();
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  // Вспомогательная функция для создания тестового изменения рейтинга
  const createTestRatingChange = async (customData: Partial<NewRatingChange> = {}): Promise<schema.RatingChange> => {
    const defaultRatingChangeData: NewRatingChange = {
      userId: testUser1.id,
      oldRating: 1500,
      newRating: 1520,
      changeReason: "game_session",
      relatedGameSessionId: testGameSession.id,
      notes: "Test rating change",
      ...customData,
    };

    return await ratingChangeRepository.create(defaultRatingChangeData);
  };

  describe("create", () => {
    it("должен создавать изменение рейтинга", async () => {
      const ratingChangeData: NewRatingChange = {
        userId: testUser1.id,
        oldRating: 1500,
        newRating: 1520,
        changeReason: "game_session",
        relatedGameSessionId: testGameSession.id,
        notes: "Won a game",
      };

      const ratingChange = await ratingChangeRepository.create(ratingChangeData);

      expect(ratingChange).toBeDefined();
      expect(ratingChange.id).toBeDefined();
      expect(ratingChange.userId).toBe(testUser1.id);
      expect(ratingChange.oldRating).toBe(1500);
      expect(ratingChange.newRating).toBe(1520);
      expect(ratingChange.changeReason).toBe("game_session");
      expect(ratingChange.relatedGameSessionId).toBe(testGameSession.id);
      expect(ratingChange.notes).toBe("Won a game");
    });

    it("должен создавать изменение рейтинга с разными причинами", async () => {
      const tournamentChange = await createTestRatingChange({
        changeReason: "tournament_match",
        relatedGameSessionId: null,
        relatedTournamentMatchId: "00000000-0000-0000-0000-000000000001"
      });
      const manualChange = await createTestRatingChange({
        changeReason: "manual_adjustment",
        relatedGameSessionId: null,
        notes: "Manual adjustment by admin"
      });

      expect(tournamentChange.changeReason).toBe("tournament_match");
      expect(manualChange.changeReason).toBe("manual_adjustment");
    });
  });

  describe("getById", () => {
    it("должен возвращать изменение рейтинга по ID", async () => {
      const createdChange = await createTestRatingChange();

      const ratingChange = await ratingChangeRepository.getById(createdChange.id);

      expect(ratingChange).toBeDefined();
      expect(ratingChange?.id).toBe(createdChange.id);
      expect(ratingChange?.userId).toBe(createdChange.userId);
    });

    it("должен возвращать null, если изменение рейтинга не найдено", async () => {
      const ratingChange = await ratingChangeRepository.getById("00000000-0000-0000-0000-000000000000");

      expect(ratingChange).toBeNull();
    });
  });

  describe("getByUser", () => {
    it("должен возвращать все изменения рейтинга пользователя", async () => {
      await createTestRatingChange({ userId: testUser1.id, changeReason: "game_session" });
      await createTestRatingChange({ userId: testUser1.id, changeReason: "manual_adjustment" });
      await createTestRatingChange({ userId: testUser2.id, changeReason: "game_session" });

      const user1Changes = await ratingChangeRepository.getByUser(testUser1.id);
      const user1GameChanges = await ratingChangeRepository.getByUser(testUser1.id, "game_session");

      expect(user1Changes).toHaveLength(2);
      expect(user1Changes.every(c => c.userId === testUser1.id)).toBe(true);

      expect(user1GameChanges).toHaveLength(1);
      expect(user1GameChanges[0].changeReason).toBe("game_session");
    });
  });

  describe("getByReason", () => {
    it("должен возвращать изменения рейтинга по причине", async () => {
      await createTestRatingChange({ changeReason: "game_session" });
      await createTestRatingChange({ changeReason: "tournament_match" });
      await createTestRatingChange({ changeReason: "manual_adjustment" });

      const gameChanges = await ratingChangeRepository.getByReason("game_session");
      const tournamentChanges = await ratingChangeRepository.getByReason("tournament_match");
      const manualChanges = await ratingChangeRepository.getByReason("manual_adjustment");

      expect(gameChanges).toHaveLength(1);
      expect(gameChanges[0].changeReason).toBe("game_session");

      expect(tournamentChanges).toHaveLength(1);
      expect(tournamentChanges[0].changeReason).toBe("tournament_match");

      expect(manualChanges).toHaveLength(1);
      expect(manualChanges[0].changeReason).toBe("manual_adjustment");
    });
  });

  describe("getByGameSession", () => {
    it("должен возвращать изменения рейтинга по игровой сессии", async () => {
      // Создаем вторую игровую сессию
      const anotherGameSession = await db.insert(gameSessions).values({
        venueId: testVenue.id,
        courtId: testCourt.id,
        startTime: new Date(),
        endTime: new Date(),
        gameType: "private_match",
        neededSkillLevel: "advanced",
        maxPlayers: 4,
        currentPlayers: 0,
        status: "open_for_players",
        createdByUserId: testUser1.id,
      }).returning();

      await createTestRatingChange({ relatedGameSessionId: testGameSession.id });
      await createTestRatingChange({ relatedGameSessionId: anotherGameSession[0].id });

      const session1Changes = await ratingChangeRepository.getByGameSession(testGameSession.id);
      const session2Changes = await ratingChangeRepository.getByGameSession(anotherGameSession[0].id);

      expect(session1Changes).toHaveLength(1);
      expect(session1Changes[0].relatedGameSessionId).toBe(testGameSession.id);

      expect(session2Changes).toHaveLength(1);
      expect(session2Changes[0].relatedGameSessionId).toBe(anotherGameSession[0].id);
    });
  });

  describe("getByTournamentMatch", () => {
    it("должен возвращать изменения рейтинга по турнирному матчу", async () => {
      const tournamentMatchId = "00000000-0000-0000-0000-000000000001";
      const anotherTournamentMatchId = "00000000-0000-0000-0000-000000000002";

      await createTestRatingChange({
        changeReason: "tournament_match",
        relatedTournamentMatchId: tournamentMatchId,
        relatedGameSessionId: null
      });
      await createTestRatingChange({
        changeReason: "tournament_match",
        relatedTournamentMatchId: anotherTournamentMatchId,
        relatedGameSessionId: null
      });

      const match1Changes = await ratingChangeRepository.getByTournamentMatch(tournamentMatchId);
      const match2Changes = await ratingChangeRepository.getByTournamentMatch(anotherTournamentMatchId);

      expect(match1Changes).toHaveLength(1);
      expect(match1Changes[0].relatedTournamentMatchId).toBe(tournamentMatchId);

      expect(match2Changes).toHaveLength(1);
      expect(match2Changes[0].relatedTournamentMatchId).toBe(anotherTournamentMatchId);
    });
  });

  describe("getByUsers", () => {
    it("должен возвращать изменения рейтинга по нескольким пользователям", async () => {
      await createTestRatingChange({ userId: testUser1.id });
      await createTestRatingChange({ userId: testUser2.id });

      const changes = await ratingChangeRepository.getByUsers([testUser1.id, testUser2.id]);

      expect(changes).toHaveLength(2);
    });

    it("должен возвращать пустой массив для пустого списка пользователей", async () => {
      const changes = await ratingChangeRepository.getByUsers([]);
      expect(changes).toHaveLength(0);
    });
  });

  describe("getByDateRange", () => {
    it("должен возвращать изменения рейтинга по диапазону дат", async () => {
      const now = new Date();
      const startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // вчера
      const endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // завтра

      await createTestRatingChange();

      const changesInRange = await ratingChangeRepository.getByDateRange(startDate, endDate);

      expect(changesInRange).toHaveLength(1);
    });
  });

  describe("getByRatingChangeRange", () => {
    it("должен возвращать изменения рейтинга по диапазону значений", async () => {
      await createTestRatingChange({ oldRating: 1500, newRating: 1520 }); // +20
      await createTestRatingChange({ oldRating: 1600, newRating: 1580 }); // -20
      await createTestRatingChange({ oldRating: 1400, newRating: 1450 }); // +50

      const smallChanges = await ratingChangeRepository.getByRatingChangeRange(-25, 25);
      const positiveChanges = await ratingChangeRepository.getByRatingChangeRange(0, 100);

      expect(smallChanges).toHaveLength(2); // +20 и -20
      expect(positiveChanges).toHaveLength(2); // +20 и +50
    });
  });

  describe("update", () => {
    it("должен обновлять данные изменения рейтинга", async () => {
      const createdChange = await createTestRatingChange();

      const updatedChange = await ratingChangeRepository.update(createdChange.id, {
        notes: "Updated notes",
        newRating: 1530,
      });

      expect(updatedChange).toBeDefined();
      expect(updatedChange?.id).toBe(createdChange.id);
      expect(updatedChange?.notes).toBe("Updated notes");
      expect(updatedChange?.newRating).toBe(1530);
    });

    it("должен возвращать null при обновлении несуществующего изменения", async () => {
      const updatedChange = await ratingChangeRepository.update("00000000-0000-0000-0000-000000000000", {
        notes: "Updated notes",
      });

      expect(updatedChange).toBeNull();
    });
  });

  describe("delete", () => {
    it("должен удалять изменение рейтинга", async () => {
      const createdChange = await createTestRatingChange();

      const result = await ratingChangeRepository.delete(createdChange.id);

      expect(result).toBe(true);

      const deletedChange = await ratingChangeRepository.getById(createdChange.id);
      expect(deletedChange).toBeNull();
    });

    it("должен возвращать false при удалении несуществующего изменения", async () => {
      const result = await ratingChangeRepository.delete("00000000-0000-0000-0000-000000000000");

      expect(result).toBe(false);
    });
  });

  describe("getCount", () => {
    it("должен возвращать количество изменений рейтинга", async () => {
      await createTestRatingChange({ userId: testUser1.id, changeReason: "game_session" });
      await createTestRatingChange({ userId: testUser1.id, changeReason: "manual_adjustment" });
      await createTestRatingChange({ userId: testUser2.id, changeReason: "game_session" });

      const totalCount = await ratingChangeRepository.getCount();
      const user1Count = await ratingChangeRepository.getCount(testUser1.id);
      const gameSessionCount = await ratingChangeRepository.getCount(undefined, "game_session");

      expect(totalCount).toBe(3);
      expect(user1Count).toBe(2);
      expect(gameSessionCount).toBe(2);
    });
  });

  describe("getAll", () => {
    it("должен возвращать все изменения рейтинга с пагинацией", async () => {
      // Создаем 3 изменения
      await createTestRatingChange({ userId: testUser1.id });
      await createTestRatingChange({ userId: testUser2.id });
      await createTestRatingChange({ userId: testUser1.id, oldRating: 1520, newRating: 1540 });

      const allChanges = await ratingChangeRepository.getAll();
      const limitedChanges = await ratingChangeRepository.getAll(2);
      const offsetChanges = await ratingChangeRepository.getAll(2, 1);

      expect(allChanges).toHaveLength(3);
      expect(limitedChanges).toHaveLength(2);
      expect(offsetChanges).toHaveLength(2);
    });
  });

  describe("getStats", () => {
    it("должен возвращать статистику по изменениям рейтинга", async () => {
      await createTestRatingChange({
        userId: testUser1.id,
        changeReason: "game_session",
        oldRating: 1500,
        newRating: 1520
      });
      await createTestRatingChange({
        userId: testUser1.id,
        changeReason: "tournament_match",
        oldRating: 1520,
        newRating: 1500
      });
      await createTestRatingChange({
        userId: testUser2.id,
        changeReason: "manual_adjustment",
        oldRating: 1600,
        newRating: 1650
      });

      const allStats = await ratingChangeRepository.getStats();
      const user1Stats = await ratingChangeRepository.getStats(testUser1.id);

      expect(allStats.totalChanges).toBe(3);
      expect(allStats.gameSessionChanges).toBe(1);
      expect(allStats.tournamentChanges).toBe(1);
      expect(allStats.manualChanges).toBe(1);
      expect(parseFloat(allStats.averageChange)).toBeCloseTo(16.67, 1); // (20 - 20 + 50) / 3 = 50/3 = 16.67

      expect(user1Stats.totalChanges).toBe(2);
      expect(user1Stats.gameSessionChanges).toBe(1);
      expect(user1Stats.tournamentChanges).toBe(1);
      expect(user1Stats.manualChanges).toBe(0);
      expect(parseFloat(user1Stats.averageChange)).toBe(0); // (20 - 20) / 2
    });
  });

  describe("getLastChange", () => {
    it("должен возвращать последнее изменение рейтинга пользователя", async () => {
      await createTestRatingChange({ userId: testUser1.id, oldRating: 1500, newRating: 1520 });
      // Небольшая задержка для разных временных меток
      await new Promise(resolve => setTimeout(resolve, 10));
      await createTestRatingChange({ userId: testUser1.id, oldRating: 1520, newRating: 1540 });

      const lastChange = await ratingChangeRepository.getLastChange(testUser1.id);

      expect(lastChange).toBeDefined();
      expect(lastChange?.newRating).toBe(1540);
    });

    it("должен возвращать null, если у пользователя нет изменений", async () => {
      const lastChange = await ratingChangeRepository.getLastChange(testUser2.id);

      expect(lastChange).toBeNull();
    });
  });

  describe("getRatingHistory", () => {
    it("должен возвращать историю рейтинга пользователя", async () => {
      // Создаем несколько изменений
      for (let i = 0; i < 5; i++) {
        await createTestRatingChange({
          userId: testUser1.id,
          oldRating: 1500 + i * 10,
          newRating: 1510 + i * 10
        });
        await new Promise(resolve => setTimeout(resolve, 10));
      }

      const history = await ratingChangeRepository.getRatingHistory(testUser1.id, 3);

      expect(history).toHaveLength(3);
      // Проверяем, что возвращаются последние изменения (в порядке убывания по дате)
      expect(history[0].newRating).toBe(1550); // последнее изменение
    });
  });

  describe("getWithUserDetails", () => {
    it("должен возвращать изменения рейтинга с информацией о пользователе", async () => {
      await createTestRatingChange({ userId: testUser1.id });
      await createTestRatingChange({ userId: testUser2.id });

      const allChangesWithDetails = await ratingChangeRepository.getWithUserDetails();
      const user1ChangesWithDetails = await ratingChangeRepository.getWithUserDetails(testUser1.id);
      const limitedChangesWithDetails = await ratingChangeRepository.getWithUserDetails(undefined, 1);

      expect(allChangesWithDetails).toHaveLength(2);
      expect(allChangesWithDetails[0].user.firstName).toBeDefined();
      expect(allChangesWithDetails[0].user.lastName).toBeDefined();

      expect(user1ChangesWithDetails).toHaveLength(1);
      expect(user1ChangesWithDetails[0].user.firstName).toBe("Test");

      expect(limitedChangesWithDetails).toHaveLength(1);
    });
  });

  describe("getTopRatingGainers", () => {
    it("должен возвращать топ пользователей по росту рейтинга", async () => {
      // testUser1: +20 + 10 = +30
      await createTestRatingChange({
        userId: testUser1.id,
        oldRating: 1500,
        newRating: 1520
      });
      await createTestRatingChange({
        userId: testUser1.id,
        oldRating: 1520,
        newRating: 1530
      });

      // testUser2: +50
      await createTestRatingChange({
        userId: testUser2.id,
        oldRating: 1600,
        newRating: 1650
      });

      const topGainers = await ratingChangeRepository.getTopRatingGainers(5);

      expect(topGainers).toHaveLength(2);
      expect(topGainers[0].totalGain).toBe(50); // testUser2
      expect(topGainers[1].totalGain).toBe(30); // testUser1
    });
  });

  describe("getPositiveChanges", () => {
    it("должен возвращать положительные изменения рейтинга", async () => {
      await createTestRatingChange({ oldRating: 1500, newRating: 1520 }); // +20
      await createTestRatingChange({ oldRating: 1600, newRating: 1580 }); // -20
      await createTestRatingChange({ oldRating: 1400, newRating: 1450 }); // +50

      const allPositiveChanges = await ratingChangeRepository.getPositiveChanges();
      const user1PositiveChanges = await ratingChangeRepository.getPositiveChanges(testUser1.id);

      expect(allPositiveChanges).toHaveLength(2);
      expect(user1PositiveChanges).toHaveLength(2); // все изменения testUser1 положительные
    });
  });

  describe("getNegativeChanges", () => {
    it("должен возвращать отрицательные изменения рейтинга", async () => {
      await createTestRatingChange({ oldRating: 1500, newRating: 1520 }); // +20
      await createTestRatingChange({ oldRating: 1600, newRating: 1580 }); // -20
      await createTestRatingChange({ oldRating: 1400, newRating: 1350 }); // -50

      const allNegativeChanges = await ratingChangeRepository.getNegativeChanges();
      const user1NegativeChanges = await ratingChangeRepository.getNegativeChanges(testUser1.id);

      expect(allNegativeChanges).toHaveLength(2);
      expect(user1NegativeChanges).toHaveLength(2); // все отрицательные изменения testUser1
    });
  });

  describe("deleteAllByUser", () => {
    it("должен удалять все изменения рейтинга пользователя", async () => {
      await createTestRatingChange({ userId: testUser1.id });
      await createTestRatingChange({ userId: testUser1.id, oldRating: 1520, newRating: 1540 });
      await createTestRatingChange({ userId: testUser2.id });

      const deletedCount = await ratingChangeRepository.deleteAllByUser(testUser1.id);

      expect(deletedCount).toBe(2);

      const remainingChanges = await ratingChangeRepository.getByUser(testUser1.id);
      expect(remainingChanges).toHaveLength(0);

      const user2Changes = await ratingChangeRepository.getByUser(testUser2.id);
      expect(user2Changes).toHaveLength(1);
    });
  });

  describe("getAverageChangesByReason", () => {
    it("должен возвращать средние изменения по причинам", async () => {
      await createTestRatingChange({
        changeReason: "game_session",
        oldRating: 1500,
        newRating: 1520
      }); // +20
      await createTestRatingChange({
        changeReason: "game_session",
        oldRating: 1520,
        newRating: 1530
      }); // +10
      await createTestRatingChange({
        changeReason: "tournament_match",
        oldRating: 1600,
        newRating: 1650
      }); // +50
      await createTestRatingChange({
        changeReason: "manual_adjustment",
        oldRating: 1400,
        newRating: 1380
      }); // -20

      const averages = await ratingChangeRepository.getAverageChangesByReason();

      expect(parseFloat(averages.gameSession)).toBe(15); // (20 + 10) / 2
      expect(parseFloat(averages.tournamentMatch)).toBe(50);
      expect(parseFloat(averages.manualAdjustment)).toBe(-20);
    });
  });

  describe("getChangesByDays", () => {
    it("должен возвращать изменения рейтинга по дням", async () => {
      await createTestRatingChange({
        userId: testUser1.id,
        oldRating: 1500,
        newRating: 1520
      });
      await createTestRatingChange({
        userId: testUser1.id,
        oldRating: 1520,
        newRating: 1530
      });

      const allChangesByDays = await ratingChangeRepository.getChangesByDays();
      const user1ChangesByDays = await ratingChangeRepository.getChangesByDays(testUser1.id);

      expect(allChangesByDays).toHaveLength(1); // все изменения в один день
      expect(allChangesByDays[0].changesCount).toBe(2);
      expect(allChangesByDays[0].totalChange).toBe(30); // 20 + 10

      expect(user1ChangesByDays).toHaveLength(1);
      expect(user1ChangesByDays[0].changesCount).toBe(2);
    });
  });
});
