---
title: "🧠 MODEL - RATING_CHANGE (Performance Node)"
table_name: "rating_change"
model_type: "performance_node"
layer: "gaming"
connections: 3
tags: [model, rating_change, performance_node, gaming_layer]
---

# 📈 RATING_CHANGE (Performance Node)
## Производительный Узел Изменений Рейтинга

[[Technical/README|← Техническая документация]]

## 🧠 **Роль в "Втором Мозге"**

**RATING_CHANGE** - это **производительный узел**, который отслеживает все изменения рейтингов игроков и обеспечивает точную систему ранжирования.

### 🎯 **Функции Производительного Узла**
- **Отслеживание рейтингов** - детальная история изменений
- **Система ранжирования** - ELO и другие алгоритмы
- **Аналитика производительности** - тренды и прогресс
- **Справедливое соперничество** - балансировка матчей

## 📊 **Структура Модели**

### 🔑 **Ключевые Поля**
```sql
- id: UUID (Primary Key)
- user_id: UUID (FK → user.id)
- game_player_id: UUID (FK → game_player.id)
- rating_type: ENUM (elo, skill_based, tournament, overall)
- old_rating: INTEGER
- new_rating: INTEGER
- rating_change: INTEGER
- reason: ENUM (game_result, tournament_result, inactivity_decay, manual_adjustment)
- confidence_factor: NUMERIC(3,2)
- opponent_rating: INTEGER
- expected_score: NUMERIC(3,2)
- actual_score: NUMERIC(3,2)
- k_factor: INTEGER
- change_date: TIMESTAMP WITH TIME ZONE
- season: VARCHAR(20)
- notes: TEXT
```

### 🔗 **Foreign Key Связи**
- **user_id** → [[Technical/Models/🧠 MODEL - USER (Central Neuron)|👥 USER]]
- **game_player_id** → [[Technical/Models/🧠 MODEL - GAME_PLAYER (Participant Node)|🏓 GAME_PLAYER]]

## 🌐 **Связи в Нейронной Сети**

### 🔵 **Прямые Связи (3 модели)**

#### 🤖 **AI Layer**
- **AI_SUGGESTION_LOG** - рекомендации на основе рейтинга

#### ⚙️ **System Layer**
- **NOTIFICATION** - уведомления об изменениях рейтинга

#### 🏆 **Tournament Layer**
- **TOURNAMENT_PARTICIPANT** - турнирные рейтинги

### 🔄 **Входящие Связи**
- **USER** → `user_id` (игрок)
- **GAME_PLAYER** → `game_player_id` (игровая сессия)

## 📈 **Аналитические Возможности**

### 🎯 **Метрики Рейтинга**
```dataview
TABLE
  rating_type as "📊 Тип",
  old_rating + "→" + new_rating as "📈 Изменение",
  rating_change as "±️ Дельта",
  reason as "🎯 Причина",
  change_date as "📅 Дата"
FROM "oxygen-world/Database"
WHERE contains(file.name, "Rating-Change-") OR contains(file.name, "RatingChange-")
SORT change_date desc
```

### 📊 **Рейтинговая Аналитика**
- **Прогресс игроков**: Тренды изменений
- **Стабильность**: Волатильность рейтингов
- **Сезонные изменения**: Динамика по сезонам
- **Эффективность системы**: Точность предсказаний

## 🔗 **Связанные Данные**

### 📈 **Все Изменения**
- [[Game-Session-Data|📊 Game Session Data]] - Игровые данные

### 🎯 **Активные Игроки**
- [[User-David-Smith|👤 David Smith]] - Рейтинг 1450 → 1465
- [[User-Anna-Johnson|👤 Anna Johnson]] - Рейтинг 1820 → 1835
- [[User-Sarah-Brown|👤 Sarah Brown]] - Рейтинг 1250 → 1240

## 🧠 **Нейронные Паттерны**

### 🔄 **Циклы Рейтинговой Активности**
```
GAME_PLAYER → RATING_CHANGE → USER_RATING_UPDATE
RATING_CHANGE → AI_SUGGESTION_LOG → IMPROVEMENT_RECOMMENDATIONS
RATING_CHANGE → NOTIFICATION → PLAYER_AWARENESS
TOURNAMENT_PARTICIPANT → RATING_CHANGE → RANKING_UPDATES
```

### 🌟 **Центральность в Графе**
- **Входящие связи**: 2 (USER, GAME_PLAYER)
- **Исходящие связи**: 3 модели
- **Степень центральности**: Высокая в игровом слое
- **Влияние на граф**: Критическое для соревновательности

## 🎯 **Операционные Функции**

### 📈 **Управление Рейтингами**
- **Расчет изменений**: ELO algorithm
- **Валидация**: Проверка корректности
- **Применение**: Обновление пользовательских рейтингов
- **Аудит**: Отслеживание всех изменений

