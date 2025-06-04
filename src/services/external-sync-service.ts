import { db } from "../db/connection";
import { ExternalSystemMappingRepository } from "../repositories/external-system-mapping-repository";
import { UserRepository } from "../repositories/user-repository";
import { VenueRepository } from "../repositories/venue-repository";
import { BookingRepository } from "../repositories/booking-repository";
import { CourtRepository } from "../repositories/court-repository";
import { logger } from "../api/middleware/logger";
// Импортируем типы из enum файла
type ExternalSystem =
  | "exporta"
  | "google_calendar"
  | "whatsapp_api"
  | "telegram_api"
  | "payment_gateway_api"
  | "other";
type ExternalEntityMappingType =
  | "user"
  | "booking"
  | "court"
  | "class"
  | "venue"
  | "class_schedule"
  | "product"
  | "training_package_definition";

import type { ExternalSystemMapping } from "../db/schema/externalSystemMapping";

// Типы для синхронизации
export interface SyncResult {
  success: boolean;
  mappingId?: string;
  error?: string;
  conflictData?: any;
}

export interface ExternalEntityData {
  externalId: string;
  data: Record<string, any>;
  lastModified?: Date;
}

export interface SyncOptions {
  forceUpdate?: boolean;
  resolveConflicts?: boolean;
  dryRun?: boolean;
}

export interface SyncStats {
  total: number;
  successful: number;
  failed: number;
  conflicts: number;
  skipped: number;
}

// Интерфейс для внешних систем
export interface ExternalSystemAdapter {
  systemType: ExternalSystem;

  // Получение данных из внешней системы
  fetchEntity(
    externalId: string,
    entityType: ExternalEntityMappingType
  ): Promise<ExternalEntityData | null>;
  fetchEntities(
    entityType: ExternalEntityMappingType,
    lastSync?: Date
  ): Promise<ExternalEntityData[]>;

  // Отправка данных во внешнюю систему
  pushEntity(
    internalData: any,
    entityType: ExternalEntityMappingType
  ): Promise<string>; // returns externalId
  updateEntity(
    externalId: string,
    internalData: any,
    entityType: ExternalEntityMappingType
  ): Promise<boolean>;

  // Проверка доступности
  healthCheck(): Promise<boolean>;
}

/**
 * Сервис синхронизации с внешними системами
 */
export class ExternalSyncService {
  private mappingRepo: ExternalSystemMappingRepository;
  private userRepo: UserRepository;
  private venueRepo: VenueRepository;
  private bookingRepo: BookingRepository;
  private courtRepo: CourtRepository;
  private adapters: Map<ExternalSystem, ExternalSystemAdapter> = new Map();

  constructor() {
    if (!db) {
      throw new Error("Database connection not available");
    }
    this.mappingRepo = new ExternalSystemMappingRepository(db);
    this.userRepo = new UserRepository(db);
    this.venueRepo = new VenueRepository(db);
    this.bookingRepo = new BookingRepository(db);
    this.courtRepo = new CourtRepository(db);
  }

  /**
   * Регистрация адаптера для внешней системы
   */
  registerAdapter(adapter: ExternalSystemAdapter): void {
    this.adapters.set(adapter.systemType, adapter);
    logger.info("External system adapter registered", {
      system: adapter.systemType,
    });
  }

