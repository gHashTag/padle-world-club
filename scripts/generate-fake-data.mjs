#!/usr/bin/env node

/**
 * 🎭 Generator Fake Data для Padle World Club
 * Создаёт реалистичные тестовые данные для демонстрации системы клиенту
 */

import { config } from "dotenv";
import { Pool } from "pg";
import { faker } from "@faker-js/faker";

// Устанавливаем английскую локаль для английских имен
faker.locale = "en";

config();

const DB_CONFIG = {
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
};

class FakeDataGenerator {
  constructor() {
    this.pool = new Pool(DB_CONFIG);
    this.userIds = [];
    this.venueIds = [];
    this.courtIds = [];
    this.gameSessionIds = [];
  }

  async generateAllData() {
    console.log(
      "🎭 Starting fake data generation for Oxygen Padel Club Thailand..."
    );

    try {
      // Очищаем старые данные
      await this.clearOldData();

      // Генерируем данные в правильном порядке (с учетом зависимостей)
      await this.generateVenues(); // 1. Площадки
      await this.generateCourts(); // 2. Корты
      await this.generateUsers(); // 3. Пользователи
      await this.generateBookings(); // 4. Бронирования
      await this.generatePayments(); // 5. Платежи
      await this.generateGameSessions(); // 6. Игровые сессии
      await this.generateTournaments(); // 7. Турниры
      await this.generateProducts(); // 8. Товары
      await this.generateOrders(); // 9. Заказы
      await this.generateFeedback(); // 10. Отзывы
      await this.generateNotifications(); // 11. Уведомления
      await this.generateAILogs(); // 12. AI логи

      console.log("🎊 Data generation completed successfully!");
      await this.printStatistics();
    } catch (error) {
      console.error("❌ Error generating data:", error);
      throw error;
    }
  }

  async clearOldData() {
    console.log("🧹 Clearing old test data...");

    const tables = [
      "ai_suggestion_log",
      "notification",
      "feedback",
      "order_item",
      "order",
      "product",
      "product_category",
      "tournament_match",
      "tournament_team",
      "tournament_participant",
      "tournament",
      "rating_change",
      "game_player",
      "game_session",
      "payment",
      "booking_participant",
      "booking",
      "court",
      "venue",
      "user_account_link",
      "user",
    ];

    for (const table of tables) {
      try {
        await this.pool.query(`DELETE FROM "${table}" WHERE true`);
        console.log(`✅ Cleared table: ${table}`);
      } catch (error) {
        console.warn(`⚠️ Could not clear table ${table}:`, error.message);
      }
    }
  }

  async generateVenues() {
    console.log("🏟️ Generating venues...");

    const venues = [
      {
        name: "Oxygen Padel Club Bangkok",
        address: "123 Sukhumvit Road, Khlong Toei",
        city: "Bangkok",
        country: "Thailand",
        phoneNumber: "+66 2-123-4567",
        email: "bangkok@oxygenpadel.th",
        isActive: true,
      },
      {
        name: "Oxygen Padel Phuket",
        address: "456 Patong Beach Road, Kathu",
        city: "Phuket",
        country: "Thailand",
        phoneNumber: "+66 76-234-567",
        email: "phuket@oxygenpadel.th",
        isActive: true,
      },
      {
        name: "Oxygen Padel Chiang Mai",
        address: "789 Nimmanhaemin Road, Suthep",
        city: "Chiang Mai",
        country: "Thailand",
        phoneNumber: "+66 53-345-678",
        email: "chiangmai@oxygenpadel.th",
        isActive: true,
      },
    ];

    for (const venue of venues) {
      const result = await this.pool.query(
        `
        INSERT INTO venue (name, address, city, country, phone_number, email, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
      `,
        [
          venue.name,
          venue.address,
          venue.city,
          venue.country,
          venue.phoneNumber,
          venue.email,
          venue.isActive,
        ]
      );

      this.venueIds.push(result.rows[0].id);
    }

    console.log(`✅ Created ${venues.length} venues`);
  }

