import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import {
  getOrCreateGroupChat,
  getOrCreateDirectChat,
} from "@/lib/db/queries";
import { getPatronagesByUserId } from "@/lib/db/queries";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { creatorId?: unknown; type?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const creatorId =
    typeof body.creatorId === "string" ? body.creatorId.trim() : null;
  const type =
    body.type === "group" || body.type === "direct" ? body.type : "group";

  if (!creatorId) {
    return NextResponse.json(
      { error: "creatorId is required" },
      { status: 400 }
    );
  }

  const { data: patronages } = await getPatronagesByUserId(user.id);
  const isPatron = patronages?.some((p) => p.creatorId === creatorId);
  if (!isPatron) {
    return NextResponse.json(
      { error: "You must support this creator to chat" },
      { status: 403 }
    );
  }

  if (type === "direct") {
    const { data, error } = await getOrCreateDirectChat(creatorId, user.id);
    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json({ chat: data });
  }

  const { data, error } = await getOrCreateGroupChat(creatorId, user.id);
  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
  return NextResponse.json({ chat: data });
}
