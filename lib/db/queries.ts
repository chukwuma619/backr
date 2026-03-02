import { db } from "@/lib/db";
import { creators, tiers, perks, patronage, users } from "@/lib/db/schema";
import { desc, eq, sql } from "drizzle-orm";

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

export async function createPatronage(data: {
  patronUserId: string;
  creatorId: string;
  tierId: string;
  amount: string;
  currency?: string;
  billingInterval?: string;
  ckbTxHash?: string;
}) {
  try {
    const [row] = await db
      .insert(patronage)
      .values({
        patronUserId: data.patronUserId,
        creatorId: data.creatorId,
        tierId: data.tierId,
        amount: data.amount,
        currency: data.currency ?? "CKB",
        status: "active",
        lastPaymentAt: new Date(),
        nextDueAt: getNextDueDate(data.billingInterval ?? "monthly"),
        ckbTxHash: data.ckbTxHash ?? null,
      })
      .returning();
    return { data: row, error: null };
  } catch (error) {
    console.error(error);
    return { data: null, error: error as Error };
  }
}

function getNextDueDate(interval: string): Date {
  const d = new Date();
  if (interval === "monthly") {
    d.setMonth(d.getMonth() + 1);
  } else if (interval === "yearly") {
    d.setFullYear(d.getFullYear() + 1);
  } else {
    d.setMonth(d.getMonth() + 1);
  }
  return d;
}

export async function getPatronageStatsByCreatorId(creatorId: string) {
  try {
    const [total] = await db
      .select({
        totalEarnings: sql<string>`COALESCE(SUM(CAST(${patronage.amount} AS NUMERIC)), 0)`,
        patronCount: sql<number>`COUNT(DISTINCT ${patronage.patronUserId})`,
      })
      .from(patronage)
      .where(eq(patronage.creatorId, creatorId));

    return {
      data: {
        totalEarnings: total?.totalEarnings ?? "0",
        patronCount: Number(total?.patronCount ?? 0),
      },
      error: null,
    };
  } catch (error) {
    console.error(error);
    return { data: null, error: error as Error };
  }
}

export async function getPatronsByCreatorId(creatorId: string) {
  try {
    const rows = await db
      .select({
        id: patronage.id,
        amount: patronage.amount,
        currency: patronage.currency,
        status: patronage.status,
        lastPaymentAt: patronage.lastPaymentAt,
        patronAddress: users.ckbAddress,
      })
      .from(patronage)
      .innerJoin(users, eq(patronage.patronUserId, users.id))
      .where(eq(patronage.creatorId, creatorId))
      .orderBy(desc(patronage.lastPaymentAt));

    return { data: rows, error: null };
  } catch (error) {
    console.error(error);
    return { data: [], error: error as Error };
  }
}
