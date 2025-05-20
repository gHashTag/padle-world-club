#!/bin/bash

# Скрипт для запуска тестов базы данных

# Цвета для вывода
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
RED="\033[0;31m"
BLUE="\033[0;34m"
NC="\033[0m" # No Color

echo -e "${BLUE}🧪 Запуск тестов для базы данных...${NC}"

# Запуск тестов для базы данных
export BUN_TEST_PATTERN="neon-adapter"
bun test 'src/__tests__/unit/adapters' --no-cache

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Тесты для базы данных не пройдены. Исправьте ошибки и попробуйте снова.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Тесты для базы данных пройдены успешно.${NC}"
exit 0
