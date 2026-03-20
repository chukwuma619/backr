import Link from "next/link";
import Image from "next/image";
import { Layers } from "lucide-react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export type PublicCollectionCard = {
  id: number;
  name: string;
  description: string | null;
  coverImageUrl: string | null;
};

export function PublicCollectionsRow({
  username,
  collections,
}: {
  username: string;
  collections: PublicCollectionCard[];
}) {
  if (collections.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Collections</h2>
          <p className="text-muted-foreground mt-0.5 text-sm">
            Curated groups of posts from this creator
          </p>
        </div>
        <Link
          href={`/c/${username}/collections`}
          className="text-primary text-sm font-medium hover:underline"
        >
          See all
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {collections.map((c) => (
          <Link
            key={c.id}
            href={`/c/${username}/collections/${c.id}`}
            className="w-[min(100%,240px)] shrink-0"
          >
            <Card className="h-full overflow-hidden transition-colors hover:bg-muted/40">
              <div className="relative aspect-[16/10] w-full bg-muted">
                {c.coverImageUrl ? (
                  <Image
                    src={c.coverImageUrl}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="240px"
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-muted via-muted/70 to-background" />
                )}
              </div>
              <CardHeader className="pb-2">
                <div className="text-muted-foreground mb-1 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide">
                  <Layers className="size-3.5" aria-hidden />
                  Collection
                </div>
                <CardTitle className="line-clamp-2 text-base">{c.name}</CardTitle>
                <CardDescription className="line-clamp-2">
                  {c.description?.trim() || "Open to browse posts in this collection."}
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </section>
  );
}
