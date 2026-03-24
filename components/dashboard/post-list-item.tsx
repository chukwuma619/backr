"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { EditPostDialog } from "./edit-post-dialog";
import type { PostWithResolvedBody } from "@/lib/posts/resolve-post-body";
import { htmlToPlainPreview } from "@/lib/posts/html-preview";

export function PostListItem({ post }: { post: PostWithResolvedBody }) {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <li className="border-b pb-4 last:border-0 last:pb-0">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <p className="font-medium">{post.title}</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setEditOpen(true)}
        >
          Edit
        </Button>
      </div>
      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
        {htmlToPlainPreview(post.resolvedBody, 320)}
      </p>
      <p className="text-xs text-muted-foreground mt-2">
        {format(new Date(post.publishedAt ?? post.createdAt), "MMM d, yyyy")}
      </p>
      <EditPostDialog
        post={post}
        resolvedBodyHtml={post.resolvedBody}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </li>
  );
}
