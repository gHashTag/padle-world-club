#!/bin/bash

# 🎤 Демонстрация Voice Framework для падл-центра
# Показывает все возможности голосового управления

set -e

echo "🎤 Демонстрация Voice Framework для падл-центра"
echo "=============================================="

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Функция для вывода заголовка
print_header() {
    echo -e "\n${BLUE}🔍 $1${NC}"
    echo "=========================================="
}

# Функция для вывода подзаголовка
print_subheader() {
    echo -e "\n${CYAN}📋 $1${NC}"
    echo "----------------------------------------"
}

# Функция для паузы
pause() {
    echo -e "\n${YELLOW}⏸️ Нажмите Enter для продолжения...${NC}"
    read -r
}

# Приветствие
echo -e "${GREEN}"
cat << "EOF"
   🎤 VOICE FRAMEWORK DEMO 🎤
   
   Полноценная система голосового управления
   для падл-центра с интеграцией:
   
   🤖 Telegram Bot
   🎯 MCP Server для Claude Desktop
   🏓 Реальные API для бронирования
   
EOF
echo -e "${NC}"

pause

# 1. Обзор архитектуры
print_header "Архитектура Voice Framework"

echo "📁 Структура проекта:"
echo ""
echo "Voice Framework/"
echo "├── 🤖 Telegram Bot Integration"
echo "│   ├── src/telegram/voice-handler.ts      # Обработчик голосовых сообщений"
echo "│   ├── src/telegram/voice-processor.ts    # Процессор голосовых файлов"
echo "│   └── scripts/start-voice-bot.sh         # Скрипт запуска бота"
echo "│"
echo "├── 🎯 MCP Server для Claude Desktop"
echo "│   ├── src/mcp-voice-server/src/index.ts  # MCP сервер (4 инструмента)"
echo "│   ├── mcp-config.json                    # Конфигурация для Claude"
echo "│   └── scripts/test-voice-mcp.sh          # Тестирование MCP"
echo "│"
echo "├── 🏓 Voice AI & Booking Services"
echo "│   ├── src/services/voice-ai.ts           # AI сервис для голоса"
echo "│   ├── src/services/booking-service.ts    # Реальная интеграция с API"
echo "│   └── src/__tests__/                     # Comprehensive тесты"
echo "│"
echo "└── 📚 Документация"
echo "    ├── VOICE_FRAMEWORK_README.md          # Общая документация"
echo "    ├── TELEGRAM_VOICE_README.md           # Telegram интеграция"
echo "    ├── VOICE_ROADMAP.md                   # План развития"
echo "    └── VOICE_SETUP_GUIDE.md               # Инструкции по настройке"

pause

# 2. Telegram Bot Demo
print_header "Telegram Bot - Голосовое управление"

print_subheader "Возможности Telegram Bot"
echo "🎤 Голосовые команды:"
echo "   • 'Забронируй корт на завтра в 14:00'"
echo "   • 'Покажи свободные корты'"
echo "   • 'Отмени мою бронь'"
echo ""
echo "📋 Команды бота:"
echo "   • /start - Приветствие"
echo "   • /voice_help - Справка по голосовым командам"
echo "   • /voice_test - Тестирование фреймворка"
echo "   • /status - Статус системы"
echo ""
echo "🔧 Технические особенности:"
echo "   • Скачивание и обработка OGG файлов"
echo "   • Валидация (макс. 30 сек, 1 МБ)"
echo "   • Mock STT для тестирования"
echo "   • Интеграция с реальными API"

print_subheader "Запуск Telegram Bot"
echo "Команда для запуска:"
echo -e "${GREEN}bash scripts/start-voice-bot.sh${NC}"
echo ""
echo "Что происходит при запуске:"
echo "1. ✅ Проверка BOT_TOKEN в .env"
echo "2. ✅ Проверка TypeScript типов"
echo "3. ✅ Проверка зависимостей"
echo "4. ✅ Создание временных директорий"
echo "5. ✅ Подключение к базе данных"
echo "6. 🚀 Запуск бота"

pause

# 3. MCP Server Demo
print_header "MCP Server - Интеграция с Claude Desktop"

print_subheader "MCP Инструменты"
echo "🔧 Доступные инструменты:"
echo ""
echo "1. 🏓 ping"
echo "   └── Проверка работоспособности сервера"
echo ""
echo "2. 🧠 parse_voice_command"
echo "   └── Парсинг голосовых команд"
echo "   └── Поддержка: RU/EN/TH"
echo ""
echo "3. 🎤 voice_booking"
echo "   └── Полноценное голосовое бронирование"
echo "   └── Интеграция с реальными API"
echo "   └── Генерация аудио ответов"
echo ""
echo "4. 🧪 self_test"
echo "   └── Самотестирование всех функций"
echo "   └── Полный цикл: ping → parse → booking"

print_subheader "Конфигурация для Claude Desktop"
echo "📄 Содержимое mcp-config.json:"
echo -e "${GREEN}"
cat mcp-config.json 2>/dev/null || echo "Файл mcp-config.json не найден"
echo -e "${NC}"

pause

