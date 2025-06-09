---
title: "🧠 MODEL - CLASS_SCHEDULE (Session Node)"
table_name: "class_schedule"
model_type: "session_node"
layer: "education"
connections: 5
tags: [model, class_schedule, session_node, education_layer]
---

# 📅 CLASS_SCHEDULE (Session Node)
## Сессионный Узел Образовательного Расписания

[[Technical/README|← Техническая документация]]

## 🧠 **Роль в "Втором Мозге"**

**CLASS_SCHEDULE** - это **сессионный узел**, который превращает образовательные программы в конкретные занятия и является связующим звеном между планами и реализацией.

### 🎯 **Функции Сессионного Узла**
- **Планирование занятий** - конкретные сессии из программ
- **Управление расписанием** - время, место, ресурсы
- **Связь с участниками** - регистрация и посещаемость
- **Интеграция с бронированиями** - резервирование кортов

## 📊 **Структура Модели**

### 🔑 **Ключевые Поля**
```sql
- id: UUID (Primary Key)
- class_definition_id: UUID (FK → class_definition.id)
- instructor_user_id: UUID (FK → user.id)
- venue_id: UUID (FK → venue.id)
- court_id: UUID (FK → court.id)
- scheduled_date: DATE
- start_time: TIME
- end_time: TIME
- duration_minutes: INTEGER
- max_participants: INTEGER
- current_participants: INTEGER
- status: ENUM (scheduled, in_progress, completed, cancelled)
- price_per_participant: NUMERIC(10,2)
- currency: VARCHAR(3)
- notes: TEXT
- weather_dependent: BOOLEAN
- booking_id: UUID (FK → booking.id)
```

### 🔗 **Foreign Key Связи**
- **class_definition_id** → [[Technical/Models/🧠 MODEL - CLASS_DEFINITION (Program Node)|📚 CLASS_DEFINITION]]
- **instructor_user_id** → [[Technical/Models/🧠 MODEL - USER (Central Neuron)|👥 USER]]
- **venue_id** → [[Technical/Models/🧠 MODEL - VENUE (Spatial Hub)|🏟️ VENUE]]
- **court_id** → [[Technical/Models/🧠 MODEL - COURT (Resource Node)|🎾 COURT]]
- **booking_id** → [[Technical/Models/🧠 MODEL - BOOKING (Temporal Node)|📅 BOOKING]]

## 🌐 **Связи в Нейронной Сети**

### 🔵 **Прямые Связи (5 моделей)**

#### 🎓 **Education Layer**
- **CLASS_PARTICIPANT** - `class_schedule_id` (участники занятия)

#### 💰 **Financial Layer**
- **PAYMENT** - оплата за занятия

#### ⚙️ **System Layer**
- **NOTIFICATION** - уведомления о занятиях
- **TASK** - задачи по подготовке занятий

#### 🤖 **AI Layer**
- **FEEDBACK** - отзывы о занятиях

### 🔄 **Входящие Связи**
- **CLASS_DEFINITION** → `class_definition_id` (программа)
- **USER** → `instructor_user_id` (инструктор)
- **VENUE** → `venue_id` (место)
- **COURT** → `court_id` (корт)
- **BOOKING** → `booking_id` (бронирование)

## 📈 **Аналитические Возможности**

### 🎯 **Метрики Занятий**
```dataview
TABLE
  scheduled_date as "📅 Дата",
  start_time + "-" + end_time as "⏰ Время",
  current_participants + "/" + max_participants as "👥 Участники",
  status as "📊 Статус",
  price_per_participant + " " + currency as "💰 Цена"
FROM "oxygen-world/Database"
WHERE contains(file.name, "Class-Schedule-") OR contains(file.name, "ClassSchedule-")
SORT scheduled_date desc
```

### 📊 **Образовательная Аналитика**
- **Заполняемость**: current_participants / max_participants
- **Популярные времена**: Анализ start_time
- **Эффективность инструкторов**: Рейтинги и отзывы
- **Доходность**: Выручка по программам

## 🔗 **Связанные Данные**

### 📅 **Все Расписания**
- [[Classes-Data|📊 Classes Data]] - Сводка занятий

### 🎯 **Конкретные Занятия**
- [[Class-Tennis-Beginners|🎓 Tennis for Beginners]] - Теннис для начинающих
- [[Class-Padel-Women|🎓 Padel for Women]] - Падел для женщин

## 🧠 **Нейронные Паттерны**

### 🔄 **Циклы Образовательной Активности**
```
CLASS_DEFINITION → CLASS_SCHEDULE → CLASS_PARTICIPANT → USER
CLASS_SCHEDULE → BOOKING → COURT → VENUE
CLASS_SCHEDULE → PAYMENT → FINANCIAL_PROCESSING
CLASS_SCHEDULE → FEEDBACK → QUALITY_IMPROVEMENT
```

### 🌟 **Центральность в Графе**
- **Входящие связи**: 5 (CLASS_DEFINITION, USER, VENUE, COURT, BOOKING)
- **Исходящие связи**: 5 моделей
- **Степень центральности**: Максимальная в образовательном слое
- **Влияние на граф**: Критическое для обучения

