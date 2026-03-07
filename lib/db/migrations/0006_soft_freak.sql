ALTER TABLE "posts" RENAME COLUMN "ckbfs_outpoint" TO "nostr_event_id";--> statement-breakpoint
ALTER TABLE "creators" ADD COLUMN "nostr_pubkey" text;