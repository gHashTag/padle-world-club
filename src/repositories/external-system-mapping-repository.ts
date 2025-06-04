import { eq, and, desc, asc, count, isNotNull, sql } from "drizzle-orm";
import { db } from "../db/connection";
import {
  externalSystemMapping,
  ExternalSystemMapping,
  NewExternalSystemMapping,
} from "../db/schema/externalSystemMapping";

type DatabaseType = NonNullable<typeof db>;

export class ExternalSystemMappingRepository {
  constructor(private db: DatabaseType) {}

  // Создание нового маппинга
  async create(data: NewExternalSystemMapping): Promise<ExternalSystemMapping> {
    const [mapping] = await this.db
      .insert(externalSystemMapping)
      .values(data)
      .returning();
    return mapping;
  }

  // Поиск по ID
  async findById(id: string): Promise<ExternalSystemMapping | null> {
    const [mapping] = await this.db
      .select()
      .from(externalSystemMapping)
      .where(eq(externalSystemMapping.id, id))
      .limit(1);
    return mapping || null;
  }

  // Поиск по внешнему ID и системе
  async findByExternalId(
    externalSystem: string,
    externalId: string
  ): Promise<ExternalSystemMapping | null> {
    const [mapping] = await this.db
      .select()
      .from(externalSystemMapping)
      .where(
        and(
          eq(externalSystemMapping.externalSystem, externalSystem as any),
          eq(externalSystemMapping.externalId, externalId)
        )
      )
      .limit(1);
    return mapping || null;
  }

  // Поиск по внутренней сущности
  async findByInternalEntity(
    entityType: string,
    entityId: string
  ): Promise<ExternalSystemMapping[]> {
    return await this.db
      .select()
      .from(externalSystemMapping)
      .where(
        and(
          eq(externalSystemMapping.internalEntityType, entityType as any),
          eq(externalSystemMapping.internalEntityId, entityId)
        )
      )
      .orderBy(desc(externalSystemMapping.createdAt));
  }

  // Поиск по системе
  async findBySystem(externalSystem: string): Promise<ExternalSystemMapping[]> {
    return await this.db
      .select()
      .from(externalSystemMapping)
      .where(eq(externalSystemMapping.externalSystem, externalSystem as any))
      .orderBy(desc(externalSystemMapping.createdAt));
  }

  // Поиск активных маппингов
  async findActive(): Promise<ExternalSystemMapping[]> {
    return await this.db
      .select()
      .from(externalSystemMapping)
      .where(eq(externalSystemMapping.isActive, true))
      .orderBy(desc(externalSystemMapping.createdAt));
  }

  // Поиск маппингов с конфликтами
  async findWithConflicts(): Promise<ExternalSystemMapping[]> {
    return await this.db
      .select()
      .from(externalSystemMapping)
      .where(eq(externalSystemMapping.hasConflict, true))
      .orderBy(desc(externalSystemMapping.updatedAt));
  }

  // Поиск устаревших маппингов (не синхронизировались давно)
  async findOutdated(daysOld: number = 7): Promise<ExternalSystemMapping[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    return await this.db
      .select()
      .from(externalSystemMapping)
      .where(
        and(
          eq(externalSystemMapping.isActive, true),
          sql`${externalSystemMapping.lastSyncAt} < ${cutoffDate} OR ${externalSystemMapping.lastSyncAt} IS NULL`
        )
      )
      .orderBy(asc(externalSystemMapping.lastSyncAt));
  }

  // Поиск маппингов с ошибками
  async findWithErrors(): Promise<ExternalSystemMapping[]> {
    return await this.db
      .select()
      .from(externalSystemMapping)
      .where(isNotNull(externalSystemMapping.lastError))
      .orderBy(desc(externalSystemMapping.updatedAt));
  }

