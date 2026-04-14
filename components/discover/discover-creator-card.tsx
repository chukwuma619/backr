"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { WalletConnect } from "@/components/wallet-connect";
import { cn } from "@/lib/utils";
import type { Creator } from "@/lib/db/schema";

export function DiscoverCreatorCard({
  creator,
  variant = "carousel",
  topicLabel,
  requireWalletConnect = false,
}: {
  creator: Creator;
  variant?: "carousel" | "grid";
  topicLabel?: string | null;
  requireWalletConnect?: boolean;
}) {
  const [connectOpen, setConnectOpen] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (requireWalletConnect && user && connectOpen) {
      setConnectOpen(false);
      router.push(`/c/${creator.username}`);
    }
  }, [requireWalletConnect, user, connectOpen, router, creator.username]);

  const card = (
    <Card
      className={cn(
        "h-full hover:bg-muted/50 transition-colors cursor-pointer",
        variant === "carousel" && "shrink-0 w-[280px]"
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center gap-3">
          <Avatar size="lg" className="size-12">
            <AvatarFallback className="text-lg font-semibold">
              {creator.displayName.slice(0, 1).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <CardTitle className="text-base truncate">
              {creator.displayName}
            </CardTitle>
            <CardDescription className="truncate">
              @{creator.username}
            </CardDescription>
            {topicLabel ? (
              <span className="text-xs text-muted-foreground/80 mt-0.5 block">
                {topicLabel}
              </span>
            ) : null}
          </div>
        </div>
      </CardHeader>
      {creator.bio ? (
        <CardContent className="pt-0">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {creator.bio}
          </p>
        </CardContent>
      ) : null}
    </Card>
  );

  if (requireWalletConnect) {
    return (
      <>
        <button
          type="button"
          className="block max-w-full rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          onClick={() => setConnectOpen(true)}
        >
          {card}
        </button>
        <Dialog open={connectOpen} onOpenChange={setConnectOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Connect your wallet</DialogTitle>
              <DialogDescription>
                Connect a wallet to view creator profiles and support creators
                on Backr.
              </DialogDescription>
            </DialogHeader>
            <WalletConnect />
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <Link
      href={`/c/${creator.username}`}
      className={cn(variant === "carousel" && "shrink-0 block w-[280px]")}
    >
      {card}
    </Link>
  );
}
