-- Создание новых enum типов
DO $$ BEGIN
    CREATE TYPE "stock_transaction_type" AS ENUM('sale', 'purchase', 'adjustment', 'return');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "bonus_transaction_type" AS ENUM('earned', 'spent');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "external_system" AS ENUM('exporta', 'google_calendar', 'whatsapp_api', 'telegram_api', 'payment_gateway_api', 'other');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "external_entity_mapping_type" AS ENUM('user', 'booking', 'court', 'class', 'venue', 'class_schedule', 'product', 'training_package_definition');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ai_suggestion_type" AS ENUM('game_matching', 'court_fill_optimization', 'demand_prediction', 'rating_update');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "stock_transaction" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"product_id" uuid NOT NULL,
	"transaction_type" "stock_transaction_type" NOT NULL,
	"quantity_change" integer NOT NULL,
	"current_stock_after" integer NOT NULL,
	"related_order_item_id" uuid,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "bonus_transaction" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"transaction_type" "bonus_transaction_type" NOT NULL,
	"points_change" integer NOT NULL,
	"current_balance_after" integer NOT NULL,
	"related_order_id" uuid,
	"related_booking_id" uuid,
	"description" text NOT NULL,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "external_system_mapping" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"external_system" "external_system" NOT NULL,
	"entity_type" "external_entity_mapping_type" NOT NULL,
	"internal_entity_id" uuid NOT NULL,
	"external_entity_id" text NOT NULL,
	"external_entity_data" jsonb,
	"sync_direction" text DEFAULT 'bidirectional' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"last_sync_at" timestamp with time zone,
	"sync_errors" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "ai_suggestion_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"suggestion_type" "ai_suggestion_type" NOT NULL,
	"user_id" uuid,
	"input_data" jsonb NOT NULL,
	"suggestion_data" jsonb NOT NULL,
	"confidence_score" numeric(5, 4),
	"was_accepted" boolean,
	"user_feedback" text,
	"execution_time_ms" numeric(10, 2),
	"model_version" text,
	"context_data" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "stock_transaction" ADD CONSTRAINT "stock_transaction_product_id_product_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."product"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "stock_transaction" ADD CONSTRAINT "stock_transaction_related_order_item_id_order_item_id_fk" FOREIGN KEY ("related_order_item_id") REFERENCES "public"."order_item"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bonus_transaction" ADD CONSTRAINT "bonus_transaction_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bonus_transaction" ADD CONSTRAINT "bonus_transaction_related_order_id_order_id_fk" FOREIGN KEY ("related_order_id") REFERENCES "public"."order"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "bonus_transaction" ADD CONSTRAINT "bonus_transaction_related_booking_id_booking_id_fk" FOREIGN KEY ("related_booking_id") REFERENCES "public"."booking"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "ai_suggestion_log" ADD CONSTRAINT "ai_suggestion_log_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
