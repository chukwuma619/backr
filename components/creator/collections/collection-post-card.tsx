"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import { XIcon } from "lucide-react";
import { removePostFromCreatorCollection } from "@/app/actions/collections";
import type { Post as PostRow } from "@/lib/db/schema";

type Post = Omit<PostRow, "postKeyEncrypted">;
import { getPublicPostHeroImage } from "@/lib/posts/post-hero";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CollectionPostCard({
  post,
  resolvedBodyHtml,
  collectionId,
}: {
  post: Post;
  resolvedBodyHtml: string;
  collectionId: number;
}) {
  const router = useRouter();
  const hero = getPublicPostHeroImage(post, resolvedBodyHtml);
  const date = post.publishedAt ?? post.createdAt;

  async function onRemove(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Remove this post from the collection?")) return;
    const result = await removePostFromCreatorCollection(
      String(collectionId),
      String(post.id)
    );
    if ("ok" in result && result.ok) {
      toast.success("Removed from collection");
      router.refresh();
      return;
    }
    if ("error" in result) {
      toast.error(
        typeof result.error === "string" ? result.error : "Could not remove"
      );
    }
  }

  return (
    <article
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-sm"
      )}
    >
      <Link href={`/creator/post/${post.id}`} className="flex min-h-0 flex-1 flex-col">
        <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden bg-muted">
          {hero ? (
            <Image
              src={hero}
              alt=""
              fill
              className="object-cover transition-transform group-hover:scale-[1.02]"
              sizes="(max-width: 640px) 100vw, 50vw"
              unoptimized
            />
          ) : (
            <div
              className="absolute inset-0 bg-gradient-to-br from-muted via-muted/70 to-background"
              aria-hidden
            />
          )}
        </div>
        <div className="flex flex-1 flex-col gap-2 p-4">
          <h3 className="line-clamp-2 font-semibold leading-snug tracking-tight">
            {post.title}
          </h3>
          <div className="mt-auto flex flex-wrap items-center gap-2">
            <span className="text-muted-foreground text-xs tabular-nums">
              {format(new Date(date), "MMM d, yyyy")}
            </span>
            <Badge variant="secondary" className="text-xs capitalize">
              {post.status}
            </Badge>
          </div>
        </div>
      </Link>
      <div className="border-t p-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="text-muted-foreground hover:text-destructive w-full justify-start"
          onClick={onRemove}
        >
          <XIcon className="size-4" aria-hidden />
          Remove from collection
        </Button>
      </div>
    </article>
  );
}
