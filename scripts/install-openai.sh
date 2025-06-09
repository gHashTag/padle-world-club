#!/bin/bash

# 📦 Установка OpenAI пакета для реального STT

echo "📦 Устанавливаем OpenAI пакет..."

# Пробуем разные пакетные менеджеры
if command -v bun &> /dev/null; then
    echo "🟡 Пробуем bun..."
    bun add openai
elif command -v yarn &> /dev/null; then
    echo "🔵 Пробуем yarn..."
    yarn add openai
elif command -v npm &> /dev/null; then
    echo "🟢 Пробуем npm..."
    npm install openai
else
    echo "❌ Не найден пакетный менеджер!"
    exit 1
fi

echo "✅ OpenAI пакет установлен!"
echo ""
echo "🔑 Теперь добавьте API ключ в .env файл:"
echo "OPENAI_API_KEY=sk-proj-ваш_ключ_здесь"
echo ""
echo "🚀 Перезапустите бота: bun dev"
