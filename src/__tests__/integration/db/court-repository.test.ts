import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../../../db/schema";
import { venues, courts, NewVenue, NewCourt } from "../../../db/schema";
import { VenueRepository } from "../../../repositories/venue-repository";
import { CourtRepository } from "../../../repositories/court-repository";
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
const venueRepository = new VenueRepository(db);
const courtRepository = new CourtRepository(db);

describe("CourtRepository", () => {
  // Функция для очистки таблиц перед/после тестов
  const cleanupDatabase = async () => {
    await db.delete(courts);
    await db.delete(venues);
  };

  beforeEach(async () => {
    await cleanupDatabase();
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  // Вспомогательная функция для создания тестового клуба
  const createTestVenue = async (customData: Partial<NewVenue> = {}): Promise<schema.Venue> => {
    const defaultVenueData: NewVenue = {
      name: "Test Venue",
      address: "123 Test Street",
      city: "Test City",
      country: "Test Country",
      ...customData,
    };

    return await venueRepository.create(defaultVenueData);
  };

  // Вспомогательная функция для создания тестового корта
  const createTestCourt = async (
    venueId: string,
    customData: Partial<NewCourt> = {}
  ): Promise<schema.Court> => {
    const defaultCourtData: NewCourt = {
      venueId,
      name: "Test Court",
      courtType: "paddle",
      hourlyRate: "50.00",
      description: "Test court description",
      isActive: true,
      ...customData,
    };

    return await courtRepository.create(defaultCourtData);
  };

  describe("create", () => {
    it("должен создавать корт с обязательными полями", async () => {
      const venue = await createTestVenue();
      
      const courtData: NewCourt = {
        venueId: venue.id,
        name: "Padel Court 1",
        courtType: "paddle",
        hourlyRate: "60.00",
      };

      const court = await courtRepository.create(courtData);

      expect(court).toBeDefined();
      expect(court.id).toBeDefined();
      expect(court.venueId).toBe(venue.id);
      expect(court.name).toBe(courtData.name);
      expect(court.courtType).toBe(courtData.courtType);
      expect(court.hourlyRate).toBe(courtData.hourlyRate);
      expect(court.isActive).toBe(true); // Значение по умолчанию
      expect(court.description).toBeNull();
    });

    it("должен создавать корт с опциональными полями", async () => {
      const venue = await createTestVenue();
      
      const courtData: NewCourt = {
        venueId: venue.id,
        name: "Tennis Court 1",
        courtType: "tennis",
        hourlyRate: "40.00",
        description: "Professional tennis court with clay surface",
        isActive: false,
      };

      const court = await courtRepository.create(courtData);

      expect(court).toBeDefined();
      expect(court.courtType).toBe("tennis");
      expect(court.description).toBe(courtData.description);
      expect(court.isActive).toBe(false);
    });

    it("должен выбрасывать ошибку при создании корта для несуществующего клуба", async () => {
      const courtData: NewCourt = {
        venueId: "00000000-0000-0000-0000-000000000000",
        name: "Invalid Court",
        courtType: "paddle",
        hourlyRate: "50.00",
      };

      await expect(courtRepository.create(courtData)).rejects.toThrow();
    });
  });

  describe("getById", () => {
    it("должен возвращать корт по ID", async () => {
      const venue = await createTestVenue();
      const createdCourt = await createTestCourt(venue.id);
      
      const court = await courtRepository.getById(createdCourt.id);
      
      expect(court).toBeDefined();
      expect(court?.id).toBe(createdCourt.id);
      expect(court?.name).toBe(createdCourt.name);
      expect(court?.venueId).toBe(venue.id);
    });

    it("должен возвращать null, если корт не найден", async () => {
      const court = await courtRepository.getById("00000000-0000-0000-0000-000000000000");
      
      expect(court).toBeNull();
    });
  });

  describe("getAll", () => {
    it("должен возвращать все корты", async () => {
      const venue1 = await createTestVenue({ name: "Venue 1" });
      const venue2 = await createTestVenue({ name: "Venue 2" });
      
      await createTestCourt(venue1.id, { name: "Court 1" });
      await createTestCourt(venue1.id, { name: "Court 2", isActive: false });
      await createTestCourt(venue2.id, { name: "Court 3" });
      
      const allCourts = await courtRepository.getAll();
      
      expect(allCourts).toHaveLength(3);
      expect(allCourts.map(c => c.name).sort()).toEqual(["Court 1", "Court 2", "Court 3"]);
    });

    it("должен возвращать только активные корты при activeOnly=true", async () => {
      const venue = await createTestVenue();
      
      await createTestCourt(venue.id, { name: "Active Court", isActive: true });
      await createTestCourt(venue.id, { name: "Inactive Court", isActive: false });
      
      const activeCourts = await courtRepository.getAll(true);
      
      expect(activeCourts).toHaveLength(1);
      expect(activeCourts[0].name).toBe("Active Court");
      expect(activeCourts[0].isActive).toBe(true);
    });
  });

  describe("getByVenueId", () => {
    it("должен возвращать корты для определенного клуба", async () => {
      const venue1 = await createTestVenue({ name: "Venue 1" });
      const venue2 = await createTestVenue({ name: "Venue 2" });
      
      await createTestCourt(venue1.id, { name: "Venue1 Court 1" });
      await createTestCourt(venue1.id, { name: "Venue1 Court 2" });
      await createTestCourt(venue2.id, { name: "Venue2 Court 1" });
      
      const venue1Courts = await courtRepository.getByVenueId(venue1.id);
      
      expect(venue1Courts).toHaveLength(2);
      expect(venue1Courts.map(c => c.name).sort()).toEqual(["Venue1 Court 1", "Venue1 Court 2"]);
      expect(venue1Courts.every(c => c.venueId === venue1.id)).toBe(true);
    });

    it("должен возвращать только активные корты клуба при activeOnly=true", async () => {
      const venue = await createTestVenue();
      
      await createTestCourt(venue.id, { name: "Active Court", isActive: true });
      await createTestCourt(venue.id, { name: "Inactive Court", isActive: false });
      
      const activeCourts = await courtRepository.getByVenueId(venue.id, true);
      
      expect(activeCourts).toHaveLength(1);
      expect(activeCourts[0].name).toBe("Active Court");
    });
  });

  describe("getByType", () => {
    it("должен возвращать корты по типу", async () => {
      const venue = await createTestVenue();
      
      await createTestCourt(venue.id, { name: "Padel Court 1", courtType: "paddle" });
      await createTestCourt(venue.id, { name: "Padel Court 2", courtType: "paddle" });
      await createTestCourt(venue.id, { name: "Tennis Court 1", courtType: "tennis" });
      
      const padelCourts = await courtRepository.getByType("paddle");
      
      expect(padelCourts).toHaveLength(2);
      expect(padelCourts.map(c => c.name).sort()).toEqual(["Padel Court 1", "Padel Court 2"]);
      expect(padelCourts.every(c => c.courtType === "paddle")).toBe(true);
    });
  });

  describe("getByVenueAndType", () => {
    it("должен возвращать корты по клубу и типу", async () => {
      const venue1 = await createTestVenue({ name: "Venue 1" });
      const venue2 = await createTestVenue({ name: "Venue 2" });
      
      await createTestCourt(venue1.id, { name: "V1 Padel Court", courtType: "paddle" });
      await createTestCourt(venue1.id, { name: "V1 Tennis Court", courtType: "tennis" });
      await createTestCourt(venue2.id, { name: "V2 Padel Court", courtType: "paddle" });
      
      const venue1PadelCourts = await courtRepository.getByVenueAndType(venue1.id, "paddle");
      
      expect(venue1PadelCourts).toHaveLength(1);
      expect(venue1PadelCourts[0].name).toBe("V1 Padel Court");
      expect(venue1PadelCourts[0].venueId).toBe(venue1.id);
      expect(venue1PadelCourts[0].courtType).toBe("paddle");
    });
  });

  describe("getByPriceRange", () => {
    it("должен возвращать корты в ценовом диапазоне", async () => {
      const venue = await createTestVenue();
      
      await createTestCourt(venue.id, { name: "Cheap Court", hourlyRate: "30.00" });
      await createTestCourt(venue.id, { name: "Medium Court", hourlyRate: "50.00" });
      await createTestCourt(venue.id, { name: "Expensive Court", hourlyRate: "80.00" });
      
      const mediumPriceCourts = await courtRepository.getByPriceRange(40, 60);
      
      expect(mediumPriceCourts).toHaveLength(1);
      expect(mediumPriceCourts[0].name).toBe("Medium Court");
      expect(parseFloat(mediumPriceCourts[0].hourlyRate)).toBe(50.00);
    });
  });

  describe("update", () => {
    it("должен обновлять данные корта", async () => {
      const venue = await createTestVenue();
      const createdCourt = await createTestCourt(venue.id);
      
      const updatedCourt = await courtRepository.update(createdCourt.id, {
        name: "Updated Court Name",
        hourlyRate: "75.00",
        description: "Updated description",
      });
      
      expect(updatedCourt).toBeDefined();
      expect(updatedCourt?.id).toBe(createdCourt.id);
      expect(updatedCourt?.name).toBe("Updated Court Name");
      expect(updatedCourt?.hourlyRate).toBe("75.00");
      expect(updatedCourt?.description).toBe("Updated description");
      expect(updatedCourt?.courtType).toBe(createdCourt.courtType); // Не изменилось
    });

    it("должен возвращать null при обновлении несуществующего корта", async () => {
      const updatedCourt = await courtRepository.update("00000000-0000-0000-0000-000000000000", {
        name: "Updated Name",
      });
      
      expect(updatedCourt).toBeNull();
    });
  });

  describe("deactivate", () => {
    it("должен деактивировать корт", async () => {
      const venue = await createTestVenue();
      const createdCourt = await createTestCourt(venue.id, { isActive: true });
      
      const result = await courtRepository.deactivate(createdCourt.id);
      
      expect(result).toBe(true);
      
      const deactivatedCourt = await courtRepository.getById(createdCourt.id);
      expect(deactivatedCourt?.isActive).toBe(false);
    });

    it("должен возвращать false при деактивации несуществующего корта", async () => {
      const result = await courtRepository.deactivate("00000000-0000-0000-0000-000000000000");
      
      expect(result).toBe(false);
    });
  });

  describe("activate", () => {
    it("должен активировать корт", async () => {
      const venue = await createTestVenue();
      const createdCourt = await createTestCourt(venue.id, { isActive: false });
      
      const result = await courtRepository.activate(createdCourt.id);
      
      expect(result).toBe(true);
      
      const activatedCourt = await courtRepository.getById(createdCourt.id);
      expect(activatedCourt?.isActive).toBe(true);
    });
  });

  describe("delete", () => {
    it("должен удалять корт", async () => {
      const venue = await createTestVenue();
      const createdCourt = await createTestCourt(venue.id);
      
      const result = await courtRepository.delete(createdCourt.id);
      
      expect(result).toBe(true);
      
      const deletedCourt = await courtRepository.getById(createdCourt.id);
      expect(deletedCourt).toBeNull();
    });

    it("должен возвращать false при удалении несуществующего корта", async () => {
      const result = await courtRepository.delete("00000000-0000-0000-0000-000000000000");
      
      expect(result).toBe(false);
    });
  });
});
