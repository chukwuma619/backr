import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getPostsByCreatorId } from "@/lib/db/queries";
import { PostForm } from "./post-form";
import { format } from "date-fns";
import type { Tier } from "@/lib/db/schema";

export async function DashboardPostsSection({
  creatorId,
  tiers,
}: {
  creatorId: string;
  tiers: Tier[];
}) {
  const { data: posts, error } = await getPostsByCreatorId(creatorId);

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Posts</CardTitle>
          <CardDescription>Unable to load posts.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-8">
      <PostForm tiers={tiers} />

      <Card>
        <CardHeader>
          <CardTitle>Your posts</CardTitle>
          <CardDescription>
            Exclusive content for your patrons, ordered by publish date.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {posts && posts.length > 0 ? (
            <ul className="space-y-4">
              {posts.map((post) => (
              <li
                key={post.id}
                className="border-b pb-4 last:border-0 last:pb-0"
              >
                <div className="flex items-center gap-2">
                  <p className="font-medium">{post.title}</p>
                  {post.ckbfsOutpoint && (
                    <span className="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary">
                      On-chain
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {post.body}
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  {format(new Date(post.publishedAt), "MMM d, yyyy")}
                </p>
              </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              No posts yet. Publish your first exclusive post above.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
