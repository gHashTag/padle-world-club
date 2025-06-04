/**
 * Database Seeding Script
 * Наполняет все таблицы тестовыми данными для разработки чат-бота
 */

import { drizzle } from "drizzle-orm/postgres-js";
import { sql } from "drizzle-orm";
import postgres from "postgres";
import { faker } from "@faker-js/faker";
import * as schema from "../db/schema";

// Настройка faker для русского языка
faker.setDefaultRefDate('2024-01-01T00:00:00.000Z');

// Используем тот же URL что и в drizzle.config.ts
const DATABASE_URL = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_z6BWURv1GHbu@ep-dry-base-a1uf8xwo-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

async function seedDatabase() {
  console.log("🌱 Начинаем наполнение базы данных тестовыми данными...");

  const client = postgres(DATABASE_URL);
  const db = drizzle(client, { schema });

  try {
    // Проверяем существует ли таблица user
    console.log("🔍 Проверяем существование таблиц...");

    let userCount = 0;
    try {
      const existingUsers = await db.execute(sql`SELECT COUNT(*) as count FROM "user"`);
      userCount = Number(existingUsers[0]?.count || 0);
      console.log(`📊 Найдено ${userCount} пользователей в БД`);
    } catch (error) {
      if (error instanceof Error && error.message?.includes('relation "user" does not exist')) {
        console.log("⚠️  Таблица 'user' не существует. Нужно применить миграции.");
        console.log("🔧 Запустите: npx drizzle-kit push");
        console.log("   Затем выберите 'Yes, I want to execute all statements'");
        throw new Error("Таблицы не созданы. Примените миграции сначала.");
      }
      throw error;
    }

    if (userCount > 0) {
      console.log(`📊 Найдено ${userCount} пользователей. Очищаем БД перед наполнением...`);

      // Очищаем таблицы в правильном порядке (учитывая foreign keys)
      await db.execute(sql`TRUNCATE TABLE rating_change CASCADE`);
      await db.execute(sql`TRUNCATE TABLE game_player CASCADE`);
      await db.execute(sql`TRUNCATE TABLE game_session CASCADE`);
      await db.execute(sql`TRUNCATE TABLE tournament_participant CASCADE`);
      await db.execute(sql`TRUNCATE TABLE tournament CASCADE`);
      await db.execute(sql`TRUNCATE TABLE class_participant CASCADE`);
      await db.execute(sql`TRUNCATE TABLE class_schedule CASCADE`);
      await db.execute(sql`TRUNCATE TABLE class_definition CASCADE`);
      await db.execute(sql`TRUNCATE TABLE user_training_package CASCADE`);
      await db.execute(sql`TRUNCATE TABLE training_package_definition CASCADE`);
      await db.execute(sql`TRUNCATE TABLE payment CASCADE`);
      await db.execute(sql`TRUNCATE TABLE booking_participant CASCADE`);
      await db.execute(sql`TRUNCATE TABLE booking CASCADE`);
      await db.execute(sql`TRUNCATE TABLE court CASCADE`);
      await db.execute(sql`TRUNCATE TABLE venue CASCADE`);
      await db.execute(sql`TRUNCATE TABLE notification CASCADE`);
      await db.execute(sql`TRUNCATE TABLE task CASCADE`);
      await db.execute(sql`TRUNCATE TABLE feedback CASCADE`);
      await db.execute(sql`TRUNCATE TABLE "user" CASCADE`);

      console.log("✅ База данных очищена");
    }
    // 1. Создаем пользователей
    console.log("👥 Создаем пользователей...");
    const users = await createUsers(db);

    // 2. Создаем площадки
    console.log("🏢 Создаем площадки...");
    const venues = await createVenues(db);

    // 3. Создаем корты
    console.log("🎾 Создаем корты...");
    const courts = await createCourts(db, venues);

    // 4. Создаем бронирования
    console.log("📅 Создаем бронирования...");
    const bookings = await createBookings(db, users, courts);

    // 5. Создаем участников бронирований
    console.log("👥 Добавляем участников бронирований...");
    await createBookingParticipants(db, bookings, users);

    // 6. Создаем платежи
    console.log("💳 Создаем платежи...");
    await createPayments(db, bookings, users);

    // 7. Создаем игровые сессии
    console.log("🎮 Создаем игровые сессии...");
    const gameSessions = await createGameSessions(db, courts, users, venues);

    // 8. Добавляем игроков в сессии
    console.log("🏃 Добавляем игроков в сессии...");
    await createGamePlayers(db, gameSessions, users);

    // 9. Создаем изменения рейтинга
    console.log("📊 Создаем изменения рейтинга...");
    await createRatingChanges(db, users, gameSessions);

    // 10. Создаем турниры
    console.log("🏆 Создаем турниры...");
    await createTournaments(db, venues);

    console.log("✅ База данных успешно наполнена тестовыми данными!");

  } catch (error) {
    console.error("❌ Ошибка при наполнении базы данных:", error);
    throw error;
  } finally {
    await client.end();
  }
}

