# 🎤 MCP Voice Server для Padle World Club

Минимальный MCP сервер для голосового управления падл-центром с подходом "Just To Be Done".

## 🚀 Быстрый старт

### Установка зависимостей
```bash
cd src/mcp-voice-server
npm install
```

### Сборка проекта
```bash
npm run build
```

### Запуск в режиме разработки
```bash
npm run dev
```

### Запуск продакшн версии
```bash
npm start
```

## 🔧 Доступные инструменты

### 1. 🏓 ping
Проверка работоспособности сервера.

**Параметры:**
- `message` (опционально) - сообщение для проверки

**Пример:**
```json
{
  "message": "Hello from Claude!"
}
```

**Ответ:**
```json
{
  "success": true,
  "message": "🎤 Voice Server is alive! Hello from Claude!",
  "timestamp": "2024-12-27T10:30:00.000Z",
  "server": "MCP Voice Server v1.0.0"
}
```

### 2. 🧠 parse_voice_command
Парсинг голосовых команд для бронирования кортов.

**Параметры:**
- `text` (обязательно) - текст голосовой команды
- `language` (опционально) - язык команды (ru-RU, en-US, th-TH)

**Пример:**
```json
{
  "text": "Забронируй корт на завтра в 14:00",
  "language": "ru-RU"
}
```

**Ответ:**
```json
{
  "success": true,
  "command": {
    "command": "book_court",
    "date": "2024-12-28",
    "time": "14:00"
  },
  "originalText": "Забронируй корт на завтра в 14:00",
  "language": "ru-RU",
  "timestamp": "2024-12-27T10:30:00.000Z"
}
```

### 3. 🎤 voice_booking
Полноценное голосовое бронирование кортов с генерацией аудио ответа.

**Параметры:**
- `text` (обязательно) - голосовая команда для бронирования
- `userId` (обязательно) - ID пользователя
- `sessionId` (обязательно) - ID сессии для отслеживания
- `language` (опционально) - язык команды (ru-RU, en-US, th-TH)

**Пример:**
```json
{
  "text": "Забронируй корт на завтра в 14:00",
  "userId": "user-123",
  "sessionId": "session-456",
  "language": "ru-RU"
}
```

**Ответ:**
```json
{
  "success": true,
  "bookingId": "booking-1735294200000",
  "message": "Корт успешно забронирован на 2024-12-28 в 14:00",
  "audioResponse": "https://voice-api.paddle-center.com/audio/1735294200000.mp3",
  "nextSteps": [
    "Приходите за 15 минут до начала игры",
    "Оплата при регистрации",
    "Можете отменить за 2 часа до игры"
  ],
  "command": {
    "command": "book_court",
    "date": "2024-12-28",
    "time": "14:00"
  },
  "originalText": "Забронируй корт на завтра в 14:00",
  "userId": "user-123",
  "sessionId": "session-456",
  "language": "ru-RU",
  "timestamp": "2024-12-27T10:30:00.000Z"
}
```

## 🧪 Тестирование

### Запуск тестов
```bash
npm test
```

### Ручное тестирование
```bash
node ../../../test-mcp-server.mjs
```

## 📋 Поддерживаемые команды

### Бронирование
- "Забронируй корт на завтра в 14:00"
- "Book a court for tomorrow at 2 PM"
- "จองคอร์ตพรุ่งนี้เวลา 14:00"

### Проверка доступности
- "Покажи свободные корты на сегодня"
- "Show available courts today"
- "ดูคอร์ตว่างวันนี้"

### Отмена бронирования
- "Отмени мою бронь на завтра"
- "Cancel my booking for tomorrow"
- "ยกเลิกการจองพรุ่งนี้"

## 🔄 Roadmap

### ✅ Phase 1: Базовый сервер (DONE)
- [x] Функция ping
- [x] Парсинг голосовых команд
- [x] Базовая валидация
- [x] Обработка ошибок

### ✅ Phase 2: Голосовое бронирование (DONE)
- [x] Полноценное бронирование через MCP
- [x] Генерация голосовых ответов
- [x] Интеграция с voice-ai сервисом
- [x] Логирование взаимодействий
- [ ] Интеграция с реальным Booking API

### 📋 Phase 3: Аналитика (PLANNED)
- [ ] Метрики использования
- [ ] Логирование взаимодействий
- [ ] Dashboard для мониторинга

### 🚀 Phase 4: Продвинутые функции (PLANNED)
- [ ] Интеграция с OpenAI Whisper
- [ ] ElevenLabs TTS
- [ ] Голосовая биометрия

## 🛠️ Архитектура

```
src/mcp-voice-server/
├── src/
│   └── index.ts          # Основной MCP сервер
├── package.json          # Конфигурация пакета
├── tsconfig.json         # TypeScript конфигурация
└── README.md            # Документация
```

## 🔗 Интеграция с Claude Desktop

Добавьте в конфигурацию Claude Desktop:

```json
{
  "mcpServers": {
    "padle-voice-server": {
      "command": "node",
      "args": ["path/to/padle-world-club/src/mcp-voice-server/dist/index.js"]
    }
  }
}
```

## 📝 Логи и отладка

Сервер выводит логи в stderr:
- 🎤 Starting MCP Voice Server...
- ✅ Voice Server initialized successfully
- 🔗 Connecting to transport...
- 🚀 MCP Voice Server is running!

## 🤝 Вклад в разработку

1. Форкните репозиторий
2. Создайте ветку для новой функции
3. Добавьте тесты
4. Отправьте Pull Request

## 📄 Лицензия

MIT License - см. LICENSE файл для деталей.
