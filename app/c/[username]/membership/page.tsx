import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getPublicCreatorBySlug, getPublicMembershipTiersForCreator } from "@/lib/db/queries";
import { SupportButton } from "@/components/creator-hub/support-button";
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

  const { data: tiers = [], error: tiersError } =
    await getPublicMembershipTiersForCreator(creator.id);

  return (
    <div className="w-full px-4 pb-16 pt-6">
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Membership</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {tiers.length > 0
              ? `All ${tiers.length} membership tier${tiers.length === 1 ? "" : "s"} from ${creator.displayName}. Pick one to unlock member posts.`
              : `Choose a tier to support ${creator.displayName} and unlock member posts.`}
          </p>
        </div>

        {tiersError ? (
          <p className="text-destructive text-sm">
            Couldn&apos;t load tiers. Try again later.
          </p>
        ) : tiers.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            This creator hasn&apos;t published membership tiers yet.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {tiers.map((tier) => (
              <Card key={tier.id} className="overflow-hidden flex flex-col">
                {tier.coverImageUrl ? (
                  <div className="bg-muted relative aspect-video w-full">
                    <Image
                      src={tier.coverImageUrl}
                      alt=""
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, 50vw"
                      unoptimized
                    />
                  </div>
                ) : null}
                <CardHeader className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0 space-y-1">
                    <CardTitle className="text-lg">{tier.name}</CardTitle>
                    <p className="text-foreground text-sm font-medium">
                      {tier.amount} CKB / month
                    </p>
                    {tier.description ? (
                      <CardDescription className="text-pretty">
                        {tier.description}
                      </CardDescription>
                    ) : null}
                  </div>
                  <SupportButton tier={{ ...tier, perks: [] }} creator={creator} />
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
