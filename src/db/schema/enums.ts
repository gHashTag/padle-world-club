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
