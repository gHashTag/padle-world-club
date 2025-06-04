/**
 * Репозиторий для работы с моделью Task
 * Содержит методы CRUD для работы с задачами
 */

import { eq, and, desc, asc, sql, count, like, gte, lte, isNull } from "drizzle-orm";


import {
  Task,
  NewTask,
  tasks,
  UpdateTask,
  TaskStats,
  TaskGroupedByStatus,
  TASK_STATUSES,
  TaskStatus,
  TaskPriority,
  RelatedEntityType
} from "../db/schema";

import { DatabaseType } from "./types";

export class TaskRepository {
  constructor(private db: DatabaseType) {}

  /**
   * Создать новую задачу
   * @param data Данные для создания задачи
   * @returns Созданная задача
   */
  async create(data: NewTask): Promise<Task> {
    const [task] = await this.db.insert(tasks).values(data).returning();
    return task;
  }

  /**
   * Получить задачу по ID
   * @param id ID задачи
   * @returns Задача или null
   */
  async getById(id: string): Promise<Task | null> {
    const [task] = await this.db
      .select()
      .from(tasks)
      .where(eq(tasks.id, id));
    return task || null;
  }

  /**
   * Получить задачи по исполнителю
   * @param assignedToUserId ID исполнителя
   * @param status Статус задач (опционально)
   * @param limit Лимит записей
   * @param offset Смещение
   * @returns Массив задач
   */
  async getByAssignee(assignedToUserId: string, status?: TaskStatus, limit?: number, offset?: number): Promise<Task[]> {
    const conditions = [eq(tasks.assignedToUserId, assignedToUserId)];
    if (status) {
      conditions.push(eq(tasks.status, status));
    }

    const baseQuery = this.db
      .select()
      .from(tasks)
      .where(and(...conditions))
      .orderBy(desc(tasks.priority), asc(tasks.dueDate));

    if (limit && offset) {
      return await baseQuery.limit(limit).offset(offset);
    } else if (limit) {
      return await baseQuery.limit(limit);
    } else if (offset) {
      return await baseQuery.offset(offset);
    }

    return await baseQuery;
  }

  /**
   * Получить задачи по создателю
   * @param createdByUserId ID создателя
   * @param status Статус задач (опционально)
   * @param limit Лимит записей
   * @returns Массив задач
   */
  async getByCreator(createdByUserId: string, status?: TaskStatus, limit?: number): Promise<Task[]> {
    const conditions = [eq(tasks.createdByUserId, createdByUserId)];
    if (status) {
      conditions.push(eq(tasks.status, status));
    }

    const baseQuery = this.db
      .select()
      .from(tasks)
      .where(and(...conditions))
      .orderBy(desc(tasks.createdAt));

    if (limit) {
      return await baseQuery.limit(limit);
    }

    return await baseQuery;
  }

  /**
   * Получить задачи по площадке
   * @param venueId ID площадки
   * @param status Статус задач (опционально)
   * @param limit Лимит записей
   * @returns Массив задач
   */
  async getByVenue(venueId: string, status?: TaskStatus, limit?: number): Promise<Task[]> {
    const conditions = [eq(tasks.venueId, venueId)];
    if (status) {
      conditions.push(eq(tasks.status, status));
    }

    const baseQuery = this.db
      .select()
      .from(tasks)
      .where(and(...conditions))
      .orderBy(desc(tasks.priority), asc(tasks.dueDate));

    if (limit) {
      return await baseQuery.limit(limit);
    }

    return await baseQuery;
  }

  /**
   * Получить задачи по статусу
   * @param status Статус задачи
   * @param assignedToUserId ID исполнителя (опционально)
   * @param limit Лимит записей
   * @returns Массив задач
   */
  async getByStatus(status: TaskStatus, assignedToUserId?: string, limit?: number): Promise<Task[]> {
    const conditions = [eq(tasks.status, status)];
    if (assignedToUserId) {
      conditions.push(eq(tasks.assignedToUserId, assignedToUserId));
    }

    const baseQuery = this.db
      .select()
      .from(tasks)
      .where(and(...conditions))
      .orderBy(desc(tasks.priority), asc(tasks.dueDate));

    if (limit) {
      return await baseQuery.limit(limit);
    }

    return await baseQuery;
  }

