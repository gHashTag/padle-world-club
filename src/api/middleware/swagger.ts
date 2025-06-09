import { Application } from "express";
import swaggerUi from "swagger-ui-express";
import YAML from "yamljs";
import path from "path";
import fs from "fs";

/**
 * Swagger UI configuration and setup
 */
export class SwaggerConfig {
  private static instance: SwaggerConfig;
  private swaggerDocument: any;
  private isLoaded = false;

  private constructor() {}

  public static getInstance(): SwaggerConfig {
    if (!SwaggerConfig.instance) {
      SwaggerConfig.instance = new SwaggerConfig();
    }
    return SwaggerConfig.instance;
  }

  /**
   * Load and parse OpenAPI specification
   */
  private loadSwaggerDocument(): any {
    if (this.isLoaded && this.swaggerDocument) {
      return this.swaggerDocument;
    }

    try {
      const docsPath = path.join(__dirname, "../docs");
      const openApiPath = path.join(docsPath, "openapi.yaml");

      if (!fs.existsSync(openApiPath)) {
        throw new Error(`OpenAPI specification not found at: ${openApiPath}`);
      }

      // Load main OpenAPI document
      this.swaggerDocument = YAML.load(openApiPath);

      // Note: $ref references will be resolved by swagger-ui-express automatically

      this.isLoaded = true;
      console.log("✅ OpenAPI specification loaded successfully");

      return this.swaggerDocument;
    } catch (error) {
      console.error("❌ Failed to load OpenAPI specification:", error);

      // Return a minimal fallback document
      return this.getFallbackDocument();
    }
  }

  // Note: Reference resolution is handled by swagger-ui-express

