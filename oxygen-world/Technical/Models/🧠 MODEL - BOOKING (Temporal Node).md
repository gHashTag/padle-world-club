---
title: "🧠 MODEL - BOOKING (Temporal Node)"
table_name: "booking"
model_type: "temporal_node"
layer: "business"
connections: 5
tags: [model, booking, temporal_node, business_layer]
---

# 📅 BOOKING (Temporal Node)
## Временной Узел Системы

[[Technical/README|← Техническая документация]]

## 🧠 **Роль в "Втором Мозге"**

**BOOKING** - это **временной узел**, который организует все активности во времени и является связующим звеном между пользователями и ресурсами.

### 🎯 **Функции Временного Узла**
- **Временная координация** - резервирование времени
- **Связь USER ↔ COURT** - соединяет людей и ресурсы
- **Основа для активностей** - порождает игры и занятия
- **Финансовый триггер** - инициирует платежи

## 📊 **Структура Модели**

### 🔑 **Ключевые Поля**
```sql
- id: UUID (Primary Key)
- court_id: UUID (FK → court.id)
- booked_by_user_id: UUID (FK → user.id)
- start_time: TIMESTAMP WITH TIME ZONE
- end_time: TIMESTAMP WITH TIME ZONE
- duration_minutes: INTEGER
- status: ENUM (pending, confirmed, cancelled, completed)
- total_amount: NUMERIC(10,2)
- currency: VARCHAR(3)
- booking_purpose: ENUM (casual_play, lesson, tournament, maintenance)
- related_entity_id: UUID (связь с CLASS_SCHEDULE, TOURNAMENT, etc.)
```

### 🔗 **Foreign Key Связи**
- **court_id** → [[🧠 MODEL - COURT (Resource Node)|🎾 COURT]]
- **booked_by_user_id** → [[🧠 MODEL - USER (Central Neuron)|👥 USER]]

## 🌐 **Связи в Нейронной Сети**

### 🔵 **Прямые Связи (5 моделей)**

#### 🟢 **Business Layer**
- [[🧠 MODEL - BOOKING_PARTICIPANT (Relation Node)|👤 BOOKING_PARTICIPANT]] - `booking_id`

#### 💰 **Financial Layer**
- [[🧠 MODEL - PAYMENT (Transaction Node)|💰 PAYMENT]] - через BOOKING_PARTICIPANT
- [[🧠 MODEL - BONUS_TRANSACTION (Reward Node)|🎁 BONUS_TRANSACTION]] - `related_booking_id`

#### 🎓 **Education Layer**
- [[🧠 MODEL - CLASS_SCHEDULE (Session Node)|📅 CLASS_SCHEDULE]] - `booking_id`

#### 🎮 **Gaming Layer**
- [[🧠 MODEL - GAME_SESSION (Activity Node)|🎮 GAME_SESSION]] - `booking_id`

### 🔄 **Входящие Связи**
- **USER** → `booked_by_user_id` (кто забронировал)
- **COURT** → `court_id` (что забронировано)

## 📈 **Аналитические Возможности**

### 🎯 **Метрики Бронирований**
```dataview
TABLE
  start_time as "⏰ Начало",
  duration_minutes + " мин" as "⏱️ Длительность",
  status as "📊 Статус",
  total_amount + " " + currency as "💰 Сумма",
  booking_purpose as "🎯 Цель"
FROM "oxygen-world/Database"
WHERE contains(file.name, "Booking-") AND !contains(file.name, "Data")
SORT start_time desc
```

### 📊 **Временная Аналитика**
- **Загруженность по часам**: Пиковые и спокойные времена
- **Популярные дни**: Статистика по дням недели
- **Сезонность**: Тренды по месяцам
- **Эффективность**: Отношение бронирований к фактическим играм

## 🔗 **Связанные Данные**

### 📅 **Все Бронирования**
- [[Bookings-Data|📊 Bookings Data]] - Сводка всех бронирований

### 🎯 **Сегодняшние Бронирования**
- [[Booking-Today-001|📅 Tennis 15:00-16:00]] - Теннис с David
- [[Booking-Today-002|📅 Padel 16:00-17:00]] - Падел с Anna
- [[Booking-Today-003|📅 Tennis 17:00-18:00]] - Урок с Sarah

## 🧠 **Нейронные Паттерны**

### 🔄 **Циклы Временной Активности**
```
USER → BOOKING → COURT → GAME_SESSION → RATING_CHANGE → USER
USER → BOOKING → PAYMENT → ORDER → BONUS_TRANSACTION → USER
BOOKING → CLASS_SCHEDULE → CLASS_PARTICIPANT → USER
BOOKING → GAME_SESSION → GAME_PLAYER → USER
```

### 🌟 **Центральность в Графе**
- **Входящие связи**: 2 (USER, COURT)
- **Исходящие связи**: 5 моделей
- **Степень центральности**: Высокая
- **Влияние на граф**: Критическое для временной координации

## 🎯 **Операционные Функции**

### ⏰ **Управление Временем**
- **Резервирование слотов**: start_time → end_time
- **Предотвращение конфликтов**: Проверка пересечений
- **Автоматическое освобождение**: По истечении времени
- **Напоминания**: Уведомления перед началом

### 💰 **Финансовые Операции**
- **Расчет стоимости**: duration_minutes × court.hourly_rate
- **Инициация платежей**: Создание PAYMENT записей
- **Бонусные начисления**: BONUS_TRANSACTION при завершении
- **Возвраты**: При отмене бронирования

### 🎮 **Порождение Активностей**
- **Игровые сессии**: GAME_SESSION для casual_play
- **Образовательные занятия**: CLASS_SCHEDULE для lesson
- **Турнирные матчи**: Связь с TOURNAMENT через related_entity_id
- **Техобслуживание**: TASK для maintenance

## 📊 **Типы Бронирований**

### 🎾 **Casual Play**
- **Цель**: Свободная игра
- **Участники**: 2-4 игрока
- **Порождает**: GAME_SESSION
- **Оплата**: Почасовая

### 🎓 **Lesson**
- **Цель**: Обучение
- **Участники**: Инструктор + ученики
- **Порождает**: CLASS_SCHEDULE
- **Оплата**: Фиксированная за урок

### 🏆 **Tournament**
- **Цель**: Соревнование
- **Участники**: Турнирные игроки
- **Порождает**: TOURNAMENT_MATCH
- **Оплата**: Включена в турнирный взнос

### 🔧 **Maintenance**
- **Цель**: Техобслуживание
- **Участники**: Технический персонал
- **Порождает**: TASK
- **Оплата**: Внутренние расходы

---

*📅 Временной Узел - Координатор Всех Активностей*
*🏝️ Phangan Padel Tennis Club - Temporal Intelligence*
