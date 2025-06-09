---
title: "Booking: Tennis Court - David Smith"
booking_id: "BK001"
court_name: "Tennis Court"
user_name: "David Smith"
start_time: "2024-01-31T09:00:00"
end_time: "2024-01-31T10:30:00"
duration_minutes: 90
status: "confirmed"
total_amount: 1200
booking_purpose: "recreational_play"
participants: 2
payment_status: "paid"
created_at: "2024-01-30T15:30:00"
tags: [booking, tennis, confirmed, today, neon_schema]
sync_source: "neon_database"
last_sync: "2025-01-31T16:45:00.000Z"
neon_id: "880e8400-e29b-41d4-a716-446655440001"
court_id: "770e8400-e29b-41d4-a716-446655440001"
user_id: "550e8400-e29b-41d4-a716-446655440001"
table_name: "booking"
---

# 📅 Booking: Tennis Court - David Smith

## Детали Бронирования

- **Корт**: `= this.court_name`
- **Время**: `= this.start_time` - `= this.end_time`
- **Длительность**: `= this.duration_minutes` минут
- **Статус**: `= this.status`
- **Сумма**: ₿ `= this.total_amount`
- **Участники**: `= this.participants` человек
- **Цель**: `= this.booking_purpose`

## Информация об Оплате

- **Статус оплаты**: `= this.payment_status`
- **Создано**: `= this.created_at`

## 🔗 **Связанные Данные**

### 👤 **Клиент**
- [[User-David-Smith|👤 David Smith - Профиль игрока]]

### 💰 **Платеж**
- [[Payment-001|💰 Payment-001 - 1,200 THB (Cash)]]

### 🏓 **Корт**
- [[Court-Tennis|🏓 Tennis Court - Информация о корте]]

### 🧠 **"Второй Мозг" Сервера**
- [[Technical/Models/🧠 MODEL - BOOKING (Temporal Node)|📅 BOOKING (Temporal Node)]] - Временной узел
- [[Technical/Models/🧠 MODELS NAVIGATOR - Все 31 Модель|🧠 Навигатор по Всем 31 Модели]]

### 🔗 **Связанные Модели**
- [[Technical/Models/🧠 MODEL - USER (Central Neuron)|👥 USER]] → [[User-David-Smith|👤 David Smith]]
- [[Technical/Models/🧠 MODEL - COURT (Resource Node)|🎾 COURT]] → [[Court-Tennis|🎾 Tennis Court]]
- [[Technical/Models/🧠 MODEL - GAME_SESSION (Activity Node)|🎮 GAME_SESSION]] → [[Game-Session-Tennis-Active|🎮 Tennis Game]]

### 📊 **Аналитика**
- [[Bookings-Data|📅 Все бронирования]]
- [[🏠 MAIN DASHBOARD|🏠 Главный дашборд]]

## 🔄 **Синхронизация с Neon Database**

- **Источник данных**: `= this.sync_source`
- **ID в Neon**: `= this.neon_id`
- **Таблица**: `= this.table_name`
- **ID корта**: `= this.court_id`
- **ID пользователя**: `= this.user_id`
- **Последняя синхронизация**: `= this.last_sync`

---

*📡 Бронирование синхронизировано с Neon Database*
*🧠 Часть "Второго Мозга" Сервера*
