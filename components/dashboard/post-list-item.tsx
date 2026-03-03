"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { EditPostDialog } from "./edit-post-dialog";
import type { Post } from "@/lib/db/schema";

export function PostListItem({ post }: { post: Post }) {
  const [editOpen, setEditOpen] = useState(false);

  return (
    <li className="border-b pb-4 last:border-0 last:pb-0">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <p className="font-medium">{post.title}</p>
          {post.ckbfsOutpoint && (
            <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">
              On-chain
            </span>
          )}
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
        {post.body}
      </p>
      <p className="text-xs text-muted-foreground mt-2">
        {format(new Date(post.publishedAt), "MMM d, yyyy")}
      </p>
      <EditPostDialog
        post={post}
        open={editOpen}
        onOpenChange={setEditOpen}
      />
    </li>
  );
}
