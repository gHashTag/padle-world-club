import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../../../db/schema";
import {
  gameSessions,
  users,
  venues,
  courts,
  bookings,
  NewGameSession,
  NewUser,
  NewVenue,
  NewCourt,
  NewBooking,
} from "../../../db/schema";
import { GameSessionRepository } from "../../../repositories/game-session-repository";
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
const gameSessionRepository = new GameSessionRepository(db);

describe("GameSessionRepository", () => {
  let testVenue: schema.Venue;
  let testUser: schema.User;
  let testCourt: schema.Court;
  let testBooking: schema.Booking;

  // Функция для очистки таблиц перед/после тестов
  const cleanupDatabase = async () => {
    await db.delete(gameSessions);
    await db.delete(bookings);
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

    const userData: NewUser = {
      username: "test_user",
      passwordHash: "hashed_password",
      firstName: "Test",
      lastName: "User",
      email: "user@test.com",
      memberId: "USER001",
      userRole: "player",
      homeVenueId: testVenue.id,
    };
    [testUser] = await db.insert(users).values(userData).returning();

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

    const bookingData: NewBooking = {
      courtId: testCourt.id,
      startTime,
      endTime,
      durationMinutes: 60,
      status: "confirmed",
      totalAmount: "50.00",
      currency: "USD",
      bookedByUserId: testUser.id,
      bookingPurpose: "free_play",
    };
    [testBooking] = await db.insert(bookings).values(bookingData).returning();
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  // Вспомогательная функция для создания тестовой игровой сессии
  const createTestGameSession = async (customData: Partial<NewGameSession> = {}): Promise<schema.GameSession> => {
    const startTime = new Date();
    startTime.setHours(startTime.getHours() + 2);
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + 1);

    const defaultSessionData: NewGameSession = {
      venueId: testVenue.id,
      courtId: testCourt.id,
      startTime,
      endTime,
      gameType: "public_match",
      neededSkillLevel: "intermediate",
      maxPlayers: 4,
      currentPlayers: 0,
      status: "open_for_players",
      createdByUserId: testUser.id,
      ...customData,
    };

    return await gameSessionRepository.create(defaultSessionData);
  };

  describe("create", () => {
    it("должен создавать игровую сессию с обязательными полями", async () => {
      const startTime = new Date();
      startTime.setHours(startTime.getHours() + 2);
      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + 1);

      const sessionData: NewGameSession = {
        venueId: testVenue.id,
        courtId: testCourt.id,
        startTime,
        endTime,
        gameType: "public_match",
        neededSkillLevel: "intermediate",
        maxPlayers: 4,
        currentPlayers: 0,
        status: "open_for_players",
        createdByUserId: testUser.id,
      };

      const gameSession = await gameSessionRepository.create(sessionData);

      expect(gameSession).toBeDefined();
      expect(gameSession.id).toBeDefined();
      expect(gameSession.venueId).toBe(testVenue.id);
      expect(gameSession.courtId).toBe(testCourt.id);
      expect(gameSession.gameType).toBe("public_match");
      expect(gameSession.neededSkillLevel).toBe("intermediate");
      expect(gameSession.maxPlayers).toBe(4);
      expect(gameSession.currentPlayers).toBe(0);
      expect(gameSession.status).toBe("open_for_players");
      expect(gameSession.createdByUserId).toBe(testUser.id);
    });

    it("должен создавать игровую сессию без корта", async () => {
      const startTime = new Date();
      startTime.setHours(startTime.getHours() + 2);
      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + 1);

      const sessionData: NewGameSession = {
        venueId: testVenue.id,
        courtId: null,
        startTime,
        endTime,
        gameType: "private_match",
        neededSkillLevel: "advanced",
        maxPlayers: 4,
        currentPlayers: 2,
        status: "open_for_players",
        createdByUserId: testUser.id,
      };

      const gameSession = await gameSessionRepository.create(sessionData);

      expect(gameSession).toBeDefined();
      expect(gameSession.courtId).toBeNull();
      expect(gameSession.gameType).toBe("private_match");
      expect(gameSession.neededSkillLevel).toBe("advanced");
      expect(gameSession.currentPlayers).toBe(2);
    });
  });

  describe("getById", () => {
    it("должен возвращать игровую сессию по ID", async () => {
      const createdSession = await createTestGameSession();

      const gameSession = await gameSessionRepository.getById(createdSession.id);

      expect(gameSession).toBeDefined();
      expect(gameSession?.id).toBe(createdSession.id);
      expect(gameSession?.venueId).toBe(createdSession.venueId);
    });

    it("должен возвращать null, если игровая сессия не найдена", async () => {
      const gameSession = await gameSessionRepository.getById("00000000-0000-0000-0000-000000000000");

      expect(gameSession).toBeNull();
    });
  });

  describe("getByVenue", () => {
    it("должен возвращать все игровые сессии площадки", async () => {
      await createTestGameSession({ status: "open_for_players" });
      await createTestGameSession({ status: "completed" });

      const venueSessions = await gameSessionRepository.getByVenue(testVenue.id);
      const openSessions = await gameSessionRepository.getByVenue(testVenue.id, "open_for_players");

      expect(venueSessions).toHaveLength(2);
      expect(venueSessions.every(s => s.venueId === testVenue.id)).toBe(true);

      expect(openSessions).toHaveLength(1);
      expect(openSessions[0].status).toBe("open_for_players");
    });
  });

  describe("getByCourt", () => {
    it("должен возвращать игровые сессии по корту", async () => {
      // Создаем второй корт
      const anotherCourt = await db.insert(courts).values({
        venueId: testVenue.id,
        name: "Test Court 2",
        courtType: "paddle",
        hourlyRate: "60.00",
        isActive: true,
      }).returning();

      await createTestGameSession({ courtId: testCourt.id, status: "open_for_players" });
      await createTestGameSession({ courtId: anotherCourt[0].id, status: "open_for_players" });

      const court1Sessions = await gameSessionRepository.getByCourt(testCourt.id);
      const court2Sessions = await gameSessionRepository.getByCourt(anotherCourt[0].id);

      expect(court1Sessions).toHaveLength(1);
      expect(court1Sessions[0].courtId).toBe(testCourt.id);

      expect(court2Sessions).toHaveLength(1);
      expect(court2Sessions[0].courtId).toBe(anotherCourt[0].id);
    });
  });

  describe("getByStatus", () => {
    it("должен возвращать игровые сессии по статусу", async () => {
      await createTestGameSession({ status: "open_for_players" });
      await createTestGameSession({ status: "completed" });
      await createTestGameSession({ status: "cancelled" });

      const openSessions = await gameSessionRepository.getByStatus("open_for_players");
      const completedSessions = await gameSessionRepository.getByStatus("completed");
      const cancelledSessions = await gameSessionRepository.getByStatus("cancelled");

      expect(openSessions).toHaveLength(1);
      expect(openSessions[0].status).toBe("open_for_players");

      expect(completedSessions).toHaveLength(1);
      expect(completedSessions[0].status).toBe("completed");

      expect(cancelledSessions).toHaveLength(1);
      expect(cancelledSessions[0].status).toBe("cancelled");
    });
  });

  describe("getByGameType", () => {
    it("должен возвращать игровые сессии по типу игры", async () => {
      await createTestGameSession({ gameType: "public_match" });
      await createTestGameSession({ gameType: "private_match" });

      const publicSessions = await gameSessionRepository.getByGameType("public_match");
      const privateSessions = await gameSessionRepository.getByGameType("private_match");

      expect(publicSessions).toHaveLength(1);
      expect(publicSessions[0].gameType).toBe("public_match");

      expect(privateSessions).toHaveLength(1);
      expect(privateSessions[0].gameType).toBe("private_match");
    });
  });

  describe("getBySkillLevel", () => {
    it("должен возвращать игровые сессии по уровню навыков", async () => {
      await createTestGameSession({ neededSkillLevel: "beginner" });
      await createTestGameSession({ neededSkillLevel: "advanced" });

      const beginnerSessions = await gameSessionRepository.getBySkillLevel("beginner");
      const advancedSessions = await gameSessionRepository.getBySkillLevel("advanced");

      expect(beginnerSessions).toHaveLength(1);
      expect(beginnerSessions[0].neededSkillLevel).toBe("beginner");

      expect(advancedSessions).toHaveLength(1);
      expect(advancedSessions[0].neededSkillLevel).toBe("advanced");
    });
  });

  describe("getByCreator", () => {
    it("должен возвращать игровые сессии, созданные пользователем", async () => {
      // Создаем второго пользователя
      const anotherUser = await db.insert(users).values({
        username: "another_user",
        passwordHash: "hashed_password",
        firstName: "Another",
        lastName: "User",
        email: "another@test.com",
        memberId: "USER002",
        userRole: "player",
        homeVenueId: testVenue.id,
      }).returning();

      await createTestGameSession({ createdByUserId: testUser.id, status: "open_for_players" });
      await createTestGameSession({ createdByUserId: anotherUser[0].id, status: "open_for_players" });

      const userSessions = await gameSessionRepository.getByCreator(testUser.id);
      const anotherUserSessions = await gameSessionRepository.getByCreator(anotherUser[0].id);

      expect(userSessions).toHaveLength(1);
      expect(userSessions[0].createdByUserId).toBe(testUser.id);

      expect(anotherUserSessions).toHaveLength(1);
      expect(anotherUserSessions[0].createdByUserId).toBe(anotherUser[0].id);
    });
  });

  describe("getByHost", () => {
    it("должен возвращать игровые сессии по хосту", async () => {
      // Создаем второго пользователя
      const hostUser = await db.insert(users).values({
        username: "host_user",
        passwordHash: "hashed_password",
        firstName: "Host",
        lastName: "User",
        email: "host@test.com",
        memberId: "HOST001",
        userRole: "player",
        homeVenueId: testVenue.id,
      }).returning();

      await createTestGameSession({ hostUserId: hostUser[0].id, status: "open_for_players" });
      await createTestGameSession({ hostUserId: null, status: "open_for_players" });

      const hostSessions = await gameSessionRepository.getByHost(hostUser[0].id);

      expect(hostSessions).toHaveLength(1);
      expect(hostSessions[0].hostUserId).toBe(hostUser[0].id);
    });
  });

  describe("getOpenForPlayers", () => {
    it("должен возвращать открытые игровые сессии для подбора игроков", async () => {
      await createTestGameSession({
        status: "open_for_players",
        neededSkillLevel: "intermediate"
      });
      await createTestGameSession({
        status: "completed",
        neededSkillLevel: "intermediate"
      });
      await createTestGameSession({
        status: "open_for_players",
        neededSkillLevel: "advanced"
      });

      const openSessions = await gameSessionRepository.getOpenForPlayers();
      const intermediateOpenSessions = await gameSessionRepository.getOpenForPlayers(testVenue.id, "intermediate");

      expect(openSessions).toHaveLength(2);
      expect(openSessions.every(s => s.status === "open_for_players")).toBe(true);

      expect(intermediateOpenSessions).toHaveLength(1);
      expect(intermediateOpenSessions[0].neededSkillLevel).toBe("intermediate");
    });
  });

  describe("getByTimeRange", () => {
    it("должен возвращать игровые сессии по диапазону времени", async () => {
      const now = new Date();
      const startDate = new Date();
      startDate.setHours(now.getHours() + 1);
      const endDate = new Date();
      endDate.setHours(now.getHours() + 3);

      // Сессия в диапазоне
      const inRangeTime = new Date();
      inRangeTime.setHours(now.getHours() + 2);

      // Сессия вне диапазона
      const outOfRangeTime = new Date();
      outOfRangeTime.setHours(now.getHours() + 5);

      await createTestGameSession({ startTime: inRangeTime });
      await createTestGameSession({ startTime: outOfRangeTime });

      const sessionsInRange = await gameSessionRepository.getByTimeRange(startDate, endDate);

      expect(sessionsInRange).toHaveLength(1);
      // Сравниваем даты без миллисекунд (PostgreSQL обрезает миллисекунды)
      expect(Math.floor(sessionsInRange[0].startTime.getTime() / 1000)).toBe(Math.floor(inRangeTime.getTime() / 1000));
    });
  });

  describe("getWithAvailableSlots", () => {
    it("должен возвращать игровые сессии с доступными местами", async () => {
      await createTestGameSession({
        status: "open_for_players",
        currentPlayers: 2,
        maxPlayers: 4
      });
      await createTestGameSession({
        status: "full",
        currentPlayers: 4,
        maxPlayers: 4
      });
      await createTestGameSession({
        status: "completed",
        currentPlayers: 2,
        maxPlayers: 4
      });

      const sessionsWithSlots = await gameSessionRepository.getWithAvailableSlots();

      expect(sessionsWithSlots).toHaveLength(1);
      expect(sessionsWithSlots[0].currentPlayers).toBeLessThan(sessionsWithSlots[0].maxPlayers);
    });
  });

  describe("getWithoutCourt", () => {
    it("должен возвращать игровые сессии без назначенного корта", async () => {
      await createTestGameSession({ courtId: testCourt.id });
      await createTestGameSession({ courtId: null });

      const sessionsWithoutCourt = await gameSessionRepository.getWithoutCourt();

      expect(sessionsWithoutCourt).toHaveLength(1);
      expect(sessionsWithoutCourt[0].courtId).toBeNull();
    });
  });

  describe("getWithResults", () => {
    it("должен возвращать завершенные игровые сессии с результатами", async () => {
      await createTestGameSession({
        status: "completed",
        matchScore: "6-4 3-6 7-5"
      });
      await createTestGameSession({
        status: "completed",
        matchScore: null
      });
      await createTestGameSession({
        status: "open_for_players",
        matchScore: "6-4 3-6 7-5"
      });

      const sessionsWithResults = await gameSessionRepository.getWithResults();

      expect(sessionsWithResults).toHaveLength(1);
      expect(sessionsWithResults[0].status).toBe("completed");
      expect(sessionsWithResults[0].matchScore).toBe("6-4 3-6 7-5");
    });
  });

  describe("update", () => {
    it("должен обновлять данные игровой сессии", async () => {
      const createdSession = await createTestGameSession();

      const updatedSession = await gameSessionRepository.update(createdSession.id, {
        currentPlayers: 3,
        status: "full",
      });

      expect(updatedSession).toBeDefined();
      expect(updatedSession?.id).toBe(createdSession.id);
      expect(updatedSession?.currentPlayers).toBe(3);
      expect(updatedSession?.status).toBe("full");
    });

    it("должен возвращать null при обновлении несуществующей сессии", async () => {
      const updatedSession = await gameSessionRepository.update("00000000-0000-0000-0000-000000000000", {
        currentPlayers: 3,
      });

      expect(updatedSession).toBeNull();
    });
  });

  describe("updateStatus", () => {
    it("должен обновлять статус игровой сессии", async () => {
      const createdSession = await createTestGameSession({ status: "open_for_players" });

      const updatedSession = await gameSessionRepository.updateStatus(createdSession.id, "full");

      expect(updatedSession).toBeDefined();
      expect(updatedSession?.status).toBe("full");
    });
  });

  describe("updateCurrentPlayers", () => {
    it("должен обновлять количество текущих игроков", async () => {
      const createdSession = await createTestGameSession({
        currentPlayers: 2,
        maxPlayers: 4,
        status: "open_for_players"
      });

      const updatedSession = await gameSessionRepository.updateCurrentPlayers(createdSession.id, 3);

      expect(updatedSession).toBeDefined();
      expect(updatedSession?.currentPlayers).toBe(3);
      expect(updatedSession?.status).toBe("open_for_players");
    });

    it("должен автоматически изменять статус на 'full' при достижении максимума игроков", async () => {
      const createdSession = await createTestGameSession({
        currentPlayers: 3,
        maxPlayers: 4,
        status: "open_for_players"
      });

      const updatedSession = await gameSessionRepository.updateCurrentPlayers(createdSession.id, 4);

      expect(updatedSession).toBeDefined();
      expect(updatedSession?.currentPlayers).toBe(4);
      expect(updatedSession?.status).toBe("full");
    });

    it("должен автоматически изменять статус на 'open_for_players' при уменьшении игроков", async () => {
      const createdSession = await createTestGameSession({
        currentPlayers: 4,
        maxPlayers: 4,
        status: "full"
      });

      const updatedSession = await gameSessionRepository.updateCurrentPlayers(createdSession.id, 3);

      expect(updatedSession).toBeDefined();
      expect(updatedSession?.currentPlayers).toBe(3);
      expect(updatedSession?.status).toBe("open_for_players");
    });
  });

  describe("assignCourt", () => {
    it("должен назначать корт игровой сессии", async () => {
      const createdSession = await createTestGameSession({ courtId: null });

      const updatedSession = await gameSessionRepository.assignCourt(createdSession.id, testCourt.id);

      expect(updatedSession).toBeDefined();
      expect(updatedSession?.courtId).toBe(testCourt.id);
    });
  });

  describe("setMatchResult", () => {
    it("должен устанавливать результат матча", async () => {
      const createdSession = await createTestGameSession({ status: "in_progress" });
      const winnerIds = [testUser.id];

      const updatedSession = await gameSessionRepository.setMatchResult(
        createdSession.id,
        "6-4 3-6 7-5",
        winnerIds
      );

      expect(updatedSession).toBeDefined();
      expect(updatedSession?.matchScore).toBe("6-4 3-6 7-5");
      expect(updatedSession?.winnerUserIds).toEqual(winnerIds);
      expect(updatedSession?.status).toBe("completed");
    });
  });

  describe("delete", () => {
    it("должен удалять игровую сессию", async () => {
      const createdSession = await createTestGameSession();

      const result = await gameSessionRepository.delete(createdSession.id);

      expect(result).toBe(true);

      const deletedSession = await gameSessionRepository.getById(createdSession.id);
      expect(deletedSession).toBeNull();
    });

    it("должен возвращать false при удалении несуществующей сессии", async () => {
      const result = await gameSessionRepository.delete("00000000-0000-0000-0000-000000000000");

      expect(result).toBe(false);
    });
  });

  describe("getCount", () => {
    it("должен возвращать количество игровых сессий", async () => {
      await createTestGameSession({ status: "open_for_players" });
      await createTestGameSession({ status: "completed" });
      await createTestGameSession({ status: "cancelled" });

      const totalCount = await gameSessionRepository.getCount();
      const openCount = await gameSessionRepository.getCount("open_for_players");
      const venueCount = await gameSessionRepository.getCount(undefined, testVenue.id);

      expect(totalCount).toBe(3);
      expect(openCount).toBe(1);
      expect(venueCount).toBe(3);
    });
  });

  describe("getStats", () => {
    it("должен возвращать статистику по игровым сессиям", async () => {
      await createTestGameSession({
        status: "open_for_players",
        gameType: "public_match",
        currentPlayers: 2,
        courtId: testCourt.id
      });
      await createTestGameSession({
        status: "completed",
        gameType: "private_match",
        currentPlayers: 4,
        matchScore: "6-4 3-6 7-5"
      });
      await createTestGameSession({
        status: "cancelled",
        gameType: "public_match",
        currentPlayers: 1,
        courtId: null
      });

      const stats = await gameSessionRepository.getStats();

      expect(stats.totalSessions).toBe(3);
      expect(stats.openSessions).toBe(1);
      expect(stats.completedSessions).toBe(1);
      expect(stats.cancelledSessions).toBe(1);
      expect(stats.publicMatches).toBe(2);
      expect(stats.privateMatches).toBe(1);
      expect(stats.averagePlayersPerSession).toBe("2.33"); // (2 + 4 + 1) / 3
      expect(stats.sessionsWithoutCourt).toBe(1);
      expect(stats.sessionsWithResults).toBe(1);
    });

    it("должен возвращать статистику для конкретной площадки", async () => {
      // Создаем вторую площадку
      const anotherVenue = await db.insert(venues).values({
        name: "Another Venue",
        address: "456 Another St",
        city: "Another City",
        country: "Another Country",
        isActive: true,
      }).returning();

      await createTestGameSession({ venueId: testVenue.id, status: "open_for_players" });
      await createTestGameSession({ venueId: anotherVenue[0].id, status: "completed" });

      const venueStats = await gameSessionRepository.getStats(testVenue.id);

      expect(venueStats.totalSessions).toBe(1);
      expect(venueStats.openSessions).toBe(1);
      expect(venueStats.completedSessions).toBe(0);
    });
  });

  describe("cancel/start/complete", () => {
    it("должен отменять игровую сессию", async () => {
      const createdSession = await createTestGameSession({ status: "open_for_players" });

      const cancelledSession = await gameSessionRepository.cancel(createdSession.id);

      expect(cancelledSession).toBeDefined();
      expect(cancelledSession?.status).toBe("cancelled");
    });

    it("должен начинать игровую сессию", async () => {
      const createdSession = await createTestGameSession({ status: "full" });

      const startedSession = await gameSessionRepository.start(createdSession.id);

      expect(startedSession).toBeDefined();
      expect(startedSession?.status).toBe("in_progress");
    });

    it("должен завершать игровую сессию", async () => {
      const createdSession = await createTestGameSession({ status: "in_progress" });

      const completedSession = await gameSessionRepository.complete(createdSession.id);

      expect(completedSession).toBeDefined();
      expect(completedSession?.status).toBe("completed");
    });
  });

  describe("getStartingSoon", () => {
    it("должен возвращать игровые сессии, которые скоро начнутся", async () => {
      const now = new Date();

      // Сессия, начинающаяся через 15 минут
      const startingSoon = new Date();
      startingSoon.setMinutes(now.getMinutes() + 15);

      // Сессия, начинающаяся через 45 минут
      const startingLater = new Date();
      startingLater.setMinutes(now.getMinutes() + 45);

      await createTestGameSession({
        status: "open_for_players",
        startTime: startingSoon
      });
      await createTestGameSession({
        status: "open_for_players",
        startTime: startingLater
      });

      const startingSoonSessions = await gameSessionRepository.getStartingSoon(30);

      expect(startingSoonSessions).toHaveLength(1);
      expect(Math.floor(startingSoonSessions[0].startTime.getTime() / 1000)).toBe(Math.floor(startingSoon.getTime() / 1000));
    });
  });

  describe("getOverdue", () => {
    it("должен возвращать просроченные игровые сессии", async () => {
      const now = new Date();

      // Просроченная сессия
      const overdueTime = new Date();
      overdueTime.setMinutes(now.getMinutes() - 30);

      // Будущая сессия
      const futureTime = new Date();
      futureTime.setMinutes(now.getMinutes() + 30);

      await createTestGameSession({
        status: "open_for_players",
        startTime: overdueTime
      });
      await createTestGameSession({
        status: "open_for_players",
        startTime: futureTime
      });

      const overdueSessions = await gameSessionRepository.getOverdue();

      expect(overdueSessions).toHaveLength(1);
      expect(Math.floor(overdueSessions[0].startTime.getTime() / 1000)).toBe(Math.floor(overdueTime.getTime() / 1000));
    });
  });

  describe("getByWinners", () => {
    it("должен возвращать игровые сессии по ID победителей", async () => {
      const winnerIds = [testUser.id];

      await createTestGameSession({
        status: "completed",
        winnerUserIds: winnerIds
      });
      await createTestGameSession({
        status: "completed",
        winnerUserIds: []
      });

      const winnerSessions = await gameSessionRepository.getByWinners(winnerIds);

      expect(winnerSessions).toHaveLength(1);
      expect(winnerSessions[0].winnerUserIds).toEqual(winnerIds);
    });
  });

  describe("getByRelatedBooking", () => {
    it("должен возвращать игровые сессии по связанному бронированию", async () => {
      await createTestGameSession({ relatedBookingId: testBooking.id });
      await createTestGameSession({ relatedBookingId: null });

      const relatedSessions = await gameSessionRepository.getByRelatedBooking(testBooking.id);

      expect(relatedSessions).toHaveLength(1);
      expect(relatedSessions[0].relatedBookingId).toBe(testBooking.id);
    });
  });

  describe("findSuitableForUser", () => {
    it("должен находить подходящие игровые сессии для пользователя", async () => {
      const now = new Date();
      const futureTime = new Date();
      futureTime.setHours(now.getHours() + 2);

      await createTestGameSession({
        status: "open_for_players",
        neededSkillLevel: "intermediate",
        gameType: "public_match",
        currentPlayers: 2,
        maxPlayers: 4,
        startTime: futureTime
      });
      await createTestGameSession({
        status: "completed",
        neededSkillLevel: "intermediate"
      });

      const suitableSessions = await gameSessionRepository.findSuitableForUser(
        "intermediate",
        testVenue.id,
        "public_match"
      );

      expect(suitableSessions).toHaveLength(1);
      expect(suitableSessions[0].neededSkillLevel).toBe("intermediate");
      expect(suitableSessions[0].gameType).toBe("public_match");
      expect(suitableSessions[0].status).toBe("open_for_players");
    });
  });

  describe("markOverdueSessions", () => {
    it("должен массово обновлять статус просроченных сессий", async () => {
      const now = new Date();
      const overdueTime = new Date();
      overdueTime.setMinutes(now.getMinutes() - 30);
      const futureTime = new Date();
      futureTime.setMinutes(now.getMinutes() + 30);

      await createTestGameSession({
        status: "open_for_players",
        startTime: overdueTime
      });
      await createTestGameSession({
        status: "full",
        startTime: overdueTime
      });
      await createTestGameSession({
        status: "open_for_players",
        startTime: futureTime
      });

      const updatedCount = await gameSessionRepository.markOverdueSessions();

      expect(updatedCount).toBe(2);

      const cancelledSessions = await gameSessionRepository.getByStatus("cancelled");
      expect(cancelledSessions).toHaveLength(2);
    });
  });

  describe("getMostPopularTimeSlots", () => {
    it("должен возвращать самые популярные временные слоты", async () => {
      const time10 = new Date();
      time10.setHours(10, 0, 0, 0);
      const time14 = new Date();
      time14.setHours(14, 0, 0, 0);

      // Создаем несколько сессий в 10:00
      await createTestGameSession({ startTime: time10 });
      await createTestGameSession({ startTime: time10 });

      // Создаем одну сессию в 14:00
      await createTestGameSession({ startTime: time14 });

      const popularSlots = await gameSessionRepository.getMostPopularTimeSlots(testVenue.id, 5);

      expect(popularSlots).toHaveLength(2);
      expect(popularSlots[0].hour).toBe(10);
      expect(popularSlots[0].sessionCount).toBe(2);
      expect(popularSlots[1].hour).toBe(14);
      expect(popularSlots[1].sessionCount).toBe(1);
    });
  });

  describe("getByPlayersRange", () => {
    it("должен возвращать игровые сессии по диапазону количества игроков", async () => {
      await createTestGameSession({ currentPlayers: 1 });
      await createTestGameSession({ currentPlayers: 3 });
      await createTestGameSession({ currentPlayers: 4 });

      const sessionsInRange = await gameSessionRepository.getByPlayersRange(2, 3);

      expect(sessionsInRange).toHaveLength(1);
      expect(sessionsInRange[0].currentPlayers).toBe(3);
    });
  });

  describe("setHost/removeHost", () => {
    it("должен устанавливать хоста игровой сессии", async () => {
      const createdSession = await createTestGameSession({ hostUserId: null });

      const updatedSession = await gameSessionRepository.setHost(createdSession.id, testUser.id);

      expect(updatedSession).toBeDefined();
      expect(updatedSession?.hostUserId).toBe(testUser.id);
    });

    it("должен убирать хоста игровой сессии", async () => {
      const createdSession = await createTestGameSession({ hostUserId: testUser.id });

      const updatedSession = await gameSessionRepository.removeHost(createdSession.id);

      expect(updatedSession).toBeDefined();
      expect(updatedSession?.hostUserId).toBeNull();
    });
  });

  describe("getAll", () => {
    it("должен возвращать все игровые сессии с пагинацией", async () => {
      // Создаем 5 сессий
      for (let i = 0; i < 5; i++) {
        await createTestGameSession();
      }

      const allSessions = await gameSessionRepository.getAll();
      const limitedSessions = await gameSessionRepository.getAll(3);
      const offsetSessions = await gameSessionRepository.getAll(3, 2);

      expect(allSessions).toHaveLength(5);
      expect(limitedSessions).toHaveLength(3);
      expect(offsetSessions).toHaveLength(3);
    });
  });
});
