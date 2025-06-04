CREATE TABLE IF NOT EXISTS "game_player" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"game_session_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"participation_status" "class_participant_status" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "game_player_game_session_id_user_id_unique" UNIQUE("game_session_id","user_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "game_player" ADD CONSTRAINT "game_player_game_session_id_game_session_id_fk" FOREIGN KEY ("game_session_id") REFERENCES "public"."game_session"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "game_player" ADD CONSTRAINT "game_player_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
