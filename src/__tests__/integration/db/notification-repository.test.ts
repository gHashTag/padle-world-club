import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { eq } from "drizzle-orm";
import * as schema from "../../../db/schema";
import {
  notifications,
  users,
  venues,
  NewNotification,
  NewUser,
  NewVenue,
} from "../../../db/schema";
import { NotificationRepository } from "../../../repositories/notification-repository";
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
const notificationRepository = new NotificationRepository(db);

describe("NotificationRepository", () => {
  let testUser1: schema.User;
  let testUser2: schema.User;
  let testVenue: schema.Venue;

  // Функция для очистки таблиц перед/после тестов
  const cleanupDatabase = async () => {
    await db.delete(notifications);
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

  // Вспомогательная функция для создания тестового уведомления
  const createTestNotification = async (customData: Partial<NewNotification> = {}): Promise<schema.Notification> => {
    const defaultNotificationData: NewNotification = {
      userId: testUser1.id,
      type: "booking_reminder",
      channel: "whatsapp",
      message: "Test notification message",
      isRead: false,
      isSent: false,
      relatedEntityType: "venue",
      relatedEntityId: testVenue.id,
      ...customData,
    };

    return await notificationRepository.create(defaultNotificationData);
  };

  describe("create", () => {
    it("должен создавать уведомление", async () => {
      const notificationData: NewNotification = {
        userId: testUser1.id,
        type: "payment_confirmation",
        channel: "telegram",
        message: "Your booking has been confirmed",
        isRead: false,
        isSent: false,
        relatedEntityType: "venue",
        relatedEntityId: testVenue.id,
      };

      const createdNotification = await notificationRepository.create(notificationData);

      expect(createdNotification).toBeDefined();
      expect(createdNotification.id).toBeDefined();
      expect(createdNotification.userId).toBe(testUser1.id);
      expect(createdNotification.type).toBe("payment_confirmation");
      expect(createdNotification.channel).toBe("telegram");
      expect(createdNotification.message).toBe("Your booking has been confirmed");
      expect(createdNotification.isRead).toBe(false);
      expect(createdNotification.isSent).toBe(false);
      expect(createdNotification.relatedEntityType).toBe("venue");
      expect(createdNotification.relatedEntityId).toBe(testVenue.id);
    });
  });

  describe("getById", () => {
    it("должен возвращать уведомление по ID", async () => {
      const createdNotification = await createTestNotification();

      const foundNotification = await notificationRepository.getById(createdNotification.id);

      expect(foundNotification).toBeDefined();
      expect(foundNotification?.id).toBe(createdNotification.id);
      expect(foundNotification?.message).toBe("Test notification message");
    });

    it("должен возвращать null для несуществующего уведомления", async () => {
      const foundNotification = await notificationRepository.getById("00000000-0000-0000-0000-000000000000");

      expect(foundNotification).toBeNull();
    });
  });

  describe("getByUser", () => {
    it("должен возвращать уведомления пользователя", async () => {
      await createTestNotification({ userId: testUser1.id });
      await createTestNotification({ userId: testUser1.id, isRead: true });
      await createTestNotification({ userId: testUser2.id });

      const user1Notifications = await notificationRepository.getByUser(testUser1.id);
      const user2Notifications = await notificationRepository.getByUser(testUser2.id);
      const user1UnreadNotifications = await notificationRepository.getByUser(testUser1.id, false);

      expect(user1Notifications).toHaveLength(2);
      expect(user2Notifications).toHaveLength(1);
      expect(user1UnreadNotifications).toHaveLength(1);
    });

    it("должен поддерживать лимит и смещение", async () => {
      await createTestNotification({ userId: testUser1.id });
      await createTestNotification({ userId: testUser1.id });
      await createTestNotification({ userId: testUser1.id });

      const limitedNotifications = await notificationRepository.getByUser(testUser1.id, undefined, 2);
      const offsetNotifications = await notificationRepository.getByUser(testUser1.id, undefined, 2, 1);

      expect(limitedNotifications).toHaveLength(2);
      expect(offsetNotifications).toHaveLength(2);
    });
  });

  describe("getByType", () => {
    it("должен возвращать уведомления по типу", async () => {
      await createTestNotification({ type: "booking_reminder" });
      await createTestNotification({ type: "payment_confirmation" });
      await createTestNotification({ type: "booking_reminder", userId: testUser2.id });

      const bookingReminders = await notificationRepository.getByType("booking_reminder");
      const paymentConfirmations = await notificationRepository.getByType("payment_confirmation");
      const user1BookingReminders = await notificationRepository.getByType("booking_reminder", testUser1.id);

      expect(bookingReminders).toHaveLength(2);
      expect(paymentConfirmations).toHaveLength(1);
      expect(user1BookingReminders).toHaveLength(1);
    });
  });

  describe("getByChannel", () => {
    it("должен возвращать уведомления по каналу", async () => {
      await createTestNotification({ channel: "whatsapp" });
      await createTestNotification({ channel: "telegram" });
      await createTestNotification({ channel: "whatsapp", isSent: true });

      const whatsappNotifications = await notificationRepository.getByChannel("whatsapp");
      const telegramNotifications = await notificationRepository.getByChannel("telegram");
      const sentWhatsappNotifications = await notificationRepository.getByChannel("whatsapp", true);

      expect(whatsappNotifications).toHaveLength(2);
      expect(telegramNotifications).toHaveLength(1);
      expect(sentWhatsappNotifications).toHaveLength(1);
    });
  });

  describe("getUnsent", () => {
    it("должен возвращать неотправленные уведомления", async () => {
      await createTestNotification({ isSent: false });
      await createTestNotification({ isSent: true });
      await createTestNotification({ isSent: false, channel: "telegram" });

      const unsentNotifications = await notificationRepository.getUnsent();
      const unsentWhatsappNotifications = await notificationRepository.getUnsent("whatsapp");

      expect(unsentNotifications).toHaveLength(2);
      expect(unsentWhatsappNotifications).toHaveLength(1);
    });
  });

  describe("getUnread", () => {
    it("должен возвращать непрочитанные уведомления пользователя", async () => {
      await createTestNotification({ userId: testUser1.id, isRead: false });
      await createTestNotification({ userId: testUser1.id, isRead: true });
      await createTestNotification({ userId: testUser1.id, isRead: false, type: "payment_confirmation" });

      const unreadNotifications = await notificationRepository.getUnread(testUser1.id);
      const unreadBookingReminders = await notificationRepository.getUnread(testUser1.id, "booking_reminder");

      expect(unreadNotifications).toHaveLength(2);
      expect(unreadBookingReminders).toHaveLength(1);
    });
  });

  describe("getByRelatedEntity", () => {
    it("должен возвращать уведомления по связанной сущности", async () => {
      await createTestNotification({ relatedEntityType: "venue", relatedEntityId: testVenue.id });
      await createTestNotification({ relatedEntityType: "user", relatedEntityId: testUser1.id });
      await createTestNotification({ relatedEntityType: "venue", relatedEntityId: testVenue.id, userId: testUser2.id });

      const venueNotifications = await notificationRepository.getByRelatedEntity("venue", testVenue.id);
      const userNotifications = await notificationRepository.getByRelatedEntity("user", testUser1.id);
      const user1VenueNotifications = await notificationRepository.getByRelatedEntity("venue", testVenue.id, testUser1.id);

      expect(venueNotifications).toHaveLength(2);
      expect(userNotifications).toHaveLength(1);
      expect(user1VenueNotifications).toHaveLength(1);
    });
  });

  describe("searchByMessage", () => {
    it("должен искать уведомления по сообщению", async () => {
      await createTestNotification({ message: "Your booking is confirmed" });
      await createTestNotification({ message: "Payment received successfully" });
      await createTestNotification({ message: "Booking reminder for tomorrow", userId: testUser2.id });

      const bookingMessages = await notificationRepository.searchByMessage("booking");
      const paymentMessages = await notificationRepository.searchByMessage("Payment");
      const user2BookingMessages = await notificationRepository.searchByMessage("Booking", testUser2.id);

      expect(bookingMessages).toHaveLength(1); // только "Your booking is confirmed"
      expect(paymentMessages).toHaveLength(1);
      expect(user2BookingMessages).toHaveLength(1);
    });
  });

  describe("getByDateRange", () => {
    it("должен возвращать уведомления по диапазону дат", async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      await createTestNotification();
      await createTestNotification({ userId: testUser2.id });

      const notificationsInRange = await notificationRepository.getByDateRange(yesterday, tomorrow);
      const user1NotificationsInRange = await notificationRepository.getByDateRange(yesterday, tomorrow, testUser1.id);

      expect(notificationsInRange).toHaveLength(2);
      expect(user1NotificationsInRange).toHaveLength(1);
    });
  });

  describe("getAll", () => {
    it("должен возвращать все уведомления", async () => {
      await createTestNotification();
      await createTestNotification({ userId: testUser2.id });

      const allNotifications = await notificationRepository.getAll();

      expect(allNotifications).toHaveLength(2);
    });

    it("должен поддерживать лимит и смещение", async () => {
      await createTestNotification();
      await createTestNotification();
      await createTestNotification();

      const limitedNotifications = await notificationRepository.getAll(2);
      const offsetNotifications = await notificationRepository.getAll(2, 1);

      expect(limitedNotifications).toHaveLength(2);
      expect(offsetNotifications).toHaveLength(2);
    });
  });

  describe("getCount", () => {
    it("должен возвращать количество уведомлений", async () => {
      await createTestNotification({ userId: testUser1.id });
      await createTestNotification({ userId: testUser2.id, isRead: true });

      const totalCount = await notificationRepository.getCount();
      const user1Count = await notificationRepository.getCount(testUser1.id);
      const readCount = await notificationRepository.getCount(undefined, true);

      expect(totalCount).toBe(2);
      expect(user1Count).toBe(1);
      expect(readCount).toBe(1);
    });
  });

  describe("update", () => {
    it("должен обновлять уведомление", async () => {
      const createdNotification = await createTestNotification();

      const updatedNotification = await notificationRepository.update(createdNotification.id, {
        message: "Updated message",
        isRead: true,
      });

      expect(updatedNotification).toBeDefined();
      expect(updatedNotification?.id).toBe(createdNotification.id);
      expect(updatedNotification?.message).toBe("Updated message");
      expect(updatedNotification?.isRead).toBe(true);
      expect(updatedNotification?.updatedAt).not.toBe(createdNotification.updatedAt);
    });

    it("должен возвращать null при обновлении несуществующего уведомления", async () => {
      const updatedNotification = await notificationRepository.update("00000000-0000-0000-0000-000000000000", {
        message: "Updated message",
      });

      expect(updatedNotification).toBeNull();
    });
  });

  describe("markAsSent", () => {
    it("должен отмечать уведомление как отправленное", async () => {
      const createdNotification = await createTestNotification({ isSent: false });

      const updatedNotification = await notificationRepository.markAsSent(createdNotification.id);

      expect(updatedNotification).toBeDefined();
      expect(updatedNotification?.isSent).toBe(true);
      expect(updatedNotification?.sentAt).toBeDefined();
    });
  });

  describe("markAsRead", () => {
    it("должен отмечать уведомление как прочитанное", async () => {
      const createdNotification = await createTestNotification({ isRead: false });

      const updatedNotification = await notificationRepository.markAsRead(createdNotification.id);

      expect(updatedNotification).toBeDefined();
      expect(updatedNotification?.isRead).toBe(true);
      expect(updatedNotification?.readAt).toBeDefined();
    });
  });

  describe("markAllAsRead", () => {
    it("должен отмечать все уведомления пользователя как прочитанные", async () => {
      await createTestNotification({ userId: testUser1.id, isRead: false });
      await createTestNotification({ userId: testUser1.id, isRead: false });
      await createTestNotification({ userId: testUser2.id, isRead: false });

      const updatedCount = await notificationRepository.markAllAsRead(testUser1.id);
      const user1Notifications = await notificationRepository.getByUser(testUser1.id);

      expect(updatedCount).toBe(2);
      expect(user1Notifications.every(n => n.isRead)).toBe(true);
    });

    it("должен отмечать уведомления определенного типа как прочитанные", async () => {
      await createTestNotification({ userId: testUser1.id, isRead: false, type: "booking_reminder" });
      await createTestNotification({ userId: testUser1.id, isRead: false, type: "payment_confirmation" });

      const updatedCount = await notificationRepository.markAllAsRead(testUser1.id, "booking_reminder");

      expect(updatedCount).toBe(1);
    });
  });

  describe("markMultipleAsSent", () => {
    it("должен отмечать несколько уведомлений как отправленные", async () => {
      const notification1 = await createTestNotification({ isSent: false });
      const notification2 = await createTestNotification({ isSent: false });
      await createTestNotification({ isSent: false }); // третье уведомление не обновляем

      const updatedCount = await notificationRepository.markMultipleAsSent([notification1.id, notification2.id]);

      expect(updatedCount).toBe(2);

      const sentNotifications = await notificationRepository.getByChannel("whatsapp", true);
      expect(sentNotifications).toHaveLength(2);
    });

    it("должен возвращать 0 для пустого массива", async () => {
      const updatedCount = await notificationRepository.markMultipleAsSent([]);

      expect(updatedCount).toBe(0);
    });
  });

  describe("delete", () => {
    it("должен удалять уведомление", async () => {
      const createdNotification = await createTestNotification();

      const deleted = await notificationRepository.delete(createdNotification.id);
      const foundNotification = await notificationRepository.getById(createdNotification.id);

      expect(deleted).toBe(true);
      expect(foundNotification).toBeNull();
    });

    it("должен возвращать false при удалении несуществующего уведомления", async () => {
      const deleted = await notificationRepository.delete("00000000-0000-0000-0000-000000000000");

      expect(deleted).toBe(false);
    });
  });

  describe("deleteOld", () => {
    it("должен удалять старые уведомления", async () => {
      // Создаем уведомления с разными датами
      const oldNotification = await createTestNotification({ isRead: true });

      // Обновляем дату создания на старую (симулируем старое уведомление)
      await db.update(notifications)
        .set({ createdAt: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000) }) // 31 день назад
        .where(eq(notifications.id, oldNotification.id));

      await createTestNotification({ isRead: false }); // новое уведомление

      const deletedCount = await notificationRepository.deleteOld(30, true); // удаляем только прочитанные старше 30 дней

      expect(deletedCount).toBe(1);

      const remainingNotifications = await notificationRepository.getAll();
      expect(remainingNotifications).toHaveLength(1);
    });
  });

  describe("getStats", () => {
    it("должен возвращать статистику уведомлений", async () => {
      await createTestNotification({ isSent: true, isRead: true, channel: "whatsapp" });
      await createTestNotification({ isSent: false, isRead: false, channel: "telegram" });
      await createTestNotification({ isSent: true, isRead: false, channel: "email" });
      await createTestNotification({ isSent: true, isRead: true, channel: "app_push", userId: testUser2.id });

      const allStats = await notificationRepository.getStats();
      const user1Stats = await notificationRepository.getStats(testUser1.id);

      expect(allStats.totalNotifications).toBe(4);
      expect(allStats.sentNotifications).toBe(3);
      expect(allStats.unsentNotifications).toBe(1);
      expect(allStats.readNotifications).toBe(2);
      expect(allStats.unreadNotifications).toBe(2);
      expect(allStats.notificationsByChannel.whatsapp).toBe(1);
      expect(allStats.notificationsByChannel.telegram).toBe(1);
      expect(allStats.notificationsByChannel.email).toBe(1);
      expect(allStats.notificationsByChannel.app_push).toBe(1);

      expect(user1Stats.totalNotifications).toBe(3);
    });
  });

  describe("getGroupedByType", () => {
    it("должен возвращать уведомления, сгруппированные по типу", async () => {
      await createTestNotification({ type: "booking_reminder", isSent: true, isRead: true });
      await createTestNotification({ type: "booking_reminder", isSent: false, isRead: false });
      await createTestNotification({ type: "payment_confirmation", isSent: true, isRead: true });

      const grouped = await notificationRepository.getGroupedByType();
      const user1Grouped = await notificationRepository.getGroupedByType(testUser1.id);

      expect(grouped).toHaveLength(2);
      const bookingGroup = grouped.find(g => g.type === "booking_reminder");
      expect(bookingGroup?.notificationsCount).toBe(2);
      expect(bookingGroup?.sentCount).toBe(1);
      expect(bookingGroup?.readCount).toBe(1);

      expect(user1Grouped.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe("getRecentNotifications", () => {
    it("должен возвращать недавние уведомления", async () => {
      await createTestNotification();
      await createTestNotification({ userId: testUser2.id });

      const recentNotifications = await notificationRepository.getRecentNotifications(30);
      const user1RecentNotifications = await notificationRepository.getRecentNotifications(30, testUser1.id);

      expect(recentNotifications).toHaveLength(2);
      expect(user1RecentNotifications).toHaveLength(1);
    });
  });
});
