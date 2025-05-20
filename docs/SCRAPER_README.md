# 📷 Instagram Reels Scraper для Эстетической Медицины

Мультитенантный скрапер контента Instagram Reels с фокусом на нише эстетической медицины. Сервис автоматически собирает Reels по аккаунтам конкурентов и хэштегам, сохраняет их в базу данных Neon и предоставляет API для работы с собранными данными.

## 🔥 Возможности

- **Мультитенантная архитектура**: Поддержка нескольких пользователей и проектов
- **Скрапинг контента**: Сбор Reels из Instagram по
  - Аккаунтам конкурентов
  - Хэштегам
- **Фильтрация данных**:
  - По просмотрам (мин. просмотры)
  - По дате публикации (не старше X дней)
- **Удобное хранение**: Сохранение данных в Neon Database (PostgreSQL)
- **Автоматизация**: Скрипт для ежедневного скрапинга
- **API**: Множество функций для работы с данными

## 📊 Структура базы данных

Скрапер использует следующие таблицы в базе данных:

1. **Users**: Пользователи системы
2. **Projects**: Проекты пользователей
3. **CompetitorAccounts**: Аккаунты конкурентов
4. **TrackingHashtags**: Отслеживаемые хэштеги
5. **InstagramReels**: Данные о спарсенных Reels
6. **ContentSources**: Связь контента с источниками (конкурент/хэштег)
7. **UserContentInteractions**: Взаимодействия пользователей с контентом
8. **ParsingLogs**: Логи процесса парсинга

## 🚀 Начало работы

### Предварительные требования

- Node.js 18+ / Bun 1.0+
- Аккаунт в [Neon Database](https://neon.tech)
- Аккаунт в [Apify](https://apify.com)

### Установка

1. **Клонируйте репозиторий:**

   ```bash
   git clone <url-repo>
   cd <project-folder>
   ```

2. **Установите зависимости:**

   ```bash
   bun install
   # или
   npm install
   ```

3. **Создайте .env файл:**

   ```
   NEON_DATABASE_URL=postgres://user:password@host/database
   APIFY_TOKEN=your_apify_token
   DEMO_USER_ID=12345678 # ID пользователя Telegram для демо
   MIN_VIEWS=50000 # Минимальное количество просмотров для Reels
   MAX_AGE_DAYS=14 # Максимальный возраст Reels в днях
   ```

4. **Создайте структуру базы данных:**
   ```bash
   bun run src/agents/scraper/storage/rebuild-multi-tenant-tables.ts CONFIRM=YES
   ```

### Использование скриптов

#### Добавление и скрапинг аккаунтов конкурентов

```bash
bun run src/agents/scraper/scripts/seed-competitors.ts
```

Скрипт создаст пользователя, проект, добавит аккаунты конкурентов из списка и выполнит скрапинг для первого аккаунта.

#### Добавление и скрапинг хэштегов

```bash
bun run src/agents/scraper/scripts/seed-hashtags.ts
```

Скрипт добавит хэштеги из списка в проект и выполнит скрапинг для первого хэштега.

#### Запуск ежедневного скрапинга

```bash
bun run src/agents/scraper/scripts/run-daily-scraping.ts
```

Скрипт запустит скрапинг для всех активных пользователей, их проектов, аккаунтов конкурентов и хэштегов.

Для тестового запуска без реального скрапинга:

```bash
DRY_RUN=true bun run src/agents/scraper/scripts/run-daily-scraping.ts
```

## 📚 API скрапера

Скрапер предоставляет следующие функции:

### Управление пользователями и проектами

- `createUser(telegramId, username, firstName, lastName)` - Создание пользователя
- `getUserByTelegramId(telegramId)` - Получение пользователя по Telegram ID
- `getAllActiveUsers()` - Получение всех активных пользователей
- `createProject(userId, name, description, industry)` - Создание проекта
- `getProjectsByUserId(userId)` - Получение проектов пользователя

### Управление источниками данных

- `addCompetitorAccount(projectId, instagramUrl, accountName, notes, priority)` - Добавление аккаунта конкурента
- `getCompetitorAccounts(projectId, activeOnly)` - Получение аккаунтов конкурентов
- `addTrackingHashtag(projectId, hashtag, displayName, notes, priority)` - Добавление хэштега
- `getTrackingHashtags(projectId, activeOnly)` - Получение хэштегов

### Работа с контентом

- `scrapeInstagramReels(instagramUrl, options)` - Скрапинг Reels
- `saveReels(reels, projectId, sourceType, sourceId)` - Сохранение Reels в базу
- `getReels(projectId, filters)` - Получение Reels с фильтрацией
- `getProjectStats(projectId)` - Получение статистики по проекту

### Взаимодействие с контентом

- `addToFavorites(userId, reelId)` - Добавление в избранное
- `removeFromFavorites(userId, reelId)` - Удаление из избранного
- `hideReel(userId, reelId)` - Скрытие Reel
- `getReelInteraction(userId, reelId)` - Получение взаимодействия с Reel
- `getFavoriteReels(userId, limit, offset)` - Получение избранных Reels

### Логирование

- `logParsingRun(log)` - Логирование процесса скрапинга
- `getParsingLogs(projectId, limit)` - Получение логов скрапинга

## 🔧 Настройка

### Параметры скрапинга

В файле `.env` можно настроить следующие параметры:

```
MIN_VIEWS=50000 # Минимальное количество просмотров для Reels
MAX_AGE_DAYS=14 # Максимальный возраст Reels в днях
```

### Автоматизация скрапинга

Для ежедневного автоматического скрапинга можно настроить cron-задачу:

```bash
# Пример для crontab (скрапинг каждый день в 3:00 утра)
0 3 * * * cd /path/to/project && bun run src/agents/scraper/scripts/run-daily-scraping.ts >> logs/scraper.log 2>&1
```

## 📝 Примеры использования

### Базовый пример скрапинга

```typescript
import {
  initializeNeonStorage,
  closeNeonStorage,
  createUser,
  createProject,
  addCompetitorAccount,
  scrapeInstagramReels,
  saveReels,
} from "./src/agents/scraper"

async function example() {
  await initializeNeonStorage()

  // Создаем пользователя
  const user = await createUser(123456789, "example_user", "Example", "User")

  // Создаем проект
  const project = await createProject(
    user.id,
    "Aesthetic Clinic",
    "Project for tracking competitors",
    "Aesthetic Medicine"
  )

  // Добавляем аккаунт конкурента
  const competitor = await addCompetitorAccount(
    project.id,
    "https://www.instagram.com/example_clinic"
  )

  // Скрапим данные
  const reels = await scrapeInstagramReels(competitor.instagram_url, {
    apifyToken: "your_apify_token",
    minViews: 50000,
    maxAgeDays: 14,
  })

  // Сохраняем в базу
  const savedCount = await saveReels(
    reels,
    project.id,
    "competitor",
    competitor.id
  )

  console.log(`Сохранено ${savedCount} новых Reels`)

  await closeNeonStorage()
}

example()
```

## 📄 Лицензия

MIT
