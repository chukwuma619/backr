"use client";

import Link from "next/link";
import { format } from "date-fns";
import { FileText } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NostrShareLinks } from "@/components/nostr-share-links";
import type { Post } from "@/lib/db/schema";

type PostListSectionProps = {
  posts: Post[];
};

function PostListItem({ post }: { post: Post }) {
  const contentPreview =
    typeof post.content === "string"
      ? post.content.replace(/<[^>]*>/g, "").slice(0, 120)
      : "";

  return (
    <Link href={`/creator/post/${post.id}`}>
      <li className="group flex items-start gap-4 border-b border-border py-4 last:border-0 hover:bg-muted/50 -mx-4 px-4 rounded-lg transition-colors">
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{post.title}</p>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
            {contentPreview || "No content"}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs text-muted-foreground">
              {format(new Date(post.publishedAt), "MMM d, yyyy")}
            </span>
            {post.nostrEventId && (
              <>
                <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">
                  On Nostr
                </span>
                <NostrShareLinks eventId={post.nostrEventId} />
              </>
            )}
          </div>
        </div>
        <span className="text-sm text-muted-foreground shrink-0 group-hover:text-foreground">
          View →
        </span>
      </li>
    </Link>
  );
}

export function PostListSection({ posts }: PostListSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Your posts</CardTitle>
        <CardDescription>
          Exclusive content for your patrons, ordered by publish date.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {posts && posts.length > 0 ? (
          <ul>
            {posts.map((post) => (
              <PostListItem key={post.id} post={post} />
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="size-12 text-muted-foreground/50 mb-4" />
            <p className="text-sm text-muted-foreground">
              No posts yet.{" "}
              <Link
                href="/creator/post/new"
                className="text-primary hover:underline font-medium"
              >
                Create your first exclusive post
              </Link>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
