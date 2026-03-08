"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { creators, users } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getCreatorByUserId } from "@/lib/db/queries";
import { validateSlug } from "@/lib/creators/slug";

const createSchema = z.object({
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(64, "Slug must be at most 64 characters")
    .regex(
      /^[a-z0-9-_]+$/,
      "Slug can only contain lowercase letters, numbers, hyphens, and underscores"
    ),
  displayName: z
    .string()
    .min(1, "Display name is required")
    .max(200, "Display name must be at most 200 characters"),
  bio: z.string().max(1000).optional(),
  category: z.string().optional(),
  avatarUrl: z.string().max(500).optional(),
  fiberNodeRpcUrl: z.union([z.string().url(), z.literal("")]).optional(),
});

const updateSchema = createSchema;

export type CreateCreatorState = {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
};

export async function createCreator(
  _prevState: CreateCreatorState,
  formData: FormData
): Promise<CreateCreatorState> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/");
  }

  const existing = await getCreatorByUserId(user.id);
  if (existing.data) {
    return { message: "You already have a creator profile", success: false };
  }

  const raw = {
    slug: formData.get("slug") as string,
    displayName: formData.get("displayName") as string,
    bio: (formData.get("bio") as string) || undefined,
    category: (formData.get("category") as string) || undefined,
    avatarUrl: (formData.get("avatarUrl") as string) || undefined,
  };

  const parsed = createSchema.safeParse({
    ...raw,
    slug: raw.slug?.trim().toLowerCase(),
    displayName: raw.displayName?.trim(),
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      success: false,
    };
  }

  const slugResult = validateSlug(parsed.data.slug);
  if (!slugResult.ok) {
    return { errors: { slug: [slugResult.error] }, success: false };
  }

  const [existingSlug] = await db
    .select({ id: creators.id })
    .from(creators)
    .where(eq(creators.username, slugResult.slug))
    .limit(1);

  if (existingSlug) {
    return { errors: { slug: ["This slug is already taken"] }, success: false };
  }

  await db.insert(creators).values({
    userId: user.id,
    username: slugResult.slug,
    displayName: parsed.data.displayName,
    bio: parsed.data.bio ?? null,
    category: parsed.data.category ?? null,
  });

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

export async function updateCreator(
  _prevState: CreateCreatorState,
  formData: FormData
): Promise<CreateCreatorState> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/");
  }

  const { data: creator } = await getCreatorByUserId(user.id);
  if (!creator) {
    return { message: "Creator profile not found", success: false };
  }

  const raw = {
    slug: formData.get("slug") as string,
    displayName: formData.get("displayName") as string,
    bio: (formData.get("bio") as string) || undefined,
    category: (formData.get("category") as string) || undefined,
    avatarUrl: (formData.get("avatarUrl") as string) || undefined,
    fiberNodeRpcUrl: (formData.get("fiberNodeRpcUrl") as string) || undefined,
  };

  const parsed = updateSchema.safeParse({
    ...raw,
    slug: raw.slug?.trim().toLowerCase(),
    displayName: raw.displayName?.trim(),
    fiberNodeRpcUrl: raw.fiberNodeRpcUrl?.trim() || "",
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      success: false,
    };
  }

  const slugResult = validateSlug(parsed.data.slug);
  if (!slugResult.ok) {
    return { errors: { slug: [slugResult.error] }, success: false };
  }

  if (slugResult.slug !== creator.username) {
    const [existingSlug] = await db
      .select({ id: creators.id })
      .from(creators)
      .where(eq(creators.username, slugResult.slug))
      .limit(1);
    if (existingSlug) {
      return { errors: { slug: ["This slug is already taken"] }, success: false };
    }
  }

  await db
    .update(creators)
    .set({
      username: slugResult.slug,
      displayName: parsed.data.displayName,
      bio: parsed.data.bio ?? null,
      category: parsed.data.category ?? null,
      updatedAt: new Date(),
    })
    .where(eq(creators.id, creator.id));

  await db
    .update(users)
    .set({
      avatarUrl: parsed.data.avatarUrl?.trim() || null,
      fiberNodeRpcUrl: parsed.data.fiberNodeRpcUrl?.trim() || null,
      updatedAt: new Date(),
    })
    .where(eq(users.id, creator.userId));

  revalidatePath("/dashboard");
  return { success: true };
}

export async function updateCreatorNostrPubkey(
  nostrPubkey: string
): Promise<{ success?: boolean; message?: string }> {
  const user = await getCurrentUser();
  if (!user) return { message: "Unauthorized" };

  const { data: creator } = await getCreatorByUserId(user.id);
  if (!creator) return { message: "Creator profile not found" };

  const hex = nostrPubkey.trim();
  if (!/^[a-fA-F0-9]{64}$/.test(hex)) {
    return { message: "Invalid Nostr public key" };
  }

  await db
    .update(users)
    .set({ nostrPubkey: hex, updatedAt: new Date() })
    .where(eq(users.id, creator.userId));

  revalidatePath("/dashboard");
  return { success: true };
}
