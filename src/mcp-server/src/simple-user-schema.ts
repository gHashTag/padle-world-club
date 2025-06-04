/**
 * Simplified User Schema for MCP Server
 */

import { pgTable, uuid, varchar, text, boolean, timestamp, decimal, integer, pgEnum } from "drizzle-orm/pg-core";

// Define enums
export const userRoleEnum = pgEnum("user_role", ["player", "coach", "club_staff", "admin"]);
export const genderEnum = pgEnum("gender", ["male", "female", "other"]);

// Users table
export const users = pgTable("user", {
  id: uuid("id").primaryKey().defaultRandom(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 50 }),
  memberId: varchar("member_id", { length: 50 }).notNull().unique(),
  userRole: userRoleEnum("user_role").notNull().default("player"),
  currentRating: decimal("current_rating", { precision: 10, scale: 2 }).notNull().default("1500.00"),
  bonusPoints: integer("bonus_points").notNull().default(0),
  profileImageUrl: text("profile_image_url"),
  gender: genderEnum("gender"),
  dateOfBirth: timestamp("date_of_birth"),
  homeVenueId: uuid("home_venue_id"),
  isAccountVerified: boolean("is_account_verified").notNull().default(false),
  lastLoginAt: timestamp("last_login_at"),
  lastActivityAt: timestamp("last_activity_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Export types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
