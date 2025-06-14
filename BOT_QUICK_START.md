# 🤖 Быстрый запуск Telegram-бота с голосовыми функциями

## 🚀 Простой запуск

### 1. Получите действующий BOT_TOKEN

#### Если у вас нет бота или токен устарел:
1. **Откройте @BotFather** в Telegram
2. **Создайте нового бота:** `/newbot`
3. **Введите имя:** например "Padel Voice Bot"
4. **Введите username:** например "padel_voice_bot"
5. **Скопируйте токен**

#### Обновите .env файл:
```bash
# Откройте .env и замените строку:
BOT_TOKEN=YOUR_ACTUAL_TOKEN_FROM_BOTFATHER
```

#### Проверьте токен:
```bash
# Проверка валидности токена
bun run bot:check
```

### 2. Запустите бота
```bash
# Основная команда для запуска с автоперезагрузкой
bun dev

# Или альтернативные команды:
bun run bot          # Обычный запуск
bun run bot:dev      # Запуск с автоперезагрузкой
```

### 3. Найдите бота в Telegram
- Откройте Telegram
- Найдите вашего бота по имени (который вы создали через @BotFather)
- Отправьте `/start`

## 🎤 Тестирование голосовых функций

### Команды бота
- `/start` - Приветствие и инструкции
- `/help` - Список всех команд
- `/voice_help` - Справка по голосовым функциям
- `/voice_test` - Тестирование голосового фреймворка
- `/status` - Статус системы

### Голосовые команды
Отправьте голосовое сообщение с одной из команд:

#### 🏓 Бронирование кортов
- "Забронируй корт на завтра в 14:00"
- "Забронируй корт на понедельник в 16:00"

#### 🔍 Проверка доступности
- "Покажи свободные корты"
- "Проверь доступность кортов"

#### ❌ Отмена бронирования
- "Отмени мою бронь"
- "Отмени бронирование на завтра"

## 🔧 Что происходит под капотом

### Архитектура
```
index.ts (главный файл)
├── src/bot.ts (основной бот)
├── src/commands.ts (команды + голосовые функции)
├── src/telegram/voice-handler.ts (обработка голоса)
├── src/telegram/voice-processor.ts (обработка файлов)
└── src/services/booking-service.ts (реальное бронирование)
```

### Голосовая обработка
1. **Получение голосового сообщения** в Telegram
2. **Скачивание OGG файла** через Telegram API
3. **Mock распознавание речи** (симуляция STT)
4. **Парсинг команды** через voice-ai сервис
5. **Обработка бронирования** через BookingService
6. **Отправка ответа** пользователю

### Интеграция с API
- **BookingRepository** - создание бронирований
- **CourtRepository** - поиск доступных кортов
- **UserRepository** - управление пользователями
- **Реальная база данных** - Neon PostgreSQL

## 🧪 Диагностика

### Если бот не запускается
1. Проверьте BOT_TOKEN в .env файле
2. Убедитесь, что все зависимости установлены: `bun install`
3. Проверьте TypeScript: `bun run typecheck`

### Если голосовые сообщения не обрабатываются
1. Проверьте длительность сообщения (макс. 30 секунд)
2. Используйте `/voice_test` для диагностики
3. Проверьте логи в консоли

### Если бронирование не работает
1. Проверьте подключение к базе данных
2. Убедитесь, что API endpoints доступны
3. Используйте `/status` для проверки системы

## 📋 Примеры использования

### Успешное бронирование
```
Пользователь: 🎤 "Забронируй корт на завтра в 14:00"

Бот: ✅ Корт 1 (крытый) успешно забронирован на 2024-12-28 в 14:00

📋 ID бронирования: booking-1735294200000

📝 Следующие шаги:
1. Приходите за 15 минут до начала игры
2. Оплата: 2250 THB
3. Можете отменить за 2 часа до игры

🎤 Распознано: "Забронируй корт на завтра в 14:00"
```

### Тестирование
```
Пользователь: /voice_test

Бот: 🧪 Результат тестирования:

🔊 VoiceProcessor: ✅
📝 Команда: Тестовая голосовая команда: Забронируй корт на завтра в 14:00
🧠 Распознано: book_court
🏓 BookingService: ✅ Реальный
✅ Статус: Успешно
💬 Ответ: Корт успешно забронирован на 2024-12-28 в 14:00
```

## 🎯 Готово!

После запуска `bun dev` ваш бот будет:
- ✅ Принимать голосовые сообщения
- ✅ Обрабатывать команды бронирования
- ✅ Работать с реальной базой данных
- ✅ Отправлять подробные ответы

**Начните с команды `/start` в Telegram!** 🎤🏓
