import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { creators, tiers, users } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { newInvoice } from "@/lib/fiber/fiber-rpc";
import {
  calculatePlatformFee,
  calculateCreatorAmount,
  getPlatformFeePercent,
} from "@/lib/platform-fee";
import { fiberPayBodySchema } from "@/lib/fiber/pay-request";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  if (process.env.FIBER_INVOICE_API_ENABLED !== "true") {
    return NextResponse.json(
      {
        error:
          "Fiber invoice-only API is disabled. Use POST /api/fiber/pay or set FIBER_INVOICE_API_ENABLED=true.",
      },
      { status: 403 }
    );
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = fiberPayBodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { creatorId, tierId } = parsed.data;

  const [row] = await db
    .select({
      creator: creators,
      creatorFiberNodeRpcUrl: users.fiberNodeRpcUrl,
    })
    .from(creators)
    .innerJoin(users, eq(creators.userId, users.id))
    .where(eq(creators.id, creatorId))
    .limit(1);

  const creator = row?.creator;
  const creatorFiberNodeRpcUrl = row?.creatorFiberNodeRpcUrl;

  if (!creator || !creatorFiberNodeRpcUrl) {
    return NextResponse.json(
      { error: "Creator has not set up Fiber payments" },
      { status: 400 }
    );
  }

  const [tier] = await db
    .select()
    .from(tiers)
    .where(eq(tiers.id, tierId))
    .limit(1);

  if (!tier || tier.creatorId !== creatorId) {
    return NextResponse.json(
      { error: "Tier not found or does not belong to creator" },
      { status: 404 }
    );
  }

  const platformFeeAmount = calculatePlatformFee(tier.amount);
  const creatorAmount = calculateCreatorAmount(tier.amount);
  const hasPlatformFee =
    getPlatformFeePercent() > 0 &&
    parseFloat(platformFeeAmount) > 0 &&
    process.env.PLATFORM_FIBER_RPC_URL?.trim();

  try {
    const creatorResult = await newInvoice(creatorFiberNodeRpcUrl, {
      amountCkb: creatorAmount,
      description: `${tier.name} - ${creator.displayName}`,
      expiry: 3600,
    });

    if (!hasPlatformFee) {
      return NextResponse.json({
        creatorInvoiceAddress: creatorResult.invoice_address,
      });
    }

    const platformResult = await newInvoice(
      process.env.PLATFORM_FIBER_RPC_URL!.trim(),
      {
        amountCkb: platformFeeAmount,
        description: `Platform fee - ${creator.displayName}`,
        expiry: 3600,
      }
    );

    return NextResponse.json({
      creatorInvoiceAddress: creatorResult.invoice_address,
      platformInvoiceAddress: platformResult.invoice_address,
    });
  } catch (err) {
    console.error("Fiber new_invoice error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to create Fiber invoice",
      },
      { status: 500 }
    );
  }
}
