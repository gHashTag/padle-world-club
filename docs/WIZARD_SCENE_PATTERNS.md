# Паттерны для Wizard-сцен в Telegram боте

## Введение

Этот документ описывает проверенные паттерны для создания и поддержки Wizard-сцен в Telegram боте с использованием библиотеки Telegraf. Wizard-сцены позволяют создавать многошаговые диалоги с пользователем, где каждый шаг имеет свою логику и переходы между шагами.

## Основные принципы

1. **Регистрация обработчиков кнопок на уровне сцены**
   - Все обработчики кнопок должны быть зарегистрированы на уровне сцены, а не внутри шагов
   - Используйте `scene.action()` вместо `ctx.wizard.action()`
   - Для удобства используйте утилиту `registerButtons` для централизованной регистрации обработчиков

2. **Очистка состояния при переходах**
   - При переходе между шагами очищайте соответствующие части состояния, чтобы данные обновлялись
   - Особенно важно при возврате к предыдущим шагам
   - Используйте утилитную функцию `clearSessionState` для стандартизации очистки состояния

3. **Явное указание сцены при выходе**
   - При выходе из сцены явно указывайте, в какую сцену нужно перейти
   - Не полагайтесь на автоматический возврат
   - Используйте утилитную функцию `safeSceneTransition` для безопасного перехода между сценами

4. **Логирование для отладки**
   - Добавляйте подробное логирование для отслеживания состояния и переходов
   - Логируйте содержимое `ctx.wizard.state` на каждом шаге
   - Используйте структурированное логирование с указанием имени сцены и причины действий

5. **Стандартизация с помощью утилитных функций**
   - Создавайте и используйте утилитные функции для стандартизации общих операций
   - Это уменьшает дублирование кода и повышает надежность

## Шаблоны кода

### 1. Создание Wizard-сцены

```typescript
import { Scenes, Markup } from "telegraf";
import { ScraperBotContext } from "../types";

// Создание Wizard-сцены с указанным ID
export const myWizardScene = new Scenes.WizardScene<ScraperBotContext>(
  "my_wizard_scene_id",
  // Шаг 1
  async (ctx) => {
    console.log("[WIZARD] Шаг 1: Начало");
    ctx.wizard.state.data = {}; // Инициализация состояния
    await ctx.reply("Это первый шаг. Введите что-нибудь:");
    return ctx.wizard.next(); // Переход к следующему шагу
  },
  // Шаг 2
  async (ctx) => {
    console.log("[WIZARD] Шаг 2: Обработка ввода");
    // Проверка наличия текстового сообщения
    if (!ctx.message || !("text" in ctx.message)) {
      await ctx.reply("Пожалуйста, введите текст:");
      return; // Остаемся на текущем шаге
    }

    // Сохранение данных в состоянии
    ctx.wizard.state.data.input = ctx.message.text;

    // Отображение кнопок
    await ctx.reply(
      "Выберите действие:",
      Markup.inlineKeyboard([
        Markup.button.callback("Продолжить", "continue"),
        Markup.button.callback("Отмена", "cancel")
      ])
    );

    // Остаемся на текущем шаге, ожидая нажатия кнопки
    return;
  },
  // Шаг 3
  async (ctx) => {
    console.log("[WIZARD] Шаг 3: Завершение");
    await ctx.reply(`Вы ввели: ${ctx.wizard.state.data.input}`);

    // Отображение кнопок
    await ctx.reply(
      "Что дальше?",
      Markup.inlineKeyboard([
        Markup.button.callback("Начать заново", "restart"),
        Markup.button.callback("Выйти", "exit")
      ])
    );

    // Остаемся на текущем шаге, ожидая нажатия кнопки
    return;
  }
);

// Регистрация обработчиков кнопок НА УРОВНЕ СЦЕНЫ
myWizardScene.action("continue", async (ctx) => {
  console.log("[DEBUG] Обработчик кнопки 'continue' вызван");
  await ctx.answerCbQuery();
  return ctx.wizard.next(); // Переход к следующему шагу
});

myWizardScene.action("cancel", async (ctx) => {
  console.log("[DEBUG] Обработчик кнопки 'cancel' вызван");
  await ctx.answerCbQuery();
  await ctx.reply("Операция отменена.");

  // Очистка состояния перед выходом
  ctx.wizard.state = {};

  // Явный переход в другую сцену
  try {
    await ctx.scene.enter("main_menu_scene");
  } catch (error) {
    console.error("[ERROR] Ошибка при переходе в главное меню:", error);
    return ctx.scene.leave();
  }
});

myWizardScene.action("restart", async (ctx) => {
  console.log("[DEBUG] Обработчик кнопки 'restart' вызван");
  await ctx.answerCbQuery();

  // Очистка состояния перед перезапуском
  ctx.wizard.state = {};

  // Возврат к первому шагу
  return ctx.wizard.selectStep(0);
});

myWizardScene.action("exit", async (ctx) => {
  console.log("[DEBUG] Обработчик кнопки 'exit' вызван");
  await ctx.answerCbQuery();
  await ctx.reply("Вы вышли из мастера.");

  // Очистка состояния перед выходом
  ctx.wizard.state = {};

  // Явный переход в другую сцену
  try {
    await ctx.scene.enter("main_menu_scene");
  } catch (error) {
    console.error("[ERROR] Ошибка при переходе в главное меню:", error);
    return ctx.scene.leave();
  }
});

// Регистрация обработчика для выхода из сцены по команде
myWizardScene.command("exit", async (ctx) => {
  await ctx.reply("Вы вышли из мастера.");

  // Очистка состояния перед выходом
  ctx.wizard.state = {};

  // Явный переход в другую сцену
  try {
    await ctx.scene.enter("main_menu_scene");
  } catch (error) {
    console.error("[ERROR] Ошибка при переходе в главное меню:", error);
    return ctx.scene.leave();
  }
});

// Экспорт сцены
export default myWizardScene;
```