  /**
   * Получить задачи по приоритету
   * @param priority Приоритет задачи
   * @param status Статус задач (опционально)
   * @param limit Лимит записей
   * @returns Массив задач
   */
  async getByPriority(priority: TaskPriority, status?: TaskStatus, limit?: number): Promise<Task[]> {
    const conditions = [eq(tasks.priority, priority)];
    if (status) {
      conditions.push(eq(tasks.status, status));
    }

    const baseQuery = this.db
      .select()
      .from(tasks)
      .where(and(...conditions))
      .orderBy(asc(tasks.dueDate));

    if (limit) {
      return await baseQuery.limit(limit);
    }

    return await baseQuery;
  }

  /**
   * Получить задачи по диапазону дат выполнения
   * @param startDate Начальная дата
   * @param endDate Конечная дата
   * @param status Статус задач (опционально)
   * @returns Массив задач
   */
  async getByDueDateRange(startDate: Date, endDate: Date, status?: TaskStatus): Promise<Task[]> {
    const conditions = [
      gte(tasks.dueDate, startDate),
      lte(tasks.dueDate, endDate)
    ];
    if (status) {
      conditions.push(eq(tasks.status, status));
    }

    return await this.db
      .select()
      .from(tasks)
      .where(and(...conditions))
      .orderBy(asc(tasks.dueDate));
  }

  /**
   * Получить просроченные задачи
   * @param assignedToUserId ID исполнителя (опционально)
   * @param limit Лимит записей
   * @returns Массив просроченных задач
   */
  async getOverdueTasks(assignedToUserId?: string, limit?: number): Promise<Task[]> {
    const now = new Date();
    const conditions = [
      lte(tasks.dueDate, now),
      eq(tasks.status, TASK_STATUSES.OPEN)
    ];
    if (assignedToUserId) {
      conditions.push(eq(tasks.assignedToUserId, assignedToUserId));
    }

    const baseQuery = this.db
      .select()
      .from(tasks)
      .where(and(...conditions))
      .orderBy(desc(tasks.priority), asc(tasks.dueDate));

    if (limit) {
      return await baseQuery.limit(limit);
    }

    return await baseQuery;
  }

  /**
   * Получить неназначенные задачи
   * @param status Статус задач (опционально)
   * @param limit Лимит записей
   * @returns Массив неназначенных задач
   */
  async getUnassignedTasks(status?: TaskStatus, limit?: number): Promise<Task[]> {
    const conditions = [isNull(tasks.assignedToUserId)];
    if (status) {
      conditions.push(eq(tasks.status, status));
    }

    const baseQuery = this.db
      .select()
      .from(tasks)
      .where(and(...conditions))
      .orderBy(desc(tasks.priority), asc(tasks.dueDate));

    if (limit) {
      return await baseQuery.limit(limit);
    }

    return await baseQuery;
  }

  /**
   * Поиск задач по заголовку
   * @param searchTerm Поисковый термин
   * @param assignedToUserId ID исполнителя (опционально)
   * @param limit Лимит записей
   * @returns Массив задач
   */
  async searchByTitle(searchTerm: string, assignedToUserId?: string, limit?: number): Promise<Task[]> {
    const conditions = [like(tasks.title, `%${searchTerm}%`)];
    if (assignedToUserId) {
      conditions.push(eq(tasks.assignedToUserId, assignedToUserId));
    }

    const baseQuery = this.db
      .select()
      .from(tasks)
      .where(and(...conditions))
      .orderBy(desc(tasks.priority), asc(tasks.dueDate));

    if (limit) {
      return await baseQuery.limit(limit);
    }

    return await baseQuery;
  }

  /**
   * Получить задачи по связанной сущности
   * @param relatedEntityType Тип связанной сущности
   * @param relatedEntityId ID связанной сущности
   * @param status Статус задач (опционально)
   * @returns Массив задач
   */
  async getByRelatedEntity(relatedEntityType: RelatedEntityType, relatedEntityId: string, status?: TaskStatus): Promise<Task[]> {
    const conditions = [
      eq(tasks.relatedEntityType, relatedEntityType),
      eq(tasks.relatedEntityId, relatedEntityId)
    ];
    if (status) {
      conditions.push(eq(tasks.status, status));
    }

    return await this.db
      .select()
      .from(tasks)
      .where(and(...conditions))
      .orderBy(desc(tasks.priority), asc(tasks.dueDate));
  }

