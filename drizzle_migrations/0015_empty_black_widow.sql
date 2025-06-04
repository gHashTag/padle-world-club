CREATE TABLE IF NOT EXISTS "tournament_team" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tournament_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"player1_id" uuid NOT NULL,
	"player2_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "tournament_team_tournament_id_name_unique" UNIQUE("tournament_id","name")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tournament_team" ADD CONSTRAINT "tournament_team_tournament_id_tournament_id_fk" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournament"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tournament_team" ADD CONSTRAINT "tournament_team_player1_id_user_id_fk" FOREIGN KEY ("player1_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tournament_team" ADD CONSTRAINT "tournament_team_player2_id_user_id_fk" FOREIGN KEY ("player2_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tournament_participant" ADD CONSTRAINT "tournament_participant_team_id_tournament_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."tournament_team"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
