import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { creators, tiers, users } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { createPatronage } from "@/lib/db/queries";
import { newInvoice, sendPayment } from "@/lib/fiber/fiber-rpc";
import {
  calculatePlatformFee,
  calculateCreatorAmount,
  getPlatformFeePercent,
} from "@/lib/platform-fee";

function getPatronFiberNodeUrl(userFiberNodeRpcUrl: string | null): string | null {
  if (userFiberNodeRpcUrl) return userFiberNodeRpcUrl;
  const envUrl = process.env.FIBER_PATRON_RPC_URL;
  return envUrl && envUrl.trim() ? envUrl.trim() : null;
}

function paymentSucceeded(status: string): boolean {
  return status === "Succeeded" || status === "succeeded";
}

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

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

  const [creatorRow] = await db
    .select({
      creator: creators,
      creatorFiberNodeRpcUrl: users.fiberNodeRpcUrl,
    })
    .from(creators)
    .innerJoin(users, eq(creators.userId, users.id))
    .where(eq(creators.id, creatorId))
    .limit(1);

  const creator = creatorRow?.creator;
  const creatorFiberNodeRpcUrl = creatorRow?.creatorFiberNodeRpcUrl;

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
    Boolean(process.env.PLATFORM_FIBER_RPC_URL?.trim());

  try {
    const creatorInvoiceResult = await newInvoice(creatorFiberNodeRpcUrl, {
      amountCkb: creatorAmount,
      currency: "CKB",
      description: `${tier.name} - ${creator.displayName}`,
      expiry: 3600,
    });

    let platformInvoiceAddress: string | null = null;
    if (hasPlatformFee) {
      const platformInvoiceResult = await newInvoice(
        process.env.PLATFORM_FIBER_RPC_URL!.trim(),
        {
          amountCkb: platformFeeAmount,
          currency: "CKB",
          description: `Platform fee - ${creator.displayName}`,
          expiry: 3600,
        }
      );
      platformInvoiceAddress = platformInvoiceResult.invoice_address;
    }

    const creatorPaymentResult = await sendPayment(patronNodeUrl, {
      invoice: creatorInvoiceResult.invoice_address,
    });
    const fiberTxRef =
      typeof creatorPaymentResult.payment_hash === "string"
        ? creatorPaymentResult.payment_hash
        : JSON.stringify(creatorPaymentResult.payment_hash);

    if (!paymentSucceeded(creatorPaymentResult.status)) {
      return NextResponse.json(
        {
          error: `Creator payment failed: ${creatorPaymentResult.status}`,
        },
        { status: 400 }
      );
    }

    let platformFeeFiberTxRef: string | null = null;
    let platformFeeWarning: string | undefined;

    if (platformInvoiceAddress) {
      try {
        const platformPaymentResult = await sendPayment(patronNodeUrl, {
          invoice: platformInvoiceAddress,
        });
        if (paymentSucceeded(platformPaymentResult.status)) {
          platformFeeFiberTxRef =
            typeof platformPaymentResult.payment_hash === "string"
              ? platformPaymentResult.payment_hash
              : JSON.stringify(platformPaymentResult.payment_hash);
        } else {
          platformFeeWarning =
            "Membership is active, but the platform fee payment did not complete. The team may follow up.";
          console.warn(
            "Fiber platform fee payment non-success after creator paid:",
            platformPaymentResult.status
          );
        }
      } catch (platformErr) {
        platformFeeWarning =
          "Membership is active, but the platform fee payment failed. The team may follow up.";
        console.warn("Fiber platform fee send_payment error after creator paid:", platformErr);
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

    return NextResponse.json(
      {
        success: true,
        patronage: data,
        ...(platformFeeWarning ? { warning: platformFeeWarning } : {}),
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Fiber payment error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "Failed to send Fiber payment",
      },
      { status: 500 }
    );
  }
}
