#!/bin/bash

# Финальное исправление репозиториев

# Список файлов для исправления
repositories=(
  "src/repositories/game-player-repository.ts"
  "src/repositories/notification-repository.ts"
  "src/repositories/order-repository.ts"
  "src/repositories/rating-change-repository.ts"
  "src/repositories/task-repository.ts"
  "src/repositories/tournament-match-repository.ts"
  "src/repositories/tournament-participant-repository.ts"
  "src/repositories/tournament-repository.ts"
  "src/repositories/tournament-team-repository.ts"
)

for repo in "${repositories[@]}"; do
  echo "Исправляем $repo..."
  
  # Исправляем конструктор
  sed -i '' 's/constructor(private db: PostgresJsDatabase<typeof schema>)/constructor(private db: DatabaseType)/g' "$repo"
  
  # Добавляем импорт schema если его нет
  if ! grep -q "import \* as schema from" "$repo"; then
    sed -i '' '/from "\.\.\/db\/schema";$/a\
import * as schema from "../db/schema";
' "$repo"
  fi
  
  echo "Исправлен $repo"
done

echo "Все репозитории исправлены!"
