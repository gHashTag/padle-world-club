import { Context as TelegrafContext, Scenes } from "telegraf";
import {
  User,
  Project,
  Hashtag,
  ReelContent,
  ReelsFilter,
  ParsingRunLog,
  NotificationSettings,
  ReelsCollection,
} from "./schemas";

// Реэкспортируем типы для обратной совместимости
export type {
  User,
  Project,
  Hashtag,
  ReelContent,
  ReelsFilter,
  ParsingRunLog,
  NotificationSettings,
  ReelsCollection,
};

// Базовый интерфейс для контекста Telegraf с добавлением поддержки сцен
export interface BaseBotContext extends TelegrafContext {
  storage: StorageAdapter;
  config: BotConfig;
  // Добавляем session для поддержки сессии в контексте
  session?: Scenes.SceneSession<BotSceneSessionData> & {
    user?: User;
    [key: string]: any;
  };
  // Возвращаем тип к SceneContextScene, который включает и контекст, и сессию
  scene: Scenes.SceneContextScene<BaseBotContext, BotSceneSessionData>;
  // Добавляем wizard для поддержки визард-сцен
  wizard?: Scenes.WizardContextWizard<BaseBotContext>;
  match?: RegExpExecArray | null;
}

// Адаптер для хранения данных
export interface StorageAdapter {
  initialize(): Promise<void>;
  close(): Promise<void>;
  getUserByTelegramId(telegramId: number): Promise<User | null>;
  createUser(
    telegramId: number,
    username?: string,
    firstName?: string,
    lastName?: string
  ): Promise<User>;
  saveUser(userData: {
    telegramId: number;
    username?: string;
    firstName?: string;
    lastName?: string;
  }): Promise<User>;
  findUserByTelegramIdOrCreate(
    telegramId: number,
    username?: string,
    firstName?: string,
    lastName?: string
  ): Promise<User>;
  getProjectsByUserId(userId: number): Promise<Project[]>;
  createProject(userId: number, name: string): Promise<Project>;
  getProjectById(projectId: number): Promise<Project | null>;
  addHashtag(projectId: number, name: string): Promise<Hashtag | null>;
  getTrackingHashtags(
    projectId: number,
    activeOnly?: boolean
  ): Promise<Hashtag[]>;
  getHashtagsByProjectId(projectId: number): Promise<Hashtag[] | null>;
  removeHashtag(projectId: number, hashtag: string): Promise<void>;
  getReelsByProjectId?(projectId: number, filter?: any): Promise<ReelContent[]>;
  saveReels(
    reels: Partial<ReelContent>[],
    projectId: number,
    sourceType: string,
    sourceId: string | number
  ): Promise<number>;
  getReels(filter?: ReelsFilter): Promise<ReelContent[]>;
  // Методы для работы с Reels
  getReelById?(reelId: string): Promise<ReelContent | null>;
  getReelsCount?(filter?: ReelsFilter): Promise<number>;
  getReelsByHashtagId?(
    hashtagId: number,
    filter?: ReelsFilter
  ): Promise<ReelContent[]>;

  logParsingRun(log: Partial<ParsingRunLog>): Promise<ParsingRunLog>;
  // Алиас для logParsingRun (используется в тестах)
  createParsingLog?(log: Partial<ParsingRunLog>): Promise<ParsingRunLog>;
  // Алиас для обновления лога парсинга (используется в тестах)
  updateParsingLog?(log: Partial<ParsingRunLog>): Promise<ParsingRunLog>;
  getParsingRunLogs(
    targetType: "competitor" | "hashtag",
    targetId: string
  ): Promise<ParsingRunLog[]>;
  // Метод для получения логов парсинга по ID проекта (используется в тестах)
  getParsingLogsByProjectId?(projectId: number): Promise<ParsingRunLog[]>;

  // Методы для работы с уведомлениями
  getNotificationSettings(userId: number): Promise<NotificationSettings | null>;
  saveNotificationSettings(
    settings: Partial<NotificationSettings>
  ): Promise<NotificationSettings>;
  updateNotificationSettings(
    userId: number,
    settings: Partial<NotificationSettings>
  ): Promise<NotificationSettings>;
  getUserById(userId: number): Promise<User | null>;
  getNewReels(projectId: number, afterDate: string): Promise<ReelContent[]>;

