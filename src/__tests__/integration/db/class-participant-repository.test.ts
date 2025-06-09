import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../../../db/schema";
import {
  classParticipants,
  classSchedules,
  classDefinitions,
  venues,
  users,
  courts,
  NewClassParticipant,
  NewClassSchedule,
  NewClassDefinition,
  NewVenue,
  NewUser,
  NewCourt,
} from "../../../db/schema";
import { ClassParticipantRepository } from "../../../repositories/class-participant-repository";
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
const classParticipantRepository = new ClassParticipantRepository(db);

describe("ClassParticipantRepository", () => {
  let testVenue: schema.Venue;
  let testCourt: schema.Court;
  let testInstructor: schema.User;
  let testUser: schema.User;
  let testClassDefinition: schema.ClassDefinition;
  let testClassSchedule: schema.ClassSchedule;

  // Функция для очистки таблиц перед/после тестов
  const cleanupDatabase = async () => {
    await db.delete(classParticipants);
    await db.delete(classSchedules);
    await db.delete(classDefinitions);
    await db.delete(courts);
    await db.delete(venues);
    await db.delete(users);
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

    const courtData: NewCourt = {
      venueId: testVenue.id,
      name: "Test Court 1",
      courtType: "paddle",
      hourlyRate: "50.00",
      isActive: true,
    };
    [testCourt] = await db.insert(courts).values(courtData).returning();

    const instructorData: NewUser = {
      username: "test_instructor",
      passwordHash: "hashed_password",
      firstName: "Test",
      lastName: "Instructor",
      email: "instructor@test.com",
      memberId: "INST001",
      userRole: "coach",
      homeVenueId: testVenue.id,
    };
    [testInstructor] = await db.insert(users).values(instructorData).returning();

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

    const classDefData: NewClassDefinition = {
      name: "Test Group Training",
      description: "Test group training class",
      classType: "group_training",
      basePrice: "50.00",
      currency: "USD",
      isActive: true,
    };
    [testClassDefinition] = await db.insert(classDefinitions).values(classDefData).returning();

    const scheduleData: NewClassSchedule = {
      classDefinitionId: testClassDefinition.id,
      venueId: testVenue.id,
      instructorId: testInstructor.id,
      startTime: new Date("2024-12-26T10:00:00Z"),
      endTime: new Date("2024-12-26T11:00:00Z"),
      courtId: testCourt.id,
      maxParticipants: 8,
      currentParticipants: 0,
      status: "scheduled",
    };
    [testClassSchedule] = await db.insert(classSchedules).values(scheduleData).returning();
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  // Вспомогательная функция для создания тестового участника класса
  const createTestClassParticipant = async (customData: Partial<NewClassParticipant> = {}): Promise<schema.ClassParticipant> => {
    const defaultParticipantData: NewClassParticipant = {
      classScheduleId: testClassSchedule.id,
      userId: testUser.id,
      status: "registered",
      ...customData,
    };

    return await classParticipantRepository.create(defaultParticipantData);
  };

  describe("create", () => {
    it("должен создавать участника класса с обязательными полями", async () => {
      const participantData: NewClassParticipant = {
        classScheduleId: testClassSchedule.id,
        userId: testUser.id,
        status: "registered",
      };

      const participant = await classParticipantRepository.create(participantData);

      expect(participant).toBeDefined();
      expect(participant.id).toBeDefined();
      expect(participant.classScheduleId).toBe(testClassSchedule.id);
      expect(participant.userId).toBe(testUser.id);
      expect(participant.status).toBe("registered");
      expect(participant.paidWithPackageId).toBeNull();
    });

    it("должен создавать участника класса с пакетом тренировок", async () => {
      const packageId = "550e8400-e29b-41d4-a716-446655440000"; // Тестовый UUID

      const participantData: NewClassParticipant = {
        classScheduleId: testClassSchedule.id,
        userId: testUser.id,
        status: "registered",
        paidWithPackageId: packageId,
      };

      const participant = await classParticipantRepository.create(participantData);

      expect(participant).toBeDefined();
      expect(participant.status).toBe("registered");
      expect(participant.paidWithPackageId).toBe(packageId);
    });
  });

  describe("getById", () => {
    it("должен возвращать участника класса по ID", async () => {
      const createdParticipant = await createTestClassParticipant();

      const participant = await classParticipantRepository.getById(createdParticipant.id);

      expect(participant).toBeDefined();
      expect(participant?.id).toBe(createdParticipant.id);
      expect(participant?.classScheduleId).toBe(createdParticipant.classScheduleId);
    });

    it("должен возвращать null, если участник класса не найден", async () => {
      const participant = await classParticipantRepository.getById("00000000-0000-0000-0000-000000000000");

      expect(participant).toBeNull();
    });
  });

  describe("getByClassScheduleAndUser", () => {
    it("должен возвращать участника по расписанию и пользователю", async () => {
      const createdParticipant = await createTestClassParticipant();

      const participant = await classParticipantRepository.getByClassScheduleAndUser(
        testClassSchedule.id,
        testUser.id
      );

      expect(participant).toBeDefined();
      expect(participant?.id).toBe(createdParticipant.id);
      expect(participant?.classScheduleId).toBe(testClassSchedule.id);
      expect(participant?.userId).toBe(testUser.id);
    });

    it("должен возвращать null, если участник не найден", async () => {
      const participant = await classParticipantRepository.getByClassScheduleAndUser(
        testClassSchedule.id,
        "00000000-0000-0000-0000-000000000000"
      );

      expect(participant).toBeNull();
    });
  });

  describe("getByClassSchedule", () => {
    it("должен возвращать всех участников класса", async () => {
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

      await createTestClassParticipant({ userId: testUser.id, status: "registered" });
      await createTestClassParticipant({ userId: anotherUser[0].id, status: "attended" });

      const participants = await classParticipantRepository.getByClassSchedule(testClassSchedule.id);
      const registeredOnly = await classParticipantRepository.getByClassSchedule(testClassSchedule.id, "registered");

      expect(participants).toHaveLength(2);
      expect(participants.every(p => p.classScheduleId === testClassSchedule.id)).toBe(true);

      expect(registeredOnly).toHaveLength(1);
      expect(registeredOnly[0].status).toBe("registered");
    });
  });

  describe("getByUser", () => {
    it("должен возвращать все участия пользователя", async () => {
      // Создаем второе расписание класса
      const anotherSchedule = await db.insert(classSchedules).values({
        classDefinitionId: testClassDefinition.id,
        venueId: testVenue.id,
        instructorId: testInstructor.id,
        startTime: new Date("2024-12-27T10:00:00Z"),
        endTime: new Date("2024-12-27T11:00:00Z"),
        courtId: testCourt.id,
        maxParticipants: 8,
        currentParticipants: 0,
        status: "scheduled",
      }).returning();

      await createTestClassParticipant({ classScheduleId: testClassSchedule.id, status: "registered" });
      await createTestClassParticipant({ classScheduleId: anotherSchedule[0].id, status: "attended" });

      const userParticipations = await classParticipantRepository.getByUser(testUser.id);
      const attendedOnly = await classParticipantRepository.getByUser(testUser.id, "attended");

      expect(userParticipations).toHaveLength(2);
      expect(userParticipations.every(p => p.userId === testUser.id)).toBe(true);

      expect(attendedOnly).toHaveLength(1);
      expect(attendedOnly[0].status).toBe("attended");
    });
  });

  describe("getByStatus", () => {
    it("должен возвращать участников по статусу", async () => {
      // Создаем дополнительных пользователей для разных статусов
      const users = await db.insert(schema.users).values([
        {
          username: "status_user1",
          passwordHash: "hash",
          firstName: "Status",
          lastName: "User1",
          email: "status1@test.com",
          memberId: "S001",
          userRole: "player",
          homeVenueId: testVenue.id,
        },
        {
          username: "status_user2",
          passwordHash: "hash",
          firstName: "Status",
          lastName: "User2",
          email: "status2@test.com",
          memberId: "S002",
          userRole: "player",
          homeVenueId: testVenue.id,
        },
      ]).returning();

      await createTestClassParticipant({ userId: testUser.id, status: "registered" });
      await createTestClassParticipant({ userId: users[0].id, status: "attended" });
      await createTestClassParticipant({ userId: users[1].id, status: "no_show" });

      const registered = await classParticipantRepository.getByStatus("registered");
      const attended = await classParticipantRepository.getByStatus("attended");
      const noShow = await classParticipantRepository.getByStatus("no_show");

      expect(registered).toHaveLength(1);
      expect(registered[0].status).toBe("registered");

      expect(attended).toHaveLength(1);
      expect(attended[0].status).toBe("attended");

      expect(noShow).toHaveLength(1);
      expect(noShow[0].status).toBe("no_show");
    });
  });

  describe("getByTrainingPackage", () => {
    it("должен возвращать участников с определенным пакетом", async () => {
      const packageId1 = "550e8400-e29b-41d4-a716-446655440001";
      const packageId2 = "550e8400-e29b-41d4-a716-446655440002";

      // Создаем дополнительных пользователей для разных пакетов
      const users = await db.insert(schema.users).values([
        {
          username: "package_user1",
          passwordHash: "hash",
          firstName: "Package",
          lastName: "User1",
          email: "package1@test.com",
          memberId: "P001",
          userRole: "player",
          homeVenueId: testVenue.id,
        },
        {
          username: "package_user2",
          passwordHash: "hash",
          firstName: "Package",
          lastName: "User2",
          email: "package2@test.com",
          memberId: "P002",
          userRole: "player",
          homeVenueId: testVenue.id,
        },
      ]).returning();

      await createTestClassParticipant({ userId: testUser.id, paidWithPackageId: packageId1 });
      await createTestClassParticipant({ userId: users[0].id, paidWithPackageId: packageId2 });
      await createTestClassParticipant({ userId: users[1].id, paidWithPackageId: null });

      const withPackage1 = await classParticipantRepository.getByTrainingPackage(packageId1);
      const withAnyPackage = await classParticipantRepository.getByTrainingPackage();

      expect(withPackage1).toHaveLength(1);
      expect(withPackage1[0].paidWithPackageId).toBe(packageId1);

      expect(withAnyPackage).toHaveLength(2);
      expect(withAnyPackage.every(p => p.paidWithPackageId !== null)).toBe(true);
    });
  });

  describe("update", () => {
    it("должен обновлять данные участника класса", async () => {
      const createdParticipant = await createTestClassParticipant();

      const updatedParticipant = await classParticipantRepository.update(createdParticipant.id, {
        status: "attended",
        paidWithPackageId: "550e8400-e29b-41d4-a716-446655440000",
      });

      expect(updatedParticipant).toBeDefined();
      expect(updatedParticipant?.id).toBe(createdParticipant.id);
      expect(updatedParticipant?.status).toBe("attended");
      expect(updatedParticipant?.paidWithPackageId).toBe("550e8400-e29b-41d4-a716-446655440000");
    });

    it("должен возвращать null при обновлении несуществующего участника", async () => {
      const updatedParticipant = await classParticipantRepository.update("00000000-0000-0000-0000-000000000000", {
        status: "attended",
      });

      expect(updatedParticipant).toBeNull();
    });
  });

  describe("updateStatus", () => {
    it("должен обновлять статус участника класса", async () => {
      const createdParticipant = await createTestClassParticipant({ status: "registered" });

      const updatedParticipant = await classParticipantRepository.updateStatus(createdParticipant.id, "attended");

      expect(updatedParticipant).toBeDefined();
      expect(updatedParticipant?.status).toBe("attended");
    });
  });

  describe("updateStatusByClassScheduleAndUser", () => {
    it("должен обновлять статус участника по расписанию и пользователю", async () => {
      await createTestClassParticipant({ status: "registered" });

      const updatedParticipant = await classParticipantRepository.updateStatusByClassScheduleAndUser(
        testClassSchedule.id,
        testUser.id,
        "attended"
      );

      expect(updatedParticipant).toBeDefined();
      expect(updatedParticipant?.status).toBe("attended");
    });
  });

  describe("setTrainingPackage", () => {
    it("должен устанавливать пакет тренировок для участника", async () => {
      const createdParticipant = await createTestClassParticipant();
      const packageId = "550e8400-e29b-41d4-a716-446655440000";

      const updatedParticipant = await classParticipantRepository.setTrainingPackage(createdParticipant.id, packageId);

      expect(updatedParticipant).toBeDefined();
      expect(updatedParticipant?.paidWithPackageId).toBe(packageId);
    });
  });

  describe("delete", () => {
    it("должен удалять участника класса", async () => {
      const createdParticipant = await createTestClassParticipant();

      const result = await classParticipantRepository.delete(createdParticipant.id);

      expect(result).toBe(true);

      const deletedParticipant = await classParticipantRepository.getById(createdParticipant.id);
      expect(deletedParticipant).toBeNull();
    });

    it("должен возвращать false при удалении несуществующего участника", async () => {
      const result = await classParticipantRepository.delete("00000000-0000-0000-0000-000000000000");

      expect(result).toBe(false);
    });
  });

  describe("deleteByClassScheduleAndUser", () => {
    it("должен удалять участника по расписанию и пользователю", async () => {
      await createTestClassParticipant();

      const result = await classParticipantRepository.deleteByClassScheduleAndUser(
        testClassSchedule.id,
        testUser.id
      );

      expect(result).toBe(true);

      const deletedParticipant = await classParticipantRepository.getByClassScheduleAndUser(
        testClassSchedule.id,
        testUser.id
      );
      expect(deletedParticipant).toBeNull();
    });
  });

  describe("deleteAllByClassSchedule", () => {
    it("должен удалять всех участников класса", async () => {
      // Создаем второго пользователя
      const anotherUser = await db.insert(users).values({
        username: "another_user2",
        passwordHash: "hashed_password",
        firstName: "Another",
        lastName: "User2",
        email: "another2@test.com",
        memberId: "USER003",
        userRole: "player",
        homeVenueId: testVenue.id,
      }).returning();

      await createTestClassParticipant({ userId: testUser.id });
      await createTestClassParticipant({ userId: anotherUser[0].id });

      const deletedCount = await classParticipantRepository.deleteAllByClassSchedule(testClassSchedule.id);

      expect(deletedCount).toBe(2);

      const remainingParticipants = await classParticipantRepository.getByClassSchedule(testClassSchedule.id);
      expect(remainingParticipants).toHaveLength(0);
    });
  });

  describe("isUserParticipant", () => {
    it("должен возвращать true, если пользователь является участником", async () => {
      await createTestClassParticipant();

      const isParticipant = await classParticipantRepository.isUserParticipant(testClassSchedule.id, testUser.id);

      expect(isParticipant).toBe(true);
    });

    it("должен возвращать false, если пользователь не является участником", async () => {
      const isParticipant = await classParticipantRepository.isUserParticipant(
        testClassSchedule.id,
        "00000000-0000-0000-0000-000000000000"
      );

      expect(isParticipant).toBe(false);
    });
  });

  describe("getParticipantCount", () => {
    it("должен возвращать количество участников класса", async () => {
      // Создаем второго пользователя
      const anotherUser = await db.insert(users).values({
        username: "another_user3",
        passwordHash: "hashed_password",
        firstName: "Another",
        lastName: "User3",
        email: "another3@test.com",
        memberId: "USER004",
        userRole: "player",
        homeVenueId: testVenue.id,
      }).returning();

      await createTestClassParticipant({ userId: testUser.id, status: "registered" });
      await createTestClassParticipant({ userId: anotherUser[0].id, status: "attended" });

      const totalCount = await classParticipantRepository.getParticipantCount(testClassSchedule.id);
      const registeredCount = await classParticipantRepository.getParticipantCount(testClassSchedule.id, "registered");

      expect(totalCount).toBe(2);
      expect(registeredCount).toBe(1);
    });
  });

  describe("getStats", () => {
    it("должен возвращать статистику по участникам класса", async () => {
      // Создаем дополнительных пользователей
      const users = await db.insert(schema.users).values([
        {
          username: "user1",
          passwordHash: "hash",
          firstName: "User",
          lastName: "One",
          email: "user1@test.com",
          memberId: "U001",
          userRole: "player",
          homeVenueId: testVenue.id,
        },
        {
          username: "user2",
          passwordHash: "hash",
          firstName: "User",
          lastName: "Two",
          email: "user2@test.com",
          memberId: "U002",
          userRole: "player",
          homeVenueId: testVenue.id,
        },
        {
          username: "user3",
          passwordHash: "hash",
          firstName: "User",
          lastName: "Three",
          email: "user3@test.com",
          memberId: "U003",
          userRole: "player",
          homeVenueId: testVenue.id,
        },
      ]).returning();

      await createTestClassParticipant({
        userId: users[0].id,
        status: "registered",
        paidWithPackageId: "550e8400-e29b-41d4-a716-446655440001"
      });
      await createTestClassParticipant({
        userId: users[1].id,
        status: "attended"
      });
      await createTestClassParticipant({
        userId: users[2].id,
        status: "no_show"
      });
      await createTestClassParticipant({
        userId: testUser.id,
        status: "cancelled"
      });

      const stats = await classParticipantRepository.getStats(testClassSchedule.id);

      expect(stats.totalParticipants).toBe(4);
      expect(stats.registeredCount).toBe(1);
      expect(stats.attendedCount).toBe(1);
      expect(stats.noShowCount).toBe(1);
      expect(stats.cancelledCount).toBe(1);
      expect(stats.paidWithPackageCount).toBe(1);
      expect(stats.attendanceRate).toBe("50.00"); // 1 attended / (1 attended + 1 no_show) * 100
    });

    it("должен возвращать нулевую статистику для пустого класса", async () => {
      const stats = await classParticipantRepository.getStats(testClassSchedule.id);

      expect(stats.totalParticipants).toBe(0);
      expect(stats.registeredCount).toBe(0);
      expect(stats.attendedCount).toBe(0);
      expect(stats.noShowCount).toBe(0);
      expect(stats.cancelledCount).toBe(0);
      expect(stats.paidWithPackageCount).toBe(0);
      expect(stats.attendanceRate).toBe("0.00");
    });
  });

  describe("bulkUpdateStatus", () => {
    it("должен массово обновлять статус участников", async () => {
      // Создаем дополнительных пользователей
      const users = await db.insert(schema.users).values([
        {
          username: "bulk1",
          passwordHash: "hash",
          firstName: "Bulk",
          lastName: "One",
          email: "bulk1@test.com",
          memberId: "B001",
          userRole: "player",
          homeVenueId: testVenue.id,
        },
        {
          username: "bulk2",
          passwordHash: "hash",
          firstName: "Bulk",
          lastName: "Two",
          email: "bulk2@test.com",
          memberId: "B002",
          userRole: "player",
          homeVenueId: testVenue.id,
        },
      ]).returning();

      await createTestClassParticipant({ userId: users[0].id, status: "registered" });
      await createTestClassParticipant({ userId: users[1].id, status: "registered" });
      await createTestClassParticipant({ userId: testUser.id, status: "attended" });

      const updatedCount = await classParticipantRepository.bulkUpdateStatus(
        testClassSchedule.id,
        "registered",
        "attended"
      );

      expect(updatedCount).toBe(2);

      const attendedParticipants = await classParticipantRepository.getByStatus("attended");
      expect(attendedParticipants).toHaveLength(3); // 2 обновленных + 1 уже был attended
    });
  });

  describe("getNoShowParticipants", () => {
    it("должен возвращать участников, которые не пришли", async () => {
      // Создаем дополнительных пользователей для разных статусов
      const users = await db.insert(schema.users).values([
        {
          username: "noshow_user1",
          passwordHash: "hash",
          firstName: "NoShow",
          lastName: "User1",
          email: "noshow1@test.com",
          memberId: "NS001",
          userRole: "player",
          homeVenueId: testVenue.id,
        },
        {
          username: "noshow_user2",
          passwordHash: "hash",
          firstName: "NoShow",
          lastName: "User2",
          email: "noshow2@test.com",
          memberId: "NS002",
          userRole: "player",
          homeVenueId: testVenue.id,
        },
      ]).returning();

      await createTestClassParticipant({ userId: testUser.id, status: "registered" });
      await createTestClassParticipant({ userId: users[0].id, status: "no_show" });
      await createTestClassParticipant({ userId: users[1].id, status: "attended" });

      const noShowParticipants = await classParticipantRepository.getNoShowParticipants(testClassSchedule.id);

      expect(noShowParticipants).toHaveLength(1);
      expect(noShowParticipants[0].status).toBe("no_show");
    });
  });

  describe("getActiveParticipants", () => {
    it("должен возвращать активных участников (зарегистрированных или посетивших)", async () => {
      // Создаем дополнительных пользователей для разных статусов
      const users = await db.insert(schema.users).values([
        {
          username: "active_user1",
          passwordHash: "hash",
          firstName: "Active",
          lastName: "User1",
          email: "active1@test.com",
          memberId: "A001",
          userRole: "player",
          homeVenueId: testVenue.id,
        },
        {
          username: "active_user2",
          passwordHash: "hash",
          firstName: "Active",
          lastName: "User2",
          email: "active2@test.com",
          memberId: "A002",
          userRole: "player",
          homeVenueId: testVenue.id,
        },
        {
          username: "active_user3",
          passwordHash: "hash",
          firstName: "Active",
          lastName: "User3",
          email: "active3@test.com",
          memberId: "A003",
          userRole: "player",
          homeVenueId: testVenue.id,
        },
      ]).returning();

      await createTestClassParticipant({ userId: testUser.id, status: "registered" });
      await createTestClassParticipant({ userId: users[0].id, status: "attended" });
      await createTestClassParticipant({ userId: users[1].id, status: "no_show" });
      await createTestClassParticipant({ userId: users[2].id, status: "cancelled" });

      const activeParticipants = await classParticipantRepository.getActiveParticipants(testClassSchedule.id);

      expect(activeParticipants).toHaveLength(2);
      expect(activeParticipants.every(p => p.status === "registered" || p.status === "attended")).toBe(true);
    });
  });

  describe("getAll", () => {
    it("должен возвращать всех участников с пагинацией", async () => {
      // Создаем 5 участников
      for (let i = 0; i < 5; i++) {
        const user = await db.insert(schema.users).values({
          username: `paginated_user_${i}`,
          passwordHash: "hash",
          firstName: "Paginated",
          lastName: `User${i}`,
          email: `paginated${i}@test.com`,
          memberId: `P00${i}`,
          userRole: "player",
          homeVenueId: testVenue.id,
        }).returning();

        await createTestClassParticipant({ userId: user[0].id });
      }

      const allParticipants = await classParticipantRepository.getAll();
      const limitedParticipants = await classParticipantRepository.getAll(3);
      const offsetParticipants = await classParticipantRepository.getAll(3, 2);

      expect(allParticipants).toHaveLength(5);
      expect(limitedParticipants).toHaveLength(3);
      expect(offsetParticipants).toHaveLength(3);
    });
  });
});
