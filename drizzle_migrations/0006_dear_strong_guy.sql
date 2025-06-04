DO $$ BEGIN
 CREATE TYPE "public"."class_schedule_status" AS ENUM('scheduled', 'cancelled', 'completed', 'draft');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "class_schedule" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"class_definition_id" uuid NOT NULL,
	"venue_id" uuid NOT NULL,
	"instructor_id" uuid NOT NULL,
	"start_time" timestamp with time zone NOT NULL,
	"end_time" timestamp with time zone NOT NULL,
	"court_id" uuid NOT NULL,
	"max_participants" integer NOT NULL,
	"current_participants" integer DEFAULT 0 NOT NULL,
	"status" "class_schedule_status" NOT NULL,
	"related_booking_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "class_schedule" ADD CONSTRAINT "class_schedule_class_definition_id_class_definition_id_fk" FOREIGN KEY ("class_definition_id") REFERENCES "public"."class_definition"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "class_schedule" ADD CONSTRAINT "class_schedule_venue_id_venue_id_fk" FOREIGN KEY ("venue_id") REFERENCES "public"."venue"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "class_schedule" ADD CONSTRAINT "class_schedule_instructor_id_user_id_fk" FOREIGN KEY ("instructor_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "class_schedule" ADD CONSTRAINT "class_schedule_court_id_court_id_fk" FOREIGN KEY ("court_id") REFERENCES "public"."court"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "class_schedule" ADD CONSTRAINT "class_schedule_related_booking_id_booking_id_fk" FOREIGN KEY ("related_booking_id") REFERENCES "public"."booking"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
