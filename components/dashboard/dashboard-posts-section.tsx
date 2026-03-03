import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getPostsByCreatorId } from "@/lib/db/queries";
import { PostForm } from "./post-form";
import { PostListItem } from "./post-list-item";
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
                <PostListItem key={post.id} post={post} />
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
