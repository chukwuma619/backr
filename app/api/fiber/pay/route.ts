import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { tiers, users } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { createPatronage } from "@/lib/db/queries";
import { sendPayment } from "@/lib/fiber/fiber-rpc";

function getPatronFiberNodeUrl(userFiberNodeRpcUrl: string | null): string | null {
  if (userFiberNodeRpcUrl) return userFiberNodeRpcUrl;
  const envUrl = process.env.FIBER_PATRON_RPC_URL;
  return envUrl && envUrl.trim() ? envUrl.trim() : null;
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { creatorId?: unknown; tierId?: unknown; invoiceAddress?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const creatorId = typeof body.creatorId === "string" ? body.creatorId.trim() : null;
  const tierId = typeof body.tierId === "string" ? body.tierId.trim() : null;
  const invoiceAddress = typeof body.invoiceAddress === "string" ? body.invoiceAddress.trim() : null;

  if (!creatorId || !tierId || !invoiceAddress) {
    return NextResponse.json(
      { error: "Missing creatorId, tierId, or invoiceAddress" },
      { status: 400 }
    );
  }

  const [userRow] = await db
    .select({ fiberNodeRpcUrl: users.fiberNodeRpcUrl })
    .from(users)
    .where(eq(users.id, user.id))
    .limit(1);

  const patronNodeUrl = getPatronFiberNodeUrl(userRow?.fiberNodeRpcUrl ?? null);
  if (!patronNodeUrl) {
    return NextResponse.json(
      {
        error:
          "No Fiber node configured. Set FIBER_PATRON_RPC_URL or connect your Fiber node in settings.",
      },
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
    const paymentResult = await sendPayment(patronNodeUrl, { invoice: invoiceAddress });
    const fiberTxRef =
      typeof paymentResult.payment_hash === "string"
        ? paymentResult.payment_hash
        : JSON.stringify(paymentResult.payment_hash);

    if (paymentResult.status !== "Succeeded" && paymentResult.status !== "succeeded") {
      return NextResponse.json(
        {
          error: `Payment failed: ${paymentResult.status}`,
        },
        { status: 400 }
      );
    }

    const { data, error } = await createPatronage({
      patronUserId: user.id,
      creatorId,
      tierId,
      amount: tier.priceAmount,
      currency: tier.priceCurrency,
      billingInterval: tier.billingInterval,
      fiberTxRef,
    });

    if (error) {
      console.error(error);
      return NextResponse.json(
        { error: "Failed to record patronage" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, patronage: data }, { status: 201 });
  } catch (err) {
    console.error("Fiber send_payment error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to send Fiber payment",
      },
      { status: 500 }
    );
  }
}
