ALTER TABLE "external_system_mapping" ALTER COLUMN "last_sync_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "external_system_mapping" ALTER COLUMN "created_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "external_system_mapping" ALTER COLUMN "updated_at" SET DATA TYPE timestamp;--> statement-breakpoint
ALTER TABLE "external_system_mapping" ADD COLUMN "external_id" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "external_system_mapping" ADD COLUMN "internal_entity_type" "external_entity_mapping_type" NOT NULL;--> statement-breakpoint
ALTER TABLE "external_system_mapping" ADD COLUMN "sync_data" text;--> statement-breakpoint
ALTER TABLE "external_system_mapping" ADD COLUMN "has_conflict" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "external_system_mapping" ADD COLUMN "conflict_data" text;--> statement-breakpoint
ALTER TABLE "external_system_mapping" ADD COLUMN "last_error" text;--> statement-breakpoint
ALTER TABLE "external_system_mapping" DROP COLUMN IF EXISTS "entity_type";--> statement-breakpoint
ALTER TABLE "external_system_mapping" DROP COLUMN IF EXISTS "external_entity_id";--> statement-breakpoint
ALTER TABLE "external_system_mapping" DROP COLUMN IF EXISTS "external_entity_data";--> statement-breakpoint
ALTER TABLE "external_system_mapping" DROP COLUMN IF EXISTS "sync_direction";--> statement-breakpoint
ALTER TABLE "external_system_mapping" DROP COLUMN IF EXISTS "sync_errors";