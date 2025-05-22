# Telegram Bot Starter Kit

Универсальный стартовый набор для разработки Telegram ботов на TypeScript с использованием функционального подхода и лучших практик.

## Особенности

- 🧩 **Функциональный подход** - чистый, модульный и тестируемый код
- 📋 **Типизация** - полная поддержка TypeScript для безопасной разработки
- 🔄 **Wizard-сцены** - готовые компоненты для создания многошаговых диалогов
- 💾 **Адаптеры хранилища** - универсальный интерфейс для работы с любыми базами данных
- 🧪 **Тестирование** - инфраструктура для unit, integration и e2e тестов
- 📝 **Логирование** - настраиваемая система логирования
- 🌐 **Middleware** - готовые обработчики ошибок и аутентификации
- 🔍 **Валидация** - встроенная поддержка валидации с помощью Zod

## Быстрый старт

```bash
# Клонирование репозитория
git clone https://github.com/yourusername/telegram-bot-starter-kit.git
cd telegram-bot-starter-kit

# Установка зависимостей
bun install
# или
npm install

# Копирование .env.example
cp .env.example .env
# Добавьте ваш BOT_TOKEN в .env

# Запуск в режиме разработки
bun run dev
# или
npm run dev
```

## Структура проекта

```
telegram-bot-starter-kit/
├── src/
│   ├── adapters/          # Адаптеры хранилища (Storage Adapters)
│   ├── db/                # Настройки и схемы базы данных
│   ├── middlewares/       # Middleware для Telegraf
│   ├── schemas/           # Zod-схемы для валидации
│   ├── scenes/            # Сцены для бота
│   ├── services/          # Сервисные функции
│   ├── templates/         # Шаблоны для генерации компонентов
│   ├── utils/             # Утилиты и хелперы
│   ├── __tests__/         # Тесты
│   ├── bot.ts             # Основной класс бота
│   ├── commands.ts        # Команды бота
│   ├── config.ts          # Конфигурация
│   ├── logger.ts          # Логгер
│   └── types.ts           # Основные типы
├── scripts/               # Скрипты для разработки
├── docs/                  # Документация
├── .env.example           # Пример файла переменных окружения
├── tsconfig.json          # Настройки TypeScript
├── vitest.config.ts       # Настройки тестирования
└── package.json           # Зависимости и скрипты
```

## Создание бота

### Минимальный пример

```typescript
// index.ts
import { Telegraf } from "telegraf";
import { config } from "./src/config";
import { logger } from "./src/logger";

// Создаем экземпляр бота
const bot = new Telegraf(config.BOT_TOKEN);

// Обработчик команды /start
bot.start((ctx) =>
  ctx.reply("Привет! Я бот на основе Telegram Bot Starter Kit.")
);

// Обработчик команды /help
bot.help((ctx) => ctx.reply("Справка о командах бота."));

// Запускаем бота
bot
  .launch()
  .then(() => {
    logger.info("Бот успешно запущен");
  })
  .catch((err) => {
    logger.error("Ошибка при запуске бота", { error: err });
  });

// Обработка завершения работы
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
```

### Пример с использованием Wizard-сцены

```typescript
import { Telegraf, Scenes } from "telegraf";
import { config } from "./src/config";
import { logger } from "./src/logger";
import { createExampleWizardScene } from "./src/templates/wizard-scene-template";
import { session } from "telegraf";
import { BaseBotContext } from "./src/types";

// Создаем экземпляр бота
const bot = new Telegraf<BaseBotContext>(config.BOT_TOKEN);

// Создаем сцену
const exampleScene = createExampleWizardScene();

// Создаем Stage и регистрируем сцену
const stage = new Scenes.Stage<BaseBotContext>([exampleScene]);

// Подключаем middleware
bot.use(session());
bot.use(stage.middleware());

// Команда для входа в сцену
bot.command("wizard", (ctx) => ctx.scene.enter("example_wizard"));

// Запускаем бота
bot
  .launch()
  .then(() => {
    logger.info("Бот успешно запущен");
  })
  .catch((err) => {
    logger.error("Ошибка при запуске бота", { error: err });
  });
```

## Работа с хранилищем данных

Starter Kit предоставляет универсальный интерфейс `StorageAdapter` для работы с любыми базами данных. По умолчанию реализован адаптер `MemoryAdapter` для тестирования и разработки.

