import {
  pgTable,
  uuid,
  varchar,
  text,
  numeric,
  boolean,
  timestamp,
  unique,
  foreignKey,
  real,
  integer,
  date,
  index,
  jsonb,
  pgEnum,
} from "drizzle-orm/pg-core";

export const aiSuggestionType = pgEnum("ai_suggestion_type", [
  "game_matching",
  "court_fill_optimization",
  "demand_prediction",
  "rating_update",
]);
export const bonusTransactionType = pgEnum("bonus_transaction_type", [
  "earned",
  "spent",
]);
export const bookingPurpose = pgEnum("booking_purpose", [
  "free_play",
  "group_training",
  "private_training",
  "tournament_match",
  "other",
]);
export const bookingStatus = pgEnum("booking_status", [
  "confirmed",
  "pending_payment",
  "cancelled",
  "completed",
]);
export const classParticipantStatus = pgEnum("class_participant_status", [
  "registered",
  "attended",
  "no_show",
  "cancelled",
]);
export const classScheduleStatus = pgEnum("class_schedule_status", [
  "scheduled",
  "cancelled",
  "completed",
  "draft",
]);
export const classType = pgEnum("class_type", [
  "group_training",
  "open_play_session",
  "coached_drill",
]);
export const courtType = pgEnum("court_type", ["paddle", "tennis"]);
export const externalEntityMappingType = pgEnum(
  "external_entity_mapping_type",
  [
    "user",
    "booking",
    "court",
    "class",
    "venue",
    "class_schedule",
    "product",
    "training_package_definition",
  ]
);
export const externalSystem = pgEnum("external_system", [
  "exporta",
  "google_calendar",
  "whatsapp_api",
  "telegram_api",
  "payment_gateway_api",
  "other",
]);
export const feedbackCategory = pgEnum("feedback_category", [
  "court_quality",
  "game_experience",
  "training_quality",
  "staff_service",
  "system_suggestion",
  "other",
]);
export const feedbackStatus = pgEnum("feedback_status", [
  "new",
  "in_review",
  "resolved",
  "archived",
]);
export const gameSessionStatus = pgEnum("game_session_status", [
  "open_for_players",
  "full",
  "in_progress",
  "completed",
  "cancelled",
]);
export const gameType = pgEnum("game_type", ["public_match", "private_match"]);
export const genderType = pgEnum("gender_type", [
  "male",
  "female",
  "other",
  "unknown",
]);
export const notificationChannel = pgEnum("notification_channel", [
  "whatsapp",
  "telegram",
  "email",
  "app_push",
]);
export const notificationType = pgEnum("notification_type", [
  "booking_reminder",
  "game_invite",
  "tournament_update",
  "payment_confirmation",
  "package_expiration",
  "custom_message",
  "stock_alert",
]);
export const orderStatus = pgEnum("order_status", [
  "pending",
  "completed",
  "cancelled",
  "refunded",
]);
export const paymentMethod = pgEnum("payment_method", [
  "card",
  "cash",
  "bank_transfer",
  "bonus_points",
]);
export const paymentStatus = pgEnum("payment_status", [
  "success",
  "failed",
  "pending",
  "refunded",
  "partial",
]);
export const productCategoryType = pgEnum("product_category_type", [
  "court_gear",
  "apparel",
  "drinks",
  "snacks",
  "other",
]);
export const ratingChangeReason = pgEnum("rating_change_reason", [
  "game_session",
  "tournament_match",
  "manual_adjustment",
]);
export const stockTransactionType = pgEnum("stock_transaction_type", [
  "sale",
  "purchase",
  "adjustment",
  "return",
]);
export const taskPriority = pgEnum("task_priority", [
  "low",
  "medium",
  "high",
  "urgent",
]);
export const taskStatus = pgEnum("task_status", [
  "open",
  "in_progress",
  "completed",
  "blocked",
]);
export const tournamentParticipantStatus = pgEnum(
  "tournament_participant_status",
  ["registered", "checked_in", "withdrawn"]
);
export const tournamentStatus = pgEnum("tournament_status", [
  "upcoming",
  "registration_open",
  "in_progress",
  "completed",
  "cancelled",
]);
export const tournamentType = pgEnum("tournament_type", [
  "singles_elimination",
  "doubles_round_robin",
  "other",
]);
export const trainingPackageType = pgEnum("training_package_type", [
  "group_training",
  "private_training",
]);
export const userRole = pgEnum("user_role", [
  "player",
  "coach",
  "club_staff",
  "admin",
]);
export const userSkillLevel = pgEnum("user_skill_level", [
  "beginner",
  "intermediate",
  "advanced",
  "pro",
  "professional",
]);
export const userTrainingPackageStatus = pgEnum(
  "user_training_package_status",
  ["active", "expired", "completed", "cancelled"]
);

