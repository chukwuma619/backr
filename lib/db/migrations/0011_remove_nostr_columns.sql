ALTER TABLE "users" DROP COLUMN IF EXISTS "nostr_pubkey";--> statement-breakpoint
ALTER TABLE "posts" DROP COLUMN IF EXISTS "nostr_event_id";
