import { db } from "@/lib/db";
import { calculatePlatformFee } from "@/lib/platform-fee";
import {
  creators,
  tiers,
  perks,
  patronage,
  users,
  posts,
} from "@/lib/db/schema";
import { and, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";

export async function getCreatorBySlug(slug: string) {
  try {
    const [row] = await db
      .select({ creator: creators })
      .from(creators)
      .where(eq(creators.slug, slug))
      .limit(1);
    if (!row) return { data: null, error: null };

    return {
      data: row.creator,
      error: null,
    };
  } catch (error) {
    console.error(error);
    return { data: null, error: error as Error };
  }
}

export async function getAllCreatorsForDiscovery(search?: string) {
  try {
    const term = search?.trim() ? `%${search.trim()}%` : null;
    const rows = await db
      .select()
      .from(creators)
      .where(
        term
          ? or(
              ilike(creators.displayName, term),
              ilike(creators.slug, term),
              ilike(creators.bio, term)
            )
          : undefined
      )
      .orderBy(desc(creators.createdAt));

    return { data: rows, error: null };
  } catch (error) {
    console.error(error);
    return { data: [], error: error as Error };
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

export async function getTiersByCreatorId(creatorId: string) {
  try {
    const rows = await db
      .select({ id: tiers.id, name: tiers.name, priceAmount: tiers.priceAmount, priceCurrency: tiers.priceCurrency })
      .from(tiers)
      .where(eq(tiers.creatorId, creatorId))
      .orderBy(tiers.createdAt);
    return { data: rows, error: null };
  } catch (error) {
    console.error(error);
    return { data: [], error: error as Error };
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
  fiberTxRef?: string;
  platformFeeFiberTxRef?: string | null;
}) {
  try {
    const platformFeeAmount = calculatePlatformFee(data.amount);
    const [row] = await db
      .insert(patronage)
      .values({
        patronUserId: data.patronUserId,
        creatorId: data.creatorId,
        tierId: data.tierId,
        amount: data.amount,
        currency: data.currency ?? "CKB",
        platformFeeAmount: platformFeeAmount !== "0" ? platformFeeAmount : null,
        platformFeeFiberTxRef: data.platformFeeFiberTxRef ?? null,
        status: "active",
        lastPaymentAt: new Date(),
        nextDueAt: getNextDueDate(data.billingInterval ?? "monthly"),
        fiberTxRef: data.fiberTxRef ?? null,
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

export async function updatePatronageAfterRenewal(
  patronageId: string,
  fiberTxRef: string,
  billingInterval: string,
  platformFeeFiberTxRef?: string | null
) {
  try {
    const nextDue = getNextDueDate(billingInterval);
    const [row] = await db
      .update(patronage)
      .set({
        lastPaymentAt: new Date(),
        nextDueAt: nextDue,
        fiberTxRef,
        platformFeeFiberTxRef: platformFeeFiberTxRef ?? null,
        updatedAt: new Date(),
      })
      .where(eq(patronage.id, patronageId))
      .returning();
    return { data: row, error: null };
  } catch (error) {
    console.error(error);
    return { data: null, error: error as Error };
  }
}

export async function getEarningsOverTimeByCreatorId(creatorId: string) {
  try {
    const rows = await db
      .select({
        month: sql<string>`TO_CHAR(${patronage.lastPaymentAt}, 'YYYY-MM')`,
        total: sql<string>`SUM(CAST(${patronage.amount} AS NUMERIC))`,
      })
      .from(patronage)
      .where(
        and(
          eq(patronage.creatorId, creatorId),
          sql`${patronage.lastPaymentAt} IS NOT NULL`
        )
      )
      .groupBy(sql`TO_CHAR(${patronage.lastPaymentAt}, 'YYYY-MM')`)
      .orderBy(sql`TO_CHAR(${patronage.lastPaymentAt}, 'YYYY-MM') DESC`);

    return { data: rows.slice(0, 12), error: null };
  } catch (error) {
    console.error(error);
    return { data: [], error: error as Error };
  }
}

export async function getTopTiersByCreatorId(creatorId: string) {
  try {
    const rows = await db
      .select({
        tierName: tiers.name,
        patronCount: sql<number>`COUNT(DISTINCT ${patronage.patronUserId})`,
        totalAmount: sql<string>`COALESCE(SUM(CAST(${patronage.amount} AS NUMERIC)), 0)`,
      })
      .from(patronage)
      .innerJoin(tiers, eq(patronage.tierId, tiers.id))
      .where(eq(patronage.creatorId, creatorId))
      .groupBy(tiers.id, tiers.name)
      .orderBy(sql`COUNT(DISTINCT ${patronage.patronUserId}) DESC`);

    return { data: rows, error: null };
  } catch (error) {
    console.error(error);
    return { data: [], error: error as Error };
  }
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

export async function getPostsByCreatorId(creatorId: string) {
  try {
    const rows = await db
      .select()
      .from(posts)
      .where(eq(posts.creatorId, creatorId))
      .orderBy(desc(posts.publishedAt));

    return { data: rows, error: null };
  } catch (error) {
    console.error(error);
    return { data: [], error: error as Error };
  }
}

export async function getPostById(id: string) {
  try {
    const [row] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, id))
      .limit(1);
    return { data: row ?? null, error: null };
  } catch (error) {
    console.error(error);
    return { data: null, error: error as Error };
  }
}

export async function canPatronAccessPost(
  postId: string,
  patronUserId: string
): Promise<boolean> {
  try {
    const [post] = await db
      .select({
        creatorId: posts.creatorId,
        minTierId: posts.minTierId,
        minTierPrice: tiers.priceAmount,
      })
      .from(posts)
      .innerJoin(tiers, eq(posts.minTierId, tiers.id))
      .where(eq(posts.id, postId))
      .limit(1);
    if (!post) return false;

    const [pat] = await db
      .select({ tierPrice: tiers.priceAmount })
      .from(patronage)
      .innerJoin(tiers, eq(patronage.tierId, tiers.id))
      .where(
        and(
          eq(patronage.creatorId, post.creatorId),
          eq(patronage.patronUserId, patronUserId),
          eq(patronage.status, "active")
        )
      )
      .limit(1);
    if (!pat) return false;

    return parseFloat(pat.tierPrice) >= parseFloat(post.minTierPrice);
  } catch {
    return false;
  }
}

export async function getGatedFeedForPatron(patronUserId: string) {
  try {
    const patronages = await db
      .select({
        creatorId: patronage.creatorId,
        tierId: patronage.tierId,
        tierPrice: tiers.priceAmount,
      })
      .from(patronage)
      .innerJoin(tiers, eq(patronage.tierId, tiers.id))
      .where(
        and(
          eq(patronage.patronUserId, patronUserId),
          eq(patronage.status, "active")
        )
      );

    const creatorIds = patronages.map((p) => p.creatorId);
    if (creatorIds.length === 0) return { data: [], error: null };

    const patronTierByCreator = new Map(
      patronages.map((p) => [p.creatorId, { tierId: p.tierId, price: p.tierPrice }])
    );

    const allPosts = await db
      .select({
        post: posts,
        creatorDisplayName: creators.displayName,
        creatorSlug: creators.slug,
        minTierId: posts.minTierId,
        minTierPrice: tiers.priceAmount,
        minTierName: tiers.name,
      })
      .from(posts)
      .innerJoin(creators, eq(posts.creatorId, creators.id))
      .innerJoin(tiers, eq(posts.minTierId, tiers.id))
      .where(inArray(posts.creatorId, creatorIds))
      .orderBy(desc(posts.publishedAt));

    const data = allPosts
      .filter((row) => {
        const patronTier = patronTierByCreator.get(row.post.creatorId);
        if (!patronTier) return false;
        const patronPrice = parseFloat(patronTier.price);
        const minPrice = parseFloat(row.minTierPrice);
        return patronPrice >= minPrice;
      })
      .map(({ post, creatorDisplayName, creatorSlug, minTierName }) => ({
        post,
        creatorDisplayName,
        creatorSlug,
        minTierName,
      }));

    return { data, error: null };
  } catch (error) {
    console.error(error);
    return { data: [], error: error as Error };
  }
}

export async function getDuePatronagesForRenewal() {
  try {
    const rows = await db
      .select({
        patronage: patronage,
        patronAddress: users.ckbAddress,
        patronFiberNodeRpcUrl: users.fiberNodeRpcUrl,
        creatorDisplayName: creators.displayName,
        creatorSlug: creators.slug,
        creatorFiberNodeRpcUrl: creators.fiberNodeRpcUrl,
        tierName: tiers.name,
        tierPrice: tiers.priceAmount,
        tierBillingInterval: tiers.billingInterval,
        tierPriceCurrency: tiers.priceCurrency,
      })
      .from(patronage)
      .innerJoin(users, eq(patronage.patronUserId, users.id))
      .innerJoin(creators, eq(patronage.creatorId, creators.id))
      .innerJoin(tiers, eq(patronage.tierId, tiers.id))
      .where(
        and(
          eq(patronage.status, "active"),
          sql`${patronage.nextDueAt} IS NOT NULL`,
          sql`${patronage.nextDueAt} <= NOW()`
        )
      );

    return { data: rows, error: null };
  } catch (error) {
    console.error(error);
    return { data: [], error: error as Error };
  }
}

export async function getPatronagesByUserId(patronUserId: string) {
  try {
    const rows = await db
      .select({
        patronage: patronage,
        creatorId: creators.id,
        creatorDisplayName: creators.displayName,
        creatorSlug: creators.slug,
        creatorAvatarUrl: creators.avatarUrl,
        tierName: tiers.name,
        tierPrice: tiers.priceAmount,
        tierCurrency: tiers.priceCurrency,
      })
      .from(patronage)
      .innerJoin(creators, eq(patronage.creatorId, creators.id))
      .innerJoin(tiers, eq(patronage.tierId, tiers.id))
      .where(eq(patronage.patronUserId, patronUserId))
      .orderBy(desc(patronage.lastPaymentAt));

    return { data: rows, error: null };
  } catch (error) {
    console.error(error);
    return { data: [], error: error as Error };
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
