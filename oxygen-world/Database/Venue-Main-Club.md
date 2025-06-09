---
id: "venue-main-club"
name: "Phangan Padel Tennis Club - Main Facility"
venue_type: "main_club"
address: "123 Paradise Beach Road, Koh Phangan, Surat Thani"
city: "Koh Phangan"
country: "Thailand"
postal_code: "84280"
latitude: 9.7489
longitude: 100.0359
timezone: "Asia/Bangkok"
total_area_sqm: 5000.00
capacity: 200
is_active: true
manager_user_id: "user-maria-rodriguez"
tags: [venue, main_club, phangan, active]
---

# 🏟️ Venue - Main Club
## Phangan Padel Tennis Club - Главная Площадка

## 🔗 **Связи в "Втором Мозге"**

### 🧠 **Модель**
- [[Technical/Models/🧠 MODEL - VENUE (Spatial Hub)|🏟️ VENUE (Spatial Hub)]] - Пространственный хаб

### 🔗 **Связанные Модели**
- [[Technical/Models/🧠 MODEL - USER (Central Neuron)|👥 USER]] → [[User-Maria-Rodriguez|👤 Maria Rodriguez]] (менеджер)
- [[Technical/Models/🧠 MODEL - COURT (Resource Node)|🎾 COURT]] → [[Court-Tennis|🎾 Tennis Court]], [[Court-Padel|🏓 Padel Court]]
- [[Technical/Models/🧠 MODEL - TOURNAMENT (Competition Node)|🏆 TOURNAMENT]] → [[Tournament-Monthly-Tennis-Championship|🏆 Monthly Championship]]

## 📊 **Основная Информация**

### 🏟️ **Детали Площадки**
- **ID площадки**: `= this.id`
- **Название**: `= this.name`
- **Тип**: `= this.venue_type` (Главный клуб)
- **Адрес**: `= this.address`
- **Город**: `= this.city`
- **Страна**: `= this.country`
- **Почтовый код**: `= this.postal_code`

### 🌍 **Географические Данные**
- **Широта**: `= this.latitude`
- **Долгота**: `= this.longitude`
- **Часовой пояс**: `= this.timezone`

### 📐 **Физические Характеристики**
- **Общая площадь**: `= this.total_area_sqm` м²
- **Вместимость**: `= this.capacity` человек
- **Статус**: `= this.is_active`
- **Менеджер**: `= this.manager_user_id`

## 🔗 **Связанные Данные**

### 👤 **Менеджер Площадки**
- [[User-Maria-Rodriguez|👤 Maria Rodriguez - Управляющий клубом]]

### 🎾 **Корты на Площадке**
- [[Court-Tennis|🎾 Tennis Court - Главный корт]]
- [[Court-Padel|🏓 Padel Court - Падел корт]]
- **Court-Tennis-2**: Второй теннисный корт
- **Court-Tennis-3**: Третий теннисный корт
- **Court-Padel-2**: Второй падел корт

### 🏆 **Проводимые Турниры**
- [[Tournament-Monthly-Tennis-Championship|🏆 Monthly Tennis Championship]]
- **Padel Doubles Championship**: Парный чемпионат по падел
- **Club Championships**: Клубные первенства
- **Junior Tournaments**: Детские турниры

## 🏗️ **Инфраструктура**

### 🎾 **Спортивные Объекты**
```json
{
  "courts": {
    "tennis_courts": 4,
    "padel_courts": 2,
    "multi_purpose": 1
  },
  "surfaces": {
    "hard_court": 5,
    "artificial_grass": 2
  },
  "lighting": {
    "led_courts": 6,
    "standard_courts": 1
  },
  "features": {
    "covered_courts": 2,
    "outdoor_courts": 5,
    "practice_wall": 1
  }
}
```

### 🏢 **Вспомогательные Объекты**
```json
{
  "clubhouse": {
    "reception": true,
    "pro_shop": true,
    "restaurant": true,
    "lounge": true,
    "meeting_rooms": 2
  },
  "changing_rooms": {
    "men": 2,
    "women": 2,
    "family": 1,
    "accessible": 1
  },
  "storage": {
    "equipment_room": true,
    "member_lockers": 150,
    "maintenance_storage": true,
    "tournament_storage": true
  }
}
```

## 🎯 **Удобства и Сервисы**

### 🍽️ **Питание и Напитки**
```json
{
  "restaurant": {
    "name": "Paradise Court Restaurant",
    "capacity": 80,
    "cuisine": "International & Thai",
    "operating_hours": "07:00-22:00",
    "specialties": ["healthy_options", "sports_nutrition", "local_cuisine"]
  },
  "bar": {
    "name": "Champions Bar",
    "capacity": 30,
    "type": "Sports Bar",
    "operating_hours": "16:00-24:00",
    "features": ["live_sports", "cocktails", "beer_selection"]
  },
  "cafe": {
    "name": "Courtside Cafe",
    "capacity": 20,
    "type": "Quick Service",
    "operating_hours": "06:00-20:00",
    "offerings": ["coffee", "smoothies", "light_snacks"]
  }
}
```

### 🛍️ **Торговля и Услуги**
```json
{
  "pro_shop": {
    "name": "Tennis Pro Shop",
    "area_sqm": 100,
    "products": ["rackets", "apparel", "accessories", "shoes"],
    "services": ["stringing", "customization", "fitting"],
    "brands": ["Babolat", "Wilson", "Head", "Nike", "Adidas"]
  },
  "services": {
    "equipment_rental": true,
    "coaching": true,
    "physiotherapy": true,
    "massage": true,
    "childcare": true
  }
}
```

