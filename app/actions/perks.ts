"use server";

export type PerkState = {
  errors?: Record<string, string[]>;
  message?: string;
};

export async function createPerk(
  _tierId: string,
  _ctx: unknown,
  _formData: FormData
): Promise<PerkState> {
  return { message: "Perks are not available yet." };
}

export async function updatePerk(
  _perkId: string,
  _ctx: unknown,
  _formData: FormData
): Promise<PerkState> {
  return { message: "Perks are not available yet." };
}
