#!/bin/bash

# Telegram Bot Starter Kit - Скрипт сборки и тестирования
#
# Этот скрипт выполняет проверку типов, сборку (если есть) и тестирование проекта.

# Цвета для вывода
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
RED="\033[0;31m"
BLUE="\033[0;34m"
NC="\033[0m" # No Color

# Директории
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT_DIR="$(dirname "$SCRIPT_DIR")" # Корень проекта - это родительская директория для scripts/
LOGS_DIR="$SCRIPT_DIR/.logs"

# Лог-файл
LOG_FILE="$LOGS_DIR/build-and-test.log"

# Создаем директорию для логов, если не существует
if [ ! -d "$LOGS_DIR" ]; then
  mkdir -p "$LOGS_DIR"
fi

# Создаем/очищаем лог-файл
echo "🚀 Лог сборки и тестирования Telegram Bot Starter Kit ($(date '+%Y-%m-%d %H:%M:%S'))" > "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Функция логирования
log() {
  local timestamp=$(date "+%Y-%m-%d %H:%M:%S")
  echo -e "$timestamp $1" | tee -a "$LOG_FILE"
}

# Функция для очистки node_modules и переустановки зависимостей
# Может быть вызвана с аргументом: ./scripts/build-and-test.sh clean
clean_and_install() {
  log "${YELLOW}🧹 Очистка node_modules и переустановка зависимостей...${NC}"
  
  cd "$PROJECT_ROOT_DIR"
  
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
  
  cd "$PROJECT_ROOT_DIR"
  bun run typecheck
  
  if [ $? -eq 0 ]; then
    log "${GREEN}✅ Проверка типов успешно пройдена.${NC}"
    return 0
  else
    log "${RED}❌ Ошибки при проверке типов. Исправьте их перед продолжением.${NC}"
    return 1
  fi
}

# Функция для сборки проекта (если необходима)
# В текущем стартер-ките на TypeScript/Bun явная сборка перед запуском тестов может не требоваться,
# так как Bun выполняет TypeScript "на лету". Оставляем на случай, если появится шаг сборки.
build_project() {
  log "${YELLOW}🔨 Сборка проекта (если настроена)...${NC}"
  
  cd "$PROJECT_ROOT_DIR"
  if [ -f "package.json" ] && grep -q '"build"' package.json; then
    bun run build
    if [ $? -eq 0 ]; then
      log "${GREEN}✅ Проект успешно собран.${NC}"
      return 0
    else
      log "${RED}❌ Ошибка при сборке проекта.${NC}"
      return 1
    fi
  else
    log "${YELLOW}ℹ️  Команда 'bun run build' не найдена в package.json или package.json отсутствует. Пропуск шага сборки.${NC}"
    return 0 # Считаем успешным, если сборка не требуется
  fi
}

# Функция для запуска тестов (юнит и интеграционные вместе)
run_tests() {
  log "${YELLOW}🧪 Запуск тестов (юнит и интеграционные)...${NC}"
  
  cd "$PROJECT_ROOT_DIR"
  # Запускаем все тесты, Vitest сам найдет их по конфигурации
  bun test
  
  if [ $? -eq 0 ]; then
    log "${GREEN}✅ Тесты успешно пройдены.${NC}"
    return 0
  else
    log "${RED}❌ Ошибки в тестах.${NC}"
    return 1
  fi
}

# Главная функция
main() {
  log "${BLUE}🚀 Начало процесса сборки и тестирования для Telegram Bot Starter Kit${NC}"
  
  # Опциональная очистка и установка зависимостей
  if [ "$1" == "clean" ]; then
    clean_and_install
    if [ $? -ne 0 ]; then
      log "${RED}❌ Процесс прерван из-за ошибок при установке зависимостей.${NC}"
      return 1
    fi
  fi

  # 1. Проверка типов
  check_types
  if [ $? -ne 0 ]; then
    log "${RED}❌ Процесс сборки и тестирования прерван из-за ошибок типов.${NC}"
    return 1
  fi
  
  # 2. Сборка проекта (если есть)
  build_project
  if [ $? -ne 0 ]; then
    log "${RED}❌ Процесс сборки и тестирования прерван из-за ошибок сборки.${NC}"
    return 1
  fi
  
  # 3. Запуск тестов
  run_tests
  TESTS_RESULT=$?
  
  # Проверка результатов тестов
  if [ $TESTS_RESULT -eq 0 ]; then
    log "${GREEN}🎉 Все проверки и тесты успешно пройдены. Проект готов!${NC}"
    return 0
  else
    log "${RED}⚠️ Процесс тестирования завершен с ошибками. Проверьте результаты тестов.${NC}"
    return 1
  fi
}

# Запуск главной функции
main "$@"
exit $? 