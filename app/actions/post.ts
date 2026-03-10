"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { posts, postPaidAudienceTiers, tiers } from "@/lib/db/schema";


export async function createPost(
  creatorId: string,
) {
  try {
  const [inserted] = await db
    .insert(posts)
    .values({
      creatorId: creatorId,
      title: "New Post",
      status: "draft",
    })
    .returning({ id: posts.id });

    revalidatePath("/creator/post");
    return {data: inserted, error: null};
  } catch (error) {
    console.error(error);
    return {
      data: null,
      error: error as Error,
    };
  }
}

const updateSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  body: z.string().min(1, "Body is required").max(50000),
  status: z.enum(["draft", "published"]).default("draft"),
});

export async function updatePost(
  postId: number,
  formData: FormData,
) {
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

  try {
  const [updated] = await db
    .update(posts)
    .set({
      title: parsed.data.title,
      content: parsed.data.body,
      status: parsed.data.status,
      updatedAt: new Date(),
    })
    .where(eq(posts.id, postId))
    .returning({ id: posts.id });
    revalidatePath("/creator/post");
    return {data: updated, error: null};
  } catch (error) {
    console.error(error);
    return {
      data: null,
      error: error as Error,
    };
  }
}

const audienceSchema = z.object({
  audience: z.enum(["free", "paid"]),
  minTierId: z.string(), // "" for free, tier uuid, or "all" for all tiers
});

export async function updatePostAudience(
  postId: number,
  formData: FormData
): Promise<
  | { data: { audience: string }; error: null }
  | { data: null; error: { message: string } }
> {
  const raw = {
    audience: formData.get("audience") as string,
    minTierId: (formData.get("minTierId") as string) ?? "",
  };
  const parsed = audienceSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      data: null,
      error: { message: parsed.error.flatten().fieldErrors.audience?.[0] ?? "Invalid" },
    };
  }

  const { audience, minTierId } = parsed.data;

  try {
    await db.update(posts).set({
      audience: audience as "free" | "paid",
      updatedAt: new Date(),
    }).where(eq(posts.id, postId));

    await db.delete(postPaidAudienceTiers).where(eq(postPaidAudienceTiers.postId, postId));

    if (audience === "paid" && minTierId) {
      const [post] = await db.select({ creatorId: posts.creatorId }).from(posts).where(eq(posts.id, postId)).limit(1);
      if (!post) return { data: null, error: { message: "Post not found" } };

      const tierIds =
        minTierId === "all"
          ? (await db.select({ id: tiers.id }).from(tiers).where(eq(tiers.creatorId, post.creatorId))).map((t) => t.id)
          : [minTierId];

      if (tierIds.length > 0) {
        await db.insert(postPaidAudienceTiers).values(
          tierIds.map((tierId) => ({ postId, tierId }))
        );
      }
    }

    revalidatePath("/creator/post");
    return { data: { audience }, error: null };
  } catch (error) {
    console.error(error);
    return { data: null, error: { message: error instanceof Error ? error.message : "Failed to update audience" } };
  }
}

