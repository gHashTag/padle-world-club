DO $$ BEGIN
 CREATE TYPE "public"."tournament_status" AS ENUM('upcoming', 'registration_open', 'in_progress', 'completed', 'cancelled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "public"."tournament_type" AS ENUM('singles_elimination', 'doubles_round_robin', 'other');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tournament" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"venue_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"tournament_type" "tournament_type" NOT NULL,
	"skill_level_category" "user_skill_level" NOT NULL,
	"start_date" timestamp with time zone NOT NULL,
	"end_date" timestamp with time zone NOT NULL,
	"registration_fee" numeric(10, 2) NOT NULL,
	"currency" varchar(3) NOT NULL,
	"max_participants" integer NOT NULL,
	"status" "tournament_status" NOT NULL,
	"rules_url" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tournament" ADD CONSTRAINT "tournament_venue_id_venue_id_fk" FOREIGN KEY ("venue_id") REFERENCES "public"."venue"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
