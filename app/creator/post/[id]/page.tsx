import { notFound } from "next/navigation";
import { getCreatorForDashboard } from "@/lib/creators/get-creator-for-dashboard";
import {
  getPostById,
  getPostPaidAudienceTierIds,
  getTiersByCreatorId,
} from "@/lib/db/queries";
import { PostForm } from "@/components/creator/post-form";
import { PostStatusButton } from "@/components/creator/post-status-button";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, EyeIcon } from "lucide-react";
import Link from "next/link";
import { PostSettings } from "@/components/creator/post-settings";

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
    <div className="flex h-full">
      <div className="space-y-6 w-full pr-4">
        <div className="flex justify-between items-center">
          <Button type="button" variant="ghost" asChild>
            <Link href="/creator/post">
              <ArrowLeftIcon className="size-4" /> Back
            </Link>
          </Button>
          <div className="flex gap-2">
            <Button type="button" variant="outline">
              <EyeIcon className="size-4" /> Preview
            </Button>

            <PostStatusButton postId={post.id} status={post.status} />
          </div>
        </div>
        <PostForm post={post} />
      </div>
      <PostSettings
        post={post}
        tiers={tiers ?? []}
        paidAudienceTierIds={paidTierIds ?? []}
      />
    </div>
  );
}
