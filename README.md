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
- 🗄️ **Drizzle ORM** - современный ORM для работы с PostgreSQL
- 🌩️ **Neon Database** - поддержка Neon PostgreSQL из коробки
- 🚀 **Apollo Client** - интеграция с GraphQL API

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
│   ├── db/                # Схемы и конфигурация Drizzle ORM
│   ├── middlewares/       # Middleware для Telegraf
│   ├── scenes/            # Сцены для бота
│   ├── templates/         # Шаблоны для генерации компонентов
│   ├── utils/             # Утилиты и хелперы
│   ├── graphql/           # Apollo Client и GraphQL запросы
│   ├── __tests__/         # Тесты
│   ├── commands.ts        # Команды бота
│   ├── config.ts          # Конфигурация
│   └── types.ts           # Основные типы
├── scripts/               # Скрипты для разработки
├── docs/                  # Документация
├── drizzle_migrations/    # Миграции Drizzle
├── example.env            # Пример файла переменных окружения
├── tsconfig.json          # Настройки TypeScript
├── vitest.config.ts       # Настройки тестирования
├── drizzle.config.ts      # Конфигурация Drizzle ORM
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

## Работа с базой данных (Drizzle + Neon)

Starter Kit предоставляет интеграцию с Drizzle ORM и Neon PostgreSQL:

```typescript
// src/db/index.ts
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { config } from "../config";
import * as schema from "./schema";

// Проверяем, что URL базы данных задан
if (!config.DATABASE_URL) {
  throw new Error("DATABASE_URL не задан в переменных окружения");
}

// Создаем пул соединений
const pool = new Pool({
  connectionString: config.DATABASE_URL,
});

// Инициализируем Drizzle
export const db = drizzle(pool, { schema });

// src/db/schema.ts
import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  telegram_id: text("telegram_id").notNull().unique(),
  username: text("username"),
  first_name: text("first_name"),
  last_name: text("last_name"),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

// Пример использования
import { db } from "./src/db";
import { users } from "./src/db/schema";
import { eq } from "drizzle-orm";

// Создание пользователя
const newUser = await db
  .insert(users)
  .values({
    telegram_id: "123456789",
    username: "example_user",
    first_name: "John",
    last_name: "Doe",
  })
  .returning();

// Получение пользователя
const user = await db.query.users.findFirst({
  where: eq(users.telegram_id, "123456789"),
});
```

## Работа с GraphQL (Apollo Client)

Для взаимодействия с GraphQL API используется Apollo Client:

```typescript
// src/graphql/client.ts
import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import { config } from "../config";

// Проверяем, что GraphQL эндпоинт задан
if (!config.GRAPHQL_ENDPOINT) {
  throw new Error("GRAPHQL_ENDPOINT не задан в переменных окружения");
}

// Создаем HTTP линк
const httpLink = new HttpLink({
  uri: config.GRAPHQL_ENDPOINT,
});

// Инициализируем Apollo Client
export const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

// Пример использования
import { gql } from "@apollo/client";
import { apolloClient } from "./src/graphql/client";

const GET_USER = gql`
  query GetUser($id: ID!) {
    user(id: $id) {
      id
      name
      email
    }
  }
`;

// Выполнение запроса
const { data } = await apolloClient.query({
  query: GET_USER,
  variables: { id: "123" },
});
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
8. **Интеграция с Drizzle ORM и Neon** - готовая настройка для работы с PostgreSQL
9. **Поддержка Apollo Client** - для взаимодействия с GraphQL API

## Дополнительная документация

Подробная документация доступна в директории `/docs`:

- [Тестирование](/docs/TESTING.md) - подробное руководство по тестированию бота
- [Паттерны](/docs/PATTERNS.md) - описание используемых паттернов и практик
- [Миграция](/docs/MIGRATION.md) - руководство по миграции с предыдущих версий

## Лицензия

MIT
