/**
 * NotificationTemplateService - сервис для управления шаблонами уведомлений
 *
 * Функциональность:
 * - CRUD операции для шаблонов
 * - Рендеринг шаблонов с переменными
 * - Валидация шаблонов
 * - Поддержка множественных каналов
 * - Локализация шаблонов
 */

import { logger, LogType } from "../utils/logger";
import type {
  NotificationChannel,
  NotificationType,
} from "../db/schema/notification";

// Типы для шаблонов
export interface INotificationTemplate {
  readonly id: string;
  readonly name: string;
  readonly type: NotificationType;
  readonly channel: NotificationChannel;
  readonly subject?: string;
  readonly content: string;
  readonly variables: string[];
  readonly locale: string;
  readonly isActive: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface ICreateTemplateData {
  readonly name: string;
  readonly type: NotificationType;
  readonly channel: NotificationChannel;
  readonly subject?: string;
  readonly content: string;
  readonly variables?: string[];
  readonly locale?: string;
  readonly isActive?: boolean;
}

export interface IUpdateTemplateData {
  readonly name?: string;
  readonly subject?: string;
  readonly content?: string;
  readonly variables?: string[];
  readonly locale?: string;
  readonly isActive?: boolean;
}

export interface IRenderOptions {
  readonly variables: Record<string, unknown>;
  readonly locale?: string;
  readonly fallbackLocale?: string;
}

export interface IRenderResult {
  readonly success: boolean;
  readonly subject?: string;
  readonly content: string;
  readonly error?: string;
  readonly missingVariables?: string[];
}

export interface ITemplateValidationResult {
  readonly isValid: boolean;
  readonly errors: string[];
  readonly warnings: string[];
  readonly variables: string[];
}

/**
 * NotificationTemplateService - основной класс для управления шаблонами
 */
export class NotificationTemplateService {
  private readonly templates: Map<string, INotificationTemplate>;
  private readonly templatesByType: Map<
    NotificationType,
    INotificationTemplate[]
  >;
  private readonly templatesByChannel: Map<
    NotificationChannel,
    INotificationTemplate[]
  >;

  constructor() {
    this.templates = new Map();
    this.templatesByType = new Map();
    this.templatesByChannel = new Map();

    // Инициализируем с базовыми шаблонами
    this.initializeDefaultTemplates();
  }

