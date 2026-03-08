import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import {
  getPatronagesByUserId,
  getTiersByCreatorId,
} from "@/lib/db/queries";
import { MembershipSection } from "@/components/dashboard/membership-section";

export default async function MembershipPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/");
  }

  const { data: patronages } = await getPatronagesByUserId(user.id);

  const patronagesWithTiers = await Promise.all(
    (patronages ?? []).map(async (p) => {
      const { data: tiers } = await getTiersByCreatorId(p.creatorId);
      return {
        patronageId: p.patronage.id,
        creatorId: p.creatorId,
        creatorDisplayName: p.creatorDisplayName,
        creatorUsername: p.creatorUsername,
        creatorAvatarUrl: p.creatorAvatarUrl,
        tierName: p.tierName,
        tierPrice: p.tierPrice,
        tierCurrency: p.tierCurrency,
        tierId: p.patronage.tierId,
        tiers: tiers ?? [],
      };
    })
  );

  return (
    <div className="max-w-2xl mx-auto w-full">
      <div className="mb-4">
        <h1 className="text-2xl font-semibold tracking-tight">Membership</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your memberships here.
        </p>
      </div>

      <MembershipSection patronages={patronagesWithTiers} />
    </div>
  );
}
