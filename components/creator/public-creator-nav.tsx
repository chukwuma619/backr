"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { DashboardLink } from "@/components/dashboard-link";
import { WalletConnect } from "@/components/wallet-connect";
import { cn } from "@/lib/utils";

export function PublicCreatorNav({ username }: { username: string }) {
  const pathname = usePathname();
  const base = `/c/${username}`;

  const items: { href: string; label: string; active: boolean }[] = [
    {
      href: base,
      label: "Home",
      active: pathname === base || pathname === `${base}/`,
    },
    {
      href: `${base}/post`,
      label: "Posts",
      active:
        pathname === `${base}/post` || pathname.startsWith(`${base}/post/`),
    },
    {
      href: `${base}/collections`,
      label: "Collections",
      active: pathname.startsWith(`${base}/collections`),
    },
    {
      href: `${base}/chats`,
      label: "Chats",
      active: pathname.startsWith(`${base}/chats`),
    },
    {
      href: `${base}/membership`,
      label: "Membership",
      active: pathname.startsWith(`${base}/membership`),
    },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-2 px-4 py-3">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
          <Link
            href="/"
            className="shrink-0 text-sm font-semibold tracking-tight text-foreground"
          >
            Backr
          </Link>
          <nav
            aria-label="Creator profile"
            className="flex min-w-0 flex-1 items-center gap-0.5 overflow-x-auto sm:gap-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {items.map(({ href, label, active }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "shrink-0 rounded-md px-2 py-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground",
                  active && "bg-muted font-medium text-foreground"
                )}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href="/"
            className="hidden text-sm text-muted-foreground hover:text-foreground sm:inline"
          >
            Log in
          </Link>
          <DashboardLink />
          <WalletConnect />
        </div>
      </div>
    </header>
  );
}