  /**
   * Get fallback OpenAPI document when main document fails to load
   */
  private getFallbackDocument(): any {
    return {
      openapi: "3.0.3",
      info: {
        title: "Padel World Club API",
        description:
          "API documentation is temporarily unavailable. Please check back later.",
        version: "1.0.0",
        contact: {
          name: "API Support",
          email: "api-support@padelworldclub.com",
        },
      },
      servers: [
        {
          url:
            process.env.NODE_ENV === "production"
              ? "https://api.padelworldclub.com/v1"
              : "http://localhost:3000/api",
          description:
            process.env.NODE_ENV === "production"
              ? "Production server"
              : "Development server",
        },
      ],
      paths: {
        "/health": {
          get: {
            summary: "Health check",
            description: "Check API health status",
            responses: {
              "200": {
                description: "API is healthy",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        status: { type: "string", example: "ok" },
                        timestamp: { type: "string", format: "date-time" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
    };
  }

  /**
   * Get Swagger UI options
   */
  private getSwaggerUiOptions(): swaggerUi.SwaggerUiOptions {
    return {
      explorer: true,
      swaggerOptions: {
        docExpansion: "list",
        filter: true,
        showRequestDuration: true,
        tryItOutEnabled: true,
        requestInterceptor: (req: any) => {
          // Add custom headers or modify requests
          req.headers["X-API-Client"] = "swagger-ui";
          return req;
        },
        responseInterceptor: (res: any) => {
          // Log responses for debugging
          if (process.env.NODE_ENV === "development") {
            console.log("Swagger UI Response:", {
              status: res.status,
              url: res.url,
              headers: res.headers,
            });
          }
          return res;
        },
        // Custom CSS for branding
        customCss: `
          .swagger-ui .topbar { display: none; }
          .swagger-ui .info .title { color: #2c5aa0; }
          .swagger-ui .info .description { margin: 20px 0; }
          .swagger-ui .scheme-container { background: #f8f9fa; padding: 15px; border-radius: 5px; }
          .swagger-ui .opblock.opblock-post { border-color: #49cc90; }
          .swagger-ui .opblock.opblock-get { border-color: #61affe; }
          .swagger-ui .opblock.opblock-put { border-color: #fca130; }
          .swagger-ui .opblock.opblock-delete { border-color: #f93e3e; }
          .swagger-ui .opblock.opblock-patch { border-color: #50e3c2; }
        `,
        // Custom site title
        customSiteTitle: "Padel World Club API Documentation",
        // Custom favicon
        customfavIcon: "/favicon.ico",
      },
    };
  }

  /**
   * Setup Swagger UI middleware for Express app
   */
  public setupSwagger(app: Application): void {
    try {
      const swaggerDocument = this.loadSwaggerDocument();
      const swaggerUiOptions = this.getSwaggerUiOptions();

      // Serve Swagger UI at /api/docs
      app.use("/api/docs", swaggerUi.serve as any);
      app.get(
        "/api/docs",
        swaggerUi.setup(swaggerDocument, swaggerUiOptions) as any
      );

      // Serve raw OpenAPI JSON at /api/docs/openapi.json
      app.get("/api/docs/openapi.json", (_req, res) => {
        res.setHeader("Content-Type", "application/json");
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.json(swaggerDocument);
      });

      // Serve raw OpenAPI YAML at /api/docs/openapi.yaml
      app.get("/api/docs/openapi.yaml", (_req, res) => {
        res.setHeader("Content-Type", "text/yaml");
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.send(YAML.stringify(swaggerDocument, 4));
      });

      // Redirect /docs to /api/docs for convenience
      app.get("/docs", (_req, res) => {
        res.redirect("/api/docs");
      });

      console.log("✅ Swagger UI configured successfully");
      console.log(`📚 API Documentation available at: /api/docs`);
      console.log(`📄 OpenAPI JSON available at: /api/docs/openapi.json`);
      console.log(`📄 OpenAPI YAML available at: /api/docs/openapi.yaml`);
    } catch (error) {
      console.error("❌ Failed to setup Swagger UI:", error);
    }
  }

  /**
   * Get OpenAPI document for external use
   */
  public getOpenApiDocument(): any {
    return this.loadSwaggerDocument();
  }

  /**
   * Validate OpenAPI document
   */
  public validateDocument(): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    try {
      const doc = this.loadSwaggerDocument();

      // Basic validation
      if (!doc.openapi) {
        errors.push("Missing openapi version");
      }

      if (!doc.info || !doc.info.title || !doc.info.version) {
        errors.push("Missing required info fields (title, version)");
      }

      if (!doc.paths || Object.keys(doc.paths).length === 0) {
        errors.push("No paths defined");
      }

      // Validate paths (skip $ref entries as they will be resolved by swagger-ui)
      for (const [path, methods] of Object.entries(doc.paths)) {
        if (typeof methods !== "object") {
          errors.push(`Invalid path definition: ${path}`);
          continue;
        }

        for (const [method, operation] of Object.entries(methods as any)) {
          // Skip $ref entries
          if (method === "$ref") {
            continue;
          }

          if (
            typeof operation !== "object" ||
            operation === null ||
            !(operation as any).responses
          ) {
            errors.push(
              `Missing responses for ${method.toUpperCase()} ${path}`
            );
          }
        }
      }

      return {
        isValid: errors.length === 0,
        errors,
      };
    } catch (error) {
      errors.push(`Document parsing error: ${error}`);
      return {
        isValid: false,
        errors,
      };
    }
  }
}

/**
 * Express middleware to setup Swagger UI
 */
export const setupSwaggerUI = (app: Application): void => {
  const swaggerConfig = SwaggerConfig.getInstance();
  swaggerConfig.setupSwagger(app);
};

/**
 * Get OpenAPI document
 */
export const getOpenApiDocument = (): any => {
  const swaggerConfig = SwaggerConfig.getInstance();
  return swaggerConfig.getOpenApiDocument();
};

/**
 * Validate OpenAPI document
 */
export const validateOpenApiDocument = (): {
  isValid: boolean;
  errors: string[];
} => {
  const swaggerConfig = SwaggerConfig.getInstance();
  return swaggerConfig.validateDocument();
};
