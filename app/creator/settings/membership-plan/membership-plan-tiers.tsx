"use client";

import { useRouter } from "next/navigation";
import { TiersSection } from "@/components/dashboard/tiers-section";
import type { Tier } from "@/lib/db/schema";

export function MembershipPlanTiers({ tiers }: { tiers: Tier[] }) {
  const router = useRouter();
  return (
    <TiersSection
      tiers={tiers}
      onSuccess={() => router.refresh()}
    />
  );
}
