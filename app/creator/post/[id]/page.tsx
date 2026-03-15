import { notFound } from "next/navigation";
import { getCreatorForDashboard } from "@/lib/creators/get-creator-for-dashboard";
import {
  getPostById,
  getPostPaidAudienceTierIds,
  getTiersByCreatorId,
} from "@/lib/db/queries";
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

  const [{ data: paidTierIds = [] }, { data: tiers = [] }] = await Promise.all([
    getPostPaidAudienceTierIds(post.id),
    getTiersByCreatorId(creator.id),
  ]);

  return (
    <PostEditor
      post={post}
      tiers={tiers ?? []}
      paidAudienceTierIds={paidTierIds ?? []}
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
