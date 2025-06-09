# 📅 КАЛЕНДАРНЫЕ ПЛАГИНЫ - ПОЛНАЯ НАСТРОЙКА

## 🎯 **ЦЕЛЬ: ДИНАМИЧЕСКИЙ КАЛЕНДАРЬ С ЖИВЫМИ ДАННЫМИ**

Создать календарь, который:
- ✅ Показывает бронирования из базы данных
- ✅ Автоматически обновляется при изменениях
- ✅ Позволяет переходить между связанными моделями
- ✅ Красиво визуализирует временные слоты

## 🔧 **НЕОБХОДИМЫЕ ПЛАГИНЫ**

### 1️⃣ **Calendar Plugin** (Основной календарь)

**Установка:**
```
1. Откройте Obsidian
2. Settings → Community Plugins
3. Browse → Поиск "Calendar"
4. Установите "Calendar" by Liam Cain
5. Enable plugin
```

**Настройка:**
```json
{
  "showWeeklyNote": true,
  "showDailyNote": true,
  "weekStart": "monday",
  "wordsPerDot": 250,
  "showWeekNums": true,
  "localeOverride": "ru"
}
```

### 2️⃣ **Dataview Plugin** (Живые данные)

**Установка:**
```
1. Settings → Community Plugins
2. Browse → Поиск "Dataview"
3. Установите "Dataview" by Michael Brenan
4. Enable plugin
```

**Настройка:**
```json
{
  "enableDataviewJs": true,
  "enableInlineDataview": true,
  "enableInlineDataviewJs": true,
  "prettyRenderInlineFields": true,
  "recursiveSubTaskCompletion": true
}
```

### 3️⃣ **Templater Plugin** (Автоматизация)

**Установка:**
```
1. Settings → Community Plugins
2. Browse → Поиск "Templater"
3. Установите "Templater" by SilentVoid13
4. Enable plugin
```

**Настройка:**
```json
{
  "template_folder": "Templates",
  "trigger_on_file_creation": true,
  "auto_jump_to_cursor": true,
  "enable_system_commands": true
}
```

### 4️⃣ **Full Calendar Plugin** (Расширенный календарь)

**Установка:**
```
1. Settings → Community Plugins
2. Browse → Поиск "Full Calendar"
3. Установите "Full Calendar" by Davis Haupt
4. Enable plugin
```

### 5️⃣ **Periodic Notes Plugin** (Ежедневные заметки)

**Установка:**
```
1. Settings → Community Plugins
2. Browse → Поиск "Periodic Notes"
3. Установите "Periodic Notes" by Liam Cain
4. Enable plugin
```

## 📅 **СОЗДАНИЕ ДИНАМИЧЕСКОГО КАЛЕНДАРЯ**

### 🎨 **Шаблон Календарного События**

Создайте файл `Templates/Booking-Event.md`:

```markdown
---
title: "📅 {{title}}"
date: {{date}}
start_time: "{{start_time}}"
end_time: "{{end_time}}"
event_type: "{{event_type}}"
court: "{{court}}"
user: "{{user}}"
price: {{price}}
status: "{{status}}"
tags: [calendar, booking, {{event_type}}]
---

# 📅 {{title}}

## 📊 Детали События

- **👤 Игрок**: [[{{user}}]]
- **🎾 Корт**: [[{{court}}]]
- **⏰ Время**: {{start_time}} - {{end_time}}
- **💰 Цена**: {{price}} THB
- **📊 Статус**: {{status}}

## 🔗 Связанные Данные

- **📅 Бронирование**: [[Bookings-Data]]
- **🎾 Корт**: [[Courts-Data]]
- **👥 Пользователь**: [[{{user}}]]
- **💰 Платеж**: [[Payments-Data]]

---
*Автоматически создано из базы данных*
```

### 🔄 **Автоматическое Создание Событий**

Создайте файл `Scripts/create-calendar-events.js`:

```javascript
// Скрипт для автоматического создания календарных событий
const bookings = await dv.pages('"oxygen-world/Database"')
  .where(p => p.file.name.includes("Booking"))
  .array();

for (let booking of bookings) {
  const eventFile = `Calendar/Events/${booking.date}-${booking.user}.md`;
  
  if (!tp.file.exists(eventFile)) {
    await tp.file.create_new(
      tp.file.include("[[Templates/Booking-Event]]"),
      eventFile,
      false,
      {
        title: `${booking.user} - ${booking.court}`,
        date: booking.date,
        start_time: booking.start_time,
        end_time: booking.end_time,
        event_type: booking.event_type || "booking",
        court: booking.court,
        user: booking.user,
        price: booking.price,
        status: booking.status
      }
    );
  }
}
```

## 🎨 **ВИЗУАЛЬНАЯ НАСТРОЙКА**

### 🌈 **CSS Стили для Календаря**

Создайте файл `.obsidian/snippets/calendar-styles.css`:

```css
/* Стили для календаря */
.calendar-container {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 15px;
  padding: 20px;
  margin: 20px 0;
}

/* Цветовое кодирование событий */
.calendar-event-booking {
  background-color: #2196F3;
  color: white;
  border-radius: 5px;
  padding: 2px 5px;
}

.calendar-event-tournament {
  background-color: #9C27B0;
  color: white;
  border-radius: 5px;
  padding: 2px 5px;
}

.calendar-event-class {
  background-color: #FF9800;
  color: white;
  border-radius: 5px;
  padding: 2px 5px;
}

.calendar-event-maintenance {
  background-color: #F44336;
  color: white;
  border-radius: 5px;
  padding: 2px 5px;
}

/* Стили для временных слотов */
.time-slot {
  display: flex;
  align-items: center;
  padding: 10px;
  margin: 5px 0;
  border-left: 4px solid #2196F3;
  background: rgba(33, 150, 243, 0.1);
  border-radius: 5px;
}

.time-slot.occupied {
  border-left-color: #F44336;
  background: rgba(244, 67, 54, 0.1);
}

.time-slot.tournament {
  border-left-color: #9C27B0;
  background: rgba(156, 39, 176, 0.1);
}
```