// Функция создания пользователей
async function createUsers(db: any) {
  const users = [];

  // Создаем админа
  users.push({
    username: "admin",
    passwordHash: "$2b$10$admin.hash.example",
    firstName: "Админ",
    lastName: "Системы",
    email: "admin@padle-club.com",
    phone: "+7-900-123-45-67",
    memberId: "ADMIN001",
    userRole: "admin" as const,
    currentRating: 2000.0,
    bonusPoints: 1000,
    isAccountVerified: true,
    homeVenueId: null,
  });

  // Создаем тренеров
  for (let i = 0; i < 5; i++) {
    users.push({
      username: `coach_${i + 1}`,
      passwordHash: "$2b$10$coach.hash.example",
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      memberId: `COACH${String(i + 1).padStart(3, '0')}`,
      userRole: "coach" as const,
      currentRating: faker.number.float({ min: 1800, max: 2200 }),
      bonusPoints: faker.number.int({ min: 100, max: 500 }),
      isAccountVerified: true,
      gender: faker.helpers.arrayElement(["male", "female"]),
      dateOfBirth: faker.date.birthdate({ min: 25, max: 50, mode: 'age' }),
    });
  }

  // Создаем игроков
  for (let i = 0; i < 50; i++) {
    users.push({
      username: `player_${i + 1}`,
      passwordHash: "$2b$10$player.hash.example",
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      memberId: `PLAYER${String(i + 1).padStart(3, '0')}`,
      userRole: "player" as const,
      currentRating: faker.number.float({ min: 1200, max: 1800 }),
      bonusPoints: faker.number.int({ min: 0, max: 200 }),
      isAccountVerified: faker.datatype.boolean(),
      gender: faker.helpers.arrayElement(["male", "female"]),
      dateOfBirth: faker.date.birthdate({ min: 18, max: 65, mode: 'age' }),
    });
  }

  const insertedUsers = await db.insert(schema.users).values(users).returning();
  console.log(`   ✅ Создано ${insertedUsers.length} пользователей`);
  return insertedUsers;
}

// Функция создания площадок
async function createVenues(db: any) {
  const venues = [];

  const venueNames = [
    "Центральный паддл-клуб",
    "Спортивный комплекс Олимп",
    "Фитнес-центр Энергия",
    "Клуб Чемпион",
    "Спорт-парк Победа"
  ];

  for (let i = 0; i < venueNames.length; i++) {
    venues.push({
      name: venueNames[i],
      description: `Современный спортивный комплекс с профессиональными кортами для паддл-тенниса`,
      address: faker.location.streetAddress(),
      city: "Москва",
      country: "Россия",
      phone: faker.phone.number(),
      email: faker.internet.email(),
      website: faker.internet.url(),
      workingHours: "08:00-23:00",
      amenities: ["Раздевалки", "Душевые", "Кафе", "Парковка", "Wi-Fi"],
      isActive: true,
    });
  }

  const insertedVenues = await db.insert(schema.venues).values(venues).returning();
  console.log(`   ✅ Создано ${insertedVenues.length} площадок`);
  return insertedVenues;
}

// Функция создания кортов
async function createCourts(db: any, venues: any[]) {
  const courts = [];

  for (const venue of venues) {
    // Создаем 3-6 кортов для каждой площадки
    const courtCount = faker.number.int({ min: 3, max: 6 });

    for (let i = 1; i <= courtCount; i++) {
      courts.push({
        venueId: venue.id,
        name: `Корт ${i}`,
        courtType: faker.helpers.arrayElement(["paddle", "tennis"]),
        hourlyRate: faker.number.float({ min: 1500, max: 3000 }),
        isActive: faker.datatype.boolean({ probability: 0.9 }),
        description: `Профессиональный корт для паддл-тенниса`,
      });
    }
  }

  const insertedCourts = await db.insert(schema.courts).values(courts).returning();
  console.log(`   ✅ Создано ${insertedCourts.length} кортов`);
  return insertedCourts;
}

