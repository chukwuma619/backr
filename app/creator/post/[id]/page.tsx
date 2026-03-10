import { notFound } from "next/navigation";
import { getCreatorForDashboard } from "@/lib/creators/get-creator-for-dashboard";
import { getPostById } from "@/lib/db/queries";
import { PostForm } from "@/components/creator/post-form";


type Props = {
  params: Promise<{ id: string }>;
};

export default async function CreatorPostDetailPage({ params }: Props) {
  const { id } = await params;
  const { creator } = await getCreatorForDashboard();

  if (!creator) {
    return null;
  }

  const { data: post, error } = await getPostById(id);

  if (error || !post || post.creatorId !== creator.id) {
    return notFound();
  }

  return <PostForm creator={creator} postId={id} post={post} />;
}