  async generateCourts() {
    console.log("🎾 Generating courts...");

    let courtCount = 0;
    for (const venueId of this.venueIds) {
      const courtsPerVenue = faker.number.int({ min: 4, max: 8 });

      for (let i = 1; i <= courtsPerVenue; i++) {
        const result = await this.pool.query(
          `
          INSERT INTO court (venue_id, name, court_type, hourly_rate, is_active)
          VALUES ($1, $2, $3, $4, $5)
          RETURNING id
        `,
          [
            venueId,
            `Court ${i}`,
            faker.helpers.arrayElement(["paddle", "tennis"]),
            faker.number.int({ min: 800, max: 2000 }), // Thai Baht prices
            true,
          ]
        );

        this.courtIds.push(result.rows[0].id);
        courtCount++;
      }
    }

    console.log(`✅ Created ${courtCount} courts`);
  }

  async generateUsers() {
    console.log("👥 Generating users...");

    const users = [];
    for (let i = 0; i < 80; i++) {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();

      users.push({
        username: faker.internet
          .username({ firstName, lastName })
          .toLowerCase(),
        passwordHash:
          "$2b$10$" + faker.string.hexadecimal({ length: 53 }).substring(2),
        firstName,
        lastName,
        email: faker.internet.email({
          firstName,
          lastName,
          provider: "oxygenpadel.th",
        }),
        phone: faker.phone.number("+66 #-###-####"),
        memberId: `OXY${faker.number.int({ min: 10000, max: 99999 })}`,
        userRole: faker.helpers.arrayElement([
          "player",
          "coach",
          "club_staff",
          "admin",
        ]),
        currentRating: faker.number.int({ min: 1000, max: 2500 }),
        bonusPoints: faker.number.int({ min: 0, max: 1000 }),
        profileImageUrl: faker.image.avatar(),
        gender: faker.helpers.arrayElement(["male", "female", "other"]),
        dateOfBirth: faker.date.between({
          from: "1970-01-01",
          to: "2005-01-01",
        }),
        homeVenueId: faker.helpers.arrayElement(this.venueIds),
        isAccountVerified: faker.datatype.boolean({ probability: 0.85 }),
        lastLoginAt: faker.date.recent({ days: 7 }),
        lastActivityAt: faker.date.recent({ days: 3 }),
      });
    }

    for (const user of users) {
      const result = await this.pool.query(
        `
        INSERT INTO "user" (
          username, password_hash, first_name, last_name, email, phone, member_id,
          user_role, current_rating, bonus_points, profile_image_url, gender,
          date_of_birth, home_venue_id, is_account_verified, last_login_at, last_activity_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        RETURNING id
      `,
        [
          user.username,
          user.passwordHash,
          user.firstName,
          user.lastName,
          user.email,
          user.phone,
          user.memberId,
          user.userRole,
          user.currentRating,
          user.bonusPoints,
          user.profileImageUrl,
          user.gender,
          user.dateOfBirth,
          user.homeVenueId,
          user.isAccountVerified,
          user.lastLoginAt,
          user.lastActivityAt,
        ]
      );

      this.userIds.push(result.rows[0].id);
    }

    console.log(`✅ Created ${users.length} users`);
  }

  async generateBookings() {
    console.log("📅 Generating bookings...");

    const bookings = [];
    for (let i = 0; i < 120; i++) {
      const startTime = faker.date.between({
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        to: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days forward
      });

      const endTime = new Date(startTime.getTime() + 90 * 60 * 1000); // +90 minutes
      const durationMinutes = 90;

      bookings.push({
        courtId: faker.helpers.arrayElement(this.courtIds),
        startTime,
        endTime,
        durationMinutes,
        status: faker.helpers.arrayElement([
          "confirmed",
          "pending_payment",
          "cancelled",
          "completed",
        ]),
        totalAmount: faker.number.int({ min: 800, max: 2500 }), // Thai Baht
        currency: "THB",
        bookedByUserId: faker.helpers.arrayElement(this.userIds),
        bookingPurpose: faker.helpers.arrayElement([
          "free_play",
          "group_training",
          "private_training",
          "tournament_match",
          "other",
        ]),
        relatedEntityId: null,
        notes: faker.datatype.boolean({ probability: 0.3 })
          ? faker.lorem.sentence()
          : null,
      });
    }

    for (const booking of bookings) {
      await this.pool.query(
        `
        INSERT INTO booking (
          court_id, start_time, end_time, duration_minutes, status, total_amount,
          currency, booked_by_user_id, booking_purpose, related_entity_id, notes
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      `,
        [
          booking.courtId,
          booking.startTime,
          booking.endTime,
          booking.durationMinutes,
          booking.status,
          booking.totalAmount,
          booking.currency,
          booking.bookedByUserId,
          booking.bookingPurpose,
          booking.relatedEntityId,
          booking.notes,
        ]
      );
    }

    console.log(`✅ Created ${bookings.length} bookings`);
  }

