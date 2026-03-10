import Link from "next/link";
import { format } from "date-fns";
import { NostrShareLinks } from "@/components/nostr-share-links";
import type { Post } from "@/lib/db/schema";

export function PostListItem({ post }: { post: Post }) {
  return (
    <Link href={`/creator/post/${post.id}`}>
      <li className="group flex items-start gap-4 border-b border-border py-4 last:border-0 hover:bg-muted/50 -mx-4 px-4 rounded-lg transition-colors">
        <div className="flex-1 min-w-0">
          <p className="font-medium truncate">{post.title}</p>

          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="text-xs text-muted-foreground">
              {format(
                new Date(post.publishedAt ?? post.createdAt),
                "MMM d, yyyy"
              )}
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
