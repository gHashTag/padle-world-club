/**
 * 🕉️ Obsidian Sync Middleware
 * Middleware для обработки запросов синхронизации от Obsidian
 */

import { Request, Response, NextFunction } from "express";
import { z } from "zod";

// Схема для запросов синхронизации из Obsidian
export const obsidianSyncRequestSchema = z.object({
  table: z.string(),
  action: z.enum(["update", "create", "delete"]),
  data: z.record(z.any()),
  metadata: z.object({
    sync_id: z.string(),
    timestamp: z.string().datetime(),
    source: z.literal("obsidian"),
    user_agent: z.string().optional(),
  }),
});

export interface ObsidianSyncRequest extends Request {
  obsidianSync?: {
    table: string;
    action: "update" | "create" | "delete";
    data: Record<string, any>;
    metadata: {
      sync_id: string;
      timestamp: string;
      source: "obsidian";
      user_agent?: string;
    };
  };
}

/**
 * Middleware для валидации запросов синхронизации от Obsidian
 */
export const validateObsidianSync = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Проверяем заголовок X-Obsidian-Sync
    const isObsidianSync = req.headers["x-obsidian-sync"];

    if (!isObsidianSync) {
      return next(); // Не запрос от Obsidian, пропускаем
    }

    // Валидируем данные запроса
    const validatedData = obsidianSyncRequestSchema.parse(req.body);

    // Добавляем валидированные данные к запросу
    (req as ObsidianSyncRequest).obsidianSync = validatedData;

    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Invalid Obsidian sync request format",
        errors: error.errors,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error processing Obsidian sync request",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

/**
 * Middleware для логирования запросов синхронизации
 */
export const logObsidianSync = (
  req: ObsidianSyncRequest,
  _res: Response,
  next: NextFunction
) => {
  if (req.obsidianSync) {
    console.log(
      `🔄 Obsidian Sync: ${req.obsidianSync.action} ${req.obsidianSync.table}`,
      {
        sync_id: req.obsidianSync.metadata.sync_id,
        timestamp: req.obsidianSync.metadata.timestamp,
        data_keys: Object.keys(req.obsidianSync.data),
      }
    );
  }

  next();
};

/**
 * Middleware для добавления CORS заголовков для Obsidian
 */
export const obsidianCors = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Разрешаем запросы от Obsidian (обычно localhost)
  const obsidianOrigins = [
    "app://obsidian.md",
    "capacitor://localhost",
    "http://localhost",
    "https://localhost",
  ];

  const origin = req.headers.origin;

  if (origin && obsidianOrigins.some((allowed) => origin.startsWith(allowed))) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Obsidian-Sync"
  );
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  next();
};

/**
 * Утилита для создания ответа в формате Obsidian
 */
export const createObsidianResponse = (
  data: any,
  success: boolean = true,
  message?: string
) => {
  return {
    success,
    data,
    message,
    timestamp: new Date().toISOString(),
    source: "padle-world-club-api",
  };
};

/**
 * Middleware для форматирования ответов для Obsidian
 */
export const formatObsidianResponse = (
  req: ObsidianSyncRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.obsidianSync) {
    // Перехватываем стандартный метод json
    const originalJson = res.json;

    res.json = function (body: any) {
      // Форматируем ответ для Obsidian
      const obsidianFormattedResponse = createObsidianResponse(
        body.data || body,
        body.success !== false,
        body.message
      );

      return originalJson.call(this, obsidianFormattedResponse);
    };
  }

  next();
};
