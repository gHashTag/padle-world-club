import { pgTable, uuid, varchar, text, boolean, timestamp, } from "drizzle-orm/pg-core";
export const venues = pgTable("venue", {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull().unique(),
    address: text("address").notNull(),
    city: varchar("city", { length: 100 }).notNull(),
    country: varchar("country", { length: 100 }).notNull(),
    phoneNumber: varchar("phone_number", { length: 50 }),
    email: varchar("email", { length: 255 }),
    isActive: boolean("is_active").default(true).notNull(),
    gCalResourceId: varchar("gcal_resource_id", { length: 255 }),
    createdAt: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
});
// Отношения будут добавлены позже, когда создадим связанные таблицы
// export const venuesRelations = relations(venues, ({ many }) => ({
//   courts: many(courts),
//   users: many(users), // homeVenueId
//   classSchedules: many(classSchedules),
//   gameSessions: many(gameSessions),
//   tournaments: many(tournaments),
// }));
