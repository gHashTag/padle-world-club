# Telegram Bot Starter Kit

Универсальный стартовый набор для разработки Telegram ботов на TypeScript с использованием функционального подхода и лучших практик.

## 🌟 Ключевые возможности

- 🧩 **Функциональный подход**: Чистый, модульный и легко тестируемый код.
- 📋 **Строгая типизация**: Полная поддержка TypeScript для безопасной и предсказуемой разработки.
- 🔄 **Wizard-сцены**: Готовые шаблоны для создания многошаговых диалогов (`src/templates/wizard-scene-template.ts`).
- 💾 **Адаптеры хранилища**: Универсальный интерфейс `StorageAdapter` (`src/adapters/storage-adapter.ts`) с реализацией `MemoryAdapter` (`src/adapters/memory-adapter.ts`) для быстрого старта и тестирования. Легко расширяется для других БД.
- 🗄️ **Drizzle ORM и Neon**: Готовая интеграция с Drizzle ORM (`src/db/`) для работы с PostgreSQL, оптимизированная для Neon serverless баз данных. Включает пример схемы (`src/db/schema.ts`) и конфигурацию миграций (`drizzle.config.ts`).
- 🚀 **Apollo Client**: Настроенный Apollo Client (`src/graphql/client.ts`) для взаимодействия с GraphQL API.
- 🧪 **Комплексное тестирование**: Инфраструктура для unit, integration и e2e тестов с использованием Vitest (`vitest.config.ts`). Примеры и моки в `src/__tests__/`.
- 📝 **Продвинутое логирование**: Настраиваемая система логирования (`src/utils/logger.ts`) с различными уровнями и типами логов.
- 🌐 **Middleware**: Готовые middleware для обработки ошибок (`src/middlewares/error-handler.ts`) и управления сессиями.
- 🔍 **Валидация данных**: Встроенная поддержка валидации с помощью Zod (примеры можно найти в схемах и шаблонах).
- 🚀 **Быстрый старт**: Минимум конфигурации для начала работы. `.env` файл создается автоматически.
- 🛠️ **Bun & Node.js**: Поддержка как Bun, так и Node.js для разработки и запуска.

## 🚀 Быстрый старт

1.  **Клонируйте репозиторий:**

    ```bash
    git clone https://github.com/yourusername/telegram-bot-starter-kit.git
    cd telegram-bot-starter-kit
    ```

2.  **Установите зависимости:**

    ```bash
    bun install
    # или
    npm install
    ```

    _Во время установки будет автоматически создан `.env` файл из `example.env`._

3.  **Настройте `.env` файл:**
    Откройте созданный `.env` файл и укажите как минимум ваш `BOT_TOKEN`:

    ```env
    BOT_TOKEN="ваш_токен_бота_от_BotFather"
    # При необходимости настройте DATABASE_URL для Neon и GRAPHQL_ENDPOINT
    ```

4.  **Запустите бота в режиме разработки:**

    ```bash
    bun run dev
    ```

    _Этот скрипт использует `bun run --watch index.ts` для автоматической перезагрузки при изменениях._

    Для более быстрого запуска без автоматической перезагрузки:

    ```bash
    bun run dev:fast
    ```

## 🤖 Для автономных агентов

Этот стартер-кит спроектирован для быстрой адаптации и разработки автономными AI-агентами.

**Основные инструкции и правила для агентов находятся в директории `.cursor/rules/`:**

- **`.cursor/rules/README.md`**: Главный документ с описанием архитектуры, стека технологий, принципов разработки и полезных команд. **Начните отсюда!**
- **`.cursor/rules/AGENT_Coder.mdc`**: Специализированные инструкции для агента, отвечающего за написание кода.
- **`.cursor/rules/AGENT_Tester.mdc`**: Специализированные инструкции для агента, отвечающего за написание тестов.
- **`.cursor/rules/current_task.mdc`**: Пример файла для отслеживания текущей задачи и прогресса.

**Ключевые моменты для агентов:**

