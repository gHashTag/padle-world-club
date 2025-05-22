FROM oven/bun:latest

WORKDIR /app

# Копируем только файлы зависимостей для кэширования Docker'ом
# и устанавливаем зависимости.
COPY package.json bun.lockb ./
RUN bun install --frozen-lockfile

# Остальное (копирование исходного кода, сборка) будет сделано
# через 'install' скрипт в .cursor/environment.json после клонирования репозитория агентом.
# Dockerfile не должен COPY проект, он будет склонирован с GitHub.
# CMD также не нужен здесь, т.к. агент будет использовать 'start' из environment.json.
