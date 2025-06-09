---
title: "🧠 MODEL - GAME_PLAYER (Participant Node)"
table_name: "game_player"
model_type: "participant_node"
layer: "gaming"
connections: 4
tags: [model, game_player, participant_node, gaming_layer]
---

# 🏓 GAME_PLAYER (Participant Node)
## Участнический Узел Игровых Сессий

[[Technical/README|← Техническая документация]]

## 🧠 **Роль в "Втором Мозге"**

**GAME_PLAYER** - это **участнический узел**, который связывает игроков с игровыми сессиями и отслеживает индивидуальную статистику каждого участника.

### 🎯 **Функции Участнического Узла**
- **Связь игроков и игр** - many-to-many relationship
- **Индивидуальная статистика** - результаты каждого игрока
- **Рейтинговая система** - изменения рейтингов
- **Аналитика производительности** - детальная статистика

## 📊 **Структура Модели**

### 🔑 **Ключевые Поля**
```sql
- id: UUID (Primary Key)
- game_session_id: UUID (FK → game_session.id)
- user_id: UUID (FK → user.id)
- player_position: ENUM (player1, player2, player3, player4)
- team: ENUM (team_a, team_b)
- score: INTEGER
- games_won: INTEGER
- sets_won: INTEGER
- points_won: INTEGER
- aces: INTEGER
- double_faults: INTEGER
- winners: INTEGER
- unforced_errors: INTEGER
- rating_before: INTEGER
- rating_after: INTEGER
- rating_change: INTEGER
- performance_score: NUMERIC(5,2)
- is_winner: BOOLEAN
```

### 🔗 **Foreign Key Связи**
- **game_session_id** → [[Technical/Models/🧠 MODEL - GAME_SESSION (Activity Node)|🎮 GAME_SESSION]]
- **user_id** → [[Technical/Models/🧠 MODEL - USER (Central Neuron)|👥 USER]]

## 🌐 **Связи в Нейронной Сети**

### 🔵 **Прямые Связи (4 модели)**

#### 🎮 **Gaming Layer**
- **RATING_CHANGE** - `game_player_id` (изменения рейтинга)

#### 🤖 **AI Layer**
- **AI_SUGGESTION_LOG** - рекомендации по улучшению игры
- **FEEDBACK** - отзывы о партнерах и играх

#### ⚙️ **System Layer**
- **NOTIFICATION** - уведомления о результатах

### 🔄 **Входящие Связи**
- **GAME_SESSION** → `game_session_id` (игровая сессия)
- **USER** → `user_id` (игрок)

## 📈 **Аналитические Возможности**

### 🎯 **Метрики Игроков**
```dataview
TABLE
  score as "🏆 Счет",
  games_won as "🎾 Геймы",
  sets_won as "📊 Сеты",
  rating_change as "📈 Рейтинг",
  performance_score as "⭐ Производительность"
FROM "oxygen-world/Database"
WHERE contains(file.name, "Game-Player-") OR contains(file.name, "GamePlayer-")
```

### 📊 **Игровая Аналитика**
- **Средняя производительность**: performance_score
- **Процент побед**: is_winner percentage
- **Рейтинговый прогресс**: rating_change trends
- **Техническая статистика**: aces, winners, errors

## 🔗 **Связанные Данные**

### 🏓 **Все Игроки**
- [[Game-Session-Data|📊 Game Session Data]] - Игровые сессии
- [[Games-Data|📊 Games Data]] - Сводка игр

### 🎯 **Активные Игроки**
- [[User-David-Smith|👤 David Smith]] - Активный игрок
- [[User-Anna-Johnson|👤 Anna Johnson]] - Профессиональный уровень
- [[User-Sarah-Brown|👤 Sarah Brown]] - Развивающийся игрок

## 🧠 **Нейронные Паттерны**

### 🔄 **Циклы Игровой Активности**
```
USER → GAME_PLAYER → GAME_SESSION → STATISTICS
GAME_PLAYER → RATING_CHANGE → USER_RATING_UPDATE
GAME_PLAYER → AI_SUGGESTION_LOG → IMPROVEMENT_RECOMMENDATIONS
GAME_PLAYER → FEEDBACK → PARTNER_EVALUATION
```

### 🌟 **Центральность в Графе**
- **Входящие связи**: 2 (GAME_SESSION, USER)
- **Исходящие связи**: 4 модели
- **Степень центральности**: Высокая в игровом слое
- **Влияние на граф**: Критическое для статистики

## 🎯 **Операционные Функции**

