"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { tiers } from "@/lib/db/schema";
import { getCreatorForDashboard } from "@/lib/creators/get-creator-for-dashboard";

const tierSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  description: z.string().max(500).optional(),
  amount: z.string().min(1, "Amount is required").max(50),
  coverImageUrl: z.string().max(500).optional(),
});

export type CreateTierState = {
  errors?: Record<string, string[]>;
  message?: string;
};

export async function createTier(
  _ctx: unknown,
  formData: FormData
): Promise<CreateTierState | void> {
  const { creator } = await getCreatorForDashboard();
  if (!creator) {
    return { message: "Unauthorized" };
  }

  const raw = {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    amount: formData.get("amount") as string,
    coverImageUrl: (formData.get("coverImageUrl") as string) ?? "",
  };

  const parsed = tierSchema.safeParse({
    name: raw.name?.trim(),
    description: raw.description?.trim() || undefined,
    amount: raw.amount?.trim(),
    coverImageUrl: raw.coverImageUrl?.trim() || undefined,
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    await db.insert(tiers).values({
      creatorId: creator.id,
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      amount: parsed.data.amount,
      coverImageUrl: parsed.data.coverImageUrl?.trim() || null,
    });
    revalidatePath("/creator/settings/membership-plan");
  } catch (error) {
    console.error(error);
    return { message: "Failed to create tier" };
  }
}

export async function updateTier(
  tierId: string,
  _ctx: unknown,
  formData: FormData
): Promise<CreateTierState | void> {
  const { creator } = await getCreatorForDashboard();
  if (!creator) {
    return { message: "Unauthorized" };
  }

  const raw = {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    amount: formData.get("amount") as string,
    coverImageUrl: (formData.get("coverImageUrl") as string) ?? "",
  };

  const parsed = tierSchema.safeParse({
    name: raw.name?.trim(),
    description: raw.description?.trim() || undefined,
    amount: raw.amount?.trim(),
    coverImageUrl: raw.coverImageUrl?.trim() || undefined,
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    const [updated] = await db
      .update(tiers)
      .set({
        name: parsed.data.name,
        description: parsed.data.description ?? null,
        amount: parsed.data.amount,
        coverImageUrl: parsed.data.coverImageUrl?.trim() || null,
        updatedAt: new Date(),
      })
      .where(and(eq(tiers.id, tierId), eq(tiers.creatorId, creator.id)))
      .returning({ id: tiers.id });

    if (!updated) {
      return { message: "Tier not found or access denied" };
    }
    revalidatePath("/creator/settings/membership-plan");
  } catch (error) {
    console.error(error);
    return { message: "Failed to update tier" };
  }
}

export async function deleteTier(tierId: string): Promise<void> {
  const { creator } = await getCreatorForDashboard();
  if (!creator) return;

  try {
    await db
      .delete(tiers)
      .where(and(eq(tiers.id, tierId), eq(tiers.creatorId, creator.id)));
    revalidatePath("/creator/settings/membership-plan");
  } catch (error) {
    console.error(error);
  }
}
