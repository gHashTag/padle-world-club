#!/bin/bash

# Скрипт для запуска тестов neon-adapter с предварительной загрузкой мока

# Цвета для вывода
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
RED="\033[0;31m"
BLUE="\033[0;34m"
NC="\033[0m" # No Color

echo -e "${BLUE}🧪 Запуск тестов для neon-adapter...${NC}"

# Запуск тестов для neon-adapter с предварительной загрузкой мока
# Устанавливаем переменную окружения, чтобы тесты запускались
export BUN_TEST_PATTERN="neon-adapter"
bun test src/__tests__/unit/adapters/neon-adapter.test.ts --preload src/__tests__/mocks/pg-mock.ts --no-cache

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Тесты для neon-adapter не пройдены. Исправьте ошибки и попробуйте снова.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Тесты для neon-adapter пройдены успешно.${NC}"
exit 0
