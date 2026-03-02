CREATE TABLE "creators" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"slug" text NOT NULL,
	"display_name" text NOT NULL,
	"bio" text,
	"avatar_url" text,
	"ckb_address" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "creators_user_id_unique" UNIQUE("user_id"),
	CONSTRAINT "creators_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "patronage" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"patron_user_id" uuid NOT NULL,
	"creator_id" uuid NOT NULL,
	"tier_id" uuid NOT NULL,
	"amount" text NOT NULL,
	"currency" text DEFAULT 'CKB' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"next_due_at" timestamp,
	"last_payment_at" timestamp,
	"ckb_tx_hash" text,
	"fiber_tx_ref" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "perks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tier_id" uuid NOT NULL,
	"description" text NOT NULL,
	"type" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tiers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"price_amount" text NOT NULL,
	"price_currency" text DEFAULT 'CKB' NOT NULL,
	"billing_interval" text DEFAULT 'monthly' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ckb_address" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_ckb_address_unique" UNIQUE("ckb_address")
);
--> statement-breakpoint
ALTER TABLE "creators" ADD CONSTRAINT "creators_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patronage" ADD CONSTRAINT "patronage_patron_user_id_users_id_fk" FOREIGN KEY ("patron_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patronage" ADD CONSTRAINT "patronage_creator_id_creators_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creators"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "patronage" ADD CONSTRAINT "patronage_tier_id_tiers_id_fk" FOREIGN KEY ("tier_id") REFERENCES "public"."tiers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "perks" ADD CONSTRAINT "perks_tier_id_tiers_id_fk" FOREIGN KEY ("tier_id") REFERENCES "public"."tiers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tiers" ADD CONSTRAINT "tiers_creator_id_creators_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creators"("id") ON DELETE cascade ON UPDATE no action;