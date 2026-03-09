ALTER TABLE "creator_topics" RENAME COLUMN "topic" TO "label";--> statement-breakpoint
ALTER TABLE "creator_topics" ADD COLUMN "slug" text NOT NULL;--> statement-breakpoint
ALTER TABLE "creator_topics" ADD CONSTRAINT "creator_topics_slug_unique" UNIQUE("slug");