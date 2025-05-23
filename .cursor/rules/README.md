# 🧩 Архитектура и правила для агентов

Этот документ содержит основные принципы, архитектуру и правила разработки Telegram ботов на нашем стеке технологий.

## 🚀 Используемые технологии

- **TypeScript**: основной язык разработки.
- **Telegraf**: библиотека для работы с Telegram Bot API.
- **Drizzle ORM**: ORM для работы с PostgreSQL (включая Neon).
- **Neon Database**: облачная serverless PostgreSQL база данных.
- **Apollo Client**: библиотека для работы с GraphQL API.
- **Vitest**: фреймворк для тестирования.
- **Bun**: быстрый JavaScript-рантайм для разработки и сборки.
- **Zod**: библиотека для валидации данных.

## 📁 Структура проекта

```
telegram-bot-starter-kit/
├── .cursor/rules/         # Правила и инструкции для AI-агентов (самое важное!)
│   ├── README.md          # Этот файл - общая навигация для агентов
│   ├── AGENT_Coder.mdc    # Инструкции для агента-кодера
│   ├── AGENT_Tester.mdc   # Инструкции для агента-тестера
│   └── current_task.mdc   # Пример файла для отслеживания текущей задачи
├── docs/                  # Дополнительная человекочитаемая документация
├── drizzle_migrations/    # Сгенерированные миграции Drizzle
├── example.env            # Пример файла переменных окружения
├── scripts/               # Скрипты для автоматизации (генерация сцен, TDD-цикл)
├── src/
│   ├── adapters/          # Адаптеры хранилища (Storage Adapters)
│   ├── db/                # Drizzle ORM: схемы, подключение, утилиты
│   ├── graphql/           # Apollo Client: подключение, запросы
│   ├── middlewares/       # Middleware для Telegraf (обработчик ошибок)
│   ├── scenes/            # Логика Wizard-сцен (если вынесены из шаблонов)
│   ├── templates/         # Шаблоны (например, wizard-scene-template.ts)
│   ├── utils/             # Утилиты (logger, validation, etc.)
│   ├── __tests__/         # Тесты (unit, integration, e2e)
│   ├── commands.ts        # Регистрация команд бота (/start, /help, etc.)
│   ├── config.ts          # Конфигурация приложения (загрузка из .env)
│   └── types.ts           # Основные типы TypeScript
├── .gitignore
├── README.md              # Главный README проекта для пользователей
├── bun.lockb
├── drizzle.config.ts      # Конфигурация Drizzle Kit для миграций
├── index.ts               # Главная точка входа приложения и экспорты для библиотеки
├── package.json           # Зависимости и скрипты
├── tsconfig.json          # Настройки TypeScript
└── vitest.config.ts       # Настройки Vitest для тестирования
```

## 🎯 Ключевые файлы для агентов

1.  **`.cursor/rules/README.md` (этот файл)**: Ваша стартовая точка. Описывает общие принципы.
2.  **`.cursor/rules/AGENT_Coder.mdc`**: Подробные инструкции по написанию кода.
3.  **`.cursor/rules/AGENT_Tester.mdc`**: Подробные инструкции по написанию тестов.
4.  **`src/config.ts`**: Как работает конфигурация, какие переменные доступны.
5.  **`index.ts`**: Как инициализируется и запускается бот, как регистрируются компоненты.
6.  **`src/db/schema.ts`**: Определение таблиц базы данных.
7.  **`src/db/index.ts`**: Инициализация подключения к БД и экспорт `db` инстанса.
8.  **`src/graphql/client.ts`**: Инициализация Apollo Client и экспорт `apolloClient` инстанса.
9.  **`src/templates/wizard-scene-template.ts`**: Пример и основа для создания многошаговых диалогов.
10. **`package.json`**: Список доступных скриптов (`scripts` секция).
11. **`.cursor/rules/current_task.mdc`**: **Динамический рабочий журнал** (см. ниже).

