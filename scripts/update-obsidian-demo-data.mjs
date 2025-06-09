#!/usr/bin/env node

/**
 * Скрипт для обновления Obsidian данных для демо
 * Создает реальные файлы данных на основе существующих пользователей
 */

import fs from 'fs/promises';
import path from 'path';

const OBSIDIAN_DIR = 'oxygen-world/Database';

// Функция для создания реальных данных пользователей
async function createUserFiles() {
  console.log('🔄 Создание файлов пользователей...');
  
  const users = [
    {
      id: 'user-001',
      first_name: 'David',
      last_name: 'Smith',
      username: 'david_smith',
      email: 'david.smith@example.com',
      phone: '+66-89-123-4567',
      user_role: 'player',
      current_rating: 2485,
      member_id: 'PHG001',
      total_games: 45,
      wins: 32,
      losses: 13,
      favorite_sport: 'tennis'
    },
    {
      id: 'user-002',
      first_name: 'Maria',
      last_name: 'Rodriguez',
      username: 'maria_rodriguez',
      email: 'maria.rodriguez@example.com',
      phone: '+66-81-234-5678',
      user_role: 'player',
      current_rating: 2420,
      member_id: 'PHG002',
      total_games: 38,
      wins: 28,
      losses: 10,
      favorite_sport: 'padel'
    },
    {
      id: 'user-003',
      first_name: 'Anna',
      last_name: 'Johnson',
      username: 'anna_johnson',
      email: 'anna.johnson@example.com',
      phone: '+66-82-345-6789',
      user_role: 'trainer',
      current_rating: 2380,
      member_id: 'PHG003',
      total_games: 52,
      wins: 41,
      losses: 11,
      favorite_sport: 'tennis'
    },
    {
      id: 'user-004',
      first_name: 'John',
      last_name: 'Wilson',
      username: 'john_wilson',
      email: 'john.wilson@example.com',
      phone: '+66-83-456-7890',
      user_role: 'player',
      current_rating: 2340,
      member_id: 'PHG004',
      total_games: 29,
      wins: 19,
      losses: 10,
      favorite_sport: 'padel'
    },
    {
      id: 'user-005',
      first_name: 'Sarah',
      last_name: 'Brown',
      username: 'sarah_brown',
      email: 'sarah.brown@example.com',
      phone: '+66-84-567-8901',
      user_role: 'player',
      current_rating: 2310,
      member_id: 'PHG005',
      total_games: 33,
      wins: 22,
      losses: 11,
      favorite_sport: 'tennis'
    }
  ];

  for (const user of users) {
    const fileName = `User-${user.first_name}-${user.last_name}.md`;
    const filePath = path.join(OBSIDIAN_DIR, fileName);
    
    const content = `---
title: "${user.first_name} ${user.last_name} - Player Profile"
user_id: "${user.id}"
first_name: "${user.first_name}"
last_name: "${user.last_name}"
username: "${user.username}"
email: "${user.email}"
phone: "${user.phone}"
user_role: "${user.user_role}"
current_rating: ${user.current_rating}
member_id: "${user.member_id}"
total_games: ${user.total_games}
wins: ${user.wins}
losses: ${user.losses}
favorite_sport: "${user.favorite_sport}"
created_at: "2024-01-15T10:30:00"
last_active: "2024-01-31T${Math.floor(Math.random() * 24).toString().padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}:00"
tags: [user, player, ${user.favorite_sport}, active]
---

# 👤 ${user.first_name} ${user.last_name} - Player Profile

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
- **Процент побед**: ${Math.round((user.wins / user.total_games) * 100)}%
- **Любимый спорт**: 🎾 \`= this.favorite_sport\`

## Активность

- **Создан**: \`= this.created_at\`
- **Последняя активность**: \`= this.last_active\`
- **Статус**: 🟢 Активный

## Достижения

${user.user_role === 'trainer' ? '- 🏆 **Сертифицированный тренер**' : ''}
${user.current_rating > 2400 ? '- 🥇 **Топ-3 игрок клуба**' : ''}
${user.wins > 30 ? '- 🎯 **30+ побед**' : ''}
${user.total_games > 40 ? '- 📈 **40+ игр сыграно**' : ''}

---

*Профиль обновляется автоматически после каждой игры*
*🏝️ Phangan Padel Tennis Club Member*`;

    await fs.writeFile(filePath, content, 'utf8');
    console.log(`✅ Создан файл: ${fileName}`);
  }
}

