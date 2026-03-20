import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import { getCreatorForDashboard } from "@/lib/creators/get-creator-for-dashboard";
import { getCreatorCollectionByIdForCreator } from "@/lib/db/queries";
import { EditCollectionForm } from "@/components/creator/edit-collection-form";
import { Button } from "@/components/ui/button";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function CreatorCollectionEditPage({ params }: Props) {
  const { id } = await params;
  const collectionId = parseInt(id, 10);
  if (!Number.isFinite(collectionId) || collectionId < 1) {
    notFound();
  }

  const { creator } = await getCreatorForDashboard();
  if (!creator) {
    notFound();
  }

  const { data: collection } = await getCreatorCollectionByIdForCreator(
    collectionId,
    creator.id
  );
  if (!collection) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Button type="button" variant="ghost" asChild className="self-start">
        <Link href="/creator/collections">
          <ArrowLeftIcon className="size-4" /> Back
        </Link>
      </Button>
      <EditCollectionForm collection={collection} />
    </div>
  );
}
