"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import {
  getCreatorByUserId,
  getTiersAndPerksByCreatorId,
  createNotificationsForNewPost,
} from "@/lib/db/queries";

const createSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  body: z.string().min(1, "Body is required").max(50000),
  minTierId: z.string().uuid("Select a tier"),
});

export type CreatePostState = {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
  postId?: string;
};

export async function createPost(
  _prevState: CreatePostState,
  formData: FormData
): Promise<CreatePostState> {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const { data: creator } = await getCreatorByUserId(user.id);
  if (!creator) return { message: "Creator profile not found", success: false };

  const { data: tiersAndPerks } = await getTiersAndPerksByCreatorId(creator.id);
  const tierIds = tiersAndPerks?.map((t) => t.id) ?? [];
  if (tierIds.length === 0) {
    return { message: "Create at least one tier first", success: false };
  }

  const raw = {
    title: formData.get("title") as string,
    body: formData.get("body") as string,
    minTierId: formData.get("minTierId") as string,
  };

  const parsed = createSchema.safeParse({
    ...raw,
    title: raw.title?.trim(),
    body: raw.body?.trim(),
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
      success: false,
    };
  }

  const tierBelongsToCreator = tierIds.includes(parsed.data.minTierId);
  if (!tierBelongsToCreator) {
    return { errors: { minTierId: ["Tier does not belong to you"] }, success: false };
  }

  const [inserted] = await db
    .insert(posts)
    .values({
      creatorId: creator.id,
      title: parsed.data.title,
      body: parsed.data.body,
      minTierId: parsed.data.minTierId,
    })
    .returning({ id: posts.id });

  if (inserted?.id) {
    await createNotificationsForNewPost(
      inserted.id,
      creator.id,
      parsed.data.minTierId
    );
  }

  revalidatePath("/dashboard");
  revalidatePath("/feed");
  return { success: true, postId: inserted?.id };
}

const updateSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  body: z.string().min(1, "Body is required").max(50000),
});

export async function updatePost(
  postId: string,
  formData: FormData
): Promise<{ success?: boolean; message?: string; errors?: Record<string, string[]> }> {
  const user = await getCurrentUser();
  if (!user) return { message: "Unauthorized" };

  const { data: creator } = await getCreatorByUserId(user.id);
  if (!creator) return { message: "Creator profile not found" };

  const [post] = await db
    .select()
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);

  if (!post || post.creatorId !== creator.id) {
    return { message: "Post not found or access denied" };
  }

  const raw = {
    title: formData.get("title") as string,
    body: formData.get("body") as string,
  };

  const parsed = updateSchema.safeParse({
    title: raw.title?.trim(),
    body: raw.body?.trim(),
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  await db
    .update(posts)
    .set({
      title: parsed.data.title,
      body: parsed.data.body,
      updatedAt: new Date(),
    })
    .where(eq(posts.id, postId));

  revalidatePath("/dashboard");
  revalidatePath("/feed");
  return { success: true };
}

export async function updatePostNostrEventId(
  postId: string,
  nostrEventId: string
): Promise<{ success?: boolean; message?: string }> {
  const user = await getCurrentUser();
  if (!user) return { message: "Unauthorized" };

  const { data: creator } = await getCreatorByUserId(user.id);
  if (!creator) return { message: "Creator profile not found" };

  const [post] = await db
    .select()
    .from(posts)
    .where(eq(posts.id, postId))
    .limit(1);

  if (!post || post.creatorId !== creator.id) {
    return { message: "Post not found or access denied" };
  }

  await db
    .update(posts)
    .set({ nostrEventId, updatedAt: new Date() })
    .where(eq(posts.id, postId));

  revalidatePath("/dashboard");
  revalidatePath("/feed");
  return { success: true };
}