  async generatePayments() {
    console.log("💰 Generating payments...");

    // Create general payments (not tied to specific bookings)
    for (let i = 0; i < 60; i++) {
      await this.pool.query(
        `
        INSERT INTO payment (
          user_id, amount, currency, status, payment_method, gateway_transaction_id,
          description, related_booking_participant_id, related_order_id, related_user_training_package_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `,
        [
          faker.helpers.arrayElement(this.userIds),
          faker.number.int({ min: 500, max: 5000 }),
          "THB",
          faker.helpers.arrayElement([
            "success",
            "failed",
            "pending",
            "refunded",
            "partial",
          ]),
          faker.helpers.arrayElement([
            "card",
            "cash",
            "bank_transfer",
            "bonus_points",
          ]),
          `TXN_${faker.string.uuid()}`,
          faker.lorem.sentence(),
          null, // related_booking_participant_id
          null, // related_order_id
          null, // related_user_training_package_id
        ]
      );
    }

    console.log(`✅ Created 60 payments`);
  }

  async generateGameSessions() {
    console.log("🎮 Generating game sessions...");

    for (let i = 0; i < 100; i++) {
      const startTime = faker.date.recent({ days: 30 });
      const endTime = new Date(startTime.getTime() + 90 * 60 * 1000);

      const result = await this.pool.query(
        `
        INSERT INTO game_session (
          venue_id, court_id, start_time, end_time, game_type, needed_skill_level,
          max_players, current_players, status, created_by_user_id, host_user_id,
          match_score, winner_user_ids, related_booking_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        RETURNING id
      `,
        [
          faker.helpers.arrayElement(this.venueIds),
          faker.helpers.arrayElement(this.courtIds),
          startTime,
          endTime,
          faker.helpers.arrayElement(["public_match", "private_match"]),
          faker.helpers.arrayElement([
            "beginner",
            "intermediate",
            "advanced",
            "pro",
            "professional",
          ]),
          4,
          faker.number.int({ min: 0, max: 4 }),
          faker.helpers.arrayElement([
            "open_for_players",
            "full",
            "in_progress",
            "completed",
            "cancelled",
          ]),
          faker.helpers.arrayElement(this.userIds),
          faker.helpers.arrayElement(this.userIds),
          `${faker.number.int({ min: 0, max: 6 })}-${faker.number.int({
            min: 0,
            max: 6,
          })}`,
          null, // winner_user_ids array
          null, // related_booking_id
        ]
      );

      this.gameSessionIds.push(result.rows[0].id);

      // Add players to session
      const playersCount = faker.number.int({ min: 2, max: 4 });
      const selectedPlayers = faker.helpers.arrayElements(
        this.userIds,
        playersCount
      );

      for (const userId of selectedPlayers) {
        await this.pool.query(
          `
          INSERT INTO game_player (
            game_session_id, user_id, participation_status
          ) VALUES ($1, $2, $3)
        `,
          [
            result.rows[0].id,
            userId,
            faker.helpers.arrayElement([
              "registered",
              "attended",
              "no_show",
              "cancelled",
            ]),
          ]
        );
      }
    }

    console.log(`✅ Created ${this.gameSessionIds.length} game sessions`);
  }

