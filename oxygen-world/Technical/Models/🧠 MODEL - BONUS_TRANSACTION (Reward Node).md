---
title: "🧠 MODEL - BONUS_TRANSACTION (Reward Node)"
table_name: "bonus_transaction"
model_type: "reward_node"
layer: "financial"
connections: 3
tags: [model, bonus_transaction, reward_node, financial_layer]
---

# 🎁 BONUS_TRANSACTION (Reward Node)
## Наградной Узел Бонусных Операций

[[Technical/README|← Техническая документация]]

## 🧠 **Роль в "Втором Мозге"**

**BONUS_TRANSACTION** - это **наградной узел**, который управляет системой лояльности, бонусами и наградами для стимулирования активности пользователей.

### 🎯 **Функции Наградного Узла**
- **Система лояльности** - накопление и трата бонусов
- **Мотивация пользователей** - поощрение активности
- **Геймификация** - игровые элементы в сервисе
- **Удержание клиентов** - программы лояльности

## 📊 **Структура Модели**

### 🔑 **Ключевые Поля**
```sql
- id: UUID (Primary Key)
- user_id: UUID (FK → user.id)
- transaction_type: ENUM (earned, spent, expired, transferred, refunded)
- bonus_type: ENUM (loyalty_points, cashback, referral_bonus, achievement_reward, promotional)
- amount: INTEGER
- balance_before: INTEGER
- balance_after: INTEGER
- source_type: ENUM (booking, payment, tournament, referral, manual, promotion)
- source_id: UUID
- expiry_date: DATE
- description: TEXT
- multiplier: NUMERIC(3,2)
- campaign_id: UUID
- transaction_date: TIMESTAMP WITH TIME ZONE
- processed_by_user_id: UUID (FK → user.id)
- status: ENUM (pending, completed, cancelled, expired)
- metadata: JSONB
```

### 🔗 **Foreign Key Связи**
- **user_id** → [[Technical/Models/🧠 MODEL - USER (Central Neuron)|👥 USER]]
- **processed_by_user_id** → [[Technical/Models/🧠 MODEL - USER (Central Neuron)|👥 USER]]

## 🌐 **Связи в Нейронной Сети**

### 🔵 **Прямые Связи (3 модели)**

#### 💰 **Financial Layer**
- **PAYMENT** - связь с платежами для кэшбека

#### ⚙️ **System Layer**
- **NOTIFICATION** - уведомления о бонусах

#### 🤖 **AI Layer**
- **AI_SUGGESTION_LOG** - персонализированные предложения

### 🔄 **Входящие Связи**
- **USER** → `user_id` (получатель бонусов)
- **BOOKING** → `source_id` (при бронированиях)
- **PAYMENT** → `source_id` (при оплатах)
- **TOURNAMENT_PARTICIPANT** → `source_id` (за участие в турнирах)

## 📈 **Аналитические Возможности**

### 🎯 **Метрики Бонусов**
```dataview
TABLE
  bonus_type as "🎁 Тип",
  transaction_type as "🔄 Операция",
  amount as "💰 Сумма",
  balance_after as "📊 Баланс",
  transaction_date as "📅 Дата"
FROM "oxygen-world/Database"
WHERE contains(file.name, "Bonus-Transaction-") OR contains(file.name, "BonusTransaction-")
SORT transaction_date desc
```

### 📊 **Бонусная Аналитика**
- **Активность программы**: Количество операций
- **Популярность типов**: Распределение по типам бонусов
- **Конверсия**: Процент потраченных бонусов
- **Эффективность**: Влияние на лояльность

## 🔗 **Связанные Данные**

### 🎁 **Все Бонусы**
- [[Bonus-Data|📊 Bonus Data]] - Бонусные данные

### 🎯 **Активные Программы**
- **Loyalty Points** - Основная программа лояльности
- **Referral Bonuses** - Реферальные бонусы
- **Tournament Rewards** - Турнирные награды

## 🧠 **Нейронные Паттерны**

### 🔄 **Циклы Бонусной Активности**
```
USER_ACTION → BONUS_TRANSACTION → LOYALTY_INCREASE
BONUS_TRANSACTION → NOTIFICATION → USER_ENGAGEMENT
BONUS_TRANSACTION → AI_SUGGESTION_LOG → PERSONALIZED_OFFERS
PAYMENT → BONUS_TRANSACTION → CASHBACK_REWARD
```

### 🌟 **Центральность в Графе**
- **Входящие связи**: 5+ (USER, BOOKING, PAYMENT, TOURNAMENT_PARTICIPANT)
- **Исходящие связи**: 3 модели
- **Степень центральности**: Высокая в финансовом слое
- **Влияние на граф**: Критическое для лояльности

## 🎯 **Операционные Функции**

### 🎁 **Управление Бонусами**
- **Начисление**: Автоматическое и ручное
- **Списание**: При использовании бонусов
- **Контроль**: Сроки действия и лимиты
- **Аудит**: Отслеживание всех операций

### 🔄 **Жизненный Цикл**
1. **Начисление**: earned (получен бонус)
2. **Активация**: completed (доступен для использования)
3. **Использование**: spent (потрачен)
4. **Истечение**: expired (срок действия истек)

### 📊 **Расчет Баланса**
- **Баланс до**: balance_before
- **Изменение**: amount (+ или -)
- **Баланс после**: balance_after = balance_before + amount
- **Валидация**: balance_after >= 0

## 🎁 **Типы Бонусов**

### ⭐ **Loyalty Points (Баллы лояльности)**
- **Описание**: Основная валюта программы
- **Начисление**: 1% от суммы покупки
- **Использование**: 1 балл = 1 THB
- **Срок действия**: 12 месяцев

