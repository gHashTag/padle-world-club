CREATE TABLE IF NOT EXISTS "booking" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"court_id" uuid NOT NULL,
	"start_time" timestamp with time zone NOT NULL,
	"end_time" timestamp with time zone NOT NULL,
	"duration_minutes" integer NOT NULL,
	"status" "booking_status" NOT NULL,
	"total_amount" numeric(10, 2) NOT NULL,
	"currency" varchar(3) NOT NULL,
	"booked_by_user_id" uuid NOT NULL,
	"booking_purpose" "booking_purpose" NOT NULL,
	"related_entity_id" uuid,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "booking" ADD CONSTRAINT "booking_court_id_court_id_fk" FOREIGN KEY ("court_id") REFERENCES "public"."court"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "booking" ADD CONSTRAINT "booking_booked_by_user_id_user_id_fk" FOREIGN KEY ("booked_by_user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