  async generateTournaments() {
    console.log("🏆 Generating tournaments...");

    const tournaments = [
      {
        name: "Oxygen Thailand Open 2024",
        description: "Annual national padel tournament",
        startDate: new Date("2024-03-15"),
        endDate: new Date("2024-03-17"),
        type: "singles_elimination",
        status: "completed",
      },
      {
        name: "Bangkok Padel Championship",
        description: "City championship for all skill levels",
        startDate: new Date("2024-04-20"),
        endDate: new Date("2024-04-21"),
        type: "doubles_round_robin",
        status: "upcoming",
      },
      {
        name: "Phuket Beach Padel Cup",
        description: "Summer tournament on beach courts",
        startDate: new Date("2024-06-10"),
        endDate: new Date("2024-06-12"),
        type: "singles_elimination",
        status: "registration_open",
      },
      {
        name: "Chiang Mai Mountain Cup",
        description: "Mountain city padel tournament",
        startDate: new Date("2024-07-05"),
        endDate: new Date("2024-07-07"),
        type: "doubles_round_robin",
        status: "upcoming",
      },
    ];

    for (const tournament of tournaments) {
      const result = await this.pool.query(
        `
        INSERT INTO tournament (
          venue_id, name, description, tournament_type, skill_level_category,
          start_date, end_date, registration_fee, currency, max_participants, status, rules_url
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        RETURNING id
      `,
        [
          faker.helpers.arrayElement(this.venueIds),
          tournament.name,
          tournament.description,
          tournament.type,
          faker.helpers.arrayElement([
            "beginner",
            "intermediate",
            "advanced",
            "pro",
            "professional",
          ]),
          tournament.startDate,
          tournament.endDate,
          faker.number.int({ min: 1000, max: 3000 }), // Thai Baht
          "THB",
          16,
          tournament.status,
          null, // rules_url
        ]
      );

      // Add tournament participants
      const participantsCount = faker.number.int({ min: 8, max: 16 });
      const selectedParticipants = faker.helpers.arrayElements(
        this.userIds,
        participantsCount
      );

      for (const userId of selectedParticipants) {
        await this.pool.query(
          `
          INSERT INTO tournament_participant (
            tournament_id, user_id, registration_date, status, partner_user_id, team_id
          ) VALUES ($1, $2, $3, $4, $5, $6)
        `,
          [
            result.rows[0].id,
            userId,
            faker.date.recent({ days: 30 }),
            faker.helpers.arrayElement([
              "registered",
              "checked_in",
              "withdrawn",
            ]),
            null, // partner_user_id
            null, // team_id
          ]
        );
      }
    }

    console.log(`✅ Created ${tournaments.length} tournaments`);
  }

  async generateProducts() {
    console.log("🎯 Generating products...");

    // Create categories first
    const categories = [
      {
        name: "Rackets",
        description: "Professional padel rackets",
        type: "court_gear",
      },
      {
        name: "Apparel",
        description: "Sports clothing and shoes",
        type: "apparel",
      },
      {
        name: "Accessories",
        description: "Balls, bags and other accessories",
        type: "court_gear",
      },
      {
        name: "Drinks",
        description: "Sports drinks and beverages",
        type: "drinks",
      },
    ];

    const categoryIds = [];
    for (const category of categories) {
      const result = await this.pool.query(
        `
        INSERT INTO product_category (name, description, type)
        VALUES ($1, $2, $3)
        RETURNING id
      `,
        [category.name, category.description, category.type]
      );

      categoryIds.push(result.rows[0].id);
    }

    // Create products
    const products = [
      { name: "Bullpadel Vertex Racket", price: 8500, category: 0 },
      { name: "Head Alpha Pro", price: 7200, category: 0 },
      { name: "Nike Dri-FIT Shirt", price: 1800, category: 1 },
      { name: "Adidas Shorts", price: 2200, category: 1 },
      { name: "Padel Court Shoes", price: 4500, category: 1 },
      { name: "Padel Balls (3 pack)", price: 450, category: 2 },
      { name: "Racket Bag", price: 1400, category: 2 },
      { name: "Energy Drink", price: 120, category: 3 },
      { name: "Protein Shake", price: 180, category: 3 },
      { name: "Sports Water", price: 50, category: 3 },
    ];

    for (const product of products) {
      await this.pool.query(
        `
        INSERT INTO product (
          category_id, name, description, price, currency, current_stock, reorder_threshold, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      `,
        [
          categoryIds[product.category],
          product.name,
          faker.lorem.sentence(),
          product.price,
          "THB",
          faker.number.int({ min: 0, max: 50 }),
          faker.number.int({ min: 5, max: 15 }),
          true,
        ]
      );
    }

    console.log(
      `✅ Created ${categories.length} categories and ${products.length} products`
    );
  }

