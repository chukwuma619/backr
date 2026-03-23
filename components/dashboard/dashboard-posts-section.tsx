import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getPostsByCreatorId } from "@/lib/db/queries";
import { PostListItem } from "./post-list-item";
import type { Creator } from "@/lib/db/schema";

export async function DashboardPostsSection({ creator }: { creator: Creator }) {
  const { data: posts, error } = await getPostsByCreatorId(creator.id);

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
      <div className="flex justify-end">
        <Button asChild size="sm">
          <Link href="/creator/post/draft">Create a post</Link>
        </Button>
      </div>

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
