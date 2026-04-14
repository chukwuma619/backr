import { NextRequest, NextResponse } from "next/server";
import {
  getDuePatronagesForRenewal,
  updatePatronageAfterRenewal,
} from "@/lib/db/queries";
import { newInvoice, sendPayment } from "@/lib/fiber/fiber-rpc";
import {
  calculatePlatformFee,
  calculateCreatorAmount,
  getPlatformFeePercent,
} from "@/lib/platform-fee";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: duePatronages, error } = await getDuePatronagesForRenewal();

  if (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Failed to fetch due patronages" },
      { status: 500 }
    );
  }

  const results: {
    id: string;
    status: "processed" | "skipped" | "failed";
    reason?: string;
  }[] = [];

  const hasPlatformFee =
    getPlatformFeePercent() > 0 &&
    process.env.PLATFORM_FIBER_RPC_URL?.trim();

  for (const row of duePatronages ?? []) {
    const { patronage, creatorFiberNodeRpcUrl, patronFiberNodeRpcUrl, tierAmount } = row;
    const tierPrice = tierAmount;

    if (!creatorFiberNodeRpcUrl) {
      results.push({
        id: patronage.id,
        status: "skipped",
        reason: "Creator has no Fiber node configured",
      });
      continue;
    }

    const patronNodeUrl = patronFiberNodeRpcUrl?.trim() || null;
    if (!patronNodeUrl) {
      results.push({
        id: patronage.id,
        status: "skipped",
        reason: "Patron has no Fiber node URL in Dashboard → Basic settings",
      });
      continue;
    }

    try {
      const platformFeeAmount = calculatePlatformFee(tierPrice);
      const creatorAmount = calculateCreatorAmount(tierPrice);
      const shouldCollectPlatformFee =
        hasPlatformFee && parseFloat(platformFeeAmount) > 0;

      const creatorInvoiceResult = await newInvoice(creatorFiberNodeRpcUrl, {
        amountCkb: creatorAmount,
        currency: "CKB",
        description: `Renewal - ${row.creatorDisplayName} - ${row.tierName}`,
        expiry: 3600,
      });

      const creatorPaymentResult = await sendPayment(patronNodeUrl, {
        invoice: creatorInvoiceResult.invoice_address,
      });

      const fiberTxRef =
        typeof creatorPaymentResult.payment_hash === "string"
          ? creatorPaymentResult.payment_hash
          : JSON.stringify(creatorPaymentResult.payment_hash);

      if (
        creatorPaymentResult.status !== "Succeeded" &&
        creatorPaymentResult.status !== "succeeded"
      ) {
        results.push({
          id: patronage.id,
          status: "failed",
          reason: `Creator payment: ${creatorPaymentResult.status}`,
        });
        continue;
      }

      let platformFeeFiberTxRef: string | null = null;
      if (shouldCollectPlatformFee) {
        const platformInvoiceResult = await newInvoice(
          process.env.PLATFORM_FIBER_RPC_URL!.trim(),
          {
            amountCkb: platformFeeAmount,
            currency: "CKB",
            description: `Platform fee - ${row.creatorDisplayName}`,
            expiry: 3600,
          }
        );

        try {
          const platformPaymentResult = await sendPayment(patronNodeUrl, {
            invoice: platformInvoiceResult.invoice_address,
          });

          if (
            platformPaymentResult.status === "Succeeded" ||
            platformPaymentResult.status === "succeeded"
          ) {
            platformFeeFiberTxRef =
              typeof platformPaymentResult.payment_hash === "string"
                ? platformPaymentResult.payment_hash
                : JSON.stringify(platformPaymentResult.payment_hash);
          } else {
            console.warn(
              `Renewal ${patronage.id}: platform fee status ${platformPaymentResult.status}; extending membership without fee ref`
            );
          }
        } catch (platformErr) {
          console.warn(
            `Renewal ${patronage.id}: platform fee send failed; extending membership without fee ref`,
            platformErr
          );
        }
      }

      const { error: updateError } = await updatePatronageAfterRenewal(
        patronage.id,
        fiberTxRef,
        "monthly",
        platformFeeFiberTxRef
      );

      if (updateError) {
        console.error("Failed to update patronage after renewal:", patronage.id, updateError);
        results.push({
          id: patronage.id,
          status: "failed",
          reason: "Failed to update patronage record",
        });
        continue;
      }

      results.push({ id: patronage.id, status: "processed" });
    } catch (err) {
      console.error("Renewal failed for patronage", patronage.id, err);
      results.push({
        id: patronage.id,
        status: "failed",
        reason: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  const processed = results.filter((r) => r.status === "processed").length;
  const skipped = results.filter((r) => r.status === "skipped").length;
  const failed = results.filter((r) => r.status === "failed").length;

  return NextResponse.json({
    dueCount: duePatronages?.length ?? 0,
    processed,
    skipped,
    failed,
    results,
  });
}
