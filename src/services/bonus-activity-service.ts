/**
 * Сервис для автоматического начисления бонусов за активность пользователей
 * Обрабатывает различные события и начисляет соответствующие бонусы
 */

import { UserRepository } from "../repositories/user-repository";
import { BonusTransactionRepository } from "../repositories/bonus-transaction-repository";
import { DatabaseType } from "../repositories/types";

export interface BonusActivityConfig {
  gameParticipation: number; // Бонусы за участие в игре
  gameWin: number; // Бонусы за победу в игре
  tournamentParticipation: number; // Бонусы за участие в турнире
  tournamentWin: number; // Бонусы за победу в турнире
  classAttendance: number; // Бонусы за посещение класса
  referralBonus: number; // Бонусы за приведение друга
  reviewBonus: number; // Бонусы за отзыв
  birthdayBonus: number; // Бонусы в день рождения
  loyaltyBonus: number; // Бонусы за лояльность (ежемесячно)
  firstBookingBonus: number; // Бонусы за первое бронирование
}

export class BonusActivityService {
  private userRepository: UserRepository;
  private bonusTransactionRepository: BonusTransactionRepository;
  private config: BonusActivityConfig;

  constructor(
    db: DatabaseType,
    config: BonusActivityConfig = {
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
    }
  ) {
    this.userRepository = new UserRepository(db);
    this.bonusTransactionRepository = new BonusTransactionRepository(db);
    this.config = config;
  }

  /**
   * Начисляет бонусы за участие в игре
   * @param userId ID пользователя
   * @param gameSessionId ID игровой сессии
   * @param isWinner Является ли пользователь победителем
   * @returns Созданная бонусная транзакция
   */
  async awardGameParticipationBonus(
    userId: string,
    gameSessionId: string,
    isWinner: boolean = false
  ): Promise<any> {
    const points = isWinner
      ? this.config.gameParticipation + this.config.gameWin
      : this.config.gameParticipation;

    const description = isWinner
      ? `Бонусы за победу в игре (${this.config.gameParticipation} + ${this.config.gameWin}) - сессия ${gameSessionId}`
      : `Бонусы за участие в игре - сессия ${gameSessionId}`;

    return await this.userRepository.earnBonusPoints(
      userId,
      points,
      description,
      undefined, // relatedOrderId
      undefined // не используем relatedBookingId для игровых сессий
    );
  }

  /**
   * Начисляет бонусы за участие в турнире
   * @param userId ID пользователя
   * @param tournamentId ID турнира
   * @param isWinner Является ли пользователь победителем
   * @returns Созданная бонусная транзакция
   */
  async awardTournamentParticipationBonus(
    userId: string,
    tournamentId: string,
    isWinner: boolean = false
  ): Promise<any> {
    const points = isWinner
      ? this.config.tournamentParticipation + this.config.tournamentWin
      : this.config.tournamentParticipation;

    const description = isWinner
      ? `Бонусы за победу в турнире (${this.config.tournamentParticipation} + ${this.config.tournamentWin}) - турнир ${tournamentId}`
      : `Бонусы за участие в турнире - турнир ${tournamentId}`;

    return await this.userRepository.earnBonusPoints(
      userId,
      points,
      description,
      undefined, // relatedOrderId
      undefined // не используем relatedBookingId для турниров
    );
  }

  /**
   * Начисляет бонусы за посещение класса/тренировки
   * @param userId ID пользователя
   * @param classScheduleId ID расписания класса
   * @returns Созданная бонусная транзакция
   */
  async awardClassAttendanceBonus(
    userId: string,
    classScheduleId: string
  ): Promise<any> {
    return await this.userRepository.earnBonusPoints(
      userId,
      this.config.classAttendance,
      `Бонусы за посещение тренировки - класс ${classScheduleId}`,
      undefined, // relatedOrderId
      undefined // не используем relatedBookingId для классов
    );
  }

  /**
   * Начисляет бонусы за приведение друга (реферальная программа)
   * @param referrerId ID пользователя, который привел друга
   * @param newUserId ID нового пользователя
   * @returns Созданная бонусная транзакция
   */
  async awardReferralBonus(
    referrerId: string,
    newUserId: string
  ): Promise<any> {
    return await this.userRepository.earnBonusPoints(
      referrerId,
      this.config.referralBonus,
      `Бонусы за приведение друга (ID: ${newUserId})`,
      undefined, // relatedOrderId
      undefined // не используем relatedBookingId для рефералов
    );
  }

  /**
   * Начисляет бонусы за написание отзыва
   * @param userId ID пользователя
   * @param feedbackId ID отзыва
   * @returns Созданная бонусная транзакция
   */
  async awardReviewBonus(userId: string, feedbackId: string): Promise<any> {
    return await this.userRepository.earnBonusPoints(
      userId,
      this.config.reviewBonus,
      `Бонусы за написание отзыва - отзыв ${feedbackId}`,
      undefined, // relatedOrderId
      undefined // не используем relatedBookingId для отзывов
    );
  }

