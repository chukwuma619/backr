"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth/auth-context";
import { Button } from "@/components/ui/button";
import { WalletConnect } from "@/components/wallet-connect";

export function LandingHero() {
  const { user, isLoading } = useAuth();

  return (
    <section className="px-4 py-16 sm:py-24 lg:py-32">
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
          Creator membership on{" "}
          <span className="text-primary">Nervos CKB</span>
        </h1>
        <p className="mt-6 text-lg text-muted-foreground sm:text-xl">
          Monetize your work. Support creators you love.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          {!isLoading && user ? (
            <>
              <Button asChild size="lg">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/create">Become a creator</Link>
              </Button>
            </>
          ) : (
            <>
              <WalletConnect />
              <Button asChild variant="outline" size="lg">
                <Link href="/discover">Discover creators</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
