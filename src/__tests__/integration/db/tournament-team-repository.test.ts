import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../../../db/schema";
import {
  tournamentTeams,
  tournaments,
  venues,
  users,
  NewTournamentTeam,
  NewTournament,
  NewVenue,
  NewUser,
} from "../../../db/schema";
import { TournamentTeamRepository } from "../../../repositories/tournament-team-repository";
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
const tournamentTeamRepository = new TournamentTeamRepository(db);

describe("TournamentTeamRepository", () => {
  let testVenue: schema.Venue;
  let testUser1: schema.User;
  let testUser2: schema.User;
  let testUser3: schema.User;
  let testUser4: schema.User;
  let testTournament1: schema.Tournament;
  let testTournament2: schema.Tournament;

  // Функция для очистки таблиц перед/после тестов
  const cleanupDatabase = async () => {
    await db.delete(tournamentTeams);
    await db.delete(tournaments);
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
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  // Вспомогательная функция для создания тестовой команды турнира
  const createTestTeam = async (customData: Partial<NewTournamentTeam> = {}): Promise<schema.TournamentTeam> => {
    const defaultTeamData: NewTournamentTeam = {
      tournamentId: testTournament1.id,
      name: "Test Team",
      player1Id: testUser1.id,
      player2Id: testUser2.id,
      ...customData,
    };

    return await tournamentTeamRepository.create(defaultTeamData);
  };

  describe("create", () => {
    it("должен создавать команду турнира", async () => {
      const teamData: NewTournamentTeam = {
        tournamentId: testTournament1.id,
        name: "Test Team",
        player1Id: testUser1.id,
        player2Id: testUser2.id,
      };

      const team = await tournamentTeamRepository.create(teamData);

      expect(team).toBeDefined();
      expect(team.id).toBeDefined();
      expect(team.tournamentId).toBe(testTournament1.id);
      expect(team.name).toBe("Test Team");
      expect(team.player1Id).toBe(testUser1.id);
      expect(team.player2Id).toBe(testUser2.id);
    });

    it("должен создавать одиночную команду", async () => {
      const teamData: NewTournamentTeam = {
        tournamentId: testTournament1.id,
        name: "Solo Team",
        player1Id: testUser1.id,
        player2Id: null,
      };

      const team = await tournamentTeamRepository.create(teamData);

      expect(team.player2Id).toBeNull();
    });
  });

  describe("getById", () => {
    it("должен возвращать команду турнира по ID", async () => {
      const createdTeam = await createTestTeam();

      const team = await tournamentTeamRepository.getById(createdTeam.id);

      expect(team).toBeDefined();
      expect(team?.id).toBe(createdTeam.id);
      expect(team?.name).toBe(createdTeam.name);
    });

    it("должен возвращать null, если команда не найдена", async () => {
      const team = await tournamentTeamRepository.getById("00000000-0000-0000-0000-000000000000");

      expect(team).toBeNull();
    });
  });

  describe("getByTournamentAndName", () => {
    it("должен возвращать команду по турниру и названию", async () => {
      const createdTeam = await createTestTeam({ name: "Unique Team" });

      const team = await tournamentTeamRepository.getByTournamentAndName(
        testTournament1.id,
        "Unique Team"
      );

      expect(team).toBeDefined();
      expect(team?.id).toBe(createdTeam.id);
    });

    it("должен возвращать null, если команда не найдена", async () => {
      const team = await tournamentTeamRepository.getByTournamentAndName(
        testTournament1.id,
        "Non-existent Team"
      );

      expect(team).toBeNull();
    });
  });

  describe("getByTournament", () => {
    it("должен возвращать все команды турнира", async () => {
      await createTestTeam({ name: "Team 1", player1Id: testUser1.id, player2Id: testUser2.id });
      await createTestTeam({ name: "Team 2", player1Id: testUser3.id, player2Id: testUser4.id });
      await createTestTeam({
        tournamentId: testTournament2.id,
        name: "Team 3",
        player1Id: testUser1.id,
        player2Id: null
      });

      const tournament1Teams = await tournamentTeamRepository.getByTournament(testTournament1.id);
      const tournament2Teams = await tournamentTeamRepository.getByTournament(testTournament2.id);

      expect(tournament1Teams).toHaveLength(2);
      expect(tournament1Teams.every(t => t.tournamentId === testTournament1.id)).toBe(true);

      expect(tournament2Teams).toHaveLength(1);
      expect(tournament2Teams[0].tournamentId).toBe(testTournament2.id);
    });
  });

  describe("getByTournaments", () => {
    it("должен возвращать команды по нескольким турнирам", async () => {
      await createTestTeam({ tournamentId: testTournament1.id, name: "Team 1" });
      await createTestTeam({ tournamentId: testTournament2.id, name: "Team 2" });

      const teams = await tournamentTeamRepository.getByTournaments([testTournament1.id, testTournament2.id]);

      expect(teams).toHaveLength(2);
    });

    it("должен возвращать пустой массив для пустого списка турниров", async () => {
      const teams = await tournamentTeamRepository.getByTournaments([]);
      expect(teams).toHaveLength(0);
    });
  });

  describe("getByPlayer", () => {
    it("должен возвращать команды, в которых участвует игрок", async () => {
      await createTestTeam({ name: "Team 1", player1Id: testUser1.id, player2Id: testUser2.id });
      await createTestTeam({ name: "Team 2", player1Id: testUser3.id, player2Id: testUser1.id });
      await createTestTeam({ name: "Team 3", player1Id: testUser3.id, player2Id: testUser4.id });

      const user1Teams = await tournamentTeamRepository.getByPlayer(testUser1.id);
      const user3Teams = await tournamentTeamRepository.getByPlayer(testUser3.id);

      expect(user1Teams).toHaveLength(2);
      expect(user3Teams).toHaveLength(2);
    });

    it("должен фильтровать по турниру", async () => {
      await createTestTeam({
        tournamentId: testTournament1.id,
        name: "Team 1",
        player1Id: testUser1.id
      });
      await createTestTeam({
        tournamentId: testTournament2.id,
        name: "Team 2",
        player1Id: testUser1.id
      });

      const tournament1Teams = await tournamentTeamRepository.getByPlayer(testUser1.id, testTournament1.id);

      expect(tournament1Teams).toHaveLength(1);
      expect(tournament1Teams[0].tournamentId).toBe(testTournament1.id);
    });
  });

  describe("getByPlayers", () => {
    it("должен возвращать команды по нескольким игрокам", async () => {
      await createTestTeam({ name: "Team 1", player1Id: testUser1.id, player2Id: testUser2.id });
      await createTestTeam({ name: "Team 2", player1Id: testUser3.id, player2Id: testUser4.id });

      const teams = await tournamentTeamRepository.getByPlayers([testUser1.id, testUser3.id]);

      expect(teams).toHaveLength(2);
    });

    it("должен возвращать пустой массив для пустого списка игроков", async () => {
      const teams = await tournamentTeamRepository.getByPlayers([]);
      expect(teams).toHaveLength(0);
    });
  });

  describe("searchByName", () => {
    it("должен искать команды по названию", async () => {
      await createTestTeam({ name: "Alpha Team" });
      await createTestTeam({ name: "Beta Team" });
      await createTestTeam({ name: "Gamma Squad" });

      const teamResults = await tournamentTeamRepository.searchByName("Team");
      const alphaResults = await tournamentTeamRepository.searchByName("Alpha");

      expect(teamResults).toHaveLength(2);
      expect(alphaResults).toHaveLength(1);
      expect(alphaResults[0].name).toBe("Alpha Team");
    });

    it("должен фильтровать по турниру при поиске", async () => {
      await createTestTeam({
        tournamentId: testTournament1.id,
        name: "Alpha Team"
      });
      await createTestTeam({
        tournamentId: testTournament2.id,
        name: "Alpha Squad"
      });

      const tournament1Results = await tournamentTeamRepository.searchByName("Alpha", testTournament1.id);

      expect(tournament1Results).toHaveLength(1);
      expect(tournament1Results[0].name).toBe("Alpha Team");
    });
  });

  describe("getSoloTeams", () => {
    it("должен возвращать только одиночные команды", async () => {
      await createTestTeam({ name: "Solo Team", player1Id: testUser1.id, player2Id: null });
      await createTestTeam({ name: "Double Team", player1Id: testUser2.id, player2Id: testUser3.id });

      const soloTeams = await tournamentTeamRepository.getSoloTeams();

      expect(soloTeams).toHaveLength(1);
      expect(soloTeams[0].name).toBe("Solo Team");
      expect(soloTeams[0].player2Id).toBeNull();
    });

    it("должен фильтровать по турниру", async () => {
      await createTestTeam({
        tournamentId: testTournament1.id,
        name: "Solo Team 1",
        player1Id: testUser1.id,
        player2Id: null
      });
      await createTestTeam({
        tournamentId: testTournament2.id,
        name: "Solo Team 2",
        player1Id: testUser2.id,
        player2Id: null
      });

      const tournament1SoloTeams = await tournamentTeamRepository.getSoloTeams(testTournament1.id);

      expect(tournament1SoloTeams).toHaveLength(1);
      expect(tournament1SoloTeams[0].name).toBe("Solo Team 1");
    });
  });

  describe("getDoubleTeams", () => {
    it("должен возвращать только парные команды", async () => {
      await createTestTeam({ name: "Solo Team", player1Id: testUser1.id, player2Id: null });
      await createTestTeam({ name: "Double Team", player1Id: testUser2.id, player2Id: testUser3.id });

      const doubleTeams = await tournamentTeamRepository.getDoubleTeams();

      expect(doubleTeams).toHaveLength(1);
      expect(doubleTeams[0].name).toBe("Double Team");
      expect(doubleTeams[0].player2Id).toBe(testUser3.id);
    });

    it("должен фильтровать по турниру", async () => {
      await createTestTeam({
        tournamentId: testTournament1.id,
        name: "Double Team 1",
        player1Id: testUser1.id,
        player2Id: testUser2.id
      });
      await createTestTeam({
        tournamentId: testTournament2.id,
        name: "Double Team 2",
        player1Id: testUser3.id,
        player2Id: testUser4.id
      });

      const tournament1DoubleTeams = await tournamentTeamRepository.getDoubleTeams(testTournament1.id);

      expect(tournament1DoubleTeams).toHaveLength(1);
      expect(tournament1DoubleTeams[0].name).toBe("Double Team 1");
    });
  });

  describe("update", () => {
    it("должен обновлять данные команды турнира", async () => {
      const createdTeam = await createTestTeam();

      const updatedTeam = await tournamentTeamRepository.update(createdTeam.id, {
        name: "Updated Team Name",
        player2Id: testUser3.id,
      });

      expect(updatedTeam).toBeDefined();
      expect(updatedTeam?.id).toBe(createdTeam.id);
      expect(updatedTeam?.name).toBe("Updated Team Name");
      expect(updatedTeam?.player2Id).toBe(testUser3.id);
    });

    it("должен возвращать null при обновлении несуществующей команды", async () => {
      const updatedTeam = await tournamentTeamRepository.update("00000000-0000-0000-0000-000000000000", {
        name: "Updated Name",
      });

      expect(updatedTeam).toBeNull();
    });
  });

  describe("updateName", () => {
    it("должен обновлять название команды", async () => {
      const createdTeam = await createTestTeam({ name: "Original Name" });

      const updatedTeam = await tournamentTeamRepository.updateName(createdTeam.id, "New Name");

      expect(updatedTeam).toBeDefined();
      expect(updatedTeam?.name).toBe("New Name");
    });

    it("должен возвращать null при обновлении несуществующей команды", async () => {
      const updatedTeam = await tournamentTeamRepository.updateName("00000000-0000-0000-0000-000000000000", "New Name");

      expect(updatedTeam).toBeNull();
    });
  });

  describe("updatePlayer2", () => {
    it("должен обновлять второго игрока команды", async () => {
      const createdTeam = await createTestTeam({ player2Id: testUser2.id });

      const updatedTeam = await tournamentTeamRepository.updatePlayer2(createdTeam.id, testUser3.id);

      expect(updatedTeam).toBeDefined();
      expect(updatedTeam?.player2Id).toBe(testUser3.id);
    });

    it("должен удалять второго игрока при передаче null", async () => {
      const createdTeam = await createTestTeam({ player2Id: testUser2.id });

      const updatedTeam = await tournamentTeamRepository.updatePlayer2(createdTeam.id, null);

      expect(updatedTeam).toBeDefined();
      expect(updatedTeam?.player2Id).toBeNull();
    });

    it("должен возвращать null при обновлении несуществующей команды", async () => {
      const updatedTeam = await tournamentTeamRepository.updatePlayer2("00000000-0000-0000-0000-000000000000", testUser3.id);

      expect(updatedTeam).toBeNull();
    });
  });

  describe("delete", () => {
    it("должен удалять команду турнира", async () => {
      const createdTeam = await createTestTeam();

      const result = await tournamentTeamRepository.delete(createdTeam.id);

      expect(result).toBe(true);

      const deletedTeam = await tournamentTeamRepository.getById(createdTeam.id);
      expect(deletedTeam).toBeNull();
    });

    it("должен возвращать false при удалении несуществующей команды", async () => {
      const result = await tournamentTeamRepository.delete("00000000-0000-0000-0000-000000000000");

      expect(result).toBe(false);
    });
  });

  describe("deleteByTournamentAndName", () => {
    it("должен удалять команду по турниру и названию", async () => {
      await createTestTeam({ name: "Team to Delete" });

      const result = await tournamentTeamRepository.deleteByTournamentAndName(testTournament1.id, "Team to Delete");

      expect(result).toBe(true);

      const deletedTeam = await tournamentTeamRepository.getByTournamentAndName(testTournament1.id, "Team to Delete");
      expect(deletedTeam).toBeNull();
    });

    it("должен возвращать false при удалении несуществующей команды", async () => {
      const result = await tournamentTeamRepository.deleteByTournamentAndName(testTournament1.id, "Non-existent Team");

      expect(result).toBe(false);
    });
  });

  describe("getCount", () => {
    it("должен возвращать количество команд", async () => {
      await createTestTeam({ tournamentId: testTournament1.id, name: "Team 1" });
      await createTestTeam({ tournamentId: testTournament1.id, name: "Team 2" });
      await createTestTeam({ tournamentId: testTournament2.id, name: "Team 3" });

      const totalCount = await tournamentTeamRepository.getCount();
      const tournament1Count = await tournamentTeamRepository.getCount(testTournament1.id);

      expect(totalCount).toBe(3);
      expect(tournament1Count).toBe(2);
    });
  });

  describe("getAll", () => {
    it("должен возвращать все команды с пагинацией", async () => {
      // Создаем 3 команды
      await createTestTeam({ name: "Team 1" });
      await createTestTeam({ name: "Team 2" });
      await createTestTeam({ name: "Team 3" });

      const allTeams = await tournamentTeamRepository.getAll();
      const limitedTeams = await tournamentTeamRepository.getAll(2);
      const offsetTeams = await tournamentTeamRepository.getAll(2, 1);

      expect(allTeams).toHaveLength(3);
      expect(limitedTeams).toHaveLength(2);
      expect(offsetTeams).toHaveLength(2);
    });
  });

  describe("getStats", () => {
    it("должен возвращать статистику по командам", async () => {
      await createTestTeam({
        tournamentId: testTournament1.id,
        name: "Solo Team",
        player1Id: testUser1.id,
        player2Id: null
      });
      await createTestTeam({
        tournamentId: testTournament1.id,
        name: "Double Team 1",
        player1Id: testUser2.id,
        player2Id: testUser3.id
      });
      await createTestTeam({
        tournamentId: testTournament2.id,
        name: "Double Team 2",
        player1Id: testUser1.id,
        player2Id: testUser4.id
      });

      const allStats = await tournamentTeamRepository.getStats();
      const tournament1Stats = await tournamentTeamRepository.getStats(testTournament1.id);

      expect(allStats.totalTeams).toBe(3);
      expect(allStats.soloTeams).toBe(1);
      expect(allStats.doubleTeams).toBe(2);
      expect(allStats.averageTeamsPerTournament).toBe(1.5); // 3 команды / 2 турнира

      expect(tournament1Stats.totalTeams).toBe(2);
      expect(tournament1Stats.soloTeams).toBe(1);
      expect(tournament1Stats.doubleTeams).toBe(1);
      expect(tournament1Stats.averageTeamsPerTournament).toBe(2);
    });
  });

  describe("getWithDetails", () => {
    it("должен возвращать команды с детальной информацией", async () => {
      await createTestTeam({ name: "Team with Details", player1Id: testUser1.id, player2Id: testUser2.id });
      await createTestTeam({ name: "Solo Team", player1Id: testUser3.id, player2Id: null });

      const allTeamsWithDetails = await tournamentTeamRepository.getWithDetails();
      const tournament1TeamsWithDetails = await tournamentTeamRepository.getWithDetails(testTournament1.id);
      const limitedTeamsWithDetails = await tournamentTeamRepository.getWithDetails(undefined, 1);

      expect(allTeamsWithDetails).toHaveLength(2);
      expect(allTeamsWithDetails[0].player1.firstName).toBeDefined();
      expect(allTeamsWithDetails[0].tournament.name).toBeDefined();

      expect(tournament1TeamsWithDetails).toHaveLength(2);
      expect(limitedTeamsWithDetails).toHaveLength(1);

      // Проверяем команду с партнером
      const teamWithPartner = allTeamsWithDetails.find(t => t.name === "Team with Details");
      expect(teamWithPartner?.player2?.firstName).toBeDefined();

      // Проверяем одиночную команду
      const soloTeam = allTeamsWithDetails.find(t => t.name === "Solo Team");
      expect(soloTeam?.player2?.firstName).toBeNull();
    });
  });

  describe("isNameTaken", () => {
    it("должен проверять, занято ли название команды", async () => {
      await createTestTeam({ name: "Taken Name" });

      const isTaken = await tournamentTeamRepository.isNameTaken(testTournament1.id, "Taken Name");
      const isNotTaken = await tournamentTeamRepository.isNameTaken(testTournament1.id, "Available Name");

      expect(isTaken).toBe(true);
      expect(isNotTaken).toBe(false);
    });

    it("должен исключать команду при проверке (для обновления)", async () => {
      const team = await createTestTeam({ name: "Team Name" });

      const isTaken = await tournamentTeamRepository.isNameTaken(testTournament1.id, "Team Name", team.id);

      expect(isTaken).toBe(false);
    });
  });

  describe("getPartner", () => {
    it("должен возвращать партнера игрока в команде", async () => {
      const team = await createTestTeam({ player1Id: testUser1.id, player2Id: testUser2.id });

      const user1Partner = await tournamentTeamRepository.getPartner(team.id, testUser1.id);
      const user2Partner = await tournamentTeamRepository.getPartner(team.id, testUser2.id);

      expect(user1Partner).toBe(testUser2.id);
      expect(user2Partner).toBe(testUser1.id);
    });

    it("должен возвращать null для игрока не в команде", async () => {
      const team = await createTestTeam({ player1Id: testUser1.id, player2Id: testUser2.id });

      const user3Partner = await tournamentTeamRepository.getPartner(team.id, testUser3.id);

      expect(user3Partner).toBeNull();
    });

    it("должен возвращать null для несуществующей команды", async () => {
      const partner = await tournamentTeamRepository.getPartner("00000000-0000-0000-0000-000000000000", testUser1.id);

      expect(partner).toBeNull();
    });
  });

  describe("isPlayerInTeam", () => {
    it("должен проверять, является ли пользователь членом команды", async () => {
      const team = await createTestTeam({ player1Id: testUser1.id, player2Id: testUser2.id });

      const isUser1InTeam = await tournamentTeamRepository.isPlayerInTeam(team.id, testUser1.id);
      const isUser2InTeam = await tournamentTeamRepository.isPlayerInTeam(team.id, testUser2.id);
      const isUser3InTeam = await tournamentTeamRepository.isPlayerInTeam(team.id, testUser3.id);

      expect(isUser1InTeam).toBe(true);
      expect(isUser2InTeam).toBe(true);
      expect(isUser3InTeam).toBe(false);
    });

    it("должен возвращать false для несуществующей команды", async () => {
      const isInTeam = await tournamentTeamRepository.isPlayerInTeam("00000000-0000-0000-0000-000000000000", testUser1.id);

      expect(isInTeam).toBe(false);
    });
  });

  describe("deleteAllByTournament", () => {
    it("должен удалять все команды турнира", async () => {
      await createTestTeam({ tournamentId: testTournament1.id, name: "Team 1" });
      await createTestTeam({ tournamentId: testTournament1.id, name: "Team 2" });
      await createTestTeam({ tournamentId: testTournament2.id, name: "Team 3" });

      const deletedCount = await tournamentTeamRepository.deleteAllByTournament(testTournament1.id);

      expect(deletedCount).toBe(2);

      const remainingTeams = await tournamentTeamRepository.getByTournament(testTournament1.id);
      expect(remainingTeams).toHaveLength(0);

      const tournament2Teams = await tournamentTeamRepository.getByTournament(testTournament2.id);
      expect(tournament2Teams).toHaveLength(1);
    });
  });

  describe("deleteAllByPlayer", () => {
    it("должен удалять все команды игрока", async () => {
      await createTestTeam({ name: "Team 1", player1Id: testUser1.id, player2Id: testUser2.id });
      await createTestTeam({ name: "Team 2", player1Id: testUser3.id, player2Id: testUser1.id });
      await createTestTeam({ name: "Team 3", player1Id: testUser3.id, player2Id: testUser4.id });

      const deletedCount = await tournamentTeamRepository.deleteAllByPlayer(testUser1.id);

      expect(deletedCount).toBe(2);

      const remainingTeams = await tournamentTeamRepository.getByPlayer(testUser1.id);
      expect(remainingTeams).toHaveLength(0);

      const user3Teams = await tournamentTeamRepository.getByPlayer(testUser3.id);
      expect(user3Teams).toHaveLength(1);
    });
  });

  describe("getGroupedByTournament", () => {
    it("должен возвращать команды, сгруппированные по турнирам", async () => {
      await createTestTeam({ tournamentId: testTournament1.id, name: "Solo Team", player1Id: testUser1.id, player2Id: null });
      await createTestTeam({ tournamentId: testTournament1.id, name: "Double Team", player1Id: testUser2.id, player2Id: testUser3.id });
      await createTestTeam({ tournamentId: testTournament2.id, name: "Another Team", player1Id: testUser4.id, player2Id: null });

      const allGrouped = await tournamentTeamRepository.getGroupedByTournament();
      const user1And2Grouped = await tournamentTeamRepository.getGroupedByTournament([testUser1.id, testUser2.id]);

      expect(allGrouped).toHaveLength(2);
      const tournament1Group = allGrouped.find(g => g.tournamentId === testTournament1.id);
      expect(tournament1Group?.teamsCount).toBe(2);
      expect(tournament1Group?.soloTeamsCount).toBe(1);
      expect(tournament1Group?.doubleTeamsCount).toBe(1);

      expect(user1And2Grouped).toHaveLength(1); // только tournament1 имеет команды из списка
    });
  });

  describe("getTopPlayers", () => {
    it("должен возвращать топ игроков по количеству команд", async () => {
      // testUser1: 2 команды (как player1 и как player2)
      await createTestTeam({ name: "Team 1", player1Id: testUser1.id, player2Id: testUser2.id });
      await createTestTeam({ name: "Team 2", player1Id: testUser3.id, player2Id: testUser1.id });

      // testUser2: 1 команда
      // testUser3: 1 команда

      const topPlayers = await tournamentTeamRepository.getTopPlayers(5);

      expect(topPlayers).toHaveLength(3);
      expect(topPlayers[0].teamsCount).toBe(2); // testUser1
      expect(topPlayers[1].teamsCount).toBe(1); // testUser2 или testUser3
      expect(topPlayers[2].teamsCount).toBe(1); // testUser2 или testUser3
    });

    it("должен фильтровать по турниру", async () => {
      await createTestTeam({ tournamentId: testTournament1.id, name: "Team 1", player1Id: testUser1.id, player2Id: testUser2.id });
      await createTestTeam({ tournamentId: testTournament2.id, name: "Team 2", player1Id: testUser3.id, player2Id: testUser4.id });

      const tournament1TopPlayers = await tournamentTeamRepository.getTopPlayers(5, testTournament1.id);

      expect(tournament1TopPlayers).toHaveLength(2); // testUser1 и testUser2
      expect(tournament1TopPlayers.every(p => p.teamsCount === 1)).toBe(true);
    });
  });

  describe("getRecentTeams", () => {
    it("должен возвращать недавно созданные команды", async () => {
      await createTestTeam({ name: "Recent Team 1" });
      await createTestTeam({ name: "Recent Team 2" });

      const recentTeams = await tournamentTeamRepository.getRecentTeams(30);
      const tournament1RecentTeams = await tournamentTeamRepository.getRecentTeams(30, testTournament1.id);

      expect(recentTeams).toHaveLength(2);
      expect(tournament1RecentTeams).toHaveLength(2);
    });
  });

  describe("getTeamsByDays", () => {
    it("должен возвращать команды по дням создания", async () => {
      await createTestTeam({ name: "Team 1" });
      await createTestTeam({ name: "Team 2" });

      const allTeamsByDays = await tournamentTeamRepository.getTeamsByDays();
      const tournament1TeamsByDays = await tournamentTeamRepository.getTeamsByDays(testTournament1.id);

      expect(allTeamsByDays).toHaveLength(1); // все команды созданы в один день
      expect(allTeamsByDays[0].teamsCount).toBe(2);

      expect(tournament1TeamsByDays).toHaveLength(1);
      expect(tournament1TeamsByDays[0].teamsCount).toBe(2);
    });
  });
});