  async generateOrders() {
    console.log("🛒 Generating orders...");

    const productsResult = await this.pool.query(
      "SELECT id, price FROM product"
    );
    const products = productsResult.rows;

    for (let i = 0; i < 40; i++) {
      const orderResult = await this.pool.query(
        `
        INSERT INTO "order" (
          user_id, order_date, total_amount, currency, status, payment_id
        ) VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id
      `,
        [
          faker.helpers.arrayElement(this.userIds),
          faker.date.recent({ days: 60 }),
          0, // Will be recalculated after adding items
          "THB",
          faker.helpers.arrayElement([
            "pending",
            "completed",
            "cancelled",
            "refunded",
          ]),
          null, // payment_id
        ]
      );

      const orderId = orderResult.rows[0].id;
      let totalAmount = 0;

      // Add items to order
      const itemsCount = faker.number.int({ min: 1, max: 4 });
      const selectedProducts = faker.helpers.arrayElements(
        products,
        itemsCount
      );

      for (const product of selectedProducts) {
        const quantity = faker.number.int({ min: 1, max: 3 });
        const itemTotal = product.price * quantity;
        totalAmount += itemTotal;

        await this.pool.query(
          `
          INSERT INTO order_item (
            order_id, product_id, quantity, unit_price_at_sale
          ) VALUES ($1, $2, $3, $4)
        `,
          [orderId, product.id, quantity, product.price]
        );
      }

      // Update total order amount
      await this.pool.query(
        `
        UPDATE "order" SET total_amount = $1 WHERE id = $2
      `,
        [totalAmount, orderId]
      );
    }

    console.log(`✅ Created 40 orders with items`);
  }

