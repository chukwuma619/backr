import type { Metadata } from "next";
import Link from "next/link";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Help & docs · Backr",
  description:
    "Step-by-step guides for creators and members: Fiber node setup, payments, and memberships.",
};

export default function DocsIndexPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <p className="text-muted-foreground mb-2 text-sm">
        <Link href="/" className="underline underline-offset-4">
          Home
        </Link>
        <span aria-hidden> · </span>
        Help &amp; docs
      </p>
      <h1 className="text-foreground mb-3 text-2xl font-semibold tracking-tight md:text-3xl">
        Help &amp; docs
      </h1>
      <p className="text-muted-foreground mb-10 text-sm leading-relaxed">
        Follow these guides in order. They are written for{" "}
        <strong className="text-foreground">creators</strong> and{" "}
        <strong className="text-foreground">members</strong> using Backr—not for hosting the app
        yourself. For the full technical reference (security, upgrades, links), see{" "}
        <Link
          href="/fiber-setup"
          className="text-foreground font-medium underline underline-offset-4"
        >
          Fiber setup (full guide)
        </Link>
        .
      </p>

      <ul className="flex flex-col gap-4">
        <li>
          <Link href="/docs/fiber/creators" className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Card className="transition-colors hover:bg-muted/40">
              <CardHeader>
                <CardTitle className="text-lg">Fiber setup for creators</CardTitle>
                <CardDescription className="text-pretty">
                  Numbered steps: install your node, receive membership payments, paste your URL in
                  Backr, publish tiers.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </li>
        <li>
          <Link href="/docs/fiber/members" className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Card className="transition-colors hover:bg-muted/40">
              <CardHeader>
                <CardTitle className="text-lg">Fiber setup for members</CardTitle>
                <CardDescription className="text-pretty">
                  Numbered steps: run your node, pay creators, save your URL, subscribe and renew
                  without confusion.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </li>
        <li>
          <Link href="/fiber-setup" className="block rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <Card className="transition-colors hover:bg-muted/40">
              <CardHeader>
                <CardTitle className="text-lg">Fiber setup — full reference</CardTitle>
                <CardDescription className="text-pretty">
                  Deep dive: RPC safety, troubleshooting, mainnet relays, and links to the official
                  Fiber project.
                </CardDescription>
              </CardHeader>
            </Card>
          </Link>
        </li>
      </ul>

      <footer className="text-muted-foreground mt-16 border-t border-border pt-8 text-center text-sm">
        <p>Creator membership on Nervos CKB</p>
      </footer>
    </main>
  );
}
