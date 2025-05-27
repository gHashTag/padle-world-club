import { pgEnum } from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
  "player",
  "coach",
  "club_staff",
  "admin",
]);

export const userSkillLevelEnum = pgEnum("user_skill_level", [
  "beginner",
  "intermediate",
  "advanced",
  "professional",
]);

export const genderEnum = pgEnum("gender_type", [
  "male",
  "female",
  "other",
  "unknown",
]); // 'gender_type' как в MAIN_MODEL.mdc SQL

export const notificationChannelEnum = pgEnum("notification_channel", [
  "whatsapp",
  "telegram",
  "email",
  "app_push",
]);

export const courtTypeEnum = pgEnum("court_type", [
  "paddle",
  "tennis",
]);

export const bookingStatusEnum = pgEnum("booking_status", [
  "confirmed",
  "pending_payment",
  "cancelled",
  "completed",
]);

export const paymentStatusEnum = pgEnum("payment_status", [
  "success",
  "failed",
  "pending",
  "refunded",
  "partial",
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "card",
  "cash",
  "bank_transfer",
  "bonus_points",
]);

export const bookingPurposeEnum = pgEnum("booking_purpose", [
  "free_play",
  "group_training",
  "private_training",
  "tournament_match",
  "other",
]);

export const classParticipantStatusEnum = pgEnum("class_participant_status", [
  "registered",
  "attended",
  "no_show",
  "cancelled",
]);

export const classTypeEnum = pgEnum("class_type", [
  "group_training",
  "open_play_session",
  "coached_drill",
]);

export const classScheduleStatusEnum = pgEnum("class_schedule_status", [
  "scheduled",
  "cancelled",
  "completed",
  "draft",
]);

export const trainingPackageTypeEnum = pgEnum("training_package_type", [
  "group_training",
  "private_training",
]);

export const userTrainingPackageStatusEnum = pgEnum("user_training_package_status", [
  "active",
  "expired",
  "completed",
  "cancelled",
]);

export const gameSessionStatusEnum = pgEnum("game_session_status", [
  "open_for_players",
  "full",
  "in_progress",
  "completed",
  "cancelled",
]);

export const gameTypeEnum = pgEnum("game_type", [
  "public_match",
  "private_match",
]);

export const ratingChangeReasonEnum = pgEnum("rating_change_reason", [
  "game_session",
  "tournament_match",
  "manual_adjustment",
]);

export const tournamentTypeEnum = pgEnum("tournament_type", [
  "singles_elimination",
  "doubles_round_robin",
  "other",
]);

export const tournamentStatusEnum = pgEnum("tournament_status", [
  "upcoming",
  "registration_open",
  "in_progress",
  "completed",
  "cancelled",
]);

export const tournamentParticipantStatusEnum = pgEnum("tournament_participant_status", [
  "registered",
  "checked_in",
  "withdrawn",
]);

export const stockTransactionTypeEnum = pgEnum("stock_transaction_type", [
  "sale",        // Продажа клиенту
  "purchase",    // Закупка (пополнение склада)
  "adjustment",  // Корректировка (инвентаризация, брак)
  "return"       // Возврат товара от клиента
]);

export const bonusTransactionTypeEnum = pgEnum("bonus_transaction_type", [
  "earned",      // Начислено
  "spent"        // Потрачено
]);

export const externalSystemEnum = pgEnum("external_system", [
  "exporta",
  "google_calendar",
  "whatsapp_api",
  "telegram_api",
  "payment_gateway_api",
  "other"
]);

export const externalEntityMappingTypeEnum = pgEnum("external_entity_mapping_type", [
  "user",
  "booking",
  "court",
  "class",
  "venue",
  "class_schedule",
  "product",
  "training_package_definition"
]);

export const aiSuggestionTypeEnum = pgEnum("ai_suggestion_type", [
  "game_matching",
  "court_fill_optimization",
  "demand_prediction",
  "rating_update"
]);
