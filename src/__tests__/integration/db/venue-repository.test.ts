import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../../../db/schema";
import { venues, NewVenue } from "../../../db/schema";
import { VenueRepository } from "../../../repositories/venue-repository";
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

describe("VenueRepository", () => {
  // Функция для очистки таблиц перед/после тестов
  const cleanupDatabase = async () => {
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
      phoneNumber: "+1234567890",
      email: "test@venue.com",
      isActive: true,
      ...customData,
    };

    return await venueRepository.create(defaultVenueData);
  };

  describe("create", () => {
    it("должен создавать клуб с обязательными полями", async () => {
      const venueData: NewVenue = {
        name: "Padel Club 1",
        address: "456 Padel Street",
        city: "Madrid",
        country: "Spain",
      };

      const venue = await venueRepository.create(venueData);

      expect(venue).toBeDefined();
      expect(venue.id).toBeDefined();
      expect(venue.name).toBe(venueData.name);
      expect(venue.address).toBe(venueData.address);
      expect(venue.city).toBe(venueData.city);
      expect(venue.country).toBe(venueData.country);
      expect(venue.isActive).toBe(true); // Значение по умолчанию
      expect(venue.phoneNumber).toBeNull();
      expect(venue.email).toBeNull();
      expect(venue.gCalResourceId).toBeNull();
    });

    it("должен создавать клуб с опциональными полями", async () => {
      const venueData: NewVenue = {
        name: "Padel Club 2",
        address: "789 Padel Avenue",
        city: "Barcelona",
        country: "Spain",
        phoneNumber: "+34123456789",
        email: "info@padelclub2.com",
        isActive: false,
        gCalResourceId: "gcal-resource-123",
      };

      const venue = await venueRepository.create(venueData);

      expect(venue).toBeDefined();
      expect(venue.phoneNumber).toBe(venueData.phoneNumber);
      expect(venue.email).toBe(venueData.email);
      expect(venue.isActive).toBe(false);
      expect(venue.gCalResourceId).toBe(venueData.gCalResourceId);
    });

    it("должен выбрасывать ошибку при создании клуба с существующим названием", async () => {
      await createTestVenue({ name: "Unique Club" });

      await expect(
        createTestVenue({ 
          name: "Unique Club", 
          address: "Different Address",
          city: "Different City",
          country: "Different Country"
        })
      ).rejects.toThrow();
    });
  });

  describe("getById", () => {
    it("должен возвращать клуб по ID", async () => {
      const createdVenue = await createTestVenue();
      
      const venue = await venueRepository.getById(createdVenue.id);
      
      expect(venue).toBeDefined();
      expect(venue?.id).toBe(createdVenue.id);
      expect(venue?.name).toBe(createdVenue.name);
    });

    it("должен возвращать null, если клуб не найден", async () => {
      const venue = await venueRepository.getById("00000000-0000-0000-0000-000000000000");
      
      expect(venue).toBeNull();
    });
  });

  describe("getByName", () => {
    it("должен возвращать клуб по названию", async () => {
      const createdVenue = await createTestVenue({ name: "Unique Name Club" });
      
      const venue = await venueRepository.getByName("Unique Name Club");
      
      expect(venue).toBeDefined();
      expect(venue?.id).toBe(createdVenue.id);
      expect(venue?.name).toBe("Unique Name Club");
    });

    it("должен возвращать null, если клуб не найден", async () => {
      const venue = await venueRepository.getByName("Nonexistent Club");
      
      expect(venue).toBeNull();
    });
  });

  describe("getAll", () => {
    it("должен возвращать все клубы", async () => {
      await createTestVenue({ name: "Club 1", city: "City 1", country: "Country 1" });
      await createTestVenue({ name: "Club 2", city: "City 2", country: "Country 2", isActive: false });
      await createTestVenue({ name: "Club 3", city: "City 3", country: "Country 3" });
      
      const allVenues = await venueRepository.getAll();
      
      expect(allVenues).toHaveLength(3);
      expect(allVenues.map(v => v.name).sort()).toEqual(["Club 1", "Club 2", "Club 3"]);
    });

    it("должен возвращать только активные клубы при activeOnly=true", async () => {
      await createTestVenue({ name: "Active Club", isActive: true });
      await createTestVenue({ name: "Inactive Club", isActive: false });
      
      const activeVenues = await venueRepository.getAll(true);
      
      expect(activeVenues).toHaveLength(1);
      expect(activeVenues[0].name).toBe("Active Club");
      expect(activeVenues[0].isActive).toBe(true);
    });

    it("должен возвращать пустой массив, если клубов нет", async () => {
      const allVenues = await venueRepository.getAll();
      
      expect(allVenues).toHaveLength(0);
    });
  });

  describe("getByCity", () => {
    it("должен возвращать клубы по городу", async () => {
      await createTestVenue({ name: "Madrid Club 1", city: "Madrid" });
      await createTestVenue({ name: "Madrid Club 2", city: "Madrid" });
      await createTestVenue({ name: "Barcelona Club", city: "Barcelona" });
      
      const madridVenues = await venueRepository.getByCity("Madrid");
      
      expect(madridVenues).toHaveLength(2);
      expect(madridVenues.map(v => v.name).sort()).toEqual(["Madrid Club 1", "Madrid Club 2"]);
    });

    it("должен возвращать только активные клубы по городу при activeOnly=true", async () => {
      await createTestVenue({ name: "Active Madrid Club", city: "Madrid", isActive: true });
      await createTestVenue({ name: "Inactive Madrid Club", city: "Madrid", isActive: false });
      
      const activeMadridVenues = await venueRepository.getByCity("Madrid", true);
      
      expect(activeMadridVenues).toHaveLength(1);
      expect(activeMadridVenues[0].name).toBe("Active Madrid Club");
    });
  });

  describe("getByCountry", () => {
    it("должен возвращать клубы по стране", async () => {
      await createTestVenue({ name: "Spain Club 1", country: "Spain" });
      await createTestVenue({ name: "Spain Club 2", country: "Spain" });
      await createTestVenue({ name: "France Club", country: "France" });
      
      const spainVenues = await venueRepository.getByCountry("Spain");
      
      expect(spainVenues).toHaveLength(2);
      expect(spainVenues.map(v => v.name).sort()).toEqual(["Spain Club 1", "Spain Club 2"]);
    });
  });

  describe("searchByName", () => {
    it("должен находить клубы по частичному совпадению названия", async () => {
      await createTestVenue({ name: "Padel Club Madrid" });
      await createTestVenue({ name: "Tennis Club Barcelona" });
      await createTestVenue({ name: "Padel Center Valencia" });
      
      const padelVenues = await venueRepository.searchByName("Padel");
      
      expect(padelVenues).toHaveLength(2);
      expect(padelVenues.map(v => v.name).sort()).toEqual(["Padel Center Valencia", "Padel Club Madrid"]);
    });
  });

  describe("update", () => {
    it("должен обновлять данные клуба", async () => {
      const createdVenue = await createTestVenue();
      
      const updatedVenue = await venueRepository.update(createdVenue.id, {
        name: "Updated Club Name",
        city: "Updated City",
        phoneNumber: "+9876543210",
      });
      
      expect(updatedVenue).toBeDefined();
      expect(updatedVenue?.id).toBe(createdVenue.id);
      expect(updatedVenue?.name).toBe("Updated Club Name");
      expect(updatedVenue?.city).toBe("Updated City");
      expect(updatedVenue?.phoneNumber).toBe("+9876543210");
      expect(updatedVenue?.address).toBe(createdVenue.address); // Не изменилось
    });

    it("должен возвращать null при обновлении несуществующего клуба", async () => {
      const updatedVenue = await venueRepository.update("00000000-0000-0000-0000-000000000000", {
        name: "Updated Name",
      });
      
      expect(updatedVenue).toBeNull();
    });
  });

  describe("deactivate", () => {
    it("должен деактивировать клуб", async () => {
      const createdVenue = await createTestVenue({ isActive: true });
      
      const result = await venueRepository.deactivate(createdVenue.id);
      
      expect(result).toBe(true);
      
      const deactivatedVenue = await venueRepository.getById(createdVenue.id);
      expect(deactivatedVenue?.isActive).toBe(false);
    });

    it("должен возвращать false при деактивации несуществующего клуба", async () => {
      const result = await venueRepository.deactivate("00000000-0000-0000-0000-000000000000");
      
      expect(result).toBe(false);
    });
  });

  describe("activate", () => {
    it("должен активировать клуб", async () => {
      const createdVenue = await createTestVenue({ isActive: false });
      
      const result = await venueRepository.activate(createdVenue.id);
      
      expect(result).toBe(true);
      
      const activatedVenue = await venueRepository.getById(createdVenue.id);
      expect(activatedVenue?.isActive).toBe(true);
    });
  });

  describe("delete", () => {
    it("должен удалять клуб", async () => {
      const createdVenue = await createTestVenue();
      
      const result = await venueRepository.delete(createdVenue.id);
      
      expect(result).toBe(true);
      
      const deletedVenue = await venueRepository.getById(createdVenue.id);
      expect(deletedVenue).toBeNull();
    });

    it("должен возвращать false при удалении несуществующего клуба", async () => {
      const result = await venueRepository.delete("00000000-0000-0000-0000-000000000000");
      
      expect(result).toBe(false);
    });
  });
});
