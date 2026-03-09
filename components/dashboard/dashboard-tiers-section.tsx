import { TiersSection } from "./tiers-section";
import type { Tier } from "@/lib/db/schema";

export function DashboardTiersSection({ tiers }: { tiers: Tier[] }) {
  return <TiersSection tiers={tiers} onSuccess={() => {}} />;
}
