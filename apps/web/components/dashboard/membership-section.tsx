import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { ChangeTierForm } from "@/components/supports/change-tier-form";
import { CancelPatronageButton } from "@/components/supports/cancel-patronage-button";

type PatronageItem = {
  patronageId: string;
  creatorId: string;
  creatorDisplayName: string;
  creatorUsername: string;
  creatorAvatarUrl: string | null;
  tierName: string;
  tierAmount: string;
  tierId: string;
  tiers: { id: string; name: string; amount: string }[];
};

export function MembershipSection({
  patronages,
}: {
  patronages: PatronageItem[];
}) {
  if (patronages.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-12 text-center">
        <p className="text-muted-foreground text-sm">
          You don&apos;t have any active memberships. Support creators on the
          Explore page to get started.
        </p>
      </div>
    );
  }

  return (
    <ItemGroup className="space-y-4">
      {patronages.map((p) => (
        <Item key={p.patronageId} variant="outline" className="rounded-lg">
          <Link
            href={`/c/${p.creatorUsername}`}
            className="flex items-center gap-4 flex-1 min-w-0"
          >
            <ItemMedia variant="image">
              <Avatar size="sm" className="size-10">
                <AvatarImage src={p.creatorAvatarUrl ?? undefined} />
                <AvatarFallback>
                  {p.creatorDisplayName.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </ItemMedia>
            <ItemContent>
              <ItemTitle>{p.creatorDisplayName}</ItemTitle>
              <ItemDescription>
                @{p.creatorUsername} · {p.tierName} · ${p.tierAmount}
              </ItemDescription>
            </ItemContent>
          </Link>
          <ItemActions className="shrink-0">
            <ChangeTierForm
              patronageId={p.patronageId}
              currentTierId={p.tierId}
              currentTierName={p.tierName}
              tiers={p.tiers}
            />
            <CancelPatronageButton patronageId={p.patronageId} />
          </ItemActions>
        </Item>
      ))}
    </ItemGroup>
  );
}