  /**
   * Получить все задачи
   * @param limit Лимит записей
   * @param offset Смещение
   * @returns Массив задач
   */
  async getAll(limit?: number, offset?: number): Promise<Task[]> {
    const baseQuery = this.db
      .select()
      .from(tasks)
      .orderBy(desc(tasks.priority), asc(tasks.dueDate));

    if (limit && offset) {
      return await baseQuery.limit(limit).offset(offset);
    } else if (limit) {
      return await baseQuery.limit(limit);
    } else if (offset) {
      return await baseQuery.offset(offset);
    }

    return await baseQuery;
  }

  /**
   * Получить количество задач
   * @param assignedToUserId ID исполнителя (опционально)
   * @param status Статус задач (опционально)
   * @returns Количество задач
   */
  async getCount(assignedToUserId?: string, status?: TaskStatus): Promise<number> {
    const conditions = [];
    if (assignedToUserId) {
      conditions.push(eq(tasks.assignedToUserId, assignedToUserId));
    }
    if (status) {
      conditions.push(eq(tasks.status, status));
    }

    const [result] = await this.db
      .select({ count: count() })
      .from(tasks)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    return result.count;
  }

  /**
   * Обновить задачу
   * @param id ID задачи
   * @param data Данные для обновления
   * @returns Обновленная задача или null
   */
  async update(id: string, data: UpdateTask): Promise<Task | null> {
    const [task] = await this.db
      .update(tasks)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(tasks.id, id))
      .returning();
    return task || null;
  }

  /**
   * Обновить статус задачи
   * @param id ID задачи
   * @param status Новый статус
   * @returns Обновленная задача или null
   */
  async updateStatus(id: string, status: TaskStatus): Promise<Task | null> {
    return await this.update(id, { status });
  }

  /**
   * Назначить задачу исполнителю
   * @param id ID задачи
   * @param assignedToUserId ID исполнителя
   * @returns Обновленная задача или null
   */
  async assignToUser(id: string, assignedToUserId: string): Promise<Task | null> {
    return await this.update(id, { assignedToUserId });
  }

  /**
   * Снять назначение с задачи
   * @param id ID задачи
   * @returns Обновленная задача или null
   */
  async unassign(id: string): Promise<Task | null> {
    return await this.update(id, { assignedToUserId: null });
  }

  /**
   * Обновить приоритет задачи
   * @param id ID задачи
   * @param priority Новый приоритет
   * @returns Обновленная задача или null
   */
  async updatePriority(id: string, priority: TaskPriority): Promise<Task | null> {
    return await this.update(id, { priority });
  }

  /**
   * Обновить срок выполнения задачи
   * @param id ID задачи
   * @param dueDate Новый срок выполнения
   * @returns Обновленная задача или null
   */
  async updateDueDate(id: string, dueDate: Date | null): Promise<Task | null> {
    return await this.update(id, { dueDate });
  }

  /**
   * Завершить задачу
   * @param id ID задачи
   * @returns Обновленная задача или null
   */
  async complete(id: string): Promise<Task | null> {
    return await this.updateStatus(id, TASK_STATUSES.COMPLETED);
  }

  /**
   * Заблокировать задачу
   * @param id ID задачи
   * @returns Обновленная задача или null
   */
  async block(id: string): Promise<Task | null> {
    return await this.updateStatus(id, TASK_STATUSES.BLOCKED);
  }

  /**
   * Начать работу над задачей
   * @param id ID задачи
   * @returns Обновленная задача или null
   */
  async startProgress(id: string): Promise<Task | null> {
    return await this.updateStatus(id, TASK_STATUSES.IN_PROGRESS);
  }

  /**
   * Удалить задачу
   * @param id ID задачи
   * @returns true, если задача удалена
   */
  async delete(id: string): Promise<boolean> {
    const [deletedTask] = await this.db
      .delete(tasks)
      .where(eq(tasks.id, id))
      .returning();
    return !!deletedTask;
  }

  /**
   * Получить статистику задач
   * @param assignedToUserId ID исполнителя (опционально)
   * @param venueId ID площадки (опционально)
   * @returns Статистика задач
   */
  async getStats(assignedToUserId?: string, venueId?: string): Promise<TaskStats> {
    const conditions = [];
    if (assignedToUserId) {
      conditions.push(eq(tasks.assignedToUserId, assignedToUserId));
    }
    if (venueId) {
      conditions.push(eq(tasks.venueId, venueId));
    }

    const [stats] = await this.db
      .select({
        totalTasks: count(),
        openTasks: sql<number>`count(*) filter (where ${tasks.status} = 'open')::int`,
        inProgressTasks: sql<number>`count(*) filter (where ${tasks.status} = 'in_progress')::int`,
        completedTasks: sql<number>`count(*) filter (where ${tasks.status} = 'completed')::int`,
        blockedTasks: sql<number>`count(*) filter (where ${tasks.status} = 'blocked')::int`,
        overdueTasks: sql<number>`count(*) filter (where ${tasks.dueDate} < now() and ${tasks.status} != 'completed')::int`,
        tasksWithoutAssignee: sql<number>`count(*) filter (where ${tasks.assignedToUserId} is null)::int`,
        lowPriorityTasks: sql<number>`count(*) filter (where ${tasks.priority} = 'low')::int`,
        mediumPriorityTasks: sql<number>`count(*) filter (where ${tasks.priority} = 'medium')::int`,
        highPriorityTasks: sql<number>`count(*) filter (where ${tasks.priority} = 'high')::int`,
        urgentPriorityTasks: sql<number>`count(*) filter (where ${tasks.priority} = 'urgent')::int`,
      })
      .from(tasks)
      .where(conditions.length > 0 ? and(...conditions) : undefined);

    // Получаем среднее время выполнения
    const [completionStats] = await this.db
      .select({
        averageCompletionTime: sql<number>`coalesce(avg(extract(epoch from (${tasks.updatedAt} - ${tasks.createdAt})) / 86400), 0)`,
      })
      .from(tasks)
      .where(
        and(
          eq(tasks.status, TASK_STATUSES.COMPLETED),
          ...(conditions.length > 0 ? conditions : [])
        )
      );

    return {
      ...stats,
      averageCompletionTime: Math.round(completionStats.averageCompletionTime * 100) / 100,
      tasksByPriority: {
        low: stats.lowPriorityTasks,
        medium: stats.mediumPriorityTasks,
        high: stats.highPriorityTasks,
        urgent: stats.urgentPriorityTasks,
      },
    };
  }

  /**
   * Получить задачи, сгруппированные по статусу
   * @param assignedToUserId ID исполнителя (опционально)
   * @param venueId ID площадки (опционально)
   * @returns Массив групп задач по статусу
   */
  async getGroupedByStatus(assignedToUserId?: string, venueId?: string): Promise<TaskGroupedByStatus[]> {
    const conditions = [];
    if (assignedToUserId) {
      conditions.push(eq(tasks.assignedToUserId, assignedToUserId));
    }
    if (venueId) {
      conditions.push(eq(tasks.venueId, venueId));
    }

    return await this.db
      .select({
        status: tasks.status,
        tasksCount: sql<number>`count(*)::int`,
        averageAge: sql<number>`coalesce(avg(extract(epoch from (now() - ${tasks.createdAt})) / 86400), 0)`,
      })
      .from(tasks)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .groupBy(tasks.status)
      .orderBy(desc(sql`count(*)`));
  }

  /**
   * Получить недавние задачи
   * @param days Количество дней назад
   * @param assignedToUserId ID исполнителя (опционально)
   * @returns Массив недавних задач
   */
  async getRecentTasks(days: number, assignedToUserId?: string): Promise<Task[]> {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    const conditions = [gte(tasks.createdAt, dateThreshold)];
    if (assignedToUserId) {
      conditions.push(eq(tasks.assignedToUserId, assignedToUserId));
    }

    return await this.db
      .select()
      .from(tasks)
      .where(and(...conditions))
      .orderBy(desc(tasks.createdAt));
  }
}
