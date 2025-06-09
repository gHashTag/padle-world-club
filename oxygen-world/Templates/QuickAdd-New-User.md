---
title: "{{VALUE:firstName}} {{VALUE:lastName}} - Player Profile"
user_id: "user-{{DATE:YYYYMMDDHHmmss}}"
first_name: "{{VALUE:firstName}}"
last_name: "{{VALUE:lastName}}"
username: "{{MACRO:username}}"
email: "{{VALUE:email}}"
phone: "{{VALUE:phone}}"
user_role: "{{VALUE:userRole}}"
current_rating: {{VALUE:initialRating}}
member_id: "PHG{{DATE:MMDD}}{{DATE:HHmm}}"
total_games: 0
wins: 0
losses: 0
favorite_sport: "{{VALUE:favoriteSport}}"
created_at: "{{DATE:YYYY-MM-DDTHH:mm:ss}}"
last_active: "{{DATE:YYYY-MM-DDTHH:mm:ss}}"
status: "active"
tags: [user, {{VALUE:userRole}}, {{VALUE:favoriteSport}}, new]
---

# 👤 {{VALUE:firstName}} {{VALUE:lastName}} - Player Profile

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

## Заметки

<!-- Добавьте здесь заметки о клиенте -->

---

*Профиль создан: {{DATE:DD.MM.YYYY в HH:mm}}*
*🏝️ Phangan Padel Tennis Club Member*
