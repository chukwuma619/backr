import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import {
  getMessagesByChatId,
  canUserAccessChat,
  sendMessage,
  getChatById,
  createNotificationsForNewMessage,
} from "@/lib/db/queries";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { chatId } = await params;
  const canAccess = await canUserAccessChat(chatId, user.id);
  if (!canAccess) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await getMessagesByChatId(chatId);
  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ messages: data });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ chatId: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { chatId } = await params;
  const canAccess = await canUserAccessChat(chatId, user.id);
  if (!canAccess) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { body?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const messageBody =
    typeof body.body === "string" ? body.body.trim() : "";
  if (!messageBody) {
    return NextResponse.json(
      { error: "Message body is required" },
      { status: 400 }
    );
  }

  const { data, error } = await sendMessage(chatId, user.id, messageBody);
  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  const { data: chat } = await getChatById(chatId);
  if (chat) {
    await createNotificationsForNewMessage(
      chatId,
      user.id,
      chat.creatorId
    );
  }

  return NextResponse.json({ message: data }, { status: 201 });
}