export const classDefinition = pgTable("class_definition", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  name: varchar({ length: 255 }).notNull(),
  description: text(),
  classType: classType("class_type").notNull(),
  basePrice: numeric("base_price", { precision: 10, scale: 2 }).notNull(),
  currency: varchar({ length: 3 }).notNull(),
  minSkillLevel: userSkillLevel("min_skill_level"),
  maxSkillLevel: userSkillLevel("max_skill_level"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
    .defaultNow()
    .notNull(),
});

export const externalSystemMapping = pgTable("external_system_mapping", {
  id: uuid().defaultRandom().primaryKey().notNull(),
  externalSystem: externalSystem("external_system").notNull(),
  internalEntityId: uuid("internal_entity_id").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  lastSyncAt: timestamp("last_sync_at", { mode: "string" }),
  createdAt: timestamp("created_at", { mode: "string" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "string" }).defaultNow().notNull(),
  externalId: varchar("external_id", { length: 255 }).notNull(),
  internalEntityType: externalEntityMappingType(
    "internal_entity_type"
  ).notNull(),
  syncData: text("sync_data"),
  hasConflict: boolean("has_conflict").default(false).notNull(),
  conflictData: text("conflict_data"),
  lastError: text("last_error"),
});

export const venue = pgTable(
  "venue",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: varchar({ length: 255 }).notNull(),
    address: text().notNull(),
    city: varchar({ length: 100 }).notNull(),
    country: varchar({ length: 100 }).notNull(),
    phoneNumber: varchar("phone_number", { length: 50 }),
    email: varchar({ length: 255 }),
    isActive: boolean("is_active").default(true).notNull(),
    gcalResourceId: varchar("gcal_resource_id", { length: 255 }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      venueNameUnique: unique("venue_name_unique").on(table.name),
    };
  }
);

export const court = pgTable(
  "court",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    venueId: uuid("venue_id").notNull(),
    name: varchar({ length: 255 }).notNull(),
    courtType: courtType("court_type").notNull(),
    hourlyRate: numeric("hourly_rate", { precision: 10, scale: 2 }).notNull(),
    description: text(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      courtVenueIdVenueIdFk: foreignKey({
        columns: [table.venueId],
        foreignColumns: [venue.id],
        name: "court_venue_id_venue_id_fk",
      }).onDelete("cascade"),
    };
  }
);

export const payment = pgTable(
  "payment",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    amount: numeric({ precision: 10, scale: 2 }).notNull(),
    currency: varchar({ length: 3 }).notNull(),
    status: paymentStatus().notNull(),
    paymentMethod: paymentMethod("payment_method").notNull(),
    gatewayTransactionId: varchar("gateway_transaction_id", { length: 255 }),
    description: text(),
    relatedBookingParticipantId: uuid("related_booking_participant_id"),
    relatedOrderId: uuid("related_order_id"),
    relatedUserTrainingPackageId: uuid("related_user_training_package_id"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      paymentUserIdUserIdFk: foreignKey({
        columns: [table.userId],
        foreignColumns: [user.id],
        name: "payment_user_id_user_id_fk",
      }).onDelete("restrict"),
      paymentRelatedBookingParticipantIdBookingParticipantIdF: foreignKey({
        columns: [table.relatedBookingParticipantId],
        foreignColumns: [bookingParticipant.id],
        name: "payment_related_booking_participant_id_booking_participant_id_f",
      }).onDelete("set null"),
    };
  }
);

export const order = pgTable(
  "order",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    orderDate: timestamp("order_date", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
    currency: varchar({ length: 3 }).notNull(),
    status: orderStatus().notNull(),
    paymentId: uuid("payment_id"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      orderUserIdUserIdFk: foreignKey({
        columns: [table.userId],
        foreignColumns: [user.id],
        name: "order_user_id_user_id_fk",
      }).onDelete("restrict"),
      orderPaymentIdPaymentIdFk: foreignKey({
        columns: [table.paymentId],
        foreignColumns: [payment.id],
        name: "order_payment_id_payment_id_fk",
      }).onDelete("set null"),
    };
  }
);

