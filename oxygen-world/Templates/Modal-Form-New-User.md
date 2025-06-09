```js
const form = {
  title: "🆕 Добавить Нового Клиента",
  name: "new-user-form",
  fields: [
    {
      name: "firstName",
      label: "Имя",
      description: "Введите имя клиента",
      input: {
        type: "text",
        placeholder: "Например: Александр"
      }
    },
    {
      name: "lastName", 
      label: "Фамилия",
      description: "Введите фамилию клиента",
      input: {
        type: "text",
        placeholder: "Например: Иванов"
      }
    },
    {
      name: "email",
      label: "Email",
      description: "Электронная почта клиента",
      input: {
        type: "email",
        placeholder: "example@email.com"
      }
    },
    {
      name: "phone",
      label: "Телефон",
      description: "Номер телефона в формате +66-XX-XXX-XXXX",
      input: {
        type: "tel",
        placeholder: "+66-89-123-4567"
      }
    },
    {
      name: "userRole",
      label: "Роль",
      description: "Выберите роль клиента в клубе",
      input: {
        type: "select",
        options: [
          { value: "player", label: "🎾 Игрок" },
          { value: "trainer", label: "🏃‍♂️ Тренер" },
          { value: "club_staff", label: "👷 Персонал" },
          { value: "admin", label: "👨‍💼 Администратор" }
        ]
      }
    },
    {
      name: "favoriteSport",
      label: "Любимый спорт",
      description: "Предпочитаемый вид спорта",
      input: {
        type: "select",
        options: [
          { value: "tennis", label: "🎾 Теннис" },
          { value: "padel", label: "🏓 Падел" },
          { value: "both", label: "🎯 Оба" }
        ]
      }
    },
    {
      name: "initialRating",
      label: "Начальный рейтинг",
      description: "Рейтинг от 1000 до 3000",
      input: {
        type: "number",
        placeholder: "1000"
      }
    },
    {
      name: "notes",
      label: "Заметки",
      description: "Дополнительная информация о клиенте",
      input: {
        type: "textarea",
        placeholder: "Особенности, предпочтения, медицинские ограничения..."
      }
    }
  ]
};

// Обработка формы
const result = await app.plugins.plugins["modal-form"].api.openForm(form);

if (result) {
  // Генерируем данные
  const username = (result.firstName + "_" + result.lastName).toLowerCase().replace(/\s+/g, '_');
  const userId = "user-" + moment().format("YYYYMMDDHHmmss");
  const memberId = "PHG" + moment().format("MMDD") + moment().format("HHmm");
  const currentDate = moment().format("YYYY-MM-DDTHH:mm:ss");
  
  // Создаем файл
  const fileName = `User-${result.firstName}-${result.lastName}.md`;
  const filePath = `oxygen-world/Database/${fileName}`;
  
  const content = `---
title: "${result.firstName} ${result.lastName} - Player Profile"
user_id: "${userId}"
first_name: "${result.firstName}"
last_name: "${result.lastName}"
username: "${username}"
email: "${result.email}"
phone: "${result.phone}"
user_role: "${result.userRole}"
current_rating: ${result.initialRating || 1000}
member_id: "${memberId}"
total_games: 0
wins: 0
losses: 0
favorite_sport: "${result.favoriteSport}"
created_at: "${currentDate}"
last_active: "${currentDate}"
status: "active"
tags: [user, ${result.userRole}, ${result.favoriteSport}, new]
---

# 👤 ${result.firstName} ${result.lastName} - Player Profile

## Основная Информация

- **Имя**: \`= this.first_name\` \`= this.last_name\`
- **Логин**: \`= this.username\`
- **Email**: \`= this.email\`
- **Телефон**: \`= this.phone\`
- **Роль**: \`= this.user_role\`
- **ID участника**: \`= this.member_id\`

## Игровая Статистика

- **Текущий рейтинг**: ⭐ \`= this.current_rating\`
- **Всего игр**: \`= this.total_games\`
- **Побед**: ✅ \`= this.wins\`
- **Поражений**: ❌ \`= this.losses\`
- **Процент побед**: 0%
- **Любимый спорт**: 🎾 \`= this.favorite_sport\`

## Активность

- **Создан**: \`= this.created_at\`
- **Последняя активность**: \`= this.last_active\`
- **Статус**: 🟢 \`= this.status\`

## Достижения

- 🆕 **Новый участник клуба**
- 🎯 **Готов к первой игре**
${result.userRole === "trainer" ? "- 🏆 **Сертифицированный тренер**" : ""}

## Заметки

${result.notes || "<!-- Добавьте здесь заметки о клиенте -->"}

---

*Профиль создан: ${moment().format("DD.MM.YYYY в HH:mm")}*
*🏝️ Phangan Padel Tennis Club Member*`;

  // Создаем файл
  await app.vault.create(filePath, content);
  
  // Открываем созданный файл
  const file = app.vault.getAbstractFileByPath(filePath);
  if (file) {
    await app.workspace.getLeaf().openFile(file);
  }
  
  // Показываем уведомление
  new Notice(`✅ Клиент ${result.firstName} ${result.lastName} успешно добавлен!`);
}
```
