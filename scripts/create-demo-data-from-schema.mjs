#!/usr/bin/env node

/**
 * 🎯 Создание демо-данных в Obsidian на основе реальной схемы БД
 * Этот скрипт создает файлы с демо-данными, которые соответствуют
 * реальной структуре таблиц в Neon Database
 */

import fs from 'fs/promises';
import path from 'path';

const OBSIDIAN_PATH = 'oxygen-world/Database';

// Демо-данные, соответствующие реальной схеме БД
const demoData = {
  users: [
    {
      id: '550e8400-e29b-41d4-a716-446655440001',
      username: 'david_smith',
      first_name: 'David',
      last_name: 'Smith',
      email: 'david.smith@example.com',
      phone: '+66-81-234-5678',
      member_id: 'PHG001',
      user_role: 'player',
      current_rating: 2485.0,
      bonus_points: 150,
      is_account_verified: true,
      created_at: '2024-01-15T08:00:00Z'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440002',
      username: 'anna_johnson',
      first_name: 'Anna',
      last_name: 'Johnson',
      email: 'anna.johnson@example.com',
      phone: '+66-81-234-5679',
      member_id: 'PHG002',
      user_role: 'coach',
      current_rating: 2650.0,
      bonus_points: 300,
      is_account_verified: true,
      created_at: '2024-01-10T09:00:00Z'
    },
    {
      id: '550e8400-e29b-41d4-a716-446655440003',
      username: 'sarah_brown',
      first_name: 'Sarah',
      last_name: 'Brown',
      email: 'sarah.brown@example.com',
      phone: '+66-81-234-5680',
      member_id: 'PHG003',
      user_role: 'player',
      current_rating: 1850.0,
      bonus_points: 75,
      is_account_verified: true,
      created_at: '2024-02-01T10:00:00Z'
    }
  ],
  
  venues: [
    {
      id: '660e8400-e29b-41d4-a716-446655440001',
      name: 'Phangan Padel Tennis Club',
      address: 'Paradise Beach, Thong Sala',
      city: 'Koh Phangan',
      country: 'Thailand',
      phone_number: '+66-77-123-456',
      email: 'info@phanganpadel.com',
      is_active: true,
      created_at: '2024-01-01T00:00:00Z'
    }
  ],
  
  courts: [
    {
      id: '770e8400-e29b-41d4-a716-446655440001',
      venue_id: '660e8400-e29b-41d4-a716-446655440001',
      name: 'Tennis Court',
      court_type: 'tennis',
      status: 'active',
      hourly_rate: 1200.00,
      capacity: 4,
      description: 'Professional tennis court with premium surface',
      is_active: true,
      created_at: '2024-01-01T00:00:00Z'
    },
    {
      id: '770e8400-e29b-41d4-a716-446655440002',
      venue_id: '660e8400-e29b-41d4-a716-446655440001',
      name: 'Padel Court',
      court_type: 'padel',
      status: 'active',
      hourly_rate: 600.00,
      capacity: 4,
      description: 'Glass-walled padel court with LED lighting',
      is_active: true,
      created_at: '2024-01-01T00:00:00Z'
    }
  ],
  
  bookings: [
    {
      id: '880e8400-e29b-41d4-a716-446655440001',
      court_id: '770e8400-e29b-41d4-a716-446655440001',
      booked_by_user_id: '550e8400-e29b-41d4-a716-446655440001',
      start_time: '2025-01-31T09:00:00Z',
      end_time: '2025-01-31T10:00:00Z',
      duration_minutes: 60,
      status: 'confirmed',
      total_amount: 1200.00,
      currency: 'THB',
      booking_purpose: 'recreational_play',
      created_at: '2025-01-30T15:00:00Z'
    },
    {
      id: '880e8400-e29b-41d4-a716-446655440002',
      court_id: '770e8400-e29b-41d4-a716-446655440002',
      booked_by_user_id: '550e8400-e29b-41d4-a716-446655440003',
      start_time: '2025-01-31T14:00:00Z',
      end_time: '2025-01-31T15:00:00Z',
      duration_minutes: 60,
      status: 'confirmed',
      total_amount: 600.00,
      currency: 'THB',
      booking_purpose: 'recreational_play',
      created_at: '2025-01-30T16:00:00Z'
    }
  ],
  
  payments: [
    {
      id: '990e8400-e29b-41d4-a716-446655440001',
      user_id: '550e8400-e29b-41d4-a716-446655440001',
      amount: 1200.00,
      currency: 'THB',
      status: 'completed',
      payment_method: 'credit_card',
      description: 'Tennis court booking payment',
      created_at: '2025-01-30T15:05:00Z'
    },
    {
      id: '990e8400-e29b-41d4-a716-446655440002',
      user_id: '550e8400-e29b-41d4-a716-446655440003',
      amount: 600.00,
      currency: 'THB',
      status: 'completed',
      payment_method: 'bank_transfer',
      description: 'Padel court booking payment',
      created_at: '2025-01-30T16:05:00Z'
    }
  ]
};

