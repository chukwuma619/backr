"use server";

import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/lib/db";
import { creatorCollections, creators } from "@/lib/db/schema";
import { getCreatorForDashboard } from "@/lib/creators/get-creator-for-dashboard";

async function revalidateCreatorPublicPaths(creatorId: string) {
  const [c] = await db
    .select({ username: creators.username })
    .from(creators)
    .where(eq(creators.id, creatorId))
    .limit(1);
  if (c) {
    revalidatePath(`/c/${c.username}`);
    revalidatePath(`/c/${c.username}/collections`);
  }
}

const createSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(5000).optional(),
  coverImageUrl: z.string().url().optional(),
});

export async function createCreatorCollection(formData: FormData) {
  const { creator } = await getCreatorForDashboard();
  if (!creator) return { error: "Unauthorized" as const };

  const coverRaw = (formData.get("coverImageUrl") as string)?.trim() ?? "";
  const parsed = createSchema.safeParse({
    name: (formData.get("name") as string)?.trim(),
    description: (formData.get("description") as string)?.trim() || undefined,
    coverImageUrl: coverRaw === "" ? undefined : coverRaw,
  });
  if (!parsed.success) {
    return {
      error: "Invalid",
      fieldErrors: parsed.error.flatten().fieldErrors,
    } as const;
  }

  try {
    await db.insert(creatorCollections).values({
      creatorId: creator.id,
      name: parsed.data.name,
      description: parsed.data.description?.trim() || null,
      coverImageUrl: parsed.data.coverImageUrl?.trim() || null,
    });
    revalidatePath("/creator/collections");
    await revalidateCreatorPublicPaths(creator.id);
    return { ok: true as const };
  } catch (e) {
    console.error(e);
    return { error: "Failed to create collection" as const };
  }
}

const updateSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(5000).optional(),
  coverImageUrl: z.string().url().optional(),
});

export async function updateCreatorCollection(
  collectionId: string,
  formData: FormData
) {
  const { creator } = await getCreatorForDashboard();
  if (!creator) return { error: "Unauthorized" as const };

  const id = parseInt(collectionId, 10);
  if (!Number.isFinite(id) || id < 1) {
    return { error: "Invalid collection" as const };
  }

  const coverRaw = (formData.get("coverImageUrl") as string)?.trim() ?? "";
  const parsed = updateSchema.safeParse({
    name: (formData.get("name") as string)?.trim(),
    description: (formData.get("description") as string)?.trim() || undefined,
    coverImageUrl: coverRaw === "" ? undefined : coverRaw,
  });
  if (!parsed.success) {
    return { error: "Invalid" as const };
  }

  const [existing] = await db
    .select()
    .from(creatorCollections)
    .where(
      and(
        eq(creatorCollections.id, id),
        eq(creatorCollections.creatorId, creator.id)
      )
    )
    .limit(1);
  if (!existing) return { error: "Not found" as const };

  try {
    await db
      .update(creatorCollections)
      .set({
        name: parsed.data.name,
        description: parsed.data.description?.trim() || null,
        coverImageUrl: parsed.data.coverImageUrl?.trim() || null,
        updatedAt: new Date(),
      })
      .where(eq(creatorCollections.id, id));
    revalidatePath("/creator/collections");
    revalidatePath(`/creator/collections/${id}`);
    await revalidateCreatorPublicPaths(creator.id);
    return { ok: true as const };
  } catch (e) {
    console.error(e);
    return { error: "Failed to update" as const };
  }
}

export async function deleteCreatorCollection(collectionId: string) {
  const { creator } = await getCreatorForDashboard();
  if (!creator) return { error: "Unauthorized" as const };

  const id = parseInt(collectionId, 10);
  if (!Number.isFinite(id) || id < 1) {
    return { error: "Invalid collection" as const };
  }

  const [row] = await db
    .select({ id: creatorCollections.id })
    .from(creatorCollections)
    .where(
      and(eq(creatorCollections.id, id), eq(creatorCollections.creatorId, creator.id))
    )
    .limit(1);
  if (!row) return { error: "Not found" as const };

  try {
    await db
      .delete(creatorCollections)
      .where(eq(creatorCollections.id, id));
    revalidatePath("/creator/collections");
    await revalidateCreatorPublicPaths(creator.id);
    return { ok: true as const };
  } catch (e) {
    console.error(e);
    return { error: "Failed to delete" as const };
  }
}
