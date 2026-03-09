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

      <PostCreateForm creator={creator} tiers={tiers ?? []} />

  );
}
