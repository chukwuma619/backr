import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { format } from "date-fns";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import {
  getCreatorCollectionsByCreatorId,
  getCreatorSubscriptionForUser,
  getPatronagesByUserId,
  getPublicCreatorBySlug,
  getPublicPostAccessFlags,
  getPublishedPostsByCreatorId,
} from "@/lib/db/queries";
import { PublicCollectionsRow } from "@/components/creator/public-collections-row";
import { PublicCreatorPageShell } from "@/components/creator/public-creator-page-shell";
import {
  PublicPostCarousel,
  type PublicPostSlide,
} from "@/components/creator/public-post-carousel";
import { PublicPostCard } from "@/components/creator/public-post-card";
import { SubscribeButton } from "@/components/creator/subscribe-button";
import { PublicPostsSection } from "@/components/creator/public-posts-section";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import type { Post } from "@/lib/db/schema";
import { getPublicPostHeroImage } from "@/lib/posts/post-hero";

type Props = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const { data: creator } = await getPublicCreatorBySlug(username);
  if (!creator) {
    return { title: "Creator" };
  }
  return {
    title: `${creator.displayName} (@${creator.username}) · Backr`,
    description:
      creator.bio?.slice(0, 160) ?? `Creator on Backr: @${creator.username}`,
  };
}

function toSlides(
  posts: Post[],
  accessMap: Map<number, boolean>
): PublicPostSlide[] {
  return posts.map((post) => {
    const date = post.publishedAt ?? post.createdAt;
    const isPaid = post.audience === "paid";
    return {
      id: post.id,
      title: post.title,
      dateLabel: format(new Date(date), "MMM d, yyyy"),
      heroImageUrl: getPublicPostHeroImage(post),
      canView: accessMap.get(post.id) ?? false,
      isPaid,
      previewText: (post.content ?? "").slice(0, 400),
    };
  });
}

