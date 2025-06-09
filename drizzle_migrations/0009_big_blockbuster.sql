DO $$ BEGIN
 CREATE TYPE "public"."user_training_package_status" AS ENUM('active', 'expired', 'completed', 'cancelled');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_training_package" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"package_definition_id" uuid NOT NULL,
	"purchase_date" timestamp with time zone DEFAULT now() NOT NULL,
	"expiration_date" timestamp with time zone NOT NULL,
	"sessions_used" integer DEFAULT 0 NOT NULL,
	"sessions_total" integer NOT NULL,
	"status" "user_training_package_status" NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_training_package" ADD CONSTRAINT "user_training_package_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_training_package" ADD CONSTRAINT "user_training_package_package_definition_id_training_package_definition_id_fk" FOREIGN KEY ("package_definition_id") REFERENCES "public"."training_package_definition"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
