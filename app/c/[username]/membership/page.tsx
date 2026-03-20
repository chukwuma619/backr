import type { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getPublicCreatorBySlug,
  getTiersByCreatorId,
} from "@/lib/db/queries";
import { SupportButton } from "@/components/creator-hub/support-button";
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
    return { title: "Membership" };
  }
  return {
    title: `Membership · ${creator.displayName} (@${creator.username})`,
  };
}

export default async function CreatorMembershipPage({ params }: Props) {
  const { username } = await params;
  const { data: creator } = await getPublicCreatorBySlug(username);
  if (!creator) {
    notFound();
  }

  const { data: tiers = [] } = await getTiersByCreatorId(creator.id);

  return (
    <PublicCreatorPageShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Membership</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Choose a tier to support {creator.displayName} and unlock member
            posts.
          </p>
        </div>

        {tiers.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            This creator hasn&apos;t published membership tiers yet.
          </p>
        ) : (
          <div className="space-y-4">
            {tiers.map((tier) => (
              <Card key={tier.id}>
                <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 space-y-1">
                    <CardTitle className="text-lg">{tier.name}</CardTitle>
                    <CardDescription>
                      ${tier.amount}
                      {tier.description ? ` · ${tier.description}` : ""}
                    </CardDescription>
                  </div>
                  <SupportButton tier={{ ...tier, perks: [] }} creator={creator} />
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </PublicCreatorPageShell>
  );
}
