import { notFound } from "next/navigation";
import { getPublicCreatorBySlug } from "@/lib/db/queries";
import { PublicCreatorNav } from "@/components/creator/public-creator-nav";

export default async function CreatorLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  const { data: creator } = await getPublicCreatorBySlug(username);
  if (!creator) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-background">
      <PublicCreatorNav creator={creator} />
      {children}
    </div>
  );
}
