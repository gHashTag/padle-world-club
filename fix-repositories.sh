#!/bin/bash

# Скрипт для исправления типов в репозиториях

# Список файлов репозиториев для исправления (исключаем уже исправленные)
repositories=(
  "src/repositories/booking-participant-repository.ts"
  "src/repositories/class-definition-repository.ts"
  "src/repositories/class-participant-repository.ts"
  "src/repositories/class-schedule-repository.ts"
  "src/repositories/court-repository.ts"
  "src/repositories/feedback-repository.ts"
  "src/repositories/game-player-repository.ts"
  "src/repositories/game-session-repository.ts"
  "src/repositories/notification-repository.ts"
  "src/repositories/order-repository.ts"
  "src/repositories/payment-repository.ts"
  "src/repositories/rating-change-repository.ts"
  "src/repositories/task-repository.ts"
  "src/repositories/tournament-match-repository.ts"
  "src/repositories/tournament-participant-repository.ts"
  "src/repositories/tournament-repository.ts"
  "src/repositories/tournament-team-repository.ts"
  "src/repositories/training-package-definition-repository.ts"
  "src/repositories/user-account-link-repository.ts"
  "src/repositories/user-training-package-repository.ts"
)

for repo in "${repositories[@]}"; do
  echo "Исправляем $repo..."
  
  # Заменяем импорт PostgresJsDatabase на DatabaseType
  sed -i '' 's/import { PostgresJsDatabase } from "drizzle-orm\/postgres-js";//g' "$repo"
  sed -i '' 's/import \* as schema from "\.\.\/db\/schema";//g' "$repo"
  
  # Добавляем импорт DatabaseType после других импортов
  sed -i '' '/from "\.\.\/db\/schema";$/a\
import { DatabaseType } from "./types";
' "$repo"
  
  # Заменяем тип в классе
  sed -i '' 's/private db: PostgresJsDatabase<typeof schema>;/private db: DatabaseType;/g' "$repo"
  sed -i '' 's/constructor(db: PostgresJsDatabase<typeof schema>)/constructor(db: DatabaseType)/g' "$repo"
  
  echo "Исправлен $repo"
done

echo "Все репозитории исправлены!"