export const user = pgTable(
  "user",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    username: varchar({ length: 255 }).notNull(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    firstName: varchar("first_name", { length: 255 }).notNull(),
    lastName: varchar("last_name", { length: 255 }).notNull(),
    email: varchar({ length: 255 }).notNull(),
    phone: varchar({ length: 50 }),
    memberId: varchar("member_id", { length: 50 }).notNull(),
    userRole: userRole("user_role").notNull(),
    currentRating: real("current_rating").default(1500).notNull(),
    bonusPoints: integer("bonus_points").default(0).notNull(),
    profileImageUrl: text("profile_image_url"),
    gender: genderType(),
    dateOfBirth: date("date_of_birth"),
    homeVenueId: uuid("home_venue_id"),
    isAccountVerified: boolean("is_account_verified").default(false).notNull(),
    lastLoginAt: timestamp("last_login_at", {
      withTimezone: true,
      mode: "string",
    }),
    lastActivityAt: timestamp("last_activity_at", {
      withTimezone: true,
      mode: "string",
    }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      userUsernameUnique: unique("user_username_unique").on(table.username),
      userEmailUnique: unique("user_email_unique").on(table.email),
      userPhoneUnique: unique("user_phone_unique").on(table.phone),
      userMemberIdUnique: unique("user_member_id_unique").on(table.memberId),
    };
  }
);

export const trainingPackageDefinition = pgTable(
  "training_package_definition",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: varchar({ length: 255 }).notNull(),
    description: text(),
    packageType: trainingPackageType("package_type").notNull(),
    numberOfSessions: integer("number_of_sessions").notNull(),
    price: numeric({ precision: 10, scale: 2 }).notNull(),
    currency: varchar({ length: 3 }).notNull(),
    validityDurationDays: integer("validity_duration_days").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  }
);

export const tournament = pgTable(
  "tournament",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    venueId: uuid("venue_id").notNull(),
    name: varchar({ length: 255 }).notNull(),
    description: text(),
    tournamentType: tournamentType("tournament_type").notNull(),
    skillLevelCategory: userSkillLevel("skill_level_category").notNull(),
    startDate: timestamp("start_date", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    endDate: timestamp("end_date", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    registrationFee: numeric("registration_fee", {
      precision: 10,
      scale: 2,
    }).notNull(),
    currency: varchar({ length: 3 }).notNull(),
    maxParticipants: integer("max_participants").notNull(),
    status: tournamentStatus().notNull(),
    rulesUrl: text("rules_url"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      tournamentVenueIdVenueIdFk: foreignKey({
        columns: [table.venueId],
        foreignColumns: [venue.id],
        name: "tournament_venue_id_venue_id_fk",
      }).onDelete("restrict"),
    };
  }
);

export const bonusTransaction = pgTable(
  "bonus_transaction",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    transactionType: bonusTransactionType("transaction_type").notNull(),
    pointsChange: integer("points_change").notNull(),
    currentBalanceAfter: integer("current_balance_after").notNull(),
    relatedOrderId: uuid("related_order_id"),
    relatedBookingId: uuid("related_booking_id"),
    description: text().notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true, mode: "string" }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      createdAtIdx: index("bonus_transaction_created_at_idx").using(
        "btree",
        table.createdAt.asc().nullsLast().op("timestamptz_ops")
      ),
      typeIdx: index("bonus_transaction_type_idx").using(
        "btree",
        table.transactionType.asc().nullsLast().op("enum_ops")
      ),
      userIdIdx: index("bonus_transaction_user_id_idx").using(
        "btree",
        table.userId.asc().nullsLast().op("uuid_ops")
      ),
      bonusTransactionUserIdUserIdFk: foreignKey({
        columns: [table.userId],
        foreignColumns: [user.id],
        name: "bonus_transaction_user_id_user_id_fk",
      }).onDelete("cascade"),
      bonusTransactionRelatedOrderIdOrderIdFk: foreignKey({
        columns: [table.relatedOrderId],
        foreignColumns: [order.id],
        name: "bonus_transaction_related_order_id_order_id_fk",
      }).onDelete("set null"),
      bonusTransactionRelatedBookingIdBookingIdFk: foreignKey({
        columns: [table.relatedBookingId],
        foreignColumns: [booking.id],
        name: "bonus_transaction_related_booking_id_booking_id_fk",
      }).onDelete("set null"),
    };
  }
);

