# 🚀 Быстрый старт MCP сервера Padle World Club

## 📋 Что это?

Model Context Protocol (MCP) сервер для работы с базой данных Padle World Club прямо через агентов ИИ в Claude Desktop.

## ⚡ Быстрая установка

### 1. Соберите проект
```bash
cd src/mcp-server
npm run build
```

### 2. Настройте Claude Desktop

Скопируйте конфигурацию в файл `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "padle-world-club": {
      "command": "node",
      "args": ["/Users/playra/padle-world-club/src/mcp-server/dist/index.js"],
      "env": {
        "DATABASE_URL": "postgresql://user:password@host:port/database"
      }
    }
  }
}
```

### 3. Установите DATABASE_URL

Замените `postgresql://user:password@host:port/database` на реальный URL вашей базы данных.

### 4. Перезапустите Claude Desktop

## 🎯 Примеры использования

### Создание пользователя
```
Создай нового пользователя:
- Имя: Иван
- Фамилия: Петров  
- Email: ivan@example.com
- Username: ivan_petrov
- Роль: member
```

### Поиск пользователя
```
Найди пользователя с username "ivan_petrov" и покажи его профиль
```

### Получение статистики
```
Покажи статистику всех пользователей в системе
```

### Обновление рейтинга
```
Обнови рейтинг пользователя ivan_petrov на 1650 очков
```

## 🔧 Доступные инструменты

- `create_user` - создание пользователя
- `get_user_by_id` - получение по ID
- `get_user_by_username` - получение по username
- `get_user_by_email` - получение по email
- `update_user` - обновление данных
- `delete_user` - удаление пользователя
- `list_users` - список пользователей

## 📚 Доступные ресурсы

- `user://profile/{userId}` - профиль пользователя
- `user://search/{username}` - поиск по username
- `users://list` - список всех пользователей
- `users://stats` - статистика пользователей

## 💬 Доступные промпты

- `user-registration` - помощь в регистрации
- `user-profile-analysis` - анализ профиля
- `user-search-compare` - поиск и сравнение
- `user-management` - управление пользователями
- `user-stats-report` - отчеты по пользователям
- `user-onboarding` - помощь в онбординге

## 🔍 Отладка

Если что-то не работает:

1. Проверьте логи в stderr
2. Убедитесь, что DATABASE_URL корректен
3. Проверьте, что база данных доступна
4. Используйте MCP Inspector для тестирования:
   ```bash
   npx @modelcontextprotocol/inspector node dist/index.js
   ```

## 🎉 Готово!

Теперь вы можете работать с пользователями Padle World Club прямо через Claude Desktop!
