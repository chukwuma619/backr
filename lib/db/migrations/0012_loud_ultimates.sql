ALTER TABLE "perks" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "perks" CASCADE;--> statement-breakpoint
ALTER TABLE "posts" RENAME COLUMN "body" TO "content";--> statement-breakpoint
ALTER TABLE "tiers" RENAME COLUMN "price_amount" TO "amount";--> statement-breakpoint
ALTER TABLE "posts" DROP CONSTRAINT "posts_min_tier_id_tiers_id_fk";
--> statement-breakpoint
ALTER TABLE "tiers" ADD COLUMN "cover_image_url" text;--> statement-breakpoint
ALTER TABLE "posts" DROP COLUMN "min_tier_id";--> statement-breakpoint
ALTER TABLE "tiers" DROP COLUMN "price_currency";--> statement-breakpoint
ALTER TABLE "tiers" DROP COLUMN "billing_interval";