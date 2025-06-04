DO $$ BEGIN
 CREATE TYPE "public"."rating_change_reason" AS ENUM('game_session', 'tournament_match', 'manual_adjustment');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "rating_change" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"old_rating" real NOT NULL,
	"new_rating" real NOT NULL,
	"change_reason" "rating_change_reason" NOT NULL,
	"related_game_session_id" uuid,
	"related_tournament_match_id" uuid,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rating_change" ADD CONSTRAINT "rating_change_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "rating_change" ADD CONSTRAINT "rating_change_related_game_session_id_game_session_id_fk" FOREIGN KEY ("related_game_session_id") REFERENCES "public"."game_session"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
