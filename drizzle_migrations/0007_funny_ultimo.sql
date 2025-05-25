CREATE TABLE IF NOT EXISTS "class_participant" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"class_schedule_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"status" "class_participant_status" NOT NULL,
	"paid_with_package_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "class_participant_class_schedule_id_user_id_unique" UNIQUE("class_schedule_id","user_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "class_participant" ADD CONSTRAINT "class_participant_class_schedule_id_class_schedule_id_fk" FOREIGN KEY ("class_schedule_id") REFERENCES "public"."class_schedule"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "class_participant" ADD CONSTRAINT "class_participant_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
