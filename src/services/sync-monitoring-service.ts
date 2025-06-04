import { db } from "../db/connection";
import { ExternalSystemMappingRepository } from "../repositories/external-system-mapping-repository";
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

// Типы для мониторинга
export interface SystemHealthStatus {
  system: ExternalSystem;
  isHealthy: boolean;
  lastCheck: Date;
  responseTime?: number;
  error?: string;
}

export interface SyncMonitoringStats {
  totalMappings: number;
  activeMappings: number;
  inactiveMappings: number;
  conflictMappings: number;
  errorMappings: number;
  systemBreakdown: Record<
    ExternalSystem,
    {
      total: number;
      active: number;
      conflicts: number;
      errors: number;
    }
  >;
  entityBreakdown: Record<
    ExternalEntityMappingType,
    {
      total: number;
      active: number;
      conflicts: number;
      errors: number;
    }
  >;
  recentActivity: {
    last24h: number;
    last7d: number;
    last30d: number;
  };
}

export interface SyncAlert {
  id: string;
  type: "error" | "warning" | "info";
  system: ExternalSystem;
  entityType?: ExternalEntityMappingType;
  message: string;
  timestamp: Date;
  resolved: boolean;
  metadata?: Record<string, any>;
}

export interface MonitoringConfig {
  healthCheckInterval: number; // в миллисекундах
  alertThresholds: {
    errorRate: number; // процент ошибок для алерта
    conflictRate: number; // процент конфликтов для алерта
    responseTime: number; // максимальное время ответа в мс
  };
  retentionPeriod: number; // дни хранения алертов
}

/**
 * Сервис мониторинга синхронизации с внешними системами
 */
export class SyncMonitoringService {
  private mappingRepo: ExternalSystemMappingRepository;
  private healthStatuses: Map<ExternalSystem, SystemHealthStatus> = new Map();
  private alerts: SyncAlert[] = [];
  private config: MonitoringConfig;
  private healthCheckTimer?: NodeJS.Timeout;

  constructor(config?: Partial<MonitoringConfig>) {
    if (!db) {
      throw new Error("Database connection not available");
    }
    this.mappingRepo = new ExternalSystemMappingRepository(db);
    this.config = {
      healthCheckInterval: 5 * 60 * 1000, // 5 минут
      alertThresholds: {
        errorRate: 10, // 10% ошибок
        conflictRate: 5, // 5% конфликтов
        responseTime: 5000, // 5 секунд
      },
      retentionPeriod: 30, // 30 дней
      ...config,
    };
  }

  /**
   * Запуск мониторинга
   */
  start(): void {
    logger.info("Starting sync monitoring service", {
      config: this.config,
    });

    // Запускаем периодическую проверку здоровья
    this.healthCheckTimer = setInterval(
      () => this.performHealthChecks(),
      this.config.healthCheckInterval
    );

    // Выполняем первую проверку сразу
    this.performHealthChecks();
  }

