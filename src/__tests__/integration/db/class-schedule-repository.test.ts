import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../../../db/schema";
import {
  classSchedules,
  classDefinitions,
  venues,
  users,
  courts,
  NewClassSchedule,
  NewClassDefinition,
  NewVenue,
  NewUser,
  NewCourt,
} from "../../../db/schema";
import { ClassScheduleRepository } from "../../../repositories/class-schedule-repository";
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
const classScheduleRepository = new ClassScheduleRepository(db);

describe("ClassScheduleRepository", () => {
  let testVenue: schema.Venue;
  let testCourt: schema.Court;
  let testInstructor: schema.User;
  let testClassDefinition: schema.ClassDefinition;

  // Функция для очистки таблиц перед/после тестов
  const cleanupDatabase = async () => {
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

    const classDefData: NewClassDefinition = {
      name: "Test Group Training",
      description: "Test group training class",
      classType: "group_training",
      basePrice: "50.00",
      currency: "USD",
      isActive: true,
    };
    [testClassDefinition] = await db.insert(classDefinitions).values(classDefData).returning();
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  // Вспомогательная функция для создания тестового расписания класса
  const createTestClassSchedule = async (customData: Partial<NewClassSchedule> = {}): Promise<schema.ClassSchedule> => {
    const startTime = new Date("2024-12-26T10:00:00Z");
    const endTime = new Date("2024-12-26T11:00:00Z");

    const defaultScheduleData: NewClassSchedule = {
      classDefinitionId: testClassDefinition.id,
      venueId: testVenue.id,
      instructorId: testInstructor.id,
      startTime,
      endTime,
      courtId: testCourt.id,
      maxParticipants: 8,
      currentParticipants: 0,
      status: "scheduled",
      ...customData,
    };

    return await classScheduleRepository.create(defaultScheduleData);
  };

  describe("create", () => {
    it("должен создавать расписание класса с обязательными полями", async () => {
      const startTime = new Date("2024-12-26T10:00:00Z");
      const endTime = new Date("2024-12-26T11:00:00Z");

      const scheduleData: NewClassSchedule = {
        classDefinitionId: testClassDefinition.id,
        venueId: testVenue.id,
        instructorId: testInstructor.id,
        startTime,
        endTime,
        courtId: testCourt.id,
        maxParticipants: 8,
        currentParticipants: 0,
        status: "scheduled",
      };

      const schedule = await classScheduleRepository.create(scheduleData);

      expect(schedule).toBeDefined();
      expect(schedule.id).toBeDefined();
      expect(schedule.classDefinitionId).toBe(testClassDefinition.id);
      expect(schedule.venueId).toBe(testVenue.id);
      expect(schedule.instructorId).toBe(testInstructor.id);
      expect(schedule.courtId).toBe(testCourt.id);
      expect(schedule.maxParticipants).toBe(8);
      expect(schedule.currentParticipants).toBe(0);
      expect(schedule.status).toBe("scheduled");
    });

    it("должен создавать расписание класса со связанным бронированием", async () => {
      const startTime = new Date("2024-12-26T14:00:00Z");
      const endTime = new Date("2024-12-26T15:00:00Z");

      const scheduleData: NewClassSchedule = {
        classDefinitionId: testClassDefinition.id,
        venueId: testVenue.id,
        instructorId: testInstructor.id,
        startTime,
        endTime,
        courtId: testCourt.id,
        maxParticipants: 6,
        status: "draft",
        relatedBookingId: null, // Пока не создаем связанное бронирование
      };

      const schedule = await classScheduleRepository.create(scheduleData);

      expect(schedule).toBeDefined();
      expect(schedule.status).toBe("draft");
      expect(schedule.relatedBookingId).toBeNull();
    });
  });

  describe("getById", () => {
    it("должен возвращать расписание класса по ID", async () => {
      const createdSchedule = await createTestClassSchedule();

      const schedule = await classScheduleRepository.getById(createdSchedule.id);

      expect(schedule).toBeDefined();
      expect(schedule?.id).toBe(createdSchedule.id);
      expect(schedule?.classDefinitionId).toBe(createdSchedule.classDefinitionId);
    });

    it("должен возвращать null, если расписание класса не найдено", async () => {
      const schedule = await classScheduleRepository.getById("00000000-0000-0000-0000-000000000000");

      expect(schedule).toBeNull();
    });
  });

  describe("getByClassDefinition", () => {
    it("должен возвращать расписания классов по определению класса", async () => {
      await createTestClassSchedule({ status: "scheduled" });
      await createTestClassSchedule({ status: "completed" });

      // Создаем другое определение класса
      const anotherClassDef = await db.insert(classDefinitions).values({
        name: "Another Class",
        classType: "open_play_session",
        basePrice: "30.00",
        currency: "USD",
        isActive: true,
      }).returning();

      await createTestClassSchedule({
        classDefinitionId: anotherClassDef[0].id,
        status: "scheduled"
      });

      const schedules = await classScheduleRepository.getByClassDefinition(testClassDefinition.id);
      const scheduledOnly = await classScheduleRepository.getByClassDefinition(testClassDefinition.id, "scheduled");

      expect(schedules).toHaveLength(2);
      expect(schedules.every(s => s.classDefinitionId === testClassDefinition.id)).toBe(true);

      expect(scheduledOnly).toHaveLength(1);
      expect(scheduledOnly[0].status).toBe("scheduled");
    });
  });

  describe("getByInstructor", () => {
    it("должен возвращать расписания классов по инструктору", async () => {
      await createTestClassSchedule({ status: "scheduled" });
      await createTestClassSchedule({ status: "completed" });

      // Создаем другого инструктора
      const anotherInstructor = await db.insert(users).values({
        username: "another_instructor",
        passwordHash: "hashed_password",
        firstName: "Another",
        lastName: "Instructor",
        email: "another@test.com",
        memberId: "INST002",
        userRole: "coach",
        homeVenueId: testVenue.id,
      }).returning();

      await createTestClassSchedule({
        instructorId: anotherInstructor[0].id,
        status: "scheduled"
      });

      const schedules = await classScheduleRepository.getByInstructor(testInstructor.id);
      const scheduledOnly = await classScheduleRepository.getByInstructor(testInstructor.id, "scheduled");

      expect(schedules).toHaveLength(2);
      expect(schedules.every(s => s.instructorId === testInstructor.id)).toBe(true);

      expect(scheduledOnly).toHaveLength(1);
      expect(scheduledOnly[0].status).toBe("scheduled");
    });
  });

  describe("getByVenue", () => {
    it("должен возвращать расписания классов по площадке", async () => {
      await createTestClassSchedule({ status: "scheduled" });
      await createTestClassSchedule({ status: "completed" });

      const schedules = await classScheduleRepository.getByVenue(testVenue.id);
      const scheduledOnly = await classScheduleRepository.getByVenue(testVenue.id, "scheduled");

      expect(schedules).toHaveLength(2);
      expect(schedules.every(s => s.venueId === testVenue.id)).toBe(true);

      expect(scheduledOnly).toHaveLength(1);
      expect(scheduledOnly[0].status).toBe("scheduled");
    });
  });

  describe("getByCourt", () => {
    it("должен возвращать расписания классов по корту", async () => {
      await createTestClassSchedule({ status: "scheduled" });
      await createTestClassSchedule({ status: "completed" });

      const schedules = await classScheduleRepository.getByCourt(testCourt.id);
      const scheduledOnly = await classScheduleRepository.getByCourt(testCourt.id, "scheduled");

      expect(schedules).toHaveLength(2);
      expect(schedules.every(s => s.courtId === testCourt.id)).toBe(true);

      expect(scheduledOnly).toHaveLength(1);
      expect(scheduledOnly[0].status).toBe("scheduled");
    });
  });

  describe("getByDateRange", () => {
    it("должен возвращать расписания классов в временном диапазоне", async () => {
      const date1 = new Date("2024-12-26T10:00:00Z");
      const date2 = new Date("2024-12-27T10:00:00Z");
      const date3 = new Date("2024-12-28T10:00:00Z");

      await createTestClassSchedule({ startTime: date1, endTime: new Date(date1.getTime() + 60*60*1000) });
      await createTestClassSchedule({ startTime: date2, endTime: new Date(date2.getTime() + 60*60*1000) });
      await createTestClassSchedule({ startTime: date3, endTime: new Date(date3.getTime() + 60*60*1000) });

      const startRange = new Date("2024-12-26T00:00:00Z");
      const endRange = new Date("2024-12-27T23:59:59Z");

      const schedulesInRange = await classScheduleRepository.getByDateRange(startRange, endRange);

      expect(schedulesInRange).toHaveLength(2);
      expect(schedulesInRange.every(s => s.startTime >= startRange && s.startTime <= endRange)).toBe(true);
    });

    it("должен фильтровать по статусу в временном диапазоне", async () => {
      const date1 = new Date("2024-12-26T10:00:00Z");
      const date2 = new Date("2024-12-26T14:00:00Z");

      await createTestClassSchedule({
        startTime: date1,
        endTime: new Date(date1.getTime() + 60*60*1000),
        status: "scheduled"
      });
      await createTestClassSchedule({
        startTime: date2,
        endTime: new Date(date2.getTime() + 60*60*1000),
        status: "cancelled"
      });

      const startRange = new Date("2024-12-26T00:00:00Z");
      const endRange = new Date("2024-12-26T23:59:59Z");

      const scheduledOnly = await classScheduleRepository.getByDateRange(startRange, endRange, "scheduled");

      expect(scheduledOnly).toHaveLength(1);
      expect(scheduledOnly[0].status).toBe("scheduled");
    });
  });

  describe("getByStatus", () => {
    it("должен возвращать расписания классов по статусу", async () => {
      await createTestClassSchedule({ status: "scheduled" });
      await createTestClassSchedule({ status: "scheduled" });
      await createTestClassSchedule({ status: "completed" });
      await createTestClassSchedule({ status: "cancelled" });

      const scheduled = await classScheduleRepository.getByStatus("scheduled");
      const completed = await classScheduleRepository.getByStatus("completed");
      const cancelled = await classScheduleRepository.getByStatus("cancelled");

      expect(scheduled).toHaveLength(2);
      expect(scheduled.every(s => s.status === "scheduled")).toBe(true);

      expect(completed).toHaveLength(1);
      expect(completed[0].status).toBe("completed");

      expect(cancelled).toHaveLength(1);
      expect(cancelled[0].status).toBe("cancelled");
    });
  });

  describe("getAvailableSchedules", () => {
    it("должен возвращать расписания с доступными местами", async () => {
      await createTestClassSchedule({
        maxParticipants: 8,
        currentParticipants: 5,
        status: "scheduled"
      });
      await createTestClassSchedule({
        maxParticipants: 6,
        currentParticipants: 6,
        status: "scheduled"
      });
      await createTestClassSchedule({
        maxParticipants: 10,
        currentParticipants: 3,
        status: "cancelled"
      });

      const availableSchedules = await classScheduleRepository.getAvailableSchedules();

      expect(availableSchedules).toHaveLength(1);
      expect(availableSchedules[0].currentParticipants).toBeLessThan(availableSchedules[0].maxParticipants);
      expect(availableSchedules[0].status).toBe("scheduled");
    });

    it("должен фильтровать по площадке", async () => {
      // Создаем другую площадку
      const anotherVenue = await db.insert(venues).values({
        name: "Another Venue",
        address: "456 Another St",
        city: "Another City",
        country: "Another Country",
        isActive: true,
      }).returning();

      await createTestClassSchedule({
        maxParticipants: 8,
        currentParticipants: 5,
        status: "scheduled",
        venueId: testVenue.id
      });
      await createTestClassSchedule({
        maxParticipants: 8,
        currentParticipants: 5,
        status: "scheduled",
        venueId: anotherVenue[0].id
      });

      const availableForVenue = await classScheduleRepository.getAvailableSchedules(testVenue.id);

      expect(availableForVenue).toHaveLength(1);
      expect(availableForVenue[0].venueId).toBe(testVenue.id);
    });
  });

  describe("getFullSchedules", () => {
    it("должен возвращать полные расписания (без доступных мест)", async () => {
      await createTestClassSchedule({
        maxParticipants: 8,
        currentParticipants: 8,
        status: "scheduled"
      });
      await createTestClassSchedule({
        maxParticipants: 6,
        currentParticipants: 5,
        status: "scheduled"
      });

      const fullSchedules = await classScheduleRepository.getFullSchedules();

      expect(fullSchedules).toHaveLength(1);
      expect(fullSchedules[0].currentParticipants).toBeGreaterThanOrEqual(fullSchedules[0].maxParticipants);
      expect(fullSchedules[0].status).toBe("scheduled");
    });
  });

  describe("update", () => {
    it("должен обновлять данные расписания класса", async () => {
      const createdSchedule = await createTestClassSchedule();

      const updatedSchedule = await classScheduleRepository.update(createdSchedule.id, {
        maxParticipants: 12,
        currentParticipants: 3,
        status: "completed",
      });

      expect(updatedSchedule).toBeDefined();
      expect(updatedSchedule?.id).toBe(createdSchedule.id);
      expect(updatedSchedule?.maxParticipants).toBe(12);
      expect(updatedSchedule?.currentParticipants).toBe(3);
      expect(updatedSchedule?.status).toBe("completed");
    });

    it("должен возвращать null при обновлении несуществующего расписания", async () => {
      const updatedSchedule = await classScheduleRepository.update("00000000-0000-0000-0000-000000000000", {
        maxParticipants: 10,
      });

      expect(updatedSchedule).toBeNull();
    });
  });

  describe("updateStatus", () => {
    it("должен обновлять статус расписания класса", async () => {
      const createdSchedule = await createTestClassSchedule({ status: "scheduled" });

      const updatedSchedule = await classScheduleRepository.updateStatus(createdSchedule.id, "completed");

      expect(updatedSchedule).toBeDefined();
      expect(updatedSchedule?.status).toBe("completed");
    });
  });

  describe("updateCurrentParticipants", () => {
    it("должен обновлять количество текущих участников", async () => {
      const createdSchedule = await createTestClassSchedule({ currentParticipants: 3 });

      const updatedSchedule = await classScheduleRepository.updateCurrentParticipants(createdSchedule.id, 7);

      expect(updatedSchedule).toBeDefined();
      expect(updatedSchedule?.currentParticipants).toBe(7);
    });
  });

  describe("incrementParticipants", () => {
    it("должен увеличивать количество участников на 1", async () => {
      const createdSchedule = await createTestClassSchedule({ currentParticipants: 3 });

      const updatedSchedule = await classScheduleRepository.incrementParticipants(createdSchedule.id);

      expect(updatedSchedule).toBeDefined();
      expect(updatedSchedule?.currentParticipants).toBe(4);
    });
  });

  describe("decrementParticipants", () => {
    it("должен уменьшать количество участников на 1", async () => {
      const createdSchedule = await createTestClassSchedule({ currentParticipants: 3 });

      const updatedSchedule = await classScheduleRepository.decrementParticipants(createdSchedule.id);

      expect(updatedSchedule).toBeDefined();
      expect(updatedSchedule?.currentParticipants).toBe(2);
    });

    it("не должен уменьшать количество участников ниже 0", async () => {
      const createdSchedule = await createTestClassSchedule({ currentParticipants: 0 });

      const updatedSchedule = await classScheduleRepository.decrementParticipants(createdSchedule.id);

      expect(updatedSchedule).toBeDefined();
      expect(updatedSchedule?.currentParticipants).toBe(0);
    });
  });

  describe("delete", () => {
    it("должен удалять расписание класса", async () => {
      const createdSchedule = await createTestClassSchedule();

      const result = await classScheduleRepository.delete(createdSchedule.id);

      expect(result).toBe(true);

      const deletedSchedule = await classScheduleRepository.getById(createdSchedule.id);
      expect(deletedSchedule).toBeNull();
    });

    it("должен возвращать false при удалении несуществующего расписания", async () => {
      const result = await classScheduleRepository.delete("00000000-0000-0000-0000-000000000000");

      expect(result).toBe(false);
    });
  });

  describe("hasTimeConflict", () => {
    it("должен обнаруживать конфликт времени для корта", async () => {
      const startTime = new Date("2024-12-26T10:00:00Z");
      const endTime = new Date("2024-12-26T11:00:00Z");

      await createTestClassSchedule({
        startTime,
        endTime,
        status: "scheduled"
      });

      // Проверяем пересекающееся время
      const conflictStart = new Date("2024-12-26T10:30:00Z");
      const conflictEnd = new Date("2024-12-26T11:30:00Z");

      const hasConflict = await classScheduleRepository.hasTimeConflict(
        testCourt.id,
        conflictStart,
        conflictEnd
      );

      expect(hasConflict).toBe(true);
    });

    it("не должен обнаруживать конфликт для непересекающегося времени", async () => {
      const startTime = new Date("2024-12-26T10:00:00Z");
      const endTime = new Date("2024-12-26T11:00:00Z");

      await createTestClassSchedule({
        startTime,
        endTime,
        status: "scheduled"
      });

      // Проверяем непересекающееся время
      const noConflictStart = new Date("2024-12-26T12:00:00Z");
      const noConflictEnd = new Date("2024-12-26T13:00:00Z");

      const hasConflict = await classScheduleRepository.hasTimeConflict(
        testCourt.id,
        noConflictStart,
        noConflictEnd
      );

      expect(hasConflict).toBe(false);
    });

    it("должен исключать определенное расписание при проверке конфликта", async () => {
      const startTime = new Date("2024-12-26T10:00:00Z");
      const endTime = new Date("2024-12-26T11:00:00Z");

      const schedule = await createTestClassSchedule({
        startTime,
        endTime,
        status: "scheduled"
      });

      // Проверяем то же время, но исключаем созданное расписание
      const hasConflict = await classScheduleRepository.hasTimeConflict(
        testCourt.id,
        startTime,
        endTime,
        schedule.id
      );

      expect(hasConflict).toBe(false);
    });
  });

  describe("getStats", () => {
    it("должен возвращать статистику по расписаниям классов", async () => {
      await createTestClassSchedule({
        status: "scheduled",
        maxParticipants: 8,
        currentParticipants: 6
      });
      await createTestClassSchedule({
        status: "scheduled",
        maxParticipants: 10,
        currentParticipants: 8
      });
      await createTestClassSchedule({
        status: "completed",
        maxParticipants: 6,
        currentParticipants: 6
      });
      await createTestClassSchedule({
        status: "cancelled",
        maxParticipants: 8,
        currentParticipants: 0
      });

      const stats = await classScheduleRepository.getStats();

      expect(stats.totalSchedules).toBe(4);
      expect(stats.scheduledCount).toBe(2);
      expect(stats.completedCount).toBe(1);
      expect(stats.cancelledCount).toBe(1);
      expect(stats.draftCount).toBe(0);
      expect(stats.totalParticipants).toBe(20); // 6 + 8 + 6 + 0
      expect(stats.averageParticipants).toBe("5.00"); // 20 / 4
      expect(stats.utilizationRate).toBe("62.50"); // 20 / 32 * 100
    });

    it("должен возвращать нулевую статистику для пустой базы", async () => {
      const stats = await classScheduleRepository.getStats();

      expect(stats.totalSchedules).toBe(0);
      expect(stats.scheduledCount).toBe(0);
      expect(stats.completedCount).toBe(0);
      expect(stats.cancelledCount).toBe(0);
      expect(stats.draftCount).toBe(0);
      expect(stats.totalParticipants).toBe(0);
      expect(stats.averageParticipants).toBe("0.00");
      expect(stats.utilizationRate).toBe("0.00");
    });

    it("должен фильтровать статистику по площадке", async () => {
      // Создаем другую площадку
      const anotherVenue = await db.insert(venues).values({
        name: "Another Venue",
        address: "456 Another St",
        city: "Another City",
        country: "Another Country",
        isActive: true,
      }).returning();

      await createTestClassSchedule({
        venueId: testVenue.id,
        status: "scheduled",
        maxParticipants: 8,
        currentParticipants: 6
      });
      await createTestClassSchedule({
        venueId: anotherVenue[0].id,
        status: "scheduled",
        maxParticipants: 10,
        currentParticipants: 8
      });

      const venueStats = await classScheduleRepository.getStats(testVenue.id);

      expect(venueStats.totalSchedules).toBe(1);
      expect(venueStats.scheduledCount).toBe(1);
      expect(venueStats.totalParticipants).toBe(6);
    });
  });

  describe("getInstructorScheduleForDate", () => {
    it("должен возвращать расписания инструктора на определенную дату", async () => {
      const date = new Date("2024-12-26");
      const startTime1 = new Date("2024-12-26T10:00:00Z");
      const startTime2 = new Date("2024-12-26T14:00:00Z");
      const startTime3 = new Date("2024-12-27T10:00:00Z"); // Другая дата

      await createTestClassSchedule({
        instructorId: testInstructor.id,
        startTime: startTime1,
        endTime: new Date(startTime1.getTime() + 60*60*1000)
      });
      await createTestClassSchedule({
        instructorId: testInstructor.id,
        startTime: startTime2,
        endTime: new Date(startTime2.getTime() + 60*60*1000)
      });
      await createTestClassSchedule({
        instructorId: testInstructor.id,
        startTime: startTime3,
        endTime: new Date(startTime3.getTime() + 60*60*1000)
      });

      const schedules = await classScheduleRepository.getInstructorScheduleForDate(testInstructor.id, date);

      expect(schedules).toHaveLength(2);
      expect(schedules.every(s => s.instructorId === testInstructor.id)).toBe(true);
      expect(schedules.every(s => s.startTime.toDateString() === date.toDateString())).toBe(true);
    });
  });

  describe("getCourtScheduleForDate", () => {
    it("должен возвращать расписания корта на определенную дату", async () => {
      const date = new Date("2024-12-26");
      const startTime1 = new Date("2024-12-26T10:00:00Z");
      const startTime2 = new Date("2024-12-26T14:00:00Z");
      const startTime3 = new Date("2024-12-27T10:00:00Z"); // Другая дата

      await createTestClassSchedule({
        courtId: testCourt.id,
        startTime: startTime1,
        endTime: new Date(startTime1.getTime() + 60*60*1000)
      });
      await createTestClassSchedule({
        courtId: testCourt.id,
        startTime: startTime2,
        endTime: new Date(startTime2.getTime() + 60*60*1000)
      });
      await createTestClassSchedule({
        courtId: testCourt.id,
        startTime: startTime3,
        endTime: new Date(startTime3.getTime() + 60*60*1000)
      });

      const schedules = await classScheduleRepository.getCourtScheduleForDate(testCourt.id, date);

      expect(schedules).toHaveLength(2);
      expect(schedules.every(s => s.courtId === testCourt.id)).toBe(true);
      expect(schedules.every(s => s.startTime.toDateString() === date.toDateString())).toBe(true);
    });
  });

  describe("getUpcoming", () => {
    it("должен возвращать предстоящие расписания классов", async () => {
      const now = new Date();
      const futureTime1 = new Date(now.getTime() + 24*60*60*1000); // +1 день
      const futureTime2 = new Date(now.getTime() + 48*60*60*1000); // +2 дня
      const pastTime = new Date(now.getTime() - 24*60*60*1000); // -1 день

      await createTestClassSchedule({
        status: "scheduled",
        startTime: futureTime1,
        endTime: new Date(futureTime1.getTime() + 60*60*1000)
      });
      await createTestClassSchedule({
        status: "scheduled",
        startTime: futureTime2,
        endTime: new Date(futureTime2.getTime() + 60*60*1000)
      });
      await createTestClassSchedule({
        status: "scheduled",
        startTime: pastTime,
        endTime: new Date(pastTime.getTime() + 60*60*1000)
      });

      const upcomingSchedules = await classScheduleRepository.getUpcoming();

      expect(upcomingSchedules).toHaveLength(2);
      expect(upcomingSchedules.every(s => s.status === "scheduled")).toBe(true);
      expect(upcomingSchedules.every(s => s.startTime >= now)).toBe(true);
    });

    it("должен ограничивать количество результатов", async () => {
      const now = new Date();

      // Создаем 3 предстоящих расписания
      for (let i = 1; i <= 3; i++) {
        const futureTime = new Date(now.getTime() + i*24*60*60*1000);
        await createTestClassSchedule({
          status: "scheduled",
          startTime: futureTime,
          endTime: new Date(futureTime.getTime() + 60*60*1000)
        });
      }

      const limitedSchedules = await classScheduleRepository.getUpcoming(2);

      expect(limitedSchedules).toHaveLength(2);
    });
  });

  describe("getPast", () => {
    it("должен возвращать прошедшие расписания классов", async () => {
      const now = new Date();
      const pastTime1 = new Date(now.getTime() - 24*60*60*1000); // -1 день
      const pastTime2 = new Date(now.getTime() - 48*60*60*1000); // -2 дня
      const futureTime = new Date(now.getTime() + 24*60*60*1000); // +1 день

      await createTestClassSchedule({
        startTime: pastTime1,
        endTime: new Date(pastTime1.getTime() + 60*60*1000)
      });
      await createTestClassSchedule({
        startTime: pastTime2,
        endTime: new Date(pastTime2.getTime() + 60*60*1000)
      });
      await createTestClassSchedule({
        startTime: futureTime,
        endTime: new Date(futureTime.getTime() + 60*60*1000)
      });

      const pastSchedules = await classScheduleRepository.getPast();

      expect(pastSchedules).toHaveLength(2);
      expect(pastSchedules.every(s => s.endTime <= now)).toBe(true);
    });
  });

  describe("getAll", () => {
    it("должен возвращать все расписания классов с пагинацией", async () => {
      // Создаем 5 расписаний
      for (let i = 0; i < 5; i++) {
        await createTestClassSchedule();
      }

      const allSchedules = await classScheduleRepository.getAll();
      const limitedSchedules = await classScheduleRepository.getAll(3);
      const offsetSchedules = await classScheduleRepository.getAll(3, 2);

      expect(allSchedules).toHaveLength(5);
      expect(limitedSchedules).toHaveLength(3);
      expect(offsetSchedules).toHaveLength(3);
    });
  });
});
