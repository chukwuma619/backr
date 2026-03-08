ALTER TABLE "creators" RENAME COLUMN "slug" TO "username";--> statement-breakpoint
ALTER TABLE "creators" DROP CONSTRAINT "creators_slug_unique";--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "nostr_pubkey" text;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "user_type" text DEFAULT 'member' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "avatar_url" text;--> statement-breakpoint
ALTER TABLE "creators" DROP COLUMN "avatar_url";--> statement-breakpoint
ALTER TABLE "creators" DROP COLUMN "fiber_node_rpc_url";--> statement-breakpoint
ALTER TABLE "creators" DROP COLUMN "nostr_pubkey";--> statement-breakpoint
ALTER TABLE "creators" ADD CONSTRAINT "creators_username_unique" UNIQUE("username");