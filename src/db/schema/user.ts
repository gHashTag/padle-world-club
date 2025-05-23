import {
  pgTable,
  uuid,
  varchar,
  text,
  integer,
  real,
  boolean,
  timestamp,
  date,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { userRoleEnum, genderEnum } from "./enums";
// import { venue } from "./venue"; // Пока закомментировано, т.к. venue еще не создана
import { userAccountLinks } from "./userAccountLink";

export const users = pgTable("user", {
  // Имя таблицы 'user' как в MAIN_MODEL.mdc SQL
  id: uuid("id").defaultRandom().primaryKey(),
  username: varchar("username", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 50 }).unique(),
  memberId: varchar("member_id", { length: 50 }).notNull().unique(),
  userRole: userRoleEnum("user_role").notNull(),
  currentRating: real("current_rating").default(1500.0).notNull(),
  bonusPoints: integer("bonus_points").default(0).notNull(),
  profileImageUrl: text("profile_image_url"),
  gender: genderEnum("gender"), // В SQL модели было gender_type, но в TS модели gender. Оставляю gender.
  dateOfBirth: date("date_of_birth"),
  homeVenueId: uuid("home_venue_id"), // FK -> Venue. Пока без явной связи.
  // homeVenueId: uuid("home_venue_id").references(() => venue.id, { onDelete: "set null" }),
  isAccountVerified: boolean("is_account_verified").default(false).notNull(),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
  lastActivityAt: timestamp("last_activity_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  // homeVenue: one(venue, {
  //   fields: [users.homeVenueId],
  //   references: [venue.id],
  // }),
  accountLinks: many(userAccountLinks),
}));
