# 🕉️ Стратегия E2E Тестирования Telegram Бота

**Принцип:** Для обеспечения корректной работы пользовательских сценариев взаимодействия с ботом, мы используем E2E (End-to-End) тесты. Эти тесты имитируют действия пользователя и проверяют ответы бота, включая сообщения и inline-клавиатуры.

## Выбранный Подход: Симуляция API Telegraf

Вместо использования реальных Telegram API и создания отдельных тестовых ботов/пользователей, мы применяем подход **симуляции API Telegraf**.

**Как это работает:**

1.  **Импорт Бота:** В тестовых файлах (`__tests__/e2e/**/*.e2e.test.ts`) мы импортируем реальный экземпляр нашего `bot` из `src/index.ts`.
2.  **Мокирование Telegram API:** Перед каждым тестом мы используем `vi.mock` или `jest.fn()` (из `bun:test` или `vitest`) для мокирования методов объекта `bot.telegram` (например, `sendMessage`, `editMessageText`, `answerCbQuery`, `deleteMessage` и т.д.). Это позволяет нам перехватывать вызовы, которые бот пытается сделать к Telegram API.
3.  **Мокирование Зависимостей:** Важные зависимости, такие как адаптер базы данных (`NeonAdapter`), также мокируются (`vi.mock`) на уровне модуля, чтобы контролировать их поведение в тестах (например, возвращать предопределенные данные пользователя или проектов) без реальных обращений к БД.
4.  **Симуляция Входящих Обновлений:** Мы создаем объекты `Update` (типы из `telegraf/types`), имитирующие сообщения или действия пользователя (например, отправка команды `/start`, нажатие кнопки с `callback_data`).
5.  **Обработка Обновлений:** Мы передаем созданный объект `Update` в метод `await bot.handleUpdate(mockUpdate)`. Этот метод запускает всю внутреннюю логику Telegraf и нашего бота (middleware, сцены, обработчики) для данного обновления.
6.  **Проверка Результатов:** После вызова `bot.handleUpdate()`, мы проверяем:
    - Какие методы мокированного `bot.telegram` были вызваны.
    - С какими аргументами они были вызваны (текст сообщения, `chat_id`, структура `reply_markup` для клавиатур).
    - Как были вызваны мокированные зависимости (например, правильные ли ID переданы в адаптер БД).

**Преимущества:**

- **Скорость:** Тесты выполняются быстро, так как нет реальных сетевых запросов к Telegram.
- **Независимость:** Не требуется отдельный токен бота, номер телефона для тестового пользователя или поднятая инфраструктура.
- **Интеграция:** Легко встраивается в существующий процесс CI/CD с использованием Vitest/Bun.
- **Контроль:** Полный контроль над состоянием БД (через моки адаптера) и ответами API.

**Недостатки:**

- **Не 100% E2E:** Не тестируется реальная доставка сообщений через Telegram API и возможные проблемы на стороне Telegram.
- **Поддержка Моков:** Необходимо поддерживать актуальность моков `bot.telegram` в соответствии с используемыми методами Telegraf.

## Минимальный Пример (`__tests__/e2e/01_initial_interaction.e2e.test.ts`)

```typescript
import { describe, it, expect, beforeEach, vi } from "vitest";
import { bot } from "../../src/index"; // Импортируем наш инстанс бота
import { Update } from "telegraf/types"; // Типы для Update
import { ScraperSceneStep, USER_ID_FOR_TESTING } from "../../src/types";
import { mockUser } from "../unit/scenes/mockData";
import { NeonAdapter } from "../../src/adapters/neon-adapter";

// Мокируем NeonAdapter
vi.mock("../../src/adapters/neon-adapter", () => {
  const NeonAdapterMock = vi.fn().mockImplementation(() => ({
    // ... моки методов адаптера ...
    findUserByTelegramIdOrCreate: vi.fn(),
    getProjectsByUserId: vi.fn(),
    // ... другие методы ...
  }));
  return { NeonAdapter: NeonAdapterMock };
});

describe("E2E: Initial Bot Interaction", () => {
  let mockSendMessage: ReturnType<typeof vi.fn>;
  // ... другие моки для editMessageText, answerCbQuery ...

  const mockChatId = 12345;
  const mockUserId = USER_ID_FOR_TESTING;

  beforeEach(() => {
    // Пересоздаем моки Telegram API
    mockSendMessage = vi.fn();
    bot.telegram.sendMessage = mockSendMessage;
    // ... присвоение других моков bot.telegram ...

    // Сбрасываем и настраиваем моки NeonAdapter
    const MockedNeonAdapter = NeonAdapter as ReturnType<typeof vi.fn>;
    const mockAdapterInstance = MockedNeonAdapter.mock.instances[0];
    if (mockAdapterInstance) {
      Object.values(mockAdapterInstance).forEach((mockFn) => {
        if (typeof mockFn === "function" && "mockClear" in mockFn) {
          (mockFn as ReturnType<typeof vi.fn>).mockClear();
        }
      });
      mockAdapterInstance.findUserByTelegramIdOrCreate.mockResolvedValue(
        mockUser
      );
      mockAdapterInstance.getProjectsByUserId.mockResolvedValue([]); // Нет проектов
    }
  });

  it("should respond to /start command for a new user (no projects)", async () => {
    // 1. Создаем фейковое обновление
    const mockUpdate: Update.MessageUpdate = {
      update_id: 1,
      message: {
        /* ... данные сообщения /start ... */
      },
    };

    // 2. Обрабатываем обновление
    await bot.handleUpdate(mockUpdate);

    // 3. Проверяем вызовы моков
    const mockAdapterInstance = (NeonAdapter as any).mock.instances[0];
    expect(mockAdapterInstance.findUserByTelegramIdOrCreate).toHaveBeenCalled();
    expect(mockAdapterInstance.getProjectsByUserId).toHaveBeenCalled();

    expect(mockSendMessage).toHaveBeenCalledTimes(1);
    const [chatIdArg, textArg, extraArg] = mockSendMessage.mock.calls[0];
    expect(chatIdArg).toBe(mockChatId);
    expect(textArg).toContain("У вас еще нет проектов.");
    expect(extraArg.reply_markup.inline_keyboard[0][0].text).toBe(
      "Создать проект"
    );
    // ... другие проверки ...
  });
});
```

## Запуск E2E Тестов

Предполагается, что E2E тесты будут запускаться вместе с остальными тестами командой `bun test` или `pnpm test`, если они находятся в директории, которую Vitest сканирует по умолчанию (`__tests__`).

Если потребуется запускать их отдельно, можно настроить отдельный скрипт в `package.json` или использовать фильтры Vitest:

```bash
# Запуск только E2E тестов (пример)
bun test --test-path-pattern=__tests__/e2e
# или
bun test e2e
```

_Ом Шанти. Пусть наши тесты будут ясными и надежными, как восход солнца._
