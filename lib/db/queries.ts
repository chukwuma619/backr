import { db } from "@/lib/db";
import { creators, tiers, perks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function getCreatorBySlug(slug: string) {
  try {
    const [creatorRow] = await db
      .select()
      .from(creators)
      .where(eq(creators.slug, slug))
      .limit(1);
    if (!creatorRow) return { data: null, error: null };

    return {
      data: creatorRow,
      error: null,
    };
  } catch (error) {
    console.error(error);
    return { data: null, error: error as Error };
  }
}

export async function getCreatorByUserId(userId: string) {
  try {
    const [creatorRow] = await db
      .select()
      .from(creators)
      .where(eq(creators.userId, userId))
      .limit(1);
    return { data: creatorRow, error: null };
  } catch (error) {
    console.error(error);
    return { data: null, error: error as Error };
  }
}

export async function getTiersAndPerksByCreatorId(creatorId: string) {
  try {
    const rows = await db
      .select({ tier: tiers, perk: perks })
      .from(tiers)
      .leftJoin(perks, eq(tiers.id, perks.tierId))
      .where(eq(tiers.creatorId, creatorId));

    const tierMap = new Map<
      string,
      (typeof tiers.$inferSelect) & { perks: (typeof perks.$inferSelect)[] }
    >();
    for (const { tier, perk } of rows) {
      const existing = tierMap.get(tier.id);
      if (existing) {
        if (perk) existing.perks.push(perk);
      } else {
        tierMap.set(tier.id, {
          ...tier,
          perks: perk ? [perk] : [],
        });
      }
    }
    const data = Array.from(tierMap.values());
    return { data, error: null };
  } catch (error) {
    console.error(error);
    return { data: [], error: error as Error };
  }
}
