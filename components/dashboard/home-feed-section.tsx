import Link from "next/link";
import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getGatedFeedForPatron } from "@/lib/db/queries";

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
        {feedItems.map(({ post, creatorDisplayName, creatorUsername, minTierName }) => (
          <Link key={post.id} href={`/c/${creatorUsername}`}>
            <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-base">{post.title}</CardTitle>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {format(new Date(post.publishedAt), "MMM d, yyyy")}
                  </span>
                </div>
                <CardDescription>
                  by {creatorDisplayName} · @{creatorUsername} · {minTierName}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {post.content}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