  /**
   * Остановка мониторинга
   */
  stop(): void {
    logger.info("Stopping sync monitoring service");

    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = undefined;
    }
  }

  /**
   * Получение статистики мониторинга
   */
  async getMonitoringStats(): Promise<SyncMonitoringStats> {
    try {
      const stats = await this.mappingRepo.getMappingStats();

      // Получаем детальную статистику
      const allMappings = await this.mappingRepo.findMany(1000, 0);

      // Группируем по системам
      const systemBreakdown: Record<string, any> = {};
      const entityBreakdown: Record<string, any> = {};

      for (const mapping of allMappings) {
        // Статистика по системам
        if (!systemBreakdown[mapping.externalSystem]) {
          systemBreakdown[mapping.externalSystem] = {
            total: 0,
            active: 0,
            conflicts: 0,
            errors: 0,
          };
        }

        systemBreakdown[mapping.externalSystem].total++;
        if (mapping.isActive) systemBreakdown[mapping.externalSystem].active++;
        if (mapping.hasConflict)
          systemBreakdown[mapping.externalSystem].conflicts++;
        if (mapping.lastError) systemBreakdown[mapping.externalSystem].errors++;

        // Статистика по типам сущностей
        if (!entityBreakdown[mapping.internalEntityType]) {
          entityBreakdown[mapping.internalEntityType] = {
            total: 0,
            active: 0,
            conflicts: 0,
            errors: 0,
          };
        }

        entityBreakdown[mapping.internalEntityType].total++;
        if (mapping.isActive)
          entityBreakdown[mapping.internalEntityType].active++;
        if (mapping.hasConflict)
          entityBreakdown[mapping.internalEntityType].conflicts++;
        if (mapping.lastError)
          entityBreakdown[mapping.internalEntityType].errors++;
      }

      // Подсчитываем активность за периоды
      const now = new Date();
      const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const recentActivity = {
        last24h: allMappings.filter((m) => m.updatedAt >= last24h).length,
        last7d: allMappings.filter((m) => m.updatedAt >= last7d).length,
        last30d: allMappings.filter((m) => m.updatedAt >= last30d).length,
      };

      return {
        totalMappings: stats.total,
        activeMappings: stats.active,
        inactiveMappings: stats.total - stats.active,
        conflictMappings: stats.withConflicts,
        errorMappings: stats.withErrors,
        systemBreakdown: systemBreakdown as Record<ExternalSystem, any>,
        entityBreakdown: entityBreakdown as Record<
          ExternalEntityMappingType,
          any
        >,
        recentActivity,
      };
    } catch (error) {
      logger.error("Failed to get monitoring stats", { error });
      throw error;
    }
  }

  /**
   * Получение статуса здоровья систем
   */
  getHealthStatuses(): SystemHealthStatus[] {
    return Array.from(this.healthStatuses.values());
  }

  /**
   * Получение алертов
   */
  getAlerts(resolved?: boolean): SyncAlert[] {
    if (resolved !== undefined) {
      return this.alerts.filter((alert) => alert.resolved === resolved);
    }
    return [...this.alerts];
  }

  /**
   * Создание алерта
   */
  createAlert(
    type: SyncAlert["type"],
    system: ExternalSystem,
    message: string,
    entityType?: ExternalEntityMappingType,
    metadata?: Record<string, any>
  ): SyncAlert {
    const alert: SyncAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      system,
      entityType,
      message,
      timestamp: new Date(),
      resolved: false,
      metadata,
    };

    this.alerts.push(alert);

    logger.warn("Sync alert created", {
      alertId: alert.id,
      type,
      system,
      entityType,
      message,
    });

    // Очищаем старые алерты
    this.cleanupOldAlerts();

    return alert;
  }

  /**
   * Разрешение алерта
   */
  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert) {
      alert.resolved = true;
      logger.info("Sync alert resolved", { alertId });
      return true;
    }
    return false;
  }

  /**
   * Анализ проблем синхронизации
   */
  async analyzeIssues(): Promise<{
    criticalIssues: string[];
    warnings: string[];
    recommendations: string[];
  }> {
    const stats = await this.getMonitoringStats();
    const healthStatuses = this.getHealthStatuses();

    const criticalIssues: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];

    // Анализ здоровья систем
    const unhealthySystems = healthStatuses.filter(
      (status) => !status.isHealthy
    );
    if (unhealthySystems.length > 0) {
      criticalIssues.push(
        `Недоступные системы: ${unhealthySystems
          .map((s) => s.system)
          .join(", ")}`
      );
    }

    // Анализ ошибок
    const errorRate =
      stats.totalMappings > 0
        ? (stats.errorMappings / stats.totalMappings) * 100
        : 0;
    if (errorRate > this.config.alertThresholds.errorRate) {
      criticalIssues.push(
        `Высокий уровень ошибок: ${errorRate.toFixed(1)}% (порог: ${
          this.config.alertThresholds.errorRate
        }%)`
      );
    }

    // Анализ конфликтов
    const conflictRate =
      stats.totalMappings > 0
        ? (stats.conflictMappings / stats.totalMappings) * 100
        : 0;
    if (conflictRate > this.config.alertThresholds.conflictRate) {
      warnings.push(
        `Высокий уровень конфликтов: ${conflictRate.toFixed(1)}% (порог: ${
          this.config.alertThresholds.conflictRate
        }%)`
      );
    }

    // Анализ активности
    if (stats.recentActivity.last24h === 0) {
      warnings.push("Нет активности синхронизации за последние 24 часа");
    }

    // Рекомендации
    if (stats.inactiveMappings > stats.activeMappings) {
      recommendations.push("Рассмотрите очистку неактивных маппингов");
    }

    if (stats.conflictMappings > 0) {
      recommendations.push("Проверьте и разрешите конфликты синхронизации");
    }

    return {
      criticalIssues,
      warnings,
      recommendations,
    };
  }

  /**
   * Получение отчета о производительности
   */
  async getPerformanceReport(): Promise<{
    avgResponseTime: number;
    systemPerformance: Record<
      ExternalSystem,
      {
        avgResponseTime: number;
        successRate: number;
        lastCheck: Date;
      }
    >;
    trends: {
      syncVolume: { period: string; count: number }[];
      errorRate: { period: string; rate: number }[];
    };
  }> {
    const healthStatuses = this.getHealthStatuses();

    // Средняя производительность
    const avgResponseTime =
      healthStatuses.reduce(
        (sum, status) => sum + (status.responseTime || 0),
        0
      ) / healthStatuses.length;

    // Производительность по системам
    const systemPerformance: Record<string, any> = {};
    for (const status of healthStatuses) {
      systemPerformance[status.system] = {
        avgResponseTime: status.responseTime || 0,
        successRate: status.isHealthy ? 100 : 0,
        lastCheck: status.lastCheck,
      };
    }

    // Тренды (упрощенная версия - в реальности нужна база данных для хранения истории)
    const stats = await this.getMonitoringStats();
    const trends = {
      syncVolume: [
        { period: "24h", count: stats.recentActivity.last24h },
        { period: "7d", count: stats.recentActivity.last7d },
        { period: "30d", count: stats.recentActivity.last30d },
      ],
      errorRate: [
        {
          period: "current",
          rate: (stats.errorMappings / stats.totalMappings) * 100,
        },
      ],
    };

    return {
      avgResponseTime,
      systemPerformance: systemPerformance as Record<ExternalSystem, any>,
      trends,
    };
  }

  // Приватные методы

  private async performHealthChecks(): Promise<void> {
    logger.debug("Performing health checks for external systems");

    // В реальной реализации здесь бы были проверки каждой системы
    // Пока создаем заглушки для демонстрации
    const systems: ExternalSystem[] = [
      "exporta",
      "google_calendar",
      "whatsapp_api",
      "telegram_api",
      "payment_gateway_api",
      "other",
    ];

    for (const system of systems) {
      try {
        const startTime = Date.now();

        // Здесь бы был реальный health check
        const isHealthy = await this.checkSystemHealth(system);

        const responseTime = Date.now() - startTime;

        const status: SystemHealthStatus = {
          system,
          isHealthy,
          lastCheck: new Date(),
          responseTime,
        };

        this.healthStatuses.set(system, status);

        // Создаем алерт если система недоступна
        if (!isHealthy) {
          this.createAlert(
            "error",
            system,
            `System ${system} is not responding`,
            undefined,
            { responseTime }
          );
        }

        // Создаем алерт если время ответа слишком большое
        if (responseTime > this.config.alertThresholds.responseTime) {
          this.createAlert(
            "warning",
            system,
            `System ${system} response time is high: ${responseTime}ms`,
            undefined,
            { responseTime }
          );
        }
      } catch (error) {
        logger.error("Health check failed", { system, error });

        this.healthStatuses.set(system, {
          system,
          isHealthy: false,
          lastCheck: new Date(),
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }
  }

  private async checkSystemHealth(system: ExternalSystem): Promise<boolean> {
    // Заглушка для проверки здоровья системы
    // В реальной реализации здесь бы был HTTP запрос или другая проверка

    // Симулируем разные состояния для демонстрации
    switch (system) {
      case "exporta":
        return Math.random() > 0.1; // 90% uptime
      case "google_calendar":
        return Math.random() > 0.05; // 95% uptime
      case "whatsapp_api":
        return Math.random() > 0.2; // 80% uptime
      case "telegram_api":
        return Math.random() > 0.15; // 85% uptime
      case "payment_gateway_api":
        return Math.random() > 0.02; // 98% uptime
      default:
        return true;
    }
  }

  private cleanupOldAlerts(): void {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - this.config.retentionPeriod);

    const initialCount = this.alerts.length;
    this.alerts = this.alerts.filter((alert) => alert.timestamp >= cutoffDate);

    const removedCount = initialCount - this.alerts.length;
    if (removedCount > 0) {
      logger.info("Cleaned up old alerts", { removedCount });
    }
  }
}

// Экспорт singleton instance
export const syncMonitoringService = new SyncMonitoringService();
