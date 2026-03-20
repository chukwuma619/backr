import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import {
  getPatronagesByUserId,
  getPublicCreatorBySlug,
  getPublicPostAccessFlags,
  getPublishedPostsByCreatorId,
} from "@/lib/db/queries";
import { PublicCreatorPageShell } from "@/components/creator/public-creator-page-shell";
import { PublicPostsSection } from "@/components/creator/public-posts-section";

type Props = {
  params: Promise<{ username: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  const { data: creator } = await getPublicCreatorBySlug(username);
  if (!creator) {
    return { title: "Posts" };
  }
  return {
    title: `Posts · ${creator.displayName} (@${creator.username})`,
  };
}

export default async function CreatorPostsPage({ params }: Props) {
  const { username } = await params;
  const { data: creator } = await getPublicCreatorBySlug(username);
  if (!creator) {
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

  const { data: posts = [] } = await getPublishedPostsByCreatorId(creator.id);
  const accessMap = await getPublicPostAccessFlags(
    posts.map((p) => ({ id: p.id, audience: p.audience ?? null })),
    patronTierId
  );

  return (
    <PublicCreatorPageShell>
      <PublicPostsSection
        username={username}
        posts={posts}
        accessMap={accessMap}
        title="All posts"
        description="Published posts, newest first"
        emptyMessage="No published posts yet."
      />
    </PublicCreatorPageShell>
  );
}
