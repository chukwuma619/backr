import Link from "next/link";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getGatedFeedForPatron,
  getPatronTierIdsByCreatorForUser,
  getPublicPostAccessFlagsByCreator,
} from "@/lib/db/queries";
import { htmlToPlainPreview } from "@/lib/posts/html-preview";
import { resolvePostBodyHtml } from "@/lib/posts/resolve-post-body";

export async function HomeFeedSection({ userId }: { userId: string }) {
  const { data: feedItems, error } = await getGatedFeedForPatron(userId);

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Feed</CardTitle>
          <CardDescription>Unable to load your feed.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (!feedItems || feedItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your feed</CardTitle>
          <CardDescription>
            Latest updates from creators you support. Support creators to see
            their posts here.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No posts yet. Discover and support creators to see their exclusive
            content.
          </p>
        </CardContent>
      </Card>
    );
  }

  const tierMap = await getPatronTierIdsByCreatorForUser(userId);
  const accessMap = await getPublicPostAccessFlagsByCreator(
    feedItems.map(({ post }) => ({
      id: post.id,
      audience: post.audience ?? null,
      creatorId: post.creatorId,
    })),
    tierMap
  );

  const feedBodies = await Promise.all(
    feedItems.map(({ post }) =>
      resolvePostBodyHtml(
        post,
        (p) => p.audience !== "paid" || (accessMap.get(p.id) ?? false)
      )
    )
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold tracking-tight mb-1">
          Latest updates
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Recent posts from creators you follow
        </p>
      </div>
      <div className="space-y-4">
        {feedItems.map(({ post, creatorDisplayName, creatorUsername, minTierName }, i) => (
          <Link key={post.id} href={`/c/${creatorUsername}`}>
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base">{post.title}</CardTitle>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {format(new Date(post.publishedAt ?? post.createdAt), "MMM d, yyyy")}
                  </span>
                </div>
                <CardDescription>
                  by {creatorDisplayName} · @{creatorUsername} · {minTierName}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {htmlToPlainPreview(feedBodies[i] ?? "", 400)}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
