---
id: "stock-001"
product_id: "product-babolat-pure-drive"
transaction_type: "sale"
quantity_change: -1
quantity_before: 15
quantity_after: 14
unit_cost: 8500.00
total_cost: 8500.00
currency: "THB"
reference_type: "order"
reference_id: "order-001"
performed_by_user_id: "user-anna-johnson"
transaction_date: "2024-01-15T14:30:00+07:00"
tags: [stock_transaction, sale, babolat, tennis_racket]
---

# 📊 Stock Transaction #001
## Продажа Теннисной Ракетки Babolat Pure Drive

## 🔗 **Связи в "Втором Мозге"**

### 🧠 **Модель**
- [[Technical/Models/🧠 MODEL - STOCK_TRANSACTION (Inventory Node)|📊 STOCK_TRANSACTION (Inventory Node)]] - Инвентарный узел

### 🔗 **Связанные Модели**
- [[Technical/Models/🧠 MODEL - PRODUCT (Catalog Node)|🎯 PRODUCT]] → [[Inventory-Babolat-Pure-Drive|🎾 Babolat Pure Drive]]
- [[Technical/Models/🧠 MODEL - USER (Central Neuron)|👥 USER]] → [[User-Anna-Johnson|👤 Anna Johnson]]
- [[Technical/Models/🧠 MODEL - ORDER (Commerce Node)|🛒 ORDER]] → Order #001
- [[Technical/Models/🧠 MODEL - NOTIFICATION (Communication Node)|🔔 NOTIFICATION]] → Уведомление о низком остатке

## 📊 **Детали Транзакции**

### 📦 **Складская Информация**
- **Тип операции**: `= this.transaction_type` (Продажа)
- **Изменение количества**: `= this.quantity_change` шт
- **Остаток до**: `= this.quantity_before` шт
- **Остаток после**: `= this.quantity_after` шт

### 💰 **Финансовая Информация**
- **Цена за единицу**: `= this.unit_cost` `= this.currency`
- **Общая стоимость**: `= this.total_cost` `= this.currency`

### 🔗 **Связанные Операции**
- **Тип ссылки**: `= this.reference_type` (Заказ)
- **ID ссылки**: `= this.reference_id`
- **Исполнитель**: `= this.performed_by_user_id`

### 📅 **Временные Данные**
- **Дата операции**: `= this.transaction_date`

## 🔗 **Связанные Данные**

### 🎾 **Товар**
- [[Inventory-Babolat-Pure-Drive|🎾 Babolat Pure Drive - Профессиональная ракетка]]

### 👤 **Покупатель**
- [[User-Anna-Johnson|👤 Anna Johnson - Падел специалист]]

### 🛒 **Заказ**
- **Order #001**: Покупка ракетки для турнира
- **Статус**: Completed
- **Доставка**: Самовывоз из клуба

## 📈 **Складская Аналитика**

### 📊 **Остатки**
```
15 → 14 ракеток (-1)
Снижение на 6.7%
```

### ⚠️ **Критические Уровни**
- **Минимальный остаток**: 10 шт
- **Текущий остаток**: 14 шт
- **Статус**: Нормальный уровень
- **Рекомендация**: Заказ через 4 продажи

### 📈 **Оборачиваемость**
- **Продаж в месяц**: 8-12 шт
- **Средний остаток**: 15 шт
- **Оборачиваемость**: 0.67 раза в месяц
- **Дни на складе**: 45 дней

## 🔄 **Связанные Операции**

### 📥 **Последнее Поступление**
- Stock-Transaction-Purchase-Babolat-001 (+20 шт)
- Дата: 2024-01-01
- Поставщик: Tennis Pro Thailand

### 📤 **Предыдущие Продажи**
- Stock-Transaction-Sale-David-001 (-1 шт)
- Stock-Transaction-Sale-Sarah-001 (-1 шт)

### 📋 **Планируемые Операции**
- Заказ новой партии при остатке 10 шт
- Инвентаризация: 2024-01-31

## 🎯 **Категория и Классификация**

### 📂 **Категория**
- [[Technical/Models/🧠 MODEL - PRODUCT_CATEGORY (Classification Node)|📂 PRODUCT_CATEGORY]] → Tennis Equipment → Rackets → Professional

### 🏷️ **Характеристики**
- **Бренд**: Babolat
- **Модель**: Pure Drive
- **Вес**: 300g
- **Размер головы**: 100 sq in
- **Уровень**: Профессиональный

## 🔔 **Уведомления**

### 📱 **Автоматические Уведомления**
- **Менеджеру склада**: Продажа зафиксирована
- **Покупателю**: Товар готов к выдаче
- **Бухгалтерии**: Обновление финансовых данных

### 📊 **Аналитические Уведомления**
- **Популярный товар**: Высокий спрос
- **Рекомендация**: Увеличить заказ на 20%

---

*📊 Точный Учет Каждого Движения*
*🏝️ Phangan Padel Tennis Club - Inventory Management*
