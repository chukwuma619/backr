ALTER TABLE "creator_topics" DROP CONSTRAINT IF EXISTS "creator_topics_slug_unique";--> statement-breakpoint
ALTER TABLE "creator_topics" ADD CONSTRAINT "creator_topics_creator_id_slug_unique" UNIQUE("creator_id","slug");
