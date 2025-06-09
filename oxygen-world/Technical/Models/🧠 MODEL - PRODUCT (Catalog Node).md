---
title: "🧠 MODEL - PRODUCT (Catalog Node)"
table_name: "product"
model_type: "catalog_node"
layer: "financial"
connections: 4
tags: [model, product, catalog_node, financial_layer]
---

# 🎯 PRODUCT (Catalog Node)
## Каталожный Узел Коммерческой Системы

[[Technical/README|← Техническая документация]]

## 🧠 **Роль в "Втором Мозге"**

**PRODUCT** - это **каталожный узел**, который представляет все товары и услуги в системе и является основой коммерческого слоя.

### 🎯 **Функции Каталожного Узла**
- **Каталог товаров** - все продукты и услуги
- **Ценообразование** - управление ценами
- **Инвентаризация** - связь со складскими операциями
- **Коммерческие операции** - основа для заказов

## 📊 **Структура Модели**

### 🔑 **Ключевые Поля**
```sql
- id: UUID (Primary Key)
- name: VARCHAR(255)
- description: TEXT
- category_id: UUID (FK → product_category.id)
- sku: VARCHAR(100) UNIQUE
- price: NUMERIC(10,2)
- currency: VARCHAR(3)
- stock_quantity: INTEGER
- min_stock_level: INTEGER
- is_active: BOOLEAN
- product_type: ENUM (equipment, apparel, accessories, services)
- brand: VARCHAR(100)
- specifications: JSONB
```

### 🔗 **Foreign Key Связи**
- **category_id** → **PRODUCT_CATEGORY**

## 🌐 **Связи в Нейронной Сети**

### 🔵 **Прямые Связи (4 модели)**

#### 💰 **Financial Layer**
- **ORDER_ITEM** - `product_id` (товары в заказах)
- **STOCK_TRANSACTION** - `product_id` (складские операции)

#### 🎓 **Education Layer**
- **CLASS_DEFINITION** - `equipment_required` (оборудование для занятий)

#### ⚙️ **System Layer**
- **TASK** - задачи по управлению товарами

### 🔄 **Входящие Связи**
- **PRODUCT_CATEGORY** → `category_id` (категория товара)

## 📈 **Аналитические Возможности**

### 🎯 **Метрики Товаров**
```dataview
TABLE
  name as "🎯 Товар",
  brand as "🏷️ Бренд",
  price + " " + currency as "💰 Цена",
  stock_quantity as "📦 Остаток",
  product_type as "📂 Тип"
FROM "oxygen-world/Database"
WHERE contains(file.name, "Product-") OR contains(file.name, "Inventory-")
```

### 📊 **Коммерческая Аналитика**
- **Популярные товары**: Количество продаж
- **Оборачиваемость**: Скорость продаж
- **Маржинальность**: Прибыльность товаров
- **Складские остатки**: Контроль запасов

## 🔗 **Связанные Данные**

### 🎯 **Все Товары**
- [[Products-Data|📊 Products Data]] - Каталог товаров

### 🎾 **Спортивное Оборудование**
- [[Inventory-Babolat-Pure-Drive|🎾 Babolat Pure Drive]] - Теннисная ракетка
- [[Inventory-Wilson-Pro-Staff|🎾 Wilson Pro Staff]] - Профессиональная ракетка
- [[Inventory-Padel-Balls-Head|🏓 Head Padel Balls]] - Мячи для падел

## 🧠 **Нейронные Паттерны**

### 🔄 **Циклы Коммерческой Активности**
```
PRODUCT → ORDER_ITEM → ORDER → PAYMENT → USER
PRODUCT → STOCK_TRANSACTION → INVENTORY_MANAGEMENT
PRODUCT → CLASS_DEFINITION → CLASS_SCHEDULE → USER
```

### 🌟 **Центральность в Графе**
- **Входящие связи**: 1 (PRODUCT_CATEGORY)
- **Исходящие связи**: 4 модели
- **Степень центральности**: Высокая в коммерческом слое
- **Влияние на граф**: Критическое для продаж

## 🎯 **Операционные Функции**

### 📦 **Управление Товарами**
- **Добавление**: Новые товары в каталог
- **Обновление**: Цены, описания, характеристики
- **Деактивация**: Снятие с продажи
- **Категоризация**: Организация по группам

### 💰 **Ценообразование**
- **Базовая цена**: price field
- **Валюта**: currency (THB, USD, EUR)
- **Скидки**: Через ORDER_ITEM
- **Сезонные изменения**: Динамическое обновление

### 📊 **Управление Запасами**
- **Текущий остаток**: stock_quantity
- **Минимальный уровень**: min_stock_level
- **Автоматические уведомления**: При низких остатках
- **Пополнение**: Через STOCK_TRANSACTION

## 📂 **Типы Товаров**

### 🎾 **Equipment (Оборудование)**
- **Ракетки**: Tennis, Padel
- **Мячи**: Различные типы
- **Сетки**: Для кортов
- **Аксессуары**: Грипы, струны

### 👕 **Apparel (Одежда)**
- **Спортивная форма**: Футболки, шорты
- **Обувь**: Теннисная, для падел
- **Аксессуары**: Кепки, повязки
- **Брендированная одежда**: Клубная символика

### 🎒 **Accessories (Аксессуары)**
- **Сумки**: Для ракеток
- **Бутылки**: Для воды
- **Полотенца**: Спортивные
- **Защита**: Напульсники, наколенники

### 🎓 **Services (Услуги)**
- **Тренировки**: Индивидуальные, групповые
- **Аренда**: Кортов, оборудования
- **Турниры**: Участие, организация
- **Членство**: Различные пакеты

## 🏷️ **Популярные Бренды**

### 🎾 **Tennis Equipment**
- **Wilson**: Pro Staff, Blade серии
- **Babolat**: Pure Drive, Pure Aero
- **Head**: Speed, Radical серии
- **Yonex**: EZONE, VCORE серии

### 🏓 **Padel Equipment**
- **Head**: Delta серии
- **Bullpadel**: Vertex, Hack серии
- **Adidas**: Adipower серии
- **Nox**: ML10, AT10 серии

### 👕 **Apparel Brands**
- **Nike**: Dri-FIT технологии
- **Adidas**: Climacool серии
- **Under Armour**: HeatGear
- **Lacoste**: Классический стиль

## 🔄 **Интеграции**

### 📦 **Складская Система**
- **STOCK_TRANSACTION**: Движение товаров
- **Автоматический учет**: При продажах
- **Инвентаризация**: Регулярные проверки
- **Уведомления**: О низких остатках

### 💳 **Коммерческие Операции**
- **ORDER_ITEM**: Товары в заказах
- **Ценообразование**: Динамические цены
- **Скидки**: Промо-акции
- **Налоги**: Автоматический расчет

### 🎓 **Образовательные Программы**
- **CLASS_DEFINITION**: Необходимое оборудование
- **Аренда**: Для занятий
- **Продажа**: Ученикам со скидкой
- **Рекомендации**: Подходящие товары

---

*🎯 Каталожный Узел - Основа Коммерческих Операций*
*🏝️ Phangan Padel Tennis Club - Commercial Intelligence*