### 💰 **Cashback (Кэшбек)**
- **Описание**: Возврат части средств
- **Размер**: 2-5% от суммы
- **Условия**: Определенные категории
- **Использование**: Автоматическое зачисление

### 👥 **Referral Bonus (Реферальный бонус)**
- **Описание**: За приведение друзей
- **Размер**: 500 баллов за регистрацию
- **Дополнительно**: 10% от покупок друга
- **Ограничения**: До 10 рефералов в месяц

### 🏆 **Achievement Reward (Награда за достижения)**
- **Описание**: За игровые достижения
- **Примеры**: Первая победа, 10 игр, турнир
- **Размер**: 100-1000 баллов
- **Уникальность**: Одноразовые награды

### 🎉 **Promotional (Промо-бонусы)**
- **Описание**: Специальные акции
- **Размер**: Переменный
- **Условия**: Ограниченное время
- **Цель**: Стимулирование активности

## 🔄 **Типы Операций**

### ➕ **Earned (Заработано)**
- **Описание**: Начисление бонусов
- **Источники**: Покупки, достижения, акции
- **Частота**: 70% операций
- **Влияние**: Положительное на баланс

### ➖ **Spent (Потрачено)**
- **Описание**: Использование бонусов
- **Применение**: Скидки, покупки
- **Частота**: 25% операций
- **Влияние**: Отрицательное на баланс

### ⏰ **Expired (Истекло)**
- **Описание**: Списание просроченных
- **Причина**: Истечение срока действия
- **Частота**: 3% операций
- **Предотвращение**: Уведомления

### 🔄 **Transferred (Переведено)**
- **Описание**: Перевод между пользователями
- **Условия**: Специальные программы
- **Частота**: 1% операций
- **Ограничения**: Лимиты и комиссии

### ↩️ **Refunded (Возвращено)**
- **Описание**: Возврат при отменах
- **Причины**: Отмена заказа, ошибка
- **Частота**: 1% операций
- **Восстановление**: Полное или частичное

## 📊 **Источники Бонусов**

### 📅 **Booking (Бронирования)**
- **Начисление**: 50 баллов за бронирование
- **Множитель**: x2 в выходные
- **Условия**: Успешное посещение
- **Доля**: 40% всех начислений

### 💳 **Payment (Платежи)**
- **Кэшбек**: 2% от суммы
- **Минимум**: От 100 THB
- **Исключения**: Уже со скидкой
- **Доля**: 35% всех начислений

### 🏆 **Tournament (Турниры)**
- **Участие**: 200 баллов
- **Победа**: 1000 баллов
- **Финал**: 500 баллов
- **Доля**: 15% всех начислений

### 👥 **Referral (Рефералы)**
- **Регистрация**: 500 баллов
- **Первая покупка**: 200 баллов
- **Ежемесячный бонус**: 10% от активности
- **Доля**: 8% всех начислений

### ⚙️ **Manual (Ручные)**
- **Компенсации**: За неудобства
- **Специальные случаи**: Индивидуальные
- **Промо-акции**: Маркетинговые
- **Доля**: 2% всех начислений

## 🎯 **Система Множителей**

### 📈 **Базовые Множители**
- **Обычные дни**: x1.0
- **Выходные**: x1.5
- **Праздники**: x2.0
- **День рождения**: x3.0

### 🏆 **Статусные Множители**
- **Bronze**: x1.0 (0-999 баллов)
- **Silver**: x1.2 (1000-4999 баллов)
- **Gold**: x1.5 (5000-9999 баллов)
- **Platinum**: x2.0 (10000+ баллов)

### 🎪 **Акционные Множители**
- **Happy Hour**: x2.0 (определенные часы)
- **Первый визит**: x5.0
- **Возвращение**: x1.5 (после перерыва)
- **Групповые активности**: x1.3

## 💎 **Программы Лояльности**

### 🥉 **Bronze Level**
- **Требования**: 0-999 баллов
- **Преимущества**: Базовые бонусы
- **Кэшбек**: 1%
- **Особенности**: Добро пожаловать

### 🥈 **Silver Level**
- **Требования**: 1000-4999 баллов
- **Преимущества**: Увеличенные бонусы
- **Кэшбек**: 2%
- **Особенности**: Приоритетное бронирование

### 🥇 **Gold Level**
- **Требования**: 5000-9999 баллов
- **Преимущества**: Премиум бонусы
- **Кэшбек**: 3%
- **Особенности**: Бесплатные тренировки

### 💎 **Platinum Level**
- **Требования**: 10000+ баллов
- **Преимущества**: VIP статус
- **Кэшбек**: 5%
- **Особенности**: Персональный менеджер

## 🔄 **Интеграции**

### 💳 **Платежная Система**
- **PAYMENT**: Автоматическое начисление кэшбека
- **Real-time Processing**: Мгновенные бонусы
- **Validation**: Проверка условий
- **Reconciliation**: Сверка операций

### 🤖 **AI Персонализация**
- **AI_SUGGESTION_LOG**: Персональные предложения
- **Behavior Analysis**: Анализ поведения
- **Optimal Offers**: Оптимальные предложения
- **Churn Prevention**: Предотвращение оттока

### 🔔 **Система Уведомлений**
- **NOTIFICATION**: Уведомления о бонусах
- **Expiry Warnings**: Предупреждения об истечении
- **Achievement Alerts**: Уведомления о достижениях
- **Promotional Messages**: Рекламные сообщения

### 📊 **Аналитическая Система**
- **Program Performance**: Эффективность программы
- **User Engagement**: Вовлеченность пользователей
- **ROI Analysis**: Анализ окупаемости
- **Trend Monitoring**: Мониторинг трендов

---

*🎁 Наградной Узел - Мотивация к Совершенству*
*🏝️ Phangan Padel Tennis Club - Loyalty Intelligence*
