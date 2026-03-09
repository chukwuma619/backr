import Link from "next/link";
import { getCreatorForDashboard } from "@/lib/creators/get-creator-for-dashboard";
import { getPostsByCreatorId } from "@/lib/db/queries";
import { PostListSection } from "@/components/creator/post-list-section";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default async function CreatorPostListPage() {
  const { creator } = await getCreatorForDashboard();

  if (!creator) {
    return null;
  }

  const { data: posts } = await getPostsByCreatorId(creator.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Posts</h1>
          <p className="text-muted-foreground mt-1">
            Create and manage posts for your supporters.
          </p>
        </div>
        <Button asChild>
          <Link href="/creator/post/new">
            <Plus className="size-4 mr-2" />
            New post
          </Link>
        </Button>
      </div>

      <PostListSection posts={posts ?? []} />
    </div>
  );
}