### 2. Обновление данных при возврате к предыдущему шагу

```typescript
// Обработчик кнопки "Вернуться к списку"
scene.action("back_to_list", async (ctx) => {
  console.log("[DEBUG] Обработчик кнопки 'back_to_list' вызван");
  await ctx.answerCbQuery();

  // Очищаем данные в состоянии, чтобы они были обновлены при переходе на шаг
  if (ctx.wizard && ctx.wizard.state) {
    delete ctx.wizard.state.items;
  }

  // Возвращаемся к шагу со списком
  return ctx.wizard.selectStep(1);
});
```

### 3. Утилитные функции для очистки состояния и переходов

```typescript
/**
 * Очищает состояние сессии перед выходом из сцены
 * @param ctx Контекст Telegraf
 * @param reason Причина очистки состояния (для логирования)
 */
function clearSessionState(ctx: ScraperBotContext, reason: string = "general"): void {
  if (ctx.scene.session) {
    logger.info(`[SceneName] Clearing session state before leaving (reason: ${reason})`);
    // Очистка всех необходимых полей состояния
    ctx.scene.session.filter = undefined;
    ctx.scene.session.page = 1;
    ctx.scene.session.currentItemId = undefined;
    // Для Wizard-сцен
    if (ctx.wizard && ctx.wizard.state) {
      ctx.wizard.state = {};
    }
  }
}

/**
 * Выполняет безопасный переход в другую сцену с обработкой ошибок
 * @param ctx Контекст Telegraf
 * @param targetScene Целевая сцена
 * @param reason Причина перехода (для логирования)
 */
async function safeSceneTransition(
  ctx: ScraperBotContext,
  targetScene: string = "main_menu_scene",
  reason: string = "general"
): Promise<void> {
  try {
    logger.info(`[SceneName] Transitioning to ${targetScene} scene (reason: ${reason})`);
    await ctx.scene.enter(targetScene);
  } catch (error) {
    logger.error(`[SceneName] Error entering ${targetScene} scene:`, error);
    await ctx.scene.leave();
  }
}

// Пример использования
myWizardScene.action("exit", async (ctx) => {
  logger.info(`[MyWizard] Обработчик кнопки 'exit' вызван`);
  await ctx.answerCbQuery();
  await ctx.reply("Вы вышли из мастера.");

  // Очистка состояния и безопасный переход в другую сцену
  clearSessionState(ctx, "exit_button_clicked");
  await safeSceneTransition(ctx, "main_menu_scene", "exit_button_clicked");
});
```

### 4. Загрузка данных из базы данных в шаге

