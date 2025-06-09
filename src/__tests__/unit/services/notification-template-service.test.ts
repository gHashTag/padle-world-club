/**
 * Unit тесты для NotificationTemplateService
 */

import { describe, it, expect, beforeEach } from "vitest";
import { NotificationTemplateService } from "../../../services/notification-template-service";
import type {
  INotificationTemplate,
  ICreateTemplateData,
  IUpdateTemplateData,
  IRenderOptions,
} from "../../../services/notification-template-service";

describe("NotificationTemplateService", () => {
  let service: NotificationTemplateService;

  beforeEach(() => {
    service = new NotificationTemplateService();
  });

  describe("constructor", () => {
    it("должен создавать сервис с базовыми шаблонами", async () => {
      expect(service).toBeInstanceOf(NotificationTemplateService);

      const stats = await service.getStats();
      expect(stats.total).toBeGreaterThan(0);
    });
  });

  describe("create", () => {
    it("должен создавать новый шаблон", async () => {
      const templateData: ICreateTemplateData = {
        name: "Test Template",
        type: "booking_reminder",
        channel: "telegram",
        content: "Hello {{userName}}, your booking is confirmed for {{date}}.",
        variables: ["userName", "date"],
      };

      const template = await service.create(templateData);

      expect(template.id).toBeDefined();
      expect(template.name).toBe(templateData.name);
      expect(template.type).toBe(templateData.type);
      expect(template.channel).toBe(templateData.channel);
      expect(template.content).toBe(templateData.content);
      expect(template.variables).toEqual(templateData.variables);
      expect(template.locale).toBe("ru");
      expect(template.isActive).toBe(true);
      expect(template.createdAt).toBeInstanceOf(Date);
      expect(template.updatedAt).toBeInstanceOf(Date);
    });

    it("должен автоматически извлекать переменные из контента", async () => {
      const templateData: ICreateTemplateData = {
        name: "Auto Variables Template",
        type: "game_invite",
        channel: "whatsapp",
        content: "Hi {{userName}}! Game on {{date}} at {{time}} in {{venue}}.",
      };

      const template = await service.create(templateData);

      expect(template.variables).toEqual(["userName", "date", "time", "venue"]);
    });

    it("должен выбрасывать ошибку при невалидном шаблоне", async () => {
      const invalidTemplateData: ICreateTemplateData = {
        name: "",
        type: "booking_reminder",
        channel: "telegram",
        content: "",
      };

      await expect(service.create(invalidTemplateData)).rejects.toThrow(
        "Template validation failed"
      );
    });
  });

  describe("getById", () => {
    it("должен возвращать шаблон по ID", async () => {
      const templateData: ICreateTemplateData = {
        name: "Test Template",
        type: "booking_reminder",
        channel: "telegram",
        content: "Test content {{var}}",
      };

      const created = await service.create(templateData);
      const found = await service.getById(created.id);

      expect(found).toEqual(created);
    });

    it("должен возвращать null для несуществующего ID", async () => {
      const found = await service.getById("non-existent-id");
      expect(found).toBeNull();
    });
  });

  describe("getByType", () => {
    it("должен возвращать шаблоны по типу", async () => {
      const templateData1: ICreateTemplateData = {
        name: "Booking Template 1",
        type: "booking_reminder",
        channel: "telegram",
        content: "Content 1",
      };

      const templateData2: ICreateTemplateData = {
        name: "Booking Template 2",
        type: "booking_reminder",
        channel: "email",
        content: "Content 2",
      };

      const templateData3: ICreateTemplateData = {
        name: "Game Template",
        type: "game_invite",
        channel: "telegram",
        content: "Content 3",
      };

      await service.create(templateData1);
      await service.create(templateData2);
      await service.create(templateData3);

      const bookingTemplates = await service.getByType("booking_reminder");
      expect(bookingTemplates.length).toBeGreaterThanOrEqual(2);

      const gameTemplates = await service.getByType("game_invite");
      expect(gameTemplates.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("getByChannel", () => {
    it("должен возвращать шаблоны по каналу", async () => {
      const templateData1: ICreateTemplateData = {
        name: "Telegram Template 1",
        type: "booking_reminder",
        channel: "telegram",
        content: "Content 1",
      };

      const templateData2: ICreateTemplateData = {
        name: "Telegram Template 2",
        type: "game_invite",
        channel: "telegram",
        content: "Content 2",
      };

      await service.create(templateData1);
      await service.create(templateData2);

      const telegramTemplates = await service.getByChannel("telegram");
      expect(telegramTemplates.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("getByTypeAndChannel", () => {
    it("должен возвращать шаблон по типу и каналу", async () => {
      const templateData: ICreateTemplateData = {
        name: "Specific Template",
        type: "payment_confirmation",
        channel: "email",
        content: "Payment confirmed {{amount}}",
      };

      await service.create(templateData);
      const found = await service.getByTypeAndChannel(
        "payment_confirmation",
        "email"
      );

      expect(found).toBeDefined();
      expect(found?.type).toBe("payment_confirmation");
      expect(found?.channel).toBe("email");
    });

    it("должен возвращать null если шаблон не найден", async () => {
      const found = await service.getByTypeAndChannel(
        "custom_message",
        "app_push"
      );
      expect(found).toBeNull();
    });
  });

  describe("update", () => {
    it("должен обновлять существующий шаблон", async () => {
      const templateData: ICreateTemplateData = {
        name: "Original Template",
        type: "booking_reminder",
        channel: "telegram",
        content: "Original content {{var}}",
      };

      const created = await service.create(templateData);

      const updateData: IUpdateTemplateData = {
        name: "Updated Template",
        content: "Updated content {{newVar}}",
      };

      const updated = await service.update(created.id, updateData);

      expect(updated).toBeDefined();
      expect(updated?.name).toBe("Updated Template");
      expect(updated?.content).toBe("Updated content {{newVar}}");
      expect(updated?.variables).toEqual(["newVar"]);
      expect(updated?.updatedAt.getTime()).toBeGreaterThanOrEqual(
        created.updatedAt.getTime()
      );
    });

    it("должен возвращать null для несуществующего шаблона", async () => {
      const updateData: IUpdateTemplateData = {
        name: "Updated Name",
      };

      const result = await service.update("non-existent-id", updateData);
      expect(result).toBeNull();
    });
  });

  describe("delete", () => {
    it("должен удалять существующий шаблон", async () => {
      const templateData: ICreateTemplateData = {
        name: "Template to Delete",
        type: "booking_reminder",
        channel: "telegram",
        content: "Content to delete",
      };

      const created = await service.create(templateData);
      const deleted = await service.delete(created.id);

      expect(deleted).toBe(true);

      const found = await service.getById(created.id);
      expect(found).toBeNull();
    });

    it("должен возвращать false для несуществующего шаблона", async () => {
      const result = await service.delete("non-existent-id");
      expect(result).toBe(false);
    });
  });

  describe("render", () => {
    it("должен рендерить шаблон с переменными", async () => {
      const templateData: ICreateTemplateData = {
        name: "Render Template",
        type: "booking_reminder",
        channel: "telegram",
        subject: "Booking for {{userName}}",
        content:
          "Hello {{userName}}, your booking on {{date}} at {{time}} is confirmed.",
        variables: ["userName", "date", "time"],
      };

      const template = await service.create(templateData);

      const renderOptions: IRenderOptions = {
        variables: {
          userName: "John Doe",
          date: "2024-01-15",
          time: "14:00",
        },
      };

      const result = await service.render(template.id, renderOptions);

      expect(result.success).toBe(true);
      expect(result.subject).toBe("Booking for John Doe");
      expect(result.content).toBe(
        "Hello John Doe, your booking on 2024-01-15 at 14:00 is confirmed."
      );
      expect(result.error).toBeUndefined();
    });

    it("должен возвращать ошибку при отсутствующих переменных", async () => {
      const templateData: ICreateTemplateData = {
        name: "Missing Vars Template",
        type: "booking_reminder",
        channel: "telegram",
        content: "Hello {{userName}}, booking on {{date}}",
        variables: ["userName", "date"],
      };

      const template = await service.create(templateData);

      const renderOptions: IRenderOptions = {
        variables: {
          userName: "John Doe",
          // date отсутствует
        },
      };

      const result = await service.render(template.id, renderOptions);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Missing required variables");
      expect(result.missingVariables).toEqual(["date"]);
    });

    it("должен возвращать ошибку для несуществующего шаблона", async () => {
      const renderOptions: IRenderOptions = {
        variables: { test: "value" },
      };

      const result = await service.render("non-existent-id", renderOptions);

      expect(result.success).toBe(false);
      expect(result.error).toBe("Template not found");
    });
  });

  describe("validateTemplate", () => {
    it("должен валидировать корректный шаблон", () => {
      const template: INotificationTemplate = {
        id: "test-id",
        name: "Valid Template",
        type: "booking_reminder",
        channel: "telegram",
        content: "Hello {{userName}}",
        variables: ["userName"],
        locale: "ru",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = service.validateTemplate(template);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.variables).toEqual(["userName"]);
    });

    it("должен находить ошибки в невалидном шаблоне", () => {
      const template: INotificationTemplate = {
        id: "test-id",
        name: "",
        type: "booking_reminder",
        channel: "telegram",
        content: "",
        variables: [],
        locale: "ru",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = service.validateTemplate(template);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("Template name is required");
      expect(result.errors).toContain("Template content is required");
    });

    it("должен находить предупреждения о неиспользуемых переменных", () => {
      const template: INotificationTemplate = {
        id: "test-id",
        name: "Warning Template",
        type: "booking_reminder",
        channel: "telegram",
        content: "Hello {{userName}}",
        variables: ["userName", "unusedVar"],
        locale: "ru",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = service.validateTemplate(template);

      expect(result.isValid).toBe(true);
      expect(result.warnings).toContain("Unused variables declared: unusedVar");
    });
  });

  describe("getActiveTemplates", () => {
    it("должен возвращать только активные шаблоны", async () => {
      const activeTemplate: ICreateTemplateData = {
        name: "Active Template",
        type: "booking_reminder",
        channel: "telegram",
        content: "Active content",
        isActive: true,
      };

      const inactiveTemplate: ICreateTemplateData = {
        name: "Inactive Template",
        type: "game_invite",
        channel: "telegram",
        content: "Inactive content",
        isActive: false,
      };

      await service.create(activeTemplate);
      await service.create(inactiveTemplate);

      const activeTemplates = await service.getActiveTemplates();

      expect(activeTemplates.every((t) => t.isActive)).toBe(true);
      expect(activeTemplates.some((t) => t.name === "Active Template")).toBe(
        true
      );
      expect(activeTemplates.some((t) => t.name === "Inactive Template")).toBe(
        false
      );
    });
  });

  describe("getStats", () => {
    it("должен возвращать статистику шаблонов", async () => {
      const stats = await service.getStats();

      expect(typeof stats.total).toBe("number");
      expect(typeof stats.active).toBe("number");
      expect(typeof stats.inactive).toBe("number");
      expect(typeof stats.byType).toBe("object");
      expect(typeof stats.byChannel).toBe("object");
      expect(typeof stats.byLocale).toBe("object");
      expect(stats.total).toBe(stats.active + stats.inactive);
    });
  });

  describe("приватные методы через публичный интерфейс", () => {
    it("должен корректно извлекать переменные из контента", async () => {
      const templateData: ICreateTemplateData = {
        name: "Variable Extraction Test",
        type: "booking_reminder",
        channel: "telegram",
        content:
          "Hello {{userName}}, your {{bookingType}} on {{date}} at {{time}}. {{userName}} again.",
      };

      const template = await service.create(templateData);

      // Переменные должны быть уникальными
      expect(template.variables).toEqual([
        "userName",
        "bookingType",
        "date",
        "time",
      ]);
    });

    it("должен корректно рендерить контент с переменными", async () => {
      const templateData: ICreateTemplateData = {
        name: "Render Test",
        type: "booking_reminder",
        channel: "telegram",
        content: "Price: {{price}} {{currency}}, Date: {{date}}",
      };

      const template = await service.create(templateData);

      const renderOptions: IRenderOptions = {
        variables: {
          price: 1500,
          currency: "RUB",
          date: "2024-01-15",
        },
      };

      const result = await service.render(template.id, renderOptions);

      expect(result.success).toBe(true);
      expect(result.content).toBe("Price: 1500 RUB, Date: 2024-01-15");
    });
  });
});
