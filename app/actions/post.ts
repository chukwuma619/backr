"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { posts, type PostStatus } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import {
  getCreatorByUserId,
  getTiersByCreatorId,
  createNotificationsForNewPost,
} from "@/lib/db/queries";

const createSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  body: z.string().min(1, "Body is required").max(50000),
  status: z.enum(["draft", "published"]).default("draft"),
  minTierId: z.string().uuid("Select a tier").optional(),
});

export type CreatePostState = {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
  postId?: number;
};

export async function createPost(
  _prevState: CreatePostState,
  formData: FormData
): Promise<CreatePostState> {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const { data: creator } = await getCreatorByUserId(user.id);
  if (!creator) return { message: "Creator profile not found", success: false };

  const { data: creatorTiers } = await getTiersByCreatorId(creator.id);
  const tierIds = creatorTiers?.map((t) => t.id) ?? [];
  if (tierIds.length === 0) {
    return { message: "Create at least one tier first", success: false };
  }

  const raw = {
    title: formData.get("title") as string,
    body: formData.get("body") as string,
    status: (formData.get("status") as string) || "draft",
    minTierId: formData.get("minTierId") as string | undefined,
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

  const status = parsed.data.status as PostStatus;
  const isPublished = status === "published";

  if (isPublished && parsed.data.minTierId) {
    const tierBelongsToCreator = tierIds.includes(parsed.data.minTierId);
    if (!tierBelongsToCreator) {
      return { errors: { minTierId: ["Tier does not belong to you"] }, success: false };
    }
  }

  const now = new Date();
  const [inserted] = await db
    .insert(posts)
    .values({
      creatorId: creator.id,
      title: parsed.data.title,
      content: parsed.data.body,
      status,
      publishedAt: isPublished ? now : null,
    })
    .returning({ id: posts.id });

  if (inserted?.id && isPublished && parsed.data.minTierId) {
    await createNotificationsForNewPost(
      inserted.id,
      creator.id,
      parsed.data.minTierId
    );
  }

  revalidatePath("/dashboard");
  revalidatePath("/feed");
  revalidatePath("/creator/post");
  return { success: true, postId: inserted?.id };
}

const updateSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  body: z.string().min(1, "Body is required").max(50000),
  status: z.enum(["draft", "published"]).default("draft"),
});

export async function updatePost(
  postId: string | number,
  formData: FormData
): Promise<{ success?: boolean; message?: string; errors?: Record<string, string[]> }> {
  const user = await getCurrentUser();
  if (!user) return { message: "Unauthorized" };

  const { data: creator } = await getCreatorByUserId(user.id);
  if (!creator) return { message: "Creator profile not found" };

  const id = typeof postId === "string" ? parseInt(postId, 10) : postId;
  if (Number.isNaN(id)) return { message: "Invalid post ID" };

  const [post] = await db
    .select()
    .from(posts)
    .where(eq(posts.id, id))
    .limit(1);

  if (!post || post.creatorId !== creator.id) {
    return { message: "Post not found or access denied" };
  }

  const raw = {
    title: formData.get("title") as string,
    body: formData.get("body") as string,
    status: (formData.get("status") as string) || "draft",
  };

  const parsed = updateSchema.safeParse({
    title: raw.title?.trim(),
    body: raw.body?.trim(),
    status: raw.status,
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const status = parsed.data.status as PostStatus;
  const isPublishing = status === "published" && post.status !== "published";

  await db
    .update(posts)
    .set({
      title: parsed.data.title,
      content: parsed.data.body,
      status,
      ...(isPublishing && !post.publishedAt && { publishedAt: new Date() }),
      updatedAt: new Date(),
    })
    .where(eq(posts.id, id));

  revalidatePath("/dashboard");
  revalidatePath("/feed");
  revalidatePath("/creator/post");
  return { success: true };
}

export async function updatePostNostrEventId(
  postId: string | number,
  nostrEventId: string
): Promise<{ success?: boolean; message?: string }> {
  const user = await getCurrentUser();
  if (!user) return { message: "Unauthorized" };

  const { data: creator } = await getCreatorByUserId(user.id);
  if (!creator) return { message: "Creator profile not found" };

  const id = typeof postId === "string" ? parseInt(postId, 10) : postId;
  if (Number.isNaN(id)) return { message: "Invalid post ID" };

  const [post] = await db
    .select()
    .from(posts)
    .where(eq(posts.id, id))
    .limit(1);

  if (!post || post.creatorId !== creator.id) {
    return { message: "Post not found or access denied" };
  }

  await db
    .update(posts)
    .set({ nostrEventId, updatedAt: new Date() })
    .where(eq(posts.id, id));

  revalidatePath("/dashboard");
  revalidatePath("/feed");
  revalidatePath("/creator/post");
  return { success: true };
}