  async generateFeedback() {
    console.log("💭 Generating feedback...");

    const feedbackCategories = [
      "court_quality",
      "game_experience",
      "training_quality",
      "staff_service",
      "system_suggestion",
      "other",
    ];
    const feedbacks = [];

    for (let i = 0; i < 50; i++) {
      feedbacks.push({
        userId: faker.helpers.arrayElement(this.userIds),
        venueId: faker.helpers.arrayElement(this.venueIds),
        category: faker.helpers.arrayElement(feedbackCategories),
        rating: faker.number.int({ min: 1, max: 5 }),
        comment: faker.lorem.sentences(faker.number.int({ min: 1, max: 3 })),
        status: "new",
        resolvedByUserId: null,
      });
    }

    for (const feedback of feedbacks) {
      await this.pool.query(
        `
        INSERT INTO feedback (
          user_id, venue_id, category, rating, comment, status, resolved_by_user_id
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,
        [
          feedback.userId,
          feedback.venueId,
          feedback.category,
          feedback.rating,
          feedback.comment,
          feedback.status,
          feedback.resolvedByUserId,
        ]
      );
    }

    console.log(`✅ Created ${feedbacks.length} feedbacks`);
  }

  async generateNotifications() {
    console.log("🔔 Generating notifications...");

    const notificationTypes = [
      "booking_reminder",
      "game_invite",
      "tournament_update",
      "payment_confirmation",
      "package_expiration",
      "custom_message",
      "stock_alert",
    ];

    for (let i = 0; i < 120; i++) {
      await this.pool.query(
        `
        INSERT INTO notification (
          user_id, type, message, channel, is_sent, sent_at, is_read, read_at,
          related_entity_id, related_entity_type
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `,
        [
          faker.helpers.arrayElement(this.userIds),
          faker.helpers.arrayElement(notificationTypes),
          faker.lorem.sentences(2),
          faker.helpers.arrayElement([
            "whatsapp",
            "telegram",
            "email",
            "app_push",
          ]),
          faker.datatype.boolean({ probability: 0.8 }),
          faker.datatype.boolean({ probability: 0.8 })
            ? faker.date.recent({ days: 30 })
            : null,
          faker.datatype.boolean({ probability: 0.7 }),
          faker.datatype.boolean({ probability: 0.7 })
            ? faker.date.recent({ days: 7 })
            : null,
          null, // related_entity_id
          null, // related_entity_type
        ]
      );
    }

    console.log(`✅ Created 120 notifications`);
  }

  async generateAILogs() {
    console.log("🤖 Generating AI logs...");

    const suggestionTypes = [
      "game_matching",
      "court_fill_optimization",
      "demand_prediction",
      "rating_update",
    ];

    for (let i = 0; i < 80; i++) {
      await this.pool.query(
        `
        INSERT INTO ai_suggestion_log (
          user_id, suggestion_type, input_data, suggestion_data, confidence_score,
          was_accepted, user_feedback, execution_time_ms, model_version, context_data
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `,
        [
          faker.helpers.arrayElement(this.userIds),
          faker.helpers.arrayElement(suggestionTypes),
          JSON.stringify({
            userSkill: faker.helpers.arrayElement([
              "beginner",
              "intermediate",
              "advanced",
            ]),
            preferredTime: faker.helpers.arrayElement([
              "morning",
              "afternoon",
              "evening",
            ]),
            lastGames: faker.number.int({ min: 0, max: 20 }),
          }),
          JSON.stringify({
            recommendation: faker.lorem.sentence(),
            confidence: faker.number.float({
              min: 0.5,
              max: 1.0,
              precision: 0.01,
            }),
            alternatives: faker.lorem.words(3).split(" "),
          }),
          faker.number.float({ min: 0.5, max: 1.0, precision: 0.001 }),
          faker.datatype.boolean({ probability: 0.6 }),
          faker.datatype.boolean({ probability: 0.4 })
            ? faker.lorem.sentence()
            : null,
          faker.number.int({ min: 50, max: 500 }),
          `v${faker.number.int({
            min: 1,
            max: 3,
          })}.${faker.number.int({
            min: 0,
            max: 9,
          })}.${faker.number.int({ min: 0, max: 9 })}`,
          JSON.stringify({
            sessionId: faker.string.uuid(),
            timestamp: faker.date.recent({ days: 1 }).toISOString(),
            feature_flags: ["recommend_partners", "optimize_schedule"],
          }),
        ]
      );
    }

    console.log(`✅ Created 80 AI logs`);
  }

  async printStatistics() {
    console.log("\n📊 STATISTICS OF CREATED DATA:");

    const tables = [
      "venue",
      "court",
      "user",
      "booking",
      "payment",
      "game_session",
      "tournament",
      "product",
      "order",
      "feedback",
      "notification",
      "ai_suggestion_log",
    ];

    for (const table of tables) {
      try {
        const result = await this.pool.query(
          `SELECT COUNT(*) as count FROM "${table}"`
        );
        const count = result.rows[0].count;
        const icon = this.getTableIcon(table);
        console.log(`${icon} ${table}: ${count} records`);
      } catch (error) {
        console.log(`❌ ${table}: error counting`);
      }
    }

    console.log("\n🎊 Database is ready for client demonstration!");
  }

  getTableIcon(tableName) {
    const icons = {
      venue: "🏟️",
      court: "🎾",
      user: "👥",
      booking: "📅",
      payment: "💰",
      game_session: "🎮",
      tournament: "🏆",
      product: "🎯",
      order: "🛒",
      feedback: "💭",
      notification: "🔔",
      ai_suggestion_log: "🤖",
    };
    return icons[tableName] || "📊";
  }

  async close() {
    await this.pool.end();
  }
}

// Запуск генерации
async function main() {
  const generator = new FakeDataGenerator();

  try {
    await generator.generateAllData();
  } catch (error) {
    console.error("❌ Critical error:", error);
    process.exit(1);
  } finally {
    await generator.close();
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { FakeDataGenerator };
