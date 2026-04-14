import { NextResponse } from "next/server";
import type { User } from "@/lib/db/schema";
import { getCurrentUser } from "./get-current-user";

/**
 * Use at the start of protected API route handlers.
 * Returns the current user or a 401 JSON response.
 * Example: const user = await requireAuth(); if (user instanceof NextResponse) return user;
 */
export async function requireAuth(): Promise<User | NextResponse> {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return user;
}
