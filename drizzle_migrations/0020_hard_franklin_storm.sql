CREATE INDEX IF NOT EXISTS "bonus_transaction_user_id_idx" ON "bonus_transaction" ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bonus_transaction_type_idx" ON "bonus_transaction" ("transaction_type");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bonus_transaction_created_at_idx" ON "bonus_transaction" ("created_at");