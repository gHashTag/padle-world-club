/**
 * AISuggestionService - сервис для управления AI предложениями
 *
 * Функциональность:
 * - Создание и логирование AI предложений
 * - Обработка пользовательской обратной связи
 * - Аналитика эффективности AI предложений
 * - Интеграция с внешними AI системами
 * - Обучение на основе обратной связи
 */

import { logger, LogType } from "../utils/logger";
import { AISuggestionLogRepository } from "../repositories/ai-suggestion-log-repository";
import type { DatabaseType } from "../repositories/types";
import type {
  AISuggestionLog,
  NewAISuggestionLog,
} from "../db/schema/aiSuggestionLog";

// Типы для AI предложений
export type AISuggestionType =
  | "game_matching"
  | "court_fill_optimization"
  | "demand_prediction"
  | "rating_update";

export interface IAISuggestionInput {
  readonly type: AISuggestionType;
  readonly userId?: string;
  readonly inputData: Record<string, any>;
  readonly contextData?: Record<string, any>;
  readonly modelVersion?: string;
}

export interface IAISuggestionResult {
  readonly suggestionData: Record<string, any>;
  readonly confidenceScore: number; // 0.0 - 1.0
  readonly executionTimeMs: number;
  readonly modelVersion: string;
  readonly metadata?: Record<string, any>;
}

export interface IAISuggestionFeedback {
  readonly wasAccepted: boolean;
  readonly userFeedback?: string;
  readonly actualOutcome?: Record<string, any>; // Фактический результат для обучения
}

export interface IAISuggestionServiceConfig {
  readonly enableLogging: boolean;
  readonly enableAnalytics: boolean;
  readonly minConfidenceThreshold: number; // Минимальный порог уверенности для показа предложения
  readonly maxSuggestionsPerUser: number; // Максимум предложений на пользователя в день
  readonly enableFeedbackCollection: boolean;
  readonly retentionDays: number; // Сколько дней хранить логи
}

// Интерфейс для AI провайдеров
export interface IAIProvider {
  readonly name: string;
  readonly version: string;
  generateSuggestion(input: IAISuggestionInput): Promise<IAISuggestionResult>;
  validateInput(input: IAISuggestionInput): Promise<boolean>;
  getCapabilities(): string[]; // Поддерживаемые типы предложений
}

// Заглушки AI провайдеров для будущей реализации
class GameMatchingAIProvider implements IAIProvider {
  readonly name = "GameMatchingAI";
  readonly version = "v1.0.0";

  async generateSuggestion(
    input: IAISuggestionInput
  ): Promise<IAISuggestionResult> {
    const startTime = Date.now();

    // TODO: Реализовать интеграцию с реальным AI для подбора игр
    logger.info("Generating game matching suggestion", {
      type: LogType.AI_OPERATION,
      userId: input.userId,
      data: {
        suggestionType: input.type,
        inputDataKeys: Object.keys(input.inputData),
      },
    });

    // Имитация AI обработки
    await new Promise((resolve) =>
      setTimeout(resolve, 100 + Math.random() * 200)
    );

    const executionTime = Date.now() - startTime;
    const confidence = 0.7 + Math.random() * 0.3; // 0.7-1.0

    return {
      suggestionData: {
        matchedPlayers: ["player1", "player2", "player3"],
        recommendedTime: "18:00",
        court: "court_1",
        estimatedDuration: 90,
      },
      confidenceScore: confidence,
      executionTimeMs: executionTime,
      modelVersion: this.version,
      metadata: {
        algorithm: "collaborative_filtering",
        dataPoints: 150,
      },
    };
  }

  async validateInput(input: IAISuggestionInput): Promise<boolean> {
    return (
      input.type === "game_matching" &&
      input.inputData &&
      typeof input.inputData === "object"
    );
  }

  getCapabilities(): string[] {
    return ["game_matching"];
  }
}

class CourtOptimizationAIProvider implements IAIProvider {
  readonly name = "CourtOptimizationAI";
  readonly version = "v1.2.0";

