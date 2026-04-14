import Link from "next/link";
import { WalletConnect } from "@/components/wallet-connect";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-border flex items-center justify-between border-b px-4 py-3">
        <Link
          href="/"
          className="text-foreground text-lg font-semibold tracking-tight"
        >
          Backr
        </Link>
        <nav className="flex items-center gap-4">
          <Link
            href="/"
            className="text-muted-foreground text-sm underline-offset-4 hover:text-foreground hover:underline"
          >
            Home
          </Link>

          <Link
            href="/discover"
            className="text-muted-foreground text-sm underline-offset-4 hover:text-foreground hover:underline"
          >
            Discover
          </Link>

          <Link
            href="/fiber-setup"
            className="text-muted-foreground text-sm underline-offset-4 hover:text-foreground hover:underline"
          >
            Fiber setup
          </Link>
          
        </nav>

        <WalletConnect variant="marketing" />
      </header>
      {children}
    </div>
  );
}
