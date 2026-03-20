DROP TABLE IF EXISTS "creator_collection_posts";
--> statement-breakpoint
CREATE TABLE "creator_collection_posts" (
	"collection_id" integer NOT NULL,
	"post_id" integer NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "creator_collection_posts_collection_id_post_id_pk" PRIMARY KEY("collection_id","post_id")
);
--> statement-breakpoint
ALTER TABLE "creator_collection_posts" ADD CONSTRAINT "creator_collection_posts_collection_id_creator_collections_id_fk" FOREIGN KEY ("collection_id") REFERENCES "public"."creator_collections"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "creator_collection_posts" ADD CONSTRAINT "creator_collection_posts_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
