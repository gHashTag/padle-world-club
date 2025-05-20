#!/bin/bash

# Instagram Scraper Bot - Скрипт сборки и тестирования
# 
# Этот скрипт выполняет сборку и тестирование модуля Instagram Scraper Bot
# с проверкой типов, запуском юнит-тестов и интеграционных тестов.

# Цвета для вывода
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
RED="\033[0;31m"
BLUE="\033[0;34m"
NC="\033[0m" # No Color

# Директория модуля
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MODULE_DIR="$(dirname "$SCRIPT_DIR")"
ROOT_DIR="$(cd "$MODULE_DIR/../../../../" && pwd)"
DEV_DIR="$MODULE_DIR/.dev"

# Лог-файл
LOG_FILE="$DEV_DIR/dev.log"

# Создаем .dev директорию, если не существует
if [ ! -d "$DEV_DIR" ]; then
  mkdir -p "$DEV_DIR"
fi

# Создаем лог-файл, если не существует
if [ ! -f "$LOG_FILE" ]; then
  echo "🚀 Лог разработки Instagram Scraper Bot" > "$LOG_FILE"
  echo "" >> "$LOG_FILE"
fi

# Функция логирования
log() {
  local timestamp=$(date "+%Y-%m-%d %H:%M:%S")
  echo -e "$timestamp $1" | tee -a "$LOG_FILE"
}

# Функция для очистки node_modules и переустановки зависимостей
clean_and_install() {
  log "${YELLOW}🧹 Очистка node_modules и переустановка зависимостей...${NC}"
  
  cd "$ROOT_DIR"
  
  # Используем bun install для установки зависимостей
  bun install
  
  if [ $? -eq 0 ]; then
    log "${GREEN}✅ Зависимости успешно установлены.${NC}"
    return 0
  else
    log "${RED}❌ Ошибка при установке зависимостей.${NC}"
    return 1
  fi
}

# Функция для проверки типов TypeScript
check_types() {
  log "${YELLOW}🔍 Проверка типов TypeScript...${NC}"
  
  cd "$ROOT_DIR"
  bun run typecheck
  
  if [ $? -eq 0 ]; then
    log "${GREEN}✅ Проверка типов успешно пройдена.${NC}"
    return 0
  else
    log "${RED}❌ Ошибки при проверке типов. Исправьте их перед продолжением.${NC}"
    return 1
  fi
}

# Функция для сборки проекта
build() {
  log "${YELLOW}🔨 Сборка проекта...${NC}"
  
  cd "$ROOT_DIR"
  bun run build
  
  if [ $? -eq 0 ]; then
    log "${GREEN}✅ Проект успешно собран.${NC}"
    return 0
  else
    log "${RED}❌ Ошибка при сборке проекта.${NC}"
    return 1
  fi
}

# Функция для запуска юнит-тестов
run_unit_tests() {
  log "${YELLOW}🧪 Запуск юнит-тестов...${NC}"
  
  cd "$ROOT_DIR"
  bun vitest run src/telegram-bot/modules/instagram-scraper-bot/__tests__/unit
  
  if [ $? -eq 0 ]; then
    log "${GREEN}✅ Юнит-тесты успешно пройдены.${NC}"
    return 0
  else
    log "${RED}❌ Ошибки в юнит-тестах.${NC}"
    return 1
  fi
}

# Функция для запуска интеграционных тестов
run_integration_tests() {
  log "${YELLOW}🧩 Запуск интеграционных тестов...${NC}"
  
  cd "$MODULE_DIR"
  bash scripts/test-integration.sh
  
  if [ $? -eq 0 ]; then
    log "${GREEN}✅ Интеграционные тесты успешно пройдены.${NC}"
    return 0
  else
    log "${RED}❌ Ошибки в интеграционных тестах.${NC}"
    return 1
  fi
}

# Главная функция
main() {
  log "${BLUE}🚀 Начало процесса сборки и тестирования Instagram Scraper Bot${NC}"
  
  # Инициализация базы данных для разработки, если она еще не создана
  if [ ! -f "$DEV_DIR/sqlite.db" ]; then
    log "${YELLOW}🔄 Инициализация базы данных для разработки...${NC}"
    cd "$MODULE_DIR"
    bun run scripts/init-dev-db.ts
    
    if [ $? -ne 0 ]; then
      log "${RED}❌ Ошибка инициализации базы данных. Прерывание процесса.${NC}"
      return 1
    fi
  fi
  
  # 1. Проверка типов
  check_types
  if [ $? -ne 0 ]; then
    log "${RED}❌ Процесс сборки и тестирования прерван из-за ошибок типов.${NC}"
    return 1
  fi
  
  # 2. Сборка проекта
  build
  if [ $? -ne 0 ]; then
    log "${RED}❌ Процесс сборки и тестирования прерван из-за ошибок сборки.${NC}"
    return 1
  fi
  
  # 3. Запуск юнит-тестов
  run_unit_tests
  UNIT_TESTS_RESULT=$?
  
  # 4. Запуск интеграционных тестов
  run_integration_tests
  INTEGRATION_TESTS_RESULT=$?
  
  # Проверка результатов тестов
  if [ $UNIT_TESTS_RESULT -eq 0 ] && [ $INTEGRATION_TESTS_RESULT -eq 0 ]; then
    log "${GREEN}🎉 Все тесты успешно пройдены. Instagram Scraper Bot готов к использованию!${NC}"
    return 0
  else
    log "${RED}⚠️ Процесс тестирования завершен с ошибками. Проверьте результаты тестов.${NC}"
    return 1
  fi
}

# Запуск главной функции
main
exit $? 