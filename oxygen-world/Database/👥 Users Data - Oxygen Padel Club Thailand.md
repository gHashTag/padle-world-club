---
title: "👥 Users Data - Oxygen Padel Club Thailand"
tags: [database, users, padel-club, thailand]
cssclasses: [database-table]
sync_enabled: true
table: "user"
last_sync: "2025-05-30T19:15:00Z"
---

# 👥 Users Data - Oxygen Padel Club Thailand

## 📊 Интерактивная Таблица Пользователей

> **🔄 LIVE DATA** - Данные синхронизируются с Neon Database в реальном времени

```dataview
TABLE WITHOUT ID
  "👤" as "",
  username as "Логин",
  first_name as "Имя",
  last_name as "Фамилия",
  email as "Email",
  user_role as "Роль",
  current_rating as "Рейтинг",
  bonus_points as "Бонусы"
FROM "oxygen-world/Database"
WHERE contains(file.name, "User-") AND tags
SORT current_rating DESC
```

## 🎯 Демонстрационные данные

**Для тестирования синхронизации мы используем реальные данные из PostgreSQL:**

| 👤  | Логин                | Имя     | Фамилия    | Email               | Роль       | Рейтинг | Бонусы |
| --- | -------------------- | ------- | ---------- | ------------------- | ---------- | ------- | ------ |
| 🎾  | john_quitzon         | John    | Quitzon    | john@example.com    | player     | 2438    | 847    |
| 👨‍💼  | marian_ebert7        | Marian  | Ebert      | marian@example.com  | admin      | 2397    | 552    |
| 👨‍💼  | larue_okon           | Larue   | O'Kon      | larue@example.com   | admin      | 2363    | 728    |
| 👷  | cecil_runolfsson82   | Cecil   | Runolfsson | cecil@example.com   | club_staff | 2362    | 124    |
| 👨‍💼  | roxanne.bode-mills66 | Roxanne | Bode-Mills | roxanne@example.com | admin      | 2348    | 453    |

## 🔄 Статус Синхронизации

- ✅ **База данных**: Neon PostgreSQL подключена
- ✅ **Записей в БД**: 81 пользователь
- ✅ **Файлов пользователей**: 3 созданы для демонстрации
- ✅ **Последняя синхронизация**: `= date(now)`
- 🔄 **Мониторинг**: Активен

## 📈 Статистика пользователей

### По ролям:

```dataview
TABLE length(rows) as "Количество"
FROM "oxygen-world/Database"
WHERE contains(file.name, "User-")
GROUP BY user_role as "Роль"
SORT key
```

### Топ по рейтингу:

```dataview
LIST current_rating + " ⭐ - " + first_name + " " + last_name + " (" + user_role + ")"
FROM "oxygen-world/Database"
WHERE contains(file.name, "User-") AND current_rating
SORT current_rating DESC
LIMIT 5
```

## 🧪 Тестирование синхронизации

### Шаги для проверки:

1. **Измените файл пользователя** в Database папке
2. **Сохраните файл** (Cmd+S)
3. **Проверьте обновление** в этой таблице - должно произойти автоматически
4. **Проверьте логи** синхронизации в терминале

### 🖊️ Место для тестовых изменений:

**Добавьте здесь любой текст:**

_Здесь вы можете добавить заметки для тестирования синхронизации..._

---

## 🔗 Связанные файлы

- [[User-John-Quitzon]] - Игрок (2438⭐)
- [[User-Marian-Ebert]] - Администратор (2397⭐)
- [[User-Larue-Okon]] - Администратор (2363⭐)

---

_Автоматически синхронизируется с Neon Database_  
_Последнее обновление: `= date(now)`_
