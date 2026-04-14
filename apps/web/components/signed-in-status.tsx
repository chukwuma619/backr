"use client";

import { useAuth } from "@/lib/auth/auth-context";

function truncateAddress(address: string, head = 8, tail = 6) {
  if (address.length <= head + tail) return address;
  return `${address.slice(0, head)}…${address.slice(-tail)}`;
}

export function SignedInStatus() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <p className="text-sm text-muted-foreground">Loading…</p>
    );
  }

  if (user) {
    return (
      <p className="text-sm text-muted-foreground">
        Signed in as <span className="font-medium text-foreground">{truncateAddress(user.ckbAddress)}</span>
      </p>
    );
  }

  return (
    <p className="text-sm text-muted-foreground">
      Connect your wallet to get started.
    </p>
  );
}
