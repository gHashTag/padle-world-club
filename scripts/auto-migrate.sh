#!/bin/bash

# Автоматическое применение миграций Drizzle без интерактивного подтверждения
# Использует expect для автоматического ответа "Yes" на запрос подтверждения

echo "🔄 Автоматическое применение миграций базы данных..."

# Проверяем есть ли expect
if ! command -v expect &> /dev/null; then
    echo "⚠️  expect не установлен. Устанавливаем..."
    
    # Для macOS
    if [[ "$OSTYPE" == "darwin"* ]]; then
        if command -v brew &> /dev/null; then
            brew install expect
        else
            echo "❌ Homebrew не найден. Установите expect вручную: brew install expect"
            exit 1
        fi
    # Для Linux
    elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
        if command -v apt-get &> /dev/null; then
            sudo apt-get update && sudo apt-get install -y expect
        elif command -v yum &> /dev/null; then
            sudo yum install -y expect
        else
            echo "❌ Не удалось установить expect автоматически. Установите вручную."
            exit 1
        fi
    else
        echo "❌ Неподдерживаемая ОС. Установите expect вручную."
        exit 1
    fi
fi

# Создаем временный expect скрипт
cat > /tmp/drizzle_auto_push.exp << 'EOF'
#!/usr/bin/expect -f

set timeout 60
spawn npx drizzle-kit push

expect {
    "Yes, I want to execute all statements" {
        send "\r"
        exp_continue
    }
    "No, abort" {
        send "\033\[B\r"
        exp_continue
    }
    eof {
        exit 0
    }
    timeout {
        puts "Timeout waiting for drizzle-kit response"
        exit 1
    }
}
EOF

# Делаем скрипт исполняемым
chmod +x /tmp/drizzle_auto_push.exp

# Запускаем автоматическое применение миграций
echo "🚀 Запускаем drizzle-kit push с автоматическим подтверждением..."
/tmp/drizzle_auto_push.exp

# Проверяем результат
if [ $? -eq 0 ]; then
    echo "✅ Миграции успешно применены!"
    
    # Удаляем временный файл
    rm -f /tmp/drizzle_auto_push.exp
    
    echo "🌱 Теперь можно запустить наполнение БД: npm run seed:db"
else
    echo "❌ Ошибка при применении миграций"
    rm -f /tmp/drizzle_auto_push.exp
    exit 1
fi
