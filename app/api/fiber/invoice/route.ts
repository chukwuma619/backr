import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { creators, tiers } from "@/lib/db/schema";
import { newInvoice } from "@/lib/fiber/fiber-rpc";

export async function POST(request: NextRequest) {
  let body: { creatorId?: unknown; tierId?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const creatorId = typeof body.creatorId === "string" ? body.creatorId.trim() : null;
  const tierId = typeof body.tierId === "string" ? body.tierId.trim() : null;

  if (!creatorId || !tierId) {
    return NextResponse.json(
      { error: "Missing creatorId or tierId" },
      { status: 400 }
    );
  }

  const [creator] = await db
    .select()
    .from(creators)
    .where(eq(creators.id, creatorId))
    .limit(1);

  if (!creator?.fiberNodeRpcUrl) {
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

  try {
    const result = await newInvoice(creator.fiberNodeRpcUrl, {
      amountCkb: tier.priceAmount,
      currency: "CKB",
      description: `${tier.name} - ${creator.displayName}`,
      expiry: 3600,
    });

    return NextResponse.json({
      invoiceAddress: result.invoice_address,
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
