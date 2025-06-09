import {
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { notificationChannelEnum } from "./enums";
import { users } from "./user";

export const userAccountLinks = pgTable(
  "user_account_link",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    platform: notificationChannelEnum("platform").notNull(),
    platformUserId: varchar("platform_user_id", { length: 255 }).notNull(),
    isPrimary: boolean("is_primary").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  () => {
    return {
      // Primary key в MAIN_MODEL.mdc был (platform, platform_user_id),
      // но Drizzle лучше работает с одним auto-increment/uuid PK.
      // Уникальность (platform, platform_user_id) обеспечивается отдельным unique constraint в SQL.
      // Здесь мы можем добавить unique constraint через Drizzle позже, если понадобится.
      // Пока оставляем id как PK и добавим UNIQUE (platform, platform_user_id) в миграции, если потребуется.
      // Либо можно сделать композитный ключ так, если очень нужно:
      // pk: primaryKey({ columns: [table.platform, table.platformUserId] }),
      // Но тогда id не нужен как PK. Для простоты пока оставим id.
    };
  }
);

export const userAccountLinksRelations = relations(
  userAccountLinks,
  ({ one }) => ({
    user: one(users, {
      fields: [userAccountLinks.userId],
      references: [users.id],
    }),
  })
);
