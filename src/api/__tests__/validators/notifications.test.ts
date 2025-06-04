/**
 * Тесты для валидаторов уведомлений
 */

import { describe, it, expect } from "vitest";
import {
  createNotificationSchema,
  updateNotificationSchema,
  bulkCreateNotificationSchema,
  bulkUpdateStatusSchema,
  searchNotificationsSchema,
  getStatsSchema,
  cleanupNotificationsSchema,
  notificationTypeSchema,
  notificationChannelSchema,
  relatedEntityTypeSchema,
} from "../../validators/notifications";

describe("Notification Validators", () => {
  describe("notificationTypeSchema", () => {
    it("должен принимать валидные типы уведомлений", () => {
      const validTypes = [
        "booking_reminder",
        "game_invite",
        "tournament_update",
        "payment_confirmation",
        "package_expiration",
        "custom_message",
        "stock_alert",
      ];

      validTypes.forEach((type) => {
        expect(() => notificationTypeSchema.parse(type)).not.toThrow();
      });
    });

    it("должен отклонять невалидные типы", () => {
      const invalidTypes = ["invalid_type", "", null, undefined, 123];

      invalidTypes.forEach((type) => {
        expect(() => notificationTypeSchema.parse(type)).toThrow();
      });
    });
  });

  describe("notificationChannelSchema", () => {
    it("должен принимать валидные каналы", () => {
      const validChannels = ["whatsapp", "telegram", "email", "app_push"];

      validChannels.forEach((channel) => {
        expect(() => notificationChannelSchema.parse(channel)).not.toThrow();
      });
    });

    it("должен отклонять невалидные каналы", () => {
      const invalidChannels = ["sms", "invalid", "", null, undefined];

      invalidChannels.forEach((channel) => {
        expect(() => notificationChannelSchema.parse(channel)).toThrow();
      });
    });
  });

  describe("relatedEntityTypeSchema", () => {
    it("должен принимать валидные типы сущностей", () => {
      const validTypes = [
        "booking",
        "user",
        "court",
        "venue",
        "tournament",
        "class_schedule",
        "game_session",
        "order",
        "payment",
        "product",
        "training_package",
        "task",
      ];

      validTypes.forEach((type) => {
        expect(() => relatedEntityTypeSchema.parse(type)).not.toThrow();
      });
    });

    it("должен отклонять невалидные типы сущностей", () => {
      const invalidTypes = ["invalid_entity", "", null, undefined];

      invalidTypes.forEach((type) => {
        expect(() => relatedEntityTypeSchema.parse(type)).toThrow();
      });
    });
  });

  describe("createNotificationSchema", () => {
    const validNotification = {
      userId: "123e4567-e89b-12d3-a456-426614174000",
      type: "booking_reminder",
      message: "Напоминание о бронировании",
      channel: "telegram",
    };

    it("должен принимать валидные данные", () => {
      expect(() =>
        createNotificationSchema.parse(validNotification)
      ).not.toThrow();
    });

    it("должен принимать данные с опциональными полями", () => {
      const withOptional = {
        ...validNotification,
        relatedEntityId: "123e4567-e89b-12d3-a456-426614174001",
        relatedEntityType: "booking",
      };

      expect(() => createNotificationSchema.parse(withOptional)).not.toThrow();
    });

    it("должен отклонять данные без обязательных полей", () => {
      const requiredFields = ["userId", "type", "message", "channel"];

      requiredFields.forEach((field) => {
        const invalid = { ...validNotification };
        delete invalid[field as keyof typeof invalid];
        expect(() => createNotificationSchema.parse(invalid)).toThrow();
      });
    });

    it("должен отклонять невалидный UUID для userId", () => {
      const invalid = { ...validNotification, userId: "invalid-uuid" };
      expect(() => createNotificationSchema.parse(invalid)).toThrow();
    });

    it("должен отклонять слишком длинное сообщение", () => {
      const invalid = { ...validNotification, message: "a".repeat(1001) };
      expect(() => createNotificationSchema.parse(invalid)).toThrow();
    });

    it("должен отклонять невалидный тип уведомления", () => {
      const invalid = { ...validNotification, type: "invalid_type" };
      expect(() => createNotificationSchema.parse(invalid)).toThrow();
    });

    it("должен отклонять невалидный канал", () => {
      const invalid = { ...validNotification, channel: "invalid_channel" };
      expect(() => createNotificationSchema.parse(invalid)).toThrow();
    });
  });

  describe("updateNotificationSchema", () => {
    it("должен принимать частичные обновления", () => {
      const updates = [
        { message: "Обновленное сообщение" },
        { channel: "email" },
        { isRead: true },
        { isSent: true },
        { relatedEntityId: "123e4567-e89b-12d3-a456-426614174000" },
        { relatedEntityType: "user" },
      ];

      updates.forEach((update) => {
        expect(() => updateNotificationSchema.parse(update)).not.toThrow();
      });
    });

    it("должен принимать пустой объект", () => {
      expect(() => updateNotificationSchema.parse({})).not.toThrow();
    });

    it("должен отклонять невалидные значения", () => {
      const invalidUpdates = [
        { message: "a".repeat(1001) },
        { channel: "invalid_channel" },
        { isRead: "not_boolean" },
        { isSent: "not_boolean" },
        { relatedEntityId: "invalid-uuid" },
        { relatedEntityType: "invalid_type" },
      ];

      invalidUpdates.forEach((update) => {
        expect(() => updateNotificationSchema.parse(update)).toThrow();
      });
    });
  });

  describe("bulkCreateNotificationSchema", () => {
    const validNotification = {
      userId: "123e4567-e89b-12d3-a456-426614174000",
      type: "booking_reminder",
      message: "Напоминание о бронировании",
      channel: "telegram",
    };

    it("должен принимать массив валидных уведомлений", () => {
      const bulk = {
        notifications: [
          validNotification,
          { ...validNotification, type: "game_invite" },
        ],
      };

      expect(() => bulkCreateNotificationSchema.parse(bulk)).not.toThrow();
    });

    it("должен отклонять пустой массив", () => {
      const bulk = { notifications: [] };
      expect(() => bulkCreateNotificationSchema.parse(bulk)).toThrow();
    });

    it("должен отклонять слишком большой массив", () => {
      const notifications = Array(101).fill(validNotification);
      const bulk = { notifications };
      expect(() => bulkCreateNotificationSchema.parse(bulk)).toThrow();
    });

    it("должен отклонять массив с невалидными уведомлениями", () => {
      const bulk = {
        notifications: [
          validNotification,
          { ...validNotification, userId: "invalid-uuid" },
        ],
      };

      expect(() => bulkCreateNotificationSchema.parse(bulk)).toThrow();
    });
  });

  describe("bulkUpdateStatusSchema", () => {
    const validIds = [
      "123e4567-e89b-12d3-a456-426614174000",
      "123e4567-e89b-12d3-a456-426614174001",
    ];

    it("должен принимать валидные данные", () => {
      const updates = [
        { notificationIds: validIds, isRead: true },
        { notificationIds: validIds, isSent: true },
        { notificationIds: validIds, isRead: true, isSent: true },
      ];

      updates.forEach((update) => {
        expect(() => bulkUpdateStatusSchema.parse(update)).not.toThrow();
      });
    });

    it("должен отклонять пустой массив ID", () => {
      const invalid = { notificationIds: [], isRead: true };
      expect(() => bulkUpdateStatusSchema.parse(invalid)).toThrow();
    });

    it("должен отклонять слишком большой массив ID", () => {
      const ids = Array(101).fill("123e4567-e89b-12d3-a456-426614174000");
      const invalid = { notificationIds: ids, isRead: true };
      expect(() => bulkUpdateStatusSchema.parse(invalid)).toThrow();
    });

    it("должен отклонять невалидные UUID", () => {
      const invalid = { notificationIds: ["invalid-uuid"], isRead: true };
      expect(() => bulkUpdateStatusSchema.parse(invalid)).toThrow();
    });

    it("должен принимать данные без статусных полей (они опциональные)", () => {
      const valid = { notificationIds: validIds };
      expect(() => bulkUpdateStatusSchema.parse(valid)).not.toThrow();
    });
  });

  describe("searchNotificationsSchema", () => {
    it("должен принимать валидные параметры поиска", () => {
      const searches = [
        {},
        { userId: "123e4567-e89b-12d3-a456-426614174000" },
        { type: "booking_reminder" },
        { channel: "telegram" },
        { isRead: true },
        { isSent: false },
        { message: "поиск" },
        { startDate: "2024-01-01T00:00:00Z" },
        { endDate: "2024-12-31T23:59:59Z" },
        { page: 1, limit: 20 },
      ];

      searches.forEach((search) => {
        expect(() => searchNotificationsSchema.parse(search)).not.toThrow();
      });
    });

    it("должен отклонять невалидные параметры", () => {
      const invalidSearches = [
        { userId: "invalid-uuid" },
        { type: "invalid_type" },
        { channel: "invalid_channel" },
        { isRead: "not_boolean" },
        { isSent: "not_boolean" },
        { startDate: "invalid-date" },
        { endDate: "invalid-date" },
        { page: 0 },
        { page: -1 },
        { limit: 0 },
        { limit: 101 },
      ];

      invalidSearches.forEach((search) => {
        expect(() => searchNotificationsSchema.parse(search)).toThrow();
      });
    });
  });

  describe("getStatsSchema", () => {
    it("должен принимать валидные параметры статистики", () => {
      const stats = [
        {},
        { userId: "123e4567-e89b-12d3-a456-426614174000" },
        { days: 30 },
        { groupBy: "type" },
        { groupBy: "channel" },
        { groupBy: "user" },
        { groupBy: "date" },
      ];

      stats.forEach((stat) => {
        expect(() => getStatsSchema.parse(stat)).not.toThrow();
      });
    });

    it("должен отклонять невалидные параметры", () => {
      const invalidStats = [
        { userId: "invalid-uuid" },
        { days: 0 },
        { days: 366 },
        { groupBy: "invalid_group" },
      ];

      invalidStats.forEach((stat) => {
        expect(() => getStatsSchema.parse(stat)).toThrow();
      });
    });
  });

  describe("cleanupNotificationsSchema", () => {
    it("должен принимать валидные параметры очистки", () => {
      const cleanups = [
        {},
        { days: 30 },
        { onlyRead: true },
        { dryRun: true },
        { days: 7, onlyRead: false, dryRun: false },
      ];

      cleanups.forEach((cleanup) => {
        expect(() => cleanupNotificationsSchema.parse(cleanup)).not.toThrow();
      });
    });

    it("должен отклонять невалидные параметры", () => {
      const invalidCleanups = [
        { days: 0 },
        { days: 366 },
        { onlyRead: "not_boolean" },
        { dryRun: "not_boolean" },
      ];

      invalidCleanups.forEach((cleanup) => {
        expect(() => cleanupNotificationsSchema.parse(cleanup)).toThrow();
      });
    });
  });
});