### 🏓 **Управление Участием**
- **Регистрация**: Добавление игроков в сессию
- **Позиционирование**: player_position assignment
- **Командообразование**: team assignment
- **Статистика**: Реальное время обновления

### 📊 **Отслеживание Статистики**
- **Счет**: score tracking
- **Детальная статистика**: aces, winners, errors
- **Производительность**: performance_score calculation
- **Рейтинг**: rating_before/after tracking

### 🏆 **Определение Результатов**
- **Победители**: is_winner flag
- **Рейтинговые изменения**: rating_change calculation
- **Статистические достижения**: Personal bests
- **Прогресс**: Long-term improvement tracking

## 🎾 **Типы Игр и Позиции**

### 🎾 **Tennis Singles (1v1)**
- **Player1**: Первый игрок
- **Player2**: Второй игрок
- **Team**: Не применимо
- **Статистика**: Полная индивидуальная

### 🏓 **Tennis/Padel Doubles (2v2)**
- **Player1**: Первый игрок Team A
- **Player2**: Второй игрок Team A
- **Player3**: Первый игрок Team B
- **Player4**: Второй игрок Team B

### 👥 **Team Games**
- **Team A**: team_a
- **Team B**: team_b
- **Координация**: Командная статистика
- **Индивидуальный вклад**: Личные показатели

## 📊 **Статистические Метрики**

### 🎯 **Основные Показатели**
- **Score**: Финальный счет игрока
- **Games Won**: Выигранные геймы
- **Sets Won**: Выигранные сеты
- **Points Won**: Общие очки

### 🏆 **Технические Показатели**
- **Aces**: Подачи навылет
- **Double Faults**: Двойные ошибки
- **Winners**: Выигрышные удары
- **Unforced Errors**: Вынужденные ошибки

### 📈 **Производительность**
- **Performance Score**: Комплексная оценка (0-100)
- **Efficiency**: Winners / (Winners + Errors)
- **Consistency**: 1 - (Errors / Total Shots)
- **Power**: Aces / Total Serves

## 🏅 **Рейтинговая Система**

### 📊 **ELO Rating System**
- **Starting Rating**: 1200 для новичков
- **Rating Change**: ±1 до ±50 за игру
- **Factors**: Результат, рейтинг соперника, ожидаемый результат
- **Decay**: Снижение при неактивности

### 🎯 **Rating Brackets**
- **Beginner**: 1000-1399
- **Intermediate**: 1400-1799
- **Advanced**: 1800-2199
- **Expert**: 2200-2599
- **Professional**: 2600+

### 📈 **Rating Calculation**
```
Expected Score = 1 / (1 + 10^((Opponent Rating - Player Rating) / 400))
Rating Change = K * (Actual Score - Expected Score)
K-Factor = 50 (новички), 30 (средние), 15 (эксперты)
```

## 🎮 **Performance Score Calculation**

### 📊 **Компоненты (100 баллов)**
- **Result (40%)**: Победа/поражение, счет
- **Technical (30%)**: Aces, winners, errors ratio
- **Efficiency (20%)**: Points won / total points
- **Consistency (10%)**: Stable performance metrics

### 🏆 **Бонусы**
- **Comeback Victory**: +5 баллов
- **Dominant Win**: +3 балла
- **Perfect Set**: +2 балла
- **No Double Faults**: +1 балл

### 📉 **Штрафы**
- **Many Errors**: -3 балла
- **Poor Serving**: -2 балла
- **Inconsistent Play**: -1 балл

## 🔄 **Интеграции**

### 🎮 **Игровая Система**
- **GAME_SESSION**: Связь с игровыми сессиями
- **Real-time Updates**: Обновления во время игры
- **Multi-player Support**: До 4 игроков
- **Statistics Aggregation**: Автоматический расчет

### 📈 **Рейтинговая Система**
- **RATING_CHANGE**: Детальные изменения рейтинга
- **Historical Tracking**: История изменений
- **Leaderboards**: Рейтинговые таблицы
- **Achievements**: Система достижений

### 🤖 **AI Анализ**
- **AI_SUGGESTION_LOG**: Персональные рекомендации
- **Performance Analysis**: Анализ слабых мест
- **Improvement Plans**: Планы развития
- **Opponent Analysis**: Анализ стиля соперников

### 🔔 **Уведомления**
- **NOTIFICATION**: Результаты игр
- **Rating Updates**: Изменения рейтинга
- **Achievements**: Новые достижения
- **Recommendations**: AI советы

---

*🏓 Участнический Узел - Индивидуальность в Командной Игре*
*🏝️ Phangan Padel Tennis Club - Gaming Intelligence*
