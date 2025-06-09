import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../../../db/schema";
import {
  gamePlayers,
  users,
  venues,
  courts,
  gameSessions,
  NewGamePlayer,
  NewUser,
  NewVenue,
  NewCourt,
  NewGameSession,
} from "../../../db/schema";
import { GamePlayerRepository } from "../../../repositories/game-player-repository";
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
const gamePlayerRepository = new GamePlayerRepository(db);

describe("GamePlayerRepository", () => {
  let testVenue: schema.Venue;
  let testUser1: schema.User;
  let testUser2: schema.User;
  let testCourt: schema.Court;
  let testGameSession: schema.GameSession;

  // Функция для очистки таблиц перед/после тестов
  const cleanupDatabase = async () => {
    await db.delete(gamePlayers);
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

  // Вспомогательная функция для создания тестового игрока
  const createTestGamePlayer = async (customData: Partial<NewGamePlayer> = {}): Promise<schema.GamePlayer> => {
    const defaultPlayerData: NewGamePlayer = {
      gameSessionId: testGameSession.id,
      userId: testUser1.id,
      participationStatus: "registered",
      ...customData,
    };

    return await gamePlayerRepository.create(defaultPlayerData);
  };

  describe("create", () => {
    it("должен создавать игрока в игровой сессии", async () => {
      const playerData: NewGamePlayer = {
        gameSessionId: testGameSession.id,
        userId: testUser1.id,
        participationStatus: "registered",
      };

      const gamePlayer = await gamePlayerRepository.create(playerData);

      expect(gamePlayer).toBeDefined();
      expect(gamePlayer.id).toBeDefined();
      expect(gamePlayer.gameSessionId).toBe(testGameSession.id);
      expect(gamePlayer.userId).toBe(testUser1.id);
      expect(gamePlayer.participationStatus).toBe("registered");
    });

    it("должен создавать игрока с разными статусами", async () => {
      const attendedPlayer = await createTestGamePlayer({
        userId: testUser1.id,
        participationStatus: "attended"
      });
      const noShowPlayer = await createTestGamePlayer({
        userId: testUser2.id,
        participationStatus: "no_show"
      });

      expect(attendedPlayer.participationStatus).toBe("attended");
      expect(noShowPlayer.participationStatus).toBe("no_show");
    });
  });

  describe("getById", () => {
    it("должен возвращать игрока по ID", async () => {
      const createdPlayer = await createTestGamePlayer();

      const gamePlayer = await gamePlayerRepository.getById(createdPlayer.id);

      expect(gamePlayer).toBeDefined();
      expect(gamePlayer?.id).toBe(createdPlayer.id);
      expect(gamePlayer?.gameSessionId).toBe(createdPlayer.gameSessionId);
    });

    it("должен возвращать null, если игрок не найден", async () => {
      const gamePlayer = await gamePlayerRepository.getById("00000000-0000-0000-0000-000000000000");

      expect(gamePlayer).toBeNull();
    });
  });

  describe("getByGameSessionAndUser", () => {
    it("должен возвращать игрока по игровой сессии и пользователю", async () => {
      const createdPlayer = await createTestGamePlayer();

      const gamePlayer = await gamePlayerRepository.getByGameSessionAndUser(
        testGameSession.id,
        testUser1.id
      );

      expect(gamePlayer).toBeDefined();
      expect(gamePlayer?.id).toBe(createdPlayer.id);
    });

    it("должен возвращать null, если игрок не найден", async () => {
      const gamePlayer = await gamePlayerRepository.getByGameSessionAndUser(
        testGameSession.id,
        testUser2.id
      );

      expect(gamePlayer).toBeNull();
    });
  });

  describe("getByGameSession", () => {
    it("должен возвращать всех игроков игровой сессии", async () => {
      await createTestGamePlayer({ userId: testUser1.id, participationStatus: "registered" });
      await createTestGamePlayer({ userId: testUser2.id, participationStatus: "attended" });

      const allPlayers = await gamePlayerRepository.getByGameSession(testGameSession.id);
      const registeredPlayers = await gamePlayerRepository.getByGameSession(testGameSession.id, "registered");

      expect(allPlayers).toHaveLength(2);
      expect(allPlayers.every(p => p.gameSessionId === testGameSession.id)).toBe(true);

      expect(registeredPlayers).toHaveLength(1);
      expect(registeredPlayers[0].participationStatus).toBe("registered");
    });
  });

  describe("getByUser", () => {
    it("должен возвращать все игровые сессии пользователя", async () => {
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

      await createTestGamePlayer({ userId: testUser1.id, participationStatus: "registered" });
      await createTestGamePlayer({
        gameSessionId: anotherGameSession[0].id,
        userId: testUser1.id,
        participationStatus: "attended"
      });

      const userPlayers = await gamePlayerRepository.getByUser(testUser1.id);
      const attendedPlayers = await gamePlayerRepository.getByUser(testUser1.id, "attended");

      expect(userPlayers).toHaveLength(2);
      expect(userPlayers.every(p => p.userId === testUser1.id)).toBe(true);

      expect(attendedPlayers).toHaveLength(1);
      expect(attendedPlayers[0].participationStatus).toBe("attended");
    });
  });

  describe("getByStatus", () => {
    it("должен возвращать игроков по статусу", async () => {
      await createTestGamePlayer({ userId: testUser1.id, participationStatus: "registered" });
      await createTestGamePlayer({ userId: testUser2.id, participationStatus: "attended" });

      const registeredPlayers = await gamePlayerRepository.getByStatus("registered");
      const attendedPlayers = await gamePlayerRepository.getByStatus("attended");

      expect(registeredPlayers).toHaveLength(1);
      expect(registeredPlayers[0].participationStatus).toBe("registered");

      expect(attendedPlayers).toHaveLength(1);
      expect(attendedPlayers[0].participationStatus).toBe("attended");
    });
  });

  describe("getByGameSessions", () => {
    it("должен возвращать игроков по нескольким игровым сессиям", async () => {
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

      await createTestGamePlayer({ gameSessionId: testGameSession.id, userId: testUser1.id });
      await createTestGamePlayer({ gameSessionId: anotherGameSession[0].id, userId: testUser2.id });

      const players = await gamePlayerRepository.getByGameSessions([
        testGameSession.id,
        anotherGameSession[0].id
      ]);

      expect(players).toHaveLength(2);
    });

    it("должен возвращать пустой массив для пустого списка сессий", async () => {
      const players = await gamePlayerRepository.getByGameSessions([]);
      expect(players).toHaveLength(0);
    });
  });

  describe("getByUsers", () => {
    it("должен возвращать игроков по нескольким пользователям", async () => {
      await createTestGamePlayer({ userId: testUser1.id });
      await createTestGamePlayer({ userId: testUser2.id });

      const players = await gamePlayerRepository.getByUsers([testUser1.id, testUser2.id]);

      expect(players).toHaveLength(2);
    });

    it("должен возвращать пустой массив для пустого списка пользователей", async () => {
      const players = await gamePlayerRepository.getByUsers([]);
      expect(players).toHaveLength(0);
    });
  });

  describe("update", () => {
    it("должен обновлять данные игрока", async () => {
      const createdPlayer = await createTestGamePlayer();

      const updatedPlayer = await gamePlayerRepository.update(createdPlayer.id, {
        participationStatus: "attended",
      });

      expect(updatedPlayer).toBeDefined();
      expect(updatedPlayer?.id).toBe(createdPlayer.id);
      expect(updatedPlayer?.participationStatus).toBe("attended");
    });

    it("должен возвращать null при обновлении несуществующего игрока", async () => {
      const updatedPlayer = await gamePlayerRepository.update("00000000-0000-0000-0000-000000000000", {
        participationStatus: "attended",
      });

      expect(updatedPlayer).toBeNull();
    });
  });

  describe("updateStatus", () => {
    it("должен обновлять статус игрока", async () => {
      const createdPlayer = await createTestGamePlayer({ participationStatus: "registered" });

      const updatedPlayer = await gamePlayerRepository.updateStatus(createdPlayer.id, "attended");

      expect(updatedPlayer).toBeDefined();
      expect(updatedPlayer?.participationStatus).toBe("attended");
    });
  });

  describe("updateStatusByGameSessionAndUser", () => {
    it("должен обновлять статус игрока по игровой сессии и пользователю", async () => {
      await createTestGamePlayer({ participationStatus: "registered" });

      const updatedPlayer = await gamePlayerRepository.updateStatusByGameSessionAndUser(
        testGameSession.id,
        testUser1.id,
        "attended"
      );

      expect(updatedPlayer).toBeDefined();
      expect(updatedPlayer?.participationStatus).toBe("attended");
    });

    it("должен возвращать null, если игрок не найден", async () => {
      const updatedPlayer = await gamePlayerRepository.updateStatusByGameSessionAndUser(
        testGameSession.id,
        testUser2.id,
        "attended"
      );

      expect(updatedPlayer).toBeNull();
    });
  });

  describe("delete", () => {
    it("должен удалять игрока", async () => {
      const createdPlayer = await createTestGamePlayer();

      const result = await gamePlayerRepository.delete(createdPlayer.id);

      expect(result).toBe(true);

      const deletedPlayer = await gamePlayerRepository.getById(createdPlayer.id);
      expect(deletedPlayer).toBeNull();
    });

    it("должен возвращать false при удалении несуществующего игрока", async () => {
      const result = await gamePlayerRepository.delete("00000000-0000-0000-0000-000000000000");

      expect(result).toBe(false);
    });
  });

  describe("deleteByGameSessionAndUser", () => {
    it("должен удалять игрока по игровой сессии и пользователю", async () => {
      await createTestGamePlayer();

      const result = await gamePlayerRepository.deleteByGameSessionAndUser(
        testGameSession.id,
        testUser1.id
      );

      expect(result).toBe(true);

      const deletedPlayer = await gamePlayerRepository.getByGameSessionAndUser(
        testGameSession.id,
        testUser1.id
      );
      expect(deletedPlayer).toBeNull();
    });

    it("должен возвращать false, если игрок не найден", async () => {
      const result = await gamePlayerRepository.deleteByGameSessionAndUser(
        testGameSession.id,
        testUser2.id
      );

      expect(result).toBe(false);
    });
  });

  describe("getCount", () => {
    it("должен возвращать количество игроков", async () => {
      await createTestGamePlayer({ userId: testUser1.id, participationStatus: "registered" });
      await createTestGamePlayer({ userId: testUser2.id, participationStatus: "attended" });

      const totalCount = await gamePlayerRepository.getCount();
      const registeredCount = await gamePlayerRepository.getCount("registered");
      const sessionCount = await gamePlayerRepository.getCount(undefined, testGameSession.id);
      const userCount = await gamePlayerRepository.getCount(undefined, undefined, testUser1.id);

      expect(totalCount).toBe(2);
      expect(registeredCount).toBe(1);
      expect(sessionCount).toBe(2);
      expect(userCount).toBe(1);
    });
  });

  describe("getAll", () => {
    it("должен возвращать всех игроков с пагинацией", async () => {
      // Создаем дополнительные игровые сессии для разных игроков
      const gameSession2 = await db.insert(gameSessions).values({
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

      const gameSession3 = await db.insert(gameSessions).values({
        venueId: testVenue.id,
        courtId: testCourt.id,
        startTime: new Date(),
        endTime: new Date(),
        gameType: "public_match",
        neededSkillLevel: "beginner",
        maxPlayers: 4,
        currentPlayers: 0,
        status: "open_for_players",
        createdByUserId: testUser2.id,
      }).returning();

      // Создаем игроков в разных сессиях
      await createTestGamePlayer({ gameSessionId: testGameSession.id, userId: testUser1.id });
      await createTestGamePlayer({ gameSessionId: gameSession2[0].id, userId: testUser1.id });
      await createTestGamePlayer({ gameSessionId: gameSession3[0].id, userId: testUser2.id });

      const allPlayers = await gamePlayerRepository.getAll();
      const limitedPlayers = await gamePlayerRepository.getAll(2);
      const offsetPlayers = await gamePlayerRepository.getAll(2, 1);

      expect(allPlayers).toHaveLength(3);
      expect(limitedPlayers).toHaveLength(2);
      expect(offsetPlayers).toHaveLength(2); // offset=1, limit=2 из 3 элементов = 2 элемента
    });
  });

  describe("getStats", () => {
    it("должен возвращать статистику по игрокам", async () => {
      await createTestGamePlayer({ userId: testUser1.id, participationStatus: "registered" });
      await createTestGamePlayer({ userId: testUser2.id, participationStatus: "attended" });

      const stats = await gamePlayerRepository.getStats();
      const sessionStats = await gamePlayerRepository.getStats(testGameSession.id);

      expect(stats.totalPlayers).toBe(2);
      expect(stats.registeredPlayers).toBe(1);
      expect(stats.attendedPlayers).toBe(1);
      expect(stats.noShowPlayers).toBe(0);
      expect(stats.cancelledPlayers).toBe(0);
      expect(stats.attendanceRate).toBe("50.00");

      expect(sessionStats.totalPlayers).toBe(2);
      expect(sessionStats.attendanceRate).toBe("50.00");
    });
  });

  describe("isUserInGameSession", () => {
    it("должен проверять, участвует ли пользователь в игровой сессии", async () => {
      await createTestGamePlayer({ userId: testUser1.id });

      const isUser1InSession = await gamePlayerRepository.isUserInGameSession(testGameSession.id, testUser1.id);
      const isUser2InSession = await gamePlayerRepository.isUserInGameSession(testGameSession.id, testUser2.id);

      expect(isUser1InSession).toBe(true);
      expect(isUser2InSession).toBe(false);
    });
  });

  describe("getActivePlayersByGameSession", () => {
    it("должен возвращать активных игроков игровой сессии", async () => {
      await createTestGamePlayer({ userId: testUser1.id, participationStatus: "registered" });
      await createTestGamePlayer({ userId: testUser2.id, participationStatus: "cancelled" });

      const activePlayers = await gamePlayerRepository.getActivePlayersByGameSession(testGameSession.id);

      expect(activePlayers).toHaveLength(1);
      expect(activePlayers[0].participationStatus).toBe("registered");
    });
  });

  describe("bulkUpdateStatus", () => {
    it("должен массово обновлять статус игроков", async () => {
      await createTestGamePlayer({ userId: testUser1.id, participationStatus: "registered" });
      await createTestGamePlayer({ userId: testUser2.id, participationStatus: "registered" });

      const updatedCount = await gamePlayerRepository.bulkUpdateStatus(
        testGameSession.id,
        "registered",
        "attended"
      );

      expect(updatedCount).toBe(2);

      const attendedPlayers = await gamePlayerRepository.getByStatus("attended");
      expect(attendedPlayers).toHaveLength(2);
    });
  });

  describe("deleteAllByGameSession", () => {
    it("должен удалять всех игроков игровой сессии", async () => {
      await createTestGamePlayer({ userId: testUser1.id });
      await createTestGamePlayer({ userId: testUser2.id });

      const deletedCount = await gamePlayerRepository.deleteAllByGameSession(testGameSession.id);

      expect(deletedCount).toBe(2);

      const remainingPlayers = await gamePlayerRepository.getByGameSession(testGameSession.id);
      expect(remainingPlayers).toHaveLength(0);
    });
  });

  describe("getWithDetails", () => {
    it("должен возвращать игроков с детальной информацией", async () => {
      await createTestGamePlayer({ userId: testUser1.id, participationStatus: "attended" });

      const playersWithDetails = await gamePlayerRepository.getWithDetails();
      const sessionPlayersWithDetails = await gamePlayerRepository.getWithDetails(testGameSession.id);
      const userPlayersWithDetails = await gamePlayerRepository.getWithDetails(undefined, testUser1.id);

      expect(playersWithDetails).toHaveLength(1);
      expect(playersWithDetails[0].user.firstName).toBe("Test");
      expect(playersWithDetails[0].gameSession.gameType).toBe("public_match");

      expect(sessionPlayersWithDetails).toHaveLength(1);
      expect(userPlayersWithDetails).toHaveLength(1);
    });
  });

  describe("getTopPlayersByAttendance", () => {
    it("должен возвращать топ игроков по посещаемости", async () => {
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

      // testUser1 посещает 2 сессии, 1 attended
      await createTestGamePlayer({ userId: testUser1.id, participationStatus: "attended" });
      await createTestGamePlayer({
        gameSessionId: anotherGameSession[0].id,
        userId: testUser1.id,
        participationStatus: "no_show"
      });

      // testUser2 посещает 1 сессию, 1 attended
      await createTestGamePlayer({ userId: testUser2.id, participationStatus: "attended" });

      const topPlayers = await gamePlayerRepository.getTopPlayersByAttendance(5);

      expect(topPlayers).toHaveLength(2);
      expect(topPlayers[0].attendedSessions).toBeGreaterThanOrEqual(topPlayers[1].attendedSessions);
      expect(topPlayers[0].attendanceRate).toBeDefined();
    });
  });

  describe("getByDateRange", () => {
    it("должен возвращать игроков по диапазону дат", async () => {
      const now = new Date();
      const startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // вчера
      const endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // завтра

      await createTestGamePlayer({ userId: testUser1.id });

      const playersInRange = await gamePlayerRepository.getByDateRange(startDate, endDate);

      expect(playersInRange).toHaveLength(1);
    });
  });

  describe("getUniqueUserIds", () => {
    it("должен возвращать уникальных пользователей", async () => {
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

      await createTestGamePlayer({ userId: testUser1.id });
      await createTestGamePlayer({
        gameSessionId: anotherGameSession[0].id,
        userId: testUser1.id
      });
      await createTestGamePlayer({ userId: testUser2.id });

      const allUniqueUsers = await gamePlayerRepository.getUniqueUserIds();
      const sessionUniqueUsers = await gamePlayerRepository.getUniqueUserIds([testGameSession.id]);

      expect(allUniqueUsers).toHaveLength(2);
      expect(allUniqueUsers).toContain(testUser1.id);
      expect(allUniqueUsers).toContain(testUser2.id);

      expect(sessionUniqueUsers).toHaveLength(2);
    });
  });
});
