---
title: "Class: Tennis for Beginners"
class_id: "CLS001"
class_name: "Tennis for Beginners"
sport: "tennis"
level: "beginner"
instructor: "Anna Johnson"
max_participants: 8
current_participants: 6
schedule: "Tuesday, Thursday 18:00-19:00"
duration: 60
price_per_session: 800
price_per_month: 2800
location: "Tennis Court"
status: "active"
start_date: "2024-01-01"
end_date: "2024-03-31"
next_session: "2024-02-01T18:00:00"
equipment_provided: true
language: "English, Thai"
created_at: "2023-12-20T10:00:00"
tags: [class, tennis, beginner, group, active]
---

# 🎓 Class: Tennis for Beginners

## Основная Информация

- **Название**: `= this.class_name`
- **Вид спорта**: `= this.sport`
- **Уровень**: `= this.level`
- **Инструктор**: `= this.instructor`
- **Расписание**: `= this.schedule`
- **Длительность**: `= this.duration` минут
- **Локация**: `= this.location`

## Участники

- **Максимум участников**: `= this.max_participants`
- **Текущие участники**: `= this.current_participants`
- **Свободных мест**: `= this.max_participants - this.current_participants`
- **Статус**: `= this.status`

## Стоимость

- **За занятие**: ₿ `= this.price_per_session`
- **Месячный абонемент**: ₿ `= this.price_per_month`
- **Экономия при абонементе**: ₿ `= (this.price_per_session * 8) - this.price_per_month`

## Расписание

- **Период курса**: `= this.start_date` - `= this.end_date`
- **Следующее занятие**: `= this.next_session`
- **Дни недели**: Вторник, Четверг
- **Время**: 18:00 - 19:00

## Программа Курса

### Неделя 1-2: Основы
- Правильный хват ракетки
- Базовая стойка и движения
- Удар справа (форхенд)
- Простые упражнения с мячом

### Неделя 3-4: Развитие техники
- Удар слева (бэкхенд)
- Подача (базовая)
- Игра у сетки
- Тактические основы

### Неделя 5-6: Практика
- Игровые ситуации
- Парная игра
- Счет и правила
- Мини-турниры

### Неделя 7-8: Закрепление
- Отработка всех ударов
- Игровая практика
- Анализ техники
- Планы дальнейшего развития

## Участники Группы

1. **David Smith** - новичок, очень мотивирован
2. **Maria Rodriguez** - есть базовые навыки
3. **John Wilson** - полный новичок
4. **Lisa Chen** - играла в школе
5. **Mike Davis** - хочет улучшить технику
6. **Kate Miller** - новичок, быстро учится

## Оборудование

- **Предоставляется**: `= this.equipment_provided`
- **Ракетки**: Wilson Pro Staff (для начинающих)
- **Мячи**: Профессиональные тренировочные
- **Дополнительно**: Конусы, сетки для упражнений

## Языки

- **Инструкция**: `= this.language`
- **Основной язык**: Английский
- **Поддержка**: Тайский для местных жителей

## 🔗 **Связи в "Втором Мозге"**

### 🧠 **Модель**
- [[Technical/Models/🧠 MODEL - CLASS_DEFINITION (Program Node)|📚 CLASS_DEFINITION (Program Node)]] - Программный узел

### 🔗 **Связанные Модели**
- [[Technical/Models/🧠 MODEL - USER (Central Neuron)|👥 USER]] → Инструкторы и ученики
- [[Technical/Models/🧠 MODEL - COURT (Resource Node)|🎾 COURT]] → [[Court-Tennis|🎾 Tennis Court]]
- [[Technical/Models/🧠 MODEL - VENUE (Spatial Hub)|🏟️ VENUE]] → [[Venues-Data|🏟️ Phangan Club]]

### 📊 **Связанные Данные**
- [[Classes-Data|📊 Classes Data]] - Все программы
- [[User-David-Smith|👤 David Smith]] - Участник группы

---

*Популярный курс для начинающих теннисистов*
*🏝️ Phangan Padel Tennis Club Training*