async function createDemoFiles() {
  console.log('🎯 Создаем демо-данные на основе реальной схемы БД...');
  
  // Создаем папку если не существует
  await fs.mkdir(OBSIDIAN_PATH, { recursive: true });
  
  // Создаем файлы пользователей
  for (const user of demoData.users) {
    await createUserFile(user);
  }
  
  // Создаем файлы площадок
  for (const venue of demoData.venues) {
    await createVenueFile(venue);
  }
  
  // Создаем файлы кортов
  for (const court of demoData.courts) {
    await createCourtFile(court);
  }
  
  // Создаем файлы бронирований
  for (const booking of demoData.bookings) {
    await createBookingFile(booking);
  }
  
  // Создаем файлы платежей
  for (const payment of demoData.payments) {
    await createPaymentFile(payment);
  }
  
  console.log('✅ Демо-данные созданы успешно!');
  console.log('🧠 Теперь "Второй Мозг" содержит данные, соответствующие реальной схеме Neon DB');
}

async function createUserFile(user) {
  const roleEmoji = {
    player: '🎾',
    coach: '🏃‍♂️',
    admin: '👨‍💼',
    club_staff: '👷'
  }[user.user_role] || '👤';
  
  const content = `---
title: "${user.first_name} ${user.last_name}"
username: "${user.username}"
first_name: "${user.first_name}"
last_name: "${user.last_name}"
email: "${user.email}"
phone: "${user.phone}"
user_role: "${user.user_role}"
current_rating: ${user.current_rating}
bonus_points: ${user.bonus_points}
member_id: "${user.member_id}"
status: "active"
tags: [user, ${user.user_role}, thailand, neon_schema]
created_at: "${user.created_at.split('T')[0]}"
sync_source: "neon_schema_demo"
last_sync: "${new Date().toISOString()}"
neon_id: "${user.id}"
table_name: "user"
---

# ${roleEmoji} ${user.first_name} ${user.last_name}

## 📋 Профиль ${user.user_role === 'coach' ? 'тренера' : 'игрока'}

- **ID в Neon**: \`${user.id}\`
- **Логин**: \`= this.username\`
- **Рейтинг**: \`= this.current_rating\` ⭐
- **Роль**: \`= this.user_role\`
- **Бонусы**: \`= this.bonus_points\` баллов
- **Email**: \`= this.email\`
- **Телефон**: \`= this.phone\`
- **ID участника**: \`= this.member_id\`

## 🔗 Связи в "Втором Мозге"

### 🧠 **Модель**
- [[🧠 MODEL - User (Central Neuron)|🧠 USER Model - Центральный Нейрон]]

### 📅 **Мои бронирования**
${user.username === 'david_smith' ? '- [[Booking-Tennis-David-Today|📅 Tennis Court - Сегодня 09:00]]' : ''}
${user.username === 'sarah_brown' ? '- [[Booking-Padel-Sarah-Today|📅 Padel Court - Сегодня 14:00]]' : ''}

### 💰 **Мои платежи**
${user.username === 'david_smith' ? '- [[Payment-David-Tennis|💰 1,200 THB - Tennis Court]]' : ''}
${user.username === 'sarah_brown' ? '- [[Payment-Sarah-Padel|💰 600 THB - Padel Court]]' : ''}

## 📊 Статистика

- **Член клуба с**: \`= this.created_at\`
- **Статус аккаунта**: ${user.is_account_verified ? '✅ Подтвержден' : '❌ Не подтвержден'}
- **Последняя синхронизация**: \`= this.last_sync\`

---

*📡 Синхронизировано с Neon Database Schema*
*🧠 Часть "Второго Мозга" Сервера*`;

  const fileName = `User-${user.first_name}-${user.last_name}.md`;
  const filePath = path.join(OBSIDIAN_PATH, fileName);
  await fs.writeFile(filePath, content, 'utf8');
  console.log(`✅ Создан: ${fileName}`);
}

