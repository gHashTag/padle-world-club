import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../../../db/schema";
import {
  tournamentParticipants,
  tournaments,
  venues,
  users,
  NewTournamentParticipant,
  NewTournament,
  NewVenue,
  NewUser,
} from "../../../db/schema";
import { TournamentParticipantRepository } from "../../../repositories/tournament-participant-repository";
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
const tournamentParticipantRepository = new TournamentParticipantRepository(db);

describe("TournamentParticipantRepository", () => {
  let testVenue: schema.Venue;
  let testUser1: schema.User;
  let testUser2: schema.User;
  let testUser3: schema.User;
  let testTournament1: schema.Tournament;
  let testTournament2: schema.Tournament;

  // Функция для очистки таблиц перед/после тестов
  const cleanupDatabase = async () => {
    await db.delete(tournamentParticipants);
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

  // Вспомогательная функция для создания тестового участника турнира
  const createTestParticipant = async (customData: Partial<NewTournamentParticipant> = {}): Promise<schema.TournamentParticipant> => {
    const defaultParticipantData: NewTournamentParticipant = {
      tournamentId: testTournament1.id,
      userId: testUser1.id,
      status: "registered",
      ...customData,
    };

    return await tournamentParticipantRepository.create(defaultParticipantData);
  };

  describe("create", () => {
    it("должен создавать участника турнира", async () => {
      const participantData: NewTournamentParticipant = {
        tournamentId: testTournament1.id,
        userId: testUser1.id,
        status: "registered",
      };

      const participant = await tournamentParticipantRepository.create(participantData);

      expect(participant).toBeDefined();
      expect(participant.id).toBeDefined();
      expect(participant.tournamentId).toBe(testTournament1.id);
      expect(participant.userId).toBe(testUser1.id);
      expect(participant.status).toBe("registered");
      expect(participant.registrationDate).toBeDefined();
    });

    it("должен создавать участника с партнером", async () => {
      const participantData: NewTournamentParticipant = {
        tournamentId: testTournament2.id,
        userId: testUser1.id,
        status: "registered",
        partnerUserId: testUser2.id,
      };

      const participant = await tournamentParticipantRepository.create(participantData);

      expect(participant.partnerUserId).toBe(testUser2.id);
    });

    it("должен создавать участников с разными статусами", async () => {
      const registeredParticipant = await createTestParticipant({ status: "registered" });
      const checkedInParticipant = await createTestParticipant({
        userId: testUser2.id,
        status: "checked_in"
      });
      const withdrawnParticipant = await createTestParticipant({
        userId: testUser3.id,
        status: "withdrawn"
      });

      expect(registeredParticipant.status).toBe("registered");
      expect(checkedInParticipant.status).toBe("checked_in");
      expect(withdrawnParticipant.status).toBe("withdrawn");
    });
  });

  describe("getById", () => {
    it("должен возвращать участника турнира по ID", async () => {
      const createdParticipant = await createTestParticipant();

      const participant = await tournamentParticipantRepository.getById(createdParticipant.id);

      expect(participant).toBeDefined();
      expect(participant?.id).toBe(createdParticipant.id);
      expect(participant?.tournamentId).toBe(createdParticipant.tournamentId);
      expect(participant?.userId).toBe(createdParticipant.userId);
    });

    it("должен возвращать null, если участник не найден", async () => {
      const participant = await tournamentParticipantRepository.getById("00000000-0000-0000-0000-000000000000");

      expect(participant).toBeNull();
    });
  });

  describe("getByTournamentAndUser", () => {
    it("должен возвращать участника по турниру и пользователю", async () => {
      const createdParticipant = await createTestParticipant();

      const participant = await tournamentParticipantRepository.getByTournamentAndUser(
        testTournament1.id,
        testUser1.id
      );

      expect(participant).toBeDefined();
      expect(participant?.id).toBe(createdParticipant.id);
    });

    it("должен возвращать null, если участник не найден", async () => {
      const participant = await tournamentParticipantRepository.getByTournamentAndUser(
        testTournament1.id,
        testUser2.id
      );

      expect(participant).toBeNull();
    });
  });

  describe("getByTournament", () => {
    it("должен возвращать всех участников турнира", async () => {
      await createTestParticipant({ userId: testUser1.id, status: "registered" });
      await createTestParticipant({ userId: testUser2.id, status: "checked_in" });
      await createTestParticipant({ userId: testUser3.id, status: "withdrawn" });

      const allParticipants = await tournamentParticipantRepository.getByTournament(testTournament1.id);
      const registeredParticipants = await tournamentParticipantRepository.getByTournament(testTournament1.id, "registered");

      expect(allParticipants).toHaveLength(3);
      expect(allParticipants.every(p => p.tournamentId === testTournament1.id)).toBe(true);

      expect(registeredParticipants).toHaveLength(1);
      expect(registeredParticipants[0].status).toBe("registered");
    });
  });

  describe("getByUser", () => {
    it("должен возвращать все турниры пользователя", async () => {
      await createTestParticipant({ tournamentId: testTournament1.id, userId: testUser1.id, status: "registered" });
      await createTestParticipant({ tournamentId: testTournament2.id, userId: testUser1.id, status: "checked_in" });
      await createTestParticipant({ tournamentId: testTournament1.id, userId: testUser2.id, status: "registered" });

      const user1Participations = await tournamentParticipantRepository.getByUser(testUser1.id);
      const user1RegisteredParticipations = await tournamentParticipantRepository.getByUser(testUser1.id, "registered");

      expect(user1Participations).toHaveLength(2);
      expect(user1Participations.every(p => p.userId === testUser1.id)).toBe(true);

      expect(user1RegisteredParticipations).toHaveLength(1);
      expect(user1RegisteredParticipations[0].status).toBe("registered");
    });
  });

  describe("getByStatus", () => {
    it("должен возвращать участников по статусу", async () => {
      await createTestParticipant({ userId: testUser1.id, status: "registered" });
      await createTestParticipant({ userId: testUser2.id, status: "checked_in" });
      await createTestParticipant({ userId: testUser3.id, status: "withdrawn" });

      const registeredParticipants = await tournamentParticipantRepository.getByStatus("registered");
      const checkedInParticipants = await tournamentParticipantRepository.getByStatus("checked_in");
      const withdrawnParticipants = await tournamentParticipantRepository.getByStatus("withdrawn");

      expect(registeredParticipants).toHaveLength(1);
      expect(registeredParticipants[0].status).toBe("registered");

      expect(checkedInParticipants).toHaveLength(1);
      expect(checkedInParticipants[0].status).toBe("checked_in");

      expect(withdrawnParticipants).toHaveLength(1);
      expect(withdrawnParticipants[0].status).toBe("withdrawn");
    });
  });

  describe("getByTournaments", () => {
    it("должен возвращать участников по нескольким турнирам", async () => {
      await createTestParticipant({ tournamentId: testTournament1.id, userId: testUser1.id });
      await createTestParticipant({ tournamentId: testTournament2.id, userId: testUser2.id });

      const participants = await tournamentParticipantRepository.getByTournaments([testTournament1.id, testTournament2.id]);

      expect(participants).toHaveLength(2);
    });

    it("должен возвращать пустой массив для пустого списка турниров", async () => {
      const participants = await tournamentParticipantRepository.getByTournaments([]);
      expect(participants).toHaveLength(0);
    });
  });

  describe("getByUsers", () => {
    it("должен возвращать участников по нескольким пользователям", async () => {
      await createTestParticipant({ userId: testUser1.id });
      await createTestParticipant({ userId: testUser2.id });

      const participants = await tournamentParticipantRepository.getByUsers([testUser1.id, testUser2.id]);

      expect(participants).toHaveLength(2);
    });

    it("должен возвращать пустой массив для пустого списка пользователей", async () => {
      const participants = await tournamentParticipantRepository.getByUsers([]);
      expect(participants).toHaveLength(0);
    });
  });

  describe("getByRegistrationDateRange", () => {
    it("должен возвращать участников по диапазону дат регистрации", async () => {
      const now = new Date();
      const startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000); // вчера
      const endDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // завтра

      await createTestParticipant();

      const participantsInRange = await tournamentParticipantRepository.getByRegistrationDateRange(startDate, endDate);

      expect(participantsInRange).toHaveLength(1);
    });
  });

  describe("getWithPartners", () => {
    it("должен возвращать участников с партнерами", async () => {
      await createTestParticipant({ userId: testUser1.id, partnerUserId: testUser2.id });
      await createTestParticipant({ userId: testUser3.id, partnerUserId: null });

      const allParticipantsWithPartners = await tournamentParticipantRepository.getWithPartners();
      const tournament1ParticipantsWithPartners = await tournamentParticipantRepository.getWithPartners(testTournament1.id);

      expect(allParticipantsWithPartners).toHaveLength(1);
      expect(allParticipantsWithPartners[0].partnerUserId).toBe(testUser2.id);

      expect(tournament1ParticipantsWithPartners).toHaveLength(1);
    });
  });

  describe("getSoloParticipants", () => {
    it("должен возвращать участников без партнеров", async () => {
      await createTestParticipant({ userId: testUser1.id, partnerUserId: testUser2.id });
      await createTestParticipant({ userId: testUser3.id, partnerUserId: null });

      const allSoloParticipants = await tournamentParticipantRepository.getSoloParticipants();
      const tournament1SoloParticipants = await tournamentParticipantRepository.getSoloParticipants(testTournament1.id);

      expect(allSoloParticipants).toHaveLength(1);
      expect(allSoloParticipants[0].partnerUserId).toBeNull();

      expect(tournament1SoloParticipants).toHaveLength(1);
    });
  });

  describe("getActiveParticipants", () => {
    it("должен возвращать активных участников", async () => {
      await createTestParticipant({ userId: testUser1.id, status: "registered" });
      await createTestParticipant({ userId: testUser2.id, status: "checked_in" });
      await createTestParticipant({ userId: testUser3.id, status: "withdrawn" });

      const allActiveParticipants = await tournamentParticipantRepository.getActiveParticipants();
      const tournament1ActiveParticipants = await tournamentParticipantRepository.getActiveParticipants(testTournament1.id);

      expect(allActiveParticipants).toHaveLength(2); // registered и checked_in
      expect(tournament1ActiveParticipants).toHaveLength(2);
    });
  });

  describe("update", () => {
    it("должен обновлять данные участника турнира", async () => {
      const createdParticipant = await createTestParticipant();

      const updatedParticipant = await tournamentParticipantRepository.update(createdParticipant.id, {
        status: "checked_in",
        partnerUserId: testUser2.id,
      });

      expect(updatedParticipant).toBeDefined();
      expect(updatedParticipant?.id).toBe(createdParticipant.id);
      expect(updatedParticipant?.status).toBe("checked_in");
      expect(updatedParticipant?.partnerUserId).toBe(testUser2.id);
    });

    it("должен возвращать null при обновлении несуществующего участника", async () => {
      const updatedParticipant = await tournamentParticipantRepository.update("00000000-0000-0000-0000-000000000000", {
        status: "checked_in",
      });

      expect(updatedParticipant).toBeNull();
    });
  });

  describe("updateStatus", () => {
    it("должен обновлять статус участника турнира", async () => {
      const createdParticipant = await createTestParticipant({ status: "registered" });

      const updatedParticipant = await tournamentParticipantRepository.updateStatus(createdParticipant.id, "checked_in");

      expect(updatedParticipant).toBeDefined();
      expect(updatedParticipant?.status).toBe("checked_in");
    });

    it("должен возвращать null при обновлении статуса несуществующего участника", async () => {
      const updatedParticipant = await tournamentParticipantRepository.updateStatus("00000000-0000-0000-0000-000000000000", "checked_in");

      expect(updatedParticipant).toBeNull();
    });
  });

  describe("updateStatusByTournamentAndUser", () => {
    it("должен обновлять статус участника по турниру и пользователю", async () => {
      await createTestParticipant({ status: "registered" });

      const updatedParticipant = await tournamentParticipantRepository.updateStatusByTournamentAndUser(
        testTournament1.id,
        testUser1.id,
        "checked_in"
      );

      expect(updatedParticipant).toBeDefined();
      expect(updatedParticipant?.status).toBe("checked_in");
    });

    it("должен возвращать null при обновлении несуществующего участника", async () => {
      const updatedParticipant = await tournamentParticipantRepository.updateStatusByTournamentAndUser(
        testTournament1.id,
        testUser2.id,
        "checked_in"
      );

      expect(updatedParticipant).toBeNull();
    });
  });

  describe("delete", () => {
    it("должен удалять участника турнира", async () => {
      const createdParticipant = await createTestParticipant();

      const result = await tournamentParticipantRepository.delete(createdParticipant.id);

      expect(result).toBe(true);

      const deletedParticipant = await tournamentParticipantRepository.getById(createdParticipant.id);
      expect(deletedParticipant).toBeNull();
    });

    it("должен возвращать false при удалении несуществующего участника", async () => {
      const result = await tournamentParticipantRepository.delete("00000000-0000-0000-0000-000000000000");

      expect(result).toBe(false);
    });
  });

  describe("deleteByTournamentAndUser", () => {
    it("должен удалять участника по турниру и пользователю", async () => {
      await createTestParticipant();

      const result = await tournamentParticipantRepository.deleteByTournamentAndUser(testTournament1.id, testUser1.id);

      expect(result).toBe(true);

      const deletedParticipant = await tournamentParticipantRepository.getByTournamentAndUser(testTournament1.id, testUser1.id);
      expect(deletedParticipant).toBeNull();
    });

    it("должен возвращать false при удалении несуществующего участника", async () => {
      const result = await tournamentParticipantRepository.deleteByTournamentAndUser(testTournament1.id, testUser2.id);

      expect(result).toBe(false);
    });
  });

  describe("getCount", () => {
    it("должен возвращать количество участников", async () => {
      await createTestParticipant({ tournamentId: testTournament1.id, userId: testUser1.id, status: "registered" });
      await createTestParticipant({ tournamentId: testTournament1.id, userId: testUser2.id, status: "checked_in" });
      await createTestParticipant({ tournamentId: testTournament2.id, userId: testUser3.id, status: "registered" });

      const totalCount = await tournamentParticipantRepository.getCount();
      const tournament1Count = await tournamentParticipantRepository.getCount(testTournament1.id);
      const registeredCount = await tournamentParticipantRepository.getCount(undefined, "registered");

      expect(totalCount).toBe(3);
      expect(tournament1Count).toBe(2);
      expect(registeredCount).toBe(2);
    });
  });

  describe("getAll", () => {
    it("должен возвращать всех участников с пагинацией", async () => {
      // Создаем 3 участников
      await createTestParticipant({ userId: testUser1.id });
      await createTestParticipant({ userId: testUser2.id });
      await createTestParticipant({ userId: testUser3.id });

      const allParticipants = await tournamentParticipantRepository.getAll();
      const limitedParticipants = await tournamentParticipantRepository.getAll(2);
      const offsetParticipants = await tournamentParticipantRepository.getAll(2, 1);

      expect(allParticipants).toHaveLength(3);
      expect(limitedParticipants).toHaveLength(2);
      expect(offsetParticipants).toHaveLength(2);
    });
  });

  describe("getStats", () => {
    it("должен возвращать статистику по участникам", async () => {
      await createTestParticipant({
        tournamentId: testTournament1.id,
        userId: testUser1.id,
        status: "registered",
        partnerUserId: testUser2.id
      });
      await createTestParticipant({
        tournamentId: testTournament1.id,
        userId: testUser2.id,
        status: "checked_in",
        partnerUserId: null
      });
      await createTestParticipant({
        tournamentId: testTournament2.id,
        userId: testUser3.id,
        status: "withdrawn",
        partnerUserId: null
      });

      const allStats = await tournamentParticipantRepository.getStats();
      const tournament1Stats = await tournamentParticipantRepository.getStats(testTournament1.id);

      expect(allStats.totalParticipants).toBe(3);
      expect(allStats.registeredParticipants).toBe(1);
      expect(allStats.checkedInParticipants).toBe(1);
      expect(allStats.withdrawnParticipants).toBe(1);
      expect(allStats.participantsWithPartners).toBe(1);
      expect(allStats.soloParticipants).toBe(2);

      expect(tournament1Stats.totalParticipants).toBe(2);
      expect(tournament1Stats.registeredParticipants).toBe(1);
      expect(tournament1Stats.checkedInParticipants).toBe(1);
      expect(tournament1Stats.withdrawnParticipants).toBe(0);
    });
  });

  describe("getWithDetails", () => {
    it("должен возвращать участников с детальной информацией", async () => {
      await createTestParticipant({ userId: testUser1.id, partnerUserId: testUser2.id });
      await createTestParticipant({ userId: testUser3.id, partnerUserId: null });

      const allParticipantsWithDetails = await tournamentParticipantRepository.getWithDetails();
      const tournament1ParticipantsWithDetails = await tournamentParticipantRepository.getWithDetails(testTournament1.id);
      const user1ParticipantsWithDetails = await tournamentParticipantRepository.getWithDetails(undefined, testUser1.id);
      const limitedParticipantsWithDetails = await tournamentParticipantRepository.getWithDetails(undefined, undefined, 1);

      expect(allParticipantsWithDetails).toHaveLength(2);
      expect(allParticipantsWithDetails[0].user.firstName).toBeDefined();
      expect(allParticipantsWithDetails[0].tournament.name).toBeDefined();

      expect(tournament1ParticipantsWithDetails).toHaveLength(2);
      expect(user1ParticipantsWithDetails).toHaveLength(1);
      expect(limitedParticipantsWithDetails).toHaveLength(1);
    });
  });

  describe("isUserRegistered", () => {
    it("должен проверять, зарегистрирован ли пользователь в турнире", async () => {
      await createTestParticipant({ userId: testUser1.id });

      const isUser1Registered = await tournamentParticipantRepository.isUserRegistered(testTournament1.id, testUser1.id);
      const isUser2Registered = await tournamentParticipantRepository.isUserRegistered(testTournament1.id, testUser2.id);

      expect(isUser1Registered).toBe(true);
      expect(isUser2Registered).toBe(false);
    });
  });

  describe("getPartner", () => {
    it("должен возвращать партнера участника", async () => {
      await createTestParticipant({ userId: testUser1.id, partnerUserId: testUser2.id });
      await createTestParticipant({ userId: testUser2.id, partnerUserId: testUser1.id });

      const user1Partner = await tournamentParticipantRepository.getPartner(testTournament1.id, testUser1.id);

      expect(user1Partner).toBeDefined();
      expect(user1Partner?.userId).toBe(testUser2.id);
    });

    it("должен возвращать null, если у участника нет партнера", async () => {
      await createTestParticipant({ userId: testUser1.id, partnerUserId: null });

      const user1Partner = await tournamentParticipantRepository.getPartner(testTournament1.id, testUser1.id);

      expect(user1Partner).toBeNull();
    });
  });

  describe("bulkUpdateStatus", () => {
    it("должен массово обновлять статус участников", async () => {
      const participant1 = await createTestParticipant({ userId: testUser1.id, status: "registered" });
      const participant2 = await createTestParticipant({ userId: testUser2.id, status: "registered" });
      const participant3 = await createTestParticipant({ userId: testUser3.id, status: "checked_in" });

      const updatedCount = await tournamentParticipantRepository.bulkUpdateStatus(
        [participant1.id, participant2.id],
        "checked_in"
      );

      expect(updatedCount).toBe(2);

      const updatedParticipant1 = await tournamentParticipantRepository.getById(participant1.id);
      const updatedParticipant2 = await tournamentParticipantRepository.getById(participant2.id);
      const unchangedParticipant3 = await tournamentParticipantRepository.getById(participant3.id);

      expect(updatedParticipant1?.status).toBe("checked_in");
      expect(updatedParticipant2?.status).toBe("checked_in");
      expect(unchangedParticipant3?.status).toBe("checked_in");
    });

    it("должен возвращать 0 для пустого массива ID", async () => {
      const updatedCount = await tournamentParticipantRepository.bulkUpdateStatus([], "checked_in");
      expect(updatedCount).toBe(0);
    });
  });

  describe("deleteAllByTournament", () => {
    it("должен удалять всех участников турнира", async () => {
      await createTestParticipant({ tournamentId: testTournament1.id, userId: testUser1.id });
      await createTestParticipant({ tournamentId: testTournament1.id, userId: testUser2.id });
      await createTestParticipant({ tournamentId: testTournament2.id, userId: testUser3.id });

      const deletedCount = await tournamentParticipantRepository.deleteAllByTournament(testTournament1.id);

      expect(deletedCount).toBe(2);

      const remainingParticipants = await tournamentParticipantRepository.getByTournament(testTournament1.id);
      expect(remainingParticipants).toHaveLength(0);

      const tournament2Participants = await tournamentParticipantRepository.getByTournament(testTournament2.id);
      expect(tournament2Participants).toHaveLength(1);
    });
  });

  describe("deleteAllByUser", () => {
    it("должен удалять все участия пользователя", async () => {
      await createTestParticipant({ tournamentId: testTournament1.id, userId: testUser1.id });
      await createTestParticipant({ tournamentId: testTournament2.id, userId: testUser1.id });
      await createTestParticipant({ tournamentId: testTournament1.id, userId: testUser2.id });

      const deletedCount = await tournamentParticipantRepository.deleteAllByUser(testUser1.id);

      expect(deletedCount).toBe(2);

      const remainingParticipations = await tournamentParticipantRepository.getByUser(testUser1.id);
      expect(remainingParticipations).toHaveLength(0);

      const user2Participations = await tournamentParticipantRepository.getByUser(testUser2.id);
      expect(user2Participations).toHaveLength(1);
    });
  });

  describe("getGroupedByTournament", () => {
    it("должен возвращать участников, сгруппированных по турнирам", async () => {
      await createTestParticipant({ tournamentId: testTournament1.id, userId: testUser1.id, status: "registered" });
      await createTestParticipant({ tournamentId: testTournament1.id, userId: testUser2.id, status: "checked_in" });
      await createTestParticipant({ tournamentId: testTournament2.id, userId: testUser3.id, status: "withdrawn" });

      const allGrouped = await tournamentParticipantRepository.getGroupedByTournament();
      const user1And2Grouped = await tournamentParticipantRepository.getGroupedByTournament([testUser1.id, testUser2.id]);

      expect(allGrouped).toHaveLength(2);
      const tournament1Group = allGrouped.find(g => g.tournamentId === testTournament1.id);
      expect(tournament1Group?.participantsCount).toBe(2);
      expect(tournament1Group?.registeredCount).toBe(1);
      expect(tournament1Group?.checkedInCount).toBe(1);

      expect(user1And2Grouped).toHaveLength(1); // только tournament1 имеет участников из списка
    });
  });

  describe("getTopParticipants", () => {
    it("должен возвращать топ участников по количеству участий", async () => {
      // testUser1: 2 участия
      await createTestParticipant({ tournamentId: testTournament1.id, userId: testUser1.id, status: "registered" });
      await createTestParticipant({ tournamentId: testTournament2.id, userId: testUser1.id, status: "checked_in" });

      // testUser2: 1 участие
      await createTestParticipant({ tournamentId: testTournament1.id, userId: testUser2.id, status: "registered" });

      const topParticipants = await tournamentParticipantRepository.getTopParticipants(5);
      const topRegisteredParticipants = await tournamentParticipantRepository.getTopParticipants(5, "registered");

      expect(topParticipants).toHaveLength(2);
      expect(topParticipants[0].participationsCount).toBe(2); // testUser1
      expect(topParticipants[1].participationsCount).toBe(1); // testUser2

      expect(topRegisteredParticipants).toHaveLength(2);
      expect(topRegisteredParticipants[0].registeredCount).toBe(1);
    });
  });

  describe("getRecentRegistrations", () => {
    it("должен возвращать недавние регистрации", async () => {
      await createTestParticipant({ userId: testUser1.id });
      await createTestParticipant({ userId: testUser2.id });

      const recentRegistrations = await tournamentParticipantRepository.getRecentRegistrations(30);
      const tournament1RecentRegistrations = await tournamentParticipantRepository.getRecentRegistrations(30, testTournament1.id);

      expect(recentRegistrations).toHaveLength(2);
      expect(tournament1RecentRegistrations).toHaveLength(2);
    });
  });

  describe("getRegistrationsByDays", () => {
    it("должен возвращать регистрации по дням", async () => {
      await createTestParticipant({ userId: testUser1.id });
      await createTestParticipant({ userId: testUser2.id });

      const allRegistrationsByDays = await tournamentParticipantRepository.getRegistrationsByDays();
      const tournament1RegistrationsByDays = await tournamentParticipantRepository.getRegistrationsByDays(testTournament1.id);

      expect(allRegistrationsByDays).toHaveLength(1); // все регистрации в один день
      expect(allRegistrationsByDays[0].registrationsCount).toBe(2);

      expect(tournament1RegistrationsByDays).toHaveLength(1);
      expect(tournament1RegistrationsByDays[0].registrationsCount).toBe(2);
    });
  });
});
