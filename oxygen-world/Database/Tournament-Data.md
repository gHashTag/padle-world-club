---
title: "Tournament Data"
table_name: "tournament"
sync_source: "demo_data"
last_sync: "2025-01-31T17:00:00.000Z"
tags: [tournament, data, summary, demo_data]
---

# 🏆 Tournament Data

## 📊 Сводка

- **Всего записей**: 2
- **Последнее обновление**: 31 января 2025, 17:00
- **Тип данных**: Демо-данные
- **Модель БД**: `tournament`

## 📋 Все Tournament

- [[Tournament-Monthly-Tennis-Championship|🏆 Monthly Tennis Championship]]
- [[Tournament-Padel-Doubles-Cup|🏆 Padel Doubles Cup]]

## 🔗 Связи

### 🧠 **Модель**
- [[Technical/🧠 MODEL - Tournament|🧠 Tournament Model]]

### 📊 **Аналитика**
- [[🏠 MAIN DASHBOARD|🏠 Главный дашборд]]

## 📈 **Статистика**

```dataview
TABLE
  sync_source as "🔗 Источник",
  created_at as "📅 Создано",
  status as "📊 Статус",
  entry_fee + " THB" as "💰 Взнос"
FROM "oxygen-world/Database"
WHERE contains(file.name, "Tournament")
SORT created_at desc
```

## 🏆 **Предстоящие Турниры**

```dataview
TABLE
  title as "🏆 Турнир",
  tournament_type as "🎾 Тип",
  start_date as "📅 Дата",
  max_participants as "👥 Участники",
  prize_pool + " THB" as "💰 Призы"
FROM "oxygen-world/Database"
WHERE contains(file.name, "Tournament") AND status = "upcoming"
SORT start_date asc
```

## 📊 **Статистика турниров**

### 🎾 **Tennis Tournaments**
- Предстоящих: 1
- Активных: 0
- Завершенных: 0

### 🏓 **Padel Tournaments**
- Предстоящих: 1
- Активных: 0
- Завершенных: 0

### 💰 **Финансовая статистика**
- Общий призовой фонд: 25,000 THB
- Средний взнос: 900 THB
- Ожидаемый доход: 28,800 THB

---

*🎭 Демо-данные для "Второго Мозга"*
*🧠 Часть архитектуры базы данных*