export const productCategory = pgTable(
  "product_category",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    name: varchar({ length: 100 }).notNull(),
    description: text(),
    type: productCategoryType().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      productCategoryNameUnique: unique("product_category_name_unique").on(
        table.name
      ),
    };
  }
);

export const product = pgTable(
  "product",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    categoryId: uuid("category_id").notNull(),
    name: varchar({ length: 255 }).notNull(),
    description: text(),
    price: numeric({ precision: 10, scale: 2 }).notNull(),
    currency: varchar({ length: 3 }).notNull(),
    imageUrl: text("image_url"),
    currentStock: integer("current_stock").notNull(),
    reorderThreshold: integer("reorder_threshold").notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      productCategoryIdProductCategoryIdFk: foreignKey({
        columns: [table.categoryId],
        foreignColumns: [productCategory.id],
        name: "product_category_id_product_category_id_fk",
      }).onDelete("restrict"),
    };
  }
);

export const classSchedule = pgTable(
  "class_schedule",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    classDefinitionId: uuid("class_definition_id").notNull(),
    venueId: uuid("venue_id").notNull(),
    instructorId: uuid("instructor_id").notNull(),
    startTime: timestamp("start_time", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    endTime: timestamp("end_time", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    courtId: uuid("court_id").notNull(),
    maxParticipants: integer("max_participants").notNull(),
    currentParticipants: integer("current_participants").default(0).notNull(),
    status: classScheduleStatus().notNull(),
    relatedBookingId: uuid("related_booking_id"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      classScheduleClassDefinitionIdClassDefinitionIdFk: foreignKey({
        columns: [table.classDefinitionId],
        foreignColumns: [classDefinition.id],
        name: "class_schedule_class_definition_id_class_definition_id_fk",
      }).onDelete("restrict"),
      classScheduleVenueIdVenueIdFk: foreignKey({
        columns: [table.venueId],
        foreignColumns: [venue.id],
        name: "class_schedule_venue_id_venue_id_fk",
      }).onDelete("restrict"),
      classScheduleInstructorIdUserIdFk: foreignKey({
        columns: [table.instructorId],
        foreignColumns: [user.id],
        name: "class_schedule_instructor_id_user_id_fk",
      }).onDelete("restrict"),
      classScheduleCourtIdCourtIdFk: foreignKey({
        columns: [table.courtId],
        foreignColumns: [court.id],
        name: "class_schedule_court_id_court_id_fk",
      }).onDelete("restrict"),
      classScheduleRelatedBookingIdBookingIdFk: foreignKey({
        columns: [table.relatedBookingId],
        foreignColumns: [booking.id],
        name: "class_schedule_related_booking_id_booking_id_fk",
      }).onDelete("set null"),
    };
  }
);

export const userAccountLink = pgTable(
  "user_account_link",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    platform: notificationChannel().notNull(),
    platformUserId: varchar("platform_user_id", { length: 255 }).notNull(),
    isPrimary: boolean("is_primary").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      userAccountLinkUserIdUserIdFk: foreignKey({
        columns: [table.userId],
        foreignColumns: [user.id],
        name: "user_account_link_user_id_user_id_fk",
      }).onDelete("cascade"),
    };
  }
);

export const classParticipant = pgTable(
  "class_participant",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    classScheduleId: uuid("class_schedule_id").notNull(),
    userId: uuid("user_id").notNull(),
    status: classParticipantStatus().notNull(),
    paidWithPackageId: uuid("paid_with_package_id"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      classParticipantClassScheduleIdClassScheduleIdFk: foreignKey({
        columns: [table.classScheduleId],
        foreignColumns: [classSchedule.id],
        name: "class_participant_class_schedule_id_class_schedule_id_fk",
      }).onDelete("cascade"),
      classParticipantUserIdUserIdFk: foreignKey({
        columns: [table.userId],
        foreignColumns: [user.id],
        name: "class_participant_user_id_user_id_fk",
      }).onDelete("cascade"),
      classParticipantClassScheduleIdUserIdUnique: unique(
        "class_participant_class_schedule_id_user_id_unique"
      ).on(table.classScheduleId, table.userId),
    };
  }
);

