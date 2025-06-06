#!/bin/bash

# Цвета для вывода
GREEN="\033[0;32m"
YELLOW="\033[0;33m"
RED="\033[0;31m"
BLUE="\033[0;34m"
NC="\033[0m" # No Color

# Проверка аргументов
if [ $# -eq 0 ]; then
  echo -e "${RED}Ошибка: Необходимо указать путь к тестовому файлу.${NC}"
  echo -e "Использование: $0 <путь_к_тестовому_файлу>"
  echo -e "Пример: $0 src/__tests__/unit/scenes/project-scene-enter.test.ts"
  exit 1
fi

TEST_FILE=$1

# Проверка существования файла
if [ ! -f "$TEST_FILE" ]; then
  echo -e "${RED}Ошибка: Файл $TEST_FILE не существует.${NC}"
  exit 1
fi

# Функция для проверки типов
check_types() {
  echo -e "${BLUE}🔍 Проверка типов...${NC}"
  bun run typecheck
  if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Проверка типов не пройдена. Исправьте ошибки и попробуйте снова.${NC}"
    return 1
  fi
  echo -e "${GREEN}✅ Проверка типов пройдена успешно.${NC}"
  return 0
}

# Функция для запуска тестов
run_test() {
  echo -e "${BLUE}🧪 Запуск теста $TEST_FILE...${NC}"
  bun test "$TEST_FILE"
  return $?
}

# Шаг 1: Красный (Red) - убедиться, что тест падает
echo -e "${RED}🔴 Шаг 1: Красный (Red) - убедиться, что тест падает${NC}"
check_types
if [ $? -ne 0 ]; then
  echo -e "${RED}❌ Невозможно продолжить TDD-цикл. Сначала исправьте ошибки типов.${NC}"
  exit 1
fi

run_test
TEST_RESULT=$?

if [ $TEST_RESULT -eq 0 ]; then
  echo -e "${YELLOW}⚠️ Тест уже проходит. Для TDD-цикла тест должен сначала падать.${NC}"
  echo -e "${YELLOW}⚠️ Возможно, вы уже реализовали функциональность или тест неправильно написан.${NC}"
  
  read -p "Хотите продолжить TDD-цикл? (y/n): " CONTINUE
  if [[ $CONTINUE != "y" && $CONTINUE != "Y" ]]; then
    echo -e "${YELLOW}⚠️ TDD-цикл прерван.${NC}"
    exit 0
  fi
else
  echo -e "${GREEN}✅ Тест падает, как и ожидалось. Переходим к следующему шагу.${NC}"
fi

# Шаг 2: Зеленый (Green) - реализовать минимальную функциональность
echo -e "${GREEN}🟢 Шаг 2: Зеленый (Green) - реализуйте минимальную функциональность${NC}"
echo -e "${YELLOW}⚠️ Напишите минимальный код, чтобы тест прошел.${NC}"
echo -e "${YELLOW}⚠️ После написания кода нажмите Enter для продолжения...${NC}"
read

# Цикл проверки типов и запуска тестов до успеха
while true; do
  check_types
  if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Проверка типов не пройдена. Исправьте ошибки и нажмите Enter для повторной проверки...${NC}"
    read
    continue
  fi

  run_test
  TEST_RESULT=$?

  if [ $TEST_RESULT -ne 0 ]; then
    echo -e "${RED}❌ Тест все еще падает. Исправьте код и нажмите Enter для повторной проверки...${NC}"
    read
    continue
  fi

  echo -e "${GREEN}✅ Тест проходит успешно! Переходим к следующему шагу.${NC}"
  break
done

# Шаг 3: Рефакторинг (Refactor) - улучшить код без изменения функциональности
echo -e "${BLUE}♻️ Шаг 3: Рефакторинг (Refactor) - улучшите код без изменения функциональности${NC}"
echo -e "${YELLOW}⚠️ Улучшите код, сохраняя его работоспособность.${NC}"
echo -e "${YELLOW}⚠️ После рефакторинга нажмите Enter для продолжения...${NC}"
read

# Проверка, что после рефакторинга тесты все еще проходят
check_types
if [ $? -ne 0 ]; then
  echo -e "${RED}❌ После рефакторинга проверка типов не пройдена. Исправьте ошибки и запустите скрипт заново.${NC}"
  exit 1
fi

run_test
TEST_RESULT=$?

if [ $TEST_RESULT -ne 0 ]; then
  echo -e "${RED}❌ После рефакторинга тест падает. Исправьте ошибки и запустите скрипт заново.${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Тест проходит успешно после рефакторинга!${NC}"
echo -e "${GREEN}✅ TDD-цикл завершен успешно!${NC}"

# Предложение запустить все тесты
echo -e "${YELLOW}⚠️ Рекомендуется запустить все тесты, чтобы убедиться, что ничего не сломалось.${NC}"
read -p "Запустить все тесты? (y/n): " RUN_ALL_TESTS
if [[ $RUN_ALL_TESTS == "y" || $RUN_ALL_TESTS == "Y" ]]; then
  echo -e "${BLUE}🧪 Запуск всех тестов...${NC}"
  bun test
  if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Некоторые тесты не прошли. Исправьте ошибки перед коммитом.${NC}"
    exit 1
  fi
  echo -e "${GREEN}✅ Все тесты прошли успешно!${NC}"
fi

echo -e "${GREEN}🎉 Поздравляем! Вы успешно завершили TDD-цикл!${NC}"
exit 0
