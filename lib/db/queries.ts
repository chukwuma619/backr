import { alias } from "drizzle-orm/pg-core";
import { db } from "@/lib/db";
import { calculatePlatformFee } from "@/lib/platform-fee";
import {
  creatorSubscriptions,
  creators,
  creatortopics,
  tiers,
  patronage,
  users,
  posts,
  postPaidAudienceTiers,
  chats,
  chatParticipants,
  chatPaidAudienceTiers,
  messages,
  notifications,
} from "@/lib/db/schema";
import { and, desc, eq, ilike, inArray, ne, notInArray, or, sql } from "drizzle-orm";

const creatorUser = alias(users, "creator_user");

export async function getCreatorBySlug(slug: string) {
  try {
    const [row] = await db
      .select({ creator: creators })
      .from(creators)
      .where(eq(creators.username, slug))
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

export async function getAllCreatorsForDiscovery(
  search?: string,
  category?: string
) {
  try {
    const term = search?.trim() ? `%${search.trim()}%` : null;
    const topicSlug = category?.trim();

    if (topicSlug) {
      const searchConditions = term
        ? and(
            eq(creatortopics.slug, topicSlug),
            or(
              ilike(creators.displayName, term),
              ilike(creators.username, term),
              ilike(creators.bio, term)
            )!
          )
        : eq(creatortopics.slug, topicSlug);

      const rows = await db
        .selectDistinct({ creator: creators })
        .from(creators)
        .innerJoin(creatortopics, eq(creatortopics.creatorId, creators.id))
        .where(searchConditions)
        .orderBy(desc(creators.createdAt));

      return {
        data: rows.map((r) => r.creator),
        error: null,
      };
    }

    const conditions = term
      ? [
          or(
            ilike(creators.displayName, term),
            ilike(creators.username, term),
            ilike(creators.bio, term)
          )!,
        ]
      : [];
    const rows = await db
      .select()
      .from(creators)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(creators.createdAt));

    return { data: rows, error: null };
  } catch (error) {
    console.error(error);
    return { data: [], error: error as Error };
  }
}

export async function getSubscribersByCreatorId(creatorId: string) {
  try {
    const rows = await db
      .select({
        subscriptionId: creatorSubscriptions.id,
        userId: users.id,
        ckbAddress: users.ckbAddress,
        avatarUrl: users.avatarUrl,
        subscribedAt: creatorSubscriptions.createdAt,
      })
      .from(creatorSubscriptions)
      .innerJoin(users, eq(creatorSubscriptions.userId, users.id))
      .where(eq(creatorSubscriptions.creatorId, creatorId))
      .orderBy(desc(creatorSubscriptions.createdAt));

    return { data: rows, error: null };
  } catch (error) {
    console.error(error);
    return { data: [], error: error as Error };
  }
}

export async function getTrendingCreators(limit = 12) {
  try {
    const rows = await db
      .select({
        creator: creators,
        patronCount: sql<number>`COUNT(DISTINCT ${patronage.patronUserId})`,
      })
      .from(creators)
      .leftJoin(patronage, and(eq(patronage.creatorId, creators.id), eq(patronage.status, "active")))
      .groupBy(creators.id)
      .orderBy(sql`COUNT(DISTINCT ${patronage.patronUserId}) DESC`)
      .limit(limit);

    return { data: rows.map((r) => r.creator), error: null };
  } catch (error) {
    console.error(error);
    return { data: [], error: error as Error };
  }
}

export async function getNewCreators(limit = 12) {
  try {
    const rows = await db
      .select()
      .from(creators)
      .orderBy(desc(creators.createdAt))
      .limit(limit);
    return { data: rows, error: null };
  } catch (error) {
    console.error(error);
    return { data: [], error: error as Error };
  }
}

export async function getCreatorsByCategory(
  category: string,
  limit = 12
) {
  try {
    const rows = await db
      .selectDistinct({ creator: creators })
      .from(creators)
      .innerJoin(creatortopics, eq(creatortopics.creatorId, creators.id))
      .where(eq(creatortopics.slug, category.trim()))
      .orderBy(desc(creators.createdAt))
      .limit(limit);
    return {
      data: rows.map((r) => r.creator),
      error: null,
    };
  } catch (error) {
    console.error(error);
    return { data: [], error: error as Error };
  }
}

export async function getCreatorByUserId(userId: string) {
  try {
    const [row] = await db
      .select({
        creator: creators,
        userNostrPubkey: users.nostrPubkey,
        userAvatarUrl: users.avatarUrl,
        userFiberNodeRpcUrl: users.fiberNodeRpcUrl,
      })
      .from(creators)
      .innerJoin(users, eq(creators.userId, users.id))
      .where(eq(creators.userId, userId))
      .limit(1);
    if (!row) return { data: null, error: null };
    return {
      data: {
        ...row.creator,
        nostrPubkey: row.userNostrPubkey,
        avatarUrl: row.userAvatarUrl,
        fiberNodeRpcUrl: row.userFiberNodeRpcUrl,
      },
      error: null,
    };
  } catch (error) {
    console.error(error);
    return { data: null, error: error as Error };
  }
}

export async function getTiersByCreatorId(creatorId: string) {
  try {
    const rows = await db
      .select()
      .from(tiers)
      .where(eq(tiers.creatorId, creatorId))
      .orderBy(tiers.createdAt);
    return { data: rows, error: null };
  } catch (error) {
    console.error(error);
    return { data: [], error: error as Error };
  }
}

export async function getTierById(tierId: string) {
  try {
    const [row] = await db
      .select({ id: tiers.id, amount: tiers.amount, creatorId: tiers.creatorId })
      .from(tiers)
      .where(eq(tiers.id, tierId))
      .limit(1);
    return { data: row ?? null, error: null };
  } catch (error) {
    console.error(error);
    return { data: null, error: error as Error };
  }
}

export async function getCreatorTopicSlugs(creatorId: string) {
  try {
    const rows = await db
      .select({ slug: creatortopics.slug })
      .from(creatortopics)
      .where(eq(creatortopics.creatorId, creatorId));
    return { data: rows.map((r) => r.slug), error: null };
  } catch (error) {
    console.error(error);
    return { data: [], error: error as Error };
  }
}

export async function getCreatorSubscriptionForUser(
  userId: string,
  creatorId: string
) {
  try {
    const [row] = await db
      .select()
      .from(creatorSubscriptions)
      .where(
        and(
          eq(creatorSubscriptions.userId, userId),
          eq(creatorSubscriptions.creatorId, creatorId)
        )
      )
      .limit(1);
    return { data: row ?? null, error: null };
  } catch (error) {
    console.error(error);
    return { data: null, error: error as Error };
  }
}

export async function subscribeToCreator(userId: string, creatorId: string) {
  try {
    const [existing] = await db
      .select()
      .from(creatorSubscriptions)
      .where(
        and(
          eq(creatorSubscriptions.userId, userId),
          eq(creatorSubscriptions.creatorId, creatorId)
        )
      )
      .limit(1);
    if (existing) {
      return { data: existing, error: null };
    }

    const [created] = await db
      .insert(creatorSubscriptions)
      .values({
        userId,
        creatorId,
      })
      .onConflictDoNothing()
      .returning();

    return { data: created ?? existing ?? null, error: null };
  } catch (error) {
    console.error(error);
    return { data: null, error: error as Error };
  }
}

export async function unsubscribeFromCreator(userId: string, creatorId: string) {
  try {
    await db
      .delete(creatorSubscriptions)
      .where(
        and(
          eq(creatorSubscriptions.userId, userId),
          eq(creatorSubscriptions.creatorId, creatorId)
        )
      );
    return { error: null };
  } catch (error) {
    console.error(error);
    return { error: error as Error };
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

export async function getPatronageById(patronageId: string) {
  try {
    const [row] = await db
      .select({
        id: patronage.id,
        patronUserId: patronage.patronUserId,
        creatorId: patronage.creatorId,
        tierId: patronage.tierId,
      })
      .from(patronage)
      .where(eq(patronage.id, patronageId))
      .limit(1);
    return { data: row ?? null, error: null };
  } catch (error) {
    console.error(error);
    return { data: null, error: error as Error };
  }
}

export async function cancelPatronageById(
  patronageId: string,
  patronUserId: string
) {
  try {
    const [row] = await db
      .update(patronage)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(
        and(
          eq(patronage.id, patronageId),
          eq(patronage.patronUserId, patronUserId)
        )
      )
      .returning({ id: patronage.id });
    return { data: row ?? null, error: null };
  } catch (error) {
    console.error(error);
    return { data: null, error: error as Error };
  }
}

export async function updatePatronageTier(
  patronageId: string,
  patronUserId: string,
  tierId: string,
  amount: string
) {
  try {
    const [row] = await db
      .update(patronage)
      .set({
        tierId,
        amount,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(patronage.id, patronageId),
          eq(patronage.patronUserId, patronUserId)
        )
      )
      .returning({ id: patronage.id });
    return { data: row ?? null, error: null };
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
      .orderBy(desc(sql`COALESCE(${posts.publishedAt}, ${posts.createdAt})`));

    return { data: rows, error: null };
  } catch (error) {
    console.error(error);
    return { data: [], error: error as Error };
  }
}

export async function getPublishedPostsByCreatorId(creatorId: string) {
  try {
    const rows = await db
      .select()
      .from(posts)
      .where(and(eq(posts.creatorId, creatorId), eq(posts.status, "published")))
      .orderBy(desc(posts.publishedAt));

    return { data: rows, error: null };
  } catch (error) {
    console.error(error);
    return { data: [], error: error as Error };
  }
}

export async function getDraftPostsByCreatorId(creatorId: string) {
  try {
    const rows = await db
      .select()
      .from(posts)
      .where(and(eq(posts.creatorId, creatorId), eq(posts.status, "draft")))
      .orderBy(desc(posts.createdAt));

    return { data: rows, error: null };
  } catch (error) {
    console.error(error);
    return { data: [], error: error as Error };
  }
}

export async function getPostById(id: string | number) {
  try {
    const numericId = typeof id === "string" ? parseInt(id, 10) : id;
    if (Number.isNaN(numericId)) return { data: null, error: null };

    const [row] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, numericId))
      .limit(1);
    return { data: row ?? null, error: null };
  } catch (error) {
    console.error(error);
    return { data: null, error: error as Error };
  }
}

export async function getPostPaidAudienceTierIds(
  postId: number
): Promise<{ data: string[]; error: null } | { data: null; error: Error }> {
  try {
    const rows = await db
      .select({ tierId: postPaidAudienceTiers.tierId })
      .from(postPaidAudienceTiers)
      .where(eq(postPaidAudienceTiers.postId, postId));
    return { data: rows.map((r) => r.tierId), error: null };
  } catch (error) {
    console.error(error);
    return { data: null, error: error as Error };
  }
}

export async function canPatronAccessPost(
  postId: string | number,
  patronUserId: string
): Promise<boolean> {
  try {
    const numericId =
      typeof postId === "string" ? parseInt(postId, 10) : postId;
    if (Number.isNaN(numericId)) return false;

    const [post] = await db
      .select({
        creatorId: posts.creatorId,
        minTierPrice: tiers.amount,
      })
      .from(posts)
      .innerJoin(tiers, eq(posts.creatorId, tiers.creatorId))
      .where(and(eq(posts.id, numericId), eq(posts.status, "published")))
      .limit(1);
    if (!post) return false;

    const [pat] = await db
      .select({ tierAmount: tiers.amount })
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

    return parseFloat(pat.tierAmount) >= parseFloat(post.minTierPrice);
  } catch {
    return false;
  }
}

export async function getRecommendedCreatorsForUser(
  userId: string,
  limit = 6
) {
  try {
    const followedCreatorIds = await db
      .select({ creatorId: patronage.creatorId })
      .from(patronage)
      .where(
        and(
          eq(patronage.patronUserId, userId),
          eq(patronage.status, "active")
        )
      );

    const excludedIds = followedCreatorIds.map((r) => r.creatorId);

    const whereConditions = [ne(creators.userId, userId)];
    if (excludedIds.length > 0) {
      whereConditions.push(notInArray(creators.id, excludedIds));
    }

    const rows = await db
      .select()
      .from(creators)
      .where(and(...whereConditions))
      .orderBy(desc(creators.createdAt))
      .limit(limit);

    return { data: rows, error: null };
  } catch (error) {
    console.error(error);
    return { data: [], error: error as Error };
  }
}

export async function getGatedFeedForPatron(patronUserId: string) {
  try {
    const patronages = await db
      .select({
        creatorId: patronage.creatorId,
        tierId: patronage.tierId,
        tierAmount: tiers.amount,
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
      patronages.map((p) => [p.creatorId, { tierId: p.tierId, amount: p.tierAmount }])
    );

    const allPosts = await db
      .select({
        post: posts,
        creatorDisplayName: creators.displayName,
        creatorUsername: creators.username,
        minTierAmount: tiers.amount,
        minTierName: tiers.name,
      })
      .from(posts)
      .innerJoin(creators, eq(posts.creatorId, creators.id))
      .innerJoin(tiers, eq(posts.creatorId, tiers.creatorId))
      .where(
        and(
          inArray(posts.creatorId, creatorIds),
          eq(posts.status, "published")
        )
      )
      .orderBy(desc(posts.publishedAt));

    const data = allPosts
      .filter((row) => {
        const patronTier = patronTierByCreator.get(row.post.creatorId);
        if (!patronTier) return false;
        const patronPrice = parseFloat(patronTier.amount);
        const minPrice = parseFloat(row.minTierAmount);
        return patronPrice >= minPrice;
      })
      .map(({ post, creatorDisplayName, creatorUsername, minTierName }) => ({
        post,
        creatorDisplayName,
        creatorUsername,
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
        creatorUsername: creators.username,
        creatorFiberNodeRpcUrl: creatorUser.fiberNodeRpcUrl,
        tierName: tiers.name,
        tierAmount: tiers.amount,
      })
      .from(patronage)
      .innerJoin(users, eq(patronage.patronUserId, users.id))
      .innerJoin(creators, eq(patronage.creatorId, creators.id))
      .innerJoin(creatorUser, eq(creators.userId, creatorUser.id))
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
        creatorUsername: creators.username,
        creatorAvatarUrl: creatorUser.avatarUrl,
        tierName: tiers.name,
        tierAmount: tiers.amount,
      })
      .from(patronage)
      .innerJoin(creators, eq(patronage.creatorId, creators.id))
      .innerJoin(creatorUser, eq(creators.userId, creatorUser.id))
      .innerJoin(tiers, eq(patronage.tierId, tiers.id))
      .where(
        and(
          eq(patronage.patronUserId, patronUserId),
          eq(patronage.status, "active")
        )
      )
      .orderBy(desc(patronage.lastPaymentAt));

    return { data: rows, error: null };
  } catch (error) {
    console.error(error);
    return { data: [], error: error as Error };
  }
}

export async function getPaymentHistoryByCreatorId(
  creatorId: string,
  limit = 100
) {
  try {
    const rows = await db
      .select({
        id: patronage.id,
        patronCkbAddress: users.ckbAddress,
        tierName: tiers.name,
        amount: patronage.amount,
        currency: patronage.currency,
        status: patronage.status,
        subscribedAt: patronage.createdAt,
        lastPaymentAt: patronage.lastPaymentAt,
      })
      .from(patronage)
      .innerJoin(users, eq(patronage.patronUserId, users.id))
      .innerJoin(tiers, eq(patronage.tierId, tiers.id))
      .where(eq(patronage.creatorId, creatorId))
      .orderBy(desc(patronage.createdAt))
      .limit(limit);

    return { data: rows, error: null };
  } catch (error) {
    console.error(error);
    return { data: [], error: error as Error };
  }
}

export async function getBillingHistoryForUser(patronUserId: string, limit = 50) {
  try {
    const rows = await db
      .select({
        patronage: patronage,
        creatorDisplayName: creators.displayName,
        creatorUsername: creators.username,
        tierName: tiers.name,
      })
      .from(patronage)
      .innerJoin(creators, eq(patronage.creatorId, creators.id))
      .innerJoin(tiers, eq(patronage.tierId, tiers.id))
      .where(eq(patronage.patronUserId, patronUserId))
      .orderBy(desc(patronage.lastPaymentAt), desc(patronage.createdAt))
      .limit(limit);

    const data = rows.map((r) => ({
      id: r.patronage.id,
      amount: r.patronage.amount,
      currency: r.patronage.currency,
      status: r.patronage.status,
      createdAt: r.patronage.createdAt,
      lastPaymentAt: r.patronage.lastPaymentAt,
      creatorDisplayName: r.creatorDisplayName,
      creatorUsername: r.creatorUsername,
      tierName: r.tierName,
    }));

    return { data, error: null };
  } catch (error) {
    console.error(error);
    return { data: [], error: error as Error };
  }
}

export async function getChatsForUser(userId: string) {
  try {
    const patronages = await db
      .select({
        creatorId: patronage.creatorId,
        creatorDisplayName: creators.displayName,
        creatorUsername: creators.username,
        creatorAvatarUrl: creatorUser.avatarUrl,
      })
      .from(patronage)
      .innerJoin(creators, eq(patronage.creatorId, creators.id))
      .innerJoin(creatorUser, eq(creators.userId, creatorUser.id))
      .where(
        and(
          eq(patronage.patronUserId, userId),
          eq(patronage.status, "active")
        )
      );

    const creatorIds = patronages.map((p) => p.creatorId);
    const patronageByCreator = new Map(
      patronages.map((p) => [
        p.creatorId,
        {
          creatorDisplayName: p.creatorDisplayName,
          creatorUsername: p.creatorUsername,
          creatorAvatarUrl: p.creatorAvatarUrl,
        },
      ])
    );

    const [myCreator] = await db
      .select({
        creatorId: creators.id,
        creatorDisplayName: creators.displayName,
        creatorUsername: creators.username,
        creatorAvatarUrl: creatorUser.avatarUrl,
      })
      .from(creators)
      .innerJoin(creatorUser, eq(creators.userId, creatorUser.id))
      .where(eq(creators.userId, userId))
      .limit(1);
    const myCreatorId = myCreator?.creatorId;
    if (myCreatorId && myCreator) {
      patronageByCreator.set(myCreatorId, {
        creatorDisplayName: myCreator.creatorDisplayName,
        creatorUsername: myCreator.creatorUsername,
        creatorAvatarUrl: myCreator.creatorAvatarUrl,
      });
    }

    const allCreatorIds =
      creatorIds.length > 0 || myCreatorId
        ? [...new Set([...creatorIds, ...(myCreatorId ? [myCreatorId] : [])])]
        : [];
    if (allCreatorIds.length === 0) return { data: [], error: null };

    const userChatRows = await db
      .select({ chat: chats })
      .from(chats)
      .innerJoin(chatParticipants, eq(chatParticipants.chatId, chats.id))
      .where(
        and(
          eq(chatParticipants.userId, userId),
          inArray(chats.creatorId, allCreatorIds)
        )
      );

    const deduped = new Map<string, (typeof chats.$inferSelect)>();
    for (const row of userChatRows) {
      if (!deduped.has(row.chat.id)) {
        deduped.set(row.chat.id, row.chat);
      }
    }

    const chatIds = Array.from(deduped.keys());
    const lastMessages = await db
      .select({
        chatId: messages.chatId,
        id: messages.id,
        body: messages.body,
        senderId: messages.senderId,
        createdAt: messages.createdAt,
      })
      .from(messages)
      .where(inArray(messages.chatId, chatIds))
      .orderBy(desc(messages.createdAt));

    const lastMessageByChat = new Map<string, (typeof lastMessages)[0]>();
    for (const m of lastMessages) {
      if (!lastMessageByChat.has(m.chatId)) {
        lastMessageByChat.set(m.chatId, m);
      }
    }

    const data = Array.from(deduped.values()).map((chat) => {
      const meta = patronageByCreator.get(chat.creatorId)!;
      const lastMsg = lastMessageByChat.get(chat.id);
      return {
        chat,
        creatorDisplayName: meta.creatorDisplayName,
        creatorUsername: meta.creatorUsername,
        creatorAvatarUrl: meta.creatorAvatarUrl,
        lastMessage: lastMsg ?? null,
      };
    });

    data.sort((a, b) => {
      const aTime = a.lastMessage?.createdAt ?? a.chat.createdAt;
      const bTime = b.lastMessage?.createdAt ?? b.chat.createdAt;
      return bTime.getTime() - aTime.getTime();
    });

    return { data, error: null };
  } catch (error) {
    console.error(error);
    return { data: [], error: error as Error };
  }
}

export async function getChatsForCreator(creatorId: string) {
  try {
    const creatorChats = await db
      .select({ chat: chats })
      .from(chats)
      .where(eq(chats.creatorId, creatorId));

    const chatIds = creatorChats.map((r) => r.chat.id);
    if (chatIds.length === 0) return { data: [], error: null };

    const lastMessages = await db
      .select({
        chatId: messages.chatId,
        id: messages.id,
        body: messages.body,
        senderId: messages.senderId,
        createdAt: messages.createdAt,
      })
      .from(messages)
      .where(inArray(messages.chatId, chatIds))
      .orderBy(desc(messages.createdAt));

    const lastMessageByChat = new Map<string, (typeof lastMessages)[0]>();
    for (const m of lastMessages) {
      if (!lastMessageByChat.has(m.chatId)) lastMessageByChat.set(m.chatId, m);
    }

    const patronUserIds = creatorChats
      .map((r) => r.chat.patronUserId)
      .filter(Boolean) as string[];
    const patronUsers =
      patronUserIds.length > 0
        ? await db
            .select({
              id: users.id,
              ckbAddress: users.ckbAddress,
              avatarUrl: users.avatarUrl,
              creatorDisplayName: creators.displayName,
            })
            .from(users)
            .leftJoin(creators, eq(creators.userId, users.id))
            .where(inArray(users.id, patronUserIds))
        : [];
    const patronByUserId = new Map(
      patronUsers.map((p) => [
        p.id,
        {
          displayName: p.creatorDisplayName ?? `${p.ckbAddress.slice(0, 8)}…${p.ckbAddress.slice(-6)}`,
          avatarUrl: p.avatarUrl,
        },
      ])
    );

    const data = creatorChats.map(({ chat }) => {
      const lastMsg = lastMessageByChat.get(chat.id);
      const patronInfo =
        chat.type === "direct" && chat.patronUserId
          ? patronByUserId.get(chat.patronUserId)
          : null;
      return {
        chat,
        lastMessage: lastMsg
          ? { body: lastMsg.body, createdAt: lastMsg.createdAt }
          : null,
        patronDisplayName: patronInfo?.displayName ?? null,
        patronAvatarUrl: patronInfo?.avatarUrl ?? null,
      };
    });

    data.sort((a, b) => {
      const aTime = a.lastMessage?.createdAt ?? a.chat.createdAt;
      const bTime = b.lastMessage?.createdAt ?? b.chat.createdAt;
      return bTime.getTime() - aTime.getTime();
    });

    return { data, error: null };
  } catch (error) {
    console.error(error);
    return { data: [], error: error as Error };
  }
}

export async function createGroupChat(
  creatorId: string,
  options: {
    name?: string | null;
    audience?: "free" | "paid";
    tierIds?: string[];
    imageUrl?: string | null;
  }
) {
  try {
    const [creator] = await db
      .select({ userId: creators.userId })
      .from(creators)
      .where(eq(creators.id, creatorId))
      .limit(1);
    if (!creator) return { data: null, error: new Error("Creator not found") };

    const [existing] = await db
      .select()
      .from(chats)
      .where(and(eq(chats.creatorId, creatorId), eq(chats.type, "group")))
      .limit(1);
    if (existing) {
      return { data: existing, error: new Error("Group chat already exists for this creator") };
    }

    const audience = options.audience ?? "free";
    const imageUrl =
      typeof options.imageUrl === "string" && options.imageUrl.trim()
        ? options.imageUrl.trim()
        : null;
    const [created] = await db
      .insert(chats)
      .values({
        type: "group",
        creatorId,
        name: options.name ?? null,
        audience: audience as "free" | "paid",
        imageUrl,
      })
      .returning();
    if (!created) return { data: null, error: new Error("Failed to create chat") };

    await db.insert(chatParticipants).values({
      chatId: created.id,
      userId: creator.userId,
    });

    if (audience === "paid" && options.tierIds?.length) {
      await db.insert(chatPaidAudienceTiers).values(
        options.tierIds.map((tierId) => ({ chatId: created.id, tierId }))
      );
    }

    return { data: created, error: null };
  } catch (error) {
    console.error(error);
    return { data: null, error: error as Error };
  }
}

export async function getGroupChatPaidAudienceTierIds(chatId: string) {
  try {
    const rows = await db
      .select({ tierId: chatPaidAudienceTiers.tierId })
      .from(chatPaidAudienceTiers)
      .where(eq(chatPaidAudienceTiers.chatId, chatId));
    return { data: rows.map((r) => r.tierId), error: null };
  } catch (error) {
    console.error(error);
    return { data: [], error: error as Error };
  }
}

export async function updateGroupChatAudience(
  chatId: string,
  audience: "free" | "paid",
  tierIds: string[]
) {
  try {
    await db
      .update(chats)
      .set({ audience: audience as "free" | "paid", updatedAt: new Date() })
      .where(eq(chats.id, chatId));

    await db.delete(chatPaidAudienceTiers).where(eq(chatPaidAudienceTiers.chatId, chatId));
    if (audience === "paid" && tierIds.length > 0) {
      await db.insert(chatPaidAudienceTiers).values(
        tierIds.map((tierId) => ({ chatId, tierId }))
      );
    }
    return { error: null };
  } catch (error) {
    console.error(error);
    return { error: error as Error };
  }
}

export async function canPatronAccessGroupChat(
  chatId: string,
  patronUserId: string
): Promise<boolean> {
  try {
    const [row] = await db
      .select({
        audience: chats.audience,
        creatorId: chats.creatorId,
      })
      .from(chats)
      .where(eq(chats.id, chatId))
      .limit(1);
    if (!row) return false;
    if (row.audience !== "paid") return true;

    const tierRows = await db
      .select({ tierId: chatPaidAudienceTiers.tierId })
      .from(chatPaidAudienceTiers)
      .where(eq(chatPaidAudienceTiers.chatId, chatId));
    const allowedTierIds = new Set(tierRows.map((r) => r.tierId));
    if (allowedTierIds.size === 0) return false;

    const [patronTier] = await db
      .select({ tierId: patronage.tierId, tierAmount: tiers.amount })
      .from(patronage)
      .innerJoin(tiers, eq(patronage.tierId, tiers.id))
      .where(
        and(
          eq(patronage.creatorId, row.creatorId),
          eq(patronage.patronUserId, patronUserId),
          eq(patronage.status, "active")
        )
      )
      .limit(1);
    if (!patronTier) return false;
    return allowedTierIds.has(patronTier.tierId);
  } catch {
    return false;
  }
}

export async function getOrCreateGroupChat(creatorId: string, userId: string) {
  try {
    const [existing] = await db
      .select()
      .from(chats)
      .where(and(eq(chats.creatorId, creatorId), eq(chats.type, "group")))
      .limit(1);

    if (existing) {
      const canAccess = await canPatronAccessGroupChat(existing.id, userId);
      if (!canAccess) {
        return { data: null, error: new Error("You don't have access to this paid group. Upgrade your membership.") };
      }

      const [participant] = await db
        .select()
        .from(chatParticipants)
        .where(
          and(
            eq(chatParticipants.chatId, existing.id),
            eq(chatParticipants.userId, userId)
          )
        )
        .limit(1);

      if (!participant) {
        await db.insert(chatParticipants).values({
          chatId: existing.id,
          userId,
        });
      }
      return { data: existing, error: null };
    }

    const [creator] = await db
      .select({ userId: creators.userId })
      .from(creators)
      .where(eq(creators.id, creatorId))
      .limit(1);
    if (!creator) return { data: null, error: new Error("Creator not found") };

    const [created] = await db
      .insert(chats)
      .values({ type: "group", creatorId, audience: "free" })
      .returning();
    if (!created) return { data: null, error: new Error("Failed to create chat") };

    await db.insert(chatParticipants).values([
      { chatId: created.id, userId: creator.userId },
      { chatId: created.id, userId },
    ]);

    return { data: created, error: null };
  } catch (error) {
    console.error(error);
    return { data: null, error: error as Error };
  }
}

export async function getOrCreateDirectChat(
  creatorId: string,
  patronUserId: string
) {
  try {
    const [creator] = await db
      .select({ userId: creators.userId })
      .from(creators)
      .where(eq(creators.id, creatorId))
      .limit(1);
    if (!creator) return { data: null, error: new Error("Creator not found") };

    const [existing] = await db
      .select()
      .from(chats)
      .where(
        and(
          eq(chats.creatorId, creatorId),
          eq(chats.type, "direct"),
          eq(chats.patronUserId, patronUserId)
        )
      )
      .limit(1);

    if (existing) return { data: existing, error: null };

    const [created] = await db
      .insert(chats)
      .values({
        type: "direct",
        creatorId,
        patronUserId,
      })
      .returning();
    if (!created) return { data: null, error: new Error("Failed to create chat") };

    await db.insert(chatParticipants).values([
      { chatId: created.id, userId: creator.userId },
      { chatId: created.id, userId: patronUserId },
    ]);

    return { data: created, error: null };
  } catch (error) {
    console.error(error);
    return { data: null, error: error as Error };
  }
}

export async function getMessagesByChatId(chatId: string, limit = 50) {
  try {
    const rows = await db
      .select({
        message: messages,
        senderAvatarUrl: users.avatarUrl,
        creatorDisplayName: creators.displayName,
      })
      .from(messages)
      .innerJoin(users, eq(messages.senderId, users.id))
      .leftJoin(creators, eq(creators.userId, messages.senderId))
      .where(eq(messages.chatId, chatId))
      .orderBy(desc(messages.createdAt))
      .limit(limit);

    const data = rows
      .map((r) => ({
        ...r.message,
        senderDisplayName: r.creatorDisplayName ?? `User ${r.message.senderId.slice(0, 8)}`,
        senderAvatarUrl: r.senderAvatarUrl ?? null,
      }))
      .reverse();

    return { data, error: null };
  } catch (error) {
    console.error(error);
    return { data: [], error: error as Error };
  }
}

export async function getChatById(chatId: string) {
  try {
    const [row] = await db
      .select()
      .from(chats)
      .where(eq(chats.id, chatId))
      .limit(1);
    return { data: row ?? null, error: null };
  } catch (error) {
    console.error(error);
    return { data: null, error: error as Error };
  }
}

export async function canUserAccessChat(chatId: string, userId: string) {
  try {
    const [participant] = await db
      .select()
      .from(chatParticipants)
      .where(
        and(
          eq(chatParticipants.chatId, chatId),
          eq(chatParticipants.userId, userId)
        )
      )
      .limit(1);
    return !!participant;
  } catch {
    return false;
  }
}

export async function sendMessage(chatId: string, senderId: string, body: string) {
  try {
    const [msg] = await db
      .insert(messages)
      .values({ chatId, senderId, body })
      .returning();

    await db
      .update(chats)
      .set({ updatedAt: new Date() })
      .where(eq(chats.id, chatId));

    return { data: msg, error: null };
  } catch (error) {
    console.error(error);
    return { data: null, error: error as Error };
  }
}

export async function addPatronToGroupChat(creatorId: string, patronUserId: string) {
  try {
    const [chat] = await db
      .select()
      .from(chats)
      .where(and(eq(chats.creatorId, creatorId), eq(chats.type, "group")))
      .limit(1);

    if (!chat) return { error: new Error("Group chat not found") };

    const [existing] = await db
      .select()
      .from(chatParticipants)
      .where(
        and(
          eq(chatParticipants.chatId, chat.id),
          eq(chatParticipants.userId, patronUserId)
        )
      )
      .limit(1);

    if (existing) return { error: null };

    await db.insert(chatParticipants).values({
      chatId: chat.id,
      userId: patronUserId,
    });
    return { error: null };
  } catch (error) {
    console.error(error);
    return { error: error as Error };
  }
}

export async function getNotificationsForUser(userId: string, limit = 50) {
  try {
    const rows = await db
      .select({
        notification: notifications,
        creatorDisplayName: creators.displayName,
        creatorUsername: creators.username,
        creatorAvatarUrl: creatorUser.avatarUrl,
        postTitle: posts.title,
      })
      .from(notifications)
      .innerJoin(creators, eq(notifications.creatorId, creators.id))
      .innerJoin(creatorUser, eq(creators.userId, creatorUser.id))
      .leftJoin(
        posts,
        and(
          sql`${notifications.entityId} = ${posts.id}::text`,
          eq(notifications.type, "new_post")
        )
      )
      .where(eq(notifications.userId, userId))
      .orderBy(desc(notifications.createdAt))
      .limit(limit);

    const data = rows.map((r) => ({
      id: r.notification.id,
      type: r.notification.type,
      entityId: r.notification.entityId,
      creatorId: r.notification.creatorId,
      creatorDisplayName: r.creatorDisplayName,
      creatorUsername: r.creatorUsername,
      creatorAvatarUrl: r.creatorAvatarUrl,
      postTitle: r.postTitle,
      readAt: r.notification.readAt,
      createdAt: r.notification.createdAt,
    }));

    return { data, error: null };
  } catch (error) {
    console.error(error);
    return { data: [], error: error as Error };
  }
}

export async function createNotificationsForNewPost(
  postId: number,
  creatorId: string,
  minTierId: string
) {
  try {
    const [postTier] = await db
      .select({ minPrice: tiers.amount })
      .from(tiers)
      .where(eq(tiers.id, minTierId))
      .limit(1);
    if (!postTier) return { error: null };

    const patrons = await db
      .select({
        patronUserId: patronage.patronUserId,
        tierAmount: tiers.amount,
      })
      .from(patronage)
      .innerJoin(tiers, eq(patronage.tierId, tiers.id))
      .where(
        and(
          eq(patronage.creatorId, creatorId),
          eq(patronage.status, "active")
        )
      );

    const eligible = patrons.filter(
        (p) => parseFloat(p.tierAmount) >= parseFloat(postTier.minPrice)
    );
    if (eligible.length === 0) return { error: null };

    await db.insert(notifications).values(
      eligible.map((p) => ({
        userId: p.patronUserId,
        type: "new_post" as const,
        entityId: String(postId),
        creatorId,
      }))
    );
    return { error: null };
  } catch (error) {
    console.error(error);
    return { error: error as Error };
  }
}

export async function createNotificationsForNewMessage(
  chatId: string,
  senderId: string,
  creatorId: string
) {
  try {
    const participants = await db
      .select({ userId: chatParticipants.userId })
      .from(chatParticipants)
      .where(eq(chatParticipants.chatId, chatId));

    const recipients = participants
      .filter((p) => p.userId !== senderId)
      .map((p) => p.userId);
    if (recipients.length === 0) return { error: null };

    await db.insert(notifications).values(
      recipients.map((userId) => ({
        userId,
        type: "new_message" as const,
        entityId: chatId,
        creatorId,
      }))
    );
    return { error: null };
  } catch (error) {
    console.error(error);
    return { error: error as Error };
  }
}

export async function getPatronsByCreatorId(creatorId: string) {
  try {
    const rows = await db
      .select({
        patronageId: patronage.id,
        patronUserId: users.id,
        patronCkbAddress: users.ckbAddress,
        patronAvatarUrl: users.avatarUrl,
        tierName: tiers.name,
        tierAmount: tiers.amount,
        amount: patronage.amount,
        currency: patronage.currency,
        status: patronage.status,
        lastPaymentAt: patronage.lastPaymentAt,
        subscribedAt: patronage.createdAt,
      })
      .from(patronage)
      .innerJoin(users, eq(patronage.patronUserId, users.id))
      .innerJoin(tiers, eq(patronage.tierId, tiers.id))
      .where(
        and(
          eq(patronage.creatorId, creatorId),
          eq(patronage.status, "active")
        )
      )
      .orderBy(desc(patronage.createdAt));

    return { data: rows, error: null };
  } catch (error) {
    console.error(error);
    return { data: [], error: error as Error };
  }
}