export const userTrainingPackage = pgTable(
  "user_training_package",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    packageDefinitionId: uuid("package_definition_id").notNull(),
    purchaseDate: timestamp("purchase_date", {
      withTimezone: true,
      mode: "string",
    })
      .defaultNow()
      .notNull(),
    expirationDate: timestamp("expiration_date", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    sessionsUsed: integer("sessions_used").default(0).notNull(),
    sessionsTotal: integer("sessions_total").notNull(),
    status: userTrainingPackageStatus().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      userTrainingPackageUserIdUserIdFk: foreignKey({
        columns: [table.userId],
        foreignColumns: [user.id],
        name: "user_training_package_user_id_user_id_fk",
      }).onDelete("cascade"),
      userTrainingPackagePackageDefinitionIdTrainingPackageDe: foreignKey({
        columns: [table.packageDefinitionId],
        foreignColumns: [trainingPackageDefinition.id],
        name: "user_training_package_package_definition_id_training_package_de",
      }).onDelete("cascade"),
    };
  }
);

export const gameSession = pgTable(
  "game_session",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    venueId: uuid("venue_id").notNull(),
    courtId: uuid("court_id"),
    startTime: timestamp("start_time", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    endTime: timestamp("end_time", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    gameType: gameType("game_type").notNull(),
    neededSkillLevel: userSkillLevel("needed_skill_level").notNull(),
    maxPlayers: integer("max_players").notNull(),
    currentPlayers: integer("current_players").default(0).notNull(),
    status: gameSessionStatus().notNull(),
    createdByUserId: uuid("created_by_user_id").notNull(),
    hostUserId: uuid("host_user_id"),
    matchScore: varchar("match_score", { length: 50 }),
    winnerUserIds: uuid("winner_user_ids").array(),
    relatedBookingId: uuid("related_booking_id"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      gameSessionVenueIdVenueIdFk: foreignKey({
        columns: [table.venueId],
        foreignColumns: [venue.id],
        name: "game_session_venue_id_venue_id_fk",
      }).onDelete("restrict"),
      gameSessionCourtIdCourtIdFk: foreignKey({
        columns: [table.courtId],
        foreignColumns: [court.id],
        name: "game_session_court_id_court_id_fk",
      }).onDelete("set null"),
      gameSessionCreatedByUserIdUserIdFk: foreignKey({
        columns: [table.createdByUserId],
        foreignColumns: [user.id],
        name: "game_session_created_by_user_id_user_id_fk",
      }).onDelete("restrict"),
      gameSessionHostUserIdUserIdFk: foreignKey({
        columns: [table.hostUserId],
        foreignColumns: [user.id],
        name: "game_session_host_user_id_user_id_fk",
      }).onDelete("set null"),
      gameSessionRelatedBookingIdBookingIdFk: foreignKey({
        columns: [table.relatedBookingId],
        foreignColumns: [booking.id],
        name: "game_session_related_booking_id_booking_id_fk",
      }).onDelete("set null"),
    };
  }
);

export const gamePlayer = pgTable(
  "game_player",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    gameSessionId: uuid("game_session_id").notNull(),
    userId: uuid("user_id").notNull(),
    participationStatus: classParticipantStatus(
      "participation_status"
    ).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      gamePlayerGameSessionIdGameSessionIdFk: foreignKey({
        columns: [table.gameSessionId],
        foreignColumns: [gameSession.id],
        name: "game_player_game_session_id_game_session_id_fk",
      }).onDelete("cascade"),
      gamePlayerUserIdUserIdFk: foreignKey({
        columns: [table.userId],
        foreignColumns: [user.id],
        name: "game_player_user_id_user_id_fk",
      }).onDelete("cascade"),
      gamePlayerGameSessionIdUserIdUnique: unique(
        "game_player_game_session_id_user_id_unique"
      ).on(table.gameSessionId, table.userId),
    };
  }
);

