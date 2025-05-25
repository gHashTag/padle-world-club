import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../../../db/schema";
import {
  tournamentMatches,
  tournaments,
  venues,
  users,
  courts,
  tournamentTeams,
  NewTournamentMatch,
  NewTournament,
  NewVenue,
  NewUser,
  NewCourt,
  NewTournamentTeam,
} from "../../../db/schema";
import { TournamentMatchRepository } from "../../../repositories/tournament-match-repository";
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
const tournamentMatchRepository = new TournamentMatchRepository(db);

describe("TournamentMatchRepository", () => {
  let testVenue: schema.Venue;
  let testUser1: schema.User;
  let testUser2: schema.User;
  let testUser3: schema.User;
  let testUser4: schema.User;
  let testCourt1: schema.Court;
  let testCourt2: schema.Court;
  let testTournament1: schema.Tournament;
  let testTournament2: schema.Tournament;
  let testTeam1: schema.TournamentTeam;
  let testTeam2: schema.TournamentTeam;

  // Функция для очистки таблиц перед/после тестов
  const cleanupDatabase = async () => {
    await db.delete(tournamentMatches);
    await db.delete(tournamentTeams);
    await db.delete(tournaments);
    await db.delete(courts);
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
      userRole: "player",
      homeVenueId: testVenue.id,
      currentRating: 1600,
    };
    [testUser2] = await db.insert(users).values(userData2).returning();

    const userData3: NewUser = {
      username: "test_user3",
      passwordHash: "hashed_password",
      firstName: "Test",
      lastName: "User3",
      email: "user3@test.com",
      memberId: "USER003",
      userRole: "player",
      homeVenueId: testVenue.id,
      currentRating: 1700,
    };
    [testUser3] = await db.insert(users).values(userData3).returning();

    const userData4: NewUser = {
      username: "test_user4",
      passwordHash: "hashed_password",
      firstName: "Test",
      lastName: "User4",
      email: "user4@test.com",
      memberId: "USER004",
      userRole: "player",
      homeVenueId: testVenue.id,
      currentRating: 1800,
    };
    [testUser4] = await db.insert(users).values(userData4).returning();

    // Создаем тестовые корты
    const courtData1: NewCourt = {
      venueId: testVenue.id,
      name: "Court 1",
      courtType: "paddle",
      hourlyRate: "50.00",
      isActive: true,
    };
    [testCourt1] = await db.insert(courts).values(courtData1).returning();

    const courtData2: NewCourt = {
      venueId: testVenue.id,
      name: "Court 2",
      courtType: "paddle",
      hourlyRate: "50.00",
      isActive: true,
    };
    [testCourt2] = await db.insert(courts).values(courtData2).returning();

    // Создаем тестовые турниры
    const startDate1 = new Date();
    startDate1.setDate(startDate1.getDate() + 7);
    const endDate1 = new Date(startDate1);
    endDate1.setDate(endDate1.getDate() + 1);

    const tournamentData1: NewTournament = {
      venueId: testVenue.id,
      name: "Test Tournament 1",
      description: "Test tournament 1 description",
      tournamentType: "singles_elimination",
      skillLevelCategory: "intermediate",
      startDate: startDate1,
      endDate: endDate1,
      registrationFee: "50.00",
      currency: "USD",
      maxParticipants: 16,
      status: "registration_open",
    };
    [testTournament1] = await db.insert(tournaments).values(tournamentData1).returning();

    const startDate2 = new Date();
    startDate2.setDate(startDate2.getDate() + 14);
    const endDate2 = new Date(startDate2);
    endDate2.setDate(endDate2.getDate() + 1);

    const tournamentData2: NewTournament = {
      venueId: testVenue.id,
      name: "Test Tournament 2",
      description: "Test tournament 2 description",
      tournamentType: "doubles_round_robin",
      skillLevelCategory: "advanced",
      startDate: startDate2,
      endDate: endDate2,
      registrationFee: "100.00",
      currency: "USD",
      maxParticipants: 32,
      status: "upcoming",
    };
    [testTournament2] = await db.insert(tournaments).values(tournamentData2).returning();

    // Создаем тестовые команды
    const teamData1: NewTournamentTeam = {
      tournamentId: testTournament1.id,
      name: "Team 1",
      player1Id: testUser1.id,
      player2Id: testUser2.id,
    };
    [testTeam1] = await db.insert(tournamentTeams).values(teamData1).returning();

    const teamData2: NewTournamentTeam = {
      tournamentId: testTournament1.id,
      name: "Team 2",
      player1Id: testUser3.id,
      player2Id: testUser4.id,
    };
    [testTeam2] = await db.insert(tournamentTeams).values(teamData2).returning();
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  // Вспомогательная функция для создания тестового матча
  const createTestMatch = async (customData: Partial<NewTournamentMatch> = {}): Promise<schema.TournamentMatch> => {
    const startTime = new Date();
    startTime.setHours(startTime.getHours() + 1);
    const endTime = new Date(startTime);
    endTime.setHours(endTime.getHours() + 2);

    const defaultMatchData: NewTournamentMatch = {
      tournamentId: testTournament1.id,
      courtId: testCourt1.id,
      matchNumber: 1,
      round: "Round 1",
      startTime,
      endTime,
      status: "upcoming",
      winnerTeamId: testTeam1.id,
      loserTeamId: testTeam2.id,
      ...customData,
    };

    return await tournamentMatchRepository.create(defaultMatchData);
  };

  describe("create", () => {
    it("должен создавать матч турнира", async () => {
      const startTime = new Date();
      startTime.setHours(startTime.getHours() + 1);
      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + 2);

      const matchData: NewTournamentMatch = {
        tournamentId: testTournament1.id,
        courtId: testCourt1.id,
        matchNumber: 1,
        round: "Round 1",
        startTime,
        endTime,
        status: "upcoming",
        winnerTeamId: testTeam1.id,
        loserTeamId: testTeam2.id,
      };

      const match = await tournamentMatchRepository.create(matchData);

      expect(match).toBeDefined();
      expect(match.id).toBeDefined();
      expect(match.tournamentId).toBe(testTournament1.id);
      expect(match.courtId).toBe(testCourt1.id);
      expect(match.matchNumber).toBe(1);
      expect(match.round).toBe("Round 1");
      expect(match.status).toBe("upcoming");
    });

    it("должен создавать матч без корта", async () => {
      const startTime = new Date();
      startTime.setHours(startTime.getHours() + 1);
      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + 2);

      const matchData: NewTournamentMatch = {
        tournamentId: testTournament1.id,
        courtId: null,
        matchNumber: 2,
        round: "Round 1",
        startTime,
        endTime,
        status: "upcoming",
      };

      const match = await tournamentMatchRepository.create(matchData);

      expect(match.courtId).toBeNull();
    });

    it("должен создавать матч с игроками вместо команд", async () => {
      const startTime = new Date();
      startTime.setHours(startTime.getHours() + 1);
      const endTime = new Date(startTime);
      endTime.setHours(endTime.getHours() + 2);

      const matchData: NewTournamentMatch = {
        tournamentId: testTournament1.id,
        courtId: testCourt1.id,
        matchNumber: 3,
        round: "Round 1",
        startTime,
        endTime,
        status: "upcoming",
        winnerPlayerIds: [testUser1.id, testUser2.id],
        loserPlayerIds: [testUser3.id, testUser4.id],
      };

      const match = await tournamentMatchRepository.create(matchData);

      expect(match.winnerPlayerIds).toEqual([testUser1.id, testUser2.id]);
      expect(match.loserPlayerIds).toEqual([testUser3.id, testUser4.id]);
      expect(match.winnerTeamId).toBeNull();
      expect(match.loserTeamId).toBeNull();
    });
  });

  describe("getById", () => {
    it("должен возвращать матч по ID", async () => {
      const createdMatch = await createTestMatch();

      const match = await tournamentMatchRepository.getById(createdMatch.id);

      expect(match).toBeDefined();
      expect(match?.id).toBe(createdMatch.id);
      expect(match?.matchNumber).toBe(createdMatch.matchNumber);
    });

    it("должен возвращать null, если матч не найден", async () => {
      const match = await tournamentMatchRepository.getById("00000000-0000-0000-0000-000000000000");

      expect(match).toBeNull();
    });
  });

  describe("getByTournamentAndMatchNumber", () => {
    it("должен возвращать матч по турниру и номеру матча", async () => {
      const createdMatch = await createTestMatch({ matchNumber: 5 });

      const match = await tournamentMatchRepository.getByTournamentAndMatchNumber(
        testTournament1.id,
        5
      );

      expect(match).toBeDefined();
      expect(match?.id).toBe(createdMatch.id);
      expect(match?.matchNumber).toBe(5);
    });

    it("должен возвращать null, если матч не найден", async () => {
      const match = await tournamentMatchRepository.getByTournamentAndMatchNumber(
        testTournament1.id,
        999
      );

      expect(match).toBeNull();
    });
  });

  describe("getByTournament", () => {
    it("должен возвращать все матчи турнира", async () => {
      await createTestMatch({ matchNumber: 1, round: "Round 1" });
      await createTestMatch({ matchNumber: 2, round: "Round 1" });
      await createTestMatch({
        tournamentId: testTournament2.id,
        matchNumber: 1,
        round: "Round 1"
      });

      const tournament1Matches = await tournamentMatchRepository.getByTournament(testTournament1.id);
      const tournament2Matches = await tournamentMatchRepository.getByTournament(testTournament2.id);

      expect(tournament1Matches).toHaveLength(2);
      expect(tournament1Matches.every(m => m.tournamentId === testTournament1.id)).toBe(true);

      expect(tournament2Matches).toHaveLength(1);
      expect(tournament2Matches[0].tournamentId).toBe(testTournament2.id);
    });

    it("должен поддерживать пагинацию", async () => {
      await createTestMatch({ matchNumber: 1 });
      await createTestMatch({ matchNumber: 2 });
      await createTestMatch({ matchNumber: 3 });

      const limitedMatches = await tournamentMatchRepository.getByTournament(testTournament1.id, 2);
      const offsetMatches = await tournamentMatchRepository.getByTournament(testTournament1.id, 2, 1);

      expect(limitedMatches).toHaveLength(2);
      expect(offsetMatches).toHaveLength(2);
    });
  });

  describe("getByTournaments", () => {
    it("должен возвращать матчи по нескольким турнирам", async () => {
      await createTestMatch({ tournamentId: testTournament1.id, matchNumber: 1 });
      await createTestMatch({ tournamentId: testTournament2.id, matchNumber: 1 });

      const matches = await tournamentMatchRepository.getByTournaments([testTournament1.id, testTournament2.id]);

      expect(matches).toHaveLength(2);
    });

    it("должен возвращать пустой массив для пустого списка турниров", async () => {
      const matches = await tournamentMatchRepository.getByTournaments([]);
      expect(matches).toHaveLength(0);
    });
  });

  describe("getByCourt", () => {
    it("должен возвращать матчи по корту", async () => {
      await createTestMatch({ courtId: testCourt1.id, matchNumber: 1 });
      await createTestMatch({ courtId: testCourt1.id, matchNumber: 2 });
      await createTestMatch({ courtId: testCourt2.id, matchNumber: 3 });

      const court1Matches = await tournamentMatchRepository.getByCourt(testCourt1.id);
      const court2Matches = await tournamentMatchRepository.getByCourt(testCourt2.id);

      expect(court1Matches).toHaveLength(2);
      expect(court2Matches).toHaveLength(1);
    });

    it("должен поддерживать лимит", async () => {
      await createTestMatch({ courtId: testCourt1.id, matchNumber: 1 });
      await createTestMatch({ courtId: testCourt1.id, matchNumber: 2 });

      const limitedMatches = await tournamentMatchRepository.getByCourt(testCourt1.id, 1);

      expect(limitedMatches).toHaveLength(1);
    });
  });

  describe("getByStatus", () => {
    it("должен возвращать матчи по статусу", async () => {
      await createTestMatch({ status: "upcoming", matchNumber: 1 });
      await createTestMatch({ status: "in_progress", matchNumber: 2 });
      await createTestMatch({ status: "completed", matchNumber: 3 });

      const upcomingMatches = await tournamentMatchRepository.getByStatus("upcoming");
      const inProgressMatches = await tournamentMatchRepository.getByStatus("in_progress");
      const completedMatches = await tournamentMatchRepository.getByStatus("completed");

      expect(upcomingMatches).toHaveLength(1);
      expect(inProgressMatches).toHaveLength(1);
      expect(completedMatches).toHaveLength(1);
    });

    it("должен фильтровать по турниру", async () => {
      await createTestMatch({
        tournamentId: testTournament1.id,
        status: "upcoming",
        matchNumber: 1
      });
      await createTestMatch({
        tournamentId: testTournament2.id,
        status: "upcoming",
        matchNumber: 1
      });

      const tournament1UpcomingMatches = await tournamentMatchRepository.getByStatus("upcoming", testTournament1.id);

      expect(tournament1UpcomingMatches).toHaveLength(1);
      expect(tournament1UpcomingMatches[0].tournamentId).toBe(testTournament1.id);
    });
  });

  describe("getByRound", () => {
    it("должен возвращать матчи по раунду", async () => {
      await createTestMatch({ round: "Round 1", matchNumber: 1 });
      await createTestMatch({ round: "Round 1", matchNumber: 2 });
      await createTestMatch({ round: "Round 2", matchNumber: 3 });

      const round1Matches = await tournamentMatchRepository.getByRound("Round 1");
      const round2Matches = await tournamentMatchRepository.getByRound("Round 2");

      expect(round1Matches).toHaveLength(2);
      expect(round2Matches).toHaveLength(1);
    });

    it("должен фильтровать по турниру", async () => {
      await createTestMatch({
        tournamentId: testTournament1.id,
        round: "Round 1",
        matchNumber: 1
      });
      await createTestMatch({
        tournamentId: testTournament2.id,
        round: "Round 1",
        matchNumber: 1
      });

      const tournament1Round1Matches = await tournamentMatchRepository.getByRound("Round 1", testTournament1.id);

      expect(tournament1Round1Matches).toHaveLength(1);
      expect(tournament1Round1Matches[0].tournamentId).toBe(testTournament1.id);
    });
  });

  describe("getByTimeRange", () => {
    it("должен возвращать матчи по диапазону времени", async () => {
      const now = new Date();
      const startTime1 = new Date(now.getTime() + 1 * 60 * 60 * 1000); // +1 час
      const endTime1 = new Date(now.getTime() + 3 * 60 * 60 * 1000); // +3 часа
      const startTime2 = new Date(now.getTime() + 5 * 60 * 60 * 1000); // +5 часов
      const endTime2 = new Date(now.getTime() + 7 * 60 * 60 * 1000); // +7 часов

      await createTestMatch({
        startTime: startTime1,
        endTime: endTime1,
        matchNumber: 1
      });
      await createTestMatch({
        startTime: startTime2,
        endTime: endTime2,
        matchNumber: 2
      });

      const rangeStart = new Date(now.getTime() + 30 * 60 * 1000); // +30 минут
      const rangeEnd = new Date(now.getTime() + 4 * 60 * 60 * 1000); // +4 часа

      const matchesInRange = await tournamentMatchRepository.getByTimeRange(rangeStart, rangeEnd);

      expect(matchesInRange).toHaveLength(1);
      expect(matchesInRange[0].matchNumber).toBe(1);
    });
  });

  describe("getByTeam", () => {
    it("должен возвращать матчи команды", async () => {
      await createTestMatch({
        winnerTeamId: testTeam1.id,
        loserTeamId: testTeam2.id,
        matchNumber: 1
      });
      await createTestMatch({
        winnerTeamId: testTeam2.id,
        loserTeamId: testTeam1.id,
        matchNumber: 2
      });

      const team1Matches = await tournamentMatchRepository.getByTeam(testTeam1.id);
      const team2Matches = await tournamentMatchRepository.getByTeam(testTeam2.id);

      expect(team1Matches).toHaveLength(2);
      expect(team2Matches).toHaveLength(2);
    });

    it("должен фильтровать по турниру", async () => {
      await createTestMatch({
        tournamentId: testTournament1.id,
        winnerTeamId: testTeam1.id,
        matchNumber: 1
      });

      const team1Tournament1Matches = await tournamentMatchRepository.getByTeam(testTeam1.id, testTournament1.id);

      expect(team1Tournament1Matches).toHaveLength(1);
      expect(team1Tournament1Matches[0].tournamentId).toBe(testTournament1.id);
    });
  });

  describe("getByPlayer", () => {
    it("должен возвращать матчи игрока", async () => {
      await createTestMatch({
        winnerPlayerIds: [testUser1.id, testUser2.id],
        loserPlayerIds: [testUser3.id, testUser4.id],
        winnerTeamId: null,
        loserTeamId: null,
        matchNumber: 1
      });
      await createTestMatch({
        winnerPlayerIds: [testUser3.id, testUser4.id],
        loserPlayerIds: [testUser1.id, testUser2.id],
        winnerTeamId: null,
        loserTeamId: null,
        matchNumber: 2
      });

      const user1Matches = await tournamentMatchRepository.getByPlayer(testUser1.id);
      const user3Matches = await tournamentMatchRepository.getByPlayer(testUser3.id);

      expect(user1Matches).toHaveLength(2);
      expect(user3Matches).toHaveLength(2);
    });
  });

  describe("searchByRound", () => {
    it("должен искать матчи по раунду", async () => {
      await createTestMatch({ round: "Round 1", matchNumber: 1 });
      await createTestMatch({ round: "Round 2", matchNumber: 2 });
      await createTestMatch({ round: "Final", matchNumber: 3 });

      const roundMatches = await tournamentMatchRepository.searchByRound("Round");
      const finalMatches = await tournamentMatchRepository.searchByRound("Final");

      expect(roundMatches).toHaveLength(2);
      expect(finalMatches).toHaveLength(1);
    });
  });

  describe("getCompletedMatches", () => {
    it("должен возвращать только завершенные матчи", async () => {
      await createTestMatch({ status: "completed", matchNumber: 1 });
      await createTestMatch({ status: "upcoming", matchNumber: 2 });

      const completedMatches = await tournamentMatchRepository.getCompletedMatches();

      expect(completedMatches).toHaveLength(1);
      expect(completedMatches[0].status).toBe("completed");
    });
  });

  describe("getUpcomingMatches", () => {
    it("должен возвращать только предстоящие матчи", async () => {
      await createTestMatch({ status: "upcoming", matchNumber: 1 });
      await createTestMatch({ status: "completed", matchNumber: 2 });

      const upcomingMatches = await tournamentMatchRepository.getUpcomingMatches();

      expect(upcomingMatches).toHaveLength(1);
      expect(upcomingMatches[0].status).toBe("upcoming");
    });
  });

  describe("getInProgressMatches", () => {
    it("должен возвращать только матчи в процессе", async () => {
      await createTestMatch({ status: "in_progress", matchNumber: 1 });
      await createTestMatch({ status: "upcoming", matchNumber: 2 });

      const inProgressMatches = await tournamentMatchRepository.getInProgressMatches();

      expect(inProgressMatches).toHaveLength(1);
      expect(inProgressMatches[0].status).toBe("in_progress");
    });
  });

  describe("getMatchesWithoutCourt", () => {
    it("должен возвращать матчи без назначенного корта", async () => {
      await createTestMatch({ courtId: null, matchNumber: 1 });
      await createTestMatch({ courtId: testCourt1.id, matchNumber: 2 });

      const matchesWithoutCourt = await tournamentMatchRepository.getMatchesWithoutCourt();

      expect(matchesWithoutCourt).toHaveLength(1);
      expect(matchesWithoutCourt[0].courtId).toBeNull();
    });
  });

  describe("getMatchesWithCourt", () => {
    it("должен возвращать матчи с назначенным кортом", async () => {
      await createTestMatch({ courtId: testCourt1.id, matchNumber: 1 });
      await createTestMatch({ courtId: null, matchNumber: 2 });

      const matchesWithCourt = await tournamentMatchRepository.getMatchesWithCourt();

      expect(matchesWithCourt).toHaveLength(1);
      expect(matchesWithCourt[0].courtId).toBe(testCourt1.id);
    });
  });

  describe("update", () => {
    it("должен обновлять данные матча", async () => {
      const createdMatch = await createTestMatch();

      const updatedMatch = await tournamentMatchRepository.update(createdMatch.id, {
        round: "Updated Round",
        status: "in_progress",
        score: "6-4, 6-2",
      });

      expect(updatedMatch).toBeDefined();
      expect(updatedMatch?.id).toBe(createdMatch.id);
      expect(updatedMatch?.round).toBe("Updated Round");
      expect(updatedMatch?.status).toBe("in_progress");
      expect(updatedMatch?.score).toBe("6-4, 6-2");
    });

    it("должен возвращать null при обновлении несуществующего матча", async () => {
      const updatedMatch = await tournamentMatchRepository.update("00000000-0000-0000-0000-000000000000", {
        round: "Updated Round",
      });

      expect(updatedMatch).toBeNull();
    });
  });

  describe("updateStatus", () => {
    it("должен обновлять статус матча", async () => {
      const createdMatch = await createTestMatch({ status: "upcoming" });

      const updatedMatch = await tournamentMatchRepository.updateStatus(createdMatch.id, "in_progress");

      expect(updatedMatch).toBeDefined();
      expect(updatedMatch?.status).toBe("in_progress");
    });
  });

  describe("updateCourt", () => {
    it("должен обновлять корт матча", async () => {
      const createdMatch = await createTestMatch({ courtId: testCourt1.id });

      const updatedMatch = await tournamentMatchRepository.updateCourt(createdMatch.id, testCourt2.id);

      expect(updatedMatch).toBeDefined();
      expect(updatedMatch?.courtId).toBe(testCourt2.id);
    });

    it("должен удалять корт при передаче null", async () => {
      const createdMatch = await createTestMatch({ courtId: testCourt1.id });

      const updatedMatch = await tournamentMatchRepository.updateCourt(createdMatch.id, null);

      expect(updatedMatch).toBeDefined();
      expect(updatedMatch?.courtId).toBeNull();
    });
  });

  describe("updateScore", () => {
    it("должен обновлять счет матча", async () => {
      const createdMatch = await createTestMatch();

      const updatedMatch = await tournamentMatchRepository.updateScore(createdMatch.id, "6-4, 6-2");

      expect(updatedMatch).toBeDefined();
      expect(updatedMatch?.score).toBe("6-4, 6-2");
    });
  });

  describe("setTeamResult", () => {
    it("должен устанавливать результат матча для команд", async () => {
      const createdMatch = await createTestMatch({
        status: "in_progress",
        winnerTeamId: null,
        loserTeamId: null,
      });

      const updatedMatch = await tournamentMatchRepository.setTeamResult(
        createdMatch.id,
        testTeam1.id,
        testTeam2.id,
        "6-4, 6-2"
      );

      expect(updatedMatch).toBeDefined();
      expect(updatedMatch?.winnerTeamId).toBe(testTeam1.id);
      expect(updatedMatch?.loserTeamId).toBe(testTeam2.id);
      expect(updatedMatch?.score).toBe("6-4, 6-2");
      expect(updatedMatch?.status).toBe("completed");
      expect(updatedMatch?.winnerPlayerIds).toBeNull();
      expect(updatedMatch?.loserPlayerIds).toBeNull();
    });
  });

  describe("setPlayerResult", () => {
    it("должен устанавливать результат матча для игроков", async () => {
      const createdMatch = await createTestMatch({
        status: "in_progress",
        winnerTeamId: null,
        loserTeamId: null,
      });

      const updatedMatch = await tournamentMatchRepository.setPlayerResult(
        createdMatch.id,
        [testUser1.id, testUser2.id],
        [testUser3.id, testUser4.id],
        "6-4, 6-2"
      );

      expect(updatedMatch).toBeDefined();
      expect(updatedMatch?.winnerPlayerIds).toEqual([testUser1.id, testUser2.id]);
      expect(updatedMatch?.loserPlayerIds).toEqual([testUser3.id, testUser4.id]);
      expect(updatedMatch?.score).toBe("6-4, 6-2");
      expect(updatedMatch?.status).toBe("completed");
      expect(updatedMatch?.winnerTeamId).toBeNull();
      expect(updatedMatch?.loserTeamId).toBeNull();
    });
  });

  describe("delete", () => {
    it("должен удалять матч", async () => {
      const createdMatch = await createTestMatch();

      const result = await tournamentMatchRepository.delete(createdMatch.id);

      expect(result).toBe(true);

      const deletedMatch = await tournamentMatchRepository.getById(createdMatch.id);
      expect(deletedMatch).toBeNull();
    });

    it("должен возвращать false при удалении несуществующего матча", async () => {
      const result = await tournamentMatchRepository.delete("00000000-0000-0000-0000-000000000000");

      expect(result).toBe(false);
    });
  });

  describe("deleteByTournamentAndMatchNumber", () => {
    it("должен удалять матч по турниру и номеру матча", async () => {
      await createTestMatch({ matchNumber: 5 });

      const result = await tournamentMatchRepository.deleteByTournamentAndMatchNumber(testTournament1.id, 5);

      expect(result).toBe(true);

      const deletedMatch = await tournamentMatchRepository.getByTournamentAndMatchNumber(testTournament1.id, 5);
      expect(deletedMatch).toBeNull();
    });

    it("должен возвращать false при удалении несуществующего матча", async () => {
      const result = await tournamentMatchRepository.deleteByTournamentAndMatchNumber(testTournament1.id, 999);

      expect(result).toBe(false);
    });
  });

  describe("getCount", () => {
    it("должен возвращать количество матчей", async () => {
      await createTestMatch({ tournamentId: testTournament1.id, matchNumber: 1 });
      await createTestMatch({ tournamentId: testTournament1.id, matchNumber: 2 });
      await createTestMatch({ tournamentId: testTournament2.id, matchNumber: 1 });

      const totalCount = await tournamentMatchRepository.getCount();
      const tournament1Count = await tournamentMatchRepository.getCount(testTournament1.id);

      expect(totalCount).toBe(3);
      expect(tournament1Count).toBe(2);
    });
  });

  describe("getAll", () => {
    it("должен возвращать все матчи с пагинацией", async () => {
      await createTestMatch({ matchNumber: 1 });
      await createTestMatch({ matchNumber: 2 });
      await createTestMatch({ matchNumber: 3 });

      const allMatches = await tournamentMatchRepository.getAll();
      const limitedMatches = await tournamentMatchRepository.getAll(2);
      const offsetMatches = await tournamentMatchRepository.getAll(2, 1);

      expect(allMatches).toHaveLength(3);
      expect(limitedMatches).toHaveLength(2);
      expect(offsetMatches).toHaveLength(2);
    });
  });

  describe("getStats", () => {
    it("должен возвращать статистику по матчам", async () => {
      await createTestMatch({ status: "completed", matchNumber: 1 });
      await createTestMatch({ status: "upcoming", matchNumber: 2 });
      await createTestMatch({ status: "in_progress", matchNumber: 3 });
      await createTestMatch({ status: "cancelled", matchNumber: 4 });

      const stats = await tournamentMatchRepository.getStats();

      expect(stats.totalMatches).toBe(4);
      expect(stats.completedMatches).toBe(1);
      expect(stats.upcomingMatches).toBe(1);
      expect(stats.inProgressMatches).toBe(1);
      expect(stats.cancelledMatches).toBe(1);
      expect(stats.averageMatchDuration).toBeGreaterThanOrEqual(0);
      expect(stats.averageMatchesPerTournament).toBeGreaterThan(0);
    });

    it("должен фильтровать статистику по турниру", async () => {
      await createTestMatch({ tournamentId: testTournament1.id, status: "completed", matchNumber: 1 });
      await createTestMatch({ tournamentId: testTournament1.id, status: "upcoming", matchNumber: 2 });
      await createTestMatch({ tournamentId: testTournament2.id, status: "completed", matchNumber: 1 });

      const tournament1Stats = await tournamentMatchRepository.getStats(testTournament1.id);

      expect(tournament1Stats.totalMatches).toBe(2);
      expect(tournament1Stats.completedMatches).toBe(1);
      expect(tournament1Stats.upcomingMatches).toBe(1);
      expect(tournament1Stats.averageMatchesPerTournament).toBe(2);
    });
  });

  describe("getWithDetails", () => {
    it("должен возвращать матчи с детальной информацией", async () => {
      await createTestMatch({ matchNumber: 1 });
      await createTestMatch({ matchNumber: 2 });

      const matchesWithDetails = await tournamentMatchRepository.getWithDetails();

      expect(matchesWithDetails).toHaveLength(2);
      expect(matchesWithDetails[0].tournament.name).toBeDefined();
      expect(matchesWithDetails[0].court?.name).toBeDefined();
    });

    it("должен фильтровать по турниру и поддерживать лимит", async () => {
      await createTestMatch({ tournamentId: testTournament1.id, matchNumber: 1 });
      await createTestMatch({ tournamentId: testTournament1.id, matchNumber: 2 });
      await createTestMatch({ tournamentId: testTournament2.id, matchNumber: 1 });

      const tournament1MatchesWithDetails = await tournamentMatchRepository.getWithDetails(testTournament1.id);
      const limitedMatchesWithDetails = await tournamentMatchRepository.getWithDetails(undefined, 1);

      expect(tournament1MatchesWithDetails).toHaveLength(2);
      expect(limitedMatchesWithDetails).toHaveLength(1);
    });
  });

  describe("isMatchNumberTaken", () => {
    it("должен проверять, занят ли номер матча", async () => {
      await createTestMatch({ matchNumber: 5 });

      const isTaken = await tournamentMatchRepository.isMatchNumberTaken(testTournament1.id, 5);
      const isNotTaken = await tournamentMatchRepository.isMatchNumberTaken(testTournament1.id, 6);

      expect(isTaken).toBe(true);
      expect(isNotTaken).toBe(false);
    });

    it("должен исключать матч при проверке (для обновления)", async () => {
      const match = await createTestMatch({ matchNumber: 5 });

      const isTaken = await tournamentMatchRepository.isMatchNumberTaken(testTournament1.id, 5, match.id);

      expect(isTaken).toBe(false);
    });
  });

  describe("getNextMatchNumber", () => {
    it("должен возвращать следующий доступный номер матча", async () => {
      await createTestMatch({ matchNumber: 1 });
      await createTestMatch({ matchNumber: 3 });

      const nextNumber = await tournamentMatchRepository.getNextMatchNumber(testTournament1.id);

      expect(nextNumber).toBe(4);
    });

    it("должен возвращать 1 для турнира без матчей", async () => {
      const nextNumber = await tournamentMatchRepository.getNextMatchNumber(testTournament2.id);

      expect(nextNumber).toBe(1);
    });
  });

  describe("deleteAllByTournament", () => {
    it("должен удалять все матчи турнира", async () => {
      await createTestMatch({ tournamentId: testTournament1.id, matchNumber: 1 });
      await createTestMatch({ tournamentId: testTournament1.id, matchNumber: 2 });
      await createTestMatch({ tournamentId: testTournament2.id, matchNumber: 1 });

      const deletedCount = await tournamentMatchRepository.deleteAllByTournament(testTournament1.id);

      expect(deletedCount).toBe(2);

      const remainingMatches = await tournamentMatchRepository.getByTournament(testTournament1.id);
      expect(remainingMatches).toHaveLength(0);

      const tournament2Matches = await tournamentMatchRepository.getByTournament(testTournament2.id);
      expect(tournament2Matches).toHaveLength(1);
    });
  });

  describe("deleteAllByTeam", () => {
    it("должен удалять все матчи команды", async () => {
      await createTestMatch({
        winnerTeamId: testTeam1.id,
        loserTeamId: testTeam2.id,
        matchNumber: 1
      });
      await createTestMatch({
        winnerTeamId: testTeam2.id,
        loserTeamId: testTeam1.id,
        matchNumber: 2
      });

      const deletedCount = await tournamentMatchRepository.deleteAllByTeam(testTeam1.id);

      expect(deletedCount).toBe(2);

      const remainingMatches = await tournamentMatchRepository.getByTeam(testTeam1.id);
      expect(remainingMatches).toHaveLength(0);
    });
  });

  describe("getGroupedByTournament", () => {
    it("должен возвращать матчи, сгруппированные по турнирам", async () => {
      await createTestMatch({
        tournamentId: testTournament1.id,
        status: "completed",
        winnerTeamId: testTeam1.id,
        matchNumber: 1
      });
      await createTestMatch({
        tournamentId: testTournament1.id,
        status: "upcoming",
        winnerTeamId: testTeam1.id,
        matchNumber: 2
      });
      await createTestMatch({
        tournamentId: testTournament2.id,
        status: "completed",
        winnerTeamId: testTeam1.id,
        matchNumber: 1
      });

      const allGrouped = await tournamentMatchRepository.getGroupedByTournament();
      const team1Grouped = await tournamentMatchRepository.getGroupedByTournament([testTeam1.id]);

      expect(allGrouped).toHaveLength(2);
      const tournament1Group = allGrouped.find(g => g.tournamentId === testTournament1.id);
      expect(tournament1Group?.matchesCount).toBe(2);
      expect(tournament1Group?.completedMatchesCount).toBe(1);
      expect(tournament1Group?.upcomingMatchesCount).toBe(1);

      expect(team1Grouped).toHaveLength(2); // testTeam1 участвует в матчах обоих турниров
    });
  });

  describe("getGroupedByRound", () => {
    it("должен возвращать матчи, сгруппированные по раундам", async () => {
      await createTestMatch({ round: "Round 1", status: "completed", matchNumber: 1 });
      await createTestMatch({ round: "Round 1", status: "upcoming", matchNumber: 2 });
      await createTestMatch({ round: "Round 2", status: "completed", matchNumber: 3 });

      const allGrouped = await tournamentMatchRepository.getGroupedByRound();
      const tournament1Grouped = await tournamentMatchRepository.getGroupedByRound(testTournament1.id);

      expect(allGrouped).toHaveLength(2);
      const round1Group = allGrouped.find(g => g.round === "Round 1");
      expect(round1Group?.matchesCount).toBe(2);
      expect(round1Group?.completedMatchesCount).toBe(1);
      expect(round1Group?.upcomingMatchesCount).toBe(1);

      expect(tournament1Grouped).toHaveLength(2);
    });
  });

  describe("getRecentMatches", () => {
    it("должен возвращать недавние матчи", async () => {
      await createTestMatch({ matchNumber: 1 });
      await createTestMatch({ matchNumber: 2 });

      const recentMatches = await tournamentMatchRepository.getRecentMatches(30);
      const tournament1RecentMatches = await tournamentMatchRepository.getRecentMatches(30, testTournament1.id);

      expect(recentMatches).toHaveLength(2);
      expect(tournament1RecentMatches).toHaveLength(2);
    });
  });

  describe("getMatchesByDays", () => {
    it("должен возвращать матчи по дням", async () => {
      await createTestMatch({ status: "completed", matchNumber: 1 });
      await createTestMatch({ status: "upcoming", matchNumber: 2 });

      const allMatchesByDays = await tournamentMatchRepository.getMatchesByDays();
      const tournament1MatchesByDays = await tournamentMatchRepository.getMatchesByDays(testTournament1.id);

      expect(allMatchesByDays).toHaveLength(1); // все матчи в один день
      expect(allMatchesByDays[0].matchesCount).toBe(2);
      expect(allMatchesByDays[0].completedMatchesCount).toBe(1);
      expect(allMatchesByDays[0].upcomingMatchesCount).toBe(1);

      expect(tournament1MatchesByDays).toHaveLength(1);
      expect(tournament1MatchesByDays[0].matchesCount).toBe(2);
    });
  });

  describe("getConflictingMatches", () => {
    it("должен возвращать конфликтующие матчи по времени и корту", async () => {
      const now = new Date();
      const startTime1 = new Date(now.getTime() + 1 * 60 * 60 * 1000); // +1 час
      const endTime1 = new Date(now.getTime() + 3 * 60 * 60 * 1000); // +3 часа
      const startTime2 = new Date(now.getTime() + 2 * 60 * 60 * 1000); // +2 часа (пересекается)
      const endTime2 = new Date(now.getTime() + 4 * 60 * 60 * 1000); // +4 часа

      await createTestMatch({
        courtId: testCourt1.id,
        startTime: startTime1,
        endTime: endTime1,
        matchNumber: 1
      });

      const conflictingMatches = await tournamentMatchRepository.getConflictingMatches(
        testCourt1.id,
        startTime2,
        endTime2
      );

      expect(conflictingMatches).toHaveLength(1);
      expect(conflictingMatches[0].matchNumber).toBe(1);
    });

    it("должен исключать матч при проверке конфликтов", async () => {
      const now = new Date();
      const startTime = new Date(now.getTime() + 1 * 60 * 60 * 1000);
      const endTime = new Date(now.getTime() + 3 * 60 * 60 * 1000);

      const match = await createTestMatch({
        courtId: testCourt1.id,
        startTime,
        endTime,
        matchNumber: 1
      });

      const conflictingMatches = await tournamentMatchRepository.getConflictingMatches(
        testCourt1.id,
        startTime,
        endTime,
        match.id
      );

      expect(conflictingMatches).toHaveLength(0);
    });
  });

  describe("getMatchesBetweenTeams", () => {
    it("должен возвращать матчи между командами", async () => {
      await createTestMatch({
        winnerTeamId: testTeam1.id,
        loserTeamId: testTeam2.id,
        matchNumber: 1
      });
      await createTestMatch({
        winnerTeamId: testTeam2.id,
        loserTeamId: testTeam1.id,
        matchNumber: 2
      });

      const matchesBetweenTeams = await tournamentMatchRepository.getMatchesBetweenTeams(testTeam1.id, testTeam2.id);

      expect(matchesBetweenTeams).toHaveLength(2);
    });

    it("должен фильтровать по турниру", async () => {
      await createTestMatch({
        tournamentId: testTournament1.id,
        winnerTeamId: testTeam1.id,
        loserTeamId: testTeam2.id,
        matchNumber: 1
      });

      const tournament1MatchesBetweenTeams = await tournamentMatchRepository.getMatchesBetweenTeams(
        testTeam1.id,
        testTeam2.id,
        testTournament1.id
      );

      expect(tournament1MatchesBetweenTeams).toHaveLength(1);
      expect(tournament1MatchesBetweenTeams[0].tournamentId).toBe(testTournament1.id);
    });
  });
});
