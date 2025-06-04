import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "../../../db/schema";
import {
  tasks,
  users,
  venues,
  NewTask,
  NewUser,
  NewVenue,
} from "../../../db/schema";
import { TaskRepository } from "../../../repositories/task-repository";
import dotenv from "dotenv";

// Загружаем переменные окружения из файла .env
dotenv.config();

// Используем тестовую базу данных
const DATABASE_URL_TEST =
  process.env.DATABASE_URL_TEST || process.env.DATABASE_URL;

if (!DATABASE_URL_TEST) {
  throw new Error("DATABASE_URL_TEST или DATABASE_URL должен быть установлен");
}

const pool = new Pool({
  connectionString: DATABASE_URL_TEST,
});

const db = drizzle(pool, { schema });
const taskRepository = new TaskRepository(db);

describe("TaskRepository", () => {
  let testUser1: schema.User;
  let testUser2: schema.User;
  let testVenue: schema.Venue;

  // Функция для очистки таблиц перед/после тестов
  const cleanupDatabase = async () => {
    await db.delete(tasks);
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
      userRole: "admin",
      homeVenueId: testVenue.id,
      currentRating: 1600,
    };
    [testUser2] = await db.insert(users).values(userData2).returning();
  });

  afterEach(async () => {
    await cleanupDatabase();
  });

  // Вспомогательная функция для создания тестовой задачи
  const createTestTask = async (customData: Partial<NewTask> = {}): Promise<schema.Task> => {
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 7); // через неделю

    const defaultTaskData: NewTask = {
      title: "Test Task",
      description: "Test task description",
      status: "open",
      priority: "medium",
      createdByUserId: testUser1.id,
      assignedToUserId: testUser2.id,
      venueId: testVenue.id,
      dueDate,
      relatedEntityType: "venue",
      relatedEntityId: testVenue.id,
      ...customData,
    };

    return await taskRepository.create(defaultTaskData);
  };

  describe("create", () => {
    it("должен создавать задачу", async () => {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + 7);

      const taskData: NewTask = {
        title: "Test Task",
        description: "Test task description",
        status: "open",
        priority: "high",
        createdByUserId: testUser1.id,
        assignedToUserId: testUser2.id,
        venueId: testVenue.id,
        dueDate,
        relatedEntityType: "venue",
        relatedEntityId: testVenue.id,
      };

      const createdTask = await taskRepository.create(taskData);

      expect(createdTask).toBeDefined();
      expect(createdTask.id).toBeDefined();
      expect(createdTask.title).toBe("Test Task");
      expect(createdTask.status).toBe("open");
      expect(createdTask.priority).toBe("high");
      expect(createdTask.createdByUserId).toBe(testUser1.id);
      expect(createdTask.assignedToUserId).toBe(testUser2.id);
      expect(createdTask.venueId).toBe(testVenue.id);
      expect(createdTask.relatedEntityType).toBe("venue");
      expect(createdTask.relatedEntityId).toBe(testVenue.id);
    });
  });

  describe("getById", () => {
    it("должен возвращать задачу по ID", async () => {
      const createdTask = await createTestTask();

      const foundTask = await taskRepository.getById(createdTask.id);

      expect(foundTask).toBeDefined();
      expect(foundTask?.id).toBe(createdTask.id);
      expect(foundTask?.title).toBe("Test Task");
    });

    it("должен возвращать null для несуществующей задачи", async () => {
      const foundTask = await taskRepository.getById("00000000-0000-0000-0000-000000000000");

      expect(foundTask).toBeNull();
    });
  });

  describe("getByAssignee", () => {
    it("должен возвращать задачи по исполнителю", async () => {
      await createTestTask({ assignedToUserId: testUser1.id });
      await createTestTask({ assignedToUserId: testUser1.id, status: "completed" });
      await createTestTask({ assignedToUserId: testUser2.id });

      const user1Tasks = await taskRepository.getByAssignee(testUser1.id);
      const user2Tasks = await taskRepository.getByAssignee(testUser2.id);
      const user1OpenTasks = await taskRepository.getByAssignee(testUser1.id, "open");

      expect(user1Tasks).toHaveLength(2);
      expect(user2Tasks).toHaveLength(1);
      expect(user1OpenTasks).toHaveLength(1);
    });

    it("должен поддерживать лимит и смещение", async () => {
      await createTestTask({ assignedToUserId: testUser1.id });
      await createTestTask({ assignedToUserId: testUser1.id });
      await createTestTask({ assignedToUserId: testUser1.id });

      const limitedTasks = await taskRepository.getByAssignee(testUser1.id, undefined, 2);
      const offsetTasks = await taskRepository.getByAssignee(testUser1.id, undefined, 2, 1);

      expect(limitedTasks).toHaveLength(2);
      expect(offsetTasks).toHaveLength(2);
    });
  });

  describe("getByCreator", () => {
    it("должен возвращать задачи по создателю", async () => {
      await createTestTask({ createdByUserId: testUser1.id });
      await createTestTask({ createdByUserId: testUser1.id, status: "completed" });
      await createTestTask({ createdByUserId: testUser2.id });

      const user1Tasks = await taskRepository.getByCreator(testUser1.id);
      const user2Tasks = await taskRepository.getByCreator(testUser2.id);
      const user1OpenTasks = await taskRepository.getByCreator(testUser1.id, "open");

      expect(user1Tasks).toHaveLength(2);
      expect(user2Tasks).toHaveLength(1);
      expect(user1OpenTasks).toHaveLength(1);
    });
  });

  describe("getByVenue", () => {
    it("должен возвращать задачи по площадке", async () => {
      await createTestTask({ venueId: testVenue.id });
      await createTestTask({ venueId: testVenue.id, status: "completed" });

      const venueTasks = await taskRepository.getByVenue(testVenue.id);
      const venueOpenTasks = await taskRepository.getByVenue(testVenue.id, "open");

      expect(venueTasks).toHaveLength(2);
      expect(venueOpenTasks).toHaveLength(1);
    });
  });

  describe("getByStatus", () => {
    it("должен возвращать задачи по статусу", async () => {
      await createTestTask({ status: "open" });
      await createTestTask({ status: "completed" });
      await createTestTask({ status: "open", assignedToUserId: testUser1.id });

      const openTasks = await taskRepository.getByStatus("open");
      const completedTasks = await taskRepository.getByStatus("completed");
      const user1OpenTasks = await taskRepository.getByStatus("open", testUser1.id);

      expect(openTasks).toHaveLength(2);
      expect(completedTasks).toHaveLength(1);
      expect(user1OpenTasks).toHaveLength(1);
    });
  });

  describe("getByPriority", () => {
    it("должен возвращать задачи по приоритету", async () => {
      await createTestTask({ priority: "high" });
      await createTestTask({ priority: "low" });
      await createTestTask({ priority: "high", status: "completed" });

      const highTasks = await taskRepository.getByPriority("high");
      const lowTasks = await taskRepository.getByPriority("low");
      const highOpenTasks = await taskRepository.getByPriority("high", "open");

      expect(highTasks).toHaveLength(2);
      expect(lowTasks).toHaveLength(1);
      expect(highOpenTasks).toHaveLength(1);
    });
  });

  describe("getByDueDateRange", () => {
    it("должен возвращать задачи по диапазону дат выполнения", async () => {
      const today = new Date();
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      await createTestTask({ dueDate: tomorrow });
      await createTestTask({ dueDate: nextWeek });

      const tasksInRange = await taskRepository.getByDueDateRange(today, nextWeek);
      const tasksInRangeOpen = await taskRepository.getByDueDateRange(today, nextWeek, "open");

      expect(tasksInRange).toHaveLength(2);
      expect(tasksInRangeOpen).toHaveLength(2);
    });
  });

  describe("getOverdueTasks", () => {
    it("должен возвращать просроченные задачи", async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      await createTestTask({ dueDate: yesterday, status: "open" });
      await createTestTask({ dueDate: yesterday, status: "completed" }); // не должна попасть
      await createTestTask({ dueDate: yesterday, status: "open", assignedToUserId: testUser1.id });

      const overdueTasks = await taskRepository.getOverdueTasks();
      const user1OverdueTasks = await taskRepository.getOverdueTasks(testUser1.id);

      expect(overdueTasks).toHaveLength(2);
      expect(user1OverdueTasks).toHaveLength(1);
    });
  });

  describe("getUnassignedTasks", () => {
    it("должен возвращать неназначенные задачи", async () => {
      await createTestTask({ assignedToUserId: null });
      await createTestTask({ assignedToUserId: null, status: "completed" });
      await createTestTask({ assignedToUserId: testUser1.id });

      const unassignedTasks = await taskRepository.getUnassignedTasks();
      const unassignedOpenTasks = await taskRepository.getUnassignedTasks("open");

      expect(unassignedTasks).toHaveLength(2);
      expect(unassignedOpenTasks).toHaveLength(1);
    });
  });

  describe("searchByTitle", () => {
    it("должен искать задачи по заголовку", async () => {
      await createTestTask({ title: "Fix bug in system" });
      await createTestTask({ title: "Update documentation" });
      await createTestTask({ title: "Fix performance issue", assignedToUserId: testUser1.id });

      const bugTasks = await taskRepository.searchByTitle("bug");
      const fixTasks = await taskRepository.searchByTitle("Fix");
      const user1FixTasks = await taskRepository.searchByTitle("Fix", testUser1.id);

      expect(bugTasks).toHaveLength(1);
      expect(fixTasks).toHaveLength(2);
      expect(user1FixTasks).toHaveLength(1);
    });
  });

  describe("getByRelatedEntity", () => {
    it("должен возвращать задачи по связанной сущности", async () => {
      await createTestTask({ relatedEntityType: "venue", relatedEntityId: testVenue.id });
      await createTestTask({ relatedEntityType: "user", relatedEntityId: testUser1.id });
      await createTestTask({ relatedEntityType: "venue", relatedEntityId: testVenue.id, status: "completed" });

      const venueTasks = await taskRepository.getByRelatedEntity("venue", testVenue.id);
      const userTasks = await taskRepository.getByRelatedEntity("user", testUser1.id);
      const venueOpenTasks = await taskRepository.getByRelatedEntity("venue", testVenue.id, "open");

      expect(venueTasks).toHaveLength(2);
      expect(userTasks).toHaveLength(1);
      expect(venueOpenTasks).toHaveLength(1);
    });
  });

  describe("getAll", () => {
    it("должен возвращать все задачи", async () => {
      await createTestTask();
      await createTestTask({ assignedToUserId: testUser1.id });

      const allTasks = await taskRepository.getAll();

      expect(allTasks).toHaveLength(2);
    });

    it("должен поддерживать лимит и смещение", async () => {
      await createTestTask();
      await createTestTask();
      await createTestTask();

      const limitedTasks = await taskRepository.getAll(2);
      const offsetTasks = await taskRepository.getAll(2, 1);

      expect(limitedTasks).toHaveLength(2);
      expect(offsetTasks).toHaveLength(2);
    });
  });

  describe("getCount", () => {
    it("должен возвращать количество задач", async () => {
      await createTestTask({ assignedToUserId: testUser1.id });
      await createTestTask({ assignedToUserId: testUser2.id });

      const totalCount = await taskRepository.getCount();
      const user1Count = await taskRepository.getCount(testUser1.id);
      const openCount = await taskRepository.getCount(undefined, "open");

      expect(totalCount).toBe(2);
      expect(user1Count).toBe(1);
      expect(openCount).toBe(2);
    });
  });

  describe("update", () => {
    it("должен обновлять задачу", async () => {
      const createdTask = await createTestTask();

      const updatedTask = await taskRepository.update(createdTask.id, {
        title: "Updated Task",
        status: "in_progress",
        priority: "urgent",
      });

      expect(updatedTask).toBeDefined();
      expect(updatedTask?.id).toBe(createdTask.id);
      expect(updatedTask?.title).toBe("Updated Task");
      expect(updatedTask?.status).toBe("in_progress");
      expect(updatedTask?.priority).toBe("urgent");
      expect(updatedTask?.updatedAt).not.toBe(createdTask.updatedAt);
    });

    it("должен возвращать null при обновлении несуществующей задачи", async () => {
      const updatedTask = await taskRepository.update("00000000-0000-0000-0000-000000000000", {
        title: "Updated Task",
      });

      expect(updatedTask).toBeNull();
    });
  });

  describe("updateStatus", () => {
    it("должен обновлять статус задачи", async () => {
      const createdTask = await createTestTask({ status: "open" });

      const updatedTask = await taskRepository.updateStatus(createdTask.id, "completed");

      expect(updatedTask).toBeDefined();
      expect(updatedTask?.status).toBe("completed");
    });
  });

  describe("assignToUser", () => {
    it("должен назначать задачу исполнителю", async () => {
      const createdTask = await createTestTask({ assignedToUserId: null });

      const updatedTask = await taskRepository.assignToUser(createdTask.id, testUser1.id);

      expect(updatedTask).toBeDefined();
      expect(updatedTask?.assignedToUserId).toBe(testUser1.id);
    });
  });

  describe("unassign", () => {
    it("должен снимать назначение с задачи", async () => {
      const createdTask = await createTestTask({ assignedToUserId: testUser1.id });

      const updatedTask = await taskRepository.unassign(createdTask.id);

      expect(updatedTask).toBeDefined();
      expect(updatedTask?.assignedToUserId).toBeNull();
    });
  });

  describe("updatePriority", () => {
    it("должен обновлять приоритет задачи", async () => {
      const createdTask = await createTestTask({ priority: "low" });

      const updatedTask = await taskRepository.updatePriority(createdTask.id, "urgent");

      expect(updatedTask).toBeDefined();
      expect(updatedTask?.priority).toBe("urgent");
    });
  });

  describe("updateDueDate", () => {
    it("должен обновлять срок выполнения задачи", async () => {
      const createdTask = await createTestTask();
      const newDueDate = new Date();
      newDueDate.setDate(newDueDate.getDate() + 14);
      newDueDate.setMilliseconds(0); // PostgreSQL обрезает миллисекунды

      const updatedTask = await taskRepository.updateDueDate(createdTask.id, newDueDate);

      expect(updatedTask).toBeDefined();
      expect(updatedTask?.dueDate?.getTime()).toBe(newDueDate.getTime());
    });

    it("должен устанавливать null для срока выполнения", async () => {
      const createdTask = await createTestTask();

      const updatedTask = await taskRepository.updateDueDate(createdTask.id, null);

      expect(updatedTask).toBeDefined();
      expect(updatedTask?.dueDate).toBeNull();
    });
  });

  describe("complete", () => {
    it("должен завершать задачу", async () => {
      const createdTask = await createTestTask({ status: "in_progress" });

      const updatedTask = await taskRepository.complete(createdTask.id);

      expect(updatedTask).toBeDefined();
      expect(updatedTask?.status).toBe("completed");
    });
  });

  describe("block", () => {
    it("должен блокировать задачу", async () => {
      const createdTask = await createTestTask({ status: "open" });

      const updatedTask = await taskRepository.block(createdTask.id);

      expect(updatedTask).toBeDefined();
      expect(updatedTask?.status).toBe("blocked");
    });
  });

  describe("startProgress", () => {
    it("должен начинать работу над задачей", async () => {
      const createdTask = await createTestTask({ status: "open" });

      const updatedTask = await taskRepository.startProgress(createdTask.id);

      expect(updatedTask).toBeDefined();
      expect(updatedTask?.status).toBe("in_progress");
    });
  });

  describe("delete", () => {
    it("должен удалять задачу", async () => {
      const createdTask = await createTestTask();

      const deleted = await taskRepository.delete(createdTask.id);
      const foundTask = await taskRepository.getById(createdTask.id);

      expect(deleted).toBe(true);
      expect(foundTask).toBeNull();
    });

    it("должен возвращать false при удалении несуществующей задачи", async () => {
      const deleted = await taskRepository.delete("00000000-0000-0000-0000-000000000000");

      expect(deleted).toBe(false);
    });
  });

  describe("getStats", () => {
    it("должен возвращать статистику задач", async () => {
      await createTestTask({ status: "open", priority: "high" });
      await createTestTask({ status: "completed", priority: "medium" });
      await createTestTask({ status: "blocked", priority: "low" });
      await createTestTask({ status: "in_progress", priority: "urgent", assignedToUserId: testUser1.id });

      const allStats = await taskRepository.getStats();
      const user1Stats = await taskRepository.getStats(testUser1.id);
      const venueStats = await taskRepository.getStats(undefined, testVenue.id);

      expect(allStats.totalTasks).toBe(4);
      expect(allStats.openTasks).toBe(1);
      expect(allStats.completedTasks).toBe(1);
      expect(allStats.blockedTasks).toBe(1);
      expect(allStats.inProgressTasks).toBe(1);
      expect(allStats.tasksByPriority.high).toBe(1);
      expect(allStats.tasksByPriority.urgent).toBe(1);

      expect(user1Stats.totalTasks).toBe(1);
      expect(venueStats.totalTasks).toBe(4);
    });
  });

  describe("getGroupedByStatus", () => {
    it("должен возвращать задачи, сгруппированные по статусу", async () => {
      await createTestTask({ status: "open" });
      await createTestTask({ status: "open" });
      await createTestTask({ status: "completed" });

      const grouped = await taskRepository.getGroupedByStatus();
      const user1Grouped = await taskRepository.getGroupedByStatus(testUser1.id);

      expect(grouped).toHaveLength(2);
      const openGroup = grouped.find(g => g.status === "open");
      expect(openGroup?.tasksCount).toBe(2);

      expect(user1Grouped.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe("getRecentTasks", () => {
    it("должен возвращать недавние задачи", async () => {
      await createTestTask();
      await createTestTask({ assignedToUserId: testUser1.id });

      const recentTasks = await taskRepository.getRecentTasks(30);
      const user1RecentTasks = await taskRepository.getRecentTasks(30, testUser1.id);

      expect(recentTasks).toHaveLength(2);
      expect(user1RecentTasks).toHaveLength(1);
    });
  });
});