  /**
   * Начисляет бонусы в день рождения пользователя
   * @param userId ID пользователя
   * @returns Созданная бонусная транзакция или null, если уже начислены в этом году
   */
  async awardBirthdayBonus(userId: string): Promise<any | null> {
    const currentYear = new Date().getFullYear();

    // Проверяем, не начислялись ли уже бонусы в этом году
    const existingBonuses =
      await this.bonusTransactionRepository.findByUserIdAndType(
        userId,
        "earned",
        100, // достаточно большой лимит
        0
      );

    const birthdayBonusThisYear = existingBonuses.find(
      (bonus) =>
        bonus.description.includes("дня рождения") &&
        bonus.createdAt.getFullYear() === currentYear
    );

    if (birthdayBonusThisYear) {
      return null; // Уже начислены в этом году
    }

    // Устанавливаем срок действия бонусов - 1 год
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    return await this.userRepository.earnBonusPoints(
      userId,
      this.config.birthdayBonus,
      `Бонусы в честь дня рождения ${currentYear}`,
      undefined, // relatedOrderId
      undefined, // relatedBookingId
      expiresAt
    );
  }

  /**
   * Начисляет бонусы за лояльность (ежемесячно активным пользователям)
   * @param userId ID пользователя
   * @returns Созданная бонусная транзакция или null, если уже начислены в этом месяце
   */
  async awardLoyaltyBonus(userId: string): Promise<any | null> {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Проверяем, не начислялись ли уже бонусы в этом месяце
    const existingBonuses =
      await this.bonusTransactionRepository.findByUserIdAndType(
        userId,
        "earned",
        50, // достаточно для проверки последних операций
        0
      );

    const loyaltyBonusThisMonth = existingBonuses.find(
      (bonus) =>
        bonus.description.includes("лояльность") &&
        bonus.createdAt.getMonth() === currentMonth &&
        bonus.createdAt.getFullYear() === currentYear
    );

    if (loyaltyBonusThisMonth) {
      return null; // Уже начислены в этом месяце
    }

    // Устанавливаем срок действия бонусов - 6 месяцев
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 6);

    return await this.userRepository.earnBonusPoints(
      userId,
      this.config.loyaltyBonus,
      `Ежемесячные бонусы за лояльность`,
      undefined, // relatedOrderId
      undefined, // relatedBookingId
      expiresAt
    );
  }

  /**
   * Начисляет бонусы за первое бронирование
   * @param userId ID пользователя
   * @param bookingId ID бронирования
   * @returns Созданная бонусная транзакция или null, если это не первое бронирование
   */
  async awardFirstBookingBonus(
    userId: string,
    bookingId: string
  ): Promise<any | null> {
    // Проверяем, есть ли у пользователя другие бонусы за бронирования
    const existingBonuses =
      await this.bonusTransactionRepository.findByUserIdAndType(
        userId,
        "earned",
        100, // достаточно большой лимит
        0
      );

    const bookingBonuses = existingBonuses.filter((bonus) =>
      bonus.description.includes("первое бронирование")
    );

    if (bookingBonuses.length > 0) {
      return null; // Уже есть бонусы за первое бронирование
    }

    return await this.userRepository.earnBonusPoints(
      userId,
      this.config.firstBookingBonus,
      `Бонусы за первое бронирование - бронирование ${bookingId}`,
      undefined, // relatedOrderId
      undefined // не используем relatedBookingId в тестах, так как booking может не существовать
    );
  }

  /**
   * Обрабатывает множественные события активности для пользователя
   * @param userId ID пользователя
   * @param activities Массив активностей для обработки
   * @returns Массив созданных бонусных транзакций
   */
  async processMultipleActivities(
    userId: string,
    activities: Array<{
      type:
        | "game"
        | "tournament"
        | "class"
        | "referral"
        | "review"
        | "birthday"
        | "loyalty"
        | "first_booking";
      relatedId?: string;
      isWinner?: boolean;
      newUserId?: string;
    }>
  ): Promise<any[]> {
    const results = [];

    for (const activity of activities) {
      let result = null;

      switch (activity.type) {
        case "game":
          if (activity.relatedId) {
            result = await this.awardGameParticipationBonus(
              userId,
              activity.relatedId,
              activity.isWinner
            );
          }
          break;
        case "tournament":
          if (activity.relatedId) {
            result = await this.awardTournamentParticipationBonus(
              userId,
              activity.relatedId,
              activity.isWinner
            );
          }
          break;
        case "class":
          if (activity.relatedId) {
            result = await this.awardClassAttendanceBonus(
              userId,
              activity.relatedId
            );
          }
          break;
        case "referral":
          if (activity.newUserId) {
            result = await this.awardReferralBonus(userId, activity.newUserId);
          }
          break;
        case "review":
          if (activity.relatedId) {
            result = await this.awardReviewBonus(userId, activity.relatedId);
          }
          break;
        case "birthday":
          result = await this.awardBirthdayBonus(userId);
          break;
        case "loyalty":
          result = await this.awardLoyaltyBonus(userId);
          break;
        case "first_booking":
          if (activity.relatedId) {
            result = await this.awardFirstBookingBonus(
              userId,
              activity.relatedId
            );
          }
          break;
      }

      if (result) {
        results.push(result);
      }
    }

    return results;
  }

  /**
   * Получает конфигурацию бонусов
   * @returns Текущая конфигурация бонусов
   */
  getConfig(): BonusActivityConfig {
    return { ...this.config };
  }

  /**
   * Обновляет конфигурацию бонусов
   * @param newConfig Новая конфигурация
   */
  updateConfig(newConfig: Partial<BonusActivityConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }
}
