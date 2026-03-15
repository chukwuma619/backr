"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { updatePostStatus } from "@/app/actions/post";
import type { PostStatus } from "@/lib/db/schema";

type PostStatusButtonProps = {
  postId: number;
  status: PostStatus;
};

export function PostStatusButton({ postId, status }: PostStatusButtonProps) {
  const [isPending, startTransition] = useTransition();

  const nextStatus: PostStatus = status === "draft" ? "published" : "draft";
  const label = status === "draft" ? "Publish" : "Unpublish";

  function handleClick() {
    startTransition(async () => {
      const { data, error } = await updatePostStatus(postId, nextStatus);
      if (error) {
        toast.error(error.message);
        return;
      }
      if (data) {
        toast.success(
          data.status === "published" ? "Post published" : "Post unpublished"
        );
      }
    });
  }

  return (
    <Button
      type="button"
      variant="default"
      onClick={handleClick}
      disabled={isPending}
    >
      {isPending ? "Updating…" : label}
    </Button>
  );
}
