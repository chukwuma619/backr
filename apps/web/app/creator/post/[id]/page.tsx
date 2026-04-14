import { notFound } from "next/navigation";
import { getCreatorForDashboard } from "@/lib/creators/get-creator-for-dashboard";
import {
  getCreatorCollectionsByCreatorId,
  getPostById,
  getPostCollectionIds,
  getPostPaidAudienceTierIds,
  getTiersByCreatorId,
} from "@/lib/db/queries";
import {
  resolvePostBodyHtml,
  stripPostKeyForClient,
} from "@/lib/posts/resolve-post-body";
import { PostEditor } from "@/components/creator/post-editor";
import { PostStatusButton } from "@/components/creator/post-status-button";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, EyeIcon } from "lucide-react";
import Link from "next/link";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function CreatorPostDetailPage({ params }: Props) {
  const { id } = await params;
  const { creator } = await getCreatorForDashboard();

  if (!creator) {
    return notFound();
  }

  const { data: post, error: postError } = await getPostById(id);

  if (postError || !post || post.creatorId !== creator.id) {
    return notFound();
  }

  const resolvedBodyHtml = await resolvePostBodyHtml(post, () => true);

  const [
    { data: paidTierIds = [] },
    { data: tiers = [] },
    { data: collections = [] },
    { data: postCollectionIds },
  ] = await Promise.all([
    getPostPaidAudienceTierIds(post.id),
    getTiersByCreatorId(creator.id),
    getCreatorCollectionsByCreatorId(creator.id),
    getPostCollectionIds(post.id),
  ]);

  return (
    <PostEditor
      post={stripPostKeyForClient(post)}
      resolvedBodyHtml={resolvedBodyHtml}
      tiers={tiers ?? []}
      paidAudienceTierIds={paidTierIds ?? []}
      collections={collections.map((c) => ({ id: c.id, name: c.name }))}
      postCollectionIds={postCollectionIds ?? []}
      header={
        <div className="flex flex-col sm:flex-row flex-wrap justify-between items-stretch sm:items-center gap-3">
          <Button type="button" variant="ghost" asChild className="self-start">
            <Link href="/creator/post">
              <ArrowLeftIcon className="size-4" /> Back
            </Link>
          </Button>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex-1 sm:flex-none min-w-0"
            >
              <EyeIcon className="size-4" /> Preview
            </Button>
            <PostStatusButton postId={post.id} status={post.status} />
          </div>
        </div>
      }
    />
  );
}
