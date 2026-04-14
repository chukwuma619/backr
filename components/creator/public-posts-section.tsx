import Link from "next/link";
import { format } from "date-fns";
import { PublicPostCard } from "@/components/creator/public-post-card";
import { getPublicPostHeroImage } from "@/lib/posts/post-hero";
import { htmlToPlainPreview } from "@/lib/posts/html-preview";
import type { PostWithResolvedBody } from "@/lib/posts/resolve-post-body";

type Props = {
  username: string;
  posts: PostWithResolvedBody[];
  accessMap: Map<number, boolean>;
  title: string;
  description?: string;
  showViewAll?: boolean;
  emptyMessage?: string;
};

export function PublicPostsSection({
  username,
  posts,
  accessMap,
  title,
  description,
  showViewAll,
  emptyMessage = "No published posts yet.",
}: Props) {
  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          {description ? (
            <p className="text-muted-foreground mt-0.5 text-sm">{description}</p>
          ) : null}
        </div>
        {showViewAll ? (
          <Link
            href={`/c/${username}/post`}
            className="text-primary text-sm font-medium hover:underline"
          >
            View all
          </Link>
        ) : null}
      </div>

      {posts.length === 0 ? (
        <p className="text-muted-foreground text-sm">{emptyMessage}</p>
      ) : (
        <div className="space-y-4">
          {posts.map((post) => {
            const canView = accessMap.get(post.id) ?? false;
            const isPaid = post.audience === "paid";
            const date = post.publishedAt ?? post.createdAt;

            return (
              <PublicPostCard
                key={post.id}
                username={username}
                title={post.title}
                dateLabel={format(new Date(date), "MMM d, yyyy")}
                heroImageUrl={getPublicPostHeroImage(post, post.resolvedBody)}
                canView={canView}
                isPaid={isPaid}
                previewText={
                  canView
                    ? htmlToPlainPreview(post.resolvedBody, 500)
                    : undefined
                }
                variant="default"
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
