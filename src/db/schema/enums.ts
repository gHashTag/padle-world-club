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
  "pro",
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
