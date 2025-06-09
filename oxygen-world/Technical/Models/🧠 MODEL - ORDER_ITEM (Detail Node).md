---
title: "🧠 MODEL - ORDER_ITEM (Detail Node)"
table_name: "order_item"
model_type: "detail_node"
layer: "financial"
connections: 2
tags: [model, order_item, detail_node, financial_layer]
---

# 📦 ORDER_ITEM (Detail Node)
## Детализирующий Узел Торговых Позиций

[[Technical/README|← Техническая документация]]

## 🧠 **Роль в "Втором Мозге"**

**ORDER_ITEM** - это **детализирующий узел**, который связывает заказы с конкретными товарами и обеспечивает детализацию коммерческих операций.

### 🎯 **Функции Детализирующего Узла**
- **Связь заказов и товаров** - many-to-many relationship
- **Детализация покупок** - количество, цены, скидки
- **Коммерческая аналитика** - анализ продаж по товарам
- **Складской учет** - резервирование и списание

## 📊 **Структура Модели**

### 🔑 **Ключевые Поля**
```sql
- id: UUID (Primary Key)
- order_id: UUID (FK → order.id)
- product_id: UUID (FK → product.id)
- quantity: INTEGER
- unit_price: NUMERIC(10,2)
- total_price: NUMERIC(10,2)
- discount_amount: NUMERIC(10,2)
- discount_percentage: NUMERIC(5,2)
- notes: TEXT
- created_at: TIMESTAMP WITH TIME ZONE
```

### 🔗 **Foreign Key Связи**
- **order_id** → [[Technical/Models/🧠 MODEL - ORDER (Commerce Node)|🛒 ORDER]]
- **product_id** → [[Technical/Models/🧠 MODEL - PRODUCT (Catalog Node)|🎯 PRODUCT]]

## 🌐 **Связи в Нейронной Сети**

### 🔵 **Прямые Связи (2 модели)**

#### 💰 **Financial Layer**
- **ORDER** - родительский заказ
- **PRODUCT** - конкретный товар

### 🔄 **Входящие Связи**
- **ORDER** → `order_id` (заказ)
- **PRODUCT** → `product_id` (товар)

## 📈 **Аналитические Возможности**

### 🎯 **Метрики Позиций**
```dataview
TABLE
  quantity as "📦 Кол-во",
  unit_price as "💰 Цена за ед.",
  total_price as "💰 Сумма",
  discount_amount as "🎁 Скидка"
FROM "oxygen-world/Database"
WHERE contains(file.name, "Order-Item-") OR contains(file.name, "OrderItem-")
```

### 📊 **Детальная Аналитика**
- **Популярные товары**: Сумма quantity по product_id
- **Средняя корзина**: Среднее количество позиций в заказе
- **Эффективность скидок**: Влияние discount на продажи
- **Маржинальность**: Прибыль по товарам

## 🔗 **Связанные Данные**

### 📦 **Все Позиции**
- [[Order-Items-Data|📊 Order Items Data]] - Детализация заказов

### 🎯 **Популярные Товары**
- **Tennis Equipment** - Теннисное оборудование
- **Padel Equipment** - Оборудование для падел
- **Apparel** - Спортивная одежда
- **Accessories** - Аксессуары

## 🧠 **Нейронные Паттерны**

### 🔄 **Циклы Детализации**
```
ORDER → ORDER_ITEM → PRODUCT
ORDER_ITEM → STOCK_TRANSACTION → INVENTORY
ORDER_ITEM → ANALYTICS → BUSINESS_INTELLIGENCE
```

### 🌟 **Центральность в Графе**
- **Входящие связи**: 2 (ORDER, PRODUCT)
- **Исходящие связи**: 0 (конечный узел)
- **Степень центральности**: Средняя (связующий узел)
- **Влияние на граф**: Критическое для детализации

## 🎯 **Операционные Функции**

### 📦 **Управление Позициями**
- **Добавление**: В корзину покупок
- **Изменение**: Количества и параметров
- **Удаление**: Из заказа
- **Расчет**: Автоматический total_price