export const ratingChange = pgTable(
  "rating_change",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id").notNull(),
    oldRating: real("old_rating").notNull(),
    newRating: real("new_rating").notNull(),
    changeReason: ratingChangeReason("change_reason").notNull(),
    relatedGameSessionId: uuid("related_game_session_id"),
    relatedTournamentMatchId: uuid("related_tournament_match_id"),
    notes: text(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      ratingChangeUserIdUserIdFk: foreignKey({
        columns: [table.userId],
        foreignColumns: [user.id],
        name: "rating_change_user_id_user_id_fk",
      }).onDelete("cascade"),
      ratingChangeRelatedGameSessionIdGameSessionIdFk: foreignKey({
        columns: [table.relatedGameSessionId],
        foreignColumns: [gameSession.id],
        name: "rating_change_related_game_session_id_game_session_id_fk",
      }).onDelete("set null"),
    };
  }
);

export const tournamentParticipant = pgTable(
  "tournament_participant",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    tournamentId: uuid("tournament_id").notNull(),
    userId: uuid("user_id").notNull(),
    registrationDate: timestamp("registration_date", {
      withTimezone: true,
      mode: "string",
    })
      .defaultNow()
      .notNull(),
    status: tournamentParticipantStatus().notNull(),
    partnerUserId: uuid("partner_user_id"),
    teamId: uuid("team_id"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      tournamentParticipantTournamentIdTournamentIdFk: foreignKey({
        columns: [table.tournamentId],
        foreignColumns: [tournament.id],
        name: "tournament_participant_tournament_id_tournament_id_fk",
      }).onDelete("cascade"),
      tournamentParticipantUserIdUserIdFk: foreignKey({
        columns: [table.userId],
        foreignColumns: [user.id],
        name: "tournament_participant_user_id_user_id_fk",
      }).onDelete("cascade"),
      tournamentParticipantPartnerUserIdUserIdFk: foreignKey({
        columns: [table.partnerUserId],
        foreignColumns: [user.id],
        name: "tournament_participant_partner_user_id_user_id_fk",
      }).onDelete("set null"),
      tournamentParticipantTeamIdTournamentTeamIdFk: foreignKey({
        columns: [table.teamId],
        foreignColumns: [tournamentTeam.id],
        name: "tournament_participant_team_id_tournament_team_id_fk",
      }).onDelete("set null"),
      tournamentParticipantTournamentIdUserIdUnique: unique(
        "tournament_participant_tournament_id_user_id_unique"
      ).on(table.tournamentId, table.userId),
    };
  }
);

export const notification = pgTable(
  "notification",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id"),
    type: notificationType().notNull(),
    message: text().notNull(),
    channel: notificationChannel().notNull(),
    isSent: boolean("is_sent").default(false).notNull(),
    sentAt: timestamp("sent_at", { withTimezone: true, mode: "string" }),
    isRead: boolean("is_read").default(false).notNull(),
    readAt: timestamp("read_at", { withTimezone: true, mode: "string" }),
    relatedEntityId: uuid("related_entity_id"),
    relatedEntityType: varchar("related_entity_type", { length: 50 }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      notificationUserIdUserIdFk: foreignKey({
        columns: [table.userId],
        foreignColumns: [user.id],
        name: "notification_user_id_user_id_fk",
      }).onDelete("cascade"),
    };
  }
);

export const feedback = pgTable(
  "feedback",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    userId: uuid("user_id"),
    venueId: uuid("venue_id"),
    category: feedbackCategory().notNull(),
    rating: integer(),
    comment: text(),
    status: feedbackStatus().default("new").notNull(),
    resolvedByUserId: uuid("resolved_by_user_id"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      feedbackUserIdUserIdFk: foreignKey({
        columns: [table.userId],
        foreignColumns: [user.id],
        name: "feedback_user_id_user_id_fk",
      }).onDelete("set null"),
      feedbackVenueIdVenueIdFk: foreignKey({
        columns: [table.venueId],
        foreignColumns: [venue.id],
        name: "feedback_venue_id_venue_id_fk",
      }).onDelete("set null"),
      feedbackResolvedByUserIdUserIdFk: foreignKey({
        columns: [table.resolvedByUserId],
        foreignColumns: [user.id],
        name: "feedback_resolved_by_user_id_user_id_fk",
      }).onDelete("set null"),
    };
  }
);

