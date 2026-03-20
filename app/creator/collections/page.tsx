import Link from "next/link";
import { Layers } from "lucide-react";
import { getCreatorForDashboard } from "@/lib/creators/get-creator-for-dashboard";
import { getCreatorCollectionsByCreatorId } from "@/lib/db/queries";
import { CreateCollectionForm } from "@/components/creator/create-collection-form";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function CreatorCollectionsPage() {
  const { creator } = await getCreatorForDashboard();
  if (!creator) return null;

  const { data: items = [] } = await getCreatorCollectionsByCreatorId(creator.id);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Collections</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Group posts into collections. Public URLs use the numeric id (e.g.{" "}
          <span className="font-mono tabular-nums">/c/yourname/collections/1</span>
          ).
        </p>
      </div>
      <CreateCollectionForm />
      {items.length === 0 ? (
        <p className="text-muted-foreground text-sm">No collections yet.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((c) => (
            <li key={c.id}>
              <Link href={`/creator/collections/${c.id}`}>
                <Card className="transition-colors hover:bg-muted/40">
                  <CardHeader>
                    <div className="text-muted-foreground mb-1 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide">
                      <Layers className="size-3.5" aria-hidden />
                      Collection #{c.id}
                    </div>
                    <CardTitle className="text-lg">{c.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {c.description?.trim() || "No description"}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
