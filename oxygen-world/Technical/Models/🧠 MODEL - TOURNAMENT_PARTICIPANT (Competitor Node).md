---
title: "🧠 MODEL - TOURNAMENT_PARTICIPANT (Competitor Node)"
table_name: "tournament_participant"
model_type: "competitor_node"
layer: "tournament"
connections: 5
tags: [model, tournament_participant, competitor_node, tournament_layer]
---

# 🥇 TOURNAMENT_PARTICIPANT (Competitor Node)
## Соревновательный Узел Участников Турниров

[[Technical/README|← Техническая документация]]

## 🧠 **Роль в "Втором Мозге"**

**TOURNAMENT_PARTICIPANT** - это **соревновательный узел**, который связывает игроков с турнирами и отслеживает их турнирную активность и достижения.

### 🎯 **Функции Соревновательного Узла**
- **Регистрация участников** - связь игроков и турниров
- **Турнирная статистика** - результаты и достижения
- **Сетка турнира** - позиционирование в турнире
- **Награды и рейтинги** - призы и рейтинговые изменения

## 📊 **Структура Модели**

### 🔑 **Ключевые Поля**
```sql
- id: UUID (Primary Key)
- tournament_id: UUID (FK → tournament.id)
- user_id: UUID (FK → user.id)
- team_id: UUID (FK → tournament_team.id)
- registration_date: TIMESTAMP WITH TIME ZONE
- seed_number: INTEGER
- current_round: VARCHAR(50)
- status: ENUM (registered, active, eliminated, withdrawn, champion, finalist, semifinalist)
- matches_played: INTEGER
- matches_won: INTEGER
- matches_lost: INTEGER
- sets_won: INTEGER
- sets_lost: INTEGER
- games_won: INTEGER
- games_lost: INTEGER
- prize_money: NUMERIC(10,2)
- currency: VARCHAR(3)
- rating_points_earned: INTEGER
- final_position: INTEGER
```

### 🔗 **Foreign Key Связи**
- **tournament_id** → [[Technical/Models/🧠 MODEL - TOURNAMENT (Competition Node)|🏆 TOURNAMENT]]
- **user_id** → [[Technical/Models/🧠 MODEL - USER (Central Neuron)|👥 USER]]
- **team_id** → **TOURNAMENT_TEAM** (для командных турниров)

## 🌐 **Связи в Нейронной Сети**

### 🔵 **Прямые Связи (5 моделей)**

#### 🏆 **Tournament Layer**
- **TOURNAMENT_MATCH** - `participant_id` (матчи участника)
- **TOURNAMENT_TEAM** - `team_id` (командное участие)

#### 💰 **Financial Layer**
- **PAYMENT** - регистрационные взносы

#### ⚙️ **System Layer**
- **NOTIFICATION** - уведомления о турнире

#### 🤖 **AI Layer**
- **FEEDBACK** - отзывы о турнире

### 🔄 **Входящие Связи**
- **TOURNAMENT** → `tournament_id` (турнир)
- **USER** → `user_id` (участник)
- **TOURNAMENT_TEAM** → `team_id` (команда)

## 📈 **Аналитические Возможности**

### 🎯 **Метрики Участников**
```dataview
TABLE
  seed_number as "🎯 Сеяный",
  current_round as "🏆 Раунд",
  status as "📊 Статус",
  matches_won + "/" + matches_played as "🎾 Матчи",
  final_position as "🥇 Место"
FROM "oxygen-world/Database"
WHERE contains(file.name, "Tournament-Participant-") OR contains(file.name, "TournamentParticipant-")
```

### 📊 **Турнирная Аналитика**
- **Процент побед**: matches_won / matches_played
- **Эффективность по сетам**: sets_won / (sets_won + sets_lost)
- **Прогресс в турнире**: current_round tracking
- **Призовые**: prize_money distribution

## 🔗 **Связанные Данные**

### 🏆 **Все Участники**
- [[Tournament-Data|📊 Tournament Data]] - Турнирные данные
- [[Tournaments-Data|📊 Tournaments Data]] - Сводка турниров

### 🎯 **Активные Участники**
- [[User-David-Smith|👤 David Smith]] - Сеяный №3
- [[User-Anna-Johnson|👤 Anna Johnson]] - Сеяная №1
- [[User-Sarah-Brown|👤 Sarah Brown]] - Квалификант

## 🧠 **Нейронные Паттерны**

### 🔄 **Циклы Турнирной Активности**
```
USER → TOURNAMENT_PARTICIPANT → TOURNAMENT_MATCH → RESULTS
TOURNAMENT_PARTICIPANT → PAYMENT → REGISTRATION_FEE
TOURNAMENT_PARTICIPANT → NOTIFICATION → TOURNAMENT_UPDATES
TOURNAMENT_PARTICIPANT → FEEDBACK → TOURNAMENT_EXPERIENCE
```

