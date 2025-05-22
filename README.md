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
- 🚀 **Быстрый старт** - минимум конфигурации для начала работы
- 🛠️ **Bun & Node.js** - поддержка как Bun, так и Node.js

## Быстрый старт

```bash
# Клонирование репозитория
git clone https://github.com/yourusername/telegram-bot-starter-kit.git
cd telegram-bot-starter-kit

# Установка зависимостей
bun install
# или
npm install

# Файл .env создается автоматически при установке
# Просто добавьте ваш BOT_TOKEN в .env

# Запуск в режиме разработки
bun run dev
# или
npm run dev

# Быстрый запуск без автоматической перезагрузки
bun run dev:fast
```

## Структура проекта

```
telegram-bot-starter-kit/
├── src/
│   ├── adapters/          # Адаптеры хранилища (Storage Adapters)
│   ├── middlewares/       # Middleware для Telegraf
│   ├── scenes/            # Сцены для бота
│   ├── templates/         # Шаблоны для генерации компонентов
│   ├── utils/             # Утилиты и хелперы
│   ├── __tests__/         # Тесты
│   ├── commands.ts        # Команды бота
│   ├── config.ts          # Конфигурация
│   └── types.ts           # Основные типы
├── scripts/               # Скрипты для разработки
├── docs/                  # Документация
├── example.env            # Пример файла переменных окружения
├── tsconfig.json          # Настройки TypeScript
├── vitest.config.ts       # Настройки тестирования
├── index.ts               # Точка входа
└── package.json           # Зависимости и скрипты
```

## Создание бота

### Минимальный пример

```typescript
// index.ts
import { Telegraf } from "telegraf";
import { config } from "./src/config";
import { logger, LogType } from "./src/utils/logger";

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
    logger.info("Бот успешно запущен", { type: LogType.SYSTEM });
  })
  .catch((err) => {
    logger.error("Ошибка при запуске бота", {
      error: err instanceof Error ? err : new Error(String(err)),
      type: LogType.ERROR,
    });
  });

// Обработка завершения работы
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
```

### Пример с использованием Wizard-сцены

```typescript
import { Telegraf, Scenes } from "telegraf";
import { config } from "./src/config";
import { logger, LogType } from "./src/utils/logger";
import { createExampleWizardScene } from "./src/templates/wizard-scene-template";
import { session } from "telegraf";
import { BaseBotContext } from "./src/types";
import { errorHandler } from "./src/middlewares/error-handler";

// Создаем экземпляр бота
const bot = new Telegraf<BaseBotContext>(config.BOT_TOKEN);

// Обработка ошибок
bot.catch((err, ctx) => {
  errorHandler(err, ctx);
});

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
    logger.info("Бот успешно запущен", { type: LogType.SYSTEM });
  })
  .catch((err) => {
    logger.error("Ошибка при запуске бота", {
      error: err instanceof Error ? err : new Error(String(err)),
      type: LogType.ERROR,
    });
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

  logger.info(`Step 2: Name received: ${state.data.name}`, {
    type: LogType.SCENE,
    userId: ctx.from?.id,
  });

  await ctx.reply(
    `Приятно познакомиться, ${state.data.name}! Сколько вам лет?`
  );
  return ctx.wizard.next();
};

// Шаг 3: Обработчик ввода возраста
const handleAge = async (ctx: BaseBotContext) => {
  if (!ctx.message || !("text" in ctx.message)) {
    await ctx.reply("Пожалуйста, введите ваш возраст текстом");
    return;
  }

  const age = parseInt(ctx.message.text, 10);
  if (isNaN(age)) {
    await ctx.reply("Пожалуйста, введите корректный возраст (число)");
    return;
  }

  const state = ctx.wizard.state as any;
  state.data.age = age;

  logger.info(`Step 3: Age received: ${state.data.age}`, {
    type: LogType.SCENE,
    userId: ctx.from?.id,
  });

  // Создаем клавиатуру для выбора
  const keyboard = Markup.inlineKeyboard([
    [Markup.button.callback("Да", "confirm_yes")],
    [Markup.button.callback("Нет", "confirm_no")],
  ]);

  await ctx.reply(
    `Итак, вас зовут ${state.data.name} и вам ${state.data.age} лет. Верно?`,
    keyboard
  );
  return ctx.wizard.next();
};

// Шаг 4: Обработчик подтверждения
const handleConfirmation = async (ctx: BaseBotContext) => {
  if (!ctx.callbackQuery || !("data" in ctx.callbackQuery)) {
    return;
  }

  const answer = ctx.callbackQuery.data;
  const state = ctx.wizard.state as any;

  await ctx.answerCbQuery();

  if (answer === "confirm_yes") {
    logger.info("Step 4: Information confirmed", {
      type: LogType.SCENE,
      userId: ctx.from?.id,
      data: state.data,
    });

    await ctx.reply(
      `Спасибо, ${state.data.name}! Ваши данные сохранены.`,
      Markup.removeKeyboard()
    );
    return ctx.scene.leave();
  } else {
    logger.info("Step 4: Information rejected", { type: LogType.SCENE });
    await ctx.reply("Давайте начнем заново.", Markup.removeKeyboard());
    return ctx.scene.reenter();
  }
};

// Создание сцены
export const createExampleWizardScene = () => {
  return new Scenes.WizardScene<BaseBotContext>(
    "example_wizard",
    handleWelcome,
    handleName,
    handleAge,
    handleConfirmation
  );
};
```

## Оптимизации в текущей версии

В последней версии Telegram Bot Starter Kit были внесены следующие оптимизации:

1. **Улучшенное определение точки входа** - более надежное определение, когда код выполняется как основной модуль
2. **Обработка ошибок** - централизованная функция форматирования ошибок и единообразный обработчик
3. **Асинхронный запуск бота** - использование async/await вместо цепочек промисов
4. **Улучшенная система конфигурации** - более гибкая работа с переменными окружения
5. **Единый процесс завершения работы** - централизованная логика корректного закрытия соединений
6. **Оптимизированные скрипты** - новые скрипты для разработки и быстрого старта
7. **Автоматическое создание .env файла** - упрощенная настройка начальной конфигурации

## Дополнительная документация

Подробная документация доступна в директории `/docs`:

- [Тестирование](/docs/TESTING.md) - подробное руководство по тестированию бота
- [Паттерны](/docs/PATTERNS.md) - описание используемых паттернов и практик
- [Миграция](/docs/MIGRATION.md) - руководство по миграции с предыдущих версий

## Лицензия

MIT
