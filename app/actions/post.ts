"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { posts } from "@/lib/db/schema";


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

