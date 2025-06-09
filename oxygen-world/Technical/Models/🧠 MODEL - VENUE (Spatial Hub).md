---
title: "🧠 MODEL - VENUE (Spatial Hub)"
table_name: "venue"
model_type: "spatial_hub"
layer: "core"
connections: 8
tags: [model, venue, spatial_hub, core_layer]
---

# 🏟️ VENUE (Spatial Hub)
## Пространственный Хаб Системы

[[Technical/README|← Техническая документация]]

## 🧠 **Роль в "Втором Мозге"**

**VENUE** - это **пространственный хаб**, который организует все физические активности и ресурсы в системе.

### 🎯 **Функции Пространственного Хаба**
- **Локализация** - физическое место всех активностей
- **Ресурсный центр** - управление кортами и оборудованием
- **Операционный узел** - координация всех процессов
- **Аналитический центр** - метрики по локации

## 📊 **Структура Модели**

### 🔑 **Ключевые Поля**
```sql
- id: UUID (Primary Key)
- name: VARCHAR(255) UNIQUE
- address: TEXT
- city: VARCHAR(100)
- country: VARCHAR(100)
- phone_number: VARCHAR(50)
- email: VARCHAR(255)
- is_active: BOOLEAN (default: true)
- gcal_resource_id: VARCHAR(255)
```

### 🔗 **Foreign Key Связи**
- **Нет входящих FK** (независимый хаб)

## 🌐 **Связи в Нейронной Сети**

### 🔵 **Прямые Связи (8 моделей)**

#### 🔵 **Core Layer**
- [[🧠 MODEL - COURT (Resource Node)|🎾 COURT]] - `venue_id`

#### 🟢 **Business Layer**
- [[🧠 MODEL - BOOKING (Temporal Node)|📅 BOOKING]] - через COURT

#### 🎓 **Education Layer**
- [[🧠 MODEL - CLASS_SCHEDULE (Session Node)|📅 CLASS_SCHEDULE]] - `venue_id`

#### 🎮 **Gaming Layer**
- [[🧠 MODEL - GAME_SESSION (Activity Node)|🎮 GAME_SESSION]] - `venue_id`

#### 🏆 **Tournament Layer**
- [[🧠 MODEL - TOURNAMENT (Competition Node)|🏆 TOURNAMENT]] - `venue_id`

#### 🤖 **AI Layer**
- [[🧠 MODEL - FEEDBACK (Quality Node)|💭 FEEDBACK]] - `venue_id`

#### ⚙️ **System Layer**
- [[🧠 MODEL - TASK (Operational Node)|📋 TASK]] - `venue_id`

### 🔄 **Обратные Связи**
- **USER** → `home_venue_id` (пользователи привязаны к домашней площадке)

## 📈 **Аналитические Возможности**

### 🎯 **Метрики Площадки**
```dataview
TABLE
  name as "🏟️ Название",
  city as "🌍 Город",
  is_active as "✅ Активна"
FROM "oxygen-world/Database"
WHERE contains(file.name, "Venue-") AND !contains(file.name, "Data")
```

### 📊 **Активность по Площадке**
- **Количество кортов**: Связанные COURT
- **Загруженность**: Количество BOOKING
- **Игровая активность**: GAME_SESSION
- **Образовательная активность**: CLASS_SCHEDULE
- **Турнирная активность**: TOURNAMENT

## 🔗 **Связанные Данные**

### 🏟️ **Все Площадки**
- [[Venues-Data|📊 Venues Data]] - Сводка всех площадок

### 🎯 **Конкретные Площадки**
- [[Venue-Phangan-Padel-Tennis-Club|🏟️ Phangan Padel Tennis Club]] - Основная площадка

## 🧠 **Нейронные Паттерны**

### 🔄 **Циклы Пространственной Активности**
```
VENUE → COURT → BOOKING → GAME_SESSION → VENUE
VENUE → CLASS_SCHEDULE → CLASS_PARTICIPANT → VENUE
VENUE → TOURNAMENT → TOURNAMENT_MATCH → VENUE
VENUE → TASK → COMPLETION → VENUE
```

### 🌟 **Центральность в Графе**
- **Входящие связи**: 1 (USER.home_venue_id)
- **Исходящие связи**: 8 моделей
- **Степень центральности**: Высокая
- **Влияние на граф**: Критическое для пространственной организации

## 🎯 **Операционные Функции**

### 🏗️ **Управление Ресурсами**
- **Корты**: Физические игровые площадки
- **Оборудование**: Инвентарь и техника
- **Персонал**: Инструкторы и обслуживающий персонал
- **Расписание**: Координация всех активностей

### 📊 **Аналитика Площадки**
- **Загруженность кортов** по времени
- **Популярность активностей** (игры vs классы vs турниры)
- **Финансовые показатели** по площадке
- **Удовлетворенность клиентов** через FEEDBACK

### 🔧 **Операционные Задачи**
- **Техническое обслуживание** через TASK
- **Уведомления клиентов** через NOTIFICATION
- **Обратная связь** через FEEDBACK

---

*🏟️ Пространственный Хаб - Физическая Основа "Второго Мозга"*
*🏝️ Phangan Padel Tennis Club - Spatial Intelligence*
