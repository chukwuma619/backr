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

  let body: {
    creatorId?: unknown;
    tierId?: unknown;
    creatorInvoiceAddress?: unknown;
    platformInvoiceAddress?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const creatorId = typeof body.creatorId === "string" ? body.creatorId.trim() : null;
  const tierId = typeof body.tierId === "string" ? body.tierId.trim() : null;
  const creatorInvoiceAddress =
    typeof body.creatorInvoiceAddress === "string"
      ? body.creatorInvoiceAddress.trim()
      : null;
  const platformInvoiceAddress =
    typeof body.platformInvoiceAddress === "string"
      ? body.platformInvoiceAddress.trim()
      : null;

  if (!creatorId || !tierId || !creatorInvoiceAddress) {
    return NextResponse.json(
      { error: "Missing creatorId, tierId, or creatorInvoiceAddress" },
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
    const creatorPaymentResult = await sendPayment(patronNodeUrl, {
      invoice: creatorInvoiceAddress,
    });
    const fiberTxRef =
      typeof creatorPaymentResult.payment_hash === "string"
        ? creatorPaymentResult.payment_hash
        : JSON.stringify(creatorPaymentResult.payment_hash);

    if (
      creatorPaymentResult.status !== "Succeeded" &&
      creatorPaymentResult.status !== "succeeded"
    ) {
      return NextResponse.json(
        {
          error: `Creator payment failed: ${creatorPaymentResult.status}`,
        },
        { status: 400 }
      );
    }

    let platformFeeFiberTxRef: string | null = null;
    if (platformInvoiceAddress) {
      const platformPaymentResult = await sendPayment(patronNodeUrl, {
        invoice: platformInvoiceAddress,
      });
      platformFeeFiberTxRef =
        typeof platformPaymentResult.payment_hash === "string"
          ? platformPaymentResult.payment_hash
          : JSON.stringify(platformPaymentResult.payment_hash);

      if (
        platformPaymentResult.status !== "Succeeded" &&
        platformPaymentResult.status !== "succeeded"
      ) {
        return NextResponse.json(
          {
            error: `Platform fee payment failed: ${platformPaymentResult.status}`,
          },
          { status: 400 }
        );
      }
    }

    const { data, error } = await createPatronage({
      patronUserId: user.id,
      creatorId,
      tierId,
      amount: tier.amount,
      currency: "CKB",
      billingInterval: "monthly",
      fiberTxRef,
      platformFeeFiberTxRef,
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
