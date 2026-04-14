import Link from "next/link";

import { LandingHero } from "@/components/landing-hero";
import { LandingFeatures } from "@/components/landing-features";

export default function Home() {
  return (
    <>
      <main className="flex-1">
        <LandingHero />
        <LandingFeatures />
      </main>

      <footer className="border-border text-muted-foreground border-t px-4 py-6 text-center text-sm">
        <p className="mb-2">Creator membership on Nervos CKB</p>
        <p>
          <Link href="/fiber-setup" className="text-foreground underline underline-offset-4">
            Run your own Fiber node
          </Link>
        </p>
      </footer>
    </>
  );
}
