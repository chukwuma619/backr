CREATE TABLE "post_paid_audience_tiers" (
	"post_id" integer NOT NULL,
	"tier_id" uuid NOT NULL,
	CONSTRAINT "post_paid_audience_tiers_post_id_tier_id_unique" UNIQUE("post_id","tier_id")
);
--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "audience" text;--> statement-breakpoint
ALTER TABLE "post_paid_audience_tiers" ADD CONSTRAINT "post_paid_audience_tiers_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "post_paid_audience_tiers" ADD CONSTRAINT "post_paid_audience_tiers_tier_id_tiers_id_fk" FOREIGN KEY ("tier_id") REFERENCES "public"."tiers"("id") ON DELETE cascade ON UPDATE no action;