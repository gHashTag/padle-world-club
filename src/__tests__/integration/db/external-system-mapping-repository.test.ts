import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { db } from "../../../db/connection";
import { ExternalSystemMappingRepository } from "../../../repositories/external-system-mapping-repository";
import { externalSystemMapping } from "../../../db/schema/externalSystemMapping";
import { users } from "../../../db/schema/user";
import { bookings } from "../../../db/schema/booking";
import { courts } from "../../../db/schema/court";
import { venues } from "../../../db/schema/venue";
import { v4 as uuidv4 } from "uuid";

describe("ExternalSystemMappingRepository", () => {
  let repository: ExternalSystemMappingRepository;
  let testUserId: string;
  let testBookingId: string;
  let testVenueId: string;
  let testCourtId: string;

  beforeEach(async () => {
    if (!db) throw new Error("Database connection not available");

    repository = new ExternalSystemMappingRepository(db);

    // Создаем тестовую площадку
    const [testVenue] = await db
      .insert(venues)
      .values({
        name: `Test Venue ${Date.now()}`,
        address: "Test Address",
        city: "Test City",
        country: "Test Country",
      })
      .returning();
    testVenueId = testVenue.id;

    // Создаем тестовый корт
    const [testCourt] = await db
      .insert(courts)
      .values({
        venueId: testVenueId,
        name: `Test Court ${Date.now()}`,
        courtType: "paddle",
        hourlyRate: "50.00",
      })
      .returning();
    testCourtId = testCourt.id;

    // Создаем тестового пользователя
    const [testUser] = await db
      .insert(users)
      .values({
        username: `test_user_${Date.now()}`,
        passwordHash: "test_hash",
        email: `test_${Date.now()}@example.com`,
        firstName: "Test",
        lastName: "User",
        memberId: `member_${Date.now()}`,
        userRole: "player",
      })
      .returning();
    testUserId = testUser.id;

    // Создаем тестовое бронирование
    const [testBooking] = await db
      .insert(bookings)
      .values({
        courtId: testCourtId,
        startTime: new Date(),
        endTime: new Date(Date.now() + 3600000), // +1 час
        durationMinutes: 60,
        status: "confirmed",
        totalAmount: "100.00",
        currency: "USD",
        bookedByUserId: testUserId,
        bookingPurpose: "free_play",
      })
      .returning();
    testBookingId = testBooking.id;
  });

  afterEach(async () => {
    if (!db) return;

    // Очищаем тестовые данные
    await db.delete(externalSystemMapping);
    await db.delete(bookings);
    await db.delete(courts);
    await db.delete(venues);
    await db.delete(users);
  });

  describe("create", () => {
    it("должен создавать новый маппинг", async () => {
      const mappingData = {
        externalSystem: "exporta" as const,
        externalId: "ext_123",
        internalEntityType: "user" as const,
        internalEntityId: testUserId,
      };

      const mapping = await repository.create(mappingData);

      expect(mapping).toBeDefined();
      expect(mapping.id).toBeDefined();
      expect(mapping.externalSystem).toBe("exporta");
      expect(mapping.externalId).toBe("ext_123");
      expect(mapping.internalEntityType).toBe("user");
      expect(mapping.internalEntityId).toBe(testUserId);
      expect(mapping.isActive).toBe(true);
      expect(mapping.createdAt).toBeDefined();
    });
  });

  describe("findById", () => {
    it("должен находить маппинг по ID", async () => {
      const mappingData = {
        externalSystem: "exporta" as const,
        externalId: "ext_123",
        internalEntityType: "user" as const,
        internalEntityId: testUserId,
      };

      const created = await repository.create(mappingData);
      const found = await repository.findById(created.id);

      expect(found).toBeDefined();
      expect(found?.id).toBe(created.id);
      expect(found?.externalSystem).toBe("exporta");
    });

    it("должен возвращать null для несуществующего ID", async () => {
      const found = await repository.findById(uuidv4());
      expect(found).toBeNull();
    });
  });

  describe("findByExternalId", () => {
    it("должен находить маппинг по внешнему ID и системе", async () => {
      const mappingData = {
        externalSystem: "exporta" as const,
        externalId: "ext_123",
        internalEntityType: "user" as const,
        internalEntityId: testUserId,
      };

      await repository.create(mappingData);
      const found = await repository.findByExternalId("exporta", "ext_123");

      expect(found).toBeDefined();
      expect(found?.externalSystem).toBe("exporta");
      expect(found?.externalId).toBe("ext_123");
    });

    it("должен возвращать null для несуществующего внешнего ID", async () => {
      const found = await repository.findByExternalId("exporta", "nonexistent");
      expect(found).toBeNull();
    });
  });

  describe("findByInternalEntity", () => {
    it("должен находить маппинги по внутренней сущности", async () => {
      const mappingData1 = {
        externalSystem: "exporta" as const,
        externalId: "ext_123",
        internalEntityType: "user" as const,
        internalEntityId: testUserId,
      };

      const mappingData2 = {
        externalSystem: "google_calendar" as const,
        externalId: "gcal_456",
        internalEntityType: "user" as const,
        internalEntityId: testUserId,
      };

      await repository.create(mappingData1);
      await repository.create(mappingData2);

      const mappings = await repository.findByInternalEntity(
        "user",
        testUserId
      );

      expect(mappings).toHaveLength(2);
      expect(mappings.some((m) => m.externalSystem === "exporta")).toBe(true);
      expect(mappings.some((m) => m.externalSystem === "google_calendar")).toBe(
        true
      );
    });
  });

  describe("findBySystem", () => {
    it("должен находить маппинги по системе", async () => {
      const mappingData1 = {
        externalSystem: "exporta" as const,
        externalId: "ext_123",
        internalEntityType: "user" as const,
        internalEntityId: testUserId,
      };

      const mappingData2 = {
        externalSystem: "exporta" as const,
        externalId: "ext_456",
        internalEntityType: "booking" as const,
        internalEntityId: testBookingId,
      };

      await repository.create(mappingData1);
      await repository.create(mappingData2);

      const mappings = await repository.findBySystem("exporta");

      expect(mappings).toHaveLength(2);
      expect(mappings.every((m) => m.externalSystem === "exporta")).toBe(true);
    });
  });

  describe("findActive", () => {
    it("должен находить только активные маппинги", async () => {
      const mappingData1 = {
        externalSystem: "exporta" as const,
        externalId: "ext_123",
        internalEntityType: "user" as const,
        internalEntityId: testUserId,
      };

      const mappingData2 = {
        externalSystem: "exporta" as const,
        externalId: "ext_456",
        internalEntityType: "user" as const,
        internalEntityId: testUserId,
        isActive: false,
      };

      await repository.create(mappingData1);
      await repository.create(mappingData2);

      const activeMappings = await repository.findActive();

      expect(activeMappings).toHaveLength(1);
      expect(activeMappings[0].externalId).toBe("ext_123");
      expect(activeMappings[0].isActive).toBe(true);
    });
  });

  describe("findWithConflicts", () => {
    it("должен находить маппинги с конфликтами", async () => {
      const mappingData = {
        externalSystem: "exporta" as const,
        externalId: "ext_123",
        internalEntityType: "user" as const,
        internalEntityId: testUserId,
        hasConflict: true,
        conflictData: "Conflict description",
      };

      await repository.create(mappingData);
      const conflictMappings = await repository.findWithConflicts();

      expect(conflictMappings).toHaveLength(1);
      expect(conflictMappings[0].hasConflict).toBe(true);
      expect(conflictMappings[0].conflictData).toBe("Conflict description");
    });
  });

  describe("findOutdated", () => {
    it("должен находить устаревшие маппинги", async () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 10); // 10 дней назад

      const mappingData = {
        externalSystem: "exporta" as const,
        externalId: "ext_123",
        internalEntityType: "user" as const,
        internalEntityId: testUserId,
        lastSyncAt: oldDate,
      };

      await repository.create(mappingData);
      const outdatedMappings = await repository.findOutdated(7);

      expect(outdatedMappings).toHaveLength(1);
      expect(outdatedMappings[0].externalId).toBe("ext_123");
    });
  });

  describe("findWithErrors", () => {
    it("должен находить маппинги с ошибками", async () => {
      const mappingData = {
        externalSystem: "exporta" as const,
        externalId: "ext_123",
        internalEntityType: "user" as const,
        internalEntityId: testUserId,
        lastError: "Sync error occurred",
      };

      await repository.create(mappingData);
      const errorMappings = await repository.findWithErrors();

      expect(errorMappings).toHaveLength(1);
      expect(errorMappings[0].lastError).toBe("Sync error occurred");
    });
  });

  describe("update", () => {
    it("должен обновлять маппинг", async () => {
      const mappingData = {
        externalSystem: "exporta" as const,
        externalId: "ext_123",
        internalEntityType: "user" as const,
        internalEntityId: testUserId,
      };

      const created = await repository.create(mappingData);
      const updated = await repository.update(created.id, {
        syncData: "Updated sync data",
      });

      expect(updated).toBeDefined();
      expect(updated?.syncData).toBe("Updated sync data");
      expect(updated?.updatedAt).toBeDefined();
    });

    it("должен возвращать null для несуществующего маппинга", async () => {
      const updated = await repository.update(uuidv4(), {
        syncData: "Test data",
      });

      expect(updated).toBeNull();
    });
  });

  describe("updateSyncStatus", () => {
    it("должен обновлять статус синхронизации", async () => {
      const mappingData = {
        externalSystem: "exporta" as const,
        externalId: "ext_123",
        internalEntityType: "user" as const,
        internalEntityId: testUserId,
      };

      const created = await repository.create(mappingData);
      const updated = await repository.updateSyncStatus(
        created.id,
        "sync data",
        false,
        undefined,
        undefined
      );

      expect(updated).toBeDefined();
      expect(updated?.syncData).toBe("sync data");
      expect(updated?.hasConflict).toBe(false);
      expect(updated?.lastSyncAt).toBeDefined();
    });
  });

  describe("bulkUpdateSyncStatus", () => {
    it("должен массово обновлять статус синхронизации", async () => {
      const mappingData1 = {
        externalSystem: "exporta" as const,
        externalId: "ext_123",
        internalEntityType: "user" as const,
        internalEntityId: testUserId,
      };

      const mappingData2 = {
        externalSystem: "exporta" as const,
        externalId: "ext_456",
        internalEntityType: "user" as const,
        internalEntityId: testUserId,
      };

      const created1 = await repository.create(mappingData1);
      const created2 = await repository.create(mappingData2);

      const updatedCount = await repository.bulkUpdateSyncStatus(
        [created1.id, created2.id],
        "bulk sync data",
        false
      );

      expect(updatedCount).toBe(2);
    });

    it("должен возвращать 0 для пустого массива ID", async () => {
      const updatedCount = await repository.bulkUpdateSyncStatus([], "data");
      expect(updatedCount).toBe(0);
    });
  });

  describe("deactivate", () => {
    it("должен деактивировать маппинг", async () => {
      const mappingData = {
        externalSystem: "exporta" as const,
        externalId: "ext_123",
        internalEntityType: "user" as const,
        internalEntityId: testUserId,
      };

      const created = await repository.create(mappingData);
      const deactivated = await repository.deactivate(created.id);

      expect(deactivated).toBeDefined();
      expect(deactivated?.isActive).toBe(false);
    });
  });

  describe("delete", () => {
    it("должен удалять маппинг", async () => {
      const mappingData = {
        externalSystem: "exporta" as const,
        externalId: "ext_123",
        internalEntityType: "user" as const,
        internalEntityId: testUserId,
      };

      const created = await repository.create(mappingData);
      const deleted = await repository.delete(created.id);

      expect(deleted).toBe(true);

      const found = await repository.findById(created.id);
      expect(found).toBeNull();
    });

    it("должен возвращать false для несуществующего маппинга", async () => {
      const deleted = await repository.delete(uuidv4());
      expect(deleted).toBe(false);
    });
  });

  describe("count", () => {
    it("должен подсчитывать общее количество маппингов", async () => {
      const mappingData1 = {
        externalSystem: "exporta" as const,
        externalId: "ext_123",
        internalEntityType: "user" as const,
        internalEntityId: testUserId,
      };

      const mappingData2 = {
        externalSystem: "exporta" as const,
        externalId: "ext_456",
        internalEntityType: "user" as const,
        internalEntityId: testUserId,
      };

      await repository.create(mappingData1);
      await repository.create(mappingData2);

      const count = await repository.count();
      expect(count).toBe(2);
    });
  });

  describe("countBySystem", () => {
    it("должен подсчитывать маппинги по системе", async () => {
      const mappingData1 = {
        externalSystem: "exporta" as const,
        externalId: "ext_123",
        internalEntityType: "user" as const,
        internalEntityId: testUserId,
      };

      const mappingData2 = {
        externalSystem: "google_calendar" as const,
        externalId: "gcal_456",
        internalEntityType: "user" as const,
        internalEntityId: testUserId,
      };

      await repository.create(mappingData1);
      await repository.create(mappingData2);

      const exportaCount = await repository.countBySystem("exporta");
      const gcalCount = await repository.countBySystem("google_calendar");

      expect(exportaCount).toBe(1);
      expect(gcalCount).toBe(1);
    });
  });

  describe("getMappingStats", () => {
    it("должен возвращать статистику маппингов", async () => {
      const mappingData1 = {
        externalSystem: "exporta" as const,
        externalId: "ext_123",
        internalEntityType: "user" as const,
        internalEntityId: testUserId,
        hasConflict: true,
      };

      const mappingData2 = {
        externalSystem: "google_calendar" as const,
        externalId: "gcal_456",
        internalEntityType: "user" as const,
        internalEntityId: testUserId,
        lastError: "Error message",
      };

      await repository.create(mappingData1);
      await repository.create(mappingData2);

      const stats = await repository.getMappingStats();

      expect(stats.total).toBe(2);
      expect(stats.active).toBe(2);
      expect(stats.withConflicts).toBe(1);
      expect(stats.withErrors).toBe(1);
      expect(stats.bySystem.exporta).toBe(1);
      expect(stats.bySystem.google_calendar).toBe(1);
    });
  });

  describe("findMany", () => {
    it("должен возвращать маппинги с пагинацией", async () => {
      const mappingData1 = {
        externalSystem: "exporta" as const,
        externalId: "ext_123",
        internalEntityType: "user" as const,
        internalEntityId: testUserId,
      };

      const mappingData2 = {
        externalSystem: "exporta" as const,
        externalId: "ext_456",
        internalEntityType: "user" as const,
        internalEntityId: testUserId,
      };

      await repository.create(mappingData1);
      await repository.create(mappingData2);

      const firstPage = await repository.findMany(1, 0);
      const secondPage = await repository.findMany(1, 1);

      expect(firstPage).toHaveLength(1);
      expect(secondPage).toHaveLength(1);
      expect(firstPage[0].id).not.toBe(secondPage[0].id);
    });
  });

  describe("findDuplicates", () => {
    it("должен находить дублирующиеся маппинги", async () => {
      const mappingData1 = {
        externalSystem: "exporta" as const,
        externalId: "ext_123",
        internalEntityType: "user" as const,
        internalEntityId: testUserId,
      };

      const mappingData2 = {
        externalSystem: "exporta" as const,
        externalId: "ext_123", // Тот же внешний ID
        internalEntityType: "booking" as const,
        internalEntityId: testBookingId,
      };

      await repository.create(mappingData1);
      await repository.create(mappingData2);

      const duplicates = await repository.findDuplicates();

      expect(duplicates).toHaveLength(2);
      expect(duplicates.every((d) => d.externalId === "ext_123")).toBe(true);
    });
  });

  describe("cleanupOldInactive", () => {
    it("должен очищать старые неактивные маппинги", async () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 40); // 40 дней назад

      const mappingData = {
        externalSystem: "exporta" as const,
        externalId: "ext_123",
        internalEntityType: "user" as const,
        internalEntityId: testUserId,
        isActive: false,
        updatedAt: oldDate,
      };

      const created = await repository.create(mappingData);
      const cleanedCount = await repository.cleanupOldInactive(30);

      expect(cleanedCount).toBe(1);

      const found = await repository.findById(created.id);
      expect(found).toBeNull();
    });
  });
});
