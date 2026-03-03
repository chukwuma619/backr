"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { patronage } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/get-current-user";

export async function cancelPatronage(patronageId: string) {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  const [row] = await db
    .select()
    .from(patronage)
    .where(
      and(
        eq(patronage.id, patronageId),
        eq(patronage.patronUserId, user.id)
      )
    )
    .limit(1);

  if (!row) {
    return { error: "Patronage not found" };
  }

  await db
    .update(patronage)
    .set({ status: "cancelled", updatedAt: new Date() })
    .where(eq(patronage.id, patronageId));

  revalidatePath("/supports");
  revalidatePath("/feed");
  return { success: true };
}
