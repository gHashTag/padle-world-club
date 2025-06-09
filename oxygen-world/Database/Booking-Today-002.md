---
title: "Booking: Padel Court - Maria Rodriguez"
booking_id: "BK002"
court_name: "Padel Court"
user_name: "Maria Rodriguez"
start_time: "2024-01-31T08:00:00"
end_time: "2024-01-31T09:00:00"
duration_minutes: 60
status: "confirmed"
total_amount: 600
booking_purpose: "recreational_play"
participants: 4
payment_status: "paid"
created_at: "2024-01-30T12:15:00"
tags: [booking, padel, confirmed, today]
---

# 📅 Booking: Padel Court - Maria Rodriguez

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

## 🔗 **Связи в "Втором Мозге"**

### 🧠 **Модель**
- [[Technical/Models/🧠 MODEL - BOOKING (Temporal Node)|📅 BOOKING (Temporal Node)]] - Временной узел

### 🔗 **Связанные Модели**
- [[Technical/Models/🧠 MODEL - USER (Central Neuron)|👥 USER]] → [[User-Anna-Johnson|👤 Anna Johnson]]
- [[Technical/Models/🧠 MODEL - COURT (Resource Node)|🎾 COURT]] → [[Court-Padel|🏓 Padel Court]]
- [[Technical/Models/🧠 MODEL - VENUE (Spatial Hub)|🏟️ VENUE]] → [[Venues-Data|🏟️ Phangan Club]]

## 🔗 **Связанные Данные**

### 👤 **Клиент**
- [[User-Maria-Rodriguez|👤 Maria Rodriguez - Падел специалист]]

### 💰 **Платеж**
- [[Payment-002|💰 Payment-002 - 600 THB (Card)]]

### 🏓 **Корт**
- [[Court-Padel|🏓 Padel Court - Glass Court]]

### 📊 **Аналитика**
- [[Bookings-Data|📅 Все бронирования]]
- [[🏠 MAIN DASHBOARD|🏠 Главный дашборд]]

---

*Автоматически синхронизировано с системой бронирований*
