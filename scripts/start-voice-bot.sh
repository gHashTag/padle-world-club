#!/bin/bash

# 🤖 Скрипт для запуска Telegram-бота с голосовыми функциями
# Проверяет все зависимости и запускает бота

set -e

echo "🤖 Запуск Telegram-бота с голосовыми функциями..."
echo "=================================================="

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

# 1. Проверка переменных окружения
print_header "Проверка переменных окружения"

if [ -z "$BOT_TOKEN" ]; then
    echo -e "${YELLOW}⚠️ BOT_TOKEN не установлен${NC}"
    echo "Проверяем .env файл..."
    
    if [ -f ".env" ]; then
        echo "✅ .env файл найден"
        source .env
        if [ -z "$BOT_TOKEN" ]; then
            echo -e "${RED}❌ BOT_TOKEN не найден в .env файле${NC}"
            echo "Добавьте BOT_TOKEN=your_bot_token в .env файл"
            exit 1
        else
            print_status 0 "BOT_TOKEN загружен из .env"
        fi
    else
        echo -e "${RED}❌ .env файл не найден${NC}"
        echo "Создайте .env файл с BOT_TOKEN=your_bot_token"
        exit 1
    fi
else
    print_status 0 "BOT_TOKEN установлен"
fi

# 2. Проверка TypeScript
print_header "Проверка типов TypeScript"
if bun run typecheck; then
    print_status 0 "TypeScript типы корректны"
else
    print_status 1 "Ошибки TypeScript типов"
    echo "Исправьте ошибки типов перед запуском бота"
    exit 1
fi

# 3. Проверка зависимостей
print_header "Проверка зависимостей"

required_packages=("telegraf" "@types/node")
missing_packages=()

for package in "${required_packages[@]}"; do
    if bun pm ls | grep -q "$package"; then
        echo -e "${GREEN}✅${NC} $package"
    else
        echo -e "${RED}❌${NC} $package"
        missing_packages+=("$package")
    fi
done

if [ ${#missing_packages[@]} -ne 0 ]; then
    echo -e "${YELLOW}⚠️ Устанавливаю недостающие пакеты...${NC}"
    bun install "${missing_packages[@]}"
fi

# 4. Проверка структуры проекта
print_header "Проверка структуры проекта"
required_files=(
    "src/bot.ts"
    "src/commands.ts"
    "src/telegram/voice-handler.ts"
    "src/telegram/voice-processor.ts"
    "src/services/voice-ai.ts"
    "src/services/booking-service.ts"
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

if [ "$all_files_exist" = false ]; then
    print_status 1 "Отсутствуют некоторые файлы"
    exit 1
fi

# 5. Создание временной директории для голосовых файлов
print_header "Подготовка временных директорий"
mkdir -p temp/voice
print_status 0 "Временная директория создана: temp/voice"

# 6. Запуск тестов (опционально)
if [ "$1" = "--test" ]; then
    print_header "Запуск тестов"
    
    echo "Тестирование голосового обработчика..."
    if bun test src/__tests__/unit/telegram/voice-handler.test.ts; then
        print_status 0 "Тесты голосового обработчика прошли"
    else
        print_status 1 "Тесты голосового обработчика провалены"
        echo "Продолжаем запуск бота..."
    fi
fi

# 7. Проверка подключения к базе данных
print_header "Проверка подключения к базе данных"
echo "Проверяем доступность базы данных..."

# Простая проверка через TypeScript
if bun -e "
import { db } from './src/db/index.ts';
console.log('✅ База данных доступна');
" 2>/dev/null; then
    print_status 0 "База данных доступна"
else
    echo -e "${YELLOW}⚠️ База данных недоступна, будет использован mock режим${NC}"
fi

# 8. Запуск бота
print_header "Запуск Telegram-бота"

echo "🚀 Запускаю бота..."
echo "📋 Доступные команды:"
echo "   /start - Приветствие"
echo "   /help - Справка"
echo "   /voice_help - Голосовые команды"
echo "   /voice_test - Тестирование"
echo "   /status - Статус системы"
echo ""
echo "🎤 Голосовые функции:"
echo "   • Отправьте голосовое сообщение для бронирования"
echo "   • Поддерживаются команды на русском языке"
echo "   • Максимальная длительность: 30 секунд"
echo ""
echo "🛑 Для остановки нажмите Ctrl+C"
echo ""

# Устанавливаем переменные окружения
export NODE_ENV=development

# Запускаем бота
if [ "$1" = "--index" ]; then
    echo "Запуск через index.ts..."
    bun run index.ts
else
    echo "Запуск через src/bot.ts..."
    bun run src/bot.ts
fi
