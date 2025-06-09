#!/bin/bash

# 🤖 Проверка готовности Telegram-бота к запуску
# Проверяет все необходимые компоненты перед запуском

set -e

echo "🤖 Проверка готовности Telegram-бота..."
echo "====================================="

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция для вывода статуса
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
        return 1
    fi
}

# Функция для вывода заголовка
print_header() {
    echo -e "\n${BLUE}🔍 $1${NC}"
    echo "----------------------------------------"
}

# 1. Проверка BOT_TOKEN
print_header "Проверка BOT_TOKEN"

if [ -f ".env" ]; then
    if grep -q "BOT_TOKEN=" .env; then
        BOT_TOKEN=$(grep "BOT_TOKEN=" .env | cut -d '=' -f2)
        if [ -n "$BOT_TOKEN" ] && [ "$BOT_TOKEN" != "your_bot_token_here" ]; then
            print_status 0 "BOT_TOKEN найден в .env файле"
        else
            print_status 1 "BOT_TOKEN в .env файле пустой или содержит placeholder"
            echo -e "${YELLOW}💡 Добавьте реальный токен бота в .env файл${NC}"
            echo "   Получите токен у @BotFather в Telegram"
            exit 1
        fi
    else
        print_status 1 "BOT_TOKEN не найден в .env файле"
        echo -e "${YELLOW}💡 Добавьте BOT_TOKEN=your_actual_token в .env файл${NC}"
        exit 1
    fi
else
    print_status 1 ".env файл не найден"
    echo -e "${YELLOW}💡 Создайте .env файл с BOT_TOKEN=your_actual_token${NC}"
    exit 1
fi

# 2. Проверка основных файлов бота
print_header "Проверка файлов бота"

required_files=(
    "index.ts"
    "src/bot.ts"
    "src/commands.ts"
    "src/config.ts"
    "src/telegram/voice-handler.ts"
    "src/telegram/voice-processor.ts"
)

all_files_exist=true
for file in "${required_files[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅${NC} $file"
    else
        echo -e "${RED}❌${NC} $file"
        all_files_exist=false
    fi
done

if [ "$all_files_exist" = true ]; then
    print_status 0 "Все файлы бота присутствуют"
else
    print_status 1 "Отсутствуют некоторые файлы бота"
    exit 1
fi

# 3. Проверка TypeScript
print_header "Проверка TypeScript"
if bun run typecheck > /dev/null 2>&1; then
    print_status 0 "TypeScript типы корректны"
else
    print_status 1 "Ошибки TypeScript типов"
    echo -e "${YELLOW}⚠️ Запустите 'bun run typecheck' для деталей${NC}"
fi

# 4. Проверка зависимостей
print_header "Проверка зависимостей"

required_packages=("telegraf")
missing_packages=()

for package in "${required_packages[@]}"; do
    if bun pm ls 2>/dev/null | grep -q "$package" || [ -d "node_modules/$package" ]; then
        echo -e "${GREEN}✅${NC} $package"
    else
        echo -e "${RED}❌${NC} $package"
        missing_packages+=("$package")
    fi
done

if [ ${#missing_packages[@]} -ne 0 ]; then
    echo -e "${YELLOW}⚠️ Недостающие пакеты: ${missing_packages[*]}${NC}"
    echo "Запустите: bun install"
    exit 1
else
    print_status 0 "Все зависимости установлены"
fi

# 5. Создание временных директорий
print_header "Подготовка временных директорий"
mkdir -p temp/voice
print_status 0 "Временная директория создана: temp/voice"

# 6. Проверка голосовых функций
print_header "Проверка голосовых функций"

echo "Проверяем импорт голосовых модулей..."
if bun -e "
try {
  await import('./src/telegram/voice-handler.ts');
  await import('./src/telegram/voice-processor.ts');
  await import('./src/services/voice-ai.ts');
  console.log('✅ Все голосовые модули импортируются успешно');
} catch (error) {
  console.error('❌ Ошибка импорта:', error.message);
  process.exit(1);
}
" 2>/dev/null; then
    print_status 0 "Голосовые модули готовы"
else
    print_status 1 "Проблемы с голосовыми модулями"
    echo -e "${YELLOW}⚠️ Проверьте импорты в голосовых модулях${NC}"
fi

# 7. Итоговый отчет
print_header "Итоговый отчет"

echo -e "${GREEN}🎉 Бот готов к запуску!${NC}"
echo ""
echo "📋 Доступные команды для запуска:"
echo -e "${BLUE}bun dev${NC}           - Запуск с автоперезагрузкой"
echo -e "${BLUE}bun run bot${NC}       - Обычный запуск"
echo -e "${BLUE}bun run bot:dev${NC}   - Запуск с автоперезагрузкой"
echo ""
echo "🎤 Голосовые функции:"
echo "   • Отправьте голосовое сообщение боту"
echo "   • Используйте команды: /voice_help, /voice_test"
echo "   • Поддерживаемые команды: бронирование кортов"
echo ""
echo "🔧 Команды бота:"
echo "   /start - Приветствие"
echo "   /help - Справка"
echo "   /voice_help - Голосовые команды"
echo "   /voice_test - Тестирование"
echo "   /status - Статус системы"
echo ""
echo -e "${YELLOW}🚀 Запустите бота командой: bun dev${NC}"
