"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import {
  getCreatorBySlug,
  getCreatorSubscriptionForUser,
  subscribeToCreator,
  unsubscribeFromCreator,
} from "@/lib/db/queries";

export async function toggleCreatorSubscription(username: string) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const { data: creator } = await getCreatorBySlug(username);
  if (!creator) {
    return { error: "Creator not found" };
  }

  const { data: existing } = await getCreatorSubscriptionForUser(
    user.id,
    creator.id
  );

  if (existing) {
    const { error } = await unsubscribeFromCreator(user.id, creator.id);
    if (error) {
      return { error: error.message ?? "Failed to unsubscribe" };
    }
  } else {
    const { error } = await subscribeToCreator(user.id, creator.id);
    if (error) {
      return { error: error.message ?? "Failed to subscribe" };
    }
  }

  revalidatePath(`/c/${username}`);
  return { error: null };
}
