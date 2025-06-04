DO $$ BEGIN
 CREATE TYPE "public"."class_type" AS ENUM('group_training', 'open_play_session', 'coached_drill');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
ALTER TYPE "user_skill_level" ADD VALUE 'professional';--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "class_definition" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"class_type" "class_type" NOT NULL,
	"base_price" numeric(10, 2) NOT NULL,
	"currency" varchar(3) NOT NULL,
	"min_skill_level" "user_skill_level",
	"max_skill_level" "user_skill_level",
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
