CREATE TABLE IF NOT EXISTS "tournament_match" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tournament_id" uuid NOT NULL,
	"court_id" uuid,
	"match_number" integer NOT NULL,
	"round" varchar(50) NOT NULL,
	"start_time" timestamp with time zone NOT NULL,
	"end_time" timestamp with time zone NOT NULL,
	"status" "tournament_status" NOT NULL,
	"score" varchar(50),
	"winner_team_id" uuid,
	"loser_team_id" uuid,
	"winner_player_ids" uuid[],
	"loser_player_ids" uuid[],
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tournament_match" ADD CONSTRAINT "tournament_match_tournament_id_tournament_id_fk" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournament"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tournament_match" ADD CONSTRAINT "tournament_match_court_id_court_id_fk" FOREIGN KEY ("court_id") REFERENCES "public"."court"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tournament_match" ADD CONSTRAINT "tournament_match_winner_team_id_tournament_team_id_fk" FOREIGN KEY ("winner_team_id") REFERENCES "public"."tournament_team"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tournament_match" ADD CONSTRAINT "tournament_match_loser_team_id_tournament_team_id_fk" FOREIGN KEY ("loser_team_id") REFERENCES "public"."tournament_team"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
