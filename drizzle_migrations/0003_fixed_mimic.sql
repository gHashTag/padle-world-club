DO $$ BEGIN
 CREATE TYPE "public"."class_participant_status" AS ENUM('registered', 'attended', 'no_show', 'cancelled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "booking_participant" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"amount_owed" numeric(10, 2) NOT NULL,
	"amount_paid" numeric(10, 2) DEFAULT '0.00' NOT NULL,
	"payment_status" "payment_status" DEFAULT 'pending' NOT NULL,
	"participation_status" "class_participant_status" DEFAULT 'registered' NOT NULL,
	"is_host" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "booking_participant_booking_id_user_id_unique" UNIQUE("booking_id","user_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "booking_participant" ADD CONSTRAINT "booking_participant_booking_id_booking_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."booking"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "booking_participant" ADD CONSTRAINT "booking_participant_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE restrict ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