async function createVenueFile(venue) {
  const content = `---
title: "${venue.name}"
name: "${venue.name}"
address: "${venue.address}"
city: "${venue.city}"
country: "${venue.country}"
phone_number: "${venue.phone_number}"
email: "${venue.email}"
is_active: ${venue.is_active}
tags: [venue, thailand, neon_schema]
created_at: "${venue.created_at.split('T')[0]}"
sync_source: "neon_schema_demo"
last_sync: "${new Date().toISOString()}"
neon_id: "${venue.id}"
table_name: "venue"
---

# 🏠 ${venue.name}

## 📋 Информация о клубе

- **ID в Neon**: \`${venue.id}\`
- **Название**: \`= this.name\`
- **Адрес**: \`= this.address\`
- **Город**: \`= this.city\`
- **Страна**: \`= this.country\`
- **Телефон**: \`= this.phone_number\`
- **Email**: \`= this.email\`
- **Статус**: ${venue.is_active ? '✅ Активен' : '❌ Неактивен'}

## 🔗 Связи в "Втором Мозге"

### 🧠 **Модель**
- [[🧠 MODEL - Venue (Spatial Node)|🧠 VENUE Model - Пространственный Узел]]

### 🏓 **Наши корты**
- [[Court-Tennis|🏓 Tennis Court - Premium]]
- [[Court-Padel|🏓 Padel Court - Glass]]

### 👥 **Наши пользователи**
- [[User-David-Smith|👤 David Smith - Топ игрок]]
- [[User-Anna-Johnson|👤 Anna Johnson - VIP тренер]]
- [[User-Sarah-Brown|👤 Sarah Brown - Падел энтузиаст]]

---

*📡 Синхронизировано с Neon Database Schema*
*🧠 Часть "Второго Мозга" Сервера*`;

  const fileName = `Venue-${venue.name.replace(/\s+/g, '-')}.md`;
  const filePath = path.join(OBSIDIAN_PATH, fileName);
  await fs.writeFile(filePath, content, 'utf8');
  console.log(`✅ Создан: ${fileName}`);
}

async function createCourtFile(court) {
  const typeEmoji = court.court_type === 'tennis' ? '🎾' : '🏓';
  
  const content = `---
title: "${court.name}"
name: "${court.name}"
court_type: "${court.court_type}"
status: "${court.status}"
hourly_rate: ${court.hourly_rate}
capacity: ${court.capacity}
description: "${court.description}"
is_active: ${court.is_active}
tags: [court, ${court.court_type}, thailand, neon_schema]
created_at: "${court.created_at.split('T')[0]}"
sync_source: "neon_schema_demo"
last_sync: "${new Date().toISOString()}"
neon_id: "${court.id}"
venue_id: "${court.venue_id}"
table_name: "court"
---

# ${typeEmoji} ${court.name}

## 📋 Информация о корте

- **ID в Neon**: \`${court.id}\`
- **Название**: \`= this.name\`
- **Тип**: \`= this.court_type\`
- **Статус**: \`= this.status\`
- **Цена за час**: \`= this.hourly_rate\` THB
- **Вместимость**: \`= this.capacity\` человек
- **Описание**: \`= this.description\`

## 🔗 Связи в "Втором Мозге"

### 🧠 **Модель**
- [[🧠 MODEL - Court (Infrastructure Node)|🧠 COURT Model - Инфраструктурный Узел]]

### 🏠 **Клуб**
- [[Venue-Phangan-Padel-Tennis-Club|🏠 Phangan Padel Tennis Club]]

### 📅 **Сегодняшние бронирования**
${court.court_type === 'tennis' ? '- [[Booking-Tennis-David-Today|📅 David Smith - 09:00-10:00]]' : ''}
${court.court_type === 'padel' ? '- [[Booking-Padel-Sarah-Today|📅 Sarah Brown - 14:00-15:00]]' : ''}

---

*📡 Синхронизировано с Neon Database Schema*
*🧠 Часть "Второго Мозга" Сервера*`;

  const fileName = `Court-${court.name.replace(/\s+/g, '-')}.md`;
  const filePath = path.join(OBSIDIAN_PATH, fileName);
  await fs.writeFile(filePath, content, 'utf8');
  console.log(`✅ Создан: ${fileName}`);
}

