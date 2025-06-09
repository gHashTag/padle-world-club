# 🕉️ Padle World Club - Obsidian Database Integration

**Интерактивная работа с базой данных через Obsidian с двусторонней синхронизацией**

## 🎯 Что это дает

- ✅ **Интерактивные таблицы** - редактируйте данные прямо в Obsidian
- ✅ **Двусторонняя синхронизация** - изменения сохраняются в базе данных
- ✅ **Совместная работа** - делитесь документами с командой
- ✅ **Real-time обновления** - видите изменения других пользователей
- ✅ **Мощная аналитика** - создавайте дашборды и отчеты

## 🚀 Быстрый старт

### 1. Установка Obsidian и плагинов

1. **Скачайте Obsidian**: https://obsidian.md/download
2. **Создайте новый vault** или используйте существующий
3. **Установите необходимые плагины**:

#### Обязательные плагины:

```bash
# В Obsidian: Settings → Community Plugins → Browse
- Dataview
- DataEdit (https://github.com/unxok/dataedit)
- Templater
- Advanced Tables
```

#### Рекомендуемые плагины:

```bash
- Relay (для совместной работы)
- Metadata Menu (для редактирования метаданных)
- Charts (для визуализации)
- Calendar (для планирования)
```

### 2. Настройка структуры vault

Создайте следующую структуру папок в вашем vault:

```
📁 Padle World Club/
├── 📁 Database/           # Интерактивные таблицы БД
├── 📁 Templates/          # Шаблоны для новых таблиц
├── 📁 Dashboards/         # Дашборды и аналитика
├── 📁 Shared/             # Совместные документы
└── 📁 Reports/            # Отчеты и экспорты
```

### 3. Автоматическая настройка

Запустите наш скрипт автоматической настройки:

```bash
# Клонируйте репозиторий настройки
git clone https://github.com/padle-world-club/obsidian-integration.git

# Перейдите в папку
cd obsidian-integration

# Установите зависимости
npm install

# Настройте переменные окружения
cp .env.example .env
# Отредактируйте .env файл с вашими настройками

# Запустите настройку
npm run setup
```

**Или выполните настройку вручную** (см. раздел "Ручная настройка")

## 🔧 Ручная настройка

### 4. Настройка синхронизации

1. **Скопируйте файл конфигурации**:

   - Скачайте `obsidian-config.json` из этого репозитория
   - Поместите в корень вашего vault

2. **Настройте API подключение**:

   ```json
   {
     "database": {
       "api_base_url": "https://your-api.padle-world-club.com/api",
       "auth": {
         "type": "bearer_token",
         "token": "YOUR_API_TOKEN_HERE"
       }
     }
   }
   ```

3. **Получите API токен**:
   - Обратитесь к администратору системы
   - Или создайте токен в личном кабинете

### 5. Создание первой интерактивной таблицы

1. **Создайте новый файл**: `Database/AI-Suggestion-Logs.md`

2. **Вставьте следующий код**:

````markdown
---
title: AI Suggestion Logs Database
type: database
table: ai_suggestion_log
last_sync: 2025-01-29T10:00:00Z
sync_enabled: true
---

# 🤖 AI Suggestion Logs Database

> **Интерактивная таблица** - изменения автоматически синхронизируются с базой данных

## 📊 Интерактивная Таблица (DataEdit)

```dataedit
TABLE
  suggestion_type as "Тип",
  confidence_score as "Уверенность",
  was_accepted as "Принято",
  user_feedback as "Отзыв",
  model_version as "Модель",
  created_at as "Создано"
FROM "ai_suggestion_log"
SORT created_at DESC
LIMIT 50
```
````

## 🔧 Настройки синхронизации

- **Автосинхронизация**: включена
- **Интервал**: каждые 5 минут
- **Направление**: двусторонняя
- **API Endpoint**: `/api/ai-suggestion-logs`

````

