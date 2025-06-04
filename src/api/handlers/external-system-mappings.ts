import { Request, Response } from "express";
import { db } from "../../db/connection";
import { ExternalSystemMappingRepository } from "../../repositories/external-system-mapping-repository";
import { logger } from "../middleware/logger";
import {
  CreateExternalSystemMappingInput,
  UpdateExternalSystemMappingInput,
  UpdateSyncStatusInput,
  BulkUpdateSyncStatusInput,
  FindByExternalIdQuery,
  FindByInternalEntityQuery,
  FindBySystemQuery,
  FindOutdatedQuery,
  CleanupOldInactiveQuery,
  PaginationQuery,
  MappingIdParam,
} from "../validators/external-system-mappings";

// Инициализация репозитория
const getRepository = (): ExternalSystemMappingRepository => {
  if (!db) {
    throw new Error("Database connection not available");
  }
  return new ExternalSystemMappingRepository(db);
};

// CREATE - Создание нового маппинга
export const createExternalSystemMapping = async (
  req: Request<{}, any, CreateExternalSystemMappingInput>,
  res: Response
): Promise<void> => {
  try {
    const repo = getRepository();
    const mapping = await repo.create(req.body);

    logger.info("External system mapping created", {
      mappingId: mapping.id,
      externalSystem: mapping.externalSystem,
      internalEntityType: mapping.internalEntityType,
    });

    res.status(201).json({
      success: true,
      data: mapping,
    });
  } catch (error) {
    logger.error("Failed to create external system mapping", { error });
    res.status(500).json({
      success: false,
      error: "Failed to create external system mapping",
    });
  }
};

// READ - Получение маппинга по ID
export const getExternalSystemMappingById = async (
  req: Request<MappingIdParam>,
  res: Response
): Promise<void> => {
  try {
    const repo = getRepository();
    const mapping = await repo.findById(req.params.id);

    if (!mapping) {
      res.status(404).json({
        success: false,
        error: "External system mapping not found",
      });
      return;
    }

    res.json({
      success: true,
      data: mapping,
    });
  } catch (error) {
    logger.error("Failed to get external system mapping", {
      error,
      id: req.params.id,
    });
    res.status(500).json({
      success: false,
      error: "Failed to get external system mapping",
    });
  }
};

// UPDATE - Обновление маппинга
export const updateExternalSystemMapping = async (
  req: Request<MappingIdParam, any, UpdateExternalSystemMappingInput>,
  res: Response
): Promise<void> => {
  try {
    const repo = getRepository();
    const mapping = await repo.update(req.params.id, req.body);

    if (!mapping) {
      res.status(404).json({
        success: false,
        error: "External system mapping not found",
      });
      return;
    }

    logger.info("External system mapping updated", {
      mappingId: mapping.id,
      updates: Object.keys(req.body),
    });

    res.json({
      success: true,
      data: mapping,
    });
  } catch (error) {
    logger.error("Failed to update external system mapping", {
      error,
      id: req.params.id,
    });
    res.status(500).json({
      success: false,
      error: "Failed to update external system mapping",
    });
  }
};

// DELETE - Удаление маппинга
export const deleteExternalSystemMapping = async (
  req: Request<MappingIdParam>,
  res: Response
): Promise<void> => {
  try {
    const repo = getRepository();
    const deleted = await repo.delete(req.params.id);

    if (!deleted) {
      res.status(404).json({
        success: false,
        error: "External system mapping not found",
      });
      return;
    }

    logger.info("External system mapping deleted", {
      mappingId: req.params.id,
    });

    res.json({
      success: true,
      message: "External system mapping deleted successfully",
    });
  } catch (error) {
    logger.error("Failed to delete external system mapping", {
      error,
      id: req.params.id,
    });
    res.status(500).json({
      success: false,
      error: "Failed to delete external system mapping",
    });
  }
};

