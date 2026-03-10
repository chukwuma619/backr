import Link from "next/link";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <FileText className="size-12 text-muted-foreground/50 mb-4" />
      <p className="text-sm text-muted-foreground">
        {type === "published" ? "No published posts yet." : "No drafts."}{" "}
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
          className="text-primary hover:underline font-medium"
        >
          Create a new post
        </Button>
      </p>
    </div>
  );
}
