---
title: "🏠 MASTER DASHBOARD - Phangan Padel Tennis Club"
tags: [dashboard, master, navigation, main]
cssclasses: [main-dashboard]
---

# 🏠 MASTER DASHBOARD
## Phangan Padel Tennis Club

_🏝️ Центральная панель управления клубом на острове Панган_

## 🎯 **Навигация по Дашбордам**

| Раздел | Описание | Статус |
|--------|----------|--------|
| **📅 [[📅 Calendar Dashboard\|Calendar]]** | Календарь событий и расписание | ✅ |
| **📋 [[📋 Bookings Dashboard\|Bookings]]** | Управление бронированиями кортов | ✅ |
| **✅ [[✅ Tasks Dashboard\|Tasks]]** | Задачи и операции клуба | ✅ |
| **🎓 [[🎓 Classes Dashboard\|Classes]]** | Тренировки и обучение | ✅ |
| **📊 [[📊 Analytics Dashboard\|Analytics]]** | Аналитика и отчеты | ✅ |
| **👤 [[👤 Profile Dashboard\|Profile]]** | Управление клиентами | ✅ |
| **💰 [[💰 Finance Dashboard\|Finance]]** | Финансы и платежи | ✅ |
| **👥 [[👥 All Contacts Dashboard\|All Contacts]]** | База контактов | ✅ |
| **📦 [[📦 Subscriptions Dashboard\|Subscriptions]]** | Абонементы и подписки | ✅ |
| **📦 [[📦 Inventory Dashboard\|Inventory]]** | Инвентарь и товары | ✅ |
| **⚙️ [[⚙️ Settings Dashboard\|Settings]]** | Настройки системы | ✅ |

---

## 📈 **Ключевые Метрики (Live Connected Data)**

```dataview
TABLE WITHOUT ID
  "📅 Бронирований сегодня" as "📊 Метрика",
  count(rows) as "📈 Значение"
FROM "oxygen-world/Database"
WHERE contains(file.name, "Booking-Today-")
```

```dataview
TABLE WITHOUT ID
  "👥 Активных клиентов" as "📊 Метрика",
  length(unique(user_name)) as "📈 Значение"
FROM "oxygen-world/Database"
WHERE contains(file.name, "Booking-Today-")
```

```dataview
TABLE WITHOUT ID
  "💰 Доход сегодня (THB)" as "📊 Метрика",
  sum(total_amount) as "📈 Значение"
FROM "oxygen-world/Database"
WHERE contains(file.name, "Booking-Today-")
```

```dataview
TABLE WITHOUT ID
  "💳 Платежей обработано" as "📊 Метрика",
  count(rows) as "📈 Значение"
FROM "oxygen-world/Database"
WHERE contains(file.name, "Payment-") AND status = "completed"
```

## 🔗 **Связанные Данные (Cross-Reference)**

### 👥 **Топ Клиенты Сегодня**
```dataview
TABLE
  user_name as "👤 Клиент",
  count(rows) as "📅 Бронирований",
  sum(total_amount) as "💰 Потрачено (THB)",
  max(start_time) as "⏰ Последнее время"
FROM "oxygen-world/Database"
WHERE contains(file.name, "Booking-Today-")
GROUP BY user_name
SORT sum(total_amount) desc
LIMIT 5
```

### 🏓 **Загрузка Кортов**
```dataview
TABLE
  court_name as "🏓 Корт",
  count(rows) as "📅 Бронирований",
  sum(total_amount) as "💰 Доход (THB)",
  round(sum(duration_minutes) / 60, 1) as "⏰ Часов занято"
FROM "oxygen-world/Database"
WHERE contains(file.name, "Booking-Today-")
GROUP BY court_name
```

## 🏆 **Топ Игроки (Live)**

```dataview
TABLE
  first_name + " " + last_name as "👤 Игрок",
  current_rating as "⭐ Рейтинг",
  user_role as "🎭 Роль",
  total_games as "🎮 Игр"
FROM "oxygen-world/Database"
WHERE contains(file.name, "User-") AND !contains(file.name, "Data") AND current_rating != null
SORT current_rating desc
LIMIT 5
```

## 📅 **Сегодняшние Бронирования (Live)**

```dataview
TABLE
  court_name as "🏓 Корт",
  user_name as "👤 Клиент",
  start_time as "⏰ Время",
  duration_minutes + " мин" as "⏱️ Длительность",
  status as "📊 Статус",
  total_amount + " THB" as "💰 Сумма"
FROM "oxygen-world/Database"
WHERE contains(file.name, "Booking-Today-")
SORT start_time asc
```

## 🚀 **Быстрые Действия**

| Действие | Ссылка | Статус |
|----------|--------|--------|
| ➕ Новый клиент | [[👤 Profile Dashboard#add-client\|Добавить]] | ✅ |
| 📅 Новое бронирование | [[📋 Bookings Dashboard#new-booking\|Создать]] | ✅ |
| 💰 Новый платеж | [[💰 Finance Dashboard#new-payment\|Обработать]] | ✅ |
| ✅ Новая задача | [[✅ Tasks Dashboard#new-task\|Добавить]] | ✅ |

## 🔗 **Connected Data Network**

### 📅 **Live Bookings (Connected)**
- [[Booking-Today-001|📅 David Smith - Tennis 09:00 (1,200 THB)]]
- [[Booking-Today-002|📅 Anna Johnson - Padel 11:00 (800 THB)]]
- [[Booking-Today-003|📅 Sarah Brown - Padel 14:00 (600 THB)]]

### 👥 **Top Players (Connected)**
- [[User-David-Smith|👤 David Smith - 2485 ⭐ - 2 bookings today]]
- [[User-Anna-Johnson|👤 Anna Johnson - 2380 ⭐ - VIP Trainer]]
- [[User-Sarah-Brown|👤 Sarah Brown - 1850 ⭐ - Padel Enthusiast]]

### 💰 **Recent Payments (Connected)**
- [[Payment-001|💰 David Smith - 1,200 THB (Cash)]]
- [[Payment-002|💰 Anna Johnson - 800 THB (Card)]]
- [[Payment-003|💰 Sarah Brown - 600 THB (Cash)]]

### 🏓 **Court Status (Connected)**
- [[Court-Tennis|🏓 Tennis Court - 3 bookings today]]
- [[Court-Padel|🏓 Padel Court - 5 bookings today]]

### 📦 **Active Subscriptions (Connected)**
- [[Subscription-VIP-Anna|📦 Anna Johnson - VIP Package (8,000 THB/month)]]
- [[Subscription-Tennis-David|📦 David Smith - Tennis Package (4,500 THB/month)]]
- [[Subscription-Padel-Sarah|📦 Sarah Brown - Padel Package (4,500 THB/month)]]

### 🔧 **Technical Documentation** (For Developers)
- [[Technical/README|📋 Technical Documentation]]

---

## 🏝️ **Phangan Padel Tennis Club**
_Единственный профессиональный спортивный клуб на острове Панган_

🎾 **Tennis Court** • 🏓 **Padel Court** • 🏝️ **Paradise Location**

_Данные обновляются в реальном времени | Professional Sports Management System_