  /**
   * Создать новый шаблон
   */
  async create(data: ICreateTemplateData): Promise<INotificationTemplate> {
    try {
      const template: INotificationTemplate = {
        id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: data.name,
        type: data.type,
        channel: data.channel,
        subject: data.subject,
        content: data.content,
        variables: data.variables || this.extractVariables(data.content),
        locale: data.locale || "ru",
        isActive: data.isActive !== false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Валидируем шаблон
      const validation = this.validateTemplate(template);
      if (!validation.isValid) {
        throw new Error(
          `Template validation failed: ${validation.errors.join(", ")}`
        );
      }

      // Сохраняем шаблон
      this.templates.set(template.id, template);
      this.indexTemplate(template);

      logger.info("Template created successfully", {
        type: LogType.BUSINESS_LOGIC,
        data: {
          templateId: template.id,
          templateName: template.name,
          templateType: template.type,
          channel: template.channel,
        },
      });

      return template;
    } catch (error) {
      logger.error("Error in NotificationTemplateService.create", {
        type: LogType.ERROR,
        data: {
          templateName: data.name,
          error: error instanceof Error ? error.message : String(error),
        },
      });
      throw error;
    }
  }

  /**
   * Получить шаблон по ID
   */
  async getById(id: string): Promise<INotificationTemplate | null> {
    return this.templates.get(id) || null;
  }

  /**
   * Получить шаблоны по типу уведомления
   */
  async getByType(type: NotificationType): Promise<INotificationTemplate[]> {
    return this.templatesByType.get(type) || [];
  }

  /**
   * Получить шаблоны по каналу
   */
  async getByChannel(
    channel: NotificationChannel
  ): Promise<INotificationTemplate[]> {
    return this.templatesByChannel.get(channel) || [];
  }

  /**
   * Получить шаблон по типу и каналу
   */
  async getByTypeAndChannel(
    type: NotificationType,
    channel: NotificationChannel,
    locale: string = "ru"
  ): Promise<INotificationTemplate | null> {
    const templates = Array.from(this.templates.values()).filter(
      (template) =>
        template.type === type &&
        template.channel === channel &&
        template.locale === locale &&
        template.isActive
    );

    return templates[0] || null;
  }

  /**
   * Обновить шаблон
   */
  async update(
    id: string,
    data: IUpdateTemplateData
  ): Promise<INotificationTemplate | null> {
    try {
      const existingTemplate = this.templates.get(id);
      if (!existingTemplate) {
        return null;
      }

      const updatedTemplate: INotificationTemplate = {
        ...existingTemplate,
        ...data,
        variables:
          data.variables ||
          (data.content
            ? this.extractVariables(data.content)
            : existingTemplate.variables),
        updatedAt: new Date(),
      };

      // Валидируем обновленный шаблон
      const validation = this.validateTemplate(updatedTemplate);
      if (!validation.isValid) {
        throw new Error(
          `Template validation failed: ${validation.errors.join(", ")}`
        );
      }

      // Обновляем индексы
      this.removeFromIndexes(existingTemplate);
      this.templates.set(id, updatedTemplate);
      this.indexTemplate(updatedTemplate);

      logger.info("Template updated successfully", {
        type: LogType.BUSINESS_LOGIC,
        data: {
          templateId: id,
          templateName: updatedTemplate.name,
        },
      });

      return updatedTemplate;
    } catch (error) {
      logger.error("Error in NotificationTemplateService.update", {
        type: LogType.ERROR,
        data: {
          templateId: id,
          error: error instanceof Error ? error.message : String(error),
        },
      });
      throw error;
    }
  }

  /**
   * Удалить шаблон
   */
  async delete(id: string): Promise<boolean> {
    try {
      const template = this.templates.get(id);
      if (!template) {
        return false;
      }

      this.removeFromIndexes(template);
      this.templates.delete(id);

      logger.info("Template deleted successfully", {
        type: LogType.BUSINESS_LOGIC,
        data: {
          templateId: id,
          templateName: template.name,
        },
      });

      return true;
    } catch (error) {
      logger.error("Error in NotificationTemplateService.delete", {
        type: LogType.ERROR,
        data: {
          templateId: id,
          error: error instanceof Error ? error.message : String(error),
        },
      });
      return false;
    }
  }

  /**
   * Рендерить шаблон с переменными
   */
  async render(
    templateId: string,
    options: IRenderOptions
  ): Promise<IRenderResult> {
    try {
      const template = this.templates.get(templateId);
      if (!template) {
        return {
          success: false,
          content: "",
          error: "Template not found",
        };
      }

      if (!template.isActive) {
        return {
          success: false,
          content: "",
          error: "Template is inactive",
        };
      }

      // Проверяем наличие всех необходимых переменных
      const missingVariables = template.variables.filter(
        (variable) => !(variable in options.variables)
      );

      if (missingVariables.length > 0) {
        return {
          success: false,
          content: "",
          error: "Missing required variables",
          missingVariables,
        };
      }

      // Рендерим контент
      const renderedContent = this.renderContent(
        template.content,
        options.variables
      );
      const renderedSubject = template.subject
        ? this.renderContent(template.subject, options.variables)
        : undefined;

      logger.info("Template rendered successfully", {
        type: LogType.BUSINESS_LOGIC,
        data: {
          templateId,
          templateName: template.name,
          variableCount: Object.keys(options.variables).length,
        },
      });

      return {
        success: true,
        subject: renderedSubject,
        content: renderedContent,
      };
    } catch (error) {
      logger.error("Error in NotificationTemplateService.render", {
        type: LogType.ERROR,
        data: {
          templateId,
          error: error instanceof Error ? error.message : String(error),
        },
      });

      return {
        success: false,
        content: "",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  }

  /**
   * Валидировать шаблон
   */
  validateTemplate(template: INotificationTemplate): ITemplateValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Проверяем обязательные поля
    if (!template.name.trim()) {
      errors.push("Template name is required");
    }

    if (!template.content.trim()) {
      errors.push("Template content is required");
    }

    // Проверяем синтаксис переменных
    const contentVariables = this.extractVariables(template.content);
    const subjectVariables = template.subject
      ? this.extractVariables(template.subject)
      : [];
    const allVariables = [
      ...new Set([...contentVariables, ...subjectVariables]),
    ];

    // Проверяем, что все переменные в списке
    const undeclaredVariables = allVariables.filter(
      (variable) => !template.variables.includes(variable)
    );

    if (undeclaredVariables.length > 0) {
      warnings.push(
        `Undeclared variables found: ${undeclaredVariables.join(", ")}`
      );
    }

    // Проверяем, что все объявленные переменные используются
    const unusedVariables = template.variables.filter(
      (variable) => !allVariables.includes(variable)
    );

    if (unusedVariables.length > 0) {
      warnings.push(`Unused variables declared: ${unusedVariables.join(", ")}`);
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      variables: allVariables,
    };
  }

  /**
   * Получить все активные шаблоны
   */
  async getActiveTemplates(): Promise<INotificationTemplate[]> {
    return Array.from(this.templates.values()).filter(
      (template) => template.isActive
    );
  }

  /**
   * Получить статистику шаблонов
   */
  async getStats(): Promise<{
    total: number;
    active: number;
    inactive: number;
    byType: Record<NotificationType, number>;
    byChannel: Record<NotificationChannel, number>;
    byLocale: Record<string, number>;
  }> {
    const templates = Array.from(this.templates.values());

    const byType: Record<string, number> = {};
    const byChannel: Record<string, number> = {};
    const byLocale: Record<string, number> = {};

    templates.forEach((template) => {
      byType[template.type] = (byType[template.type] || 0) + 1;
      byChannel[template.channel] = (byChannel[template.channel] || 0) + 1;
      byLocale[template.locale] = (byLocale[template.locale] || 0) + 1;
    });

    return {
      total: templates.length,
      active: templates.filter((t) => t.isActive).length,
      inactive: templates.filter((t) => !t.isActive).length,
      byType: byType as Record<NotificationType, number>,
      byChannel: byChannel as Record<NotificationChannel, number>,
      byLocale,
    };
  }

  // Приватные методы

  private extractVariables(content: string): string[] {
    const variablePattern = /\{\{(\w+)\}\}/g;
    const variables: string[] = [];
    let match;

    while ((match = variablePattern.exec(content)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }

    return variables;
  }

  private renderContent(
    content: string,
    variables: Record<string, unknown>
  ): string {
    return content.replace(/\{\{(\w+)\}\}/g, (match, variableName) => {
      const value = variables[variableName];
      return value !== undefined ? String(value) : match;
    });
  }

  private indexTemplate(template: INotificationTemplate): void {
    // Индексируем по типу
    if (!this.templatesByType.has(template.type)) {
      this.templatesByType.set(template.type, []);
    }
    this.templatesByType.get(template.type)!.push(template);

    // Индексируем по каналу
    if (!this.templatesByChannel.has(template.channel)) {
      this.templatesByChannel.set(template.channel, []);
    }
    this.templatesByChannel.get(template.channel)!.push(template);
  }

  private removeFromIndexes(template: INotificationTemplate): void {
    // Удаляем из индекса по типу
    const typeTemplates = this.templatesByType.get(template.type);
    if (typeTemplates) {
      const index = typeTemplates.findIndex((t) => t.id === template.id);
      if (index !== -1) {
        typeTemplates.splice(index, 1);
      }
    }

    // Удаляем из индекса по каналу
    const channelTemplates = this.templatesByChannel.get(template.channel);
    if (channelTemplates) {
      const index = channelTemplates.findIndex((t) => t.id === template.id);
      if (index !== -1) {
        channelTemplates.splice(index, 1);
      }
    }
  }

  private initializeDefaultTemplates(): void {
    // Базовые шаблоны для демонстрации
    const defaultTemplates: ICreateTemplateData[] = [
      {
        name: "Booking Reminder Telegram",
        type: "booking_reminder",
        channel: "telegram",
        content:
          "🎾 Напоминание о бронировании!\n\nВаше бронирование корта {{courtName}} на {{bookingDate}} в {{bookingTime}}.\n\nДо начала игры осталось {{timeUntilStart}}.",
        variables: [
          "courtName",
          "bookingDate",
          "bookingTime",
          "timeUntilStart",
        ],
      },
      {
        name: "Game Invite WhatsApp",
        type: "game_invite",
        channel: "whatsapp",
        content:
          "🏓 Приглашение на игру!\n\n{{inviterName}} приглашает вас на игру {{gameDate}} в {{gameTime}} на корте {{courtName}}.\n\nПринять приглашение: {{acceptLink}}",
        variables: [
          "inviterName",
          "gameDate",
          "gameTime",
          "courtName",
          "acceptLink",
        ],
      },
      {
        name: "Payment Confirmation Email",
        type: "payment_confirmation",
        channel: "email",
        subject: "Подтверждение платежа №{{paymentId}}",
        content:
          "Здравствуйте, {{userName}}!\n\nВаш платеж на сумму {{amount}} {{currency}} успешно обработан.\n\nДетали платежа:\n- ID: {{paymentId}}\n- Дата: {{paymentDate}}\n- Описание: {{description}}\n\nСпасибо за использование наших услуг!",
        variables: [
          "userName",
          "amount",
          "currency",
          "paymentId",
          "paymentDate",
          "description",
        ],
      },
    ];

    // Создаем базовые шаблоны
    defaultTemplates.forEach(async (templateData) => {
      try {
        await this.create(templateData);
      } catch (error) {
        logger.warn("Failed to create default template", {
          type: LogType.BUSINESS_LOGIC,
          data: {
            templateName: templateData.name,
            error: error instanceof Error ? error.message : String(error),
          },
        });
      }
    });
  }
}
