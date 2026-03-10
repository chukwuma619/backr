import { getCreatorForDashboard } from "@/lib/creators/get-creator-for-dashboard";
import { getDraftPostsByCreatorId } from "@/lib/db/queries";
import { TabsContent } from "@/components/ui/tabs";
import { PostListItem } from "@/components/creator/post-list-item";
import { PostEmptyState } from "@/components/creator/post-empty-state";

export default async function CreatorPostDraftPage() {
  const { creator } = await getCreatorForDashboard();

  if (!creator) {
    return null;
  }

  const { data: draftPosts } = await getDraftPostsByCreatorId(creator.id);

  return (
    <TabsContent value="drafts" className="mt-4">
      {(draftPosts ?? []).length > 0 ? (
        <ul>
          {(draftPosts ?? []).map((post) => (
            <PostListItem key={post.id} post={post} />
          ))}
        </ul>
      ) : (
        <PostEmptyState type="drafts" creatorId={creator.id} />
      )}
    </TabsContent>
  );
}