3. **Запустите синхронизацию**:
   ```bash
   node scripts/obsidian-db-sync.mjs watch
````

## 👥 Совместная работа

### Вариант 1: Obsidian Publish (Рекомендуется для клиентов)

**Стоимость**: $8/месяц  
**Преимущества**: Простота настройки, веб-доступ, поиск

1. **Настройка Obsidian Publish**:

   - Откройте Settings → Core Plugins → Publish
   - Создайте новый сайт
   - Выберите папки для публикации

2. **Публикация таблиц**:

   - Выберите папку `Database/`
   - Нажмите "Publish"
   - Поделитесь ссылкой с командой

3. **Доступ клиентам**:
   ```
   https://publish.obsidian.md/your-site-name/Database/AI-Suggestion-Logs
   ```

### Вариант 2: Relay Plugin (Real-time сотрудничество)

**Стоимость**: Бесплатно (self-hosted)  
**Преимущества**: Real-time редактирование, живые курсоры

1. **Установите Relay Plugin**:

   - Settings → Community Plugins
   - Найдите "Relay"
   - Установите и включите

2. **Создайте общую папку**:

   - Выберите папку `Shared/`
   - Нажмите на иконку Relay
   - Пригласите пользователей по email

3. **Self-hosting** (опционально):
   ```bash
   git clone https://github.com/No-Instructions/relay-server-template
   cd relay-server-template
   npm install
   npm start
   ```

### Вариант 3: Git + GitHub Pages (Для разработчиков)

**Стоимость**: Бесплатно  
**Преимущества**: Версионирование, автопубликация

1. **Настройте Git репозиторий**:

   ```bash
   cd your-obsidian-vault
   git init
   git remote add origin https://github.com/your-org/obsidian-database.git
   ```

2. **Установите GitHub Publisher plugin**
3. **Настройте автопубликацию на GitHub Pages**

## 📊 Использование интерактивных таблиц

### Редактирование данных

1. **Кликните на ячейку** в DataEdit таблице
2. **Измените значение**
3. **Нажмите Enter** для сохранения
4. **Изменения автоматически** сохранятся в БД

### Поддерживаемые типы данных

- ✅ **Текст**: Прямое редактирование
- ✅ **Числа**: Валидация формата
- ✅ **Булевы**: Checkbox или dropdown
- ✅ **Даты**: Date picker
- ✅ **JSON**: Expandable editor

### Создание новых записей

````markdown
## ➕ Создать новую запись

```dataedit
INSERT INTO "ai_suggestion_log"
VALUES (
  suggestion_type: "game_matching",
  user_feedback: "Excellent suggestion!",
  was_accepted: true
)
```
````

````

## 📈 Дашборды и аналитика

### Создание дашборда

Создайте файл `Dashboards/AI-Analytics.md`:

```markdown
# 📊 AI Analytics Dashboard

## 🎯 Статистика принятых предложений

```dataview
TABLE
  count(rows) as "Всего",
  sum(was_accepted) as "Принято",
  round(sum(was_accepted) / count(rows) * 100, 1) + "%" as "Процент принятых"
FROM "Database"
WHERE type = "ai_suggestion_log"
GROUP BY suggestion_type
````

## 📈 График эффективности по времени

```chart
type: line
data: |
  x, Принято, Отклонено
  Jan, 45, 15
  Feb, 52, 8
  Mar, 48, 12
```

````

### Автообновляемые виджеты

```markdown
```dataview
TABLE
  suggestion_type,
  confidence_score,
  was_accepted
FROM "Database/AI-Suggestion-Logs"
WHERE created_at > date(today) - dur(7 days)
SORT created_at DESC
LIMIT 10
````

````

## 🔧 Устранение неполадок

### Проблемы синхронизации

1. **Проверьте API токен**:
   ```bash
   curl -H "Authorization: Bearer YOUR_TOKEN" \
        https://api.padle-world-club.com/api/ai-suggestion-logs
````

2. **Проверьте логи синхронизации**:

   ```bash
   tail -f logs/obsidian-sync.log
   ```

3. **Перезапустите синхронизацию**:
   ```bash
   node scripts/obsidian-db-sync.mjs export
   ```

### Конфликты данных

- **Стратегия**: Server wins (сервер всегда прав)
- **Backup**: Автоматическое создание backup перед конфликтом
- **Уведомления**: Popup в Obsidian при конфликте

### Проблемы с плагинами

1. **DataEdit не работает**:

   - Проверьте версию плагина (должна быть ≥ 0.0.3)
   - Перезагрузите Obsidian
   - Проверьте синтаксис dataview запроса

2. **Relay недоступен**:
   - Проверьте интернет соединение
   - Убедитесь что сервер запущен
   - Проверьте firewall настройки

## 📞 Поддержка

### Контакты

- **Email**: support@padle-world-club.com
- **Telegram**: @padle_support
- **GitHub Issues**: https://github.com/padle-world-club/obsidian-integration/issues

### Документация

- **API Reference**: https://api.padle-world-club.com/docs
- **Obsidian Plugins**: https://obsidian.md/plugins
- **DataEdit Plugin**: https://github.com/unxok/dataedit

### Обучающие материалы

- 🎥 **Видеоуроки**: https://youtube.com/padle-world-club
- 📚 **Текстовые гайды**: https://docs.padle-world-club.com
- 💬 **Вебинары**: Каждую среду в 15:00 MSK

---

**🕉️ Создано с любовью командой Padle World Club**  
_"Данные должны быть живыми и интерактивными"_