### 🌟 Текущая Задача (`.cursor/rules/current_task.mdc`)

Файл `.cursor/rules/current_task.mdc` не является статичным правилом, а представляет собой **динамический рабочий журнал** агента. Он:

- Обновляется после каждого значимого шага.
- Отражает текущий прогресс, возникшие проблемы и следующий запланированный шаг.
- Служит основным инструментом для отслеживания выполнения задачи как для самого агента, так и для Гуру (наблюдателя).

**Перед началом любой работы агент ВСЕГДА обращается к этому файлу, чтобы понять текущий контекст.**

## ⚙️ Цикл разработки (TDD)

Всегда следуйте циклу "Тест -> Код -> Рефакторинг".

1.  **Осознание задачи**: Прочитайте `current_task.mdc`.
2.  **Написание теста (AGENT_Tester)**:
    - Создайте/откройте файл теста в `src/__tests__/`.
    - Напишите падающий тест, описывающий требуемую функциональность.
    - Используйте `bun run tdd <путь_к_тесту>` для запуска.
3.  **Написание кода (AGENT_Coder)**:
    - Напишите минимальный код в соответствующем модуле `src/` для прохождения теста.
    - Убедитесь, что `bun run typecheck` проходит без ошибок.
4.  **Проверка и Рефакторинг**:
    - Убедитесь, что все тесты проходят (`bun run test`).
    - Проведите рефакторинг кода и тестов для улучшения читаемости и производительности.
5.  **Обновление статуса**: Обновите `current_task.mdc`.

## ✅ Основные правила для агентов

1.  **Читайте документацию**: Начните с файлов в `.cursor/rules/`.
2.  **Проверка типов**: После каждого изменения кода -> `bun run typecheck`.
3.  **TDD**: Не пишите код без теста. Используйте `bun run tdd путь/к/тесту.ts`.
4.  **Именование**: `kebab-case.ts` для файлов, `camelCase` для переменных/функций, `PascalCase` для типов/интерфейсов/классов.
5.  **Комментарии**: JSDoc для функций и классов, поясняющие комментарии для сложной логики.
6.  **База данных**: Используйте Drizzle ORM. Схемы в `src/db/schema.ts`. Миграции через `bunx drizzle-kit generate` и `bunx drizzle-kit migrate`.
7.  **GraphQL**: Используйте Apollo Client из `src/graphql/client.ts`.
8.  **Telegram API**: Функциональный подход для сцен. Типизированный контекст `BaseBotContext`.
9.  **Логирование**: Централизованный логгер `src/utils/logger.ts`. Указывайте `LogType`.
10. **Обработка ошибок**: `try/catch`, централизованный `errorHandler`, логирование с контекстом.

## 🔄 Полезные команды (см. `package.json` для полного списка)

- `bun run dev`: Запуск с автоперезагрузкой.
- `bun run dev:fast`: Быстрый запуск.
- `bun run typecheck`: Проверка типов.
- `bun run test`: Запуск всех тестов.
- `bun run tdd <путь_к_тесту>`: TDD-цикл.
- `bun run lint`: Проверка стиля кода (если настроен ESLint).
- `bun run build:full`: Полная сборка проекта.
- `bun run start`: Запуск production-сборки.
- `bunx drizzle-kit generate`: Генерация миграций БД.
- `bunx drizzle-kit migrate`: Применение миграций БД.
- `bunx drizzle-kit studio`: Drizzle Studio (веб-интерфейс для БД).

## 📚 Дополнительная документация проекта

Содержимое папки `/docs` (например, `TESTING.md`, `PATTERNS.md`, `MIGRATION.md`) представляет собой **углубленные человекочитаемые руководства** по ключевым аспектам стартер-кита. Эти документы могут быть полезны для агентов для более глубокого понимания концепций и подходов, используемых в проекте. Агенты могут обращаться к ним для получения дополнительного контекста, но основные операционные инструкции содержатся в файлах `.cursor/rules/`.