  // Методы для работы с маркетинговыми данными
  calculateMarketingData?(
    reel: ReelContent,
    averageFollowers?: number
  ): Promise<ReelContent>;
  updateReelMarketingData?(
    reelId: number,
    marketingData: Partial<ReelContent>
  ): Promise<ReelContent | null>;
  getReelsWithMarketingData?(filter?: ReelsFilter): Promise<ReelContent[]>;

  // Методы для работы с коллекциями Reels
  createReelsCollection?(
    projectId: number,
    name: string,
    description?: string,
    filter?: ReelsFilter,
    reelsIds?: string[]
  ): Promise<ReelsCollection>;
  getReelsCollectionsByProjectId?(
    projectId: number
  ): Promise<ReelsCollection[]>;
  getReelsCollectionById?(
    collectionId: number
  ): Promise<ReelsCollection | null>;
  updateReelsCollection?(
    collectionId: number,
    data: Partial<ReelsCollection>
  ): Promise<ReelsCollection | null>;
  deleteReelsCollection?(collectionId: number): Promise<boolean>;
  processReelsCollection?(
    collectionId: number,
    format: "text" | "csv" | "json"
  ): Promise<ReelsCollection | null>;

  // Методы для работы с расшифровками видео
  updateReel?(
    reelId: string,
    data: Partial<ReelContent>
  ): Promise<ReelContent | null>;
  getReelById?(reelId: string): Promise<ReelContent | null>;

  // Метод для выполнения произвольных SQL-запросов
  executeQuery(query: string, params?: any[]): Promise<any>;
  // TODO: Добавить остальные методы по мере необходимости
}

// Типы User, Project, Hashtag и ReelContent теперь импортируются из ./schemas

// Конфигурация для бота
export interface BotConfig {
  telegramBotToken: string;
  webhookDomain?: string;
  // TODO: Добавить другие необходимые параметры конфигурации
}

// Шаги сцены
export enum BotSceneStep {
  // Пример шага
  EXAMPLE_STEP_1 = "EXAMPLE_STEP_1",
  EXAMPLE_STEP_2 = "EXAMPLE_STEP_2",

  // Шаги для шаблона Wizard-сцены (оставляем для примера)
  TEMPLATE_STEP_1 = "TEMPLATE_STEP_1",
  TEMPLATE_STEP_2 = "TEMPLATE_STEP_2",
}

export interface BotSceneSessionData extends Scenes.SceneSessionData {
  step?: BotSceneStep;
  cursor: number; // Сделаем обязательным
  currentProjectId?: number; // Эти поля пока оставим, но они специфичны
  messageIdToEdit?: number;
  projectId?: number;
  user?: User;
  // ... другие общие поля для сессии, если нужны
}

// Тип для MiddlewareFn, если он не импортируется из telegraf/types
// (Telegraf V4 использует `Middleware<TContext> `)
export type Middleware<TContext extends TelegrafContext> = (
  ctx: TContext,
  next: () => Promise<void>
) => Promise<void> | void;

// Используем Middleware<ScraperBotContext> вместо MiddlewareFn<any>
// Для stage.middleware()

// Этот тип был в ошибках, вероятно, связан с конкретной реализацией адаптера Neon
export interface NeonStorageAdapter extends StorageAdapter {
  // Специфичные методы для Neon, если они есть
}

// Типы для моков или данных скрейпинга
export interface InstagramReel {
  id: string; // или number
  url: string;
  shortCode?: string;
  caption?: string;
  displayUrl?: string;
  videoUrl?: string;
  viewCount?: number;
  likesCount?: number;
  commentsCount?: number;
  takenAtTimestamp?: number;
  ownerUsername?: string;
  ownerId?: string;
  [key: string]: any; // для дополнительных полей
}

export interface ScraperOptions {
  maxReels?: number; // maxResults в mock-apify-service, оставляю maxReels
  maxConcurrency?: number;
  delayBetweenRequests?: number; // Добавлено из mock-apify-service
  minViews?: number; // Добавлено из mock-apify-service
  maxDaysOld?: number; // Добавлено из mock-apify-service
  // ... другие опции
}

// Этот тип также был в ошибках, вероятно, результат работы скрейпера
export interface ScrapedReel extends InstagramReel {
  // Могут быть дополнительные поля после обработки
}

// Типы ReelsFilter и ParsingRunLog теперь импортируются из ./schemas

// Для использования в index.ts вместо any для Telegraf
// export type BotType = Telegraf<ScraperBotContext>;

export {}; // Добавляем пустой экспорт, чтобы файл считался модулем
