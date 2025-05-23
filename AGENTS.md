# AGENTS.md - Руководство для AI-Ассистентов (Codex-like)

Этот файл содержит инструкции и соглашения для AI-агентов, помогающих в разработке проекта "Padle World Club Bot".
Цель - обеспечить эффективное взаимодействие и высокое качество генерируемого кода и предложений.

## 🕉️ Обзор Проекта и Ключевые Технологии

- **Проект:** Telegram-бот для сети паддл-центров "Padle World Club".
- **Основной язык:** TypeScript.
- **Среда выполнения:** Node.js с использованием Bun.
- **База данных:** PostgreSQL (с Neon) через Drizzle ORM.
- **Тестирование:** Vitest (запускается через `bun test` или в рамках TDD-цикла).
- **Основной фреймворк для бота:** Telegraf.
- **Стиль кода:** ESLint и Prettier (проверка через `bun run lint` и `bun run format`).
- **Управление задачами и планом:** `.cursor/rules/current_task.mdc`.
- **История успехов и регрессий:** `SUCCESS_HISTORY.md`, `REGRESSION_PATTERNS.md`.

## 🧘‍♂️ Философия Взаимодействия

1.  **TDD (Разработка Через Тестирование):** Является основой.
    - Сначала пишется падающий тест (🔴).
    - Затем пишется минимальный код для прохождения теста (✅).
    - Затем код рефакторится (♻️).
    - **Используйте `bash scripts/tdd-cycle.sh <путь_к_тестовому_файлу>` для этого цикла.**
2.  **Чистота Типов:** **Обязательна** проверка типов (`bun run typecheck`) после каждого изменения кода.
3.  **Малые, Фокусированные Изменения:** Предпочитайте небольшие, атомарные коммиты и PR.
4.  **Контекст – это всё:** Предоставляйте как можно больше контекста при постановке задачи (пути к файлам, фрагменты кода, ссылки на `current_task.mdc`).
5.  **Проверка и Адаптация:** Сгенерированный код **всегда** требует проверки и возможной доработки.

## 🚀 Как Агенту Работать в Этом Репозитории

### 1. Структура Проекта (Ключевые Директории)

- `src/`: Основной исходный код.
  - `src/db/`: Все, что связано с базой данных.
    - `src/db/schema/`: Drizzle схемы таблиц и enums.
    - `src/db/schema.ts`: Главный файл экспорта схем.
  - `src/__tests__/`: Тесты.
    - `src/__tests__/integration/`: Интеграционные тесты.
    - `src/__tests__/unit/`: Модульные тесты.
  - `src/bot/`: Логика Telegram-бота (сцены, команды, обработчики).
  - `src/services/`: Бизнес-логика, сервисные классы.
  - `src/utils/`: Общие утилиты.
- `scripts/`: Скрипты для автоматизации (включая `tdd-cycle.sh`).
- `drizzle_migrations/`: Миграции базы данных.
- `.cursor/rules/`: Правила и контекст для AI-ассистентов (включая `current_task.mdc`).
- `AGENTS.md`: Этот файл.

### 2. Установка и Настройка Среды

- **Менеджер пакетов:** `bun`.
- **Установка зависимостей:** `bun install`.
- **Переменные окружения:** Управляются через `.env` (пример в `.env.example`). Для тестов может использоваться `DATABASE_URL_TEST`.
- **Ключевые скрипты в `package.json`:**
  - `bun run typecheck`: Проверка типов TypeScript.
  - `bun run lint`: Запуск ESLint.
  - `bun run format`: Запуск Prettier.
  - `bun test`: Запуск тестов Vitest.
  - `bun run db:generate`: Генерация миграций Drizzle (`bunx drizzle-kit generate`).
  - `bun run db:migrate`: Применение миграций Drizzle (`bunx drizzle-kit migrate`).

### 3. Проверка Изменений (Линтинг, Тесты)

- **Перед коммитом/PR всегда выполняйте:**
  1.  `bun run typecheck`
  2.  `bun run lint`
  3.  `bun test` (или через `scripts/tdd-cycle.sh`, что предпочтительнее для разработки фич).
- **Убедитесь, что все проверки проходят успешно.**

### 4. Стиль Кода и Соглашения

- Следуйте конфигурациям ESLint и Prettier.
- Именование:
  - `camelCase` для переменных и функций.
  - `PascalCase` для классов, типов, интерфейсов, enums.
  - `kebab-case` для имен файлов и директорий.
- Комментарии: JSDoc для публичных функций и классов. Пишите комментарии на русском языке, если они объясняют сложную логику. Код должен быть самодокументируемым там, где это возможно.
- Импорты: Используйте относительные пути или алиасы, если настроены (пока не настроены).

### 5. Как Агент Должен Выполнять и Представлять Свою Работу

- **Задачи на изменение кода:**
  - Всегда работайте в новой ветке (`feat/...`, `fix/...`, `refactor/...`).
  - Предоставляйте изменения в виде diff или готового PR.
  - В описании PR четко указывайте, какая задача решена и как это было сделано. Ссылайтесь на `current_task.mdc`.
