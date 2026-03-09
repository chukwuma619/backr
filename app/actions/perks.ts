"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth/get-current-user";

export type PerkState = {
  errors?: Record<string, string[]>;
  message?: string;
  success?: boolean;
};

/** @deprecated Perks table was removed. Stub implementation. */
export async function createPerk(
  _tierId: string,
  _prevState: PerkState,
  _formData: FormData
): Promise<PerkState> {
  const user = await getCurrentUser();
  if (!user) redirect("/");
  return { message: "Perks are no longer supported", success: false };
}

/** @deprecated Perks table was removed. Stub implementation. */
export async function updatePerk(
  _perkId: string,
  _prevState: PerkState,
  _formData: FormData
): Promise<PerkState> {
  const user = await getCurrentUser();
  if (!user) redirect("/");
  return { message: "Perks are no longer supported", success: false };
}

/** @deprecated Perks table was removed. Stub implementation. */
export async function deletePerk(_perkId: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) redirect("/");
  revalidatePath("/dashboard");
}
