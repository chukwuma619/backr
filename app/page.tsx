import { WalletConnect } from "@/components/wallet-connect";
import { SignedInStatus } from "@/components/signed-in-status";
import { DashboardLink } from "@/components/dashboard-link";
import { FeedLink } from "@/components/feed-link";
import { SupportsLink } from "@/components/supports-link";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border px-4 py-3 flex items-center justify-end gap-2">
        <Link href="/discover" className="text-sm font-medium text-muted-foreground hover:text-foreground">
          Discover
        </Link>
        <FeedLink />
        <SupportsLink />
        <DashboardLink />
        <WalletConnect />
      </header>
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <h1 className="text-2xl font-semibold tracking-tight mb-2">Backr</h1>
        <p className="text-muted-foreground text-center mb-8">
          Creator membership on Nervos CKB
        </p>
        <SignedInStatus />
      </main>
    </div>
  );
}
