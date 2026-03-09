"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { tiers } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getCreatorByUserId } from "@/lib/db/queries";

const tierSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  amount: z.string().min(1, "Amount is required").max(50),
});

export type TierState = {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
};

export async function createTier(
  _prevState: TierState,
  formData: FormData
): Promise<TierState> {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const { data: creator } = await getCreatorByUserId(user.id);
  if (!creator) return { message: "Creator profile not found", success: false };

  const parsed = tierSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    amount: formData.get("amount") ?? formData.get("priceAmount"),
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      success: false,
    };
  }

  const { name, description, amount } = parsed.data;

  await db.insert(tiers).values({
    creatorId: creator.id,
    name: name.trim(),
    description: description?.trim() ?? null,
    amount: amount.trim(),
  });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateTier(
  tierId: string,
  _prevState: TierState,
  formData: FormData
): Promise<TierState> {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const { data: creator } = await getCreatorByUserId(user.id);

  const [tier] = await db
    .select()
    .from(tiers)
    .where(eq(tiers.id, tierId))
    .limit(1);

  if (!creator || !tier || tier.creatorId !== creator.id) {
    return { message: "Tier not found", success: false };
  }

  const parsed = tierSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") || undefined,
    amount: formData.get("amount") ?? formData.get("priceAmount"),
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      success: false,
    };
  }

  const { name, description, amount } = parsed.data;

  await db
    .update(tiers)
    .set({
      name: name.trim(),
      description: description?.trim() ?? null,
      amount: amount.trim(),
      updatedAt: new Date(),
    })
    .where(eq(tiers.id, tierId));

  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteTier(tierId: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const { data: creator } = await getCreatorByUserId(user.id);

  const [tier] = await db
    .select()
    .from(tiers)
    .where(eq(tiers.id, tierId))
    .limit(1);

  if (!tier || tier.creatorId !== creator?.id) {
    return;
  }

  await db.delete(tiers).where(eq(tiers.id, tierId));
  revalidatePath("/dashboard");
}
