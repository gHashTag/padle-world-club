---
title: "David Smith - Player Profile"
user_id: "user-001"
first_name: "David"
last_name: "Smith"
username: "david_smith"
email: "david.smith@example.com"
phone: "+66-89-123-4567"
user_role: "player"
current_rating: 2485
member_id: "PHG001"
total_games: 45
wins: 32
losses: 13
favorite_sport: "tennis"
created_at: "2024-01-15T10:30:00"
last_active: "2024-01-31T18:45:00"
tags: [user, player, tennis, active, neon_schema]
sync_source: "neon_database"
last_sync: "2025-01-31T16:45:00.000Z"
neon_id: "550e8400-e29b-41d4-a716-446655440001"
table_name: "user"
---

# 👤 David Smith - Player Profile

## Основная Информация

- **Имя**: `= this.first_name` `= this.last_name`
- **Логин**: `= this.username`
- **Email**: `= this.email`
- **Телефон**: `= this.phone`
- **Роль**: `= this.user_role`
- **ID участника**: `= this.member_id`

## Игровая Статистика

- **Текущий рейтинг**: ⭐ `= this.current_rating`
- **Всего игр**: `= this.total_games`
- **Побед**: ✅ `= this.wins`
- **Поражений**: ❌ `= this.losses`
- **Процент побед**: 71%
- **Любимый спорт**: 🎾 `= this.favorite_sport`

## Активность

- **Создан**: `= this.created_at`
- **Последняя активность**: `= this.last_active`
- **Статус**: 🟢 Активный

## Достижения

- 🥇 **Топ-1 игрок клуба**
- 🎯 **30+ побед**
- 📈 **40+ игр сыграно**

## 🔗 **Связи в "Втором Мозге"**

### 🧠 **Модель**
- [[Technical/Models/🧠 MODEL - USER (Central Neuron)|👥 USER (Central Neuron)]] - Центральный нейрон

## 🔗 **Связанные Данные**

### 📅 **Мои Бронирования**
- [[Booking-Today-001|📅 Tennis Court - 09:00-10:30 (1,200 THB)]]
- [[Booking-Today-004|📅 Tennis Court - 16:00-17:30 (1,200 THB)]]

### 💰 **Мои Платежи**
- [[Payment-001|💰 Tennis Court Booking - 1,200 THB (Cash)]]
- [[Payment-004|💰 Tennis Court Booking - 1,200 THB (Card)]]

### 📦 **Моя Подписка**
- [[Subscription-Tennis-David|📦 Tennis Package - 4,500 THB/месяц]]

### 🎓 **Мои Классы**
- [[Class-Tennis-Beginners|🎓 Tennis for Beginners - Instructor]]

### 🧠 **"Второй Мозг" Сервера**
- [[Technical/Models/🧠 MODEL - USER (Central Neuron)|👥 USER (Central Neuron)]] - Центральный нейрон
- [[Technical/Models/🧠 MODELS NAVIGATOR - Все 31 Модель|🧠 Навигатор по Всем 31 Модели]]

### 🎮 **Игровая Активность**
- [[Game-Session-Tennis-Active|🎮 Tennis Singles - David vs Anna]] - Активная игра
- [[Technical/Models/🧠 MODEL - GAME_SESSION (Activity Node)|🎮 GAME_SESSION Model]]

### 📊 **Аналитика**
- [[👥 Users Data - Oxygen Padel Club Thailand|👥 Все пользователи]]
- [[🏠 MAIN DASHBOARD|🏠 Главный дашборд]]

## 🔄 **Синхронизация с Neon Database**

- **Источник данных**: `= this.sync_source`
- **ID в Neon**: `= this.neon_id`
- **Таблица**: `= this.table_name`
- **Последняя синхронизация**: `= this.last_sync`

---

*📡 Профиль синхронизирован с Neon Database*
*🧠 Часть "Второго Мозга" Сервера*
*🏝️ Phangan Padel Tennis Club Member*
