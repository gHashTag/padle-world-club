---
title: "🧠 MODEL - COURT (Resource Node)"
table_name: "court"
model_type: "resource_node"
layer: "core"
connections: 6
tags: [model, court, resource_node, core_layer]
---

# 🎾 COURT (Resource Node)
## Ресурсный Узел Системы

[[Technical/README|← Техническая документация]]

## 🧠 **Роль в "Втором Мозге"**

**COURT** - это **ресурсный узел**, который представляет физические игровые площадки и является основой для всех игровых активностей.

### 🎯 **Функции Ресурсного Узла**
- **Физический ресурс** - конкретная игровая площадка
- **Точка бронирования** - объект для резервирования времени
- **Место активности** - где происходят игры и занятия
- **Единица аналитики** - метрики использования

## 📊 **Структура Модели**

### 🔑 **Ключевые Поля**
```sql
- id: UUID (Primary Key)
- venue_id: UUID (FK → venue.id)
- name: VARCHAR(255)
- court_type: ENUM (tennis, padel, multi_purpose)
- surface_type: ENUM (clay, hard, grass, artificial_turf)
- is_active: BOOLEAN (default: true)
- hourly_rate: NUMERIC(10,2)
- currency: VARCHAR(3)
- max_players: INTEGER
```

### 🔗 **Foreign Key Связи**
- **venue_id** → [[🧠 MODEL - VENUE (Spatial Hub)|🏟️ VENUE]]

## 🌐 **Связи в Нейронной Сети**

### 🔵 **Прямые Связи (6 моделей)**

#### 🟢 **Business Layer**
- [[🧠 MODEL - BOOKING (Temporal Node)|📅 BOOKING]] - `court_id`

#### 🎓 **Education Layer**
- [[🧠 MODEL - CLASS_SCHEDULE (Session Node)|📅 CLASS_SCHEDULE]] - `court_id`

#### 🎮 **Gaming Layer**
- [[🧠 MODEL - GAME_SESSION (Activity Node)|🎮 GAME_SESSION]] - `court_id`

#### 🏆 **Tournament Layer**
- [[🧠 MODEL - TOURNAMENT_MATCH (Event Node)|⚔️ TOURNAMENT_MATCH]] - `court_id`

### 🔄 **Входящие Связи**
- **VENUE** → `venue_id` (принадлежность к площадке)

## 📈 **Аналитические Возможности**

### 🎯 **Метрики Корта**
```dataview
TABLE
  name as "🎾 Корт",
  court_type as "🏓 Тип",
  surface_type as "🏟️ Покрытие",
  hourly_rate + " " + currency as "💰 Цена/час",
  max_players as "👥 Макс игроков"
FROM "oxygen-world/Database"
WHERE contains(file.name, "Court-") AND !contains(file.name, "Data")
```

### 📊 **Загруженность Корта**
- **Количество бронирований**: BOOKING count
- **Игровые сессии**: GAME_SESSION count
- **Классы и тренировки**: CLASS_SCHEDULE count
- **Турнирные матчи**: TOURNAMENT_MATCH count

## 🔗 **Связанные Данные**

### 🎾 **Все Корты**
- [[Courts-Data|📊 Courts Data]] - Сводка всех кортов

### 🎯 **Конкретные Корты**
- [[Court-Tennis|🎾 Tennis Court]] - Теннисный корт
- [[Court-Padel|🏓 Padel Court]] - Падел корт

## 🧠 **Нейронные Паттерны**

### 🔄 **Циклы Использования Ресурса**
```
COURT → BOOKING → GAME_SESSION → RATING_CHANGE → USER
COURT → CLASS_SCHEDULE → CLASS_PARTICIPANT → USER
COURT → TOURNAMENT_MATCH → TOURNAMENT_PARTICIPANT → USER
```

### 🌟 **Центральность в Графе**
- **Входящие связи**: 1 (VENUE.venue_id)
- **Исходящие связи**: 6 моделей
- **Степень центральности**: Средняя
- **Влияние на граф**: Критическое для активностей

## 🎯 **Операционные Функции**

### 📅 **Управление Расписанием**
- **Бронирования**: Резервирование времени
- **Классы**: Регулярные занятия
- **Турниры**: Соревновательные матчи
- **Техобслуживание**: Плановые работы

### 💰 **Финансовые Функции**
- **Ценообразование**: hourly_rate по типу корта
- **Доходность**: Анализ загруженности vs доходов
- **Оптимизация**: Максимизация использования

### 🔧 **Техническое Обслуживание**
- **Состояние покрытия**: surface_type maintenance
- **Оборудование корта**: Сетки, освещение, разметка
- **Безопасность**: Проверки и ремонт

## 📊 **Типы Кортов**

### 🎾 **Tennis Courts**
- **Покрытие**: Hard, Clay, Grass
- **Размер**: Стандартный теннисный корт
- **Игроки**: 2-4 (singles/doubles)
- **Оборудование**: Теннисные сетки

### 🏓 **Padel Courts**
- **Покрытие**: Artificial Turf
- **Размер**: 20x10 метров
- **Игроки**: 4 (только doubles)
- **Оборудование**: Стеклянные стены, падел сетки

### 🏟️ **Multi-Purpose Courts**
- **Покрытие**: Универсальное
- **Размер**: Адаптируемый
- **Игроки**: Переменное
- **Оборудование**: Модульное

---

*🎾 Ресурсный Узел - Физическая Основа Активностей*
*🏝️ Phangan Padel Tennis Club - Resource Intelligence*
