import Link from "next/link";
import { notFound } from "next/navigation";
import { getCreatorForDashboard } from "@/lib/creators/get-creator-for-dashboard";
import { getPostById } from "@/lib/db/queries";
import { PostDetailSection } from "@/components/creator/post-detail-section";


type Props = {
  params: Promise<{ id: string }>;
};

export default async function CreatorPostDetailPage({ params }: Props) {
  const { id } = await params;
  const { creator } = await getCreatorForDashboard();

  if (!creator) {
    return null;
  }

  const { data: post } = await getPostById(id);

  if (!post || post.creatorId !== creator.id) {
    notFound();
  }

  return (
 
      <PostDetailSection post={post} creator={creator} />
  );
}