// QUERY - Поиск по внешнему ID
export const findByExternalId = async (
  req: Request<{}, any, {}, FindByExternalIdQuery>,
  res: Response
): Promise<void> => {
  try {
    const repo = getRepository();
    const mapping = await repo.findByExternalId(
      req.query.externalSystem,
      req.query.externalId
    );

    res.json({
      success: true,
      data: mapping,
    });
  } catch (error) {
    logger.error("Failed to find mapping by external ID", {
      error,
      query: req.query,
    });
    res.status(500).json({
      success: false,
      error: "Failed to find mapping by external ID",
    });
  }
};

// QUERY - Поиск по внутренней сущности
export const findByInternalEntity = async (
  req: Request<{}, any, {}, FindByInternalEntityQuery>,
  res: Response
): Promise<void> => {
  try {
    const repo = getRepository();
    const mappings = await repo.findByInternalEntity(
      req.query.entityType,
      req.query.entityId
    );

    res.json({
      success: true,
      data: mappings,
    });
  } catch (error) {
    logger.error("Failed to find mappings by internal entity", {
      error,
      query: req.query,
    });
    res.status(500).json({
      success: false,
      error: "Failed to find mappings by internal entity",
    });
  }
};

// QUERY - Поиск по системе
export const findBySystem = async (
  req: Request<{}, any, {}, FindBySystemQuery>,
  res: Response
): Promise<void> => {
  try {
    const repo = getRepository();
    const mappings = await repo.findBySystem(req.query.externalSystem);

    res.json({
      success: true,
      data: mappings,
    });
  } catch (error) {
    logger.error("Failed to find mappings by system", {
      error,
      query: req.query,
    });
    res.status(500).json({
      success: false,
      error: "Failed to find mappings by system",
    });
  }
};

// QUERY - Получение всех маппингов с пагинацией
export const getAllExternalSystemMappings = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const repo = getRepository();
    const query = req.query as any as PaginationQuery;
    const mappings = await repo.findMany(query.limit, query.offset);
    const total = await repo.count();

    res.json({
      success: true,
      data: mappings,
      pagination: {
        total,
        limit: query.limit,
        offset: query.offset,
      },
    });
  } catch (error) {
    logger.error("Failed to get all mappings", { error, query: req.query });
    res.status(500).json({
      success: false,
      error: "Failed to get all mappings",
    });
  }
};

// QUERY - Получение активных маппингов
export const getActiveMappings = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const repo = getRepository();
    const mappings = await repo.findActive();

    res.json({
      success: true,
      data: mappings,
    });
  } catch (error) {
    logger.error("Failed to get active mappings", { error });
    res.status(500).json({
      success: false,
      error: "Failed to get active mappings",
    });
  }
};

// QUERY - Получение маппингов с конфликтами
export const getMappingsWithConflicts = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const repo = getRepository();
    const mappings = await repo.findWithConflicts();

    res.json({
      success: true,
      data: mappings,
    });
  } catch (error) {
    logger.error("Failed to get mappings with conflicts", { error });
    res.status(500).json({
      success: false,
      error: "Failed to get mappings with conflicts",
    });
  }
};

// QUERY - Получение устаревших маппингов
export const getOutdatedMappings = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const repo = getRepository();
    const query = req.query as any as FindOutdatedQuery;
    const mappings = await repo.findOutdated(query.daysOld);

    res.json({
      success: true,
      data: mappings,
    });
  } catch (error) {
    logger.error("Failed to get outdated mappings", {
      error,
      query: req.query,
    });
    res.status(500).json({
      success: false,
      error: "Failed to get outdated mappings",
    });
  }
};

// QUERY - Получение маппингов с ошибками
export const getMappingsWithErrors = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const repo = getRepository();
    const mappings = await repo.findWithErrors();

    res.json({
      success: true,
      data: mappings,
    });
  } catch (error) {
    logger.error("Failed to get mappings with errors", { error });
    res.status(500).json({
      success: false,
      error: "Failed to get mappings with errors",
    });
  }
};

