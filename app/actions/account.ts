"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/get-current-user";

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
