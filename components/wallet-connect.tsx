"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { useCcc, useSigner } from "@ckb-ccc/connector-react";
import { useAuth } from "@/lib/auth/auth-context";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { truncateAddress } from "@/lib/utils";

type WalletConnectProps = {
  variant?: "default" | "marketing";
};

export function WalletConnect({ variant = "default" }: WalletConnectProps) {
  const { open, disconnect, signerInfo } = useCcc();
  const signer = useSigner();
  const { user, refetch } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    if (!signer) {
      setAddress(null);
      return;
    }
    let cancelled = false;
    signer
      .getRecommendedAddress()
      .then((addr) => {
        if (!cancelled) setAddress(addr);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [signer]);

  const handleConnect = useCallback(async () => {
    setIsConnecting(true);
    try {
      open();
    } finally {
      setIsConnecting(false);
    }
  }, [open]);

  const handleDisconnect = useCallback(async () => {
    try {
      await fetch("/api/auth/session", { method: "DELETE" });
      disconnect();
      await refetch();
    } catch {
      await refetch();
    }
  }, [disconnect, refetch]);

  const syncSessionWithWallet = useCallback(async () => {
    if (!address) return;
    setIsSigningIn(true);
    try {
      const res = await fetch("/api/auth/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });
      if (res.ok) await refetch();
    } catch {
      // ignore
    } finally {
      setIsSigningIn(false);
    }
  }, [address, refetch]);

  const isConnected = !!signerInfo;
  const hasSession = !!user;

  useEffect(() => {
    if (isConnected && address && !hasSession && !isSigningIn) {
      syncSessionWithWallet();
    }
  }, [isConnected, address, hasSession, isSigningIn, syncSessionWithWallet]);

  if (variant === "marketing" && hasSession) {
    const label = user?.ckbAddress
      ? truncateAddress(user.ckbAddress)
      : address
        ? truncateAddress(address)
        : "Account";
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="gap-1.5">
            {label}
            <ChevronDown className="size-4 opacity-70" aria-hidden />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-40">
          <DropdownMenuItem asChild>
            <Link href="/dashboard">Dashboard</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => void handleDisconnect()}
          >
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  if (isConnected) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          {address ? (
            truncateAddress(address)
          ) : (
            <span className="text-muted-foreground">Connected…</span>
          )}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleDisconnect}
          disabled={isSigningIn}
        >
          Disconnect
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={handleConnect} disabled={isConnecting}>
      {isConnecting ? "Connecting…" : "Connect wallet"}
    </Button>
  );
}
