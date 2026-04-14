import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeftIcon } from "lucide-react";
import { AddPostsToCollectionDialog } from "@/components/creator/collections/add-posts-to-collection-dialog";
import { CollectionPostCard } from "@/components/creator/collections/collection-post-card";
import { DeleteCollectionButton } from "@/components/creator/collections/delete-collection-button";
import { EditCollectionDialog } from "@/components/creator/collections/edit-collection-dialog";
import { Button } from "@/components/ui/button";
import { getCreatorForDashboard } from "@/lib/creators/get-creator-for-dashboard";
import {
  getCreatorCollectionByIdForCreator,
  getPostsByCreatorId,
  getPostsInCollectionForCreator,
} from "@/lib/db/queries";
import { attachResolvedPostBodies } from "@/lib/posts/resolve-post-body";

type Props = {
  params: Promise<{ id: string }>;
};

export default async function CreatorCollectionDetailPage({ params }: Props) {
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

  const [{ data: collectionPosts = [] }, { data: allPosts = [] }] =
    await Promise.all([
      getPostsInCollectionForCreator(collectionId, creator.id),
      getPostsByCreatorId(creator.id),
    ]);

  const collectionPostsWithBodies = await attachResolvedPostBodies(
    collectionPosts,
    () => true
  );

  const inCollectionPostIds = collectionPosts.map((p) => p.id);

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <Button type="button" variant="ghost" asChild className="self-start">
        <Link href="/creator/collections">
          <ArrowLeftIcon className="size-4" /> Back
        </Link>
      </Button>

      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="relative aspect-video w-full max-w-md shrink-0 overflow-hidden rounded-xl border bg-muted lg:aspect-[4/3] lg:max-w-sm">
          {collection.coverImageUrl ? (
            <Image
              src={collection.coverImageUrl}
              alt=""
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 320px"
              unoptimized
            />
          ) : (
            <div
              className="absolute inset-0 bg-gradient-to-br from-muted via-muted/70 to-background"
              aria-hidden
            />
          )}
        </div>

        <div className="min-w-0 flex-1 space-y-4">
          <div>
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
              Collection #{collection.id}
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              {collection.name}
            </h1>
            {collection.description?.trim() ? (
              <p className="text-muted-foreground mt-3 max-w-prose whitespace-pre-wrap text-sm leading-relaxed">
                {collection.description}
              </p>
            ) : null}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <AddPostsToCollectionDialog
              collectionId={collectionId}
              allPosts={allPosts ?? []}
              inCollectionPostIds={inCollectionPostIds}
            />
            <EditCollectionDialog collection={collection} />
            <DeleteCollectionButton
              collectionId={collectionId}
              variant="outline"
            />
          </div>
        </div>
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            Posts in this collection
          </h2>
          <p className="text-muted-foreground mt-0.5 text-sm">
            Open a post to edit it, or remove it from this collection from the
            card.
          </p>
        </div>
        {collectionPostsWithBodies.length === 0 ? (
          <p className="text-muted-foreground rounded-xl border border-dashed p-8 text-center text-sm">
            No posts in this collection yet. Use{" "}
            <span className="text-foreground font-medium">Add posts</span> to
            choose which posts belong here.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {collectionPostsWithBodies.map((post) => (
              <CollectionPostCard
                key={post.id}
                post={post}
                resolvedBodyHtml={post.resolvedBody}
                collectionId={collectionId}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
