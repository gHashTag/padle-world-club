---
title: "{{title}}"
user_id: "user-{{date:YYYYMMDDHHmmss}}"
first_name: "{{first_name}}"
last_name: "{{last_name}}"
username: "{{username}}"
email: "{{email}}"
phone: "{{phone}}"
user_role: "{{user_role}}"
current_rating: {{current_rating}}
member_id: "PHG{{date:MMDD}}{{time:HHmm}}"
total_games: 0
wins: 0
losses: 0
favorite_sport: "{{favorite_sport}}"
created_at: "{{date:YYYY-MM-DDTHH:mm:ss}}"
last_active: "{{date:YYYY-MM-DDTHH:mm:ss}}"
status: "active"
tags: [user, {{user_role}}, {{favorite_sport}}, new]
---

# 👤 {{first_name}} {{last_name}} - Player Profile

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

*Профиль обновляется автоматически после каждой игры*
*🏝️ Phangan Padel Tennis Club Member*
