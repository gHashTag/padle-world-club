import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { SyncMonitoringService } from "../../../services/sync-monitoring-service";

// Создаем мок-репозиторий
class MockExternalSystemMappingRepository {
  async getMappingStats() {
    return {
      total: 100,
      active: 80,
      withConflicts: 5,
      withErrors: 3,
    };
  }

  async findMany() {
    return [
      {
        id: "1",
        externalSystem: "exporta",
        internalEntityType: "user",
        isActive: true,
        hasConflict: false,
        lastError: null,
        updatedAt: new Date(),
      },
      {
        id: "2",
        externalSystem: "google_calendar",
        internalEntityType: "booking",
        isActive: false,
        hasConflict: true,
        lastError: "Sync error",
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 дня назад
      },
    ];
  }
}

describe("SyncMonitoringService Unit Tests", () => {
  let monitoringService: SyncMonitoringService;

  beforeEach(() => {
    monitoringService = new SyncMonitoringService({
      healthCheckInterval: 1000, // 1 секунда для тестов
      alertThresholds: {
        errorRate: 5,
        conflictRate: 3,
        responseTime: 1000,
      },
      retentionPeriod: 7,
    });

    // Заменяем репозиторий на мок
    (monitoringService as any).mappingRepo =
      new MockExternalSystemMappingRepository();
  });

  afterEach(() => {
    monitoringService.stop();
  });

  describe("Service Lifecycle", () => {
    it("should start monitoring service", () => {
      expect(() => monitoringService.start()).not.toThrow();
    });

    it("should stop monitoring service", () => {
      monitoringService.start();
      expect(() => monitoringService.stop()).not.toThrow();
    });
  });

  describe("Monitoring Statistics", () => {
    it("should get monitoring statistics", async () => {
      const stats = await monitoringService.getMonitoringStats();

      expect(stats).toBeDefined();
      expect(stats.totalMappings).toBe(100);
      expect(stats.activeMappings).toBe(80);
      expect(stats.inactiveMappings).toBe(20);
      expect(stats.conflictMappings).toBe(5);
      expect(stats.errorMappings).toBe(3);
      expect(stats.systemBreakdown).toBeDefined();
      expect(stats.entityBreakdown).toBeDefined();
      expect(stats.recentActivity).toBeDefined();
    });

    it("should calculate system breakdown correctly", async () => {
      const stats = await monitoringService.getMonitoringStats();

      expect(stats.systemBreakdown.exporta).toBeDefined();
      expect(stats.systemBreakdown.exporta.total).toBe(1);
      expect(stats.systemBreakdown.exporta.active).toBe(1);
      expect(stats.systemBreakdown.exporta.conflicts).toBe(0);
      expect(stats.systemBreakdown.exporta.errors).toBe(0);

      expect(stats.systemBreakdown.google_calendar).toBeDefined();
      expect(stats.systemBreakdown.google_calendar.total).toBe(1);
      expect(stats.systemBreakdown.google_calendar.active).toBe(0);
      expect(stats.systemBreakdown.google_calendar.conflicts).toBe(1);
      expect(stats.systemBreakdown.google_calendar.errors).toBe(1);
    });
  });

  describe("Health Status Management", () => {
    it("should return empty health statuses initially", () => {
      const healthStatuses = monitoringService.getHealthStatuses();
      expect(healthStatuses).toEqual([]);
    });
  });

  describe("Alert Management", () => {
    it("should create alerts", () => {
      const alert = monitoringService.createAlert(
        "error",
        "exporta",
        "Test error message",
        "user",
        { testData: true }
      );

      expect(alert).toBeDefined();
      expect(alert.id).toBeDefined();
      expect(alert.type).toBe("error");
      expect(alert.system).toBe("exporta");
      expect(alert.message).toBe("Test error message");
      expect(alert.entityType).toBe("user");
      expect(alert.resolved).toBe(false);
      expect(alert.metadata).toEqual({ testData: true });
    });

    it("should get all alerts", () => {
      monitoringService.createAlert("error", "exporta", "Error 1");
      monitoringService.createAlert("warning", "google_calendar", "Warning 1");

      const alerts = monitoringService.getAlerts();
      expect(alerts).toHaveLength(2);
    });

    it("should filter alerts by resolved status", () => {
      const alert1 = monitoringService.createAlert(
        "error",
        "exporta",
        "Error 1"
      );
      monitoringService.createAlert("warning", "google_calendar", "Warning 1");

      // Разрешаем один алерт
      monitoringService.resolveAlert(alert1.id);

      const unresolvedAlerts = monitoringService.getAlerts(false);
      const resolvedAlerts = monitoringService.getAlerts(true);

      expect(unresolvedAlerts).toHaveLength(1);
      expect(resolvedAlerts).toHaveLength(1);
      expect(resolvedAlerts[0].resolved).toBe(true);
    });

    it("should resolve alerts", () => {
      const alert = monitoringService.createAlert(
        "error",
        "exporta",
        "Test error"
      );

      const resolved = monitoringService.resolveAlert(alert.id);
      expect(resolved).toBe(true);

      const alerts = monitoringService.getAlerts();
      const resolvedAlert = alerts.find((a) => a.id === alert.id);
      expect(resolvedAlert?.resolved).toBe(true);
    });

    it("should return false when resolving non-existent alert", () => {
      const resolved = monitoringService.resolveAlert("non-existent-id");
      expect(resolved).toBe(false);
    });
  });

  describe("Issues Analysis", () => {
    it("should analyze issues and provide recommendations", async () => {
      // Создаем алерты для анализа
      monitoringService.createAlert("error", "exporta", "System down");
      monitoringService.createAlert(
        "warning",
        "google_calendar",
        "High latency"
      );

      const analysis = await monitoringService.analyzeIssues();

      expect(analysis).toBeDefined();
      expect(analysis.criticalIssues).toBeInstanceOf(Array);
      expect(analysis.warnings).toBeInstanceOf(Array);
      expect(analysis.recommendations).toBeInstanceOf(Array);
    });
  });

  describe("Performance Report", () => {
    it("should generate performance report", async () => {
      const report = await monitoringService.getPerformanceReport();

      expect(report).toBeDefined();
      expect(report.avgResponseTime).toBeDefined();
      expect(report.systemPerformance).toBeDefined();
      expect(report.trends).toBeDefined();
      expect(report.trends.syncVolume).toBeInstanceOf(Array);
      expect(report.trends.errorRate).toBeInstanceOf(Array);
    });
  });

  describe("Configuration", () => {
    it("should use default configuration", () => {
      const defaultService = new SyncMonitoringService();
      expect(defaultService).toBeDefined();
    });

    it("should merge custom configuration with defaults", () => {
      const customService = new SyncMonitoringService({
        healthCheckInterval: 2000,
        alertThresholds: {
          errorRate: 15,
          conflictRate: 8,
          responseTime: 3000,
        },
      });

      expect(customService).toBeDefined();
      // Проверяем, что конфигурация применилась
      expect((customService as any).config.healthCheckInterval).toBe(2000);
      expect((customService as any).config.alertThresholds.errorRate).toBe(15);
    });
  });
});