  // Обновление маппинга
  async update(
    id: string,
    data: Partial<NewExternalSystemMapping>
  ): Promise<ExternalSystemMapping | null> {
    const [mapping] = await this.db
      .update(externalSystemMapping)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(externalSystemMapping.id, id))
      .returning();
    return mapping || null;
  }

  // Обновление статуса синхронизации
  async updateSyncStatus(
    id: string,
    syncData?: string,
    hasConflict: boolean = false,
    conflictData?: string,
    lastError?: string
  ): Promise<ExternalSystemMapping | null> {
    const updateData: any = {
      lastSyncAt: new Date(),
      hasConflict,
      updatedAt: new Date(),
    };

    if (syncData !== undefined) updateData.syncData = syncData;
    if (conflictData !== undefined) updateData.conflictData = conflictData;
    if (lastError !== undefined) updateData.lastError = lastError;

    const [mapping] = await this.db
      .update(externalSystemMapping)
      .set(updateData)
      .where(eq(externalSystemMapping.id, id))
      .returning();
    return mapping || null;
  }

  // Массовое обновление статуса синхронизации
  async bulkUpdateSyncStatus(
    ids: string[],
    syncData?: string,
    hasConflict: boolean = false
  ): Promise<number> {
    if (ids.length === 0) return 0;

    const updateData: any = {
      lastSyncAt: new Date(),
      hasConflict,
      updatedAt: new Date(),
    };

    if (syncData !== undefined) updateData.syncData = syncData;

    const result = await this.db
      .update(externalSystemMapping)
      .set(updateData)
      .where(
        sql`${externalSystemMapping.id} = ANY(${sql.raw(
          `ARRAY[${ids.map((id) => `'${id}'::uuid`).join(",")}]`
        )})`
      )
      .returning();

    return result.length;
  }

  // Деактивация маппинга
  async deactivate(id: string): Promise<ExternalSystemMapping | null> {
    const [mapping] = await this.db
      .update(externalSystemMapping)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(externalSystemMapping.id, id))
      .returning();
    return mapping || null;
  }

  // Удаление маппинга
  async delete(id: string): Promise<boolean> {
    const result = await this.db
      .delete(externalSystemMapping)
      .where(eq(externalSystemMapping.id, id))
      .returning();
    return result.length > 0;
  }

  // Подсчет маппингов
  async count(): Promise<number> {
    const [result] = await this.db
      .select({ count: count() })
      .from(externalSystemMapping);
    return Number(result.count);
  }

  // Подсчет по системе
  async countBySystem(externalSystem: string): Promise<number> {
    const [result] = await this.db
      .select({ count: count() })
      .from(externalSystemMapping)
      .where(eq(externalSystemMapping.externalSystem, externalSystem as any));
    return Number(result.count);
  }

  // Статистика маппингов
  async getMappingStats(): Promise<{
    total: number;
    active: number;
    withConflicts: number;
    withErrors: number;
    bySystem: Record<string, number>;
  }> {
    const [totalResult] = await this.db
      .select({ count: count() })
      .from(externalSystemMapping);

    const [activeResult] = await this.db
      .select({ count: count() })
      .from(externalSystemMapping)
      .where(eq(externalSystemMapping.isActive, true));

    const [conflictsResult] = await this.db
      .select({ count: count() })
      .from(externalSystemMapping)
      .where(eq(externalSystemMapping.hasConflict, true));

    const [errorsResult] = await this.db
      .select({ count: count() })
      .from(externalSystemMapping)
      .where(isNotNull(externalSystemMapping.lastError));

    // Статистика по системам
    const systemStats = await this.db
      .select({
        system: externalSystemMapping.externalSystem,
        count: count(),
      })
      .from(externalSystemMapping)
      .groupBy(externalSystemMapping.externalSystem);

    const bySystem: Record<string, number> = {};
    systemStats.forEach((stat: { system: string; count: number }) => {
      bySystem[stat.system] = Number(stat.count);
    });

    return {
      total: Number(totalResult.count),
      active: Number(activeResult.count),
      withConflicts: Number(conflictsResult.count),
      withErrors: Number(errorsResult.count),
      bySystem,
    };
  }

  // Получение всех маппингов с пагинацией
  async findMany(
    limit: number = 50,
    offset: number = 0
  ): Promise<ExternalSystemMapping[]> {
    return await this.db
      .select()
      .from(externalSystemMapping)
      .orderBy(desc(externalSystemMapping.createdAt))
      .limit(limit)
      .offset(offset);
  }

  // Поиск дублирующихся маппингов
  async findDuplicates(): Promise<ExternalSystemMapping[]> {
    // Находим маппинги, где есть дублирование по externalSystem + externalId
    const duplicates = await this.db
      .select()
      .from(externalSystemMapping)
      .where(
        sql`(${externalSystemMapping.externalSystem}, ${externalSystemMapping.externalId}) IN (
          SELECT ${externalSystemMapping.externalSystem}, ${externalSystemMapping.externalId}
          FROM ${externalSystemMapping}
          GROUP BY ${externalSystemMapping.externalSystem}, ${externalSystemMapping.externalId}
          HAVING COUNT(*) > 1
        )`
      )
      .orderBy(
        externalSystemMapping.externalSystem,
        externalSystemMapping.externalId,
        desc(externalSystemMapping.createdAt)
      );

    return duplicates;
  }

  // Очистка старых неактивных маппингов
  async cleanupOldInactive(daysOld: number = 30): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await this.db
      .delete(externalSystemMapping)
      .where(
        and(
          eq(externalSystemMapping.isActive, false),
          sql`${externalSystemMapping.updatedAt} < ${cutoffDate}`
        )
      )
      .returning();

    return result.length;
  }
}
