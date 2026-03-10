import Link from "next/link";
import { FileText } from "lucide-react";

export function PostEmptyState({ type }: { type: "published" | "drafts" }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <FileText className="size-12 text-muted-foreground/50 mb-4" />
      <p className="text-sm text-muted-foreground">
        {type === "published"
          ? "No published posts yet."
          : "No drafts."}{" "}
        <Link
          href="/creator/post/new"
          className="text-primary hover:underline font-medium"
        >
          Create a new post
        </Link>
      </p>
    </div>
  );
}
