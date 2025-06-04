import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../../../db/schema";
import {
  tournaments,
  venues,
  NewTournament,
  NewVenue,
} from "../../../db/schema";
import { TournamentRepository } from "../../../repositories/tournament-repository";
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
const tournamentRepository = new TournamentRepository(db);

describe("TournamentRepository", () => {
  let testVenue1: schema.Venue;
  let testVenue2: schema.Venue;

  // Функция для очистки таблиц перед/после тестов
  const cleanupDatabase = async () => {
    await db.delete(tournaments);
    await db.delete(venues);
  };

  beforeEach(async () => {
    await cleanupDatabase();

    // Создаем тестовые площадки
    const venueData1: NewVenue = {
      name: "Test Venue 1",
      address: "123 Test St",
      city: "Test City",
      country: "Test Country",
      isActive: true,
    };
    [testVenue1] = await db.insert(venues).values(venueData1).returning();

    const venueData2: NewVenue = {
      name: "Test Venue 2",
      address: "456 Test Ave",
      city: "Test City 2",
      country: "Test Country",
      isActive: true,
    };
    [testVenue2] = await db.insert(venues).values(venueData2).returning();
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  // Вспомогательная функция для создания тестового турнира
  const createTestTournament = async (customData: Partial<NewTournament> = {}): Promise<schema.Tournament> => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() + 7); // через неделю
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1); // на следующий день

    const defaultTournamentData: NewTournament = {
      venueId: testVenue1.id,
      name: "Test Tournament",
      description: "Test tournament description",
      tournamentType: "singles_elimination",
      skillLevelCategory: "intermediate",
      startDate,
      endDate,
      registrationFee: "50.00",
      currency: "USD",
      maxParticipants: 16,
      status: "upcoming",
      rulesUrl: "https://example.com/rules",
      ...customData,
    };

    return await tournamentRepository.create(defaultTournamentData);
  };

  describe("create", () => {
    it("должен создавать турнир", async () => {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 7);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 1);

      const tournamentData: NewTournament = {
        venueId: testVenue1.id,
        name: "Championship Tournament",
        description: "Annual championship",
        tournamentType: "doubles_round_robin",
        skillLevelCategory: "advanced",
        startDate,
        endDate,
        registrationFee: "100.00",
        currency: "EUR",
        maxParticipants: 32,
        status: "registration_open",
        rulesUrl: "https://example.com/championship-rules",
      };

      const tournament = await tournamentRepository.create(tournamentData);

      expect(tournament).toBeDefined();
      expect(tournament.id).toBeDefined();
      expect(tournament.venueId).toBe(testVenue1.id);
      expect(tournament.name).toBe("Championship Tournament");
      expect(tournament.tournamentType).toBe("doubles_round_robin");
      expect(tournament.skillLevelCategory).toBe("advanced");
      expect(tournament.registrationFee).toBe("100.00");
      expect(tournament.currency).toBe("EUR");
      expect(tournament.maxParticipants).toBe(32);
      expect(tournament.status).toBe("registration_open");
    });

    it("должен создавать турнир с разными типами и статусами", async () => {
      const singlesTournament = await createTestTournament({
        tournamentType: "singles_elimination",
        status: "upcoming"
      });
      const doublesTournament = await createTestTournament({
        tournamentType: "doubles_round_robin",
        status: "registration_open"
      });
      const otherTournament = await createTestTournament({
        tournamentType: "other",
        status: "in_progress"
      });

      expect(singlesTournament.tournamentType).toBe("singles_elimination");
      expect(doublesTournament.tournamentType).toBe("doubles_round_robin");
      expect(otherTournament.tournamentType).toBe("other");
    });
  });

  describe("getById", () => {
    it("должен возвращать турнир по ID", async () => {
      const createdTournament = await createTestTournament();

      const tournament = await tournamentRepository.getById(createdTournament.id);

      expect(tournament).toBeDefined();
      expect(tournament?.id).toBe(createdTournament.id);
      expect(tournament?.name).toBe(createdTournament.name);
    });

    it("должен возвращать null, если турнир не найден", async () => {
      const tournament = await tournamentRepository.getById("00000000-0000-0000-0000-000000000000");

      expect(tournament).toBeNull();
    });
  });

  describe("getByVenue", () => {
    it("должен возвращать все турниры площадки", async () => {
      await createTestTournament({ venueId: testVenue1.id, status: "upcoming" });
      await createTestTournament({ venueId: testVenue1.id, status: "registration_open" });
      await createTestTournament({ venueId: testVenue2.id, status: "upcoming" });

      const venue1Tournaments = await tournamentRepository.getByVenue(testVenue1.id);
      const venue1UpcomingTournaments = await tournamentRepository.getByVenue(testVenue1.id, "upcoming");

      expect(venue1Tournaments).toHaveLength(2);
      expect(venue1Tournaments.every(t => t.venueId === testVenue1.id)).toBe(true);

      expect(venue1UpcomingTournaments).toHaveLength(1);
      expect(venue1UpcomingTournaments[0].status).toBe("upcoming");
    });
  });

  describe("getByStatus", () => {
    it("должен возвращать турниры по статусу", async () => {
      await createTestTournament({ status: "upcoming" });
      await createTestTournament({ status: "registration_open" });
      await createTestTournament({ status: "in_progress" });

      const upcomingTournaments = await tournamentRepository.getByStatus("upcoming");
      const registrationOpenTournaments = await tournamentRepository.getByStatus("registration_open");
      const inProgressTournaments = await tournamentRepository.getByStatus("in_progress");

      expect(upcomingTournaments).toHaveLength(1);
      expect(upcomingTournaments[0].status).toBe("upcoming");

      expect(registrationOpenTournaments).toHaveLength(1);
      expect(registrationOpenTournaments[0].status).toBe("registration_open");

      expect(inProgressTournaments).toHaveLength(1);
      expect(inProgressTournaments[0].status).toBe("in_progress");
    });
  });

  describe("getByType", () => {
    it("должен возвращать турниры по типу", async () => {
      await createTestTournament({ tournamentType: "singles_elimination" });
      await createTestTournament({ tournamentType: "doubles_round_robin" });
      await createTestTournament({ tournamentType: "other" });

      const singlesTournaments = await tournamentRepository.getByType("singles_elimination");
      const doublesTournaments = await tournamentRepository.getByType("doubles_round_robin");
      const otherTournaments = await tournamentRepository.getByType("other");

      expect(singlesTournaments).toHaveLength(1);
      expect(singlesTournaments[0].tournamentType).toBe("singles_elimination");

      expect(doublesTournaments).toHaveLength(1);
      expect(doublesTournaments[0].tournamentType).toBe("doubles_round_robin");

      expect(otherTournaments).toHaveLength(1);
      expect(otherTournaments[0].tournamentType).toBe("other");
    });
  });

  describe("getBySkillLevel", () => {
    it("должен возвращать турниры по уровню навыков", async () => {
      await createTestTournament({ skillLevelCategory: "beginner" });
      await createTestTournament({ skillLevelCategory: "intermediate" });
      await createTestTournament({ skillLevelCategory: "advanced" });
      await createTestTournament({ skillLevelCategory: "professional" });

      const beginnerTournaments = await tournamentRepository.getBySkillLevel("beginner");
      const intermediateTournaments = await tournamentRepository.getBySkillLevel("intermediate");
      const advancedTournaments = await tournamentRepository.getBySkillLevel("advanced");
      const professionalTournaments = await tournamentRepository.getBySkillLevel("professional");

      expect(beginnerTournaments).toHaveLength(1);
      expect(beginnerTournaments[0].skillLevelCategory).toBe("beginner");

      expect(intermediateTournaments).toHaveLength(1);
      expect(intermediateTournaments[0].skillLevelCategory).toBe("intermediate");

      expect(advancedTournaments).toHaveLength(1);
      expect(advancedTournaments[0].skillLevelCategory).toBe("advanced");

      expect(professionalTournaments).toHaveLength(1);
      expect(professionalTournaments[0].skillLevelCategory).toBe("professional");
    });
  });

  describe("getByVenues", () => {
    it("должен возвращать турниры по нескольким площадкам", async () => {
      await createTestTournament({ venueId: testVenue1.id });
      await createTestTournament({ venueId: testVenue2.id });

      const tournaments = await tournamentRepository.getByVenues([testVenue1.id, testVenue2.id]);

      expect(tournaments).toHaveLength(2);
    });

    it("должен возвращать пустой массив для пустого списка площадок", async () => {
      const tournaments = await tournamentRepository.getByVenues([]);
      expect(tournaments).toHaveLength(0);
    });
  });

  describe("getByDateRange", () => {
    it("должен возвращать турниры по диапазону дат", async () => {
      const now = new Date();
      const startDate = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000); // через 5 дней
      const endDate = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000); // через 10 дней

      await createTestTournament({
        startDate: new Date(now.getTime() + 6 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      });

      const tournamentsInRange = await tournamentRepository.getByDateRange(startDate, endDate);

      expect(tournamentsInRange).toHaveLength(1);
    });
  });

  describe("getByFeeRange", () => {
    it("должен возвращать турниры по диапазону регистрационного взноса", async () => {
      await createTestTournament({ registrationFee: "25.00" });
      await createTestTournament({ registrationFee: "50.00" });
      await createTestTournament({ registrationFee: "100.00" });

      const cheapTournaments = await tournamentRepository.getByFeeRange(20, 60);
      const expensiveTournaments = await tournamentRepository.getByFeeRange(80, 120);

      expect(cheapTournaments).toHaveLength(2); // 25.00 и 50.00
      expect(expensiveTournaments).toHaveLength(1); // 100.00
    });
  });

  describe("searchByName", () => {
    it("должен находить турниры по названию", async () => {
      await createTestTournament({ name: "Championship Tournament" });
      await createTestTournament({ name: "Beginner Cup" });
      await createTestTournament({ name: "Advanced Championship" });

      const championshipTournaments = await tournamentRepository.searchByName("Championship");
      const cupTournaments = await tournamentRepository.searchByName("Cup");

      expect(championshipTournaments).toHaveLength(2);
      expect(cupTournaments).toHaveLength(1);
    });
  });

  describe("getActiveTournaments", () => {
    it("должен возвращать активные турниры", async () => {
      await createTestTournament({ status: "upcoming" });
      await createTestTournament({ status: "registration_open" });
      await createTestTournament({ status: "in_progress" });
      await createTestTournament({ status: "completed" });
      await createTestTournament({ status: "cancelled" });

      const allActiveTournaments = await tournamentRepository.getActiveTournaments();
      const venue1ActiveTournaments = await tournamentRepository.getActiveTournaments(testVenue1.id);

      expect(allActiveTournaments).toHaveLength(3); // upcoming, registration_open, in_progress
      expect(venue1ActiveTournaments).toHaveLength(3);
    });
  });

  describe("getCompletedTournaments", () => {
    it("должен возвращать завершенные турниры", async () => {
      await createTestTournament({ status: "completed" });
      await createTestTournament({ status: "completed", venueId: testVenue2.id });
      await createTestTournament({ status: "upcoming" });

      const allCompletedTournaments = await tournamentRepository.getCompletedTournaments();
      const venue1CompletedTournaments = await tournamentRepository.getCompletedTournaments(testVenue1.id);
      const limitedCompletedTournaments = await tournamentRepository.getCompletedTournaments(undefined, 1);

      expect(allCompletedTournaments).toHaveLength(2);
      expect(venue1CompletedTournaments).toHaveLength(1);
      expect(limitedCompletedTournaments).toHaveLength(1);
    });
  });

  describe("getUpcomingTournaments", () => {
    it("должен возвращать предстоящие турниры", async () => {
      await createTestTournament({ status: "upcoming" });
      await createTestTournament({ status: "registration_open" });
      await createTestTournament({ status: "completed" });

      const allUpcomingTournaments = await tournamentRepository.getUpcomingTournaments();
      const venue1UpcomingTournaments = await tournamentRepository.getUpcomingTournaments(testVenue1.id);
      const limitedUpcomingTournaments = await tournamentRepository.getUpcomingTournaments(undefined, 1);

      expect(allUpcomingTournaments).toHaveLength(2); // upcoming и registration_open
      expect(venue1UpcomingTournaments).toHaveLength(2);
      expect(limitedUpcomingTournaments).toHaveLength(1);
    });
  });

  describe("update", () => {
    it("должен обновлять данные турнира", async () => {
      const createdTournament = await createTestTournament();

      const updatedTournament = await tournamentRepository.update(createdTournament.id, {
        name: "Updated Tournament Name",
        registrationFee: "75.00",
        maxParticipants: 24,
      });

      expect(updatedTournament).toBeDefined();
      expect(updatedTournament?.id).toBe(createdTournament.id);
      expect(updatedTournament?.name).toBe("Updated Tournament Name");
      expect(updatedTournament?.registrationFee).toBe("75.00");
      expect(updatedTournament?.maxParticipants).toBe(24);
    });

    it("должен возвращать null при обновлении несуществующего турнира", async () => {
      const updatedTournament = await tournamentRepository.update("00000000-0000-0000-0000-000000000000", {
        name: "Updated Name",
      });

      expect(updatedTournament).toBeNull();
    });
  });

  describe("updateStatus", () => {
    it("должен обновлять статус турнира", async () => {
      const createdTournament = await createTestTournament({ status: "upcoming" });

      const updatedTournament = await tournamentRepository.updateStatus(createdTournament.id, "registration_open");

      expect(updatedTournament).toBeDefined();
      expect(updatedTournament?.status).toBe("registration_open");
    });

    it("должен возвращать null при обновлении статуса несуществующего турнира", async () => {
      const updatedTournament = await tournamentRepository.updateStatus("00000000-0000-0000-0000-000000000000", "completed");

      expect(updatedTournament).toBeNull();
    });
  });

  describe("delete", () => {
    it("должен удалять турнир", async () => {
      const createdTournament = await createTestTournament();

      const result = await tournamentRepository.delete(createdTournament.id);

      expect(result).toBe(true);

      const deletedTournament = await tournamentRepository.getById(createdTournament.id);
      expect(deletedTournament).toBeNull();
    });

    it("должен возвращать false при удалении несуществующего турнира", async () => {
      const result = await tournamentRepository.delete("00000000-0000-0000-0000-000000000000");

      expect(result).toBe(false);
    });
  });

  describe("getCount", () => {
    it("должен возвращать количество турниров", async () => {
      await createTestTournament({ venueId: testVenue1.id, status: "upcoming" });
      await createTestTournament({ venueId: testVenue1.id, status: "registration_open" });
      await createTestTournament({ venueId: testVenue2.id, status: "upcoming" });

      const totalCount = await tournamentRepository.getCount();
      const venue1Count = await tournamentRepository.getCount(testVenue1.id);
      const upcomingCount = await tournamentRepository.getCount(undefined, "upcoming");

      expect(totalCount).toBe(3);
      expect(venue1Count).toBe(2);
      expect(upcomingCount).toBe(2);
    });
  });

  describe("getAll", () => {
    it("должен возвращать все турниры с пагинацией", async () => {
      // Создаем 3 турнира
      await createTestTournament({ name: "Tournament 1" });
      await createTestTournament({ name: "Tournament 2" });
      await createTestTournament({ name: "Tournament 3" });

      const allTournaments = await tournamentRepository.getAll();
      const limitedTournaments = await tournamentRepository.getAll(2);
      const offsetTournaments = await tournamentRepository.getAll(2, 1);

      expect(allTournaments).toHaveLength(3);
      expect(limitedTournaments).toHaveLength(2);
      expect(offsetTournaments).toHaveLength(2);
    });
  });

  describe("getStats", () => {
    it("должен возвращать статистику по турнирам", async () => {
      await createTestTournament({
        venueId: testVenue1.id,
        status: "upcoming",
        registrationFee: "50.00",
        maxParticipants: 16
      });
      await createTestTournament({
        venueId: testVenue1.id,
        status: "registration_open",
        registrationFee: "100.00",
        maxParticipants: 32
      });
      await createTestTournament({
        venueId: testVenue2.id,
        status: "completed",
        registrationFee: "75.00",
        maxParticipants: 24
      });

      const allStats = await tournamentRepository.getStats();
      const venue1Stats = await tournamentRepository.getStats(testVenue1.id);

      expect(allStats.totalTournaments).toBe(3);
      expect(allStats.upcomingTournaments).toBe(1);
      expect(allStats.registrationOpenTournaments).toBe(1);
      expect(allStats.completedTournaments).toBe(1);
      expect(parseFloat(allStats.averageRegistrationFee)).toBeCloseTo(75, 1); // (50 + 100 + 75) / 3
      expect(allStats.totalParticipantsCapacity).toBe(72); // 16 + 32 + 24

      expect(venue1Stats.totalTournaments).toBe(2);
      expect(venue1Stats.upcomingTournaments).toBe(1);
      expect(venue1Stats.registrationOpenTournaments).toBe(1);
      expect(venue1Stats.completedTournaments).toBe(0);
    });
  });

  describe("getWithVenueDetails", () => {
    it("должен возвращать турниры с информацией о площадке", async () => {
      await createTestTournament({ venueId: testVenue1.id });
      await createTestTournament({ venueId: testVenue2.id });

      const allTournamentsWithDetails = await tournamentRepository.getWithVenueDetails();
      const venue1TournamentsWithDetails = await tournamentRepository.getWithVenueDetails(testVenue1.id);
      const limitedTournamentsWithDetails = await tournamentRepository.getWithVenueDetails(undefined, 1);

      expect(allTournamentsWithDetails).toHaveLength(2);
      expect(allTournamentsWithDetails[0].venue.name).toBeDefined();
      expect(allTournamentsWithDetails[0].venue.city).toBeDefined();

      expect(venue1TournamentsWithDetails).toHaveLength(1);
      expect(venue1TournamentsWithDetails[0].venue.name).toBe("Test Venue 1");

      expect(limitedTournamentsWithDetails).toHaveLength(1);
    });
  });

  describe("getByParticipantsRange", () => {
    it("должен возвращать турниры по диапазону количества участников", async () => {
      await createTestTournament({ maxParticipants: 8 });
      await createTestTournament({ maxParticipants: 16 });
      await createTestTournament({ maxParticipants: 32 });

      const smallTournaments = await tournamentRepository.getByParticipantsRange(5, 20);
      const largeTournaments = await tournamentRepository.getByParticipantsRange(25, 40);

      expect(smallTournaments).toHaveLength(2); // 8 и 16
      expect(largeTournaments).toHaveLength(1); // 32
    });
  });

  describe("getTournamentsStartingSoon", () => {
    it("должен возвращать турниры, которые начинаются в ближайшие дни", async () => {
      const now = new Date();
      const soonDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // через 3 дня
      const laterDate = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000); // через 10 дней

      await createTestTournament({
        startDate: soonDate,
        endDate: new Date(soonDate.getTime() + 24 * 60 * 60 * 1000)
      });
      await createTestTournament({
        startDate: laterDate,
        endDate: new Date(laterDate.getTime() + 24 * 60 * 60 * 1000)
      });

      const soonTournaments = await tournamentRepository.getTournamentsStartingSoon(7);

      expect(soonTournaments).toHaveLength(1);
    });
  });

  describe("getByCurrency", () => {
    it("должен возвращать турниры по валюте", async () => {
      await createTestTournament({ currency: "USD" });
      await createTestTournament({ currency: "EUR" });
      await createTestTournament({ currency: "USD" });

      const usdTournaments = await tournamentRepository.getByCurrency("USD");
      const eurTournaments = await tournamentRepository.getByCurrency("EUR");

      expect(usdTournaments).toHaveLength(2);
      expect(eurTournaments).toHaveLength(1);
    });
  });

  describe("getFreeTournaments", () => {
    it("должен возвращать бесплатные турниры", async () => {
      await createTestTournament({ registrationFee: "0.00" });
      await createTestTournament({ registrationFee: "50.00" });
      await createTestTournament({ registrationFee: "0.00", venueId: testVenue2.id });

      const allFreeTournaments = await tournamentRepository.getFreeTournaments();
      const venue1FreeTournaments = await tournamentRepository.getFreeTournaments(testVenue1.id);

      expect(allFreeTournaments).toHaveLength(2);
      expect(venue1FreeTournaments).toHaveLength(1);
    });
  });

  describe("getTournamentsWithRules", () => {
    it("должен возвращать турниры с правилами", async () => {
      await createTestTournament({ rulesUrl: "https://example.com/rules1" });
      await createTestTournament({ rulesUrl: null });
      await createTestTournament({ rulesUrl: "https://example.com/rules2", venueId: testVenue2.id });

      const allTournamentsWithRules = await tournamentRepository.getTournamentsWithRules();
      const venue1TournamentsWithRules = await tournamentRepository.getTournamentsWithRules(testVenue1.id);

      expect(allTournamentsWithRules).toHaveLength(2);
      expect(venue1TournamentsWithRules).toHaveLength(1);
    });
  });

  describe("bulkUpdateStatus", () => {
    it("должен массово обновлять статус турниров", async () => {
      const tournament1 = await createTestTournament({ status: "upcoming" });
      const tournament2 = await createTestTournament({ status: "upcoming" });
      const tournament3 = await createTestTournament({ status: "registration_open" });

      const updatedCount = await tournamentRepository.bulkUpdateStatus(
        [tournament1.id, tournament2.id],
        "registration_open"
      );

      expect(updatedCount).toBe(2);

      const updatedTournament1 = await tournamentRepository.getById(tournament1.id);
      const updatedTournament2 = await tournamentRepository.getById(tournament2.id);
      const unchangedTournament3 = await tournamentRepository.getById(tournament3.id);

      expect(updatedTournament1?.status).toBe("registration_open");
      expect(updatedTournament2?.status).toBe("registration_open");
      expect(unchangedTournament3?.status).toBe("registration_open");
    });

    it("должен возвращать 0 для пустого массива ID", async () => {
      const updatedCount = await tournamentRepository.bulkUpdateStatus([], "completed");
      expect(updatedCount).toBe(0);
    });
  });

  describe("deleteAllByVenue", () => {
    it("должен удалять все турниры площадки", async () => {
      await createTestTournament({ venueId: testVenue1.id });
      await createTestTournament({ venueId: testVenue1.id });
      await createTestTournament({ venueId: testVenue2.id });

      const deletedCount = await tournamentRepository.deleteAllByVenue(testVenue1.id);

      expect(deletedCount).toBe(2);

      const remainingTournaments = await tournamentRepository.getByVenue(testVenue1.id);
      expect(remainingTournaments).toHaveLength(0);

      const venue2Tournaments = await tournamentRepository.getByVenue(testVenue2.id);
      expect(venue2Tournaments).toHaveLength(1);
    });
  });

  describe("getTournamentsByMonths", () => {
    it("должен возвращать турниры по месяцам", async () => {
      const currentYear = new Date().getFullYear();
      const jan1 = new Date(currentYear, 0, 15); // 15 января
      const feb1 = new Date(currentYear, 1, 15); // 15 февраля

      await createTestTournament({
        startDate: jan1,
        endDate: new Date(jan1.getTime() + 24 * 60 * 60 * 1000),
        maxParticipants: 16
      });
      await createTestTournament({
        startDate: feb1,
        endDate: new Date(feb1.getTime() + 24 * 60 * 60 * 1000),
        maxParticipants: 32
      });

      const tournamentsByMonths = await tournamentRepository.getTournamentsByMonths(currentYear);

      expect(tournamentsByMonths.length).toBeGreaterThanOrEqual(2);
      const janData = tournamentsByMonths.find(m => m.month.includes(`${currentYear}-01`));
      const febData = tournamentsByMonths.find(m => m.month.includes(`${currentYear}-02`));

      expect(janData?.tournamentsCount).toBe(1);
      expect(janData?.totalParticipantsCapacity).toBe(16);
      expect(febData?.tournamentsCount).toBe(1);
      expect(febData?.totalParticipantsCapacity).toBe(32);
    });
  });

  describe("getPopularTournamentTypes", () => {
    it("должен возвращать популярные типы турниров", async () => {
      await createTestTournament({
        tournamentType: "singles_elimination",
        registrationFee: "50.00"
      });
      await createTestTournament({
        tournamentType: "singles_elimination",
        registrationFee: "100.00"
      });
      await createTestTournament({
        tournamentType: "doubles_round_robin",
        registrationFee: "75.00"
      });

      const popularTypes = await tournamentRepository.getPopularTournamentTypes();

      expect(popularTypes).toHaveLength(2);
      expect(popularTypes[0].tournamentType).toBe("singles_elimination");
      expect(popularTypes[0].count).toBe(2);
      expect(parseFloat(popularTypes[0].averageFee)).toBe(75); // (50 + 100) / 2

      expect(popularTypes[1].tournamentType).toBe("doubles_round_robin");
      expect(popularTypes[1].count).toBe(1);
      expect(parseFloat(popularTypes[1].averageFee)).toBe(75);
    });
  });

  describe("getLargestTournaments", () => {
    it("должен возвращать турниры с наибольшим количеством участников", async () => {
      await createTestTournament({ maxParticipants: 8 });
      await createTestTournament({ maxParticipants: 32 });
      await createTestTournament({ maxParticipants: 16 });

      const largestTournaments = await tournamentRepository.getLargestTournaments(2);

      expect(largestTournaments).toHaveLength(2);
      expect(largestTournaments[0].maxParticipants).toBe(32);
      expect(largestTournaments[1].maxParticipants).toBe(16);
    });
  });
});
