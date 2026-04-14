"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";
import { PlusIcon } from "lucide-react";
import { addPostsToCreatorCollection } from "@/app/actions/collections";
import type { Post } from "@/lib/db/schema";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

export function AddPostsToCollectionDialog({
  collectionId,
  allPosts,
  inCollectionPostIds,
}: {
  collectionId: number;
  allPosts: Post[];
  inCollectionPostIds: number[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [pending, setPending] = useState(false);

  const inSet = useMemo(
    () => new Set(inCollectionPostIds),
    [inCollectionPostIds]
  );

  const available = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allPosts.filter((p) => {
      if (inSet.has(p.id)) return false;
      if (!q) return true;
      return p.title.toLowerCase().includes(q);
    });
  }, [allPosts, inSet, query]);

  function toggle(id: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  async function onAdd() {
    if (selected.size === 0) return;
    setPending(true);
    try {
      const result = await addPostsToCreatorCollection(
        String(collectionId),
        [...selected]
      );
      if ("ok" in result && result.ok) {
        toast.success(
          selected.size === 1 ? "Post added to collection" : "Posts added to collection"
        );
        setSelected(new Set());
        setOpen(false);
        router.refresh();
        return;
      }
      if ("error" in result) {
        toast.error(
          typeof result.error === "string" ? result.error : "Could not add posts"
        );
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setQuery("");
          setSelected(new Set());
        }
      }}
    >
      <DialogTrigger asChild>
        <Button type="button" size="sm">
          <PlusIcon className="size-4" aria-hidden />
          Add posts
        </Button>
      </DialogTrigger>
      <DialogContent className="flex max-h-[min(90vh,560px)] flex-col sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add posts</DialogTitle>
          <DialogDescription>
            Choose published or draft posts to include in this collection. Only
            posts not already in the collection are listed.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="collection-add-post-search" className="sr-only">
            Search posts
          </Label>
          <Input
            id="collection-add-post-search"
            placeholder="Search by title…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        {available.length === 0 ? (
          <p className="text-muted-foreground py-6 text-center text-sm">
            {allPosts.length === 0
              ? "You have no posts yet. Create a post first."
              : inSet.size >= allPosts.length
                ? "Every post is already in this collection."
                : "No posts match your search."}
          </p>
        ) : (
          <ScrollArea className="max-h-[min(50vh,320px)] pr-3">
            <ul className="space-y-2">
              {available.map((post) => {
                const checked = selected.has(post.id);
                const date = post.publishedAt ?? post.createdAt;
                return (
                  <li
                    key={post.id}
                    className="flex items-start gap-3 rounded-lg border p-3"
                  >
                    <Checkbox
                      id={`add-post-${post.id}`}
                      checked={checked}
                      onCheckedChange={() => toggle(post.id)}
                      aria-labelledby={`add-post-label-${post.id}`}
                    />
                    <div className="min-w-0 flex-1">
                      <Label
                        id={`add-post-label-${post.id}`}
                        htmlFor={`add-post-${post.id}`}
                        className="cursor-pointer font-medium leading-snug"
                      >
                        {post.title}
                      </Label>
                      <p className="text-muted-foreground mt-1 text-xs tabular-nums">
                        {format(new Date(date), "MMM d, yyyy")} ·{" "}
                        {post.status === "published" ? "Published" : "Draft"}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </ScrollArea>
        )}
        <DialogFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            disabled={selected.size === 0 || pending}
            onClick={() => void onAdd()}
          >
            {pending ? "Adding…" : `Add${selected.size ? ` (${selected.size})` : ""}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
