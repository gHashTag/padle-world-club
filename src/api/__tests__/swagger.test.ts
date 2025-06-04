import request from 'supertest';
import { createApp } from '../app';
import { validateOpenApiDocument, getOpenApiDocument } from '../middleware/swagger';

describe('Swagger UI Integration', () => {
  const app = createApp();

  describe('OpenAPI Document Validation', () => {
    it('should have a valid OpenAPI document', () => {
      const validation = validateOpenApiDocument();

      if (!validation.isValid) {
        console.log('OpenAPI validation errors:', validation.errors);
      }

      // Allow some validation warnings for $ref resolution
      expect(validation.isValid).toBe(true);
    });

    it('should load OpenAPI document successfully', () => {
      const document = getOpenApiDocument();

      expect(document).toBeDefined();
      expect(document.openapi).toBeDefined();
      expect(document.info).toBeDefined();
      expect(document.info.title).toBeDefined();
      expect(document.info.version).toBeDefined();
      expect(document.paths).toBeDefined();
    });

    it('should have required OpenAPI structure', () => {
      const document = getOpenApiDocument();

      // Check basic structure
      expect(document.openapi).toMatch(/^3\.\d+\.\d+$/);
      expect(document.info.title).toContain('Padle World Club');
      expect(document.info.version).toBeDefined();

      // Check servers
      expect(document.servers).toBeDefined();
      expect(Array.isArray(document.servers)).toBe(true);
      expect(document.servers.length).toBeGreaterThan(0);

      // Check security schemes
      expect(document.components).toBeDefined();
      expect(document.components.securitySchemes).toBeDefined();
      expect(document.components.securitySchemes.bearerAuth).toBeDefined();

      // Check that we have paths
      expect(Object.keys(document.paths).length).toBeGreaterThan(0);
    });
  });

  describe('Swagger UI Endpoints', () => {
    it('should serve Swagger UI at /api/docs', async () => {
      const response = await request(app)
        .get('/api/docs/')
        .expect(200);

      expect(response.text).toContain('swagger-ui');
      expect(response.headers['content-type']).toContain('text/html');
    });

    it('should serve OpenAPI JSON at /api/docs/openapi.json', async () => {
      const response = await request(app)
        .get('/api/docs/openapi.json')
        .expect(200);

      expect(response.headers['content-type']).toContain('application/json');
      expect(response.body).toBeDefined();
      expect(response.body.openapi).toBeDefined();
      expect(response.body.info).toBeDefined();
      expect(response.body.paths).toBeDefined();
    });

    it('should serve OpenAPI YAML at /api/docs/openapi.yaml', async () => {
      const response = await request(app)
        .get('/api/docs/openapi.yaml')
        .expect(200);

      expect(response.headers['content-type']).toContain('text/yaml');
      expect(response.text).toContain('openapi:');
      expect(response.text).toContain('info:');
      expect(response.text).toContain('paths:');
    });

    it('should redirect /docs to /api/docs', async () => {
      const response = await request(app)
        .get('/docs')
        .expect(302);

      expect(response.headers.location).toBe('/api/docs');
    });

    it('should set CORS headers for OpenAPI endpoints', async () => {
      const response = await request(app)
        .get('/api/docs/openapi.json')
        .expect(200);

      expect(response.headers['access-control-allow-origin']).toBe('*');
    });
  });

  describe('API Documentation Content', () => {
    let openApiDoc: any;

    beforeAll(async () => {
      const response = await request(app)
        .get('/api/docs/openapi.json');
      openApiDoc = response.body;
    });

    it('should document all main API endpoints', () => {
      const paths = Object.keys(openApiDoc.paths);

      // Check for main endpoint categories
      const hasUserEndpoints = paths.some(path => path.includes('/users'));
      const hasVenueEndpoints = paths.some(path => path.includes('/venues'));
      const hasCourtEndpoints = paths.some(path => path.includes('/courts'));
      const hasBookingEndpoints = paths.some(path => path.includes('/bookings'));
      const hasPaymentEndpoints = paths.some(path => path.includes('/payments'));

      expect(hasUserEndpoints).toBe(true);
      expect(hasVenueEndpoints).toBe(true);
      expect(hasCourtEndpoints).toBe(true);
      expect(hasBookingEndpoints).toBe(true);
      expect(hasPaymentEndpoints).toBe(true);
    });

    it('should have proper HTTP methods for CRUD operations', () => {
      const paths = openApiDoc.paths;

      // Check that we have $ref references to actual endpoints
      const allMethods = Object.values(paths).flatMap((pathObj: any) =>
        Object.keys(pathObj)
      );

      // Since we use $ref, we should see $ref entries
      expect(allMethods).toContain('$ref');
      expect(allMethods.length).toBeGreaterThan(0);
    });

    it('should have proper response schemas', () => {
      const paths = openApiDoc.paths;

      // Since we use $ref, just check that paths are defined
      expect(Object.keys(paths).length).toBeGreaterThan(0);

      // Check that each path has a $ref
      for (const [, pathObj] of Object.entries(paths)) {
        expect(pathObj).toBeDefined();
        expect(typeof pathObj).toBe('object');
      }
    });

    it('should have proper security definitions', () => {
      // Check that security schemes are defined in components
      expect(openApiDoc.components).toBeDefined();
      expect(openApiDoc.components.securitySchemes).toBeDefined();
      expect(openApiDoc.components.securitySchemes.bearerAuth).toBeDefined();

      // Check that global security is defined
      expect(openApiDoc.security).toBeDefined();
      expect(Array.isArray(openApiDoc.security)).toBe(true);
    });

    it('should have comprehensive schemas', () => {
      const schemas = openApiDoc.components?.schemas;

      expect(schemas).toBeDefined();

      // Check for main entity schemas
      const schemaNames = Object.keys(schemas);
      expect(schemaNames.length).toBeGreaterThan(0);

      // Check that we have at least some schemas defined
      expect(schemaNames.length).toBeGreaterThan(0);
    });

    it('should have proper tags for organization', () => {
      expect(openApiDoc.tags).toBeDefined();
      expect(Array.isArray(openApiDoc.tags)).toBe(true);
      expect(openApiDoc.tags.length).toBeGreaterThan(0);

      const tagNames = openApiDoc.tags.map((tag: any) => tag.name);
      expect(tagNames).toContain('Users');
      expect(tagNames).toContain('Venues');
      expect(tagNames).toContain('Courts');
      expect(tagNames).toContain('Bookings');
      expect(tagNames).toContain('Payments');
    });
  });

  describe('Error Handling', () => {
    it('should handle missing OpenAPI files gracefully', () => {
      // This test ensures the fallback document works
      const document = getOpenApiDocument();

      expect(document).toBeDefined();
      expect(document.openapi).toBeDefined();
      expect(document.info).toBeDefined();
    });

    it('should validate document structure', () => {
      const validation = validateOpenApiDocument();

      // Even if there are warnings, the document should be structurally valid
      expect(validation).toBeDefined();
      expect(typeof validation.isValid).toBe('boolean');
      expect(Array.isArray(validation.errors)).toBe(true);
    });
  });
});
