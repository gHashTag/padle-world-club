---
title: "🧠 MODEL - USER (Central Neuron)"
table_name: "user"
model_type: "central_neuron"
layer: "core"
connections: 15
tags: [model, user, central_neuron, core_layer]
---

# 👥 USER (Central Neuron)
## Центральный Нейрон Всей Системы

[[Technical/README|← Техническая документация]]

## 🧠 **Роль в "Втором Мозге"**

**USER** - это **центральный нейрон** всей системы, через который проходят все основные связи и процессы.

### 🎯 **Функции Центрального Нейрона**
- **Идентификация** - уникальная личность в системе
- **Агрегация активности** - все действия пользователя
- **Связующее звено** - соединяет все слои системы
- **Источник данных** - для аналитики и AI

## 📊 **Структура Модели**

### 🔑 **Ключевые Поля**
```sql
- id: UUID (Primary Key)
- username: VARCHAR(255) UNIQUE
- email: VARCHAR(255) UNIQUE  
- first_name: VARCHAR(255)
- last_name: VARCHAR(255)
- member_id: VARCHAR(50) UNIQUE
- user_role: ENUM (admin, manager, instructor, member)
- current_rating: REAL (default: 1500)
- bonus_points: INTEGER (default: 0)
- home_venue_id: UUID (FK → venue.id)
```

### 🔗 **Foreign Key Связи**
- **home_venue_id** → [[🧠 MODEL - VENUE (Spatial Hub)|🏟️ VENUE]]

## 🌐 **Связи в Нейронной Сети**

### 🔵 **Прямые Связи (15 моделей)**

#### 🟢 **Business Layer**
- [[🧠 MODEL - BOOKING (Temporal Node)|📅 BOOKING]] - `booked_by_user_id`
- [[🧠 MODEL - BOOKING_PARTICIPANT (Relation Node)|👤 BOOKING_PARTICIPANT]] - `user_id`
- [[🧠 MODEL - USER_ACCOUNT_LINK (Identity Node)|🔗 USER_ACCOUNT_LINK]] - `user_id`

#### 💰 **Financial Layer**
- [[🧠 MODEL - PAYMENT (Transaction Node)|💰 PAYMENT]] - `user_id`
- [[🧠 MODEL - ORDER (Commerce Node)|🛒 ORDER]] - `user_id`
- [[🧠 MODEL - BONUS_TRANSACTION (Reward Node)|🎁 BONUS_TRANSACTION]] - `user_id`

#### 🎓 **Education Layer**
- [[🧠 MODEL - CLASS_SCHEDULE (Session Node)|📅 CLASS_SCHEDULE]] - `instructor_user_id`
- [[🧠 MODEL - CLASS_PARTICIPANT (Learning Node)|🎓 CLASS_PARTICIPANT]] - `user_id`
- [[🧠 MODEL - USER_TRAINING_PACKAGE (Progress Node)|🎯 USER_TRAINING_PACKAGE]] - `user_id`

#### 🎮 **Gaming Layer**
- [[🧠 MODEL - GAME_SESSION (Activity Node)|🎮 GAME_SESSION]] - `host_user_id`, `created_by_user_id`
- [[🧠 MODEL - GAME_PLAYER (Participant Node)|🏓 GAME_PLAYER]] - `user_id`
- [[🧠 MODEL - RATING_CHANGE (Performance Node)|📈 RATING_CHANGE]] - `user_id`

#### 🏆 **Tournament Layer**
- [[🧠 MODEL - TOURNAMENT_PARTICIPANT (Competitor Node)|🥇 TOURNAMENT_PARTICIPANT]] - `user_id`

#### 🤖 **AI Layer**
- [[🧠 MODEL - AI_SUGGESTION_LOG (Intelligence Node)|🤖 AI_SUGGESTION_LOG]] - `user_id`
- [[🧠 MODEL - FEEDBACK (Quality Node)|💭 FEEDBACK]] - `user_id`

#### ⚙️ **System Layer**
- [[🧠 MODEL - TASK (Operational Node)|📋 TASK]] - `assigned_to_user_id`, `created_by_user_id`
- [[🧠 MODEL - NOTIFICATION (Communication Node)|🔔 NOTIFICATION]] - `user_id`

### 🔄 **Обратные Связи**
Все связанные модели влияют обратно на USER:
- **RATING_CHANGE** → обновляет `current_rating`
- **BONUS_TRANSACTION** → обновляет `bonus_points`
- **PAYMENT** → влияет на статус членства
- **GAME_SESSION** → создает историю активности

## 📈 **Аналитические Возможности**

### 🎯 **Метрики Пользователя**
```dataview
TABLE
  current_rating as "⭐ Рейтинг",
  bonus_points as "🎁 Бонусы",
  user_role as "👤 Роль"
FROM "oxygen-world/Database"
WHERE contains(file.name, "User-") AND !contains(file.name, "Data")
SORT current_rating desc
```

### 📊 **Активность по Слоям**
- **Игровая активность**: Количество игр, рейтинг
- **Финансовая активность**: Платежи, заказы, бонусы
- **Образовательная активность**: Классы, тренировки
- **Турнирная активность**: Участие в турнирах

## 🔗 **Связанные Данные**

### 👥 **Все Пользователи**
- [[Users-Data|📊 Users Data]] - Сводка всех пользователей

### 🎯 **Конкретные Пользователи**
- [[User-David-Smith|👤 David Smith]] - Активный игрок
- [[User-Anna-Johnson|👤 Anna Johnson]] - VIP член
- [[User-Sarah-Brown|👤 Sarah Brown]] - Новый участник

## 🧠 **Нейронные Паттерны**

### 🔄 **Циклы Активности**
```
USER → BOOKING → GAME_SESSION → RATING_CHANGE → USER
USER → PAYMENT → ORDER → BONUS_TRANSACTION → USER
USER → CLASS_PARTICIPANT → PROGRESS → USER_TRAINING_PACKAGE → USER
```

### 🌟 **Центральность в Графе**
- **Входящие связи**: 0 (центральный узел)
- **Исходящие связи**: 15+ моделей
- **Степень центральности**: Максимальная
- **Влияние на граф**: Критическое

---

*🧠 Центральный Нейрон - Сердце "Второго Мозга"*
*🏝️ Phangan Padel Tennis Club - Neural Architecture*
