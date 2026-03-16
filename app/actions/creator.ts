"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  CREATOR_CATEGORIES,
  creators,
  creatortopics,
  users,
} from "@/lib/db/schema";

import { validateSlug } from "@/lib/creators/slug";
import { getCreatorForDashboard } from "@/lib/creators/get-creator-for-dashboard";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { DISCOVER_TOPICS } from "@/lib/discover/constants";

const DISCOVER_TOPICS_MAP = Object.fromEntries(
  DISCOVER_TOPICS.map((t) => [t.slug, t.label]),
) as Record<string, string>;

const createSchema = z.object({
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(64, "Slug must be at most 64 characters")
    .regex(
      /^[a-z0-9-_]+$/,
      "Slug can only contain lowercase letters, numbers, hyphens, and underscores",
    ),
  displayName: z
    .string()
    .min(1, "Display name is required")
    .max(200, "Display name must be at most 200 characters"),
  bio: z.string().max(1000).optional(),
  topics: z.array(z.string()).min(1, "Select at least one topic"),
  avatarUrl: z.string().max(500).optional(),
  fiberNodeRpcUrl: z.union([z.string().url(), z.literal("")]).optional(),
});

const updateSchema = createSchema.extend({
  topics: z.array(z.string()).min(1, "Select at least one topic").optional(),
});

export type CreateCreatorState = {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
};

export async function createCreatorFromSession(
  formData: FormData,
): Promise<CreateCreatorState> {
  const user = await getCurrentUser();
  if (!user) {
    return { message: "Unauthorized", success: false };
  }
  return createCreator(user.id, "", formData);
}

export async function createCreator(
  userId: string,
  creatorId: string,
  formData: FormData,
): Promise<CreateCreatorState> {
  const topicsRaw = formData.get("topics");
  const topics = topicsRaw
    ? (JSON.parse(topicsRaw as string) as string[])
    : undefined;

  const raw = {
    slug: formData.get("slug") as string,
    displayName: formData.get("displayName") as string,
    bio: (formData.get("bio") as string) || undefined,
    topics,
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

  const validTopics = (parsed.data.topics ?? []).filter((s) =>
    (CREATOR_CATEGORIES as readonly string[]).includes(s),
  );

  await db
    .update(users)
    .set({
      userType: "creator",
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .returning({ id: users.id });

  const [creator] = await db
    .insert(creators)
    .values({
      userId: userId,
      username: slugResult.slug,
      displayName: parsed.data.displayName,
      bio: parsed.data.bio ?? null,
    })
    .returning({ id: creators.id });

  if (creator && validTopics.length > 0) {
    const topicLabels = DISCOVER_TOPICS_MAP;
    await db.insert(creatortopics).values(
      validTopics.map((slug) => ({
        creatorId: creator.id,
        slug,
        label: topicLabels[slug] ?? slug,
      })),
    );
  }

  revalidatePath("/creator");
  redirect("/creator");
}

export async function updateCreator(
  userId: string,
  creatorId: string,
  formData: FormData,
) {
  const topicsRaw = formData.get("topics");
  const topics = topicsRaw
    ? (JSON.parse(topicsRaw as string) as string[])
    : undefined;

  const raw = {
    slug: formData.get("slug") as string,
    displayName: formData.get("displayName") as string,
    bio: (formData.get("bio") as string) || undefined,
    topics,
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

  try {
    const [creator] = await db
      .update(creators)
      .set({
        username: slugResult.slug,
        displayName: parsed.data.displayName,
        bio: parsed.data.bio ?? null,
        updatedAt: new Date(),
      })
      .where(eq(creators.id, creatorId))
      .returning({ id: creators.id });

    if (parsed.data.topics !== undefined) {
      const validTopics = parsed.data.topics.filter((s) =>
        (CREATOR_CATEGORIES as readonly string[]).includes(s),
      );
      await db
        .delete(creatortopics)
        .where(eq(creatortopics.creatorId, creatorId));
      if (validTopics.length > 0) {
        await db.insert(creatortopics).values(
          validTopics.map((slug) => ({
            creatorId: creatorId,
            slug,
            label: DISCOVER_TOPICS_MAP[slug] ?? slug,
          })),
        );
      }
    }

    await db
      .update(users)
      .set({
        avatarUrl: parsed.data.avatarUrl?.trim() || null,
        fiberNodeRpcUrl: parsed.data.fiberNodeRpcUrl?.trim() || null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId));
    revalidatePath("/creator");
    revalidatePath("/creator/settings/basic");
    return { data: creator, errors: null };
  } catch (error) {
    console.error(error);
    return { data: null, error: error as Error };
  }
}

export async function updateCreatorProfile(formData: FormData) {
  const { user, creator } = await getCreatorForDashboard();
  if (!user || !creator) {
    return { message: "Unauthorized", errors: undefined };
  }
  return updateCreator(user.id, creator.id, formData);
}

export async function updateCreatorNostrPubkey(
  userId: string,
  nostrPubkey: string,
) {
  try {
    const hex = nostrPubkey.trim();
    if (!/^[a-fA-F0-9]{64}$/.test(hex)) {
      return { data: null, error: new Error("Invalid Nostr public key") };
    }

    const [user] = await db
      .update(users)
      .set({ nostrPubkey: hex, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning();
    revalidatePath("/creator");
    revalidatePath("/creator/settings/basic");
    return { data: user, error: null };
  } catch (error) {
    console.error(error);
    return { data: null, error: error as Error };
  }
}

export async function updateCreatorNostrPubkeyFromSession(nostrPubkey: string) {
  const { user } = await getCreatorForDashboard();
  if (!user) return { data: null, error: new Error("Unauthorized") };
  return updateCreatorNostrPubkey(user.id, nostrPubkey);
}