```typescript
// Шаг для отображения списка элементов
async (ctx) => {
  console.log("[WIZARD] Шаг: Отображение списка");

  // Получаем данные из состояния
  const { projectId, projectName } = ctx.wizard.state;
  console.log(`[DEBUG] Получены данные из wizard.state: projectId=${projectId}, projectName=${projectName}`);

  // Если данные уже загружены, используем их
  if (!ctx.wizard.state.items) {
    try {
      // Загружаем данные из базы данных
      console.log(`[DEBUG] Загрузка элементов для проекта с ID: ${projectId}`);
      const items = await ctx.storage.getItemsByProjectId(projectId);

      // Сохраняем в состоянии
      ctx.wizard.state.items = items;
      console.log(`[DEBUG] Загружено элементов: ${items.length}`);
    } catch (error) {
      console.error(`[ERROR] Ошибка при загрузке элементов:`, error);
      await ctx.reply("Произошла ошибка при загрузке данных. Попробуйте еще раз.");
      return ctx.scene.leave();
    }
  }

  // Отображаем список
  const items = ctx.wizard.state.items;
  if (items.length === 0) {
    await ctx.reply(
      `Элементы для проекта "${projectName}" не найдены.`,
      Markup.inlineKeyboard([
        Markup.button.callback("➕ Добавить элемент", "add_item"),
        Markup.button.callback("❌ Выйти", "exit_wizard")
      ])
    );
  } else {
    // Формируем сообщение со списком
    let message = `🔍 Элементы для проекта "${projectName}":\n\n`;
    items.forEach((item, index) => {
      message += `${index + 1}. ${item.name}\n`;
    });

    await ctx.reply(
      message,
      Markup.inlineKeyboard([
        Markup.button.callback("➕ Добавить элемент", "add_item"),
        Markup.button.callback("🔄 Обновить список", "refresh_items"),
        Markup.button.callback("❌ Выйти", "exit_wizard")
      ])
    );
  }

  // Остаемся на текущем шаге
  return;
}
```

## Тестирование Wizard-сцен

Для тестирования Wizard-сцен рекомендуется создавать модульные тесты, которые проверяют:

1. Корректность регистрации обработчиков кнопок
2. Правильность переходов между шагами
3. Корректное обновление данных при возврате к предыдущим шагам
4. Правильную обработку выхода из сцены

Пример теста:

```typescript
import { describe, it, expect, jest, mock, beforeEach } from "bun:test";
import { myWizardScene } from "../scenes/my-wizard-scene";

describe("myWizardScene", () => {
  let ctx;

  beforeEach(() => {
    ctx = {
      reply: jest.fn().mockResolvedValue(undefined),
      answerCbQuery: jest.fn().mockResolvedValue(undefined),
      scene: {
        enter: jest.fn().mockResolvedValue(undefined),
        leave: jest.fn().mockResolvedValue(undefined),
      },
      wizard: {
        state: {},
        next: jest.fn().mockResolvedValue(undefined),
        selectStep: jest.fn().mockResolvedValue(undefined),
      },
      storage: {
        getItemsByProjectId: jest.fn().mockResolvedValue([]),
      },
    };
  });

  it("should handle 'back_to_list' button click", async () => {
    // Получаем обработчик кнопки
    const backToListHandler = myWizardScene.actions.find(
      action => action.action === "back_to_list"
    );

    // Проверяем, что обработчик существует
    expect(backToListHandler).toBeDefined();

    // Вызываем обработчик
    if (backToListHandler && backToListHandler.handler) {
      await backToListHandler.handler(ctx);
    }

    // Проверяем, что был вызван метод answerCbQuery
    expect(ctx.answerCbQuery).toHaveBeenCalled();

    // Проверяем, что был вызван метод selectStep с аргументом 1
    expect(ctx.wizard.selectStep).toHaveBeenCalledWith(1);
  });
});
```

## Заключение

Следуя этим паттернам, вы сможете создавать надежные и поддерживаемые Wizard-сцены для Telegram бота. Основные принципы:

1. Регистрируйте обработчики кнопок на уровне сцены с помощью `scene.action()` или `registerButtons`
2. Очищайте состояние при переходах между шагами с помощью функции `clearSessionState`
3. Явно указывайте сцену при выходе с помощью функции `safeSceneTransition`
4. Добавляйте подробное логирование для отладки с указанием имени сцены и причины действий
5. Используйте утилитные функции для стандартизации общих операций
6. Пишите тесты для проверки корректности работы сцены

Эти паттерны помогут вам избежать распространенных проблем с Wizard-сценами, таких как дублирование обработчиков, отсутствие обновления данных при переходах и зависание при выходе из сцены. Кроме того, они сделают ваш код более читаемым, поддерживаемым и надежным.
