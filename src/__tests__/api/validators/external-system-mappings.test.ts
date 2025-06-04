import { describe, it, expect } from "vitest";
import {
  externalSystemSchema,
  externalEntityMappingTypeSchema,
  createExternalSystemMappingSchema,
  updateExternalSystemMappingSchema,
  updateSyncStatusSchema,
  bulkUpdateSyncStatusSchema,
  findByExternalIdQuerySchema,
  findByInternalEntityQuerySchema,
  findBySystemQuerySchema,
  findOutdatedQuerySchema,
  cleanupOldInactiveQuerySchema,
  paginationQuerySchema,
  mappingIdParamSchema,
} from "../../../api/validators/external-system-mappings";

describe("ExternalSystemMapping Validators", () => {
  describe("externalSystemSchema", () => {
    it("should validate valid external systems", () => {
      const validSystems = [
        "exporta",
        "google_calendar",
        "whatsapp_api",
        "telegram_api",
        "payment_gateway_api",
        "other",
      ];

      validSystems.forEach((system) => {
        const result = externalSystemSchema.safeParse(system);
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid external systems", () => {
      const invalidSystems = ["invalid", "facebook", "", null, undefined];

      invalidSystems.forEach((system) => {
        const result = externalSystemSchema.safeParse(system);
        expect(result.success).toBe(false);
      });
    });
  });

  describe("externalEntityMappingTypeSchema", () => {
    it("should validate valid entity types", () => {
      const validTypes = [
        "user",
        "booking",
        "court",
        "class",
        "venue",
        "class_schedule",
        "product",
        "training_package_definition",
      ];

      validTypes.forEach((type) => {
        const result = externalEntityMappingTypeSchema.safeParse(type);
        expect(result.success).toBe(true);
      });
    });

    it("should reject invalid entity types", () => {
      const invalidTypes = ["invalid", "payment", "", null, undefined];

      invalidTypes.forEach((type) => {
        const result = externalEntityMappingTypeSchema.safeParse(type);
        expect(result.success).toBe(false);
      });
    });
  });

  describe("createExternalSystemMappingSchema", () => {
    const validMapping = {
      externalSystem: "exporta",
      externalId: "ext_123",
      internalEntityType: "user",
      internalEntityId: "123e4567-e89b-12d3-a456-426614174000",
    };

    it("should validate valid mapping creation data", () => {
      const result = createExternalSystemMappingSchema.safeParse(validMapping);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.isActive).toBe(true); // default value
        expect(result.data.hasConflict).toBe(false); // default value
      }
    });

    it("should validate with optional fields", () => {
      const mappingWithOptionals = {
        ...validMapping,
        isActive: false,
        syncData: '{"test": "data"}',
        hasConflict: true,
        conflictData: '{"conflict": "info"}',
        lastError: "Sync failed",
      };

      const result =
        createExternalSystemMappingSchema.safeParse(mappingWithOptionals);
      expect(result.success).toBe(true);
    });

    it("should reject invalid data", () => {
      const invalidMappings = [
        { ...validMapping, externalSystem: "invalid" },
        { ...validMapping, externalId: "" },
        { ...validMapping, externalId: "a".repeat(256) }, // too long
        { ...validMapping, internalEntityType: "invalid" },
        { ...validMapping, internalEntityId: "invalid-uuid" },
        { ...validMapping, isActive: "not-boolean" },
        { ...validMapping, hasConflict: "not-boolean" },
      ];

      invalidMappings.forEach((mapping) => {
        const result = createExternalSystemMappingSchema.safeParse(mapping);
        expect(result.success).toBe(false);
      });
    });

    it("should require mandatory fields", () => {
      const requiredFields = [
        "externalSystem",
        "externalId",
        "internalEntityType",
        "internalEntityId",
      ];

      requiredFields.forEach((field) => {
        const incompleteMapping = { ...validMapping };
        delete incompleteMapping[field as keyof typeof validMapping];

        const result =
          createExternalSystemMappingSchema.safeParse(incompleteMapping);
        expect(result.success).toBe(false);
      });
    });
  });

  describe("updateExternalSystemMappingSchema", () => {
    it("should validate partial updates", () => {
      const updates = [
        { isActive: false },
        { syncData: '{"updated": true}' },
        { hasConflict: true },
        { conflictData: '{"new": "conflict"}' },
        { lastError: "New error" },
        { externalId: "new_ext_123" },
      ];

      updates.forEach((update) => {
        const result = updateExternalSystemMappingSchema.safeParse(update);
        expect(result.success).toBe(true);
      });
    });

    it("should allow empty updates", () => {
      const result = updateExternalSystemMappingSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it("should reject invalid updates", () => {
      const invalidUpdates = [
        { externalId: "" },
        { externalId: "a".repeat(256) },
        { isActive: "not-boolean" },
        { hasConflict: "not-boolean" },
      ];

      invalidUpdates.forEach((update) => {
        const result = updateExternalSystemMappingSchema.safeParse(update);
        expect(result.success).toBe(false);
      });
    });
  });

  describe("updateSyncStatusSchema", () => {
    it("should validate sync status updates", () => {
      const validUpdates = [
        { syncData: '{"synced": true}' },
        { hasConflict: false },
        { conflictData: '{"resolved": true}' },
        { lastError: "Error message" },
        {
          syncData: '{"timestamp": "2024-01-01"}',
          hasConflict: true,
          conflictData: '{"type": "data_mismatch"}',
          lastError: "Data conflict detected",
        },
      ];

      validUpdates.forEach((update) => {
        const result = updateSyncStatusSchema.safeParse(update);
        expect(result.success).toBe(true);
      });
    });

    it("should allow empty sync status updates", () => {
      const result = updateSyncStatusSchema.safeParse({});
      expect(result.success).toBe(true);
    });

    it("should reject invalid sync status updates", () => {
      const invalidUpdates = [
        { hasConflict: "not-boolean" },
        { syncData: 123 }, // not string
        { conflictData: [] }, // not string
      ];

      invalidUpdates.forEach((update) => {
        const result = updateSyncStatusSchema.safeParse(update);
        expect(result.success).toBe(false);
      });
    });
  });

  describe("bulkUpdateSyncStatusSchema", () => {
    const validBulkUpdate = {
      ids: [
        "123e4567-e89b-12d3-a456-426614174000",
        "456e7890-e89b-12d3-a456-426614174001",
      ],
    };

    it("should validate bulk sync status updates", () => {
      const result = bulkUpdateSyncStatusSchema.safeParse(validBulkUpdate);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.hasConflict).toBe(false); // default value
      }
    });

    it("should validate with optional fields", () => {
      const bulkUpdateWithOptionals = {
        ...validBulkUpdate,
        syncData: '{"bulk": true}',
        hasConflict: true,
      };

      const result = bulkUpdateSyncStatusSchema.safeParse(
        bulkUpdateWithOptionals
      );
      expect(result.success).toBe(true);
    });

    it("should require at least one ID", () => {
      const emptyIds = { ids: [] };
      const result = bulkUpdateSyncStatusSchema.safeParse(emptyIds);
      expect(result.success).toBe(false);
    });

    it("should reject invalid IDs", () => {
      const invalidBulkUpdates = [
        { ids: ["invalid-uuid"] },
        { ids: ["123e4567-e89b-12d3-a456-426614174000", "invalid"] },
        { ids: [123] }, // not strings
        { hasConflict: "not-boolean" },
      ];

      invalidBulkUpdates.forEach((update) => {
        const result = bulkUpdateSyncStatusSchema.safeParse(update);
        expect(result.success).toBe(false);
      });
    });
  });

  describe("Query schemas", () => {
    describe("findByExternalIdQuerySchema", () => {
      it("should validate external ID queries", () => {
        const validQuery = {
          externalSystem: "exporta",
          externalId: "ext_123",
        };

        const result = findByExternalIdQuerySchema.safeParse(validQuery);
        expect(result.success).toBe(true);
      });

      it("should reject invalid external ID queries", () => {
        const invalidQueries = [
          { externalSystem: "invalid", externalId: "ext_123" },
          { externalSystem: "exporta", externalId: "" },
          { externalSystem: "exporta" }, // missing externalId
          { externalId: "ext_123" }, // missing externalSystem
        ];

        invalidQueries.forEach((query) => {
          const result = findByExternalIdQuerySchema.safeParse(query);
          expect(result.success).toBe(false);
        });
      });
    });

    describe("findByInternalEntityQuerySchema", () => {
      it("should validate internal entity queries", () => {
        const validQuery = {
          entityType: "user",
          entityId: "123e4567-e89b-12d3-a456-426614174000",
        };

        const result = findByInternalEntityQuerySchema.safeParse(validQuery);
        expect(result.success).toBe(true);
      });

      it("should reject invalid internal entity queries", () => {
        const invalidQueries = [
          {
            entityType: "invalid",
            entityId: "123e4567-e89b-12d3-a456-426614174000",
          },
          { entityType: "user", entityId: "invalid-uuid" },
          { entityType: "user" }, // missing entityId
          { entityId: "123e4567-e89b-12d3-a456-426614174000" }, // missing entityType
        ];

        invalidQueries.forEach((query) => {
          const result = findByInternalEntityQuerySchema.safeParse(query);
          expect(result.success).toBe(false);
        });
      });
    });

    describe("findBySystemQuerySchema", () => {
      it("should validate system queries", () => {
        const validQuery = { externalSystem: "exporta" };
        const result = findBySystemQuerySchema.safeParse(validQuery);
        expect(result.success).toBe(true);
      });

      it("should reject invalid system queries", () => {
        const invalidQueries = [
          { externalSystem: "invalid" },
          {}, // missing externalSystem
        ];

        invalidQueries.forEach((query) => {
          const result = findBySystemQuerySchema.safeParse(query);
          expect(result.success).toBe(false);
        });
      });
    });

    describe("findOutdatedQuerySchema", () => {
      it("should validate outdated queries", () => {
        const validQueries = [
          { daysOld: 7 },
          { daysOld: "30" }, // string that can be coerced
          {}, // should use default
        ];

        validQueries.forEach((query) => {
          const result = findOutdatedQuerySchema.safeParse(query);
          expect(result.success).toBe(true);
          if (result.success && Object.keys(query).length === 0) {
            expect(result.data.daysOld).toBe(7); // default value
          }
        });
      });

      it("should reject invalid outdated queries", () => {
        const invalidQueries = [
          { daysOld: 0 }, // too small
          { daysOld: 366 }, // too large
          { daysOld: -1 }, // negative
          { daysOld: "invalid" }, // non-numeric string
        ];

        invalidQueries.forEach((query) => {
          const result = findOutdatedQuerySchema.safeParse(query);
          expect(result.success).toBe(false);
        });
      });
    });

    describe("cleanupOldInactiveQuerySchema", () => {
      it("should validate cleanup queries", () => {
        const validQueries = [
          { daysOld: 30 },
          { daysOld: "60" }, // string that can be coerced
          {}, // should use default
        ];

        validQueries.forEach((query) => {
          const result = cleanupOldInactiveQuerySchema.safeParse(query);
          expect(result.success).toBe(true);
          if (result.success && Object.keys(query).length === 0) {
            expect(result.data.daysOld).toBe(30); // default value
          }
        });
      });

      it("should reject invalid cleanup queries", () => {
        const invalidQueries = [
          { daysOld: 0 }, // too small
          { daysOld: 366 }, // too large
          { daysOld: -1 }, // negative
          { daysOld: "invalid" }, // non-numeric string
        ];

        invalidQueries.forEach((query) => {
          const result = cleanupOldInactiveQuerySchema.safeParse(query);
          expect(result.success).toBe(false);
        });
      });
    });

    describe("paginationQuerySchema", () => {
      it("should validate pagination queries", () => {
        const validQueries = [
          { limit: 10, offset: 0 },
          { limit: "50", offset: "20" }, // strings that can be coerced
          {}, // should use defaults
          { limit: 100 }, // only limit
          { offset: 50 }, // only offset
        ];

        validQueries.forEach((query) => {
          const result = paginationQuerySchema.safeParse(query);
          expect(result.success).toBe(true);
          if (result.success && Object.keys(query).length === 0) {
            expect(result.data.limit).toBe(50); // default value
            expect(result.data.offset).toBe(0); // default value
          }
        });
      });

      it("should reject invalid pagination queries", () => {
        const invalidQueries = [
          { limit: 0 }, // too small
          { limit: 101 }, // too large
          { offset: -1 }, // negative
          { limit: "invalid" }, // non-numeric string
          { offset: "invalid" }, // non-numeric string
        ];

        invalidQueries.forEach((query) => {
          const result = paginationQuerySchema.safeParse(query);
          expect(result.success).toBe(false);
        });
      });
    });

    describe("mappingIdParamSchema", () => {
      it("should validate mapping ID params", () => {
        const validParam = { id: "123e4567-e89b-12d3-a456-426614174000" };
        const result = mappingIdParamSchema.safeParse(validParam);
        expect(result.success).toBe(true);
      });

      it("should reject invalid mapping ID params", () => {
        const invalidParams = [
          { id: "invalid-uuid" },
          { id: "" },
          { id: 123 }, // not string
          {}, // missing id
        ];

        invalidParams.forEach((param) => {
          const result = mappingIdParamSchema.safeParse(param);
          expect(result.success).toBe(false);
        });
      });
    });
  });
});