export const aiSuggestionLog = pgTable(
  "ai_suggestion_log",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    suggestionType: aiSuggestionType("suggestion_type").notNull(),
    userId: uuid("user_id"),
    inputData: jsonb("input_data").notNull(),
    suggestionData: jsonb("suggestion_data").notNull(),
    confidenceScore: numeric("confidence_score", { precision: 5, scale: 4 }),
    wasAccepted: boolean("was_accepted"),
    userFeedback: text("user_feedback"),
    executionTimeMs: numeric("execution_time_ms", { precision: 10, scale: 2 }),
    modelVersion: text("model_version"),
    contextData: jsonb("context_data"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      aiSuggestionLogUserIdUserIdFk: foreignKey({
        columns: [table.userId],
        foreignColumns: [user.id],
        name: "ai_suggestion_log_user_id_user_id_fk",
      }).onDelete("set null"),
    };
  }
);

export const tournamentMatch = pgTable(
  "tournament_match",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    tournamentId: uuid("tournament_id").notNull(),
    courtId: uuid("court_id"),
    matchNumber: integer("match_number").notNull(),
    round: varchar({ length: 50 }).notNull(),
    startTime: timestamp("start_time", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    endTime: timestamp("end_time", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    status: tournamentStatus().notNull(),
    score: varchar({ length: 50 }),
    winnerTeamId: uuid("winner_team_id"),
    loserTeamId: uuid("loser_team_id"),
    winnerPlayerIds: uuid("winner_player_ids").array(),
    loserPlayerIds: uuid("loser_player_ids").array(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      tournamentMatchTournamentIdTournamentIdFk: foreignKey({
        columns: [table.tournamentId],
        foreignColumns: [tournament.id],
        name: "tournament_match_tournament_id_tournament_id_fk",
      }).onDelete("cascade"),
      tournamentMatchCourtIdCourtIdFk: foreignKey({
        columns: [table.courtId],
        foreignColumns: [court.id],
        name: "tournament_match_court_id_court_id_fk",
      }).onDelete("set null"),
      tournamentMatchWinnerTeamIdTournamentTeamIdFk: foreignKey({
        columns: [table.winnerTeamId],
        foreignColumns: [tournamentTeam.id],
        name: "tournament_match_winner_team_id_tournament_team_id_fk",
      }).onDelete("set null"),
      tournamentMatchLoserTeamIdTournamentTeamIdFk: foreignKey({
        columns: [table.loserTeamId],
        foreignColumns: [tournamentTeam.id],
        name: "tournament_match_loser_team_id_tournament_team_id_fk",
      }).onDelete("set null"),
    };
  }
);

export const booking = pgTable(
  "booking",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    courtId: uuid("court_id").notNull(),
    startTime: timestamp("start_time", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    endTime: timestamp("end_time", {
      withTimezone: true,
      mode: "string",
    }).notNull(),
    durationMinutes: integer("duration_minutes").notNull(),
    status: bookingStatus().notNull(),
    totalAmount: numeric("total_amount", { precision: 10, scale: 2 }).notNull(),
    currency: varchar({ length: 3 }).notNull(),
    bookedByUserId: uuid("booked_by_user_id").notNull(),
    bookingPurpose: bookingPurpose("booking_purpose").notNull(),
    relatedEntityId: uuid("related_entity_id"),
    notes: text(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      bookingCourtIdCourtIdFk: foreignKey({
        columns: [table.courtId],
        foreignColumns: [court.id],
        name: "booking_court_id_court_id_fk",
      }).onDelete("restrict"),
      bookingBookedByUserIdUserIdFk: foreignKey({
        columns: [table.bookedByUserId],
        foreignColumns: [user.id],
        name: "booking_booked_by_user_id_user_id_fk",
      }).onDelete("restrict"),
    };
  }
);

export const bookingParticipant = pgTable(
  "booking_participant",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    bookingId: uuid("booking_id").notNull(),
    userId: uuid("user_id").notNull(),
    amountOwed: numeric("amount_owed", { precision: 10, scale: 2 }).notNull(),
    amountPaid: numeric("amount_paid", { precision: 10, scale: 2 })
      .default("0.00")
      .notNull(),
    paymentStatus: paymentStatus("payment_status").default("pending").notNull(),
    participationStatus: classParticipantStatus("participation_status")
      .default("registered")
      .notNull(),
    isHost: boolean("is_host").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      bookingParticipantBookingIdBookingIdFk: foreignKey({
        columns: [table.bookingId],
        foreignColumns: [booking.id],
        name: "booking_participant_booking_id_booking_id_fk",
      }).onDelete("cascade"),
      bookingParticipantUserIdUserIdFk: foreignKey({
        columns: [table.userId],
        foreignColumns: [user.id],
        name: "booking_participant_user_id_user_id_fk",
      }).onDelete("restrict"),
      bookingParticipantBookingIdUserIdUnique: unique(
        "booking_participant_booking_id_user_id_unique"
      ).on(table.bookingId, table.userId),
    };
  }
);