  async generateSuggestion(
    input: IAISuggestionInput
  ): Promise<IAISuggestionResult> {
    const startTime = Date.now();

    logger.info("Generating court optimization suggestion", {
      type: LogType.AI_OPERATION,
      userId: input.userId,
      data: {
        suggestionType: input.type,
        inputDataKeys: Object.keys(input.inputData),
      },
    });

    await new Promise((resolve) =>
      setTimeout(resolve, 150 + Math.random() * 300)
    );

    const executionTime = Date.now() - startTime;
    const confidence = 0.6 + Math.random() * 0.4;

    return {
      suggestionData: {
        recommendedActions: ["promote_discount", "send_notifications"],
        targetTimeSlots: ["17:00", "18:00", "19:00"],
        expectedIncrease: "25%",
        priority: "high",
      },
      confidenceScore: confidence,
      executionTimeMs: executionTime,
      modelVersion: this.version,
      metadata: {
        algorithm: "optimization_ml",
        historicalDataDays: 30,
      },
    };
  }

  async validateInput(input: IAISuggestionInput): Promise<boolean> {
    return (
      input.type === "court_fill_optimization" &&
      input.inputData &&
      typeof input.inputData === "object"
    );
  }

  getCapabilities(): string[] {
    return ["court_fill_optimization"];
  }
}

class DemandPredictionAIProvider implements IAIProvider {
  readonly name = "DemandPredictionAI";
  readonly version = "v2.1.0";

  async generateSuggestion(
    input: IAISuggestionInput
  ): Promise<IAISuggestionResult> {
    const startTime = Date.now();

    logger.info("Generating demand prediction", {
      type: LogType.AI_OPERATION,
      userId: input.userId,
      data: {
        suggestionType: input.type,
        inputDataKeys: Object.keys(input.inputData),
      },
    });

    await new Promise((resolve) =>
      setTimeout(resolve, 200 + Math.random() * 400)
    );

    const executionTime = Date.now() - startTime;
    const confidence = 0.8 + Math.random() * 0.2;

    return {
      suggestionData: {
        predictedDemand: "high",
        timeSlots: ["18:00", "19:00", "20:00"],
        confidence: "high",
        factors: ["weather", "weekend", "holiday"],
      },
      confidenceScore: confidence,
      executionTimeMs: executionTime,
      modelVersion: this.version,
      metadata: {
        algorithm: "time_series_lstm",
        forecastHorizon: "24h",
      },
    };
  }

  async validateInput(input: IAISuggestionInput): Promise<boolean> {
    return (
      input.type === "demand_prediction" &&
      input.inputData &&
      typeof input.inputData === "object"
    );
  }

  getCapabilities(): string[] {
    return ["demand_prediction"];
  }
}

class RatingUpdateAIProvider implements IAIProvider {
  readonly name = "RatingUpdateAI";
  readonly version = "v1.5.0";

  async generateSuggestion(
    input: IAISuggestionInput
  ): Promise<IAISuggestionResult> {
    const startTime = Date.now();

    logger.info("Generating rating update suggestion", {
      type: LogType.AI_OPERATION,
      userId: input.userId,
      data: {
        suggestionType: input.type,
        inputDataKeys: Object.keys(input.inputData),
      },
    });

    await new Promise((resolve) =>
      setTimeout(resolve, 80 + Math.random() * 150)
    );

    const executionTime = Date.now() - startTime;
    const confidence = 0.75 + Math.random() * 0.25;

    return {
      suggestionData: {
        suggestedRating: 1650,
        ratingChange: +50,
        reasoning: "Consistent wins against higher-rated players",
        confidence: "high",
      },
      confidenceScore: confidence,
      executionTimeMs: executionTime,
      modelVersion: this.version,
      metadata: {
        algorithm: "elo_enhanced",
        gamesAnalyzed: 10,
      },
    };
  }

  async validateInput(input: IAISuggestionInput): Promise<boolean> {
    return (
      input.type === "rating_update" &&
      input.inputData &&
      typeof input.inputData === "object"
    );
  }

  getCapabilities(): string[] {
    return ["rating_update"];
  }
}

/**
 * AISuggestionService - основной класс для управления AI предложениями
 */
export class AISuggestionService {
  private readonly providers: Map<AISuggestionType, IAIProvider>;
  private readonly aiSuggestionRepo: AISuggestionLogRepository;
  // private readonly userRepo: UserRepository; // Пока не используется
  private readonly config: IAISuggestionServiceConfig;

