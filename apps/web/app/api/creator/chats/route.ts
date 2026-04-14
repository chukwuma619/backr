import { NextResponse } from "next/server";
import { getCreatorForDashboard } from "@/lib/creators/get-creator-for-dashboard";
import { getChatsForCreator } from "@/lib/db/queries";

export async function GET() {
  const { creator } = await getCreatorForDashboard();
  if (!creator) {
    return NextResponse.json({ error: "Creator not found" }, { status: 403 });
  }

  const { data: chats, error } = await getChatsForCreator(creator.id);
  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ chats });
}
