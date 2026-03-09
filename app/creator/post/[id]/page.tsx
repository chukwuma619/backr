import Link from "next/link";
import { notFound } from "next/navigation";
import { getCreatorForDashboard } from "@/lib/creators/get-creator-for-dashboard";
import { getPostById } from "@/lib/db/queries";
import { PostDetailSection } from "@/components/creator/post-detail-section";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

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
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/creator/post">
            <ChevronLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {post.title}
          </h1>
          <p className="text-muted-foreground mt-1">
            View, edit, and manage this post.
          </p>
        </div>
      </div>

      <PostDetailSection post={post} creator={creator} />
    </div>
  );
}