1.  **Конфигурация**: Все настройки проекта находятся в `src/config.ts` и загружаются из `.env` файла.
2.  **Точка входа**: Основная логика запуска бота находится в `index.ts`.
3.  **База данных**:
    - Схема: `src/db/schema.ts`
    - Подключение и утилиты: `src/db/index.ts`
    - Миграции: `drizzle_migrations/` (управляются через `drizzle-kit`)
4.  **GraphQL**:
    - Клиент: `src/graphql/client.ts`
5.  **Команды и сцены**:
    - Регистрация команд: `src/commands.ts`
    - Шаблоны для Wizard-сцен: `src/templates/wizard-scene-template.ts`
6.  **Тестирование**:
    - Все тесты находятся в `src/__tests__/`
    - Используйте `bun run test` для запуска всех тестов.
    - Используйте `bun run tdd <путь_к_тесту>` для TDD-цикла.
7.  **Проверка типов**: Обязательно выполняйте `bun run typecheck` после внесения изменений в код.

## 📁 Структура проекта

```
telegram-bot-starter-kit/
├── .cursor/rules/         # Правила и инструкции для AI-агентов
├── docs/                  # Дополнительная документация (TESTING.md, PATTERNS.md, MIGRATION.md)
├── drizzle_migrations/    # Сгенерированные миграции Drizzle
├── example.env            # Пример файла переменных окружения
├── scripts/               # Скрипты для автоматизации (генерация сцен, TDD-цикл)
├── src/
│   ├── adapters/          # Адаптеры хранилища (Storage Adapters)
│   ├── db/                # Drizzle ORM: схемы, подключение
│   ├── graphql/           # Apollo Client: подключение, запросы (если есть)
│   ├── middlewares/       # Middleware для Telegraf (обработчик ошибок)
│   ├── scenes/            # Логика сцен (если вынесены из шаблонов)
│   ├── templates/         # Шаблоны (например, wizard-scene-template.ts)
│   ├── utils/             # Утилиты (logger, validation, etc.)
│   ├── __tests__/         # Тесты (unit, integration, e2e)
│   ├── commands.ts        # Регистрация команд бота
│   ├── config.ts          # Конфигурация приложения
│   └── types.ts           # Основные типы TypeScript
├── .gitignore
├── README.md              # Этот файл
├── bun.lockb
├── drizzle.config.ts      # Конфигурация Drizzle Kit для миграций
├── index.ts               # Главная точка входа приложения и экспорты для библиотеки
├── package.json           # Зависимости и скрипты
├── tsconfig.json          # Настройки TypeScript
└── vitest.config.ts       # Настройки Vitest для тестирования
```

## 🛠️ Основные команды

- `bun run dev`: Запуск в режиме разработки с `--watch`.
- `bun run dev:fast`: Быстрый запуск в режиме разработки без `--watch`.
- `bun run build`: Сборка проекта (JavaScript бандлы).
- `bun run build:types`: Генерация деклараций типов (`.d.ts`).
- `bun run build:full`: Полная сборка (JavaScript + типы).
- `bun run start`: Запуск собранного проекта (production).
- `bun run typecheck`: Проверка типов TypeScript.
- `bun run lint`: Проверка кода ESLint.
- `bun run test`: Запуск всех тестов Vitest.
- `bun run test:watch`: Запуск тестов в режиме наблюдения.
- `bun run test:coverage`: Запуск тестов с генерацией отчета о покрытии.
- `bun run test:ui`: Запуск тестов с UI Vitest.
- `bun run generate:scene`: Генерация новой wizard-сцены на основе шаблона.
- `bun run tdd <путь_к_файлу_теста>`: Запуск TDD-цикла для указанного теста.
- `bun prepare`: Скрипт, выполняемый перед публикацией пакета (обычно полная сборка).

### Drizzle ORM команды