// UPDATE - Обновление статуса синхронизации
export const updateSyncStatus = async (
  req: Request<MappingIdParam, any, UpdateSyncStatusInput>,
  res: Response
): Promise<void> => {
  try {
    const repo = getRepository();
    const mapping = await repo.updateSyncStatus(
      req.params.id,
      req.body.syncData,
      req.body.hasConflict,
      req.body.conflictData,
      req.body.lastError
    );

    if (!mapping) {
      res.status(404).json({
        success: false,
        error: "External system mapping not found",
      });
      return;
    }

    logger.info("Sync status updated", { mappingId: mapping.id });

    res.json({
      success: true,
      data: mapping,
    });
  } catch (error) {
    logger.error("Failed to update sync status", {
      error,
      id: req.params.id,
    });
    res.status(500).json({
      success: false,
      error: "Failed to update sync status",
    });
  }
};

// UPDATE - Массовое обновление статуса синхронизации
export const bulkUpdateSyncStatus = async (
  req: Request<{}, any, BulkUpdateSyncStatusInput>,
  res: Response
): Promise<void> => {
  try {
    const repo = getRepository();
    const updatedCount = await repo.bulkUpdateSyncStatus(
      req.body.ids,
      req.body.syncData,
      req.body.hasConflict
    );

    logger.info("Bulk sync status updated", {
      updatedCount,
      totalIds: req.body.ids.length,
    });

    res.json({
      success: true,
      data: {
        updatedCount,
        totalRequested: req.body.ids.length,
      },
    });
  } catch (error) {
    logger.error("Failed to bulk update sync status", {
      error,
      body: req.body,
    });
    res.status(500).json({
      success: false,
      error: "Failed to bulk update sync status",
    });
  }
};

// UPDATE - Деактивация маппинга
export const deactivateMapping = async (
  req: Request<MappingIdParam>,
  res: Response
): Promise<void> => {
  try {
    const repo = getRepository();
    const mapping = await repo.deactivate(req.params.id);

    if (!mapping) {
      res.status(404).json({
        success: false,
        error: "External system mapping not found",
      });
      return;
    }

    logger.info("Mapping deactivated", { mappingId: mapping.id });

    res.json({
      success: true,
      data: mapping,
    });
  } catch (error) {
    logger.error("Failed to deactivate mapping", {
      error,
      id: req.params.id,
    });
    res.status(500).json({
      success: false,
      error: "Failed to deactivate mapping",
    });
  }
};

// ANALYTICS - Получение статистики маппингов
export const getMappingStats = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const repo = getRepository();
    const stats = await repo.getMappingStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error("Failed to get mapping stats", { error });
    res.status(500).json({
      success: false,
      error: "Failed to get mapping stats",
    });
  }
};

// ANALYTICS - Поиск дублирующихся маппингов
export const findDuplicateMappings = async (
  _req: Request,
  res: Response
): Promise<void> => {
  try {
    const repo = getRepository();
    const duplicates = await repo.findDuplicates();

    res.json({
      success: true,
      data: duplicates,
    });
  } catch (error) {
    logger.error("Failed to find duplicate mappings", { error });
    res.status(500).json({
      success: false,
      error: "Failed to find duplicate mappings",
    });
  }
};

// MAINTENANCE - Очистка старых неактивных маппингов
export const cleanupOldInactiveMappings = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const repo = getRepository();
    const query = req.query as any as CleanupOldInactiveQuery;
    const cleanedCount = await repo.cleanupOldInactive(query.daysOld);

    logger.info("Old inactive mappings cleaned up", { cleanedCount });

    res.json({
      success: true,
      data: {
        cleanedCount,
      },
    });
  } catch (error) {
    logger.error("Failed to cleanup old inactive mappings", {
      error,
      query: req.query,
    });
    res.status(500).json({
      success: false,
      error: "Failed to cleanup old inactive mappings",
    });
  }
};
