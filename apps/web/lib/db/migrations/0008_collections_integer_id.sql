DROP TABLE IF EXISTS "creator_collection_posts";
DROP TABLE IF EXISTS "creator_collections";
--> statement-breakpoint
CREATE TABLE "creator_collections" (
	"id" integer PRIMARY KEY GENERATED ALWAYS AS IDENTITY (sequence name "creator_collections_id_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START WITH 1 CACHE 1),
	"creator_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"cover_image_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "creator_collections" ADD CONSTRAINT "creator_collections_creator_id_creators_id_fk" FOREIGN KEY ("creator_id") REFERENCES "public"."creators"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE TABLE "creator_collection_posts" (
	"post_id" integer PRIMARY KEY NOT NULL,
	"collection_id" integer NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "creator_collection_posts" ADD CONSTRAINT "creator_collection_posts_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "creator_collection_posts" ADD CONSTRAINT "creator_collection_posts_collection_id_creator_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."creator_collections"("id") ON DELETE cascade ON UPDATE no action;
