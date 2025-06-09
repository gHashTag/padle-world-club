# 🎤 Voice Framework для Padle World Club

Полноценный голосовой фреймворк для управления падл-центром через голосовые команды с интеграцией Claude Desktop.

## 🚀 Что реализовано

### ✅ MCP Voice Server
Полноценный MCP (Model Context Protocol) сервер для интеграции с Claude Desktop:

- **3 инструмента:** ping, parse_voice_command, voice_booking
- **Многоязычная поддержка:** русский, английский, тайский
- **Валидация с Zod** и comprehensive обработка ошибок
- **Production-ready архитектура**

### ✅ Voice AI Service
Базовый сервис для обработки голосовых команд:

- **voiceToText()** - преобразование речи в текст (mock)
- **textToVoice()** - преобразование текста в речь (mock)
- **parseVoiceCommand()** - парсинг голосовых команд
- **processVoiceBooking()** - обработка бронирования

### ✅ Comprehensive Testing
Полное тестовое покрытие всех компонентов:

- **Unit тесты** для всех функций
- **Integration тесты** для MCP сервера
- **TDD подход** с comprehensive проверками

## 🔧 Архитектура

```
Voice Framework/
├── src/services/voice-ai.ts           # Базовый AI сервис
├── src/mcp-voice-server/              # MCP сервер для Claude
│   ├── src/index.ts                   # Основной MCP сервер
│   ├── package.json                   # Конфигурация
│   ├── tsconfig.json                  # TypeScript настройки
│   └── README.md                      # Документация MCP
├── src/mcp-voice-server/voice-tools.ts # Дополнительные инструменты
└── src/__tests__/                     # Comprehensive тесты
    ├── unit/services/voice-ai.test.ts
    ├── unit/mcp-voice-server/basic-server.test.ts
    └── unit/voice-framework/basic-voice.test.ts
```

## 🎯 Поддерживаемые команды

### Бронирование кортов
```
"Забронируй корт на завтра в 14:00"
"Book a court for tomorrow at 2 PM"
"จองคอร์ตพรุ่งนี้เวลา 14:00"
```

### Проверка доступности
```
"Покажи свободные корты на сегодня"
"Show available courts today"
"ดูคอร์ตว่างวันนี้"
```

### Отмена бронирования
```
"Отмени мою бронь на завтра"
"Cancel my booking for tomorrow"
"ยกเลิกการจองพรุ่งนี้"
```

## 🚀 Быстрый старт

### 1. Запуск MCP сервера
```bash
cd src/mcp-voice-server
npm install
npm run build
npm start
```

### 2. Интеграция с Claude Desktop
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

### 3. Использование в Claude
После подключения в Claude Desktop будут доступны инструменты:

- **ping** - проверка работоспособности
- **parse_voice_command** - парсинг голосовых команд
- **voice_booking** - полноценное бронирование

## 🧪 Тестирование

### Запуск всех тестов
```bash
bun test src/__tests__/unit/voice-framework/
bun test src/__tests__/unit/mcp-voice-server/
bun test src/__tests__/unit/services/voice-ai.test.ts
```

### Проверка типов
```bash
bun run typecheck
```

## 📋 API Reference

### MCP Tools

#### ping
Проверка работоспособности сервера.
```json
{
  "message": "Hello from Claude!"
}
```

#### parse_voice_command
Парсинг голосовых команд.
```json
{
  "text": "Забронируй корт на завтра в 14:00",
  "language": "ru-RU"
}
```

#### voice_booking
Полноценное голосовое бронирование.
```json
{
  "text": "Забронируй корт на завтра в 14:00",
  "userId": "user-123",
  "sessionId": "session-456",
  "language": "ru-RU"
}
```

## 🔮 Roadmap

### ✅ Phase 1-2: Базовый фреймворк (ЗАВЕРШЕН)
- [x] MCP Voice Server с 3 инструментами
- [x] Voice AI Service с mock функциями
- [x] Comprehensive тестирование
- [x] Полная документация

### 🔄 Phase 3: Реальные AI интеграции (ПЛАНИРУЕТСЯ)
- [ ] OpenAI Whisper для STT
- [ ] ElevenLabs для TTS
- [ ] GPT-4 для улучшенного NLU

### 📊 Phase 4: Аналитика и мониторинг (ПЛАНИРУЕТСЯ)
- [ ] Логирование взаимодействий
- [ ] Метрики производительности
- [ ] Dashboard для мониторинга

### 🔐 Phase 5: Продвинутые функции (ПЛАНИРУЕТСЯ)
- [ ] Голосовая биометрия
- [ ] Персонализация команд
- [ ] Интеграция с реальными API

## 🤝 Использование

Голосовой фреймворк готов к использованию и интеграции с Claude Desktop. Все основные функции реализованы и протестированы. Можно начинать использовать для голосового управления падл-центром!

## 📄 Лицензия

MIT License - см. LICENSE файл для деталей.
