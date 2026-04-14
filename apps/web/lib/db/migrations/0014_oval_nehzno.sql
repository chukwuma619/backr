ALTER TABLE "posts" RENAME COLUMN "nostr_event_id" TO "content_cid";--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "post_key_encrypted" text;--> statement-breakpoint
ALTER TABLE "users" DROP COLUMN "nostr_pubkey";