"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Tier } from "@/lib/db/schema";
import type { Creator } from "@/lib/db/schema";

type SupportButtonProps = {
  tier: Tier & { perks: unknown[] };
  creator: Creator;
};

export function SupportButton({ tier, creator }: SupportButtonProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [paymentNote, setPaymentNote] = useState<string | null>(null);

  const isOwnHub = user && creator.userId === user.id;
  const canSupport = !isOwnHub;

  async function handleSupport() {
    if (!user) {
      setError("Please connect your wallet first.");
      return;
    }

    setStatus("pending");
    setError(null);
    setPaymentNote(null);

    try {
      const payRes = await fetch("/api/fiber/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creatorId: creator.id,
          tierId: tier.id,
        }),
      });

      if (!payRes.ok) {
        const data = await payRes.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to complete payment");
      }

      const payData = await payRes.json().catch(() => ({}));
      if (typeof payData.warning === "string") {
        setPaymentNote(payData.warning);
      }

      setStatus("success");
      router.refresh();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  if (!canSupport) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">Support</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Support {creator.displayName}</DialogTitle>
          <DialogDescription>
            {tier.name} — {tier.amount} CKB / month
          </DialogDescription>
        </DialogHeader>
        {status === "success" ? (
          <div className="space-y-2">
            <p className="text-sm text-green-600 dark:text-green-400">
              Thank you for your support!
            </p>
            {paymentNote ? (
              <p className="text-muted-foreground text-sm">{paymentNote}</p>
            ) : null}
          </div>
        ) : (
          <>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <DialogFooter>
              <Button
                onClick={handleSupport}
                disabled={status === "pending" || !user}
              >
                {status === "pending" ? "Processing…" : "Pay with Fiber"}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