### 📱 **Мобильная Адаптация**

```css
/* Мобильные стили */
@media (max-width: 768px) {
  .calendar-container {
    padding: 10px;
    margin: 10px 0;
  }
  
  .calendar-event {
    font-size: 12px;
    padding: 1px 3px;
  }
  
  .time-slot {
    padding: 5px;
    font-size: 14px;
  }
}
```

## 🔄 **АВТОМАТИЧЕСКАЯ СИНХРОНИЗАЦИЯ**

### ⚡ **Webhook для Обновлений**

Создайте файл `Scripts/calendar-sync.js`:

```javascript
// Автоматическая синхронизация календаря с API
class CalendarSync {
  constructor() {
    this.apiUrl = "http://localhost:3000/api";
    this.syncInterval = 5 * 60 * 1000; // 5 минут
  }
  
  async syncBookings() {
    try {
      const response = await fetch(`${this.apiUrl}/bookings`);
      const bookings = await response.json();
      
      for (let booking of bookings.data) {
        await this.createCalendarEvent(booking);
      }
      
      console.log("✅ Календарь синхронизирован");
    } catch (error) {
      console.error("❌ Ошибка синхронизации:", error);
    }
  }
  
  async createCalendarEvent(booking) {
    const eventDate = new Date(booking.start_time);
    const fileName = `Calendar/Events/${eventDate.toISOString().split('T')[0]}-${booking.user_id}.md`;
    
    const content = `---
date: ${eventDate.toISOString().split('T')[0]}
start_time: "${booking.start_time}"
end_time: "${booking.end_time}"
user: "${booking.user_name}"
court: "${booking.court_name}"
price: ${booking.total_price}
status: "${booking.status}"
tags: [calendar, booking, auto_sync]
---

# 📅 ${booking.user_name} - ${booking.court_name}

Автоматически создано из API в ${new Date().toLocaleString()}
`;

    // Создаем файл события
    await this.writeFile(fileName, content);
  }
  
  startAutoSync() {
    setInterval(() => {
      this.syncBookings();
    }, this.syncInterval);
  }
}

// Запуск автосинхронизации
const calendarSync = new CalendarSync();
calendarSync.startAutoSync();
```

## 📊 **DATAVIEW ЗАПРОСЫ ДЛЯ КАЛЕНДАРЯ**

### 📅 **Календарь на Сегодня**

```dataview
TABLE WITHOUT ID
  "⏰ " + start_time as "Время",
  "👤 " + user as "Игрок",
  "🎾 " + court as "Корт",
  "💰 " + price + " THB" as "Цена"
FROM "Calendar/Events"
WHERE date = date(today)
SORT start_time ASC
```

### 📈 **Календарь на Неделю**

```dataview
CALENDAR date
FROM "Calendar/Events"
WHERE date >= date(today) AND date <= date(today) + dur(7 days)
```

### 🎯 **Свободные Слоты**

```dataview
TABLE WITHOUT ID
  "🎾 " + court as "Корт",
  "⏰ " + free_time as "Свободное время",
  "💰 " + hourly_rate + " THB/час" as "Цена"
FROM "oxygen-world/Database"
WHERE contains(file.name, "Court") AND is_active = true
```

## 🎯 **ТЕСТИРОВАНИЕ КАЛЕНДАРЯ**

### ✅ **Чек-лист Проверки**

1. **Плагины установлены** ✅
   - Calendar Plugin
   - Dataview Plugin  
   - Templater Plugin
   - Full Calendar Plugin

2. **Файлы созданы** ✅
   - Шаблон события
   - CSS стили
   - Скрипты синхронизации

3. **Календарь работает** ✅
   - События отображаются
   - Цветовое кодирование работает
   - Переходы по ссылкам функционируют

4. **Автосинхронизация** ✅
   - API подключен
   - События создаются автоматически
   - Обновления происходят в реальном времени

### 🧪 **Тестовые Сценарии**

1. **Создание события через API**
   ```bash
   curl -X POST http://localhost:3001/test-user
   # Проверить, появилось ли событие в календаре
   ```

2. **Переход по связям**
   - Кликнуть на событие в календаре
   - Перейти к пользователю
   - Перейти к корту
   - Вернуться к календарю

3. **Мобильная версия**
   - Открыть на телефоне
   - Проверить адаптивность
   - Тестировать навигацию

## 🎊 **РЕЗУЛЬТАТ**

### ✅ **Что получаем:**

1. **Живой календарь** с данными из базы
2. **Автоматические обновления** при изменениях
3. **Красивую визуализацию** временных слотов
4. **Полную связанность** между всеми моделями
5. **Мобильную адаптацию** для клиентов

### 🚀 **Уникальные возможности:**

- **Клик по событию** → переход к деталям бронирования
- **Клик по пользователю** → профиль и история игр
- **Клик по корту** → характеристики и доступность
- **Автоматическое цветовое кодирование** по типам событий
- **Real-time обновления** без перезагрузки

---

*📅 Динамический календарь - центр управления клубом*
*🔗 Полная интеграция со всеми 31 моделями*
*🎨 Красивая визуализация для впечатления клиентов*
*🏝️ Phangan Padel Tennis Club - Smart Calendar System*
