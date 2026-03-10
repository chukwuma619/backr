import { getCreatorForDashboard } from "@/lib/creators/get-creator-for-dashboard";
import { getPublishedPostsByCreatorId } from "@/lib/db/queries";
import { TabsContent } from "@/components/ui/tabs";
import { PostListItem } from "@/components/creator/post-list-item";
import { PostEmptyState } from "@/components/creator/post-empty-state";

export default async function CreatorPostListPage() {
  const { creator } = await getCreatorForDashboard();

  if (!creator) {
    return null;
  }

  const { data: publishedPosts } = await getPublishedPostsByCreatorId(
    creator.id
  );

  return (
    <TabsContent value="published" className="mt-4">
      {(publishedPosts ?? []).length > 0 ? (
        <ul>
          {(publishedPosts ?? []).map((post) => (
            <PostListItem key={post.id} post={post} />
          ))}
        </ul>
      ) : (
        <PostEmptyState type="published" creatorId={creator.id} />
      )}
    </TabsContent>
  );
}
