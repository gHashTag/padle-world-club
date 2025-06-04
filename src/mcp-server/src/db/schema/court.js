import { pgTable, uuid, varchar, text, boolean, timestamp, numeric, } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { courtTypeEnum } from "./enums";
import { venues } from "./venue";
export const courts = pgTable("court", {
    id: uuid("id").defaultRandom().primaryKey(),
    venueId: uuid("venue_id")
        .notNull()
        .references(() => venues.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    courtType: courtTypeEnum("court_type").notNull(),
    hourlyRate: numeric("hourly_rate", { precision: 10, scale: 2 }).notNull(),
    description: text("description"),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
        .defaultNow()
        .notNull(),
});
export const courtsRelations = relations(courts, ({ one }) => ({
    venue: one(venues, {
        fields: [courts.venueId],
        references: [venues.id],
    }),
}));
