"use client";

import { useCallback, useEffect, useState } from "react";
import { useCcc, useSigner } from "@ckb-ccc/connector-react";
import { useAuth } from "@/lib/auth/auth-context";
import { Button } from "@/components/ui/button";

function truncateAddress(address: string, head = 8, tail = 6) {
  if (address.length <= head + tail) return address;
  return `${address.slice(0, head)}…${address.slice(-tail)}`;
}

export function WalletConnect() {
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