  /**
   * Синхронизация конкретной сущности
   */
  async syncEntity(
    externalSystem: ExternalSystem,
    externalId: string,
    entityType: ExternalEntityMappingType,
    options: SyncOptions = {}
  ): Promise<SyncResult> {
    try {
      const adapter = this.adapters.get(externalSystem);
      if (!adapter) {
        return {
          success: false,
          error: `No adapter registered for system: ${externalSystem}`,
        };
      }

      // Проверяем существующий маппинг
      const existingMapping = await this.mappingRepo.findByExternalId(
        externalSystem,
        externalId
      );

      // Получаем данные из внешней системы
      const externalData = await adapter.fetchEntity(externalId, entityType);
      if (!externalData) {
        return {
          success: false,
          error: "Entity not found in external system",
        };
      }

      if (options.dryRun) {
        return {
          success: true,
          mappingId: existingMapping?.id,
        };
      }

      let internalEntityId: string;
      let mapping: ExternalSystemMapping;

      if (existingMapping) {
        // Обновляем существующую сущность
        const updateResult = await this.updateInternalEntity(
          existingMapping.internalEntityId,
          entityType,
          externalData.data,
          options
        );

        if (!updateResult.success) {
          // Обновляем маппинг с ошибкой
          await this.mappingRepo.updateSyncStatus(
            existingMapping.id,
            JSON.stringify(externalData.data),
            true,
            JSON.stringify(updateResult.conflictData),
            updateResult.error
          );

          return updateResult;
        }

        // Обновляем маппинг с успешной синхронизацией
        const updatedMapping = await this.mappingRepo.updateSyncStatus(
          existingMapping.id,
          JSON.stringify(externalData.data),
          false,
          undefined,
          undefined
        );

        if (!updatedMapping) {
          return {
            success: false,
            error: "Failed to update mapping sync status",
          };
        }

        mapping = updatedMapping;

        internalEntityId = existingMapping.internalEntityId;
      } else {
        // Создаем новую сущность
        const createResult = await this.createInternalEntity(
          entityType,
          externalData.data
        );

        if (!createResult.success) {
          return createResult;
        }

        internalEntityId = createResult.internalEntityId!;

        // Создаем новый маппинг
        mapping = await this.mappingRepo.create({
          externalSystem,
          externalId,
          internalEntityType: entityType,
          internalEntityId,
          syncData: JSON.stringify(externalData.data),
          isActive: true,
          hasConflict: false,
        });
      }

      logger.info("Entity synchronized successfully", {
        externalSystem,
        externalId,
        entityType,
        internalEntityId,
        mappingId: mapping.id,
      });

      return {
        success: true,
        mappingId: mapping.id,
      };
    } catch (error) {
      logger.error("Failed to sync entity", {
        error,
        externalSystem,
        externalId,
        entityType,
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Массовая синхронизация сущностей
   */
  async syncEntities(
    externalSystem: ExternalSystem,
    entityType: ExternalEntityMappingType,
    options: SyncOptions = {}
  ): Promise<SyncStats> {
    const stats: SyncStats = {
      total: 0,
      successful: 0,
      failed: 0,
      conflicts: 0,
      skipped: 0,
    };

    try {
      const adapter = this.adapters.get(externalSystem);
      if (!adapter) {
        logger.error("No adapter registered for system", { externalSystem });
        return stats;
      }

      // Получаем последнюю дату синхронизации
      const lastSync = await this.getLastSyncDate(externalSystem, entityType);

      // Получаем данные из внешней системы
      const externalEntities = await adapter.fetchEntities(
        entityType,
        lastSync
      );
      stats.total = externalEntities.length;

      logger.info("Starting bulk sync", {
        externalSystem,
        entityType,
        total: stats.total,
        lastSync,
      });

      // Синхронизируем каждую сущность
      for (const entity of externalEntities) {
        const result = await this.syncEntity(
          externalSystem,
          entity.externalId,
          entityType,
          options
        );

        if (result.success) {
          stats.successful++;
        } else {
          stats.failed++;
          if (result.conflictData) {
            stats.conflicts++;
          }
        }
      }

      logger.info("Bulk sync completed", {
        externalSystem,
        entityType,
        stats,
      });

      return stats;
    } catch (error) {
      logger.error("Failed to sync entities", {
        error,
        externalSystem,
        entityType,
      });

      return stats;
    }
  }

  /**
   * Отправка данных во внешнюю систему
   */
  async pushToExternal(
    mappingId: string,
    options: SyncOptions = {}
  ): Promise<SyncResult> {
    try {
      const mapping = await this.mappingRepo.findById(mappingId);
      if (!mapping) {
        return {
          success: false,
          error: "Mapping not found",
        };
      }

      const adapter = this.adapters.get(mapping.externalSystem);
      if (!adapter) {
        return {
          success: false,
          error: `No adapter registered for system: ${mapping.externalSystem}`,
        };
      }

      // Получаем данные внутренней сущности
      const internalData = await this.getInternalEntityData(
        mapping.internalEntityId,
        mapping.internalEntityType
      );

      if (!internalData) {
        return {
          success: false,
          error: "Internal entity not found",
        };
      }

      if (options.dryRun) {
        return {
          success: true,
          mappingId,
        };
      }

      let success: boolean;

      if (mapping.externalId) {
        // Обновляем существующую сущность
        success = await adapter.updateEntity(
          mapping.externalId,
          internalData,
          mapping.internalEntityType
        );
      } else {
        // Создаем новую сущность
        const externalId = await adapter.pushEntity(
          internalData,
          mapping.internalEntityType
        );

        if (externalId) {
          // Обновляем маппинг с новым externalId
          await this.mappingRepo.update(mappingId, {
            externalId,
          });
          success = true;
        } else {
          success = false;
        }
      }

      if (success) {
        // Обновляем статус синхронизации
        await this.mappingRepo.updateSyncStatus(
          mappingId,
          JSON.stringify(internalData),
          false,
          undefined,
          undefined
        );

        logger.info("Data pushed to external system successfully", {
          mappingId,
          externalSystem: mapping.externalSystem,
          entityType: mapping.internalEntityType,
        });

        return {
          success: true,
          mappingId,
        };
      } else {
        await this.mappingRepo.updateSyncStatus(
          mappingId,
          JSON.stringify(internalData),
          true,
          undefined,
          "Failed to push to external system"
        );

        return {
          success: false,
          error: "Failed to push to external system",
        };
      }
    } catch (error) {
      logger.error("Failed to push to external system", {
        error,
        mappingId,
      });

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Проверка здоровья всех внешних систем
   */
  async healthCheck(): Promise<Record<ExternalSystem, boolean>> {
    const results: Record<string, boolean> = {};

    for (const [system, adapter] of this.adapters) {
      try {
        results[system] = await adapter.healthCheck();
      } catch (error) {
        logger.error("Health check failed", { system, error });
        results[system] = false;
      }
    }

    return results as Record<ExternalSystem, boolean>;
  }

  /**
   * Получение статистики синхронизации
   */
  async getSyncStats(
    _externalSystem?: ExternalSystem,
    _entityType?: ExternalEntityMappingType
  ): Promise<any> {
    return await this.mappingRepo.getMappingStats();
  }

  /**
   * Очистка старых неактивных маппингов
   */
  async cleanup(daysOld: number = 30): Promise<number> {
    return await this.mappingRepo.cleanupOldInactive(daysOld);
  }

  // Приватные методы

  private async createInternalEntity(
    entityType: ExternalEntityMappingType,
    data: any
  ): Promise<{ success: boolean; internalEntityId?: string; error?: string }> {
    try {
      let entity: any;

      switch (entityType) {
        case "user":
          entity = await this.userRepo.create(data);
          break;
        case "venue":
          entity = await this.venueRepo.create(data);
          break;
        case "court":
          entity = await this.courtRepo.create(data);
          break;
        case "booking":
          entity = await this.bookingRepo.create(data);
          break;
        default:
          return {
            success: false,
            error: `Unsupported entity type: ${entityType}`,
          };
      }

      return {
        success: true,
        internalEntityId: entity.id,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private async updateInternalEntity(
    internalEntityId: string,
    entityType: ExternalEntityMappingType,
    data: any,
    _options: SyncOptions
  ): Promise<{ success: boolean; conflictData?: any; error?: string }> {
    try {
      let entity: any;

      switch (entityType) {
        case "user":
          entity = await this.userRepo.update(internalEntityId, data);
          break;
        case "venue":
          entity = await this.venueRepo.update(internalEntityId, data);
          break;
        case "court":
          entity = await this.courtRepo.update(internalEntityId, data);
          break;
        case "booking":
          entity = await this.bookingRepo.update(internalEntityId, data);
          break;
        default:
          return {
            success: false,
            error: `Unsupported entity type: ${entityType}`,
          };
      }

      if (!entity) {
        return {
          success: false,
          error: "Entity not found",
        };
      }

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  private async getInternalEntityData(
    internalEntityId: string,
    entityType: ExternalEntityMappingType
  ): Promise<any> {
    switch (entityType) {
      case "user":
        return await this.userRepo.getById(internalEntityId);
      case "venue":
        return await this.venueRepo.getById(internalEntityId);
      case "court":
        return await this.courtRepo.getById(internalEntityId);
      case "booking":
        return await this.bookingRepo.getById(internalEntityId);
      default:
        return null;
    }
  }

  private async getLastSyncDate(
    externalSystem: ExternalSystem,
    entityType: ExternalEntityMappingType
  ): Promise<Date | undefined> {
    // Получаем последнюю успешную синхронизацию для данной системы и типа
    const mappings = await this.mappingRepo.findBySystem(externalSystem);
    const filteredMappings = mappings.filter(
      (m) =>
        m.internalEntityType === entityType && !m.hasConflict && !m.lastError
    );

    if (filteredMappings.length === 0) {
      return undefined;
    }

    // Находим самую позднюю дату обновления
    const latestMapping = filteredMappings.reduce((latest, current) =>
      current.updatedAt > latest.updatedAt ? current : latest
    );

    return latestMapping.updatedAt;
  }
}

// Экспорт singleton instance
export const externalSyncService = new ExternalSyncService();