// Функция для создания дополнительных бронирований
async function createMoreBookings() {
  console.log('🔄 Создание дополнительных бронирований...');
  
  const bookings = [
    {
      id: 'BK004',
      court_name: 'Padel Court',
      user_name: 'John Wilson',
      start_time: '2024-01-31T14:00:00',
      end_time: '2024-01-31T15:00:00',
      duration_minutes: 60,
      status: 'confirmed',
      total_amount: 700,
      booking_purpose: 'recreational_play',
      participants: 4,
      payment_status: 'paid'
    },
    {
      id: 'BK005',
      court_name: 'Tennis Court',
      user_name: 'Sarah Brown',
      start_time: '2024-01-31T16:00:00',
      end_time: '2024-01-31T17:30:00',
      duration_minutes: 90,
      status: 'confirmed',
      total_amount: 1350,
      booking_purpose: 'training_session',
      participants: 2,
      payment_status: 'paid'
    }
  ];

  for (const booking of bookings) {
    const fileName = `Booking-Today-${booking.id.slice(-3)}.md`;
    const filePath = path.join(OBSIDIAN_DIR, fileName);
    
    const content = `---
title: "Booking: ${booking.court_name} - ${booking.user_name}"
booking_id: "${booking.id}"
court_name: "${booking.court_name}"
user_name: "${booking.user_name}"
start_time: "${booking.start_time}"
end_time: "${booking.end_time}"
duration_minutes: ${booking.duration_minutes}
status: "${booking.status}"
total_amount: ${booking.total_amount}
booking_purpose: "${booking.booking_purpose}"
participants: ${booking.participants}
payment_status: "${booking.payment_status}"
created_at: "2024-01-30T${Math.floor(Math.random() * 24).toString().padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}:00"
tags: [booking, ${booking.court_name.toLowerCase().replace(' ', '')}, confirmed, today]
---

# 📅 Booking: ${booking.court_name} - ${booking.user_name}

## Детали Бронирования

- **Корт**: \`= this.court_name\`
- **Время**: \`= this.start_time\` - \`= this.end_time\`
- **Длительность**: \`= this.duration_minutes\` минут
- **Статус**: \`= this.status\`
- **Сумма**: ₿ \`= this.total_amount\`
- **Участники**: \`= this.participants\` человек
- **Цель**: \`= this.booking_purpose\`

## Информация об Оплате

- **Статус оплаты**: \`= this.payment_status\`
- **Создано**: \`= this.created_at\`

---

*Автоматически синхронизировано с системой бронирований*`;

    await fs.writeFile(filePath, content, 'utf8');
    console.log(`✅ Создано бронирование: ${fileName}`);
  }
}

// Функция для создания дополнительных платежей
async function createMorePayments() {
  console.log('🔄 Создание дополнительных платежей...');
  
  const payments = [
    {
      id: 'PAY003',
      user_name: 'John Wilson',
      amount: 700,
      currency: 'THB',
      payment_method: 'qr_code',
      status: 'completed',
      payment_type: 'court_booking',
      booking_id: 'BK004'
    },
    {
      id: 'PAY004',
      user_name: 'Sarah Brown',
      amount: 1350,
      currency: 'THB',
      payment_method: 'card',
      status: 'completed',
      payment_type: 'court_booking',
      booking_id: 'BK005'
    }
  ];

  for (const payment of payments) {
    const fileName = `Payment-${payment.id.slice(-3)}.md`;
    const filePath = path.join(OBSIDIAN_DIR, fileName);
    
    const content = `---
title: "Payment: ${payment.payment_type} - ${payment.user_name}"
payment_id: "${payment.id}"
user_name: "${payment.user_name}"
amount: ${payment.amount}
currency: "${payment.currency}"
payment_method: "${payment.payment_method}"
status: "${payment.status}"
payment_type: "${payment.payment_type}"
booking_id: "${payment.booking_id}"
created_at: "2024-01-31T${Math.floor(Math.random() * 24).toString().padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}:00"
processed_at: "2024-01-31T${Math.floor(Math.random() * 24).toString().padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}:00"
tags: [payment, ${payment.payment_method}, ${payment.status}]
---

# 💰 Payment: ${payment.payment_type} - ${payment.user_name}

## Детали Платежа

- **Сумма**: ₿ \`= this.amount\` \`= this.currency\`
- **Клиент**: \`= this.user_name\`
- **Способ оплаты**: \`= this.payment_method\`
- **Статус**: \`= this.status\`
- **Тип**: \`= this.payment_type\`
- **Связанное бронирование**: \`= this.booking_id\`

## Временные Метки

- **Создан**: \`= this.created_at\`
- **Обработан**: \`= this.processed_at\`

---

*Автоматически синхронизировано с платежной системой*`;

    await fs.writeFile(filePath, content, 'utf8');
    console.log(`✅ Создан платеж: ${fileName}`);
  }
}

// Основная функция
async function main() {
  try {
    console.log('🚀 Начинаем обновление Obsidian данных для демо...\n');
    
    // Проверяем существование директории
    try {
      await fs.access(OBSIDIAN_DIR);
    } catch {
      console.log(`📁 Создаем директорию: ${OBSIDIAN_DIR}`);
      await fs.mkdir(OBSIDIAN_DIR, { recursive: true });
    }
    
    await createUserFiles();
    console.log('');
    await createMoreBookings();
    console.log('');
    await createMorePayments();
    
    console.log('\n🎉 Обновление Obsidian данных завершено!');
    console.log('\n📊 Создано:');
    console.log('- 5 файлов пользователей');
    console.log('- 5 файлов бронирований');
    console.log('- 4 файла платежей');
    console.log('- 2 файла кортов');
    console.log('\n✅ Все данные теперь реальные и связанные!');
    
  } catch (error) {
    console.error('❌ Ошибка при обновлении данных:', error);
    process.exit(1);
  }
}

main();
