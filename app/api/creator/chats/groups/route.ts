import { NextRequest, NextResponse } from "next/server";
import { getCreatorForDashboard } from "@/lib/creators/get-creator-for-dashboard";
import {
  createGroupChat,
  getTiersByCreatorId,
} from "@/lib/db/queries";

export async function POST(request: NextRequest) {
  const { creator } = await getCreatorForDashboard();
  if (!creator) {
    return NextResponse.json({ error: "Creator not found" }, { status: 403 });
  }

  let body: { name?: unknown; audience?: unknown; minTierId?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const name = typeof body.name === "string" ? body.name.trim() : "";
  if (!name) {
    return NextResponse.json(
      { error: "Group name is required" },
      { status: 400 }
    );
  }
  const audience =
    body.audience === "paid" || body.audience === "free" ? body.audience : "free";
  const minTierId =
    typeof body.minTierId === "string" ? body.minTierId.trim() : "";

  let tierIds: string[] = [];
  if (audience === "paid" && minTierId) {
    const { data: tiers } = await getTiersByCreatorId(creator.id);
    tierIds =
      minTierId === "all"
        ? (tiers ?? []).map((t) => t.id)
        : [minTierId];
  }

  const { data: chat, error } = await createGroupChat(creator.id, {
    name,
    audience,
    tierIds: tierIds.length > 0 ? tierIds : undefined,
  });

  if (error) {
    const status = error.message.includes("already exists") ? 409 : 500;
    return NextResponse.json({ error: error.message }, { status });
  }

  return NextResponse.json({ chat }, { status: 201 });
}
