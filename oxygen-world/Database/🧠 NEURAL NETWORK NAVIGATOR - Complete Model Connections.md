---
title: "🧠 NEURAL NETWORK NAVIGATOR - Complete Model Connections"
tags: [neural_network, navigation, models, connections, central_hub]
total_models: 31
connection_type: "full_mesh"
navigation_enabled: true
last_updated: "2025-01-31"
---

# 🧠 NEURAL NETWORK NAVIGATOR - Complete Model Connections

> **🎯 Центральный навигатор по всем 31 модели**  
> **🔗 Полная связанность - каждая модель связана с каждой**  
> **🧠 "Второй Мозг" архитектура для бизнеса**

## 🌟 **ЦЕНТРАЛЬНЫЕ НЕЙРОНЫ (Core Models)**

### 👥 **USER - Главный Нейрон**
- [[User-David-Smith-Demo|🎾 David Smith - Топ игрок (рейтинг 2485)]]
- [[User-Anna-Johnson-Demo|👨‍💼 Anna Johnson - Администратор (рейтинг 2200)]]
- [[👥 Users Demo - Real-time Sync|👥 Все пользователи - Центральная таблица]]

**Связи USER:**
- 📅 [[Bookings-Data|Бронирования]] → Пользователи бронируют корты
- 💰 [[Payments-Data|Платежи]] → Пользователи оплачивают услуги
- 🎮 [[Game-Sessions-Data|Игровые сессии]] → Пользователи играют
- 🏆 [[Tournaments-Data|Турниры]] → Пользователи участвуют
- 🎓 [[Classes-Data|Классы]] → Пользователи обучаются
- 🛒 [[Orders-Data|Заказы]] → Пользователи покупают
- 📈 [[Rating-Changes-Data|Изменения рейтинга]] → Рейтинг пользователей
- 💬 [[Feedback-Data|Отзывы]] → Пользователи оставляют отзывы
- 🔔 [[Notifications-Data|Уведомления]] → Пользователи получают уведомления
- 📋 [[Tasks-Data|Задачи]] → Пользователям назначают задачи

## 🏢 **BUSINESS LAYER - Основные Операции**

### 📅 **BOOKINGS - Бронирования**
- [[Bookings-Data|📅 Все бронирования]]
- [[Booking-Participants-Data|👥 Участники бронирований]]

**Связи BOOKINGS:**
- 👥 [[👥 Users Demo - Real-time Sync|Пользователи]] ← кто бронирует
- 🎾 [[Courts-Data|Корты]] ← что бронируют
- 💰 [[Payments-Data|Платежи]] ← как оплачивают
- 🏢 [[Venues-Data|Площадки]] ← где бронируют
- 🎮 [[Game-Sessions-Data|Игровые сессии]] ← для чего бронируют

### 🔗 **USER ACCOUNT LINKS - Внешние Аккаунты**
- [[User-Account-Links-Data|🔗 Связи с внешними аккаунтами]]

**Связи ACCOUNT LINKS:**
- 👥 [[👥 Users Demo - Real-time Sync|Пользователи]] ← основной аккаунт
- 🔗 [[External-System-Mapping-Data|Внешние системы]] ← маппинг систем

## 💰 **FINANCIAL LAYER - Деньги и Товары**

### 🏢 **VENUES - Площадки**
- [[Venues-Data|🏢 Все площадки и клубы]]

**Связи VENUES:**
- 🎾 [[Courts-Data|Корты]] ← содержат корты
- 📅 [[Bookings-Data|Бронирования]] ← принимают бронирования
- 🎓 [[Classes-Data|Классы]] ← проводят классы
- 🎮 [[Game-Sessions-Data|Игровые сессии]] ← хостят игры

### 🎾 **COURTS - Корты**
- [[Courts-Data|🎾 Все корты для игры]]

**Связи COURTS:**
- 🏢 [[Venues-Data|Площадки]] ← принадлежат площадкам
- 📅 [[Bookings-Data|Бронирования]] ← бронируются для игр
- 🎮 [[Game-Sessions-Data|Игровые сессии]] ← хостят игровые сессии
- 🎓 [[Class-Schedule-Data|Расписание классов]] ← используются для классов

### 💰 **PAYMENTS - Платежи**
- [[Payments-Data|💰 Все платежи и транзакции]]

