import { CreateCollectionDialog } from "@/components/creator/collections/create-collection-dialog";
import { CollectionListCard } from "@/components/creator/collections/collection-list-card";
import { getCreatorForDashboard } from "@/lib/creators/get-creator-for-dashboard";
import { getCreatorCollectionsByCreatorId } from "@/lib/db/queries";

export default async function CreatorCollectionsPage() {
  const { creator } = await getCreatorForDashboard();
  if (!creator) return null;

  const { data: items = [] } = await getCreatorCollectionsByCreatorId(creator.id);

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Collections</h1>
          <p className="text-muted-foreground mt-1 max-w-prose text-sm">
            Group posts into collections. Public URLs use the numeric id (e.g.{" "}
            <span className="font-mono tabular-nums">/c/{creator.username}/collections/1</span>
            ).
          </p>
        </div>
        <CreateCollectionDialog />
      </div>
      {items.length === 0 ? (
        <div className="text-muted-foreground rounded-xl border border-dashed p-10 text-center text-sm">
          <p>No collections yet.</p>
          <p className="mt-2">
            Use <span className="text-foreground font-medium">New collection</span> to create
            one and organize your posts.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((c) => (
            <CollectionListCard key={c.id} collection={c} />
          ))}
        </div>
      )}
    </div>
  );
}
