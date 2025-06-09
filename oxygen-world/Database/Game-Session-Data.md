---
title: "Game Session Data"
table_name: "game_session"
sync_source: "demo_data"
last_sync: "2025-01-31T17:00:00.000Z"
tags: [game_session, data, summary, demo_data]
---

# 🎮 Game Session Data

## 📊 Сводка

- **Всего записей**: 2
- **Последнее обновление**: 31 января 2025, 17:00
- **Тип данных**: Демо-данные
- **Модель БД**: `game_session`

## 📋 Все Game Session

- [[Game-Session-Tennis-Active|🎮 Tennis Singles - David vs Anna]]
- [[Game-Session-Padel-Doubles|🎮 Padel Doubles - Mixed Team]]

## 🔗 Связи

### 🧠 **Модель**
- [[Technical/🧠 MODEL - Game Session|🧠 Game Session Model]]

### 📊 **Аналитика**
- [[🏠 MAIN DASHBOARD|🏠 Главный дашборд]]

## 📈 **Статистика**

```dataview
TABLE
  sync_source as "🔗 Источник",
  created_at as "📅 Создано",
  status as "📊 Статус"
FROM "oxygen-world/Database"
WHERE contains(file.name, "Game-Session")
SORT created_at desc
```

## 🎯 **Активные Игры**

```dataview
TABLE
  title as "🎮 Игра",
  game_type as "🎾 Тип",
  current_players + "/" + max_players as "👥 Игроки",
  status as "📊 Статус"
FROM "oxygen-world/Database"
WHERE contains(file.name, "Game-Session") AND status = "active"
```

## 📊 **Статистика по типам игр**

### 🎾 **Tennis**
- Активных игр: 1
- Завершенных игр: 0

### 🏓 **Padel**
- Активных игр: 1
- Завершенных игр: 0

---

*🎭 Демо-данные для "Второго Мозга"*
*🧠 Часть архитектуры базы данных*
