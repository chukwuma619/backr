import Link from "next/link";
import { WalletConnect } from "@/components/wallet-connect";
import { DashboardLink } from "@/components/dashboard-link";

import { LandingHero } from "@/components/landing-hero";
import { LandingFeatures } from "@/components/landing-features";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border px-4 py-3 flex items-center justify-between">
        <Link
          href="/"
          className="text-lg font-semibold tracking-tight text-foreground"
        >
          Backr
        </Link>
        <nav className="flex items-center gap-4">

          <DashboardLink />
          <WalletConnect />
        </nav>
      </header>

      <main className="flex-1">
        <LandingHero />
        <LandingFeatures />
      </main>

      <footer className="border-t border-border px-4 py-6 text-center text-sm text-muted-foreground">
        <p>Creator membership on Nervos CKB</p>
      </footer>
    </div>
  );
}
