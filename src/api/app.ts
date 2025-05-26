/**
 * Express приложение в функциональном стиле
 */

import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';
import { setupSwaggerUI } from './middleware/swagger';

import { config } from './config';
import { ApiResponse } from './utils/response';
import { FunctionalCompose } from './utils/compose';
import { createUserRoutes } from './routes/users';
import { createVenuesRouter } from './routes/venues';
import { createBookingRoutes } from './routes/bookings';
import { createCourtRoutes } from './routes/courts';
import { createPaymentRoutes } from './routes/payments';
import { db } from '../db';
import { UserRepository } from '../repositories/user-repository';

// Функция для создания Express приложения
export const createApp = (): Application => {
  const app = express();

  // Применяем middleware в функциональном стиле
  return FunctionalCompose.pipe(
    setupSecurity,
    setupParsing,
    setupLogging,
    setupSwagger,
    setupRoutes,
    setupErrorHandling
  )(app);
};

// Настройка безопасности
const setupSecurity = (app: Application): Application => {
  if (config.server.helmet) {
    app.use(helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
        },
      },
    }));
  }

  app.use(cors({
    origin: config.server.cors.origin,
    credentials: config.server.cors.credentials,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  }));

  return app;
};

// Настройка парсинга
const setupParsing = (app: Application): Application => {
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  if (config.server.compression) {
    app.use(compression());
  }

  return app;
};

// Настройка логирования
const setupLogging = (app: Application): Application => {
  if (process.env.NODE_ENV !== 'test') {
    const morganFormat = config.logging.format === 'json'
      ? ':method :url :status :res[content-length] - :response-time ms'
      : 'combined';

    app.use(morgan(morganFormat));
  }

  return app;
};

// Настройка Swagger UI
const setupSwagger = (app: Application): Application => {
  // Настраиваем Swagger UI только если включено в конфигурации
  if (config.swagger.enabled) {
    setupSwaggerUI(app);
  }

  return app;
};

// Настройка маршрутов
const setupRoutes = (app: Application): Application => {
  // Landing page - главная страница
  app.get('/', (_req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, 'views', 'index.html'));
  });

  // Health check endpoint
  app.get('/health', (req: Request, res: Response) => {
    ApiResponse.success(res, req, {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      version: process.env.npm_package_version || '1.0.0',
    }, 'Сервер работает нормально');
  });

  // API documentation теперь настраивается в setupSwagger

  // API routes будут добавлены позже
  app.use('/api', createApiRouter());

  // 404 handler
  app.use((req: Request, res: Response) => {
    ApiResponse.notFound(res, req, `Маршрут ${req.method} ${req.originalUrl} не найден`);
  });

  return app;
};

// Настройка обработки ошибок
const setupErrorHandling = (app: Application): Application => {
  // Глобальный обработчик ошибок
  app.use((error: any, req: Request, res: Response, next: NextFunction) => {
    console.error('Необработанная ошибка:', error);

    // Если ответ уже отправлен, передаем ошибку дальше
    if (res.headersSent) {
      return next(error);
    }

    // Определяем тип ошибки и статус код
    let statusCode = 500;
    let message = 'Внутренняя ошибка сервера';

    if (error.name === 'ValidationError') {
      statusCode = 400;
      message = 'Ошибка валидации данных';
    } else if (error.name === 'UnauthorizedError') {
      statusCode = 401;
      message = 'Требуется авторизация';
    } else if (error.name === 'ForbiddenError') {
      statusCode = 403;
      message = 'Доступ запрещен';
    } else if (error.name === 'NotFoundError') {
      statusCode = 404;
      message = 'Ресурс не найден';
    } else if (error.name === 'ConflictError') {
      statusCode = 409;
      message = 'Конфликт данных';
    }

    ApiResponse.error(res, req, message, statusCode, {
      name: error.name,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  });

  return app;
};

// Создание API роутера (пока заглушка)
const createApiRouter = () => {
  const router = express.Router();

  // Базовая информация об API
  router.get('/', (req: Request, res: Response) => {
    ApiResponse.success(res, req, {
      name: 'Padle World Club API',
      version: '1.0.0',
      description: 'REST API для системы управления падел-клубом',
      endpoints: {
        users: '/api/users',
        venues: '/api/venues',
        courts: '/api/courts',
        bookings: '/api/bookings',
        payments: '/api/payments',
        tournaments: '/api/tournaments',
        gameSessions: '/api/game-sessions',
      },
      documentation: config.swagger.enabled ? config.swagger.path : null,
    }, 'API готов к работе');
  });

  // Подключение маршрутов для различных ресурсов
  if (!db) {
    throw new Error('Database connection not available');
  }
  const userRepository = new UserRepository(db);
  router.use('/users', createUserRoutes({ userRepository }));
  router.use('/venues', createVenuesRouter());
  router.use('/bookings', createBookingRoutes());
  router.use('/courts', createCourtRoutes());
  router.use('/payments', createPaymentRoutes());
  // router.use('/courts', courtsRouter);
  // router.use('/bookings', bookingsRouter);
  // router.use('/payments', paymentsRouter);
  // router.use('/tournaments', tournamentsRouter);
  // router.use('/game-sessions', gameSessionsRouter);

  return router;
};

// Swagger документация теперь загружается из файлов в middleware/swagger.ts

export default createApp;
