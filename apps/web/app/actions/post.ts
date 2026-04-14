"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { setPostCollections } from "@/lib/db/queries";
import { creators, posts, postPaidAudienceTiers, tiers } from "@/lib/db/schema";
import { uploadPostBodyToIpfs } from "@/lib/posts/post-body-ipfs";


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
  coverImageUrl: z.string().max(500).optional(),
});

export async function updatePost(
  postId: number,
  formData: FormData,
) {
  const hasCoverKey = formData.has("coverImageUrl");
  const raw = {
    title: formData.get("title") as string,
    body: formData.get("body") as string,
    coverImageUrl: hasCoverKey
      ? ((formData.get("coverImageUrl") as string) ?? "").trim() || undefined
      : undefined,
  };

  const parsed = updateSchema.safeParse({
    title: raw.title?.trim(),
    body: raw.body?.trim(),
    coverImageUrl: raw.coverImageUrl,
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  try {
    const [postRow] = await db
      .select({ audience: posts.audience })
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);
    if (!postRow) {
      return { data: null, error: new Error("Post not found") };
    }

    const encrypt = postRow.audience === "paid";
    const { cid, postKeyEncrypted } = await uploadPostBodyToIpfs(
      parsed.data.body,
      postId,
      { encrypt }
    );

  const [updated] = await db
    .update(posts)
    .set({
      title: parsed.data.title,
      content: null,
      contentCid: cid,
      postKeyEncrypted: encrypt ? postKeyEncrypted : null,
      ...(hasCoverKey
        ? { coverImageUrl: parsed.data.coverImageUrl?.trim() || null }
        : {}),
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

const statusSchema = z.enum(["draft", "published"]);

export async function updatePostStatus(
  postId: number,
  status: "draft" | "published"
): Promise<
  | { data: { status: string }; error: null }
  | { data: null; error: { message: string } }
> {
  const parsed = statusSchema.safeParse(status);
  if (!parsed.success) {
    return { data: null, error: { message: "Invalid status" } };
  }

  try {
    await db
      .update(posts)
      .set({
        status: parsed.data,
        ...(parsed.data === "published"
          ? { publishedAt: new Date() }
          : { publishedAt: null }),
        updatedAt: new Date(),
      })
      .where(eq(posts.id, postId));

    revalidatePath("/creator/post");
    return { data: { status: parsed.data }, error: null };
  } catch (error) {
    console.error(error);
    return {
      data: null,
      error: { message: error instanceof Error ? error.message : "Failed to update status" },
    };
  }
}

const updateWithSettingsSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  body: z.string().min(1, "Content is required").max(50000),
  coverImageUrl: z.string().max(500).optional(),
  audience: z.enum(["free", "paid"]),
  minTierId: z.string(),
});

export async function updatePostWithSettings(
  postId: number,
  formData: FormData
): Promise<
  | { data: null; error: null }
  | { data: null; error: { message: string } }
> {
  const raw = {
    title: (formData.get("title") as string)?.trim(),
    body: (formData.get("body") as string)?.trim(),
    coverImageUrl: ((formData.get("coverImageUrl") as string) ?? "").trim() || undefined,
    audience: formData.get("audience") as string,
    minTierId: (formData.get("minTierId") as string) ?? "",
  };

  const parsed = updateWithSettingsSchema.safeParse(raw);
  if (!parsed.success) {
    const msg = Object.values(parsed.error.flatten().fieldErrors).flat()[0];
    return { data: null, error: { message: msg ?? "Invalid" } };
  }

  const { title, body, coverImageUrl, audience, minTierId } = parsed.data;

  const collectionIdsRaw = formData.getAll("collectionIds") as string[];
  const collectionIds = [
    ...new Set(
      collectionIdsRaw
        .map((s) => parseInt(String(s), 10))
        .filter((n) => Number.isFinite(n) && n >= 1)
    ),
  ];

  try {
    const [postRow] = await db
      .select({ creatorId: posts.creatorId })
      .from(posts)
      .where(eq(posts.id, postId))
      .limit(1);
    if (!postRow) {
      return { data: null, error: { message: "Post not found" } };
    }

    const encrypt = audience === "paid";
    const { cid, postKeyEncrypted } = await uploadPostBodyToIpfs(body, postId, {
      encrypt,
    });

    await db
      .update(posts)
      .set({
        title,
        content: null,
        contentCid: cid,
        postKeyEncrypted: encrypt ? postKeyEncrypted : null,
        coverImageUrl: coverImageUrl?.trim() || null,
        audience: audience as "free" | "paid",
        updatedAt: new Date(),
      })
      .where(eq(posts.id, postId));

    await db.delete(postPaidAudienceTiers).where(eq(postPaidAudienceTiers.postId, postId));

    if (audience === "paid" && minTierId) {
      const tierIds =
        minTierId === "all"
          ? (await db.select({ id: tiers.id }).from(tiers).where(eq(tiers.creatorId, postRow.creatorId))).map((t) => t.id)
          : [minTierId];
      if (tierIds.length > 0) {
        await db.insert(postPaidAudienceTiers).values(
          tierIds.map((tierId) => ({ postId, tierId }))
        );
      }
    }

    const membership = await setPostCollections(
      postId,
      postRow.creatorId,
      collectionIds
    );
    if (!membership.ok) {
      return { data: null, error: { message: membership.error } };
    }

    revalidatePath("/creator/post");
    const [creator] = await db
      .select({ username: creators.username })
      .from(creators)
      .where(eq(creators.id, postRow.creatorId))
      .limit(1);
    if (creator) {
      revalidatePath(`/c/${creator.username}`);
      revalidatePath(`/c/${creator.username}/collections`);
    }
    return { data: null, error: null };
  } catch (error) {
    console.error(error);
    return {
      data: null,
      error: { message: error instanceof Error ? error.message : "Failed to save" },
    };
  }
}

