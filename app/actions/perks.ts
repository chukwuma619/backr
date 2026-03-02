"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { tiers, perks } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getCreatorByUserId } from "@/lib/db/queries";

const perkSchema = z.object({
  description: z.string().min(1, "Description is required").max(500),
  type: z.string().max(50).optional(),
});

export type PerkState = {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
};

async function ensureTierBelongsToUser(tierId: string, userId: string): Promise<boolean> {
  const { data: creator } = await getCreatorByUserId(userId);
  if (!creator) return false;

  const [tier] = await db
    .select()
    .from(tiers)
    .where(eq(tiers.id, tierId))
    .limit(1);

  return tier?.creatorId === creator.id;
}

export async function createPerk(
  tierId: string,
  _prevState: PerkState,
  formData: FormData
): Promise<PerkState> {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const allowed = await ensureTierBelongsToUser(tierId, user.id);
  if (!allowed) {
    return { message: "Tier not found", success: false };
  }

  const parsed = perkSchema.safeParse({
    description: formData.get("description"),
    type: formData.get("type") || undefined,
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      success: false,
    };
  }

  const { description, type } = parsed.data;

  await db.insert(perks).values({
    tierId,
    description: description.trim(),
    type: type?.trim() ?? null,
  });

  revalidatePath("/dashboard");
  return { success: true };
}

export async function updatePerk(
  perkId: string,
  _prevState: PerkState,
  formData: FormData
): Promise<PerkState> {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const [perk] = await db
    .select()
    .from(perks)
    .where(eq(perks.id, perkId))
    .limit(1);

  if (!perk) {
    return { message: "Perk not found", success: false };
  }

  const allowed = await ensureTierBelongsToUser(perk.tierId, user.id);
  if (!allowed) {
    return { message: "Perk not found", success: false };
  }

  const parsed = perkSchema.safeParse({
    description: formData.get("description"),
    type: formData.get("type") || undefined,
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      success: false,
    };
  }

  const { description, type } = parsed.data;

  await db
    .update(perks)
    .set({
      description: description.trim(),
      type: type?.trim() ?? null,
      updatedAt: new Date(),
    })
    .where(eq(perks.id, perkId));

  revalidatePath("/dashboard");
  return { success: true };
}

export async function deletePerk(perkId: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const [perk] = await db
    .select()
    .from(perks)
    .where(eq(perks.id, perkId))
    .limit(1);

  if (!perk) return;

  const allowed = await ensureTierBelongsToUser(perk.tierId, user.id);
  if (!allowed) return;

  await db.delete(perks).where(eq(perks.id, perkId));
  revalidatePath("/dashboard");
}
