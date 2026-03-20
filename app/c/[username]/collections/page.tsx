import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Layers } from "lucide-react";
import {
  getCreatorCollectionsByCreatorId,
  getPublicCreatorBySlug,
} from "@/lib/db/queries";
import { PublicCreatorPageShell } from "@/components/creator/public-creator-page-shell";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type Props = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const { data: creator } = await getPublicCreatorBySlug(username);
  if (!creator) {
    return { title: "Collections" };
  }
  return {
    title: `Collections · ${creator.displayName} (@${creator.username})`,
  };
}

export default async function CreatorCollectionsPage({ params }: Props) {
  const { username } = await params;
  const { data: creator } = await getPublicCreatorBySlug(username);
  if (!creator) {
    notFound();
  }

  const { data: collections = [] } = await getCreatorCollectionsByCreatorId(
    creator.id
  );

  return (
    <PublicCreatorPageShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Collections</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Groups of posts from {creator.displayName}.
          </p>
        </div>

        {collections.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            This creator hasn&apos;t created collections yet.
          </p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2">
            {collections.map((c) => (
              <li key={c.id}>
                <Link href={`/c/${username}/collections/${c.id}`}>
                  <Card className="h-full overflow-hidden transition-colors hover:bg-muted/40">
                    <div className="relative aspect-[16/9] w-full bg-muted">
                      {c.coverImageUrl ? (
                        <Image
                          src={c.coverImageUrl}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="(max-width: 640px) 100vw, 50vw"
                          unoptimized
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-muted via-muted/70 to-background" />
                      )}
                    </div>
                    <CardHeader>
                      <div className="text-muted-foreground mb-1 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide">
                        <Layers className="size-3.5" aria-hidden />
                        Collection
                      </div>
                      <CardTitle className="text-lg">{c.name}</CardTitle>
                      <CardDescription className="line-clamp-3">
                        {c.description?.trim() ||
                          "Browse posts in this collection."}
                      </CardDescription>
                    </CardHeader>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </PublicCreatorPageShell>
  );
}