```typescript
import { MemoryAdapter } from "./src/adapters/memory-adapter";
import { User } from "./src/schemas";

// Создаем адаптер для хранения в памяти
const storage = new MemoryAdapter();

// Инициализируем соединение
await storage.initialize();

// Создаем пользователя
const user = await storage.createUser({
  telegram_id: 123456789,
  username: "john_doe",
  first_name: "John",
  last_name: "Doe",
});

// Получаем пользователя по ID Telegram
const foundUser = await storage.getUserByTelegramId(123456789);

// Обновляем пользователя
const updatedUser = await storage.updateUser(123456789, {
  username: "john_updated",
});

// Закрываем соединение
await storage.close();
```

## Создание своих сцен

### Функциональный подход к созданию Wizard-сцены

```typescript
import { Scenes, Markup } from "telegraf";
import { BaseBotContext } from "../types";
import { logger, LogType } from "../utils/logger";

// Шаг 1: Обработчик приветствия
const handleWelcome = async (ctx: BaseBotContext) => {
  logger.info("Step 1: Welcome", { type: LogType.SCENE });

  // Инициализация состояния
  const state = ctx.wizard.state as any;
  state.data = {};

  await ctx.reply("Добро пожаловать! Как вас зовут?");
  return ctx.wizard.next();
};

// Шаг 2: Обработчик ввода имени
const handleName = async (ctx: BaseBotContext) => {
  if (!ctx.message || !("text" in ctx.message)) {
    await ctx.reply("Пожалуйста, введите ваше имя текстом");
    return;
  }

  const state = ctx.wizard.state as any;
  state.data.name = ctx.message.text;

  await ctx.reply(
    `Приятно познакомиться, ${state.data.name}! Сколько вам лет?`
  );
  return ctx.wizard.next();
};

// Функция для создания сцены
export const createMyWizardScene = (): Scenes.WizardScene<BaseBotContext> => {
  // Создаем сцену с обработчиками шагов
  const scene = new Scenes.WizardScene(
    "my_wizard",
    handleWelcome,
    handleName
    // Добавьте другие обработчики шагов
  );

  // Регистрируем обработчики действий
  scene.action("cancel", async (ctx) => {
    await ctx.reply("Операция отменена");
    return ctx.scene.leave();
  });

  return scene;
};
```

## Тестирование

Starter Kit поддерживает разные виды тестирования с помощью Vitest:

```bash
# Запуск всех тестов
bun test
# или
npm test

# Запуск тестов с покрытием
bun test:coverage
# или
npm run test:coverage

# Запуск в режиме watch
bun test:watch
# или
npm run test:watch
```

### Пример unit-теста

```typescript
import { describe, it, expect, vi } from "vitest";
import { validateUser } from "../src/utils/validation-zod";

describe("Validation Utils", () => {
  it("should validate a correct user object", () => {
    const validUser = {
      id: "123e4567-e89b-12d3-a456-426614174000",
      telegram_id: 123456789,
      username: "test_user",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const result = validateUser(validUser);
    expect(result).not.toBeNull();
    expect(result?.telegram_id).toBe(123456789);
  });

  it("should return null for invalid user object", () => {
    const invalidUser = {
      // Missing required fields
      username: "test_user",
    };

    const result = validateUser(invalidUser);
    expect(result).toBeNull();
  });
});
```

## Команды разработки

- `bun run dev` - запуск в режиме разработки с автоматической перезагрузкой
- `bun run build` - сборка проекта
- `bun run start` - запуск собранного проекта
- `bun run typecheck` - проверка типов TypeScript
- `bun run lint` - проверка стиля кода
- `bun run test` - запуск тестов
- `bun run generate:scene` - генерация новой сцены на основе шаблона

## Расширение и настройка

### Создание своего адаптера хранилища

```typescript
import { StorageAdapter } from "./src/adapters/storage-adapter";
import { User, UserSettings } from "./src/schemas";

// Реализация адаптера для вашей базы данных
export class MyDatabaseAdapter implements StorageAdapter {
  private client: any; // ваш клиент базы данных

  constructor(connectionString: string) {
    // Инициализация клиента базы данных
  }

  async initialize(): Promise<void> {
    // Подключение к базе данных
  }

  async close(): Promise<void> {
    // Закрытие соединения
  }

  async getUserByTelegramId(telegramId: number): Promise<User | null> {
    // Реализация метода
  }

  async createUser(userData: Partial<User>): Promise<User | null> {
    // Реализация метода
  }

  // Реализация других методов...
}
```

## Документация

Более подробная документация доступна в директории `docs/`:

- [Начало работы](docs/GETTING_STARTED.md)
- [Руководство по Wizard-сценам](docs/WIZARD_SCENE_PATTERNS.md)
- [Тестирование](docs/TESTING.md)
- [Шаблоны и паттерны](docs/PATTERNS.md)

## Лицензия

MIT
