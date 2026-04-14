"use client";

import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { createPost } from "@/app/actions/post";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function PostEmptyState({
  type,
  creatorId,
}: {
  type: "published" | "drafts";
  creatorId: string;
}) {
  const router = useRouter();
  const title =
    type === "published" ? "No published posts yet" : "No drafts";

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <FileText />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>Get started by creating your first post.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button
          onClick={async () => {
            const { data, error } = await createPost(creatorId);
            if (error) {
              toast.error(error.message);
              return;
            }
            if (data) {
              toast.success("Post created successfully");
              router.push(`/creator/post/${data.id}`);
            }
          }}
        >
          Create a new post
        </Button>
      </EmptyContent>
    </Empty>
  );
}
