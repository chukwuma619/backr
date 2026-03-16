import { NextRequest, NextResponse } from "next/server";
import { getCreatorForDashboard } from "@/lib/creators/get-creator-for-dashboard";
import { getOrCreateDirectChat } from "@/lib/db/queries";
import { db } from "@/lib/db";
import { patronage } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  const { creator } = await getCreatorForDashboard();
  if (!creator) {
    return NextResponse.json({ error: "Creator not found" }, { status: 403 });
  }

  let body: { patronUserId?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const patronUserId =
    typeof body.patronUserId === "string" ? body.patronUserId.trim() : null;
  if (!patronUserId) {
    return NextResponse.json(
      { error: "patronUserId is required" },
      { status: 400 }
    );
  }

  const [isPatron] = await db
    .select({ patronUserId: patronage.patronUserId })
    .from(patronage)
    .where(
      and(
        eq(patronage.creatorId, creator.id),
        eq(patronage.patronUserId, patronUserId),
        eq(patronage.status, "active")
      )
    )
    .limit(1);
  if (!isPatron) {
    return NextResponse.json(
      { error: "User is not an active supporter" },
      { status: 403 }
    );
  }

  const { data: chat, error } = await getOrCreateDirectChat(
    creator.id,
    patronUserId
  );
  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ chat }, { status: 201 });
}
