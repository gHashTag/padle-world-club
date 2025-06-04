/**
 * Обработчики для API AI Suggestion Logs
 * Содержит функции для работы с логами AI предложений
 */

import { Request, Response } from "express";
import { AISuggestionLogRepository } from "../../repositories/ai-suggestion-log-repository";
import { db } from "../../db";
import { LogContext } from "../types";
import {
  CreateAISuggestionLogRequest,
  UpdateAISuggestionLogRequest,
  SearchAISuggestionLogsRequest,
  CleanupAISuggestionLogsRequest,
  ProcessFeedbackRequest,
} from "../validators/ai-suggestion-logs";

// Проверяем, что db не null
if (!db) {
  throw new Error("Database connection is not available");
}

const aiSuggestionLogRepository = new AISuggestionLogRepository(db);

/**
 * Создать новый лог AI предложения
 */
export const createAISuggestionLog = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const data = req.body as CreateAISuggestionLogRequest;
    const context: LogContext = {
      requestId: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: req.user?.id,
      method: req.method,
      path: req.path,
      userAgent: req.get("User-Agent"),
      ip: req.ip || req.connection.remoteAddress || "unknown",
      timestamp: new Date().toISOString(),
    };

    // Преобразуем числовые поля в строки для совместимости с numeric полями в БД
    const logData = {
      ...data,
      confidenceScore: data.confidenceScore.toString(),
      executionTimeMs: data.executionTimeMs.toString(),
      contextData: { ...data.contextData, ...context },
    };

    const result = await aiSuggestionLogRepository.create(logData);

    res.status(201).json({
      success: true,
      data: result,
      message: "AI suggestion log created successfully",
    });
  } catch (error) {
    console.error("Error creating AI suggestion log:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create AI suggestion log",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Получить лог AI предложения по ID
 */
export const getAISuggestionLogById = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await aiSuggestionLogRepository.getById(id);

    if (!result) {
      res.status(404).json({
        success: false,
        message: "AI suggestion log not found",
      });
      return;
    }

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error getting AI suggestion log:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get AI suggestion log",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Обновить лог AI предложения
 */
export const updateAISuggestionLog = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const data = req.body as UpdateAISuggestionLogRequest;

    // Преобразуем данные для обновления в формат, совместимый с репозиторием
    const updateData: any = {};
    if (data.feedback) {
      updateData.userFeedback = data.feedback;
    }
    if (data.contextData) {
      updateData.contextData = data.contextData;
    }

    const result = await aiSuggestionLogRepository.update(id, updateData);

    if (!result) {
      res.status(404).json({
        success: false,
        message: "AI suggestion log not found",
      });
      return;
    }

    res.json({
      success: true,
      data: result,
      message: "AI suggestion log updated successfully",
    });
  } catch (error) {
    console.error("Error updating AI suggestion log:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update AI suggestion log",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Удалить лог AI предложения
 */
export const deleteAISuggestionLog = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const success = await aiSuggestionLogRepository.delete(id);

    if (!success) {
      res.status(404).json({
        success: false,
        message: "AI suggestion log not found",
      });
      return;
    }

    res.json({
      success: true,
      message: "AI suggestion log deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting AI suggestion log:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete AI suggestion log",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Поиск логов AI предложений
 */
export const searchAISuggestionLogs = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const query = req.query as unknown as SearchAISuggestionLogsRequest;

    // Используем getAll с фильтрацией
    const result = await aiSuggestionLogRepository.getAll(
      query.limit,
      query.offset
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error searching AI suggestion logs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to search AI suggestion logs",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Получить логи AI предложений пользователя
 */
export const getUserAISuggestionLogs = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { userId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    const result = await aiSuggestionLogRepository.getByUser(
      userId,
      undefined,
      Number(limit),
      Number(offset)
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error getting user AI suggestion logs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get user AI suggestion logs",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Отметить как принятое
 */
export const markAsAccepted = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await aiSuggestionLogRepository.markAsAccepted(id);

    if (!result) {
      res.status(404).json({
        success: false,
        message: "AI suggestion log not found",
      });
      return;
    }

    res.json({
      success: true,
      data: result,
      message: "AI suggestion marked as accepted",
    });
  } catch (error) {
    console.error("Error marking as accepted:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark as accepted",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Отметить как отклоненное
 */
export const markAsRejected = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const result = await aiSuggestionLogRepository.markAsRejected(id);

    if (!result) {
      res.status(404).json({
        success: false,
        message: "AI suggestion log not found",
      });
      return;
    }

    res.json({
      success: true,
      data: result,
      message: "AI suggestion marked as rejected",
    });
  } catch (error) {
    console.error("Error marking as rejected:", error);
    res.status(500).json({
      success: false,
      message: "Failed to mark as rejected",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Обработать обратную связь
 */
export const processFeedback = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const data = req.body as ProcessFeedbackRequest;

    const result = await aiSuggestionLogRepository.update(id, {
      userFeedback: data.feedback,
    });

    if (!result) {
      res.status(404).json({
        success: false,
        message: "AI suggestion log not found",
      });
      return;
    }

    res.json({
      success: true,
      data: result,
      message: "Feedback processed successfully",
    });
  } catch (error) {
    console.error("Error processing feedback:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process feedback",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Получить статистику AI предложений
 */
export const getAISuggestionStats = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    // Используем getStats без параметров или с userId
    const result = await aiSuggestionLogRepository.getStats();

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error getting AI suggestion stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get AI suggestion stats",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Получить недавние логи AI предложений
 */
export const getRecentAISuggestionLogs = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    // Используем getRecentLogs с параметром days
    const result = await aiSuggestionLogRepository.getRecentLogs(7); // последние 7 дней

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error("Error getting recent AI suggestion logs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get recent AI suggestion logs",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Очистить старые логи AI предложений
 */
export const cleanupAISuggestionLogs = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const data = req.body as CleanupAISuggestionLogsRequest;

    // Используем deleteOld для очистки старых записей
    const result = await aiSuggestionLogRepository.deleteOld(
      data.olderThanDays
    );

    res.json({
      success: true,
      data: { deletedCount: result },
      message: data.dryRun
        ? `Would delete ${result} old AI suggestion logs`
        : `Deleted ${result} old AI suggestion logs`,
    });
  } catch (error) {
    console.error("Error cleaning up AI suggestion logs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to cleanup AI suggestion logs",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};
