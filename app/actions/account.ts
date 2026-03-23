"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { creators, users } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { normalizeNostrPubkeyHex } from "@/lib/nostr/normalize-pubkey";

const updateAccountSchema = z.object({
  avatarUrl: z.union([z.string().max(500), z.literal("")]).optional(),
  fiberNodeRpcUrl: z.union([z.string().url(), z.literal("")]).optional(),
});

export type UpdateAccountState =
  | { success: true; errors?: never }
  | { success: false; errors?: Record<string, string[]>; message?: string };

export async function updateAccount(
  formData: FormData
): Promise<UpdateAccountState> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, message: "Unauthorized" };
  }

  const raw = {
    avatarUrl: (formData.get("avatarUrl") as string) || undefined,
    fiberNodeRpcUrl: (formData.get("fiberNodeRpcUrl") as string) || undefined,
  };

  const parsed = updateAccountSchema.safeParse({
    avatarUrl: raw.avatarUrl?.trim() ?? "",
    fiberNodeRpcUrl: raw.fiberNodeRpcUrl?.trim() ?? "",
  });

  if (!parsed.success) {
    return {
      success: false,
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    await db
      .update(users)
      .set({
        avatarUrl: parsed.data.avatarUrl?.trim() || null,
        fiberNodeRpcUrl: parsed.data.fiberNodeRpcUrl?.trim() || null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, user.id));
    revalidatePath("/dashboard/settings/basic");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Failed to update account" };
  }
}

export async function updateAccountNostrPubkey(nostrPubkey: string) {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: new Error("Unauthorized") };

  let hex: string;
  try {
    hex = normalizeNostrPubkeyHex(nostrPubkey);
  } catch {
    return { data: null, error: new Error("Invalid Nostr public key") };
  }

  try {
    const [updated] = await db
      .update(users)
      .set({ nostrPubkey: hex, updatedAt: new Date() })
      .where(eq(users.id, user.id))
      .returning();
    revalidatePath("/dashboard/settings/basic");
    revalidatePath("/dashboard");
    revalidatePath("/creator");
    revalidatePath("/creator/settings/basic");
    const [creator] = await db
      .select({ username: creators.username })
      .from(creators)
      .where(eq(creators.userId, user.id))
      .limit(1);
    if (creator) {
      revalidatePath(`/c/${creator.username}`);
      revalidatePath(`/c/${creator.username}/collections`);
    }
    return { data: updated, error: null };
  } catch (error) {
    console.error(error);
    return { data: null, error: error as Error };
  }
}

export async function clearNostrPubkeyForCurrentUser() {
  const user = await getCurrentUser();
  if (!user) return { data: null, error: new Error("Unauthorized") };

  try {
    await db
      .update(users)
      .set({ nostrPubkey: null, updatedAt: new Date() })
      .where(eq(users.id, user.id));
    revalidatePath("/dashboard/settings/basic");
    revalidatePath("/dashboard");
    revalidatePath("/creator");
    revalidatePath("/creator/settings/basic");
    revalidatePath("/creator/post");
    const [creator] = await db
      .select({ username: creators.username })
      .from(creators)
      .where(eq(creators.userId, user.id))
      .limit(1);
    if (creator) {
      revalidatePath(`/c/${creator.username}`);
      revalidatePath(`/c/${creator.username}/collections`);
    }
    return { data: { cleared: true as const }, error: null };
  } catch (error) {
    console.error(error);
    return {
      data: null,
      error: error instanceof Error ? error : new Error("Failed to disconnect Nostr"),
    };
  }
}