### 🔄 **Жизненный Цикл**
1. **Инициация**: Результат игры/турнира
2. **Расчет**: Применение алгоритма
3. **Валидация**: Проверка корректности
4. **Применение**: Обновление рейтинга
5. **Уведомление**: Информирование игрока

### 📊 **Алгоритмы Расчета**
- **ELO Rating**: Классическая система
- **Skill-based**: Учет дополнительных факторов
- **Tournament**: Специальные турнирные очки
- **Overall**: Комбинированный рейтинг

## 📊 **Типы Рейтингов**

### 🎯 **ELO Rating**
- **Диапазон**: 1000-3000
- **Начальный**: 1200 для новичков
- **Формула**: R' = R + K(S - E)
- **Использование**: Основной рейтинг

### 🎮 **Skill-based Rating**
- **Факторы**: Техника, тактика, физподготовка
- **Диапазон**: 1-100
- **Обновление**: После каждой игры
- **Цель**: Детальная оценка навыков

### 🏆 **Tournament Rating**
- **Основа**: Результаты турниров
- **Очки**: За участие и достижения
- **Сезонность**: Обнуление каждый сезон
- **Престиж**: Для турнирного ранжирования

### 🌟 **Overall Rating**
- **Комбинация**: ELO + Skill + Tournament
- **Веса**: 50% + 30% + 20%
- **Обновление**: Еженедельно
- **Отображение**: Основной показатель

## 🔢 **ELO Calculation**

### 📊 **Формула**
```
Expected Score (E) = 1 / (1 + 10^((Opponent Rating - Player Rating) / 400))
New Rating = Old Rating + K-Factor × (Actual Score - Expected Score)
```

### 🎯 **K-Factor**
- **Новички (< 30 игр)**: K = 40
- **Средние игроки**: K = 20
- **Эксперты (> 2400)**: K = 10
- **Турниры**: K × 1.5

### 📈 **Actual Score**
- **Победа**: 1.0
- **Ничья**: 0.5
- **Поражение**: 0.0
- **Forfeit**: 0.0 (для проигравшего)

## 🎯 **Причины Изменений**

### 🎮 **Game Result (Результат игры)**
- **Описание**: Обычная игра
- **Частота**: 80% изменений
- **Расчет**: Стандартный ELO
- **Влияние**: Основной фактор

### 🏆 **Tournament Result (Турнирный результат)**
- **Описание**: Результат турнира
- **Частота**: 15% изменений
- **Расчет**: Усиленный K-factor
- **Влияние**: Повышенное

### ⏰ **Inactivity Decay (Затухание)**
- **Описание**: Снижение за неактивность
- **Частота**: 4% изменений
- **Расчет**: -5 очков/месяц
- **Цель**: Поддержание актуальности

### ⚙️ **Manual Adjustment (Ручная корректировка)**
- **Описание**: Административные изменения
- **Частота**: 1% изменений
- **Причины**: Ошибки, читерство, особые случаи
- **Контроль**: Строгий аудит

## 📊 **Confidence Factor**

### 🎯 **Определение**
- **Новые игроки**: 0.5-0.7 (низкая уверенность)
- **Опытные**: 0.8-0.9 (высокая уверенность)
- **Эксперты**: 0.9-1.0 (максимальная уверенность)

### 📈 **Влияние**
- **Низкая уверенность**: Большие изменения рейтинга
- **Высокая уверенность**: Стабильные изменения
- **Рост**: С количеством игр
- **Использование**: Модификация K-factor

## 🏆 **Сезонная Система**

### 📅 **Сезоны**
- **Весенний**: Март-Май
- **Летний**: Июнь-Август
- **Осенний**: Сентябрь-Ноябрь
- **Зимний**: Декабрь-Февраль

### 🔄 **Сброс Рейтингов**
- **Частичный**: 80% от текущего + 20% от базового
- **Турнирные**: Полный сброс
- **Skill-based**: Без сброса
- **Overall**: Пересчет

## 🔄 **Интеграции**

### 🎮 **Игровая Система**
- **GAME_PLAYER**: Источник изменений
- **Автоматический расчет**: После каждой игры
- **Валидация**: Проверка результатов
- **Применение**: Обновление рейтингов

### 🏆 **Турнирная Система**
- **TOURNAMENT_PARTICIPANT**: Турнирные результаты
- **Бонусные очки**: За достижения
- **Престижные турниры**: Увеличенные коэффициенты
- **Сезонные рейтинги**: Специальные расчеты

### 🤖 **AI Система**
- **AI_SUGGESTION_LOG**: Рекомендации на основе рейтинга
- **Подбор соперников**: Близкие рейтинги
- **Прогнозирование**: Вероятности побед
- **Оптимизация**: Улучшение алгоритмов

### 🔔 **Уведомления**
- **NOTIFICATION**: Изменения рейтинга
- **Достижения**: Новые рекорды
- **Предупреждения**: Риск снижения
- **Мотивация**: Поощрения к игре

---

*📈 Производительный Узел - Мера Мастерства*
*🏝️ Phangan Padel Tennis Club - Performance Intelligence*