- **Задачи на анализ или предложения ("Ask mode"):**
  - Формулируйте ответы четко и структурировано.
  - Приводите примеры кода, если это уместно.
  - Ссылайтесь на конкретные файлы и строки кода.
- **Документация:**
  - При добавлении новой функциональности или изменении существующей, обновляйте JSDoc и, при необходимости, релевантные `.md` файлы (например, `README.md`, `DEVELOPMENT.md`).
- **Изучение контекста:**
  - Всегда начинайте с изучения `current_task.mdc`.
  - Просматривайте `SUCCESS_HISTORY.md` и `REGRESSION_PATTERNS.md` для поиска релевантных паттернов или избегания прошлых ошибок.
  - Анализируйте существующий код в репозитории для понимания стиля и используемых подходов.

## 💡 Примеры Запросов к Агенту (Codex-like)

### Ask mode (анализ, предложения, без изменения кода)

- **Рефакторинг:**
  - "Проанализируй файл `src/services/bookingService.ts`. Предложи способы его декомпозиции на более мелкие модули. На какие аспекты стоит обратить внимание для улучшения тестируемости?"
  - "В файле `src/bot/scenes/bookingScene.ts` есть повторяющаяся логика обработки пользовательского ввода. Можешь предложить паттерн для ее вынесения в утилиту?"
- **Вопросы и понимание архитектуры:**
  - "Опиши и создай mermaid.js диаграмму для процесса регистрации нового пользователя, начиная от команды `/start` в Telegram и заканчивая записью в БД."
  - "Какие основные зависимости у модуля `src/db/schema/user.ts`? Как он связан с другими частями системы?"
- **Поиск проблем:**
  - "Есть подозрение на утечку памяти при обработке сообщений в Telegraf. Какие общие паттерны могут к этому приводить в контексте нашего стека? На что обратить внимание при аудите кода?"

### Code mode (активное изменение кода, подготовка PR)

- **Безопасность:**
  - "Проведи аудит функции `handlePayment` в `src/services/paymentService.ts` на предмет потенциальных уязвимостей при обработке внешних данных. Если найдешь, предложи исправления."
- **Ревью кода (можно передать diff):**
  - "Проревьюй этот diff для PR #123 (ссылка или сам diff). Какие улучшения ты можешь предложить по стилю, логике или покрытию тестами?"
  - ```
    Please review my code and suggest improvements. The diff is below:
    <diff_content>
    ```
- **Добавление тестов:**
  - "Для файла `src/utils/dateUtils.ts` отсутствуют тесты для функции `formatDateRange`. Напиши полный набор Vitest тестов, покрывающий основные и граничные случаи. Убедись, что тесты соответствуют нашему TDD-стилю."
  - (После реализации фичи) "Я добавил новую команду `/mycommand` в `src/bot/commands/myCommand.ts`. Напиши интеграционные тесты для нее, проверяющие основной сценарий и обработку ошибок."
- **Исправление багов (можно предоставить stack trace):**
  - "При выполнении этой операции возникает ошибка: `<stack_trace>`. Предположительно, проблема в `src/services/notificationService.ts`. Найди и исправь баг."
- **Реализация фич по описанию:**
  - "В `current_task.mdc` описана задача: 'Добавить возможность отмены бронирования пользователем'. Реализуй эту функциональность в `src/services/bookingService.ts` и соответствующую команду/обработчик в боте. Не забудь добавить тесты."

## 🔧 Настройка Среды (для Информации)

- **Базовый образ:** Агенты обычно работают в стандартных контейнерах (например, `openai/codex-universal`).
- **Установка зависимостей:** В нашем проекте все зависимости управляются через `bun install`. Если агент работает в среде, где нужно установить их заново, эта команда должна быть выполнена.
- **Скрипты настройки:** Если агент поддерживает `setup scripts`, они должны включать как минимум `bun install`.
  ```bash
  # Example setup script for an agent's environment
  echo "Setting up environment for Padle World Club Bot..."
  # Ensure bun is available (might be pre-installed in the agent's base image)
  # Install dependencies
  bun install
  echo "Dependencies installed."
  # Optionally, run typecheck to ensure a clean state, though agent might do this later
  # bun run typecheck
  echo "Environment setup complete."
  ```
- **Доступ в Интернет:** Обычно ограничен. Зависимости должны быть установлены на этапе `setup`.

## 🔄 Итеративный Подход и Декомпозиция

- **Разбивайте большие задачи:** Сложные задачи лучше разбить на несколько более мелких итеративных запросов. Можно даже попросить агента помочь с декомпозицией.
- **Уточняйте:** Если результат не соответствует ожиданиям, уточните промпт, добавьте больше контекста или примеров.
- **Используйте для отладки:** Вставляйте логи ошибок или трассировки стека, чтобы помочь агенту локализовать проблему.

---

Следуйте этому руководству, и да пребудет с нами чистый код и зеленые тесты! Ом Шанти. 🙏
