"use client";

import { useRouter } from "next/navigation";
import { TiersSection } from "./tiers-section";
import type { Creator, Tier, Perk } from "@/lib/db/schema";

export function DashboardTiersSection({
  creator,
  tiersAndPerks,
}: {
  creator: Creator;
  tiersAndPerks: (Tier & { perks: Perk[] })[];
}) {
  const router = useRouter();
  return (
    <TiersSection
      creator={creator}
      tiersAndPerks={tiersAndPerks}
      onSuccess={() => router.refresh()}
    />
  );
}
