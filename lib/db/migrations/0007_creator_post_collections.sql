CREATE TABLE "creator_collections" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"creator_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"cover_image_url" text,
	"slug" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "creator_collections_creator_id_slug_unique" UNIQUE("creator_id","slug")
);
--> statement-breakpoint
ALTER TABLE "creator_collections" ADD CONSTRAINT "creator_collections_creator_id_creators_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creators"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE TABLE "creator_collection_posts" (
	"post_id" integer PRIMARY KEY NOT NULL,
	"collection_id" uuid NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "creator_collection_posts" ADD CONSTRAINT "creator_collection_posts_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "creator_collection_posts" ADD CONSTRAINT "creator_collection_posts_collection_id_creator_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."creator_collections"("id") ON DELETE cascade ON UPDATE no action;
