import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import {
  BonusActivityService,
  BonusActivityConfig,
} from "../../../services/bonus-activity-service";
import { UserRepository } from "../../../repositories/user-repository";
import * as schema from "../../../db/schema";
import { randomUUID } from "crypto";

const connectionString = process.env.DATABASE_URL!;
const sql = postgres(connectionString, { max: 1 });
const db = drizzle(sql, { schema });

describe("BonusActivityService", () => {
  let bonusActivityService: BonusActivityService;
  let userRepository: UserRepository;
  let testUserId: string;
  let testConfig: BonusActivityConfig;

  beforeEach(async () => {
    // Применяем миграции
    await migrate(db, { migrationsFolder: "./drizzle_migrations" });

    // Очищаем таблицы
    await db.delete(schema.bonusTransactions);
    await db.delete(schema.users);

    // Инициализируем репозитории и сервис
    userRepository = new UserRepository(db);

    testConfig = {
      gameParticipation: 10,
      gameWin: 25,
      tournamentParticipation: 50,
      tournamentWin: 200,
      classAttendance: 15,
      referralBonus: 100,
      reviewBonus: 20,
      birthdayBonus: 100,
      loyaltyBonus: 50,
      firstBookingBonus: 30,
    };

    bonusActivityService = new BonusActivityService(db, testConfig);

    // Создаем тестового пользователя
    const testUser = await userRepository.create({
      username: "testuser",
      email: "test@example.com",
      firstName: "Test",
      lastName: "User",
      userRole: "player",
      passwordHash: "test-hash",
      memberId: "test-member-id",
    });
    testUserId = testUser.id;
  });

  afterEach(async () => {
    // Очищаем таблицы после каждого теста
    await db.delete(schema.bonusTransactions);
    await db.delete(schema.users);
  });

  describe("awardGameParticipationBonus", () => {
    it("должен начислить бонусы за участие в игре", async () => {
      const gameSessionId = randomUUID();

      const bonusTransaction =
        await bonusActivityService.awardGameParticipationBonus(
          testUserId,
          gameSessionId,
          false
        );

      expect(bonusTransaction).toBeDefined();
      expect(bonusTransaction.pointsChange).toBe(10);
      expect(bonusTransaction.description).toContain("участие в игре");

      const balance = await userRepository.getBonusBalance(testUserId);
      expect(balance).toBe(10);
    });

    it("должен начислить дополнительные бонусы за победу в игре", async () => {
      const gameSessionId = randomUUID();

      const bonusTransaction =
        await bonusActivityService.awardGameParticipationBonus(
          testUserId,
          gameSessionId,
          true
        );

      expect(bonusTransaction).toBeDefined();
      expect(bonusTransaction.pointsChange).toBe(35); // 10 + 25
      expect(bonusTransaction.description).toContain("победу в игре");

      const balance = await userRepository.getBonusBalance(testUserId);
      expect(balance).toBe(35);
    });
  });

  describe("awardTournamentParticipationBonus", () => {
    it("должен начислить бонусы за участие в турнире", async () => {
      const tournamentId = randomUUID();

      const bonusTransaction =
        await bonusActivityService.awardTournamentParticipationBonus(
          testUserId,
          tournamentId,
          false
        );

      expect(bonusTransaction).toBeDefined();
      expect(bonusTransaction.pointsChange).toBe(50);
      expect(bonusTransaction.description).toContain("участие в турнире");

      const balance = await userRepository.getBonusBalance(testUserId);
      expect(balance).toBe(50);
    });

    it("должен начислить дополнительные бонусы за победу в турнире", async () => {
      const tournamentId = randomUUID();

      const bonusTransaction =
        await bonusActivityService.awardTournamentParticipationBonus(
          testUserId,
          tournamentId,
          true
        );

      expect(bonusTransaction).toBeDefined();
      expect(bonusTransaction.pointsChange).toBe(250); // 50 + 200
      expect(bonusTransaction.description).toContain("победу в турнире");

      const balance = await userRepository.getBonusBalance(testUserId);
      expect(balance).toBe(250);
    });
  });

  describe("awardClassAttendanceBonus", () => {
    it("должен начислить бонусы за посещение класса", async () => {
      const classScheduleId = randomUUID();

      const bonusTransaction =
        await bonusActivityService.awardClassAttendanceBonus(
          testUserId,
          classScheduleId
        );

      expect(bonusTransaction).toBeDefined();
      expect(bonusTransaction.pointsChange).toBe(15);
      expect(bonusTransaction.description).toContain("посещение тренировки");

      const balance = await userRepository.getBonusBalance(testUserId);
      expect(balance).toBe(15);
    });
  });

  describe("awardReferralBonus", () => {
    it("должен начислить бонусы за приведение друга", async () => {
      const newUserId = randomUUID();

      const bonusTransaction = await bonusActivityService.awardReferralBonus(
        testUserId,
        newUserId
      );

      expect(bonusTransaction).toBeDefined();
      expect(bonusTransaction.pointsChange).toBe(100);
      expect(bonusTransaction.description).toContain("приведение друга");
      expect(bonusTransaction.description).toContain(newUserId);

      const balance = await userRepository.getBonusBalance(testUserId);
      expect(balance).toBe(100);
    });
  });

  describe("awardReviewBonus", () => {
    it("должен начислить бонусы за написание отзыва", async () => {
      const feedbackId = randomUUID();

      const bonusTransaction = await bonusActivityService.awardReviewBonus(
        testUserId,
        feedbackId
      );

      expect(bonusTransaction).toBeDefined();
      expect(bonusTransaction.pointsChange).toBe(20);
      expect(bonusTransaction.description).toContain("написание отзыва");

      const balance = await userRepository.getBonusBalance(testUserId);
      expect(balance).toBe(20);
    });
  });

  describe("awardBirthdayBonus", () => {
    it("должен начислить бонусы в день рождения", async () => {
      const bonusTransaction = await bonusActivityService.awardBirthdayBonus(
        testUserId
      );

      expect(bonusTransaction).toBeDefined();
      expect(bonusTransaction.pointsChange).toBe(100);
      expect(bonusTransaction.description).toContain("дня рождения");
      expect(bonusTransaction.expiresAt).toBeDefined();

      const balance = await userRepository.getBonusBalance(testUserId);
      expect(balance).toBe(100);
    });

    it("не должен начислить бонусы повторно в том же году", async () => {
      // Первое начисление
      await bonusActivityService.awardBirthdayBonus(testUserId);

      // Попытка повторного начисления
      const secondBonus = await bonusActivityService.awardBirthdayBonus(
        testUserId
      );

      expect(secondBonus).toBeNull();

      const balance = await userRepository.getBonusBalance(testUserId);
      expect(balance).toBe(100); // Только одно начисление
    });
  });

  describe("awardLoyaltyBonus", () => {
    it("должен начислить бонусы за лояльность", async () => {
      const bonusTransaction = await bonusActivityService.awardLoyaltyBonus(
        testUserId
      );

      expect(bonusTransaction).toBeDefined();
      expect(bonusTransaction.pointsChange).toBe(50);
      expect(bonusTransaction.description).toContain("лояльность");
      expect(bonusTransaction.expiresAt).toBeDefined();

      const balance = await userRepository.getBonusBalance(testUserId);
      expect(balance).toBe(50);
    });

    it("не должен начислить бонусы повторно в том же месяце", async () => {
      // Первое начисление
      await bonusActivityService.awardLoyaltyBonus(testUserId);

      // Попытка повторного начисления
      const secondBonus = await bonusActivityService.awardLoyaltyBonus(
        testUserId
      );

      expect(secondBonus).toBeNull();

      const balance = await userRepository.getBonusBalance(testUserId);
      expect(balance).toBe(50); // Только одно начисление
    });
  });

  describe("awardFirstBookingBonus", () => {
    it("должен начислить бонусы за первое бронирование", async () => {
      const bookingId = randomUUID();

      const bonusTransaction =
        await bonusActivityService.awardFirstBookingBonus(
          testUserId,
          bookingId
        );

      expect(bonusTransaction).toBeDefined();
      expect(bonusTransaction.pointsChange).toBe(30);
      expect(bonusTransaction.description).toContain("первое бронирование");

      const balance = await userRepository.getBonusBalance(testUserId);
      expect(balance).toBe(30);
    });

    it("не должен начислить бонусы за повторное бронирование", async () => {
      // Первое бронирование
      await bonusActivityService.awardFirstBookingBonus(
        testUserId,
        randomUUID()
      );

      // Попытка начисления за второе бронирование
      const secondBonus = await bonusActivityService.awardFirstBookingBonus(
        testUserId,
        randomUUID()
      );

      expect(secondBonus).toBeNull();

      const balance = await userRepository.getBonusBalance(testUserId);
      expect(balance).toBe(30); // Только одно начисление
    });
  });

  describe("processMultipleActivities", () => {
    it("должен обработать множественные активности", async () => {
      const activities = [
        { type: "game" as const, relatedId: randomUUID(), isWinner: false },
        { type: "class" as const, relatedId: randomUUID() },
        { type: "review" as const, relatedId: randomUUID() },
        { type: "birthday" as const },
      ];

      const results = await bonusActivityService.processMultipleActivities(
        testUserId,
        activities
      );

      expect(results).toHaveLength(4);

      const balance = await userRepository.getBonusBalance(testUserId);
      expect(balance).toBe(145); // 10 + 15 + 20 + 100

      const history = await userRepository.getBonusHistory(testUserId, 10);
      expect(history).toHaveLength(4);
    });

    it("должен пропустить активности с недостающими данными", async () => {
      const activities = [
        { type: "game" as const }, // Нет relatedId
        { type: "referral" as const }, // Нет newUserId
        { type: "class" as const, relatedId: randomUUID() }, // Корректная активность
      ];

      const results = await bonusActivityService.processMultipleActivities(
        testUserId,
        activities
      );

      expect(results).toHaveLength(1); // Только одна корректная активность

      const balance = await userRepository.getBonusBalance(testUserId);
      expect(balance).toBe(15); // Только за класс
    });
  });

  describe("configuration", () => {
    it("должен получить текущую конфигурацию", () => {
      const config = bonusActivityService.getConfig();

      expect(config).toEqual(testConfig);
      expect(config.gameParticipation).toBe(10);
      expect(config.tournamentWin).toBe(200);
    });

    it("должен обновить конфигурацию", async () => {
      const newConfig = {
        gameParticipation: 20,
        gameWin: 50,
      };

      bonusActivityService.updateConfig(newConfig);

      const updatedConfig = bonusActivityService.getConfig();
      expect(updatedConfig.gameParticipation).toBe(20);
      expect(updatedConfig.gameWin).toBe(50);
      expect(updatedConfig.tournamentParticipation).toBe(50); // Не изменилось

      // Проверяем, что новая конфигурация применяется
      const bonusTransaction =
        await bonusActivityService.awardGameParticipationBonus(
          testUserId,
          randomUUID(),
          false
        );

      expect(bonusTransaction.pointsChange).toBe(20); // Новое значение
    });
  });
});