- `bunx drizzle-kit generate`: Генерация SQL миграций на основе изменений в `src/db/schema.ts`.
- `bunx drizzle-kit migrate`: Применение сгенерированных миграций к базе данных.
- `bunx drizzle-kit studio`: Запуск Drizzle Studio для просмотра и управления базой данных. (Убедитесь, что `DATABASE_URL` доступен)

## 💡 Примеры использования

### Минимальный бот

```typescript
// index.ts (если используется как точка входа)
import { Telegraf } from "telegraf";
import { config } from "./src/config";
import { logger, LogType } from "./src/utils/logger";

// Этот блок выполняется, только если index.ts запущен напрямую
if (import.meta.main || process.argv[1]?.endsWith("index.ts")) {
  const bot = new Telegraf(config.BOT_TOKEN);

  bot.start((ctx) =>
    ctx.reply("Привет! Я бот на основе Telegram Bot Starter Kit.")
  );

  bot.help((ctx) => ctx.reply("Справка о командах бота."));

  bot
    .launch()
    .then(() => logger.info("Бот успешно запущен", { type: LogType.SYSTEM }))
    .catch((err) =>
      logger.error("Ошибка при запуске бота", {
        error: err instanceof Error ? err : new Error(String(err)),
        type: LogType.ERROR,
      })
    );

  process.once("SIGINT", () => bot.stop("SIGINT"));
  process.once("SIGTERM", () => bot.stop("SIGTERM"));
}
```

### Бот с Wizard-сценой и хранилищем

См. полную реализацию в `index.ts`, который включает:

- Инициализацию `MemoryAdapter`.
- Регистрацию `errorHandler`.
- Создание и регистрацию `exampleScene` из `wizard-scene-template.ts`.
- Регистрацию команд через `setupCommands`.

## 🗄️ Работа с базой данных (Drizzle + Neon)

Starter Kit предоставляет интеграцию с Drizzle ORM и Neon PostgreSQL.

**1. Настройка схемы:**
Определите ваши таблицы в `src/db/schema.ts`.

**2. Подключение:**
Файл `src/db/index.ts` инициализирует подключение к базе данных, используя `DATABASE_URL` из `.env`.

**3. Генерация и применение миграций:**

- Измените `src/db/schema.ts`.
- Сгенерируйте миграцию: `bunx drizzle-kit generate`
- Примените миграцию: `bunx drizzle-kit migrate`

**Пример использования в коде:**

```typescript
import { db } from "./src/db"; // Drizzle инстанс
import { users } from "./src/db/schema"; // Ваша таблица
import { eq } from "drizzle-orm";

async function getUser(telegramId: string) {
  if (!db) {
    console.warn("DB not initialized, returning null");
    return null;
  }
  return await db.query.users.findFirst({
    where: eq(users.telegram_id, telegramId),
  });
}
```

## 🔗 Работа с GraphQL (Apollo Client)

Для взаимодействия с GraphQL API используется Apollo Client.

**1. Настройка клиента:**
Файл `src/graphql/client.ts` инициализирует Apollo Client, используя `GRAPHQL_ENDPOINT` из `.env`.

**Пример использования в коде:**

```typescript
import { gql } from "@apollo/client";
import { apolloClient } from "./src/graphql/client"; // Apollo Client инстанс

const GET_SOME_DATA = gql`
  query GetSomeData($id: ID!) {
    someData(id: $id) {
      id
      field
    }
  }
`;

async function fetchData(id: string) {
  if (!apolloClient) {
    console.warn("Apollo Client not initialized, returning null");
    return null;
  }
  const { data } = await apolloClient.query({
    query: GET_SOME_DATA,
    variables: { id },
  });
  return data;
}
```

## 📖 Дополнительная документация

- **`/docs/TESTING.md`**: Подробное руководство по тестированию (unit, integration, e2e) с примерами.
- **`/docs/PATTERNS.md`**: Описание используемых паттернов проектирования и лучших практик.
- **`/docs/MIGRATION.md`**: Руководство по миграции с предыдущих версий (если применимо).

## 📄 Лицензия

MIT
