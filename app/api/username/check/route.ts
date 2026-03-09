import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { creators } from "@/lib/db/schema";
import { validateSlug } from "@/lib/creators/slug";

export async function GET(request: NextRequest) {
  const username = request.nextUrl.searchParams.get("username");
  if (!username?.trim()) {
    return NextResponse.json(
      { available: false, message: "Username is required" },
      { status: 400 }
    );
  }

  const slugResult = validateSlug(username.trim().toLowerCase());
  if (!slugResult.ok) {
    return NextResponse.json(
      { available: false, message: slugResult.error },
      { status: 200 }
    );
  }

  const [existing] = await db
    .select({ id: creators.id })
    .from(creators)
    .where(eq(creators.username, slugResult.slug))
    .limit(1);

  return NextResponse.json({
    available: !existing,
    message: existing ? "This username is already taken" : "Username is available",
  });
}
