import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getCreatorBySlug, getTiersAndPerksByCreatorId } from "@/lib/db/queries";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WalletConnect } from "@/components/wallet-connect";
import { SupportButton } from "@/components/creator-hub/support-button";

export default async function CreatorHubPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data: creatorData, error: creatorError } = await getCreatorBySlug(slug);
  if (creatorError) {
    console.error(creatorError);
    return <div>Error: {creatorError.message}</div>;
  }
  if (!creatorData) notFound();
  const { data: tiersAndPerks, error: tiersAndPerksError } =
    await getTiersAndPerksByCreatorId(creatorData.id);
  if (tiersAndPerksError) {
    console.error(tiersAndPerksError);
    return <div>Error: {tiersAndPerksError.message}</div>;
  }
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-foreground">
          Backr
        </Link>
        <WalletConnect />
      </header>
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <div className="flex flex-col items-center text-center mb-10">
          {creatorData.avatarUrl ? (
            <Image
              src={creatorData.avatarUrl}
              alt={creatorData.displayName}
              width={96}
              height={96}
              className="rounded-full object-cover mb-4"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-muted flex items-center justify-center text-2xl font-semibold text-muted-foreground mb-4">
              {creatorData.displayName.slice(0, 1).toUpperCase()}
            </div>
          )}
          <h1 className="text-2xl font-semibold tracking-tight">
            {creatorData.displayName}
          </h1>
          {creatorData.bio && (
            <p className="text-muted-foreground mt-2 max-w-md">{creatorData.bio}</p>
          )}
        </div>

        <h2 className="text-lg font-medium mb-4">Tiers</h2>
        <div className="space-y-4">
          {tiersAndPerks.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No tiers yet. Check back later.
            </p>
          ) : (
            tiersAndPerks.map((tier) => (
              <Card key={tier.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle className="text-base">{tier.name}</CardTitle>
                      {tier.description && (
                        <CardDescription>{tier.description}</CardDescription>
                      )}
                      <p className="text-sm font-medium mt-1">
                        {tier.priceAmount} {tier.priceCurrency} / {tier.billingInterval}
                      </p>
                    </div>
                    <SupportButton tier={tier} creator={creatorData} />
                  </div>
                </CardHeader>
                {tier.perks.length > 0 && (
                  <CardContent className="pt-0">
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {tier.perks.map((perk) => (
                        <li key={perk.id}>• {perk.description}</li>
                      ))}
                    </ul>
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </div>

        <div className="mt-8 text-center">
          <Link href="/">
            <Button variant="outline">Discover more creators</Button>
          </Link>
        </div>
      </main>
    </div>
  );
}