  constructor(
    db: DatabaseType,
    config: Partial<IAISuggestionServiceConfig> = {}
  ) {
    this.aiSuggestionRepo = new AISuggestionLogRepository(db);
    // this.userRepo = new UserRepository(db); // Пока не используется

    // Конфигурация по умолчанию
    this.config = {
      enableLogging: true,
      enableAnalytics: true,
      minConfidenceThreshold: 0.6,
      maxSuggestionsPerUser: 10,
      enableFeedbackCollection: true,
      retentionDays: 90,
      ...config,
    };

    // Инициализация AI провайдеров
    this.providers = new Map();
    this.providers.set("game_matching", new GameMatchingAIProvider());
    this.providers.set(
      "court_fill_optimization",
      new CourtOptimizationAIProvider()
    );
    this.providers.set("demand_prediction", new DemandPredictionAIProvider());
    this.providers.set("rating_update", new RatingUpdateAIProvider());
  }

  /**
   * Создать AI предложение
   * @param input Входные данные для AI
   * @returns Созданное предложение с результатом AI
   */
  async createSuggestion(input: IAISuggestionInput): Promise<{
    suggestion: AISuggestionLog;
    aiResult: IAISuggestionResult;
  }> {
    try {
      // Проверяем лимиты пользователя
      if (input.userId && this.config.maxSuggestionsPerUser > 0) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayCount = await this.aiSuggestionRepo.getCount(
          input.userId,
          input.type,
          undefined
        );

        if (todayCount >= this.config.maxSuggestionsPerUser) {
          throw new Error(
            `Daily suggestion limit reached for user ${input.userId}`
          );
        }
      }

      // Получаем провайдера для типа предложения
      const provider = this.providers.get(input.type);
      if (!provider) {
        throw new Error(
          `No AI provider found for suggestion type: ${input.type}`
        );
      }

      // Валидируем входные данные
      const isValidInput = await provider.validateInput(input);
      if (!isValidInput) {
        throw new Error(
          `Invalid input data for suggestion type: ${input.type}`
        );
      }

      // Генерируем предложение через AI
      const aiResult = await provider.generateSuggestion(input);

      // Проверяем порог уверенности
      if (aiResult.confidenceScore < this.config.minConfidenceThreshold) {
        logger.warn("AI suggestion below confidence threshold", {
          type: LogType.AI_OPERATION,
          userId: input.userId,
          data: {
            suggestionType: input.type,
            confidence: aiResult.confidenceScore,
            threshold: this.config.minConfidenceThreshold,
          },
        });
      }

      // Создаем запись в базе данных (если логирование включено)
      let suggestion: AISuggestionLog;
      if (this.config.enableLogging) {
        const suggestionData: NewAISuggestionLog = {
          suggestionType: input.type,
          userId: input.userId,
          inputData: input.inputData,
          suggestionData: aiResult.suggestionData,
          confidenceScore: aiResult.confidenceScore.toFixed(4),
          executionTimeMs: aiResult.executionTimeMs.toFixed(2),
          modelVersion: aiResult.modelVersion,
          contextData: input.contextData,
        };

        suggestion = await this.aiSuggestionRepo.create(suggestionData);

        logger.info("AI suggestion created", {
          type: LogType.AI_OPERATION,
          userId: input.userId,
          data: {
            suggestionId: suggestion.id,
            suggestionType: input.type,
            confidence: aiResult.confidenceScore,
            executionTime: aiResult.executionTimeMs,
          },
        });
      } else {
        // Создаем временный объект без сохранения в БД
        suggestion = {
          id: `temp_${Date.now()}`,
          suggestionType: input.type,
          userId: input.userId || null,
          inputData: input.inputData,
          suggestionData: aiResult.suggestionData,
          confidenceScore: aiResult.confidenceScore.toFixed(4),
          executionTimeMs: aiResult.executionTimeMs.toFixed(2),
          modelVersion: aiResult.modelVersion,
          contextData: input.contextData || null,
          wasAccepted: null,
          userFeedback: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        } as AISuggestionLog;
      }

      return { suggestion, aiResult };
    } catch (error) {
      logger.error("Failed to create AI suggestion", {
        type: LogType.AI_OPERATION,
        userId: input.userId,
        error: error instanceof Error ? error : new Error(String(error)),
        data: {
          suggestionType: input.type,
          inputDataKeys: Object.keys(input.inputData),
        },
      });
      throw error;
    }
  }

  /**
   * Обработать обратную связь пользователя
   * @param suggestionId ID предложения
   * @param feedback Обратная связь
   * @returns Обновленное предложение
   */
  async processFeedback(
    suggestionId: string,
    feedback: IAISuggestionFeedback
  ): Promise<AISuggestionLog | null> {
    try {
      if (!this.config.enableFeedbackCollection) {
        logger.warn("Feedback collection is disabled", {
          type: LogType.AI_OPERATION,
          data: { suggestionId },
        });
        return null;
      }

      const updatedSuggestion = await this.aiSuggestionRepo.update(
        suggestionId,
        {
          wasAccepted: feedback.wasAccepted,
          userFeedback: feedback.userFeedback,
        }
      );

      if (updatedSuggestion) {
        logger.info("AI suggestion feedback processed", {
          type: LogType.AI_OPERATION,
          userId: updatedSuggestion.userId || undefined,
          data: {
            suggestionId,
            wasAccepted: feedback.wasAccepted,
            hasFeedback: !!feedback.userFeedback,
          },
        });

        // TODO: Отправить данные для обучения AI модели
        if (feedback.actualOutcome) {
          await this.sendTrainingData(
            updatedSuggestion,
            feedback.actualOutcome
          );
        }
      }

      return updatedSuggestion;
    } catch (error) {
      logger.error("Failed to process AI suggestion feedback", {
        type: LogType.AI_OPERATION,
        error: error instanceof Error ? error : new Error(String(error)),
        data: { suggestionId },
      });
      throw error;
    }
  }

  /**
   * Получить предложения для пользователя
   * @param userId ID пользователя
   * @param suggestionType Тип предложения (опционально)
   * @param limit Лимит записей
   * @returns Массив предложений
   */
  async getUserSuggestions(
    userId: string,
    suggestionType?: AISuggestionType,
    limit: number = 10
  ): Promise<AISuggestionLog[]> {
    try {
      return await this.aiSuggestionRepo.getByUser(
        userId,
        suggestionType,
        limit
      );
    } catch (error) {
      logger.error("Failed to get user suggestions", {
        type: LogType.AI_OPERATION,
        userId,
        error: error instanceof Error ? error : new Error(String(error)),
        data: { suggestionType, limit },
      });
      throw error;
    }
  }

  /**
   * Получить аналитику эффективности AI
   * @param userId ID пользователя (опционально)
   * @param days Количество дней для анализа (опционально)
   * @returns Статистика эффективности
   */
  async getEffectivenessAnalytics(userId?: string, days?: number) {
    try {
      if (!this.config.enableAnalytics) {
        logger.warn("Analytics is disabled", {
          type: LogType.AI_OPERATION,
          data: { userId, days },
        });
        return null;
      }

      const stats = await this.aiSuggestionRepo.getStats(userId, days);
      const groupedStats = await this.aiSuggestionRepo.getGroupedByType(
        userId,
        days
      );

      // Дополнительная аналитика
      const analytics = {
        ...stats,
        groupedByType: groupedStats,
        effectiveness: {
          overallAcceptanceRate: stats.acceptanceRate,
          highConfidenceSuggestions:
            stats.totalSuggestions > 0
              ? Math.round(stats.totalSuggestions * 0.8)
              : 0, // Примерная оценка
          averageResponseTime: stats.averageExecutionTime,
          userEngagement:
            stats.totalSuggestions > 0
              ? Math.round(
                  ((stats.acceptedSuggestions + stats.rejectedSuggestions) /
                    stats.totalSuggestions) *
                    100
                )
              : 0,
        },
        recommendations: this.generateRecommendations(stats, groupedStats),
      };

      logger.info("AI effectiveness analytics generated", {
        type: LogType.AI_OPERATION,
        userId,
        data: {
          totalSuggestions: stats.totalSuggestions,
          acceptanceRate: stats.acceptanceRate,
          analysisWindow: days ? `${days} days` : "all time",
        },
      });

      return analytics;
    } catch (error) {
      logger.error("Failed to get AI effectiveness analytics", {
        type: LogType.AI_OPERATION,
        userId,
        error: error instanceof Error ? error : new Error(String(error)),
        data: { days },
      });
      throw error;
    }
  }

  /**
   * Очистить старые логи
   * @param days Количество дней (старше этого периода будут удалены)
   * @returns Количество удаленных записей
   */
  async cleanupOldLogs(days?: number): Promise<number> {
    try {
      const daysToKeep = days || this.config.retentionDays;
      const deletedCount = await this.aiSuggestionRepo.deleteOld(daysToKeep);

      logger.info("AI suggestion logs cleanup completed", {
        type: LogType.AI_OPERATION,
        data: {
          deletedCount,
          retentionDays: daysToKeep,
        },
      });

      return deletedCount;
    } catch (error) {
      logger.error("Failed to cleanup AI suggestion logs", {
        type: LogType.AI_OPERATION,
        error: error instanceof Error ? error : new Error(String(error)),
        data: { days },
      });
      throw error;
    }
  }

  /**
   * Проверить здоровье AI провайдеров
   * @returns Статус каждого провайдера
   */
  async healthCheck(): Promise<Record<string, boolean>> {
    const healthStatus: Record<string, boolean> = {};

    for (const [type, provider] of this.providers) {
      try {
        // Простая проверка - валидация тестового входа
        const testInput: IAISuggestionInput = {
          type,
          inputData: { test: true },
        };

        const isHealthy = await provider.validateInput(testInput);
        healthStatus[`${provider.name}_${type}`] = isHealthy;
      } catch (error) {
        healthStatus[`${provider.name}_${type}`] = false;
        logger.error(`AI provider health check failed: ${provider.name}`, {
          type: LogType.AI_OPERATION,
          error: error instanceof Error ? error : new Error(String(error)),
          data: { providerType: type },
        });
      }
    }

    return healthStatus;
  }

  /**
   * Отправить данные для обучения AI модели
   * @param suggestion Предложение
   * @param actualOutcome Фактический результат
   * @private
   */
  private async sendTrainingData(
    suggestion: AISuggestionLog,
    actualOutcome: Record<string, any>
  ): Promise<void> {
    // TODO: Реализовать отправку данных в систему обучения AI
    logger.info("Training data prepared for AI model", {
      type: LogType.AI_OPERATION,
      userId: suggestion.userId || undefined,
      data: {
        suggestionId: suggestion.id,
        suggestionType: suggestion.suggestionType,
        wasAccepted: suggestion.wasAccepted,
        hasActualOutcome: !!actualOutcome,
      },
    });
  }

  /**
   * Генерировать рекомендации на основе аналитики
   * @param stats Общая статистика
   * @param groupedStats Статистика по типам
   * @returns Массив рекомендаций
   * @private
   */
  private generateRecommendations(stats: any, groupedStats: any[]): string[] {
    const recommendations: string[] = [];

    // Рекомендации на основе общей статистики
    if (stats.acceptanceRate < 30) {
      recommendations.push(
        "Низкий уровень принятия предложений. Рекомендуется пересмотреть алгоритмы AI."
      );
    }

    if (stats.averageExecutionTime > 1000) {
      recommendations.push(
        "Высокое время выполнения AI запросов. Рекомендуется оптимизация производительности."
      );
    }

    if (
      stats.pendingSuggestions >
      stats.acceptedSuggestions + stats.rejectedSuggestions
    ) {
      recommendations.push(
        "Много предложений без обратной связи. Рекомендуется улучшить UX для сбора feedback."
      );
    }

    // Рекомендации на основе статистики по типам
    groupedStats.forEach((typeStats) => {
      if (typeStats.acceptanceRate < 20) {
        recommendations.push(
          `Низкая эффективность для типа "${typeStats.suggestionType}". Требуется доработка алгоритма.`
        );
      }

      if (typeStats.averageExecutionTime > 2000) {
        recommendations.push(
          `Медленная работа для типа "${typeStats.suggestionType}". Требуется оптимизация.`
        );
      }
    });

    return recommendations;
  }
}
