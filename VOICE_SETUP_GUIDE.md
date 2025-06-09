# 🎤 Voice Framework Setup Guide

Пошаговая инструкция по настройке и использованию голосового фреймворка для падл-центра.

## 🚀 Быстрый старт

### 1. Проверка готовности системы

```bash
# Проверить все компоненты
bash scripts/test-voice-mcp.sh

# Или проверить типы отдельно
bun run typecheck
```

### 2. Подключение к Claude Desktop

1. **Скопируйте конфигурацию MCP:**
   ```json
   {
     "mcpServers": {
       "padle-voice-server": {
         "command": "bun",
         "args": ["run", "src/mcp-voice-server/src/index.ts"],
         "cwd": "/Users/playra/padle-world-club",
         "env": {
           "NODE_ENV": "development"
         }
       }
     }
   }
   ```

2. **Добавьте в настройки Claude Desktop:**
   - Откройте Claude Desktop
   - Перейдите в Settings → MCP Servers
   - Вставьте конфигурацию из `mcp-config.json`
   - Перезапустите Claude Desktop

### 3. Тестирование функций

После подключения в Claude Desktop будут доступны инструменты:

#### 🏓 ping - Проверка работоспособности
```json
{
  "message": "Hello from Claude!"
}
```

#### 🧠 parse_voice_command - Парсинг команд
```json
{
  "text": "Забронируй корт на завтра в 14:00",
  "language": "ru-RU"
}
```

#### 🎤 voice_booking - Голосовое бронирование
```json
{
  "text": "Забронируй корт на завтра в 14:00",
  "userId": "user-123",
  "sessionId": "session-456",
  "language": "ru-RU"
}
```

#### 🧪 self_test - Самотестирование
```json
{
  "testType": "full_cycle",
  "testData": "Забронируй корт на завтра в 14:00"
}
```

## 🎯 Поддерживаемые команды

### Бронирование кортов
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

## 🔧 Архитектура

```
Voice Framework/
├── src/mcp-voice-server/          # MCP сервер для Claude
│   ├── src/index.ts               # Основной сервер (4 инструмента)
│   ├── package.json               # Конфигурация
│   └── tsconfig.json              # TypeScript настройки
├── src/services/
│   ├── voice-ai.ts                # Базовый AI сервис (mock)
│   └── booking-service.ts         # Реальная интеграция с API
├── src/__tests__/                 # Comprehensive тесты
├── mcp-config.json                # Конфигурация для Claude
├── scripts/test-voice-mcp.sh      # Тестовый скрипт
├── VOICE_FRAMEWORK_README.md      # Общая документация
└── VOICE_ROADMAP.md               # План развития
```

## 🧪 Тестирование

### Unit тесты
```bash
# MCP Voice Server
bun test src/__tests__/unit/mcp-voice-server/basic-server.test.ts

# BookingService
bun test src/__tests__/unit/services/booking-service.test.ts

# Voice AI
bun test src/__tests__/unit/services/voice-ai.test.ts
```

### Самотестирование через MCP
Используйте инструмент `self_test` в Claude Desktop:
- `ping` - проверка сервера
- `parse_command` - тест парсинга
- `voice_booking` - тест бронирования
- `full_cycle` - полный цикл тестирования

## 🔍 Диагностика проблем

### Проблема: MCP сервер не подключается
1. Проверьте путь в `mcp-config.json`
2. Убедитесь, что Bun установлен
3. Проверьте права доступа к файлам

### Проблема: Ошибки TypeScript
```bash
bun run typecheck
```

### Проблема: Тесты не проходят
```bash
bash scripts/test-voice-mcp.sh
```

### Проблема: Голосовое бронирование не работает
1. Проверьте подключение к БД
2. Убедитесь, что репозитории инициализированы
3. Используйте `self_test` для диагностики

## 📊 Мониторинг

### Логи MCP сервера
Логи выводятся в stderr Claude Desktop:
- `📝 Voice Booking: userId - command - success`
- `🚀 MCP Voice Server is running!`
- `📋 Available tools: ping, parse_voice_command, voice_booking, self_test`

### Метрики производительности
Инструмент `self_test` возвращает:
- `responseTime` - время ответа в мс
- `timestamp` - время выполнения
- `success` - статус выполнения

## 🎯 Следующие шаги

### Step 1.2: Улучшение проверки доступности
- Умные рекомендации слотов
- Фильтрация по типу корта и цене
- Real-time обновления

### Step 2: Аутентификация
- Голосовая аутентификация
- Токен-based авторизация
- Безопасность сессий

### Step 3: Реальные AI сервисы
- OpenAI Whisper для STT
- ElevenLabs для TTS
- GPT-4 для улучшенного NLU

## 🤝 Поддержка

При возникновении проблем:
1. Запустите `bash scripts/test-voice-mcp.sh`
2. Проверьте логи Claude Desktop
3. Используйте `self_test` для диагностики
4. Обратитесь к документации в `VOICE_FRAMEWORK_README.md`

## 🎉 Готово к использованию!

Голосовой фреймворк полностью настроен и готов к использованию. Начните с команды "Забронируй корт на завтра в 14:00" в Claude Desktop!
