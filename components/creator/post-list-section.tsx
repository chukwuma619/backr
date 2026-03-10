"use client";

import { useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PostListItem } from "./post-list-item";
import { PostEmptyState } from "./post-empty-state";
import type { Post } from "@/lib/db/schema";

type PostListSectionProps = {
  posts: Post[];
};

export function PostListSection({ posts }: PostListSectionProps) {
  const publishedPosts = useMemo(
    () => (posts ?? []).filter((p) => p.status === "published"),
    [posts],
  );
  const draftPosts = useMemo(
    () => (posts ?? []).filter((p) => p.status === "draft"),
    [posts],
  );

  return (
    <Tabs defaultValue="posts">
      <TabsList>
        <TabsTrigger value="published">Published </TabsTrigger>
        <TabsTrigger value="drafts">Drafts </TabsTrigger>
      </TabsList>
     
      <TabsContent value="drafts" className="mt-4">
        {draftPosts.length > 0 ? (
          <ul>
            {draftPosts.map((post) => (
              <PostListItem key={post.id} post={post} />
            ))}
          </ul>
        ) : (
          <PostEmptyState type="drafts" />
        )}
      </TabsContent>
    </Tabs>
  );
}