**Связи PAYMENTS:**
- 👥 [[👥 Users Demo - Real-time Sync|Пользователи]] ← кто платит
- 📅 [[Bookings-Data|Бронирования]] ← за что платят
- 🛒 [[Orders-Data|Заказы]] ← оплата заказов
- 🎓 [[Classes-Data|Классы]] ← оплата обучения
- 🏆 [[Tournaments-Data|Турниры]] ← взносы за участие

### 🛍️ **PRODUCTS & ORDERS - Товары и Заказы**
- [[Product-Categories-Data|📂 Категории товаров]]
- [[Products-Data|🛍️ Все товары и услуги]]
- [[Orders-Data|🛒 Заказы пользователей]]
- [[Order-Items-Data|📦 Позиции в заказах]]
- [[Stock-Transactions-Data|📊 Движение товаров]]
- [[Bonus-Transactions-Data|🎁 Бонусные баллы]]

**Связи PRODUCTS:**
- 👥 [[👥 Users Demo - Real-time Sync|Пользователи]] ← покупают товары
- 🛒 [[Orders-Data|Заказы]] ← содержатся в заказах
- 📂 [[Product-Categories-Data|Категории]] ← принадлежат категориям
- 📊 [[Stock-Transactions-Data|Движение товаров]] ← отслеживание склада

## 🎓 **EDUCATION LAYER - Обучение и Классы**

### 🎓 **CLASSES - Классы и Тренировки**
- [[Class-Definitions-Data|🎓 Определения классов]]
- [[Class-Schedule-Data|📅 Расписание классов]]
- [[Class-Participants-Data|👥 Участники классов]]

**Связи CLASSES:**
- 👥 [[👥 Users Demo - Real-time Sync|Пользователи]] ← инструкторы и ученики
- 🎾 [[Courts-Data|Корты]] ← где проводятся
- 💰 [[Payments-Data|Платежи]] ← оплата за обучение
- 📦 [[Training-Package-Definitions-Data|Пакеты тренировок]] ← входят в пакеты

### 📦 **TRAINING PACKAGES - Пакеты Тренировок**
- [[Training-Package-Definitions-Data|📦 Пакеты тренировок]]
- [[User-Training-Packages-Data|🎫 Купленные пакеты]]

**Связи TRAINING PACKAGES:**
- 👥 [[👥 Users Demo - Real-time Sync|Пользователи]] ← покупают пакеты
- 🎓 [[Class-Definitions-Data|Классы]] ← включают классы
- 💰 [[Payments-Data|Платежи]] ← оплата пакетов

## 🎮 **GAMING LAYER - Игры и Турниры**

### 🎮 **GAME SESSIONS - Игровые Сессии**
- [[Game-Sessions-Data|🎮 Все игровые сессии]]
- [[Game-Players-Data|🎾 Игроки в сессиях]]

**Связи GAME SESSIONS:**
- 👥 [[👥 Users Demo - Real-time Sync|Пользователи]] ← участники игр
- 🎾 [[Courts-Data|Корты]] ← где играют
- 📈 [[Rating-Changes-Data|Изменения рейтинга]] ← влияют на рейтинг
- 🏆 [[Tournaments-Data|Турниры]] ← могут быть частью турниров

### 📈 **RATING CHANGES - Рейтинговая Система**
- [[Rating-Changes-Data|📈 Все изменения рейтинга]]

**Связи RATING CHANGES:**
- 👥 [[👥 Users Demo - Real-time Sync|Пользователи]] ← чей рейтинг меняется
- 🎮 [[Game-Sessions-Data|Игровые сессии]] ← основа для изменений
- 🏆 [[Tournaments-Data|Турниры]] ← турнирные изменения

### 🏆 **TOURNAMENTS - Турниры**
- [[Tournaments-Data|🏆 Все турниры и соревнования]]
- [[Tournament-Participants-Data|🎾 Участники турниров]]
- [[Tournament-Teams-Data|👥 Команды в турнирах]]
- [[Tournament-Matches-Data|⚔️ Матчи турниров]]