## 🎯 **Операционные Функции**

### 📅 **Планирование Занятий**
- **Создание расписания**: На основе CLASS_DEFINITION
- **Назначение инструкторов**: instructor_user_id
- **Резервирование ресурсов**: court_id, venue_id
- **Ценообразование**: price_per_participant

### 🔄 **Жизненный Цикл**
1. **Планирование**: scheduled (запланировано)
2. **Подготовка**: Резервирование ресурсов
3. **Проведение**: in_progress (идет занятие)
4. **Завершение**: completed (занятие завершено)
5. **Отмена**: cancelled (при необходимости)

### 👥 **Управление Участниками**
- **Регистрация**: Через CLASS_PARTICIPANT
- **Контроль лимитов**: max_participants
- **Посещаемость**: current_participants
- **Лист ожидания**: При превышении лимита

## 📊 **Типы Занятий**

### 🎾 **Tennis Classes**
- **Beginners**: 6-8 участников, 90 минут
- **Intermediate**: 4-6 участников, 90 минут
- **Advanced**: 2-4 участника, 120 минут
- **Kids**: 8-10 детей, 60 минут

### 🏓 **Padel Classes**
- **Introduction**: 6-8 участников, 90 минут
- **Women's**: 6-8 женщин, 90 минут
- **Competitive**: 4-6 участников, 120 минут
- **Corporate**: 8-12 участников, 90 минут

### 🏃 **Fitness Classes**
- **Tennis Fitness**: 8-10 участников, 60 минут
- **Padel Conditioning**: 8-10 участников, 60 минут
- **General Fitness**: 10-12 участников, 45 минут
- **Stretching**: 12-15 участников, 30 минут

### 🧘 **Wellness Classes**
- **Yoga**: 10-15 участников, 60 минут
- **Meditation**: 15-20 участников, 30 минут
- **Recovery**: 8-10 участников, 45 минут
- **Mental Training**: 6-8 участников, 60 минут

## ⏰ **Временные Слоты**

### 🌅 **Утренние (6:00-12:00)**
- **6:00-7:30**: Ранние пташки
- **8:00-9:30**: Перед работой
- **10:00-11:30**: Домохозяйки, пенсионеры
- **Популярность**: 25%

### ☀️ **Дневные (12:00-17:00)**
- **12:00-13:30**: Обеденный перерыв
- **14:00-15:30**: Свободное время
- **15:30-17:00**: После школы (дети)
- **Популярность**: 20%

### 🌆 **Вечерние (17:00-22:00)**
- **17:00-18:30**: После работы
- **18:30-20:00**: Прайм-тайм
- **20:00-21:30**: Поздние занятия
- **Популярность**: 55%

## 💰 **Ценообразование**

### 👥 **Групповые Занятия**
- **Beginners**: 600-800 THB/человек
- **Intermediate**: 800-1,000 THB/человек
- **Advanced**: 1,000-1,200 THB/человек
- **Специальные**: 500-700 THB/человек

### 👤 **Индивидуальные**
- **Стандартные**: 2,000-2,500 THB/час
- **Премиум**: 2,500-3,500 THB/час
- **VIP**: 3,500-5,000 THB/час

### 👥 **Полуприватные**
- **2 человека**: 1,500-2,000 THB/час/человек
- **3 человека**: 1,200-1,500 THB/час/человек

## 🌦️ **Погодные Условия**

### ☀️ **Хорошая Погода**
- **Все занятия**: Проводятся по расписанию
- **Открытые корты**: Предпочтительны
- **Посещаемость**: 95-100%

### 🌧️ **Дождь**
- **Крытые корты**: Занятия продолжаются
- **Открытые корты**: Перенос или отмена
- **Посещаемость**: 60-80%

### 🌪️ **Сильный Ветер**
- **Все корты**: Оценка безопасности
- **Возможные переносы**: На закрытые помещения
- **Посещаемость**: 70-90%

## 🔄 **Интеграции**

### 📅 **Система Бронирований**
- **BOOKING**: Автоматическое резервирование кортов
- **Конфликты**: Проверка доступности
- **Приоритеты**: Занятия vs обычные бронирования
- **Гибкость**: Изменения расписания

### 💳 **Платежная Система**
- **PAYMENT**: Обработка оплаты за занятия
- **Пакеты**: Предоплаченные блоки занятий
- **Скидки**: Групповые, студенческие
- **Возвраты**: При отменах

### 🔔 **Уведомления**
- **NOTIFICATION**: Напоминания участникам
- **24 часа**: Предварительное напоминание
- **2 часа**: Финальное напоминание
- **Изменения**: Уведомления о переносах

### 📋 **Управление Задачами**
- **TASK**: Подготовка к занятиям
- **Оборудование**: Проверка и подготовка
- **Корты**: Уборка и настройка
- **Материалы**: Подготовка учебных материалов

---

*📅 Сессионный Узел - Мост от Планов к Реальности*
*🏝️ Phangan Padel Tennis Club - Educational Intelligence*