export default async function CreatorProfilePage({ params }: Props) {
  const { username } = await params;
  const [user, { data: creator }] = await Promise.all([
    getCurrentUser(),
    getPublicCreatorBySlug(username),
  ]);

  if (!creator) {
    notFound();
  }

  let isSubscribed = false;
  let isPatron = false;
  let patronTierId: string | null = null;

  if (user) {
    const [{ data: subscription }, { data: patronages }] = await Promise.all([
      getCreatorSubscriptionForUser(user.id, creator.id),
      getPatronagesByUserId(user.id),
    ]);

    isSubscribed = !!subscription;
    const patronRow = patronages?.find((p) => p.creatorId === creator.id);
    isPatron = !!patronRow;
    patronTierId = patronRow?.patronage.tierId ?? null;
  }

  const [{ data: allPosts = [] }, { data: collections = [] }] = await Promise.all([
    getPublishedPostsByCreatorId(creator.id),
    getCreatorCollectionsByCreatorId(creator.id),
  ]);

  const accessMap = await getPublicPostAccessFlags(
    allPosts.map((p) => ({ id: p.id, audience: p.audience ?? null })),
    patronTierId
  );

  const latestPost = allPosts[0];
  const recentCarouselPosts = allPosts.slice(1, 7);
  const moreCarouselPosts = allPosts.slice(7, 13);

  const recentSlides = toSlides(recentCarouselPosts, accessMap);
  const moreSlides = toSlides(moreCarouselPosts, accessMap);

  return (
    <>
      <div className="relative w-full">
        <div className="relative h-44 w-full overflow-hidden bg-muted sm:h-52 md:h-56">
          {creator.coverImageUrl ? (
            <Image
              src={creator.coverImageUrl}
              alt=""
              fill
              className="object-cover"
              sizes="100vw"
              unoptimized
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-muted via-muted/70 to-background" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
        </div>
      </div>

      <PublicCreatorPageShell className="pt-0">
        <div className="-mt-14 relative z-10 space-y-10 pt-6">
          <section className="relative overflow-hidden rounded-xl border bg-gradient-to-br from-muted/50 via-background to-background p-6 shadow-sm md:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="flex min-w-0 gap-4">
                <Avatar
                  size="lg"
                  className="size-20 shrink-0 border-4 border-background shadow-sm md:size-24"
                >
                  <AvatarImage
                    src={creator.avatarUrl ?? undefined}
                    alt=""
                    className="object-cover"
                  />
                  <AvatarFallback className="text-2xl font-semibold md:text-3xl">
                    {creator.displayName.slice(0, 1).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1 space-y-2">
                  <div>
                    <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
                      {creator.displayName}
                    </h1>
                    <p className="text-muted-foreground text-sm">
                      @{creator.username}
                    </p>
                  </div>
                  <p className="text-muted-foreground text-sm tabular-nums">
                    {creator.subscriberCount.toLocaleString()} subscriber
                    {creator.subscriberCount !== 1 ? "s" : ""}
                    <span className="text-border mx-2">·</span>
                    {creator.publishedPostCount.toLocaleString()} post
                    {creator.publishedPostCount !== 1 ? "s" : ""}
                  </p>
                  {creator.bio ? (
                    <p className="text-muted-foreground max-w-prose text-sm leading-relaxed">
                      {creator.bio}
                    </p>
                  ) : null}
                </div>
              </div>
              <div className="flex shrink-0 flex-wrap items-center gap-2 md:flex-col md:items-stretch">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="w-full sm:w-auto md:min-w-[10rem]"
                >
                  <Link href={`/c/${username}/membership`}>
                    View membership
                  </Link>
                </Button>
                {user ? (
                  <SubscribeButton
                    username={username}
                    isSubscribed={isSubscribed}
                    isPatron={isPatron}
                    className="w-full sm:w-auto md:min-w-[10rem]"
                  />
                ) : (
                  <Button
                    asChild
                    size="sm"
                    className="w-full sm:w-auto md:min-w-[10rem]"
                  >
                    <Link href="/">Connect wallet</Link>
                  </Button>
                )}
              </div>
            </div>
          </section>

          {latestPost ? (
            <section className="space-y-4">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <h2 className="text-lg font-semibold tracking-tight">
                    Latest post
                  </h2>
                  <p className="text-muted-foreground mt-0.5 text-sm">
                    Most recent update
                  </p>
                </div>
                {allPosts.length > 1 ? (
                  <Link
                    href={`/c/${username}/post`}
                    className="text-primary text-sm font-medium hover:underline"
                  >
                    View all posts
                  </Link>
                ) : null}
              </div>
              <PublicPostCard
                username={username}
                title={latestPost.title}
                dateLabel={format(
                  new Date(
                    latestPost.publishedAt ?? latestPost.createdAt
                  ),
                  "MMM d, yyyy"
                )}
                heroImageUrl={getPublicPostHeroImage(latestPost)}
                canView={accessMap.get(latestPost.id) ?? false}
                isPaid={latestPost.audience === "paid"}
                previewText={
                  accessMap.get(latestPost.id)
                    ? (latestPost.content ?? "").slice(0, 800)
                    : undefined
                }
                variant="featured"
              />
            </section>
          ) : null}

          {recentSlides.length > 0 ? (
            <PublicPostCarousel
              title="Recent posts"
              description="Swipe or use arrows to browse"
              username={username}
              slides={recentSlides}
            />
          ) : null}

          {moreSlides.length > 0 ? (
            <PublicPostCarousel
              title="More posts"
              description="Earlier updates"
              username={username}
              slides={moreSlides}
            />
          ) : null}

          <PublicCollectionsRow
            username={username}
            collections={collections.map((c) => ({
              id: c.id,
              name: c.name,
              description: c.description,
              coverImageUrl: c.coverImageUrl,
            }))}
          />

          {allPosts.length > 13 ? (
            <PublicPostsSection
              username={username}
              posts={allPosts.slice(13)}
              accessMap={accessMap}
              title="Earlier posts"
              description="Older updates"
              showViewAll
              emptyMessage="No more posts."
            />
          ) : null}
        </div>
      </PublicCreatorPageShell>
    </>
  );
}