### 💰 **Ценообразование**
- **Базовая цена**: unit_price из PRODUCT
- **Количественные скидки**: По quantity
- **Промо-скидки**: discount_percentage
- **Итоговая сумма**: total_price = (unit_price × quantity) - discount_amount

### 🎁 **Система Скидок**
- **Процентные**: discount_percentage
- **Фиксированные**: discount_amount
- **Количественные**: При покупке от N штук
- **Сезонные**: Временные акции

## 📊 **Типы Позиций**

### 🎾 **Equipment Items (Оборудование)**
- **Ракетки**: Обычно 1-2 штуки
- **Мячи**: Упаковки по 3-4 штуки
- **Струны**: Комплекты
- **Средний чек**: 2,000-5,000 THB

### 👕 **Apparel Items (Одежда)**
- **Футболки**: Размерная линейка
- **Шорты**: Различные модели
- **Обувь**: Размерная сетка
- **Средний чек**: 1,500-3,000 THB

### 🎒 **Accessory Items (Аксессуары)**
- **Сумки**: Для ракеток
- **Бутылки**: Спортивные
- **Полотенца**: Брендированные
- **Средний чек**: 500-1,500 THB

### 🎓 **Service Items (Услуги)**
- **Тренировки**: Пакеты занятий
- **Аренда**: Почасовая оплата
- **Членство**: Абонементы
- **Средний чек**: 3,000-10,000 THB

## 🔢 **Расчетные Функции**

### 💰 **Автоматические Расчеты**
```sql
-- Расчет итоговой суммы позиции
total_price = (unit_price * quantity) - discount_amount

-- Расчет процентной скидки
discount_amount = (unit_price * quantity) * (discount_percentage / 100)

-- Проверка корректности
CONSTRAINT check_total_price 
CHECK (total_price >= 0 AND total_price <= (unit_price * quantity))
```

### 📊 **Аналитические Запросы**
```sql
-- Топ товаров по продажам
SELECT product_id, SUM(quantity) as total_sold, SUM(total_price) as revenue
FROM order_item 
GROUP BY product_id 
ORDER BY revenue DESC

-- Средняя корзина
SELECT AVG(items_count) as avg_basket_size
FROM (SELECT order_id, COUNT(*) as items_count FROM order_item GROUP BY order_id)

-- Эффективность скидок
SELECT 
  AVG(discount_percentage) as avg_discount,
  SUM(discount_amount) as total_discounts,
  SUM(total_price) as revenue_after_discounts
FROM order_item WHERE discount_amount > 0
```

## 🎯 **Бизнес-Правила**

### ✅ **Валидация**
- **Количество**: quantity > 0
- **Цена**: unit_price >= 0
- **Скидка**: discount_amount <= (unit_price × quantity)
- **Итог**: total_price >= 0

### 🔄 **Автоматизация**
- **Цена**: Автоматическое заполнение из PRODUCT
- **Скидки**: Применение по правилам
- **Пересчет**: При изменении quantity
- **Валидация**: Проверка наличия товара

### 📦 **Складские Операции**
- **Резервирование**: При добавлении в корзину
- **Списание**: При подтверждении заказа
- **Возврат**: При отмене позиции
- **Контроль**: Проверка остатков

## 🔄 **Интеграции**

### 🛒 **Корзина Покупок**
- **Добавление товаров**: Создание ORDER_ITEM
- **Изменение количества**: Обновление quantity
- **Удаление**: Soft delete или физическое удаление
- **Пересчет**: Автоматический при изменениях

### 📊 **Аналитика Продаж**
- **Отчеты по товарам**: Группировка по product_id
- **Анализ корзины**: Средние значения
- **Эффективность акций**: Анализ скидок
- **Прогнозирование**: Тренды продаж

### 💳 **Финансовая Отчетность**
- **Выручка**: Сумма total_price
- **Скидки**: Сумма discount_amount
- **Налоги**: Расчет с учетом позиций
- **Маржинальность**: Прибыль по товарам

---

*📦 Детализирующий Узел - Связь Заказов и Товаров*
*🏝️ Phangan Padel Tennis Club - Detail Intelligence*
