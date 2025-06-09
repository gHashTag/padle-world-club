---
title: "🧠 MODEL - PAYMENT (Transaction Node)"
table_name: "payment"
model_type: "transaction_node"
layer: "financial"
connections: 4
tags: [model, payment, transaction_node, financial_layer]
---

# 💰 PAYMENT (Transaction Node)
## Транзакционный Узел Финансовой Системы

[[Technical/README|← Техническая документация]]

## 🧠 **Роль в "Втором Мозге"**

**PAYMENT** - это **транзакционный узел**, который обрабатывает все финансовые операции и является центром финансового слоя системы.

### 🎯 **Функции Транзакционного Узла**
- **Финансовые операции** - обработка всех платежей
- **Связь с бронированиями** - оплата за услуги
- **Инициация заказов** - создание коммерческих операций
- **Бонусная система** - начисление и списание бонусов

## 📊 **Структура Модели**

### 🔑 **Ключевые Поля**
```sql
- id: UUID (Primary Key)
- user_id: UUID (FK → user.id)
- booking_id: UUID (FK → booking.id)
- amount: NUMERIC(10,2)
- currency: VARCHAR(3)
- payment_method: ENUM (cash, card, bank_transfer, bonus_points)
- status: ENUM (pending, completed, failed, refunded)
- transaction_id: VARCHAR(255)
- payment_date: TIMESTAMP WITH TIME ZONE
- description: TEXT
```

### 🔗 **Foreign Key Связи**
- **user_id** → [[Technical/Models/🧠 MODEL - USER (Central Neuron)|👥 USER]]
- **booking_id** → [[Technical/Models/🧠 MODEL - BOOKING (Temporal Node)|📅 BOOKING]]

## 🌐 **Связи в Нейронной Сети**

### 🔵 **Прямые Связи (4 модели)**

#### 💰 **Financial Layer**
- **ORDER** - `payment_id` (платеж инициирует заказ)
- **BONUS_TRANSACTION** - `related_payment_id` (бонусные операции)

#### ⚙️ **System Layer**
- **NOTIFICATION** - уведомления о платежах
- **TASK** - задачи по обработке платежей

### 🔄 **Входящие Связи**
- **USER** → `user_id` (кто платит)
- **BOOKING** → `booking_id` (за что платят)

## 📈 **Аналитические Возможности**

### 🎯 **Метрики Платежей**
```dataview
TABLE
  amount + " " + currency as "💰 Сумма",
  payment_method as "💳 Способ",
  status as "📊 Статус",
  payment_date as "📅 Дата"
FROM "oxygen-world/Database"
WHERE contains(file.name, "Payment-") AND !contains(file.name, "Data")
SORT payment_date desc
```

### 📊 **Финансовая Аналитика**
- **Общий оборот**: Сумма всех completed платежей
- **Популярные способы оплаты**: Cash vs Card vs Bonus
- **Конверсия**: Процент successful vs failed
- **Средний чек**: Среднее значение amount

## 🔗 **Связанные Данные**

### 💰 **Все Платежи**
- [[Payments-Data|📊 Payments Data]] - Сводка всех платежей

### 🎯 **Конкретные Платежи**
- [[Payment-001|💰 Payment 1,200 THB - Tennis Court]] - Оплата корта
- [[Payment-002|💰 Payment 800 THB - Padel Court]] - Оплата падел
- [[Payment-003|💰 Payment 1,500 THB - VIP Package]] - VIP пакет

## 🧠 **Нейронные Паттерны**

### 🔄 **Циклы Финансовой Активности**
```
USER → BOOKING → PAYMENT → ORDER → BONUS_TRANSACTION → USER
PAYMENT → NOTIFICATION → USER
PAYMENT → TASK → VENUE (для обработки)
```

### 🌟 **Центральность в Графе**
- **Входящие связи**: 2 (USER, BOOKING)
- **Исходящие связи**: 4 модели
- **Степень центральности**: Высокая в финансовом слое
- **Влияние на граф**: Критическое для монетизации

## 🎯 **Операционные Функции**

### 💳 **Обработка Платежей**
- **Валидация**: Проверка данных платежа
- **Авторизация**: Подтверждение операции
- **Завершение**: Фиксация транзакции
- **Уведомления**: Информирование пользователя

### 🔄 **Жизненный Цикл**
1. **Создание**: Из BOOKING или прямое создание
2. **Ожидание**: pending (ожидает обработки)
3. **Обработка**: processing (в процессе)
4. **Завершение**: completed/failed
5. **Последствия**: ORDER, BONUS_TRANSACTION, NOTIFICATION

### 🎁 **Бонусная Система**
- **Начисление**: BONUS_TRANSACTION при completed
- **Списание**: payment_method = bonus_points
- **Конвертация**: Бонусы в реальные платежи
- **Лояльность**: Программы накопления

## 📊 **Типы Платежей**

### 💵 **Cash (Наличные)**
- **Обработка**: Мгновенная
- **Подтверждение**: Ручное
- **Риски**: Минимальные
- **Популярность**: Высокая в Таиланде

### 💳 **Card (Карта)**
- **Обработка**: Через платежный шлюз
- **Подтверждение**: Автоматическое
- **Риски**: Технические сбои
- **Удобство**: Высокое

### 🏦 **Bank Transfer (Перевод)**
- **Обработка**: 1-3 дня
- **Подтверждение**: По выписке
- **Риски**: Задержки
- **Суммы**: Крупные платежи

### 🎁 **Bonus Points (Бонусы)**
- **Обработка**: Мгновенная
- **Подтверждение**: Автоматическое
- **Ограничения**: Баланс бонусов
- **Лояльность**: Стимулирует возвраты

## 🔄 **Интеграции**

### 🏦 **Платежные Системы**
- **Stripe**: Международные карты
- **PromptPay**: Тайские QR-платежи
- **Bank Transfer**: Прямые переводы
- **Cash**: Терминалы и касса

### 📊 **Аналитика**
- **Revenue Tracking**: Отслеживание доходов
- **Payment Analytics**: Анализ способов оплаты
- **Fraud Detection**: Выявление мошенничества
- **Tax Reporting**: Налоговая отчетность

---

*💰 Транзакционный Узел - Сердце Финансовой Системы*
*🏝️ Phangan Padel Tennis Club - Financial Intelligence*
