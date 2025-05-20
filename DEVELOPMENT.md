# 📱 Instagram Scraper Bot - Руководство по разработке

Это руководство содержит информацию о процессе автономной разработки модуля Instagram Scraper Bot, его архитектуре и инструментах, созданных для облегчения разработки и тестирования.

## Оглавление

- [Архитектура модуля](#архитектура-модуля)
- [Процесс автономной разработки](#процесс-автономной-разработки)
  - [Настройка среды разработки](#настройка-среды-разработки)
  - [Локальная база данных SQLite](#локальная-база-данных-sqlite)
  - [Мокирование Apify API](#мокирование-apify-api)
  - [Автоматизированное тестирование](#автоматизированное-тестирование)
    - [Запуск тестов](#запуск-всех-тестов)
    - [Структура тестов](#структура-тестов)
    - [Фреймворк для тестирования Telegram-сцен](#фреймворк-для-тестирования-telegram-сцен)
  - [Визуальная панель разработки](#визуальная-панель-разработки)
- [Доступные инструменты](#доступные-инструменты)
- [Структура кода](#структура-кода)
- [Отладка](#отладка)
- [Часто возникающие проблемы](#часто-возникающие-проблемы)

## Архитектура модуля

Instagram Scraper Bot построен с использованием следующих основных принципов:

1. **Инкапсуляция** - модуль содержит всю необходимую бизнес-логику и зависимости внутри себя
2. **Изоляция** - модуль предоставляет четкий API для взаимодействия с основным приложением
3. **Слоистая архитектура**:
   - Слой интерфейса пользователя (Telegraf сцены)
   - Слой бизнес-логики (обработка команд, управление проектами)
   - Слой данных (адаптеры хранилища)
   - Слой внешних интеграций (Apify API)

### Диаграмма компонентов

```
┌──────────────────────────────────────────────────────────────┐
│                 Instagram Scraper Bot Module                 │
│                                                              │
│  ┌─────────┐    ┌─────────────┐    ┌───────────────────┐    │
│  │  Scenes │───▶│ Controllers │───▶│ Storage Adapters  │    │
│  └─────────┘    └─────────────┘    └───────────────────┘    │
│       │                                      │               │
│       │                                      │               │
│       ▼                                      ▼               │
│  ┌─────────┐                        ┌───────────────────┐   │
│  │   API   │◀─────────────────────▶ │ External Services │   │
│  └─────────┘                        └───────────────────┘   │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

## Процесс автономной разработки

### Настройка среды разработки

1. **Клонирование репозитория**

```bash
git clone <repo-url>
cd <repo-directory>
```

2. **Установка зависимостей**

```bash
bun install
```

3. **Настройка переменных окружения**

Создайте файл `.env` в директории модуля:

```env
# Для автономной разработки
NEON_DATABASE_URL=sqlite:///.dev/sqlite.db
APIFY_TOKEN=mock_apify_token_for_testing
MIN_VIEWS=50000
MAX_AGE_DAYS=14
TEST_MODE=true
```

### Локальная база данных SQLite

Модуль поддерживает работу с SQLite вместо удаленной базы данных Neon, что значительно ускоряет разработку и тестирование.

#### Инициализация базы данных

```bash
# Создание и инициализация базы данных с тестовыми данными
bun run scripts/init-dev-db.ts

# Сброс и повторная инициализация
RESET_DB=true bun run scripts/init-dev-db.ts
```

#### Структура базы данных

SQLite база данных содержит следующие таблицы:

- `Users` - пользователи Telegram
- `Projects` - проекты для отслеживания конкурентов
- `Competitors` - аккаунты конкурентов Instagram
- `Hashtags` - отслеживаемые хэштеги
- `ReelsContent` - данные о спарсенных Instagram Reels

#### Тестовые данные

База данных инициализируется со следующими тестовыми данными:

- Тестовый пользователь с Telegram ID 123456789
- Тестовый проект "Эстетическая косметология"
- Несколько тестовых конкурентов и хэштегов
- Тестовые Reels с разными параметрами

#### Адаптер SQLite

Модуль содержит специальный адаптер `SqliteAdapter` для работы с локальной базой данных. Этот адаптер реализует тот же интерфейс, что и `NeonStorageAdapter`, и автоматически подключается при соответствующем значении переменной окружения.

```typescript
import { SqliteAdapter } from "./adapters/sqlite-adapter"

// Создание экземпляра адаптера SQLite
const storageAdapter = new SqliteAdapter()

// Подключение к базе данных
await storageAdapter.connect()

// Использование адаптера так же, как и с PostgreSQL
const projects = await storageAdapter.getProjects(userId)
```

### Мокирование Apify API

Для автономной работы без реальных запросов к Apify API модуль содержит мок-сервис.

#### Использование мок-сервиса

```typescript
import { MockApifyService } from "./services/mock-apify-service"

// Создание экземпляра мок-сервиса
const scraperService = new MockApifyService()

// Использование аналогично реальному сервису
const reels = await scraperService.getReelsFromAccount("beauty_clinic", {
  maxResults: 10,
  minViews: 50000,
})
```

#### Структура моковых данных

Мок-сервис возвращает предопределенные данные для нескольких сценариев:

- Данные для аккаунтов `beauty_clinic`, `luxury_beauty` и т.д.
- Данные для хэштегов `красота`, `косметология` и т.д.

### Автоматизированное тестирование

Модуль поддерживает несколько типов тестов:

#### Запуск всех тестов

```bash
# Запуск всех тестов модуля
bun run scripts/build-and-test.sh
```

#### Запуск интеграционных тестов

```bash
# Запуск только интеграционных тестов с моками
bash scripts/test-integration.sh
```

#### Запуск тестов для Telegram-сцен

```bash
# Запуск тестов для Telegram-сцен
bash scripts/test-telegram-scenes.sh
```

#### Структура тестов

- `__tests__/unit/` - модульные тесты отдельных компонентов
  - `__tests__/unit/adapters/` - тесты для адаптеров хранилища
  - `__tests__/unit/scenes/` - тесты для Telegram-сцен
  - `__tests__/unit/utils/` - тесты для утилит
- `__tests__/integration/` - интеграционные тесты взаимодействия компонентов
- `__tests__/mocks/` - мок-сервисы для тестирования
- `__tests__/helpers/` - вспомогательные инструменты для тестирования
  - `__tests__/helpers/telegram/` - фреймворк для тестирования Telegram-сцен

#### Фреймворк для тестирования Telegram-сцен

Для тестирования Telegram-сцен в проекте разработан специальный фреймворк, который упрощает создание и поддержку тестов. Фреймворк предоставляет инструменты для создания моков, тестирования обработчиков и проверки состояния сцены.

Подробная документация по фреймворку доступна в следующих файлах:

- [Общая документация по тестированию](./src/__tests__/README.md) - структура тестов, инструменты, команды и паттерны
- [Паттерны тестирования Telegram-сцен](./src/__tests__/TESTING_PATTERNS.md) - подробное описание паттернов тестирования сцен
- [Фреймворк для тестирования Telegram-сцен](./src/__tests__/helpers/telegram/README.md) - документация по фреймворку для тестирования сцен
- [Паттерны для Wizard-сцен](./docs/WIZARD_SCENE_PATTERNS.md) - подробное описание паттернов для создания и поддержки Wizard-сцен
- [Архитектура Wizard-сцен](./docs/WIZARD_SCENE_ARCHITECTURE.md) - описание архитектуры Wizard-сцен после рефакторинга
- [История успеха с Wizard-сценами](./docs/SUCCESS_HISTORY_WIZARD_SCENES.md) - примеры решения конкретных проблем с Wizard-сценами
- [Чек-лист для рефакторинга Wizard-сцен](./docs/WIZARD_SCENE_REFACTORING_CHECKLIST.md) - пошаговый чек-лист для рефакторинга существующих Wizard-сцен

#### Пример теста для Telegram-сцены

```typescript
import { describe, it, expect, beforeEach } from "bun:test";
import { SceneTester, generateEnterHandlerTests } from "../../helpers/telegram";
import { ProjectScene } from "../../../scenes/project-scene";

describe("ProjectScene - Enter Handler", () => {
  // Создаем тестер сцены
  const sceneTester = new SceneTester({
    sceneName: "ProjectScene",
    sceneFilePath: "../../../scenes/project-scene",
    sceneConstructor: ProjectScene
  });

  // Генерируем тесты для обработчика входа в сцену
  generateEnterHandlerTests(sceneTester);
});
```

#### Пример интеграционного теста

```typescript
import { describe, it, expect, beforeAll, afterAll } from "bun:test"
import { SqliteAdapter } from "../../adapters/sqlite-adapter"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dbPath =
  process.env.SQLITE_DB_PATH ||
  path.resolve(__dirname, "../../.dev/test-sqlite.db")

describe("SQLite Adapter - Интеграционный тест", () => {
  let adapter: SqliteAdapter

  beforeAll(async () => {
    // Проверяем, что тестовая база данных существует
    expect(fs.existsSync(dbPath)).toBe(true)

    // Инициализируем адаптер
    adapter = new SqliteAdapter({ dbPath })
    await adapter.connect()
  })

  afterAll(async () => {
    // Закрываем соединение с базой данных
    await adapter.disconnect()
  })

  it("должен получать список проектов", async () => {
    const projects = await adapter.getProjects(1) // ID пользователя
    expect(Array.isArray(projects)).toBe(true)
    expect(projects.length).toBeGreaterThan(0)
  })
})
```

### Визуальная панель разработки

Для удобства разработки создана визуальная веб-панель, которая позволяет управлять процессом разработки и тестирования.

```bash
# Запуск веб-интерфейса разработки
bun run scripts/dev-dashboard.ts
```

Веб-панель доступна по адресу: http://localhost:3456 и предоставляет следующие функции:

- Просмотр статуса системы
- Управление базой данных
- Генерация тестовых данных
- Запуск тестов
- Просмотр логов

## Доступные инструменты

### Скрипты

- `init-dev-db.ts` - Инициализация базы данных SQLite
- `dev-dashboard.ts` - Запуск панели разработки
- `build-and-test.sh` - Сборка и тестирование модуля
- `test-integration.sh` - Запуск интеграционных тестов
- `test-telegram-scenes.sh` - Запуск тестов для Telegram-сцен
- `generate-telegram-tests.ts` - Генерация тестов для Telegram-сцен

### Адаптеры и сервисы

- `SqliteAdapter` - Адаптер для работы с SQLite
- `MockApifyService` - Мок-сервис для Apify API

### Инструменты для тестирования

- `SceneTester` - Класс для тестирования Telegram-сцен
- `SceneSequenceTester` - Класс для тестирования последовательностей действий
- `createMockContext` - Функция для создания мокированного контекста Telegraf
- `createMockAdapter` - Функция для создания мокированного адаптера хранилища
- `generateEnterHandlerTests` - Функция для генерации тестов обработчика входа в сцену
- `generateActionHandlerTests` - Функция для генерации тестов обработчиков действий
- `generateTextHandlerTests` - Функция для генерации тестов обработчиков текстовых сообщений

## Структура кода

```
instagram-scraper-bot/
├── .dev/                    # Директория для локальной разработки (создается автоматически)
│   ├── sqlite.db            # SQLite база данных
│   └── dev.log              # Лог-файл разработки
├── adapters/                # Адаптеры для хранилищ данных
│   ├── sqlite-adapter.ts    # SQLite адаптер для локальной разработки
│   └── ...
├── services/                # Сервисы для работы с внешними API
│   ├── mock-apify-service.ts # Мок-сервис для Apify API
│   └── ...
├── scripts/                 # Скрипты для разработки и тестирования
│   ├── build-and-test.sh    # Скрипт сборки и тестирования
│   ├── dev-dashboard.ts     # Панель разработчика
│   ├── init-dev-db.ts       # Инициализация базы данных
│   └── test-integration.sh  # Запуск интеграционных тестов
├── __tests__/               # Тесты
│   ├── unit/                # Модульные тесты
│   └── integration/         # Интеграционные тесты
└── types.ts                 # Типы данных
```

## Отладка

### Логирование

Модуль использует консольное логирование для отслеживания важных событий. В режиме разработки логирование более подробное:

```typescript
if (process.env.TEST_MODE === "true") {
  console.log("[DEBUG]", message)
}
```

### Диагностика проблем с базой данных

Для отладки SQLite базы данных можно использовать SQLite браузер или просто вывести содержимое таблиц:

```bash
# Просмотр содержимого базы данных
sqlite3 .dev/sqlite.db "SELECT * FROM Users;"
```

Также можно использовать скрипт для диагностики:

```typescript
// Просмотр содержимого таблицы
db.all("SELECT * FROM Users").then(results => console.table(results))
```

### Отладка мок-сервисов

Для проверки работы мок-сервисов можно использовать отдельный скрипт:

```typescript
import { MockApifyService } from "./services/mock-apify-service"

async function testMocks() {
  const service = new MockApifyService()
  const results = await service.getReelsByHashtag("красота", {
    maxResults: 5,
    minViews: 50000,
  })

  console.log(JSON.stringify(results, null, 2))
}

testMocks().catch(console.error)
```

## Часто возникающие проблемы

### Проблема: Не удается подключиться к базе данных SQLite

**Решение**: Проверьте путь к файлу базы данных и убедитесь, что директория `.dev` существует:

```bash
mkdir -p .dev
```

### Проблема: TypeScript не может найти модули

**Решение**: Убедитесь, что в tsconfig.json правильно настроены пути:

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Проблема: Ошибки при запуске тестов

**Решение**: Возможно, не установлены все зависимости:

```bash
bun install vitest @types/node
```

Или не настроены правильно переменные окружения:

```bash
export TEST_MODE=true
export NEON_DATABASE_URL=sqlite:///.dev/sqlite.db
```

### Проблема: Ошибка типов в SQLite адаптере

**Решение**: Проверьте типы параметров в методе saveReel:

```typescript
// Для решения ошибки типизации при вызове query.run с параметрами
const params: any[] = [
  reel.project_id,
  reel.source_type,
  // другие параметры
]
const result = query.run(...params)
```

## 🔌 Интеграции и зависимости

- **Bun:** Среда выполнения JavaScript/TypeScript
- **SQLite:** Локальная база данных для разработки
- **PostgreSQL (Neon DB):** Продакшн база данных
- **Apify API:** Парсинг данных из Instagram
- **Telegraf:** Фреймворк для Telegram Bot API

## 📃 Схема базы данных

Основные таблицы:

- `Users` - Пользователи бота
- `Projects` - Проекты мониторинга
- `Competitors` - Аккаунты конкурентов для мониторинга
- `Hashtags` - Хэштеги для мониторинга
- `ReelsContent` - Сохраненный контент из Instagram Reels
