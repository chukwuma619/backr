"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu } from "lucide-react";
import { WalletConnect } from "@/components/wallet-connect";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    href: "/",
    label: "Home",
    isActive: (pathname: string) => pathname === "/",
  },
  {
    href: "/discover",
    label: "Discover",
    isActive: (pathname: string) =>
      pathname === "/discover" || pathname.startsWith("/discover/"),
  },
  {
    href: "/fiber-setup",
    label: "Fiber setup",
    isActive: (pathname: string) =>
      pathname === "/fiber-setup" || pathname.startsWith("/fiber-setup/"),
  },
] as const;

function navLinkClassName(active: boolean) {
  return cn(
    "rounded-md px-3 py-2 text-sm font-medium transition-colors",
    active
      ? "bg-muted text-foreground"
      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
  );
}

export function MarketingNav() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="border-border sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
        <Link
          href="/"
          className="text-foreground shrink-0 text-lg font-semibold tracking-tight"
        >
          Backr
        </Link>

        <nav
          aria-label="Main"
          className="hidden items-center gap-0.5 md:flex md:flex-1 md:justify-center"
        >
          {NAV_ITEMS.map(({ href, label, isActive }) => {
            const active = isActive(pathname);
            return (
              <Link
                key={href}
                href={href}
                className={navLinkClassName(active)}
                aria-current={active ? "page" : undefined}
              >
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="flex shrink-0 items-center gap-2">
          <WalletConnect variant="marketing" />

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label="Open menu"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[min(100vw-2rem,20rem)]">
              <SheetHeader className="text-left">
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav
                aria-label="Main"
                className="mt-6 flex flex-col gap-1"
              >
                {NAV_ITEMS.map(({ href, label, isActive }) => {
                  const active = isActive(pathname);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMobileOpen(false)}
                      className={cn(
                        navLinkClassName(active),
                        "px-3 py-3 text-base",
                      )}
                      aria-current={active ? "page" : undefined}
                    >
                      {label}
                    </Link>
                  );
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
