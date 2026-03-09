"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { patronage, tiers } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/get-current-user";

export async function changePatronageTier(patronageId: string, newTierId: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const [row] = await db
    .select({ patronage: patronage })
    .from(patronage)
    .where(
      and(
        eq(patronage.id, patronageId),
        eq(patronage.patronUserId, user.id),
        eq(patronage.status, "active")
      )
    )
    .limit(1);

  if (!row) {
    return { error: "Patronage not found" };
  }

  const [newTier] = await db
    .select()
    .from(tiers)
    .where(eq(tiers.id, newTierId))
    .limit(1);

  if (!newTier || newTier.creatorId !== row.patronage.creatorId) {
    return { error: "Tier not found or does not belong to this creator" };
  }

  if (newTier.id === row.patronage.tierId) {
    return { error: "Already on this tier" };
  }

  await db
    .update(patronage)
    .set({
      tierId: newTier.id,
      amount: newTier.amount,
      updatedAt: new Date(),
    })
    .where(eq(patronage.id, patronageId));

  revalidatePath("/supports");
  revalidatePath("/feed");
  revalidatePath("/dashboard/settings/membership");
  return { success: true };
}

export async function cancelPatronage(patronageId: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const [row] = await db
    .select()
    .from(patronage)
    .where(
      and(
        eq(patronage.id, patronageId),
        eq(patronage.patronUserId, user.id)
      )
    )
    .limit(1);

  if (!row) {
    return { error: "Patronage not found" };
  }

  await db
    .update(patronage)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(eq(patronage.id, patronageId));

  revalidatePath("/supports");
  revalidatePath("/feed");
  revalidatePath("/dashboard/settings/membership");
  return { success: true };
}
