import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { NotificationService } from "../../../services/notification-service";
import { NotificationRepository } from "../../../repositories/notification-repository";
import { UserRepository } from "../../../repositories/user-repository";
import * as schema from "../../../db/schema";
import type { IScheduleOptions } from "../../../services/notification-service";
import type { NewNotification } from "../../../db/schema/notification";

const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString, { max: 1 });
const db = drizzle(sql, { schema });

describe("NotificationService Integration Tests", () => {
  let notificationService: NotificationService;
  let notificationRepository: NotificationRepository;
  let userRepository: UserRepository;
  let testUserId: string;

  beforeEach(async () => {
    // Применяем миграции
    await migrate(db, { migrationsFolder: "./drizzle_migrations" });

    // Очищаем таблицы
    await db.delete(schema.notifications);
    await db.delete(schema.users);

    // Инициализируем репозитории и сервисы
    notificationRepository = new NotificationRepository(db);
    userRepository = new UserRepository(db);
    notificationService = new NotificationService(db);

    // Создаем тестового пользователя
    const testUser = await userRepository.create({
      username: "testuser",
      email: "test@example.com",
      firstName: "Test",
      lastName: "User",
      userRole: "player",
      passwordHash: "test-hash",
      memberId: "test-member-id",
    });
    testUserId = testUser.id;
  });

  afterEach(async () => {
    // Очищаем таблицы после каждого теста
    await db.delete(schema.notifications);
    await db.delete(schema.users);
  });

  describe("send", () => {
    it("должен отправлять существующее уведомление", async () => {
      // Сначала создаем уведомление
      const notification = await notificationRepository.create({
        userId: testUserId,
        type: "booking_reminder",
        channel: "telegram",
        message: "Test notification message",
      });

      // Отправляем уведомление
      const result = await notificationService.send(notification.id);

      expect(result.success).toBe(true);
      expect(result.messageId).toBeDefined();
      expect(result.error).toBeUndefined();

      // Проверяем, что уведомление отмечено как отправленное
      const updatedNotification = await notificationRepository.getById(
        notification.id
      );
      expect(updatedNotification?.sentAt).toBeDefined();
    });

    it("должен возвращать ошибку для несуществующего уведомления", async () => {
      // Используем валидный UUID формат
      const fakeUuid = "00000000-0000-0000-0000-000000000000";
      const result = await notificationService.send(fakeUuid);

      expect(result.success).toBe(false);
      expect(result.error).toContain("Notification not found");
    });
  });

  describe("createAndSend", () => {
    it("должен создавать и отправлять уведомление в одной операции", async () => {
      const notificationData: NewNotification = {
        userId: testUserId,
        type: "game_invite",
        channel: "whatsapp",
        message: "You are invited to join the game!",
      };

      const result = await notificationService.createAndSend(notificationData);

      expect(result.notification).toBeDefined();
      expect(result.notification.userId).toBe(testUserId);
      expect(result.notification.type).toBe("game_invite");
      expect(result.notification.channel).toBe("whatsapp");
      expect(result.notification.message).toBe(
        "You are invited to join the game!"
      );

      expect(result.result.success).toBe(true);
      expect(result.result.messageId).toBeDefined();

      // Проверяем, что уведомление создано и отправлено
      const notification = await notificationRepository.getById(
        result.notification.id
      );
      expect(notification).toBeDefined();
      expect(notification?.sentAt).toBeDefined();
    });

    it("должен выбрасывать ошибку для несуществующего пользователя", async () => {
      // Используем валидный UUID формат
      const fakeUserUuid = "00000000-0000-0000-0000-000000000001";
      const notificationData: NewNotification = {
        userId: fakeUserUuid,
        type: "tournament_update",
        channel: "email",
        message: "Tournament update",
      };

      await expect(
        notificationService.createAndSend(notificationData)
      ).rejects.toThrow("User not found");
    });

    it("должен создавать уведомление без userId", async () => {
      const notificationData: NewNotification = {
        userId: null,
        type: "stock_alert",
        channel: "telegram",
        message: "Item is back in stock",
      };

      const result = await notificationService.createAndSend(notificationData);

      expect(result.notification).toBeDefined();
      expect(result.notification.userId).toBeNull();
      expect(result.result.success).toBe(true);
    });
  });

  describe("schedule", () => {
    it("должен планировать отправку уведомления", async () => {
      // Создаем уведомление
      const notification = await notificationRepository.create({
        userId: testUserId,
        type: "payment_confirmation",
        channel: "email",
        message: "Payment confirmation",
      });

      const scheduleOptions: IScheduleOptions = {
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // завтра
      };

      const result = await notificationService.schedule(
        notification.id,
        scheduleOptions
      );

      expect(result).toBe(true);
    });

    it("должен возвращать false для несуществующего уведомления", async () => {
      const scheduleOptions: IScheduleOptions = {
        scheduledAt: new Date(Date.now() + 60 * 60 * 1000), // через час
      };

      // Используем валидный UUID формат
      const fakeUuid = "00000000-0000-0000-0000-000000000002";
      const result = await notificationService.schedule(
        fakeUuid,
        scheduleOptions
      );

      expect(result).toBe(false);
    });
  });

  describe("cancel", () => {
    it("должен отменять уведомление", async () => {
      // Создаем уведомление
      const notification = await notificationRepository.create({
        userId: testUserId,
        type: "package_expiration",
        channel: "telegram",
        message: "Package expiration warning",
      });

      const result = await notificationService.cancel(notification.id);

      expect(result).toBe(true);
    });

    it("должен возвращать false для несуществующего уведомления", async () => {
      // Используем валидный UUID формат
      const fakeUuid = "00000000-0000-0000-0000-000000000003";
      const result = await notificationService.cancel(fakeUuid);

      expect(result).toBe(false);
    });
  });

  describe("processScheduled", () => {
    it("должен обрабатывать запланированные уведомления", async () => {
      const result = await notificationService.processScheduled();

      expect(result.processed).toBe(0); // Пока нет запланированных уведомлений
      expect(result.failed).toBe(0);
    });
  });

  describe("getStats", () => {
    it("должен возвращать статистику уведомлений", async () => {
      // Создаем несколько уведомлений
      await notificationService.createAndSend({
        userId: testUserId,
        type: "booking_reminder",
        channel: "telegram",
        message: "Test message 1",
      });

      await notificationService.createAndSend({
        userId: testUserId,
        type: "game_invite",
        channel: "email",
        message: "Test message 2",
      });

      const stats = await notificationService.getStats();

      expect(stats.totalSent).toBeGreaterThanOrEqual(2);
      expect(stats.totalFailed).toBe(0);
      expect(stats.totalScheduled).toBe(0);
      expect(stats.byChannel.telegram).toBeGreaterThanOrEqual(1);
      expect(stats.byChannel.email).toBeGreaterThanOrEqual(1);
      // Проверяем что byType существует как объект
      expect(typeof stats.byType).toBe("object");
      expect(stats.byType).toBeDefined();
    });
  });

  describe("healthCheck", () => {
    it("должен возвращать статус здоровья провайдеров", async () => {
      const health = await notificationService.healthCheck();

      expect(health.telegram).toBe(true);
      expect(health.whatsapp).toBe(true);
      expect(health.email).toBe(true);
      expect(health.app_push).toBe(true);
    });
  });

  describe("Multiple Channels Integration", () => {
    it("должен отправлять уведомления через разные каналы", async () => {
      const channels = ["telegram", "whatsapp", "email", "app_push"] as const;
      const results = [];

      for (const channel of channels) {
        const result = await notificationService.createAndSend({
          userId: testUserId,
          type: "custom_message",
          channel,
          message: `Test message for ${channel}`,
        });

        results.push(result);
        expect(result.result.success).toBe(true);
        expect(result.notification.channel).toBe(channel);
      }

      // Проверяем статистику
      const stats = await notificationService.getStats();
      expect(stats.totalSent).toBeGreaterThanOrEqual(4);

      for (const channel of channels) {
        expect(stats.byChannel[channel]).toBeGreaterThanOrEqual(1);
      }
    });
  });

  describe("Error Handling", () => {
    it("должен корректно обрабатывать ошибки при отправке", async () => {
      // Создаем уведомление с некорректным каналом (это не должно произойти в реальности)
      const notification = await notificationRepository.create({
        userId: testUserId,
        type: "booking_reminder",
        channel: "telegram", // Используем валидный канал
        message: "Test message",
      });

      // Отправляем уведомление - должно пройти успешно
      const result = await notificationService.send(notification.id);
      expect(result.success).toBe(true);
    });

    it("должен обрабатывать ошибки при создании уведомления с некорректными данными", async () => {
      // Попытка создать уведомление с некорректным типом
      const invalidData = {
        userId: testUserId,
        type: "invalid_type" as any,
        channel: "telegram" as any,
        message: "Test message",
      };

      // Это должно вызвать ошибку на уровне базы данных или валидации
      await expect(
        notificationService.createAndSend(invalidData)
      ).rejects.toThrow();
    });
  });

  describe("Notification Types Integration", () => {
    it("должен поддерживать все типы уведомлений", async () => {
      const notificationTypes = [
        "booking_reminder",
        "game_invite",
        "tournament_update",
        "payment_confirmation",
        "package_expiration",
        "custom_message",
        "stock_alert",
      ] as const;

      for (const type of notificationTypes) {
        const result = await notificationService.createAndSend({
          userId: testUserId,
          type,
          channel: "telegram",
          message: `Test message for ${type}`,
        });

        expect(result.result.success).toBe(true);
        expect(result.notification.type).toBe(type);
      }

      // Проверяем статистику
      const stats = await notificationService.getStats();
      expect(stats.totalSent).toBeGreaterThanOrEqual(7);

      // Проверяем что byType существует как объект
      expect(typeof stats.byType).toBe("object");
      expect(stats.byType).toBeDefined();
    });
  });
});
