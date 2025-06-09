---
title: "🧠 MODEL - GAME_SESSION (Activity Node)"
table_name: "game_session"
model_type: "activity_node"
layer: "gaming"
connections: 4
tags: [model, game_session, activity_node, gaming_layer]
---

# 🎮 GAME_SESSION (Activity Node)
## Активный Узел Игровой Системы

[[Technical/README|← Техническая документация]]

## 🧠 **Роль в "Втором Мозге"**

**GAME_SESSION** - это **активный узел**, который представляет конкретную игровую активность и является центром игрового слоя системы.

### 🎯 **Функции Активного Узла**
- **Игровая активность** - конкретная игра в реальном времени
- **Связь участников** - объединяет игроков в одну сессию
- **Источник метрик** - генерирует данные для рейтингов
- **Аналитический центр** - основа для игровой статистики

## 📊 **Структура Модели**

### 🔑 **Ключевые Поля**
```sql
- id: UUID (Primary Key)
- venue_id: UUID (FK → venue.id)
- court_id: UUID (FK → court.id)
- booking_id: UUID (FK → booking.id)
- host_user_id: UUID (FK → user.id)
- created_by_user_id: UUID (FK → user.id)
- game_type: ENUM (singles, doubles, mixed_doubles)
- status: ENUM (waiting_for_players, active, paused, completed, cancelled)
- max_players: INTEGER
- current_players: INTEGER
- start_time: TIMESTAMP WITH TIME ZONE
- end_time: TIMESTAMP WITH TIME ZONE
- score: JSONB (детальный счет игры)
```

### 🔗 **Foreign Key Связи**
- **venue_id** → [[🧠 MODEL - VENUE (Spatial Hub)|🏟️ VENUE]]
- **court_id** → [[🧠 MODEL - COURT (Resource Node)|🎾 COURT]]
- **booking_id** → [[🧠 MODEL - BOOKING (Temporal Node)|📅 BOOKING]]
- **host_user_id** → [[🧠 MODEL - USER (Central Neuron)|👥 USER]]
- **created_by_user_id** → [[🧠 MODEL - USER (Central Neuron)|👥 USER]]

## 🌐 **Связи в Нейронной Сети**

### 🔵 **Прямые Связи (4 модели)**

#### 🎮 **Gaming Layer**
- [[🧠 MODEL - GAME_PLAYER (Participant Node)|🏓 GAME_PLAYER]] - `game_session_id`
- [[🧠 MODEL - RATING_CHANGE (Performance Node)|📈 RATING_CHANGE]] - `game_session_id`

#### 🤖 **AI Layer**
- [[🧠 MODEL - AI_SUGGESTION_LOG (Intelligence Node)|🤖 AI_SUGGESTION_LOG]] - `related_entity_id`
- [[🧠 MODEL - FEEDBACK (Quality Node)|💭 FEEDBACK]] - `related_entity_id`

### 🔄 **Входящие Связи**
- **VENUE** → `venue_id` (где происходит)
- **COURT** → `court_id` (на каком корте)
- **BOOKING** → `booking_id` (основа для игры)
- **USER** → `host_user_id`, `created_by_user_id` (организаторы)

## 📈 **Аналитические Возможности**

### 🎯 **Метрики Игровых Сессий**
```dataview
TABLE
  game_type as "🎾 Тип",
  status as "📊 Статус",
  current_players + "/" + max_players as "👥 Игроки",
  start_time as "⏰ Начало",
  end_time as "🏁 Окончание"
FROM "oxygen-world/Database"
WHERE contains(file.name, "Game-Session-") AND !contains(file.name, "Data")
SORT start_time desc
```

### 📊 **Игровая Аналитика**
- **Популярные типы игр**: Singles vs Doubles vs Mixed
- **Пиковые времена**: Когда больше всего игр
- **Средняя длительность**: Время игровых сессий
- **Завершаемость**: Процент завершенных vs отмененных игр

## 🔗 **Связанные Данные**

### 🎮 **Все Игровые Сессии**
- [[Game-Session-Data|📊 Game Session Data]] - Сводка всех игр

### 🎯 **Активные Игры**
- [[Game-Session-Tennis-Active|🎮 Tennis Singles - David vs Anna]] - Активная игра в теннис
- [[Game-Session-Padel-Doubles|🎮 Padel Doubles - Mixed Team]] - Падел в парах

## 🧠 **Нейронные Паттерны**

### 🔄 **Циклы Игровой Активности**
```
BOOKING → GAME_SESSION → GAME_PLAYER → USER
GAME_SESSION → RATING_CHANGE → USER
USER → GAME_SESSION → AI_SUGGESTION_LOG → USER
GAME_SESSION → FEEDBACK → VENUE
```

### 🌟 **Центральность в Графе**
- **Входящие связи**: 5 (VENUE, COURT, BOOKING, USER×2)
- **Исходящие связи**: 4 модели
- **Степень центральности**: Высокая в игровом слое
- **Влияние на граф**: Критическое для игровой активности

## 🎯 **Операционные Функции**

### 🎮 **Управление Игрой**
- **Создание сессии**: Из BOOKING или напрямую
- **Добавление игроков**: GAME_PLAYER записи
- **Отслеживание статуса**: waiting → active → completed
- **Ведение счета**: JSONB score field

### 📊 **Генерация Метрик**
- **Рейтинговые изменения**: RATING_CHANGE для каждого игрока
- **Статистика игры**: Длительность, счет, участники
- **AI анализ**: AI_SUGGESTION_LOG для улучшений
- **Обратная связь**: FEEDBACK от участников

### 🔄 **Жизненный Цикл**
1. **Создание**: Из BOOKING или прямое создание
2. **Ожидание игроков**: waiting_for_players
3. **Активная игра**: active (ведется счет)
4. **Завершение**: completed (генерируются метрики)
5. **Анализ**: AI_SUGGESTION_LOG и FEEDBACK

## 📊 **Типы Игровых Сессий**

### 🎾 **Singles (Одиночные)**
- **Игроки**: 2
- **Корты**: Tennis
- **Рейтинг**: Индивидуальные изменения
- **Длительность**: 60-90 минут

### 🏓 **Doubles (Парные)**
- **Игроки**: 4
- **Корты**: Tennis, Padel
- **Рейтинг**: Командные + индивидуальные
- **Длительность**: 60-120 минут

### 🤝 **Mixed Doubles (Смешанные парные)**
- **Игроки**: 4 (2 мужчины + 2 женщины)
- **Корты**: Tennis, Padel
- **Рейтинг**: Специальная система
- **Длительность**: 60-120 минут

## 🎯 **AI и Аналитика**

### 🤖 **AI Suggestions**
- **Улучшение техники**: Анализ игры
- **Подбор партнеров**: Совместимость игроков
- **Оптимизация расписания**: Лучшие времена для игр
- **Прогнозы результатов**: Вероятность победы

### 📈 **Performance Analytics**
- **Прогресс игроков**: Динамика рейтинга
- **Эффективность тренировок**: Влияние на игру
- **Социальная активность**: Частота игр с разными партнерами
- **Предпочтения**: Любимые типы игр и времена

---

*🎮 Активный Узел - Сердце Игровой Активности*
*🏝️ Phangan Padel Tennis Club - Gaming Intelligence*
