CREATE TABLE "chat_paid_audience_tiers" (
	"chat_id" uuid NOT NULL,
	"tier_id" uuid NOT NULL,
	CONSTRAINT "chat_paid_audience_tiers_chat_id_tier_id_unique" UNIQUE("chat_id","tier_id")
);
--> statement-breakpoint
ALTER TABLE "chats" ADD COLUMN "name" text;--> statement-breakpoint
ALTER TABLE "chats" ADD COLUMN "audience" text;--> statement-breakpoint
ALTER TABLE "chat_paid_audience_tiers" ADD CONSTRAINT "chat_paid_audience_tiers_chat_id_chats_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "chat_paid_audience_tiers" ADD CONSTRAINT "chat_paid_audience_tiers_tier_id_tiers_id_fk" FOREIGN KEY ("tier_id") REFERENCES "public"."tiers"("id") ON DELETE cascade ON UPDATE no action;