### 🌟 **Центральность в Графе**
- **Входящие связи**: 3 (TOURNAMENT, USER, TOURNAMENT_TEAM)
- **Исходящие связи**: 5 моделей
- **Степень центральности**: Максимальная в турнирном слое
- **Влияние на граф**: Критическое для соревнований

## 🎯 **Операционные Функции**

### 🏆 **Управление Участием**
- **Регистрация**: registration_date tracking
- **Сеяние**: seed_number assignment
- **Жеребьевка**: Турнирная сетка
- **Прогресс**: current_round updates

### 🔄 **Жизненный Цикл**
1. **Регистрация**: registered (подана заявка)
2. **Активность**: active (участвует в турнире)
3. **Завершение**: eliminated/champion/finalist/semifinalist
4. **Отказ**: withdrawn (снялся с турнира)

### 📊 **Отслеживание Результатов**
- **Матчи**: matches_played/won/lost
- **Сеты**: sets_won/lost
- **Геймы**: games_won/lost
- **Позиция**: final_position

## 🏅 **Статусы Участников**

### 📝 **Registered (Зарегистрирован)**
- **Описание**: Подана заявка, ожидает начала
- **Действия**: Подготовка к турниру
- **Переходы**: → active, withdrawn

### 🎾 **Active (Активный)**
- **Описание**: Участвует в турнире
- **Действия**: Играет матчи
- **Переходы**: → eliminated, champion, finalist, semifinalist

### ❌ **Eliminated (Исключен)**
- **Описание**: Проиграл и выбыл
- **Действия**: Турнир завершен
- **Финальный статус**: Да

### 🏆 **Champion (Чемпион)**
- **Описание**: Победитель турнира
- **Награды**: Максимальные призовые
- **Финальный статус**: Да

### 🥈 **Finalist (Финалист)**
- **Описание**: Дошел до финала
- **Награды**: Вторые призовые
- **Финальный статус**: Да

### 🥉 **Semifinalist (Полуфиналист)**
- **Описание**: Дошел до полуфинала
- **Награды**: Третьи призовые
- **Финальный статус**: Да

### 🚫 **Withdrawn (Снялся)**
- **Описание**: Добровольно покинул турнир
- **Причины**: Травма, личные обстоятельства
- **Финальный статус**: Да

## 🎯 **Система Сеяния**

### 🥇 **Сеяные Игроки (Seeds)**
- **Топ-8**: Автоматически сеяные
- **Преимущества**: Избегают друг друга в ранних раундах
- **Ответственность**: Ожидания высоких результатов

### 🎲 **Квалификанты**
- **Отбор**: Через квалификационные турниры
- **Мотивация**: Доказать свой уровень
- **Возможности**: Сенсационные победы

### 🎪 **Wild Cards**
- **Приглашения**: От организаторов
- **Критерии**: Местные игроки, звезды
- **Цель**: Привлечение зрителей

## 💰 **Призовая Система**

### 🏆 **Распределение Призов**
- **Чемпион**: 40% призового фонда
- **Финалист**: 20% призового фонда
- **Полуфиналисты**: 10% каждый
- **Четвертьфиналисты**: 5% каждый
- **Остальные**: Пропорционально раундам

### 💎 **Дополнительные Награды**
- **Лучший местный игрок**: Специальный приз
- **Самый молодой участник**: Поощрительный приз
- **Лучший дебютант**: Приз новичка
- **Приз зрительских симпатий**: Голосование

## 📊 **Рейтинговые Очки**

### 🎯 **Система Начисления**
- **Участие**: 5 очков
- **1-й раунд**: +10 очков
- **2-й раунд**: +20 очков
- **Четвертьфинал**: +40 очков
- **Полуфинал**: +80 очков
- **Финал**: +120 очков
- **Победа**: +200 очков

### 📈 **Влияние на Рейтинг**
- **Размер турнира**: Коэффициент важности
- **Уровень соперников**: Бонусные очки
- **Неожиданные результаты**: Дополнительные очки

## 🔄 **Интеграции**

### 🏆 **Турнирная Система**
- **TOURNAMENT**: Связь с турниром
- **TOURNAMENT_MATCH**: Матчи участника
- **TOURNAMENT_TEAM**: Командное участие
- **Bracket Management**: Управление сеткой

### 💳 **Финансовая Система**
- **PAYMENT**: Регистрационные взносы
- **Prize Distribution**: Распределение призов
- **Refunds**: Возвраты при снятии
- **Sponsorship**: Спонсорские выплаты

### 🔔 **Коммуникации**
- **NOTIFICATION**: Турнирные уведомления
- **Schedule Updates**: Изменения расписания
- **Results**: Результаты матчей
- **Awards**: Церемония награждения

### 📊 **Аналитика**
- **Performance Tracking**: Отслеживание результатов
- **Historical Data**: История участий
- **Trends Analysis**: Анализ трендов
- **Predictions**: Прогнозы результатов

---

*🥇 Соревновательный Узел - Дух Соперничества*
*🏝️ Phangan Padel Tennis Club - Tournament Intelligence*