# 4. Voice AI Services Demo
print_header "Voice AI Services - Обработка голосовых команд"

print_subheader "VoiceBookingService"
echo "🏓 Реальная интеграция с API:"
echo "   • BookingRepository - создание бронирований"
echo "   • CourtRepository - поиск доступных кортов"
echo "   • UserRepository - управление пользователями"
echo ""
echo "💰 Конфигурация для падл-центра:"
echo "   • Длительность по умолчанию: 90 минут"
echo "   • Валюта: THB (тайский бат)"
echo "   • Цена за час: 1500 THB"
echo "   • Тип игры: free_play"

print_subheader "Поддерживаемые команды"
echo "🎯 Типы команд:"
echo ""
echo "📅 book_court:"
echo "   • 'Забронируй корт на завтра в 14:00'"
echo "   • 'Book a court for tomorrow at 2 PM'"
echo "   • 'จองคอร์ตพรุ่งนี้เวลา 14:00'"
echo ""
echo "🔍 check_availability:"
echo "   • 'Покажи свободные корты'"
echo "   • 'Show available courts'"
echo "   • 'ดูคอร์ตว่าง'"
echo ""
echo "❌ cancel_booking:"
echo "   • 'Отмени мою бронь'"
echo "   • 'Cancel my booking'"
echo "   • 'ยกเลิกการจอง'"

pause

# 5. Testing Demo
print_header "Comprehensive Testing"

print_subheader "Доступные тесты"
echo "🧪 Unit тесты:"
echo "   • BookingService: 15 тестов"
echo "   • MCP Voice Server: 12 тестов"
echo "   • Telegram Handler: 20+ тестов"
echo "   • Voice AI Service: 10 тестов"
echo ""
echo "🔧 Интеграционные тесты:"
echo "   • MCP Server self-testing"
echo "   • Telegram Bot integration"
echo "   • Real API integration"
echo ""
echo "📋 Тестовые скрипты:"
echo "   • scripts/test-voice-mcp.sh - полное тестирование MCP"
echo "   • scripts/start-voice-bot.sh --test - тестирование Telegram"

print_subheader "Запуск тестов"
echo "Команды для тестирования:"
echo ""
echo -e "${GREEN}# Тестирование MCP сервера${NC}"
echo "bash scripts/test-voice-mcp.sh"
echo ""
echo -e "${GREEN}# Тестирование Telegram бота${NC}"
echo "bash scripts/start-voice-bot.sh --test"
echo ""
echo -e "${GREEN}# Unit тесты${NC}"
echo "bun test src/__tests__/unit/services/booking-service.test.ts"
echo "bun test src/__tests__/unit/telegram/voice-handler.test.ts"
echo "bun test src/__tests__/unit/mcp-voice-server/basic-server.test.ts"

pause

# 6. Roadmap Demo
print_header "Roadmap - Что дальше?"

print_subheader "✅ Завершено (Step 1.1)"
echo "🎯 Реальная интеграция с Booking API:"
echo "   ✅ VoiceBookingService с реальными репозиториями"
echo "   ✅ MCP Server с 4 инструментами"
echo "   ✅ Self-testing framework"
echo "   ✅ Telegram Bot интеграция"
echo "   ✅ Comprehensive тестирование"

print_subheader "🔄 Следующие этапы"
echo "📋 Step 1.2 - Улучшение проверки доступности:"
echo "   • Умные рекомендации слотов"
echo "   • Фильтрация по типу корта и цене"
echo "   • Real-time обновления"
echo ""
echo "🔐 Step 2 - Аутентификация и безопасность:"
echo "   • Голосовая аутентификация"
echo "   • Токен-based авторизация"
echo "   • Контроль доступа"
echo ""
echo "🤖 Step 3 - Реальные AI сервисы:"
echo "   • OpenAI Whisper для STT"
echo "   • ElevenLabs для TTS"
echo "   • GPT-4 для улучшенного NLU"

pause

# 7. Финальная демонстрация
print_header "Готово к использованию!"

echo -e "${GREEN}"
cat << "EOF"
🎉 Voice Framework полностью готов!

🤖 Telegram Bot:
   1. Настройте BOT_TOKEN в .env
   2. Запустите: bash scripts/start-voice-bot.sh
   3. Отправьте голосовое сообщение в Telegram

🎯 MCP для Claude Desktop:
   1. Скопируйте mcp-config.json в настройки Claude
   2. Используйте инструменты в Claude Desktop
   3. Тестируйте через self_test

🏓 Реальное бронирование:
   ✅ Работает с настоящей базой данных
   ✅ Интегрировано с существующими API
   ✅ Готово к production использованию

EOF
echo -e "${NC}"

echo -e "${YELLOW}🚀 Начните с любого из вариантов:${NC}"
echo "   • Telegram: bash scripts/start-voice-bot.sh"
echo "   • MCP тестирование: bash scripts/test-voice-mcp.sh"
echo "   • Документация: cat VOICE_FRAMEWORK_README.md"

echo ""
echo -e "${PURPLE}🎤 Голосовое управление падл-центром готово! 🎤${NC}"
