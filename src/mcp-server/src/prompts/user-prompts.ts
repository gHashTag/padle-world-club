/**
 * MCP Prompts for User operations
 */

import { z } from "zod";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

/**
 * Register User prompts with MCP server
 */
export function registerUserPrompts(server: McpServer) {

  // User registration prompt
  server.prompt(
    "user-registration",
    {
      firstName: z.string(),
      lastName: z.string(),
      email: z.string().email(),
      username: z.string().optional(),
      userRole: z.string().optional()
    },
    ({ firstName, lastName, email, username, userRole }) => ({
      messages: [{
        role: "user",
        content: {
          type: "text",
          text: `Помоги мне создать нового пользователя в системе Padle World Club со следующими данными:

Имя: ${firstName}
Фамилия: ${lastName}
Email: ${email}
Username: ${username || 'автоматически сгенерировать'}
Роль: ${userRole || 'member'}

Пожалуйста:
1. Проверь, что email уникален в системе
2. Если username не указан, сгенерируй его на основе имени и фамилии
3. Создай безопасный временный пароль
4. Установи начальный рейтинг 1500
5. Сгенерируй уникальный member ID
6. Создай пользователя с помощью инструмента create_user

Используй инструменты MCP для выполнения этих операций.`
        }
      }]
    })
  );

  // User profile analysis prompt
  server.prompt(
    "user-profile-analysis",
    {
      userId: z.string().uuid()
    },
    ({ userId }) => ({
      messages: [{
        role: "user",
        content: {
          type: "text",
          text: `Проанализируй профиль пользователя с ID: ${userId}

Пожалуйста:
1. Получи полную информацию о пользователе
2. Проанализируй его активность и статус
3. Оцени полноту профиля (заполненные поля)
4. Дай рекомендации по улучшению профиля
5. Проверь, нужна ли верификация аккаунта

Используй ресурс user://profile/${userId} и инструменты MCP для получения данных.`
        }
      }]
    })
  );

  // User search and comparison prompt
  server.prompt(
    "user-search-compare",
    {
      searchTerm: z.string(),
      compareWith: z.string().optional()
    },
    ({ searchTerm, compareWith }) => ({
      messages: [{
        role: "user",
        content: {
          type: "text",
          text: `Найди пользователя по запросу: "${searchTerm}"

${compareWith ? `Также найди пользователя: "${compareWith}" и сравни их профили.` : ''}

Пожалуйста:
1. Попробуй найти пользователя по username, email или имени
2. Покажи основную информацию о найденном пользователе
3. ${compareWith ? 'Сравни рейтинги, роли и активность пользователей' : 'Покажи статистику активности'}
4. Дай рекомендации по взаимодействию с пользователем

Используй инструменты поиска MCP для выполнения операций.`
        }
      }]
    })
  );

  // User management prompt
  server.prompt(
    "user-management",
    {
      action: z.enum(["promote", "demote", "verify", "suspend", "update_rating"]),
      userId: z.string().uuid(),
      newValue: z.string().optional(),
      reason: z.string().optional()
    },
    ({ action, userId, newValue, reason }) => ({
      messages: [{
        role: "user",
        content: {
          type: "text",
          text: `Выполни действие "${action}" для пользователя с ID: ${userId}

${newValue ? `Новое значение: ${newValue}` : ''}
${reason ? `Причина: ${reason}` : ''}

Пожалуйста:
1. Сначала получи текущую информацию о пользователе
2. Проверь права доступа для выполнения действия
3. Выполни соответствующее обновление:
   - promote: повысить роль пользователя
   - demote: понизить роль пользователя
   - verify: подтвердить аккаунт пользователя
   - suspend: заблокировать пользователя
   - update_rating: обновить рейтинг пользователя
4. Подтверди выполнение действия
5. Запиши изменения в логи

Используй инструменты MCP для безопасного выполнения операций.`
        }
      }]
    })
  );

  // User statistics report prompt
  server.prompt(
    "user-stats-report",
    {
      reportType: z.string().optional(),
      period: z.string().optional()
    },
    ({ reportType, period }) => ({
      messages: [{
        role: "user",
        content: {
          type: "text",
          text: `Создай отчет по пользователям типа "${reportType || 'overview'}" за период "${period || 'all'}"

Пожалуйста:
1. Получи статистику пользователей из ресурса users://stats
2. Получи список всех пользователей
3. Проанализируй данные в зависимости от типа отчета:
   - overview: общая статистика и ключевые метрики
   - detailed: подробная информация по каждому пользователю
   - roles: распределение пользователей по ролям
   - activity: анализ активности пользователей
4. Создай визуальное представление данных (таблицы, списки)
5. Дай рекомендации по управлению пользователями

Используй ресурсы и инструменты MCP для получения актуальных данных.`
        }
      }]
    })
  );

  // User onboarding prompt
  server.prompt(
    "user-onboarding",
    {
      userId: z.string(),
      onboardingStep: z.string().optional()
    },
    ({ userId, onboardingStep }) => ({
      messages: [{
        role: "user",
        content: {
          type: "text",
          text: `Помоги пользователю с ID ${userId} пройти этап онбординга: "${onboardingStep || 'welcome'}"

Пожалуйста:
1. Получи информацию о пользователе
2. Проверь текущий статус его профиля
3. В зависимости от этапа онбординга:
   - welcome: приветствие и объяснение системы
   - profile_setup: помощь в заполнении профиля
   - venue_selection: выбор домашней площадки
   - first_booking: помощь в первом бронировании
4. Дай персонализированные рекомендации
5. Предложи следующие шаги

Используй инструменты MCP для получения данных и обновления профиля.`
        }
      }]
    })
  );
}
