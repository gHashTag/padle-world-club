#!/bin/bash

# Скрипт для запуска всех тестов

# Цвета для вывода
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
RED="\033[0;31m"
BLUE="\033[0;34m"
NC="\033[0m" # No Color

echo -e "${BLUE}🧪 Запуск всех тестов...${NC}"

# Запуск тестов для Telegram сцен
echo -e "${YELLOW}🧪 Запуск тестов для Telegram сцен...${NC}"
bash scripts/test-telegram-scenes.sh
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Тесты для Telegram сцен не пройдены. Исправьте ошибки и попробуйте снова.${NC}"
    exit 1
fi

# Запуск тестов для утилит
echo -e "${YELLOW}🧪 Запуск тестов для утилит...${NC}"
bash scripts/test-utils.sh
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Тесты для утилит не пройдены. Исправьте ошибки и попробуйте снова.${NC}"
    exit 1
fi

# Запуск тестов для базы данных
echo -e "${YELLOW}🧪 Запуск тестов для базы данных...${NC}"
bash scripts/test-database.sh
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Тесты для базы данных не пройдены. Исправьте ошибки и попробуйте снова.${NC}"
    exit 1
fi

# Запуск интеграционных тестов
echo -e "${YELLOW}🧪 Запуск интеграционных тестов...${NC}"
bash scripts/test-integration-simple.sh
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Интеграционные тесты не пройдены. Исправьте ошибки и попробуйте снова.${NC}"
    exit 1
fi

# Запуск E2E тестов
echo -e "${YELLOW}🧪 Запуск E2E тестов...${NC}"
bash scripts/test-e2e.sh
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ E2E тесты не пройдены. Исправьте ошибки и попробуйте снова.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Все тесты пройдены успешно.${NC}"
exit 0