async function createBookingFile(booking) {
  const user = demoData.users.find(u => u.id === booking.booked_by_user_id);
  const court = demoData.courts.find(c => c.id === booking.court_id);
  
  const content = `---
title: "${user.first_name} ${user.last_name} - ${court.name}"
court_name: "${court.name}"
user_name: "${user.first_name} ${user.last_name}"
start_time: "${booking.start_time}"
end_time: "${booking.end_time}"
duration_minutes: ${booking.duration_minutes}
status: "${booking.status}"
total_amount: ${booking.total_amount}
currency: "${booking.currency}"
booking_purpose: "${booking.booking_purpose}"
tags: [booking, today, ${court.court_type}, neon_schema]
created_at: "${booking.created_at.split('T')[0]}"
sync_source: "neon_schema_demo"
last_sync: "${new Date().toISOString()}"
neon_id: "${booking.id}"
court_id: "${booking.court_id}"
user_id: "${booking.booked_by_user_id}"
table_name: "booking"
---

# 📅 ${user.first_name} ${user.last_name} - ${court.name}

## 📋 Детали бронирования

- **ID в Neon**: \`${booking.id}\`
- **Время начала**: \`= this.start_time\`
- **Время окончания**: \`= this.end_time\`
- **Длительность**: \`= this.duration_minutes\` минут
- **Статус**: \`= this.status\`
- **Сумма**: \`= this.total_amount\` \`= this.currency\`
- **Цель**: \`= this.booking_purpose\`

## 🔗 Связи в "Втором Мозге"

### 🧠 **Модель**
- [[🧠 MODEL - Booking (Temporal Node)|🧠 BOOKING Model - Временной Узел]]

### 👤 **Клиент**
- [[User-${user.first_name}-${user.last_name}|👤 ${user.first_name} ${user.last_name}]]

### 🏓 **Корт**
- [[Court-${court.name.replace(/\s+/g, '-')}|${court.court_type === 'tennis' ? '🎾' : '🏓'} ${court.name}]]

### 💰 **Платеж**
- [[Payment-${user.first_name}-${court.name.replace(/\s+/g, '-')}|💰 ${booking.total_amount} THB]]

---

*📡 Синхронизировано с Neon Database Schema*
*🧠 Часть "Второго Мозга" Сервера*`;

  const fileName = `Booking-${court.name.replace(/\s+/g, '-')}-${user.first_name}-Today.md`;
  const filePath = path.join(OBSIDIAN_PATH, fileName);
  await fs.writeFile(filePath, content, 'utf8');
  console.log(`✅ Создан: ${fileName}`);
}

async function createPaymentFile(payment) {
  const user = demoData.users.find(u => u.id === payment.user_id);
  
  const content = `---
title: "${user.first_name} ${user.last_name} - ${payment.amount} ${payment.currency}"
user_name: "${user.first_name} ${user.last_name}"
amount: ${payment.amount}
currency: "${payment.currency}"
status: "${payment.status}"
payment_method: "${payment.payment_method}"
description: "${payment.description}"
tags: [payment, ${payment.status}, neon_schema]
created_at: "${payment.created_at.split('T')[0]}"
sync_source: "neon_schema_demo"
last_sync: "${new Date().toISOString()}"
neon_id: "${payment.id}"
user_id: "${payment.user_id}"
table_name: "payment"
---

# 💰 ${user.first_name} ${user.last_name} - ${payment.amount} ${payment.currency}

## 📋 Детали платежа

- **ID в Neon**: \`${payment.id}\`
- **Сумма**: \`= this.amount\` \`= this.currency\`
- **Статус**: \`= this.status\`
- **Способ оплаты**: \`= this.payment_method\`
- **Описание**: \`= this.description\`

## 🔗 Связи в "Втором Мозге"

### 🧠 **Модель**
- [[🧠 MODEL - Payment (Financial Node)|🧠 PAYMENT Model - Финансовый Узел]]

### 👤 **Клиент**
- [[User-${user.first_name}-${user.last_name}|👤 ${user.first_name} ${user.last_name}]]

---

*📡 Синхронизировано с Neon Database Schema*
*🧠 Часть "Второго Мозга" Сервера*`;

  const fileName = `Payment-${user.first_name}-${payment.description.includes('Tennis') ? 'Tennis' : 'Padel'}.md`;
  const filePath = path.join(OBSIDIAN_PATH, fileName);
  await fs.writeFile(filePath, content, 'utf8');
  console.log(`✅ Создан: ${fileName}`);
}

// Запуск
createDemoFiles().catch(console.error);
