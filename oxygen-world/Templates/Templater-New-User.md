<%*
// Templater скрипт для создания нового пользователя
const firstName = await tp.system.prompt("Имя:");
const lastName = await tp.system.prompt("Фамилия:");
const email = await tp.system.prompt("Email:");
const phone = await tp.system.prompt("Телефон (например: +66-89-123-4567):");
const userRole = await tp.system.suggester(
  ["Игрок", "Тренер", "Персонал", "Администратор"], 
  ["player", "trainer", "club_staff", "admin"],
  false,
  "Выберите роль:"
);
const favoriteSport = await tp.system.suggester(
  ["Теннис", "Падел", "Оба"], 
  ["tennis", "padel", "both"],
  false,
  "Любимый спорт:"
);
const initialRating = await tp.system.prompt("Начальный рейтинг (1000-3000):", "1000");

// Генерируем данные
const username = (firstName + "_" + lastName).toLowerCase().replace(/\s+/g, '_');
const userId = "user-" + tp.date.now("YYYYMMDDHHmmss");
const memberId = "PHG" + tp.date.now("MMDD") + tp.date.now("HHmm");
const currentDate = tp.date.now("YYYY-MM-DDTHH:mm:ss");

// Устанавливаем имя файла
await tp.file.rename("User-" + firstName + "-" + lastName);
_%>
---
title: "<% firstName %> <% lastName %> - Player Profile"
user_id: "<% userId %>"
first_name: "<% firstName %>"
last_name: "<% lastName %>"
username: "<% username %>"
email: "<% email %>"
phone: "<% phone %>"
user_role: "<% userRole %>"
current_rating: <% initialRating %>
member_id: "<% memberId %>"
total_games: 0
wins: 0
losses: 0
favorite_sport: "<% favoriteSport %>"
created_at: "<% currentDate %>"
last_active: "<% currentDate %>"
status: "active"
tags: [user, <% userRole %>, <% favoriteSport %>, new]
---

# 👤 <% firstName %> <% lastName %> - Player Profile

## Основная Информация

- **Имя**: `= this.first_name` `= this.last_name`
- **Логин**: `= this.username`
- **Email**: `= this.email`
- **Телефон**: `= this.phone`
- **Роль**: `= this.user_role`
- **ID участника**: `= this.member_id`

## Игровая Статистика

- **Текущий рейтинг**: ⭐ `= this.current_rating`
- **Всего игр**: `= this.total_games`
- **Побед**: ✅ `= this.wins`
- **Поражений**: ❌ `= this.losses`
- **Процент побед**: 0%
- **Любимый спорт**: 🎾 `= this.favorite_sport`

## Активность

- **Создан**: `= this.created_at`
- **Последняя активность**: `= this.last_active`
- **Статус**: 🟢 `= this.status`

## Достижения

- 🆕 **Новый участник клуба**
- 🎯 **Готов к первой игре**
<%* if (userRole === "trainer") { -%>
- 🏆 **Сертифицированный тренер**
<%* } -%>

## Заметки

<!-- Добавьте здесь заметки о клиенте -->

---

*Профиль создан: <% tp.date.now("DD.MM.YYYY в HH:mm") %>*
*🏝️ Phangan Padel Tennis Club Member*
