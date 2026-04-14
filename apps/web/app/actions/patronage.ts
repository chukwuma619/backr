"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import {
  cancelPatronageById,
  getPatronageById,
  getTierById,
  updatePatronageTier,
} from "@/lib/db/queries";

export async function cancelPatronage(patronageId: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const { data: cancelled } = await cancelPatronageById(patronageId, user.id);
  if (!cancelled) {
    return { error: "Patronage not found or you cannot cancel it" };
  }

  revalidatePath("/dashboard/settings/membership");
  return { error: null };
}

export async function changePatronageTier(patronageId: string, newTierId: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const [{ data: patronage }, { data: tier }] = await Promise.all([
    getPatronageById(patronageId),
    getTierById(newTierId),
  ]);

  if (!patronage || patronage.patronUserId !== user.id) {
    return { error: "Patronage not found or you cannot change it" };
  }
  if (!tier || tier.creatorId !== patronage.creatorId) {
    return { error: "Tier not found or does not belong to this creator" };
  }

  const { data: updated } = await updatePatronageTier(
    patronageId,
    user.id,
    newTierId,
    tier.amount
  );
  if (!updated) {
    return { error: "Failed to update tier" };
  }

  revalidatePath("/dashboard/settings/membership");
  return { error: null };
}