**Связи TOURNAMENTS:**
- 👥 [[👥 Users Demo - Real-time Sync|Пользователи]] ← участники
- 🎮 [[Game-Sessions-Data|Игровые сессии]] ← матчи турнира
- 💰 [[Payments-Data|Платежи]] ← взносы за участие
- 📈 [[Rating-Changes-Data|Изменения рейтинга]] ← турнирные очки

## 🤖 **AI/ANALYTICS LAYER - Аналитика и ИИ**

### 🤖 **AI SUGGESTIONS - ИИ Рекомендации**
- [[AI-Suggestion-Logs-Data|🤖 Логи AI рекомендаций]]

**Связи AI SUGGESTIONS:**
- 👥 [[👥 Users Demo - Real-time Sync|Пользователи]] ← получают рекомендации
- 🎮 [[Game-Sessions-Data|Игровые сессии]] ← анализ игр
- 📅 [[Bookings-Data|Бронирования]] ← рекомендации времени
- 🎓 [[Classes-Data|Классы]] ← рекомендации обучения

### 💬 **FEEDBACK - Отзывы и Оценки**
- [[Feedback-Data|💬 Все отзывы и оценки]]

**Связи FEEDBACK:**
- 👥 [[👥 Users Demo - Real-time Sync|Пользователи]] ← кто оставляет отзывы
- 🎾 [[Courts-Data|Корты]] ← отзывы о кортах
- 🎓 [[Classes-Data|Классы]] ← отзывы о классах
- 🏢 [[Venues-Data|Площадки]] ← отзывы о площадках
- 🛍️ [[Products-Data|Товары]] ← отзывы о товарах

## 🔧 **SYSTEM LAYER - Система и Интеграции**

### 📋 **TASKS - Задачи**
- [[Tasks-Data|📋 Все задачи и поручения]]

**Связи TASKS:**
- 👥 [[👥 Users Demo - Real-time Sync|Пользователи]] ← кому назначены
- 🏢 [[Venues-Data|Площадки]] ← задачи по площадкам
- 🎾 [[Courts-Data|Корты]] ← обслуживание кортов
- 🛍️ [[Products-Data|Товары]] ← управление товарами

### 🔔 **NOTIFICATIONS - Уведомления**
- [[Notifications-Data|🔔 Все уведомления]]

**Связи NOTIFICATIONS:**
- 👥 [[👥 Users Demo - Real-time Sync|Пользователи]] ← получатели
- 📅 [[Bookings-Data|Бронирования]] ← уведомления о бронированиях
- 💰 [[Payments-Data|Платежи]] ← уведомления о платежах
- 🏆 [[Tournaments-Data|Турниры]] ← уведомления о турнирах
- 🎓 [[Classes-Data|Классы]] ← уведомления о классах

### 🔗 **EXTERNAL SYSTEM MAPPING - Внешние Системы**
- [[External-System-Mapping-Data|🔗 Маппинг внешних систем]]

**Связи EXTERNAL MAPPING:**
- 👥 [[👥 Users Demo - Real-time Sync|Пользователи]] ← синхронизация аккаунтов
- 📅 [[Bookings-Data|Бронирования]] ← синхронизация с календарями
- 💰 [[Payments-Data|Платежи]] ← интеграция с платежными системами
- 🎓 [[Classes-Data|Классы]] ← синхронизация расписаний

## 🗺️ **NAVIGATION MAP - Карта Навигации**

### 🎯 **Быстрые Переходы:**

```dataview
TABLE
  file.name as "📄 Модель",
  tags as "🏷️ Теги",
  length(file.outlinks) as "🔗 Исходящие связи",
  length(file.inlinks) as "⬅️ Входящие связи"
FROM "oxygen-world/Database"
WHERE contains(file.name, "Data")
SORT length(file.outlinks) + length(file.inlinks) desc
```

### 🧠 **Центральные Узлы (Most Connected):**
1. **👥 Users** - центральный нейрон (связан со всеми)
2. **📅 Bookings** - основной бизнес-процесс
3. **💰 Payments** - финансовый центр
4. **🎾 Courts** - физический ресурс
5. **🏢 Venues** - локационный центр

---

*🧠 Полная связанность всех 31 модели*
*🔗 Каждая модель связана с каждой через логические пути*
*🎯 Навигация в один клик между любыми данными*
*🏝️ Phangan Padel Tennis Club - Connected Intelligence*
