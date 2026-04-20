"use client";

import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { fiberResources } from "@/lib/docs/fiber-resources";

const FIBER_DOCS_HREF = fiberResources.runNode;

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
          {isCreator ? "Set up your Fiber node (creators)" : "Set up your Fiber node (members)"}
        </AccordionTrigger>
        <AccordionContent className="text-muted-foreground space-y-3 pb-3 text-sm">
          <p>
            {isCreator ? (
              <>
                You keep custody of funds: Backr asks <strong className="text-foreground">your</strong>{" "}
                node to create membership invoices (<code className="text-xs">new_invoice</code>).
              </>
            ) : (
              <>
                You keep custody: Backr asks <strong className="text-foreground">your</strong> node to
                pay creators (<code className="text-xs">send_payment</code>) when you subscribe or when
                a renewal runs.
              </>
            )}{" "}
            Run an FNN (for example on a VPS or home server) and save its JSON-RPC base URL in{" "}
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
              trusted <code className="text-xs">rpc_url</code> in <code className="text-xs">config.yml</code>,
              default RPC often <code className="text-xs">http://127.0.0.1:8227</code> locally).
            </li>
            <li>
              Connect peers, open channels, fund liquidity (
              {isCreator ? "inbound for receiving" : "outbound for paying"}). Complete a manual Fiber
              transfer in the official docs before relying on Backr.
            </li>
            <li>
              Expose JSON-RPC so this website can reach it (HTTPS reverse proxy, firewall, VPN—see the
              full guide). Test <code className="text-xs">node_info</code> on the <em>exact</em> URL you
              will paste. A URL that only works on your own PC (like{" "}
              <code className="text-xs">127.0.0.1</code>) usually will not work.
            </li>
            {!isCreator ? (
              <li>
                If this community adds a platform contribution on top of the creator price, checkout
                sends <strong className="text-foreground">two</strong> payments from your node—keep extra
                outbound capacity and leave your node online for renewals.
              </li>
            ) : null}
            <li>
              Save the base URL (no path) in Basic settings{isCreator ? " on this page" : ""}. Everyone
              must use the same network (all testnet or all mainnet).
            </li>
          </ol>
          <p>
            <Link
              href={isCreator ? "/docs/fiber/creators" : "/docs/fiber/members"}
              className="text-foreground inline-flex font-medium underline underline-offset-4 hover:text-foreground/80"
            >
              Numbered steps ({isCreator ? "creators" : "members"}) →
            </Link>
            <span className="text-muted-foreground"> · </span>
            <Link
              href="/fiber-setup#before-backr"
              className="text-foreground inline-flex font-medium underline underline-offset-4 hover:text-foreground/80"
            >
              Checklist (full guide)
            </Link>
            <span className="text-muted-foreground"> · </span>
            <Link
              href={`/fiber-setup${anchor}`}
              className="text-foreground inline-flex font-medium underline-offset-4 hover:text-foreground/80"
            >
              More detail for {isCreator ? "creators" : "members"} →
            </Link>
          </p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
