import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import {
  getSessionCookieConfig,
  getClearSessionCookieConfig,
} from "@/lib/auth/session";
import { getCurrentUser } from "@/lib/auth/get-current-user";

function validateAddress(address: unknown): string | null {
  if (typeof address !== "string") return null;
  const trimmed = address.trim();
  if (trimmed.length < 20 || trimmed.length > 100) return null;
  return trimmed;
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ user: null });
  }
  return NextResponse.json({
    user: {
      id: user.id,
      ckbAddress: user.ckbAddress,
    },
  });
}

export async function POST(request: NextRequest) {
  let body: { address?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const address = validateAddress(body.address);
  if (!address) {
    return NextResponse.json(
      { error: "Missing or invalid address" },
      { status: 400 }
    );
  }

  const [existing] = await db
    .select()
    .from(users)
    .where(eq(users.ckbAddress, address))
    .limit(1);

  let user = existing;
  if (!user) {
    const [inserted] = await db
      .insert(users)
      .values({ ckbAddress: address })
      .returning();
    user = inserted;
  } else {
    const [updated] = await db
      .update(users)
      .set({ updatedAt: new Date() })
      .where(eq(users.id, user.id))
      .returning();
    user = updated ?? user;
  }

  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7; // 7 days
  const cookieConfig = getSessionCookieConfig({
    userId: user.id,
    address: user.ckbAddress,
    exp,
  });

  const response = NextResponse.json(
    { user: { id: user.id, ckbAddress: user.ckbAddress } },
    { status: 201 }
  );
  response.cookies.set(cookieConfig.name, cookieConfig.value, {
    httpOnly: cookieConfig.httpOnly,
    secure: cookieConfig.secure,
    sameSite: cookieConfig.sameSite,
    maxAge: cookieConfig.maxAge,
    path: cookieConfig.path,
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  const config = getClearSessionCookieConfig();
  response.cookies.set(config.name, config.value, {
    httpOnly: config.httpOnly,
    secure: config.secure,
    sameSite: config.sameSite,
    maxAge: config.maxAge,
    path: config.path,
  });
  return response;
}
