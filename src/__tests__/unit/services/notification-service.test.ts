/**
 * Unit тесты для NotificationService
 */

import { describe, it, expect } from "vitest";
import { NotificationService } from "../../../services/notification-service";
import type {
  INotificationProvider,
  INotificationData,
  ISendResult,
  IScheduleOptions,
  INotificationServiceConfig,
} from "../../../services/notification-service";

describe("NotificationService", () => {
  describe("экспорт", () => {
    it("должен экспортировать класс NotificationService", () => {
      expect(NotificationService).toBeDefined();
      expect(typeof NotificationService).toBe("function");
    });

    it("должен экспортировать интерфейс INotificationProvider", () => {
      // Проверяем, что тип существует через TypeScript
      const provider: INotificationProvider = {
        name: "telegram",
        send: async () => ({ success: true }),
        validateConfig: async () => true,
      };
      expect(provider.name).toBe("telegram");
    });

    it("должен экспортировать интерфейс INotificationData", () => {
      const data: INotificationData = {
        id: "test-id",
        userId: "user-123",
        type: "booking_reminder",
        channel: "telegram",
        message: "Test message",
      };
      expect(data.id).toBe("test-id");
    });

    it("должен экспортировать интерфейс ISendResult", () => {
      const result: ISendResult = {
        success: true,
        messageId: "msg-123",
      };
      expect(result.success).toBe(true);
    });

    it("должен экспортировать интерфейс IScheduleOptions", () => {
      const options: IScheduleOptions = {
        scheduledAt: new Date(),
        retryAttempts: 3,
        retryDelay: 5,
      };
      expect(options.retryAttempts).toBe(3);
    });

    it("должен экспортировать интерфейс INotificationServiceConfig", () => {
      const config: INotificationServiceConfig = {
        maxRetryAttempts: 3,
        retryDelayMinutes: 5,
        batchSize: 10,
        enableScheduling: true,
        enableRetry: true,
      };
      expect(config.maxRetryAttempts).toBe(3);
    });
  });

  describe("типы", () => {
    it("INotificationProvider должен иметь правильную структуру", () => {
      const provider: INotificationProvider = {
        name: "whatsapp",
        send: async (notification: INotificationData): Promise<ISendResult> => {
          return {
            success: true,
            messageId: `wa_${notification.id}`,
            deliveredAt: new Date(),
          };
        },
        validateConfig: async (): Promise<boolean> => {
          return true;
        },
      };

      expect(provider.name).toBe("whatsapp");
      expect(typeof provider.send).toBe("function");
      expect(typeof provider.validateConfig).toBe("function");
    });

    it("INotificationData должен поддерживать все каналы", () => {
      const channels = ["telegram", "whatsapp", "email", "app_push"] as const;

      channels.forEach((channel) => {
        const data: INotificationData = {
          id: "test-id",
          userId: "user-123",
          type: "booking_reminder",
          channel,
          message: "Test message",
        };
        expect(data.channel).toBe(channel);
      });
    });

    it("INotificationData должен поддерживать все типы уведомлений", () => {
      const types = [
        "booking_reminder",
        "game_invite",
        "tournament_update",
        "payment_confirmation",
        "package_expiration",
        "custom_message",
        "stock_alert",
      ] as const;

      types.forEach((type) => {
        const data: INotificationData = {
          id: "test-id",
          userId: "user-123",
          type,
          channel: "telegram",
          message: "Test message",
        };
        expect(data.type).toBe(type);
      });
    });

    it("ISendResult должен поддерживать опциональные поля", () => {
      const minimalResult: ISendResult = {
        success: false,
      };
      expect(minimalResult.success).toBe(false);

      const fullResult: ISendResult = {
        success: true,
        messageId: "msg-123",
        error: undefined,
        retryable: true,
        deliveredAt: new Date(),
      };
      expect(fullResult.success).toBe(true);
      expect(fullResult.messageId).toBe("msg-123");
    });

    it("IScheduleOptions должен поддерживать опциональные поля", () => {
      const minimalOptions: IScheduleOptions = {
        scheduledAt: new Date(),
      };
      expect(minimalOptions.scheduledAt).toBeInstanceOf(Date);

      const fullOptions: IScheduleOptions = {
        scheduledAt: new Date(),
        retryAttempts: 5,
        retryDelay: 10,
      };
      expect(fullOptions.retryAttempts).toBe(5);
      expect(fullOptions.retryDelay).toBe(10);
    });

    it("INotificationServiceConfig должен иметь все обязательные поля", () => {
      const config: INotificationServiceConfig = {
        maxRetryAttempts: 3,
        retryDelayMinutes: 5,
        batchSize: 10,
        enableScheduling: true,
        enableRetry: true,
      };

      expect(typeof config.maxRetryAttempts).toBe("number");
      expect(typeof config.retryDelayMinutes).toBe("number");
      expect(typeof config.batchSize).toBe("number");
      expect(typeof config.enableScheduling).toBe("boolean");
      expect(typeof config.enableRetry).toBe("boolean");
    });
  });

  describe("совместимость типов", () => {
    it("userId должен поддерживать undefined", () => {
      const dataWithUser: INotificationData = {
        id: "test-id",
        userId: "user-123",
        type: "booking_reminder",
        channel: "telegram",
        message: "Test message",
      };
      expect(dataWithUser.userId).toBe("user-123");

      const dataWithoutUser: INotificationData = {
        id: "test-id",
        userId: undefined,
        type: "booking_reminder",
        channel: "telegram",
        message: "Test message",
      };
      expect(dataWithoutUser.userId).toBeUndefined();
    });

    it("relatedEntity поля должны быть опциональными", () => {
      const dataWithRelated: INotificationData = {
        id: "test-id",
        userId: "user-123",
        type: "booking_reminder",
        channel: "telegram",
        message: "Test message",
        relatedEntityId: "booking-123",
        relatedEntityType: "booking",
      };
      expect(dataWithRelated.relatedEntityId).toBe("booking-123");

      const dataWithoutRelated: INotificationData = {
        id: "test-id",
        userId: "user-123",
        type: "booking_reminder",
        channel: "telegram",
        message: "Test message",
      };
      expect(dataWithoutRelated.relatedEntityId).toBeUndefined();
    });
  });
});