// Функция создания бронирований
async function createBookings(db: any, users: any[], courts: any[]) {
  const bookings = [];

  for (let i = 0; i < 100; i++) {
    const startTime = faker.date.future();
    const endTime = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // +2 часа
    const durationMinutes = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60));

    bookings.push({
      courtId: faker.helpers.arrayElement(courts).id,
      startTime,
      endTime,
      durationMinutes,
      status: faker.helpers.arrayElement(["confirmed", "pending_payment", "cancelled", "completed"]),
      totalAmount: faker.number.float({ min: 3000, max: 6000 }),
      currency: "RUB",
      bookedByUserId: faker.helpers.arrayElement(users).id,
      bookingPurpose: faker.helpers.arrayElement(["free_play", "group_training", "private_training", "tournament_match", "other"]),
      notes: faker.lorem.sentence(),
    });
  }

  const insertedBookings = await db.insert(schema.bookings).values(bookings).returning();
  console.log(`   ✅ Создано ${insertedBookings.length} бронирований`);
  return insertedBookings;
}

// Функция создания участников бронирований
async function createBookingParticipants(db: any, bookings: any[], users: any[]) {
  const participants = [];

  for (const booking of bookings) {
    // Добавляем 1-3 дополнительных участников к каждому бронированию
    const participantCount = faker.number.int({ min: 1, max: 3 });
    const usedUserIds = new Set(); // Отслеживаем уже добавленных пользователей

    for (let i = 0; i < participantCount; i++) {
      // Выбираем пользователя, которого еще нет в этом бронировании
      let selectedUser;
      let attempts = 0;
      do {
        selectedUser = faker.helpers.arrayElement(users);
        attempts++;
      } while (usedUserIds.has(selectedUser.id) && attempts < 10);

      if (attempts >= 10) break; // Избегаем бесконечного цикла

      usedUserIds.add(selectedUser.id);

      participants.push({
        bookingId: booking.id,
        userId: selectedUser.id,
        amountOwed: faker.number.float({ min: 500, max: 2000 }),
        amountPaid: faker.number.float({ min: 0, max: 1000 }),
        paymentStatus: faker.helpers.arrayElement(["success", "pending", "failed"]),
        participationStatus: faker.helpers.arrayElement(["registered", "attended", "no_show", "cancelled"]),
        isHost: faker.datatype.boolean({ probability: 0.2 }),
      });
    }
  }

  const insertedParticipants = await db.insert(schema.bookingParticipants).values(participants).returning();
  console.log(`   ✅ Создано ${insertedParticipants.length} участников бронирований`);
  return insertedParticipants;
}

// Функция создания платежей
async function createPayments(db: any, bookings: any[], _users: any[]) {
  const payments = [];

  for (const booking of bookings) {
    if (booking.status === "confirmed" || booking.status === "completed") {
      payments.push({
        userId: booking.bookedByUserId,
        amount: booking.totalAmount,
        currency: booking.currency,
        status: faker.helpers.arrayElement(["success", "pending", "failed"]),
        paymentMethod: faker.helpers.arrayElement(["card", "cash", "bank_transfer", "bonus_points"]),
        gatewayTransactionId: faker.string.uuid(),
        description: `Оплата бронирования корта`,
      });
    }
  }

  const insertedPayments = await db.insert(schema.payments).values(payments).returning();
  console.log(`   ✅ Создано ${insertedPayments.length} платежей`);
  return insertedPayments;
}

// Функция создания игровых сессий
async function createGameSessions(db: any, courts: any[], users: any[], venues: any[]) {
  const gameSessions = [];

  for (let i = 0; i < 80; i++) {
    const startTime = faker.date.recent();
    const endTime = new Date(startTime.getTime() + 90 * 60 * 1000); // +1.5 часа
    const selectedCourt = faker.helpers.arrayElement(courts);
    const selectedVenue = venues.find(v => v.id === selectedCourt.venueId) || faker.helpers.arrayElement(venues);

    gameSessions.push({
      venueId: selectedVenue.id,
      courtId: selectedCourt.id,
      startTime,
      endTime,
      gameType: faker.helpers.arrayElement(["public_match", "private_match"]),
      neededSkillLevel: faker.helpers.arrayElement(["beginner", "intermediate", "advanced", "professional"]),
      maxPlayers: faker.helpers.arrayElement([2, 4]),
      currentPlayers: 0, // Будет обновлено после добавления игроков
      status: faker.helpers.arrayElement(["open_for_players", "full", "in_progress", "completed", "cancelled"]),
      createdByUserId: faker.helpers.arrayElement(users).id,
      hostUserId: faker.helpers.arrayElement(users).id,
    });
  }

  const insertedGameSessions = await db.insert(schema.gameSessions).values(gameSessions).returning();
  console.log(`   ✅ Создано ${insertedGameSessions.length} игровых сессий`);
  return insertedGameSessions;
}