export const tournamentTeam = pgTable(
  "tournament_team",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    tournamentId: uuid("tournament_id").notNull(),
    name: varchar({ length: 255 }).notNull(),
    player1Id: uuid("player1_id").notNull(),
    player2Id: uuid("player2_id"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      tournamentTeamTournamentIdTournamentIdFk: foreignKey({
        columns: [table.tournamentId],
        foreignColumns: [tournament.id],
        name: "tournament_team_tournament_id_tournament_id_fk",
      }).onDelete("cascade"),
      tournamentTeamPlayer1IdUserIdFk: foreignKey({
        columns: [table.player1Id],
        foreignColumns: [user.id],
        name: "tournament_team_player1_id_user_id_fk",
      }).onDelete("restrict"),
      tournamentTeamPlayer2IdUserIdFk: foreignKey({
        columns: [table.player2Id],
        foreignColumns: [user.id],
        name: "tournament_team_player2_id_user_id_fk",
      }).onDelete("restrict"),
      tournamentTeamTournamentIdNameUnique: unique(
        "tournament_team_tournament_id_name_unique"
      ).on(table.tournamentId, table.name),
    };
  }
);

export const task = pgTable(
  "task",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    assignedToUserId: uuid("assigned_to_user_id"),
    createdByUserId: uuid("created_by_user_id").notNull(),
    venueId: uuid("venue_id"),
    title: varchar({ length: 255 }).notNull(),
    description: text(),
    dueDate: timestamp("due_date", { withTimezone: true, mode: "string" }),
    status: taskStatus().notNull(),
    priority: taskPriority().notNull(),
    relatedEntityId: uuid("related_entity_id"),
    relatedEntityType: varchar("related_entity_type", { length: 50 }),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      taskAssignedToUserIdUserIdFk: foreignKey({
        columns: [table.assignedToUserId],
        foreignColumns: [user.id],
        name: "task_assigned_to_user_id_user_id_fk",
      }).onDelete("set null"),
      taskCreatedByUserIdUserIdFk: foreignKey({
        columns: [table.createdByUserId],
        foreignColumns: [user.id],
        name: "task_created_by_user_id_user_id_fk",
      }).onDelete("restrict"),
      taskVenueIdVenueIdFk: foreignKey({
        columns: [table.venueId],
        foreignColumns: [venue.id],
        name: "task_venue_id_venue_id_fk",
      }).onDelete("set null"),
    };
  }
);

export const orderItem = pgTable(
  "order_item",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    orderId: uuid("order_id").notNull(),
    productId: uuid("product_id").notNull(),
    quantity: integer().notNull(),
    unitPriceAtSale: numeric("unit_price_at_sale", {
      precision: 10,
      scale: 2,
    }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      orderItemOrderIdOrderIdFk: foreignKey({
        columns: [table.orderId],
        foreignColumns: [order.id],
        name: "order_item_order_id_order_id_fk",
      }).onDelete("cascade"),
      orderItemProductIdProductIdFk: foreignKey({
        columns: [table.productId],
        foreignColumns: [product.id],
        name: "order_item_product_id_product_id_fk",
      }).onDelete("restrict"),
    };
  }
);

export const stockTransaction = pgTable(
  "stock_transaction",
  {
    id: uuid().defaultRandom().primaryKey().notNull(),
    productId: uuid("product_id").notNull(),
    transactionType: stockTransactionType("transaction_type").notNull(),
    quantityChange: integer("quantity_change").notNull(),
    currentStockAfter: integer("current_stock_after").notNull(),
    relatedOrderItemId: uuid("related_order_item_id"),
    notes: text(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      stockTransactionProductIdProductIdFk: foreignKey({
        columns: [table.productId],
        foreignColumns: [product.id],
        name: "stock_transaction_product_id_product_id_fk",
      }).onDelete("restrict"),
      stockTransactionRelatedOrderItemIdOrderItemIdFk: foreignKey({
        columns: [table.relatedOrderItemId],
        foreignColumns: [orderItem.id],
        name: "stock_transaction_related_order_item_id_order_item_id_fk",
      }).onDelete("set null"),
    };
  }
);
