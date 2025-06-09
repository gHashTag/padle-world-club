#!/bin/bash

# Performance Testing Script
# Скрипт для запуска нагрузочного тестирования

set -e

echo "🚀 Starting Performance Testing Suite"
echo "======================================"

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Функция для логирования
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Проверяем, что мы в корне проекта
if [ ! -f "package.json" ]; then
    log_error "Запустите скрипт из корня проекта"
    exit 1
fi

# Проверяем наличие необходимых зависимостей
log_info "Проверка зависимостей..."
if ! command -v bun &> /dev/null; then
    log_error "Bun не установлен. Установите Bun для запуска тестов."
    exit 1
fi

# Проверяем наличие autocannon
if ! bun pm ls | grep -q "autocannon"; then
    log_error "Autocannon не установлен. Запустите: bun add -D autocannon"
    exit 1
fi

log_success "Все зависимости найдены"

# Проверяем типы перед запуском тестов
log_info "Проверка типов TypeScript..."
if ! bun run typecheck; then
    log_error "Ошибки типов найдены. Исправьте их перед запуском performance тестов."
    exit 1
fi
log_success "Типы проверены успешно"

# Создаем директорию для отчетов, если её нет
mkdir -p reports/performance

# Функция для запуска конкретного performance теста
run_performance_test() {
    local test_file=$1
    local test_name=$2

    log_info "Запуск $test_name..."

    # Запускаем тест и сохраняем результат
    if bun test "$test_file" > "reports/performance/${test_name}-$(date +%Y%m%d-%H%M%S).log" 2>&1; then
        log_success "$test_name завершен успешно"
        return 0
    else
        log_error "$test_name завершился с ошибками"
        return 1
    fi
}

# Основная функция запуска всех performance тестов
run_all_performance_tests() {
    log_info "Запуск всех performance тестов..."

    local failed_tests=0
    local total_tests=0

    # Список performance тестов
    declare -a tests=(
        "src/api/__tests__/performance/users-api.test.ts:Users API Performance"
        "src/api/__tests__/performance/venues-api.test.ts:Venues API Performance"
        "src/api/__tests__/performance/database-stress.test.ts:Database Stress Testing"
        "src/api/__tests__/performance/memory-usage.test.ts:Memory Usage Testing"
        "src/api/__tests__/performance/response-time-benchmarks.test.ts:Response Time Benchmarks"
    )

    # Запускаем каждый тест
    for test_info in "${tests[@]}"; do
        IFS=':' read -r test_file test_name <<< "$test_info"

        if [ -f "$test_file" ]; then
            total_tests=$((total_tests + 1))
            if ! run_performance_test "$test_file" "$test_name"; then
                failed_tests=$((failed_tests + 1))
            fi

            # Пауза между тестами для восстановления системы
            log_info "Пауза 5 секунд между тестами..."
            sleep 5
        else
            log_warning "Файл теста не найден: $test_file"
        fi
    done

    # Выводим итоговую статистику
    echo ""
    echo "======================================"
    log_info "Итоги Performance Testing:"
    log_info "Всего тестов: $total_tests"
    log_info "Успешных: $((total_tests - failed_tests))"

    if [ $failed_tests -eq 0 ]; then
        log_success "Все performance тесты прошли успешно! 🎉"
        return 0
    else
        log_error "Неудачных: $failed_tests"
        log_error "Некоторые performance тесты завершились с ошибками"
        return 1
    fi
}

# Функция для запуска быстрых performance тестов
run_quick_performance_tests() {
    log_info "Запуск быстрых performance тестов..."

    # Запускаем только Users API тест как быстрый smoke test
    if run_performance_test "src/api/__tests__/performance/users-api.test.ts" "Quick Users API Performance"; then
        log_success "Быстрые performance тесты прошли успешно! 🎉"
        return 0
    else
        log_error "Быстрые performance тесты завершились с ошибками"
        return 1
    fi
}

# Функция для генерации отчета
generate_performance_report() {
    log_info "Генерация отчета о производительности..."

    local report_file="reports/performance/summary-$(date +%Y%m%d-%H%M%S).md"

    cat > "$report_file" << EOF
# Performance Testing Report

**Дата:** $(date)
**Проект:** Padle World Club API

## Обзор

Этот отчет содержит результаты нагрузочного тестирования API endpoints.

## Тестируемые компоненты

- **Users API:** Регистрация, аутентификация, профиль
- **Venues API:** Создание, чтение, поиск площадок

## Конфигурация тестов

- **Light:** 5 соединений, 5 секунд
- **Medium:** 10 соединений, 10 секунд
- **Heavy:** 20 соединений, 15 секунд
- **Stress:** 50 соединений, 30 секунд

## Критерии успеха

- **Ошибки:** < 1-5% в зависимости от типа теста
- **Latency P99:** < 500ms-3s в зависимости от операции
- **RPS:** > 10-50 в зависимости от операции

## Результаты

Подробные результаты см. в логах тестов в директории reports/performance/

## Рекомендации

1. Мониторить производительность регулярно
2. Оптимизировать медленные endpoints
3. Настроить алерты на деградацию производительности

EOF

    log_success "Отчет сохранен: $report_file"
}

# Обработка аргументов командной строки
case "${1:-all}" in
    "all")
        run_all_performance_tests
        exit_code=$?
        generate_performance_report
        exit $exit_code
        ;;
    "quick")
        run_quick_performance_tests
        exit $?
        ;;
    "users")
        run_performance_test "src/api/__tests__/performance/users-api.test.ts" "Users API Performance"
        exit $?
        ;;
    "venues")
        run_performance_test "src/api/__tests__/performance/venues-api.test.ts" "Venues API Performance"
        exit $?
        ;;
    "database")
        run_performance_test "src/api/__tests__/performance/database-stress.test.ts" "Database Stress Testing"
        exit $?
        ;;
    "memory")
        run_performance_test "src/api/__tests__/performance/memory-usage.test.ts" "Memory Usage Testing"
        exit $?
        ;;
    "benchmarks")
        run_performance_test "src/api/__tests__/performance/response-time-benchmarks.test.ts" "Response Time Benchmarks"
        exit $?
        ;;
    "report")
        generate_performance_report
        exit 0
        ;;
    "help"|"-h"|"--help")
        echo "Использование: $0 [команда]"
        echo ""
        echo "Команды:"
        echo "  all        - Запустить все performance тесты (по умолчанию)"
        echo "  quick      - Запустить быстрые performance тесты"
        echo "  users      - Запустить только тесты Users API"
        echo "  venues     - Запустить только тесты Venues API"
        echo "  database   - Запустить только тесты Database Stress"
        echo "  memory     - Запустить только тесты Memory Usage"
        echo "  benchmarks - Запустить только тесты Response Time Benchmarks"
        echo "  report     - Сгенерировать отчет"
        echo "  help       - Показать эту справку"
        echo ""
        echo "Примеры:"
        echo "  $0 all"
        echo "  $0 quick"
        echo "  $0 database"
        echo "  $0 memory"
        exit 0
        ;;
    *)
        log_error "Неизвестная команда: $1"
        log_info "Используйте '$0 help' для справки"
        exit 1
        ;;
esac
