import { describe, it, expect } from "vitest";
import type {
  AISuggestionService,
  IAISuggestionInput,
  IAISuggestionResult,
  IAISuggestionFeedback,
  IAISuggestionServiceConfig,
  IAIProvider,
  AISuggestionType,
} from "../../../services/ai-suggestion-service";

describe("AISuggestionService Types", () => {
  describe("Type Exports", () => {
    it("должен экспортировать основные типы", () => {
      // Проверяем, что типы доступны для импорта
      const suggestionTypes: AISuggestionType[] = [
        "game_matching",
        "court_fill_optimization",
        "demand_prediction",
        "rating_update",
      ];

      expect(suggestionTypes).toHaveLength(4);
      expect(suggestionTypes).toContain("game_matching");
      expect(suggestionTypes).toContain("court_fill_optimization");
      expect(suggestionTypes).toContain("demand_prediction");
      expect(suggestionTypes).toContain("rating_update");
    });

    it("должен иметь корректную структуру IAISuggestionInput", () => {
      const input: IAISuggestionInput = {
        type: "game_matching",
        userId: "user123",
        inputData: { rating: 1500 },
        contextData: { venue: "venue1" },
        modelVersion: "v1.0.0",
      };

      expect(input.type).toBe("game_matching");
      expect(input.userId).toBe("user123");
      expect(input.inputData).toEqual({ rating: 1500 });
      expect(input.contextData).toEqual({ venue: "venue1" });
      expect(input.modelVersion).toBe("v1.0.0");
    });

    it("должен иметь корректную структуру IAISuggestionResult", () => {
      const result: IAISuggestionResult = {
        suggestionData: { players: ["p1", "p2"] },
        confidenceScore: 0.85,
        executionTimeMs: 150.5,
        modelVersion: "v1.0.0",
        metadata: { algorithm: "ml" },
      };

      expect(result.suggestionData).toEqual({ players: ["p1", "p2"] });
      expect(result.confidenceScore).toBe(0.85);
      expect(result.executionTimeMs).toBe(150.5);
      expect(result.modelVersion).toBe("v1.0.0");
      expect(result.metadata).toEqual({ algorithm: "ml" });
    });

    it("должен иметь корректную структуру IAISuggestionFeedback", () => {
      const feedback: IAISuggestionFeedback = {
        wasAccepted: true,
        userFeedback: "Great suggestion!",
        actualOutcome: { success: true },
      };

      expect(feedback.wasAccepted).toBe(true);
      expect(feedback.userFeedback).toBe("Great suggestion!");
      expect(feedback.actualOutcome).toEqual({ success: true });
    });

    it("должен иметь корректную структуру IAISuggestionServiceConfig", () => {
      const config: IAISuggestionServiceConfig = {
        enableLogging: true,
        enableAnalytics: true,
        minConfidenceThreshold: 0.6,
        maxSuggestionsPerUser: 10,
        enableFeedbackCollection: true,
        retentionDays: 90,
      };

      expect(config.enableLogging).toBe(true);
      expect(config.enableAnalytics).toBe(true);
      expect(config.minConfidenceThreshold).toBe(0.6);
      expect(config.maxSuggestionsPerUser).toBe(10);
      expect(config.enableFeedbackCollection).toBe(true);
      expect(config.retentionDays).toBe(90);
    });
  });

  describe("Interface Compatibility", () => {
    it("IAIProvider должен иметь корректную структуру", () => {
      // Проверяем, что интерфейс IAIProvider имеет правильные методы
      const mockProvider: IAIProvider = {
        name: "TestProvider",
        version: "v1.0.0",
        generateSuggestion: async (
          input: IAISuggestionInput
        ): Promise<IAISuggestionResult> => {
          return {
            suggestionData: { test: true },
            confidenceScore: 0.8,
            executionTimeMs: 100,
            modelVersion: "v1.0.0",
          };
        },
        validateInput: async (input: IAISuggestionInput): Promise<boolean> => {
          return input.type === "game_matching";
        },
        getCapabilities: (): string[] => {
          return ["game_matching"];
        },
      };

      expect(mockProvider.name).toBe("TestProvider");
      expect(mockProvider.version).toBe("v1.0.0");
      expect(typeof mockProvider.generateSuggestion).toBe("function");
      expect(typeof mockProvider.validateInput).toBe("function");
      expect(typeof mockProvider.getCapabilities).toBe("function");
    });

    it("должен поддерживать опциональные поля в IAISuggestionInput", () => {
      const minimalInput: IAISuggestionInput = {
        type: "demand_prediction",
        inputData: { historical: "data" },
      };

      expect(minimalInput.type).toBe("demand_prediction");
      expect(minimalInput.inputData).toEqual({ historical: "data" });
      expect(minimalInput.userId).toBeUndefined();
      expect(minimalInput.contextData).toBeUndefined();
      expect(minimalInput.modelVersion).toBeUndefined();
    });

    it("должен поддерживать опциональные поля в IAISuggestionFeedback", () => {
      const minimalFeedback: IAISuggestionFeedback = {
        wasAccepted: false,
      };

      expect(minimalFeedback.wasAccepted).toBe(false);
      expect(minimalFeedback.userFeedback).toBeUndefined();
      expect(minimalFeedback.actualOutcome).toBeUndefined();
    });

    it("должен поддерживать опциональные поля в IAISuggestionResult", () => {
      const minimalResult: IAISuggestionResult = {
        suggestionData: { result: "test" },
        confidenceScore: 0.7,
        executionTimeMs: 200,
        modelVersion: "v2.0.0",
      };

      expect(minimalResult.suggestionData).toEqual({ result: "test" });
      expect(minimalResult.confidenceScore).toBe(0.7);
      expect(minimalResult.executionTimeMs).toBe(200);
      expect(minimalResult.modelVersion).toBe("v2.0.0");
      expect(minimalResult.metadata).toBeUndefined();
    });
  });

  describe("Type Constraints", () => {
    it("AISuggestionType должен принимать только валидные значения", () => {
      const validTypes: AISuggestionType[] = [
        "game_matching",
        "court_fill_optimization",
        "demand_prediction",
        "rating_update",
      ];

      validTypes.forEach((type) => {
        const input: IAISuggestionInput = {
          type,
          inputData: { test: true },
        };
        expect(input.type).toBe(type);
      });
    });

    it("confidenceScore должен быть числом от 0 до 1", () => {
      const result: IAISuggestionResult = {
        suggestionData: {},
        confidenceScore: 0.85,
        executionTimeMs: 100,
        modelVersion: "v1.0.0",
      };

      expect(typeof result.confidenceScore).toBe("number");
      expect(result.confidenceScore).toBeGreaterThanOrEqual(0);
      expect(result.confidenceScore).toBeLessThanOrEqual(1);
    });

    it("executionTimeMs должен быть положительным числом", () => {
      const result: IAISuggestionResult = {
        suggestionData: {},
        confidenceScore: 0.8,
        executionTimeMs: 150.25,
        modelVersion: "v1.0.0",
      };

      expect(typeof result.executionTimeMs).toBe("number");
      expect(result.executionTimeMs).toBeGreaterThan(0);
    });

    it("wasAccepted должен быть boolean", () => {
      const feedbackAccepted: IAISuggestionFeedback = {
        wasAccepted: true,
      };

      const feedbackRejected: IAISuggestionFeedback = {
        wasAccepted: false,
      };

      expect(typeof feedbackAccepted.wasAccepted).toBe("boolean");
      expect(typeof feedbackRejected.wasAccepted).toBe("boolean");
      expect(feedbackAccepted.wasAccepted).toBe(true);
      expect(feedbackRejected.wasAccepted).toBe(false);
    });
  });

  describe("Configuration Validation", () => {
    it("должен поддерживать частичную конфигурацию", () => {
      const partialConfig: Partial<IAISuggestionServiceConfig> = {
        enableLogging: false,
        minConfidenceThreshold: 0.8,
      };

      expect(partialConfig.enableLogging).toBe(false);
      expect(partialConfig.minConfidenceThreshold).toBe(0.8);
      expect(partialConfig.enableAnalytics).toBeUndefined();
      expect(partialConfig.maxSuggestionsPerUser).toBeUndefined();
    });

    it("должен иметь разумные значения по умолчанию", () => {
      const defaultConfig: IAISuggestionServiceConfig = {
        enableLogging: true,
        enableAnalytics: true,
        minConfidenceThreshold: 0.6,
        maxSuggestionsPerUser: 10,
        enableFeedbackCollection: true,
        retentionDays: 90,
      };

      expect(defaultConfig.enableLogging).toBe(true);
      expect(defaultConfig.enableAnalytics).toBe(true);
      expect(defaultConfig.minConfidenceThreshold).toBe(0.6);
      expect(defaultConfig.maxSuggestionsPerUser).toBe(10);
      expect(defaultConfig.enableFeedbackCollection).toBe(true);
      expect(defaultConfig.retentionDays).toBe(90);
    });

    it("должен поддерживать валидацию пороговых значений", () => {
      const config: IAISuggestionServiceConfig = {
        enableLogging: true,
        enableAnalytics: true,
        minConfidenceThreshold: 0.75,
        maxSuggestionsPerUser: 5,
        enableFeedbackCollection: true,
        retentionDays: 30,
      };

      expect(config.minConfidenceThreshold).toBeGreaterThan(0);
      expect(config.minConfidenceThreshold).toBeLessThan(1);
      expect(config.maxSuggestionsPerUser).toBeGreaterThan(0);
      expect(config.retentionDays).toBeGreaterThan(0);
    });
  });

  describe("Provider Interface", () => {
    it("должен поддерживать async методы в IAIProvider", async () => {
      const mockProvider: IAIProvider = {
        name: "AsyncTestProvider",
        version: "v1.0.0",
        generateSuggestion: async (
          input: IAISuggestionInput
        ): Promise<IAISuggestionResult> => {
          // Имитация async операции
          await new Promise((resolve) => setTimeout(resolve, 1));
          return {
            suggestionData: { async: true },
            confidenceScore: 0.9,
            executionTimeMs: 50,
            modelVersion: "v1.0.0",
          };
        },
        validateInput: async (input: IAISuggestionInput): Promise<boolean> => {
          await new Promise((resolve) => setTimeout(resolve, 1));
          return true;
        },
        getCapabilities: (): string[] => {
          return ["game_matching", "court_fill_optimization"];
        },
      };

      const input: IAISuggestionInput = {
        type: "game_matching",
        inputData: { test: true },
      };

      const result = await mockProvider.generateSuggestion(input);
      const isValid = await mockProvider.validateInput(input);
      const capabilities = mockProvider.getCapabilities();

      expect(result.suggestionData).toEqual({ async: true });
      expect(result.confidenceScore).toBe(0.9);
      expect(isValid).toBe(true);
      expect(capabilities).toHaveLength(2);
      expect(capabilities).toContain("game_matching");
      expect(capabilities).toContain("court_fill_optimization");
    });

    it("должен поддерживать различные типы данных в suggestionData", () => {
      const complexSuggestionData = {
        players: ["player1", "player2"],
        timeSlot: "18:00",
        court: { id: "court1", type: "paddle" },
        metadata: {
          algorithm: "ml_v2",
          confidence: 0.95,
          factors: ["rating", "availability", "preference"],
        },
        recommendations: [
          { action: "book_court", priority: 1 },
          { action: "send_notification", priority: 2 },
        ],
      };

      const result: IAISuggestionResult = {
        suggestionData: complexSuggestionData,
        confidenceScore: 0.95,
        executionTimeMs: 250.75,
        modelVersion: "v2.1.0",
        metadata: {
          processingSteps: 5,
          dataPoints: 1000,
        },
      };

      expect(result.suggestionData.players).toHaveLength(2);
      expect(result.suggestionData.court.type).toBe("paddle");
      expect(result.suggestionData.recommendations).toHaveLength(2);
      expect(result.metadata?.processingSteps).toBe(5);
    });
  });
});
