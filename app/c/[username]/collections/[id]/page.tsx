import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import {
  getPatronagesByUserId,
  getPublicCreatorBySlug,
  getPublicCreatorCollectionById,
  getPublicPostAccessFlagsByCreator,
  getPublishedPostsByCollectionId,
} from "@/lib/db/queries";
import { PublicPostsSection } from "@/components/creator/public-posts-section";
import { attachResolvedPostBodies } from "@/lib/posts/resolve-post-body";

type Props = {
  params: Promise<{ username: string; id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username, id } = await params;
  const collectionId = parseInt(id, 10);
  const { data: creator } = await getPublicCreatorBySlug(username);
  if (!creator || !Number.isFinite(collectionId) || collectionId < 1) {
    return { title: "Collection" };
  }
  const { data: collection } = await getPublicCreatorCollectionById(
    creator.id,
    collectionId
  );
  if (!collection) {
    return { title: "Collection" };
  }
  return {
    title: `${collection.name} · ${creator.displayName} (@${creator.username})`,
    description: collection.description?.slice(0, 160) ?? undefined,
  };
}

export default async function CreatorCollectionDetailPage({ params }: Props) {
  const { username, id } = await params;
  const collectionId = parseInt(id, 10);
  if (!Number.isFinite(collectionId) || collectionId < 1) {
    notFound();
  }

  const { data: creator } = await getPublicCreatorBySlug(username);
  if (!creator) {
    notFound();
  }

  const { data: collection } = await getPublicCreatorCollectionById(
    creator.id,
    collectionId
  );
  if (!collection) {
    notFound();
  }

  const user = await getCurrentUser();
  let patronTierId: string | null = null;
  if (user) {
    const { data: patronages } = await getPatronagesByUserId(user.id);
    patronTierId =
      patronages?.find((p) => p.creatorId === creator.id)?.patronage.tierId ??
      null;
  }

  const { data: posts = [] } = await getPublishedPostsByCollectionId(
    collectionId
  );
  const accessMap = await getPublicPostAccessFlagsByCreator(
    posts.map((p) => ({
      id: p.id,
      audience: p.audience ?? null,
      creatorId: p.creatorId,
    })),
    patronTierId ? new Map([[creator.id, patronTierId]]) : new Map()
  );
  const postsWithBodies = await attachResolvedPostBodies(
    posts,
    (p) => p.audience !== "paid" || (accessMap.get(p.id) ?? false)
  );

  return (
    <div className="w-full px-4 pb-16 pt-6">
      <div className="space-y-8">
        <div>
          <p className="text-muted-foreground text-sm">
            <Link
              href={`/c/${username}/collections`}
              className="text-foreground hover:underline"
            >
              Collections
            </Link>
            <span className="text-border mx-2">/</span>
            <span>{collection.name}</span>
          </p>
          <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-start">
            <div className="relative aspect-video w-full max-w-md shrink-0 overflow-hidden rounded-lg border bg-muted sm:aspect-[16/10] sm:max-w-xs">
              {collection.coverImageUrl ? (
                <Image
                  src={collection.coverImageUrl}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 320px"
                  unoptimized
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-muted via-muted/70 to-background" />
              )}
            </div>
            <div className="min-w-0 flex-1 space-y-2">
              <h1 className="text-2xl font-semibold tracking-tight">
                {collection.name}
              </h1>
              {collection.description ? (
                <p className="text-muted-foreground max-w-prose text-sm leading-relaxed whitespace-pre-wrap">
                  {collection.description}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        <PublicPostsSection
          username={username}
          posts={postsWithBodies}
          accessMap={accessMap}
          title="Posts in this collection"
          description="Published posts in this group, newest first"
          emptyMessage="No published posts in this collection yet."
        />

        <div className="flex flex-wrap gap-3">
          <Link
            href={`/c/${username}/post`}
            className="text-primary text-sm font-medium hover:underline"
          >
            View all posts
          </Link>
          <Link
            href={`/c/${username}/membership`}
            className="text-muted-foreground text-sm hover:text-foreground hover:underline"
          >
            Membership
          </Link>
        </div>
      </div>
    </div>
  );
}
