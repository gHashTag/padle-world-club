---
title: "👤 Profile Dashboard"
tags: [dashboard, profiles, users, clients]
---

# 👤 Profile Dashboard

[[🏠 MAIN DASHBOARD|← Назад к главному дашборду]]

## 👥 **Управление Клиентами**

### Статистика (Live Data)
```dataview
TABLE WITHOUT ID
  "Всего клиентов" as "📊 Метрика",
  length(filter(file.lists, (f) => contains(f.file.name, "User-") AND !contains(f.file.name, "Data"))) as "📈 Значение"
FROM "oxygen-world/Database"
WHERE contains(file.name, "User-") AND !contains(file.name, "Data")
LIMIT 1
```

```dataview
TABLE WITHOUT ID
  "VIP клиентов" as "📊 Метрика",
  length(filter(file.lists, (f) => contains(f.file.name, "User-") AND contains(f.file.tags, "vip"))) as "📈 Значение"
FROM "oxygen-world/Database"
WHERE contains(file.name, "User-") AND contains(tags, "vip")
LIMIT 1
```

## 🔍 **Все Клиенты (Live Data)**

```dataview
TABLE
  first_name + " " + last_name as "👤 Имя",
  user_role as "🎭 Роль",
  current_rating as "⭐ Рейтинг",
  favorite_sport as "🎾 Спорт",
  subscription_type as "📦 Подписка",
  last_active as "📅 Активность"
FROM "oxygen-world/Database"
WHERE contains(file.name, "User-") AND !contains(file.name, "Data") AND current_rating != null
SORT current_rating desc
```

## 🏆 **Топ Клиенты**

### По Рейтингу
```dataview
TABLE
  first_name + " " + last_name as "👤 Клиент",
  current_rating as "⭐ Рейтинг",
  total_games as "🎮 Игр",
  wins as "✅ Побед"
FROM "oxygen-world/Database"
WHERE contains(file.name, "User-") AND current_rating > 2000
SORT current_rating desc
LIMIT 5
```

### По Активности
- 🥇 **David Smith** - 45 игр, 32 победы
- 🥈 **Anna Johnson** - 52 игры, 41 победа  
- 🥉 **Maria Rodriguez** - 38 игр, 28 побед

## 📊 **Сегментация Клиентов**

### По Ролям
```dataview
TABLE
  user_role as "🎭 Роль",
  count(rows) as "👥 Количество",
  round(count(rows) * 100 / 12, 1) as "📊 %"
FROM "oxygen-world/Database"
WHERE contains(file.name, "User-")
GROUP BY user_role
```

### По Спорту
- **Теннис**: 7 клиентов (58%)
- **Падел**: 3 клиента (25%)
- **Оба**: 2 клиента (17%)

### По Уровню
- **Профессионалы** (2400+): 3 клиента
- **Продвинутые** (2000-2399): 4 клиента
- **Любители** (1500-1999): 3 клиента
- **Новички** (1000-1499): 2 клиента

## 🚀 **Добавление Клиентов** {#add-client}

### 🔥 Быстрый Способ (Рекомендуется)
1. **Создать файл**: `User-Имя-Фамилия.md` в папке Database/
2. **Скопировать шаблон**: [[Templates/Simple-New-User]]
3. **Заменить данные**: Все `ЗАМЕНИТЬ_*` на реальные значения
4. **Сохранить**: `Ctrl+S`

### 📋 Пошаговая Инструкция
[[📋 ПРОСТАЯ ИНСТРУКЦИЯ - Добавление Клиентов|📖 Полная инструкция]]

### 🎯 Быстрые Действия

| Действие | Описание | Статус |
|----------|----------|--------|
| ➕ Новый клиент | [[Templates/Simple-New-User\|Создать]] | ✅ |
| 🔍 Найти клиента | Поиск в таблице выше | ✅ |
| 📝 Редактировать | Открыть файл клиента | ✅ |
| 📊 Статистика | Посмотреть аналитику | ✅ |

## 👤 **Детали Клиентов**

### Недавно Добавленные
```dataview
TABLE
  first_name + " " + last_name as "👤 Клиент",
  created_at as "📅 Создан",
  user_role as "🎭 Роль",
  current_rating as "⭐ Рейтинг"
FROM "oxygen-world/Database"
WHERE contains(file.name, "User-") AND contains(tags, "new")
SORT created_at desc
LIMIT 5
```

### Требуют Внимания
- **Низкая активность**: Клиенты без игр 30+ дней
- **Просроченные платежи**: Нет в данный момент
- **Жалобы**: Нет активных жалоб

## 📱 **Контактная Информация**

### Способы Связи
```dataview
TABLE
  first_name + " " + last_name as "👤 Клиент",
  email as "✉️ Email",
  phone as "📞 Телефон",
  last_active as "📅 Активность"
FROM "oxygen-world/Database"
WHERE contains(file.name, "User-")
SORT last_active desc
```

### Предпочтения Связи
- **Email**: 8 клиентов (67%)
- **Телефон**: 4 клиента (33%)
- **WhatsApp**: 6 клиентов (50%)

## 🎯 **Программы Лояльности**

### VIP Клиенты
- **David Smith** - 45+ игр, скидка 15%
- **Anna Johnson** - Тренер, скидка 20%

### Бонусная Система
- **За 10 игр**: Скидка 5%
- **За 25 игр**: Скидка 10%
- **За 50 игр**: Скидка 15%

### Рефералы
- **Приведи друга**: Скидка 20% на следующую игру
- **Семейные пакеты**: Скидка 25% для семей

## 📈 **Аналитика Клиентов**

### Средние Показатели
- **Возраст**: 32 года
- **Игр в месяц**: 8
- **Средний чек**: ₿ 950
- **Время в клубе**: 6 месяцев

### Тренды
- **Рост клиентской базы**: +25% за квартал
- **Повторные визиты**: 85%
- **Рекомендации**: 70% новых клиентов

## 🔔 **Уведомления и Напоминания**

### Сегодня
- 🎂 **День рождения**: Maria Rodriguez
- 📅 **Напомнить о тренировке**: David Smith (18:00)

### На неделе
- 📧 **Отправить newsletter**: Всем клиентам
- 📞 **Обзвонить неактивных**: 2 клиента

## 🎨 **Персонализация**

### Индивидуальные Программы
- **David Smith**: Интенсивные тренировки
- **Maria Rodriguez**: Падел специализация
- **Anna Johnson**: Тренерская программа

### Особые Потребности
- **Медицинские ограничения**: 1 клиент
- **Диетические предпочтения**: 2 клиента
- **Языковые предпочтения**: Английский (100%)

---

_Система управления клиентами | 🏝️ Phangan Padel Tennis Club_