// Функция добавления игроков в сессии
async function createGamePlayers(db: any, gameSessions: any[], users: any[]) {
  const gamePlayers = [];

  for (const session of gameSessions) {
    const playerCount = Math.min(session.maxPlayers, faker.number.int({ min: 2, max: session.maxPlayers }));
    const usedUserIds = new Set(); // Отслеживаем уже добавленных пользователей

    for (let i = 0; i < playerCount; i++) {
      // Выбираем пользователя, которого еще нет в этой сессии
      let selectedUser;
      let attempts = 0;
      do {
        selectedUser = faker.helpers.arrayElement(users);
        attempts++;
      } while (usedUserIds.has(selectedUser.id) && attempts < 10);

      if (attempts >= 10) break; // Избегаем бесконечного цикла

      usedUserIds.add(selectedUser.id);

      gamePlayers.push({
        gameSessionId: session.id,
        userId: selectedUser.id,
        participationStatus: faker.helpers.arrayElement(["registered", "attended", "no_show", "cancelled"]),
      });
    }
  }

  const insertedGamePlayers = await db.insert(schema.gamePlayers).values(gamePlayers).returning();
  console.log(`   ✅ Добавлено ${insertedGamePlayers.length} игроков в сессии`);
  return insertedGamePlayers;
}

// Функция создания изменений рейтинга
async function createRatingChanges(db: any, users: any[], gameSessions: any[]) {
  const ratingChanges = [];

  const completedSessions = gameSessions.filter(s => s.status === "completed");

  for (const session of completedSessions) {
    // Создаем изменения рейтинга для 2-4 игроков
    const playerCount = faker.number.int({ min: 2, max: 4 });

    for (let i = 0; i < playerCount; i++) {
      const oldRating = faker.number.float({ min: 1200, max: 2000 });
      const change = faker.number.float({ min: -50, max: 50 });
      const newRating = oldRating + change;

      ratingChanges.push({
        userId: faker.helpers.arrayElement(users).id,
        oldRating,
        newRating,
        changeAmount: change,
        changeReason: "game_session",
        relatedGameSessionId: session.id,
      });
    }
  }

  if (ratingChanges.length === 0) {
    console.log(`   ⚠️  Нет завершенных сессий для создания изменений рейтинга`);
    return [];
  }

  const insertedRatingChanges = await db.insert(schema.ratingChanges).values(ratingChanges).returning();
  console.log(`   ✅ Создано ${insertedRatingChanges.length} изменений рейтинга`);
  return insertedRatingChanges;
}

// Функция создания турниров
async function createTournaments(db: any, venues: any[]) {
  const tournaments = [];

  for (let i = 0; i < 10; i++) {
    const startDate = faker.date.future();
    const endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 дней

    tournaments.push({
      name: `Турнир ${faker.company.name()}`,
      description: faker.lorem.paragraph(),
      venueId: faker.helpers.arrayElement(venues).id,
      startDate,
      endDate,
      registrationDeadline: new Date(startDate.getTime() - 3 * 24 * 60 * 60 * 1000), // -3 дня
      maxParticipants: faker.number.int({ min: 16, max: 64 }),
      currentParticipants: 0,
      registrationFee: faker.number.float({ min: 2000, max: 10000 }),
      currency: "RUB",
      prizePool: faker.number.float({ min: 50000, max: 200000 }),
      tournamentType: faker.helpers.arrayElement(["singles_elimination", "doubles_round_robin", "other"]),
      skillLevelCategory: faker.helpers.arrayElement(["beginner", "intermediate", "advanced", "professional"]),
      status: faker.helpers.arrayElement(["upcoming", "registration_open", "in_progress", "completed", "cancelled"]),
      rules: faker.lorem.paragraph(),
    });
  }

  const insertedTournaments = await db.insert(schema.tournaments).values(tournaments).returning();
  console.log(`   ✅ Создано ${insertedTournaments.length} турниров`);
  return insertedTournaments;
}

// Запуск скрипта
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log("🎉 Наполнение базы данных завершено!");
      process.exit(0);
    })
    .catch((error) => {
      console.error("💥 Ошибка:", error);
      process.exit(1);
    });
}