## ⏰ **Режим Работы**

### 📅 **Операционные Часы**
```json
{
  "courts": {
    "weekdays": {"open": "06:00", "close": "22:00"},
    "weekend": {"open": "07:00", "close": "23:00"}
  },
  "clubhouse": {
    "weekdays": {"open": "07:00", "close": "22:00"},
    "weekend": {"open": "07:00", "close": "23:00"}
  },
  "pro_shop": {
    "weekdays": {"open": "08:00", "close": "20:00"},
    "weekend": {"open": "08:00", "close": "21:00"}
  },
  "restaurant": {
    "daily": {"open": "07:00", "close": "22:00"}
  }
}
```

### 🎪 **Специальные События**
- **Турниры**: Расширенные часы работы
- **Праздники**: Специальное расписание
- **Частные мероприятия**: По договоренности
- **Техническое обслуживание**: Понедельник 06:00-08:00

## ♿ **Доступность**

### 🚪 **Физическая Доступность**
```json
{
  "accessibility": {
    "wheelchair_ramps": true,
    "elevator": true,
    "accessible_parking": 8,
    "accessible_restrooms": 3,
    "accessible_courts": 2,
    "braille_signage": true,
    "audio_assistance": true
  }
}
```

## 🚗 **Транспорт и Парковка**

### 🅿️ **Парковка**
- **Общее количество мест**: 80
- **VIP парковка**: 10 мест
- **Доступная парковка**: 8 мест
- **Мотоциклы**: 30 мест
- **Велосипеды**: 20 мест

### 🚌 **Общественный Транспорт**
```json
{
  "public_transport": {
    "bus_routes": [
      {"route": "15", "stop": "Club Entrance", "distance": "0m"},
      {"route": "23", "stop": "Paradise Beach", "distance": "200m"}
    ],
    "taxi_services": ["grab", "bolt", "local_taxi"],
    "shuttle_service": {
      "airport": "scheduled",
      "ferry_pier": "scheduled",
      "hotels": "on_request"
    }
  }
}
```

## 🌤️ **Погодные Условия**

### ☀️ **Климатические Особенности**
```json
{
  "weather_considerations": {
    "covered_courts": 2,
    "rain_policy": {
      "light_rain": "play_continues_covered",
      "heavy_rain": "play_suspended",
      "refund_policy": "reschedule_or_credit"
    },
    "heat_policy": {
      "temperature_limit": 38,
      "heat_index_limit": 40,
      "cooling_stations": 5,
      "water_stations": 8
    },
    "wind_considerations": {
      "wind_screens": true,
      "wind_speed_limit": 25
    }
  }
}
```

## 📞 **Контактная Информация**

### 📱 **Связь**
```json
{
  "contact_info": {
    "phone": {
      "main": "+66-77-123-4567",
      "reservations": "+66-77-123-4568",
      "pro_shop": "+66-77-123-4569",
      "restaurant": "+66-77-123-4570",
      "emergency": "+66-77-123-4571"
    },
    "email": {
      "general": "info@phangan-padel.com",
      "bookings": "bookings@phangan-padel.com",
      "events": "events@phangan-padel.com",
      "proshop": "shop@phangan-padel.com"
    },
    "social_media": {
      "facebook": "@PhanganPadelClub",
      "instagram": "@phangan_padel",
      "line": "@phanganpadel",
      "youtube": "Phangan Padel Club"
    },
    "website": "https://phangan-padel.com"
  }
}
```

## 🔄 **Связанные Операции**

### 📅 **Ежедневные Операции**
- **Открытие/закрытие**: Автоматизированная система
- **Уборка**: Профессиональная команда
- **Техническое обслуживание**: Ежедневные проверки
- **Безопасность**: 24/7 охрана

### 🏆 **События и Турниры**
- **Планирование**: Календарь на год вперед
- **Логистика**: Координация всех ресурсов
- **Маркетинг**: Продвижение мероприятий
- **Обслуживание**: VIP сервис для участников

### 💰 **Финансовое Управление**
- **Доходы**: От аренды кортов, ресторана, магазина
- **Расходы**: Персонал, коммунальные услуги, обслуживание
- **Инвестиции**: Улучшение инфраструктуры
- **Отчетность**: Ежемесячные финансовые отчеты

## 📊 **Статистика Использования**

### 📈 **Ключевые Метрики**
- **Загрузка кортов**: 75% (среднее)
- **Пиковые часы**: 18:00-21:00 (90% загрузка)
- **Непиковые часы**: 06:00-16:00 (60% загрузка)
- **Сезонность**: Высокий сезон ноябрь-март

### 👥 **Посещаемость**
- **Ежедневно**: 150-200 человек
- **Пиковые дни**: Суббота, воскресенье
- **Члены клуба**: 85% посещений
- **Гости**: 15% посещений

## 🚀 **Планы Развития**

### 📈 **Краткосрочные (6 месяцев)**
- **Новый падел корт**: Расширение до 3 кортов
- **Улучшение освещения**: LED на всех кортах
- **Расширение ресторана**: +20 мест
- **Детская площадка**: Зона для детей

### 🎯 **Долгосрочные (2 года)**
- **Спа-центр**: Wellness зона
- **Бассейн**: 25-метровый бассейн
- **Отель**: 20-комнатный бутик-отель
- **Конференц-центр**: Для корпоративных событий

---

*🏟️ Сердце Спортивного Сообщества*
*🏝️ Phangan Padel Tennis Club - Where Champions Are Made*
