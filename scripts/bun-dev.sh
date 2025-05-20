#!/bin/bash

# Скрипт для запуска бота в режиме разработки с подробным логированием

# Цвета для вывода
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Функция для вывода информации с временной меткой
log_info() {
    echo -e "${GREEN}[$(date +"%Y-%m-%d %H:%M:%S")] [INFO]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[$(date +"%Y-%m-%d %H:%M:%S")] [WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[$(date +"%Y-%m-%d %H:%M:%S")] [ERROR]${NC} $1"
}

log_debug() {
    echo -e "${BLUE}[$(date +"%Y-%m-%d %H:%M:%S")] [DEBUG]${NC} $1"
}

# Выводим информацию о запуске
log_info "🚀 Запуск Instagram Scraper Bot в режиме разработки..."
log_info "Версия Bun: $(bun --version)"
log_info "Версия Node: $(node --version)"
log_info "Текущая директория: $(pwd)"

# Проверяем наличие файла .env
if [ -f .env ]; then
    log_info "Файл .env найден"
else
    log_warning "Файл .env не найден. Бот может работать некорректно."
fi

# Проверяем наличие файла index.ts
if [ -f index.ts ]; then
    log_info "Файл index.ts найден"
else
    log_error "Файл index.ts не найден. Бот не может быть запущен."
    exit 1
fi

log_info "Запуск бота..."
echo ""

# Запускаем бот
bun run index.ts

# Получаем код возврата
EXIT_CODE=$?

echo ""
if [ $EXIT_CODE -eq 0 ]; then
    log_info "👋 Бот остановлен корректно (код возврата: $EXIT_CODE)"
else
    log_error "❌ Бот остановлен с ошибкой (код возврата: $EXIT_CODE)"
fi
