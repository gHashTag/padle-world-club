---
title: "Task Data"
table_name: "task"
sync_source: "demo_data"
last_sync: "2025-01-31T17:00:00.000Z"
tags: [task, data, summary, demo_data]
---

# 📋 Task Data

## 📊 Сводка

- **Всего записей**: 3
- **Последнее обновление**: 31 января 2025, 17:00
- **Тип данных**: Демо-данные
- **Модель БД**: `task`

## 📋 Все Task

- [[Task-Court-Maintenance|📋 Court Maintenance - Tennis]]
- [[Task-Equipment-Inventory|📋 Equipment Inventory Check]]
- [[Task-Lighting-Upgrade|📋 Lighting System Upgrade]]

## 🔗 Связи

### 🧠 **Модель**
- [[Technical/🧠 MODEL - Task|🧠 Task Model]]

### 📊 **Аналитика**
- [[🏠 MAIN DASHBOARD|🏠 Главный дашборд]]
- [[📋 Tasks Dashboard|📋 Дашборд задач]]

## 📈 **Статистика**

```dataview
TABLE
  sync_source as "🔗 Источник",
  created_at as "📅 Создано",
  status as "📊 Статус",
  priority as "🎯 Приоритет"
FROM "oxygen-world/Database"
WHERE contains(file.name, "Task")
SORT created_at desc
```

## 🔥 **Активные Задачи**

```dataview
TABLE
  title as "📋 Задача",
  assigned_to as "👤 Исполнитель",
  due_date as "📅 Срок",
  priority as "🎯 Приоритет",
  status as "📊 Статус"
FROM "oxygen-world/Database"
WHERE contains(file.name, "Task") AND status != "completed"
SORT priority desc, due_date asc
```

## 📊 **Статистика по статусам**

### 🔄 **В процессе**
- Court Maintenance - Tennis (Высокий приоритет)

### ⏳ **Ожидают выполнения**
- Equipment Inventory Check (Средний приоритет)

### 📋 **В планах**
- Lighting System Upgrade (Низкий приоритет)

## 🎯 **Статистика по приоритетам**

### 🔴 **Высокий приоритет**
- Задач: 1
- В процессе: 1
- Завершено: 0

### 🟡 **Средний приоритет**
- Задач: 1
- Ожидает: 1
- Завершено: 0

### 🟢 **Низкий приоритет**
- Задач: 1
- В планах: 1
- Завершено: 0

## 👥 **Статистика по исполнителям**

### 🔧 **Maintenance Team**
- Активных задач: 1
- Завершенных: 0

### 👨‍💼 **Club Manager**
- Активных задач: 1
- Завершенных: 0

### ⚡ **Technical Team**
- Активных задач: 1
- Завершенных: 0

---

*🎭 Демо-данные для "Второго Мозга"*
*🧠 Часть архитектуры базы данных*
