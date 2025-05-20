#!/bin/bash

# Скрипт для запуска интеграционных тестов

# Цвета для вывода
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
RED="\033[0;31m"
BLUE="\033[0;34m"
NC="\033[0m" # No Color

echo -e "${BLUE}🧪 Запуск интеграционных тестов...${NC}"

# Запуск интеграционных тестов
bun test 'src/__tests__/integration/bot-integration.test.ts' 'src/__tests__/integration/bot-adapter-integration.test.ts' --no-cache

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Интеграционные тесты не пройдены. Исправьте ошибки и попробуйте снова.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Интеграционные тесты пройдены успешно.${NC}"
exit 0
