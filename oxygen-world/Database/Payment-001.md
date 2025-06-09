---
title: "Payment: Tennis Court Booking - David Smith"
payment_id: "PAY001"
user_name: "David Smith"
amount: 1200
currency: "THB"
payment_method: "cash"
status: "completed"
payment_type: "court_booking"
booking_id: "BK001"
created_at: "2024-01-31T09:00:00"
processed_at: "2024-01-31T09:00:00"
tags: [payment, tennis, cash, completed]
---

# 💰 Payment: Tennis Court Booking - David Smith

## Детали Платежа

- **Сумма**: ₿ `= this.amount` `= this.currency`
- **Клиент**: `= this.user_name`
- **Способ оплаты**: `= this.payment_method`
- **Статус**: `= this.status`
- **Тип**: `= this.payment_type`
- **Связанное бронирование**: `= this.booking_id`

## Временные Метки

- **Создан**: `= this.created_at`
- **Обработан**: `= this.processed_at`

## 🔗 **Связи в "Втором Мозге"**

### 🧠 **Модель**
- [[Technical/Models/🧠 MODEL - PAYMENT (Transaction Node)|💰 PAYMENT (Transaction Node)]] - Транзакционный узел

### 🔗 **Связанные Модели**
- [[Technical/Models/🧠 MODEL - USER (Central Neuron)|👥 USER]] → [[User-David-Smith|👤 David Smith]]
- [[Technical/Models/🧠 MODEL - BOOKING (Temporal Node)|📅 BOOKING]] → [[Booking-Today-001|📅 Tennis Booking]]

## 🔗 **Связанные Данные**

### 👤 **Клиент**
- [[User-David-Smith|👤 David Smith - Профиль игрока]]

### 📅 **Бронирование**
- [[Booking-Today-001|📅 Tennis Court - 09:00-10:30]]

### 💰 **Финансы**
- [[Payments-Data|💰 Все платежи]]
- [[💰 Finance Dashboard|💰 Финансовый дашборд]]

### 📊 **Аналитика**
- [[🏠 MAIN DASHBOARD|🏠 Главный дашборд]]

---

*Автоматически синхронизировано с платежной системой*
