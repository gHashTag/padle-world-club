# Padle World Club MCP Server

Model Context Protocol (MCP) server для работы с базой данных Padle World Club. Предоставляет инструменты, ресурсы и промпты для управления пользователями через агентов ИИ.

## 🚀 Возможности

### 🔧 Инструменты (Tools)
- `create_user` - Создание нового пользователя
- `get_user_by_id` - Получение пользователя по ID
- `get_user_by_username` - Получение пользователя по username
- `get_user_by_email` - Получение пользователя по email
- `update_user` - Обновление данных пользователя
- `delete_user` - Удаление пользователя
- `list_users` - Получение списка пользователей

### 📚 Ресурсы (Resources)
- `user://profile/{userId}` - Профиль пользователя
- `user://search/{username}` - Поиск пользователя по username
- `users://list` - Список всех пользователей
- `users://stats` - Статистика пользователей

### 💬 Промпты (Prompts)
- `user-registration` - Помощь в регистрации пользователя
- `user-profile-analysis` - Анализ профиля пользователя
- `user-search-compare` - Поиск и сравнение пользователей
- `user-management` - Управление пользователями
- `user-stats-report` - Отчеты по пользователям
- `user-onboarding` - Помощь в онбординге

## 📦 Установка

```bash
cd src/mcp-server
npm install
npm run build
```

## 🔧 Настройка

Установите переменную окружения для подключения к базе данных:

```bash
export DATABASE_URL="postgresql://user:password@host:port/database"
```

## 🚀 Запуск

### Режим разработки
```bash
npm run dev
```

### Продакшн
```bash
npm run build
npm start
```

### Как исполняемый файл
```bash
npx padle-mcp-server
```

## 🔗 Интеграция с Claude Desktop

Добавьте в конфигурацию Claude Desktop (`~/Library/Application Support/Claude/claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "padle-world-club": {
      "command": "node",
      "args": ["/path/to/padle-world-club/src/mcp-server/dist/index.js"],
      "env": {
        "DATABASE_URL": "postgresql://user:password@host:port/database"
      }
    }
  }
}
```

Или используя npx:

```json
{
  "mcpServers": {
    "padle-world-club": {
      "command": "npx",
      "args": ["-y", "@padle-world-club/mcp-server"],
      "env": {
        "DATABASE_URL": "postgresql://user:password@host:port/database"
      }
    }
  }
}
```

## 📖 Примеры использования

### Создание пользователя
```
Создай нового пользователя с именем "Иван Петров", email "ivan@example.com", username "ivan_petrov", роль "member"
```

### Поиск пользователя
```
Найди пользователя с username "ivan_petrov" и покажи его профиль
```

### Анализ пользователей
```
Покажи статистику всех пользователей и создай отчет по ролям
```

### Обновление пользователя
```
Обнови рейтинг пользователя с ID "123e4567-e89b-12d3-a456-426614174000" на 1650
```

## 🏗️ Архитектура

```
src/mcp-server/
├── src/
│   ├── index.ts              # Основной файл сервера
│   ├── database.ts           # Подключение к БД
│   ├── tools/
│   │   └── user-tools.ts     # Инструменты для работы с пользователями
│   ├── resources/
│   │   └── user-resources.ts # Ресурсы пользователей
│   └── prompts/
│       └── user-prompts.ts   # Промпты для пользователей
├── package.json
├── tsconfig.json
└── README.md
```

## 🔒 Безопасность

- Все операции с базой данных проходят через Drizzle ORM
- Валидация входных данных с помощью Zod
- Обработка ошибок и безопасные сообщения
- Логирование операций

## 🧪 Тестирование

Используйте [MCP Inspector](https://github.com/modelcontextprotocol/inspector) для тестирования:

```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

## 📝 Логи

Сервер выводит логи в stderr для отладки:
- 🔌 Подключение к базе данных
- 🔧 Регистрация инструментов
- 📚 Регистрация ресурсов
- 💬 Регистрация промптов
- ✅ Успешный запуск

## 🤝 Расширение

Для добавления новых моделей (Venue, Court, Booking и т.д.):

1. Создайте новые файлы в папках `tools/`, `resources/`, `prompts/`
2. Зарегистрируйте их в `index.ts`
3. Обновите документацию

## 📄 Лицензия

MIT License

## 🆘 Поддержка

При возникновении проблем:
1. Проверьте переменную `DATABASE_URL`
2. Убедитесь, что база данных доступна
3. Проверьте логи в stderr
4. Используйте MCP Inspector для отладки
