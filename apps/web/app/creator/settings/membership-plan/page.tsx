import { getCreatorForDashboard } from "@/lib/creators/get-creator-for-dashboard";
import { getTiersByCreatorId } from "@/lib/db/queries";
import { MembershipPlanTiers } from "./membership-plan-tiers";
import type { Tier } from "@/lib/db/schema";

export default async function MembershipPlanSettingsPage() {
  const { creator } = await getCreatorForDashboard();
  if (!creator) return null;

  const { data: tiers } = await getTiersByCreatorId(creator.id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Membership plan</h1>
        <p className="text-muted-foreground">
          Create and manage your tiers. Supporters choose a tier to subscribe.
        </p>
      </div>
      <MembershipPlanTiers tiers={(tiers ?? []) as Tier[]} />
    </div>
  );
}
