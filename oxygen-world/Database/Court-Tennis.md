---
title: "Tennis Court - Main Court"
court_id: "COURT_TENNIS_01"
court_name: "Tennis Court"
court_type: "tennis"
surface_type: "hard_court"
status: "active"
capacity: 4
hourly_rate: 800
peak_hourly_rate: 1200
location: "Main Area"
amenities: ["lighting", "net", "scoreboard", "seating"]
maintenance_schedule: "weekly"
last_maintenance: "2024-01-28"
next_maintenance: "2024-02-04"
total_bookings_today: 3
revenue_today: 2800
utilization_rate: 75
tags: [court, tennis, active, main]
---

# 🏓 Tennis Court - Main Court

## Информация о Корте

- **Название**: `= this.court_name`
- **Тип**: `= this.court_type`
- **Покрытие**: `= this.surface_type`
- **Статус**: `= this.status`
- **Вместимость**: `= this.capacity` человек
- **Расположение**: `= this.location`

## Тарифы

- **Обычный тариф**: ₿ `= this.hourly_rate` / час
- **Пиковый тариф**: ₿ `= this.peak_hourly_rate` / час

## Статистика Сегодня

- **Бронирований**: `= this.total_bookings_today`
- **Доход**: ₿ `= this.revenue_today`
- **Загрузка**: `= this.utilization_rate`%

## Удобства

- 💡 Освещение
- 🥅 Сетка
- 📊 Табло
- 🪑 Места для зрителей

## Обслуживание

- **Последнее**: `= this.last_maintenance`
- **Следующее**: `= this.next_maintenance`
- **График**: `= this.maintenance_schedule`

## 🔗 **Связи в "Втором Мозге"**

### 🧠 **Модель**
- [[Technical/Models/🧠 MODEL - COURT (Resource Node)|🎾 COURT (Resource Node)]] - Ресурсный узел

### 🔗 **Связанные Модели**
- [[Technical/Models/🧠 MODEL - VENUE (Spatial Hub)|🏟️ VENUE]] → [[Venues-Data|🏟️ Phangan Club]]
- [[Technical/Models/🧠 MODEL - BOOKING (Temporal Node)|📅 BOOKING]] → [[Bookings-Data|📅 Все бронирования]]
- [[Technical/Models/🧠 MODEL - GAME_SESSION (Activity Node)|🎮 GAME_SESSION]] → [[Game-Session-Data|🎮 Все игры]]

## 🔗 **Связанные Данные**

### 📅 **Сегодняшние Бронирования**
- [[Booking-Today-001|📅 David Smith - 09:00-10:30]]
- [[Booking-Today-004|📅 David Smith - 16:00-17:30]]

### 👥 **Постоянные Клиенты**
- [[User-David-Smith|👤 David Smith - Топ игрок]]
- [[User-Anna-Johnson|👤 Anna Johnson - VIP Тренер]]

### 🎓 **Классы на Корте**
- [[Class-Tennis-Beginners|🎓 Tennis for Beginners]]

### 📊 **Аналитика**
- [[Courts-Data|🏓 Все корты]]
- [[🏠 MAIN DASHBOARD|🏠 Главный дашборд]]

---

*Данные обновляются в реальном времени*
