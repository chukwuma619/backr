import Link from "next/link";
import { getCreatorForDashboard } from "@/lib/creators/get-creator-for-dashboard";
import { getTiersByCreatorId } from "@/lib/db/queries";
import { PostCreateForm } from "@/components/creator/post-create-form";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export default async function CreatorPostNewPage() {
  const { creator } = await getCreatorForDashboard();

  if (!creator) {
    return null;
  }

  const { data: tiers } = await getTiersByCreatorId(creator.id);

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
            Create post
          </h1>
          <p className="text-muted-foreground mt-1">
            Share an update with your supporters.
          </p>
        </div>
      </div>

      <PostCreateForm creator={creator} tiers={tiers ?? []} />
    </div>
  );
}
