"use client";

import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FIBER_DOCS_HREF = "https://docs.fiber.world/docs/quick-start/run-a-node";

export type FiberSetupGuideProps = {
  variant: "creator" | "patron";
};

export function FiberSetupGuide({ variant }: FiberSetupGuideProps) {
  const settingsPath =
    variant === "creator" ? "/creator/settings/basic" : "/dashboard/settings/basic";
  const isCreator = variant === "creator";
  const anchor = isCreator ? "#creators" : "#supporters";

  return (
    <Accordion type="single" collapsible className="w-full rounded-md border px-3">
      <AccordionItem value="fiber-steps" className="border-0">
        <AccordionTrigger className="py-3 text-sm hover:no-underline">
          How to run your own Fiber node
        </AccordionTrigger>
        <AccordionContent className="text-muted-foreground space-y-3 pb-3 text-sm">
          <p>
            You keep custody: Backr calls JSON-RPC on{" "}
            <strong className="text-foreground">your</strong> Fiber Network Node for{" "}
            {isCreator ? (
              <>
                <code className="text-xs">new_invoice</code> (tier checkout)
              </>
            ) : (
              <>
                <code className="text-xs">send_payment</code> (subscriptions &amp; renewals)
              </>
            )}
            . Supporters must run their own FNN (VPS or home server) and save the RPC base URL in{" "}
            <Link
              href={settingsPath}
              className="text-foreground font-medium underline underline-offset-4 hover:text-foreground/80"
            >
              Basic settings
            </Link>
            .
          </p>
          <p className="text-foreground font-medium">Short checklist</p>
          <ol className="list-decimal space-y-2 pl-5">
            <li>
              Install and start FNN — follow{" "}
              <a
                href={FIBER_DOCS_HREF}
                target="_blank"
                rel="noopener noreferrer"
                className="text-foreground font-medium underline underline-offset-4 hover:text-foreground/80"
              >
                Run a Fiber Node
              </a>{" "}
              (binary or build from source, keys via <code className="text-xs">ckb-cli</code>,
              default RPC often <code className="text-xs">http://127.0.0.1:8227</code> locally).
            </li>
            <li>
              Connect peers, open channels, fund liquidity (
              {isCreator ? "inbound for receiving" : "outbound for paying"}).
            </li>
            <li>
              Expose JSON-RPC so the <em>Backr server</em> can reach it (Tailscale, reverse proxy +
              firewall, etc.)—not raw public RPC without locks.
            </li>
            <li>
              Save the base URL (no path) in Basic settings{isCreator ? " on this page" : ""}.
            </li>
          </ol>
          <p>
            <Link
              href={`/fiber-setup${anchor}`}
              className="text-foreground inline-flex font-medium underline underline-offset-4 hover:text-foreground/80"
            >
              Full step-by-step: host, deploy, verify, paste URL →
            </Link>
          </p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
