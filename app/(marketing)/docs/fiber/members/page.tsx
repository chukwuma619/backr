import type { Metadata } from "next";
import Link from "next/link";

import { DocsBreadcrumb } from "@/components/docs/docs-breadcrumb";
import { DocExternalLink } from "@/components/docs/doc-external-link";
import { GuideStep, GuideSteps } from "@/components/docs/guide-steps";
import { fiberResources as r } from "@/lib/docs/fiber-resources";

export const metadata: Metadata = {
  title: "Fiber setup for members (steps) · Backr",
  description:
    "Step-by-step: run a Fiber node, fund outbound channels, save your URL in Backr, subscribe and renew.",
};

export default function DocsFiberMembersPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <DocsBreadcrumb
        items={[
          { href: "/", label: "Home" },
          { href: "/docs", label: "Help & docs" },
          { href: "/docs/fiber/members", label: "Members" },
        ]}
      />
      <h1 className="text-foreground mb-3 text-2xl font-semibold tracking-tight md:text-3xl">
        Fiber setup for members
      </h1>
      <p className="text-muted-foreground mb-10 text-sm leading-relaxed">
        Do these steps <strong className="text-foreground">in order</strong> before you click{" "}
        <strong className="text-foreground">Support</strong> on a creator&apos;s page. Creators follow a
        different path:{" "}
        <Link
          href="/docs/fiber/creators"
          className="text-foreground font-medium underline underline-offset-4"
        >
          Fiber setup for creators
        </Link>
        .
      </p>

      <GuideSteps>
        <GuideStep step={1} title="Use the same network as the creator">
          <p>
            If the creator is on <strong className="text-foreground">testnet</strong>, you must be on
            testnet too. If they are on <strong className="text-foreground">mainnet</strong>, you must
            be on mainnet. Ask them if you are unsure.
          </p>
        </GuideStep>
        <GuideStep step={2} title="Install Fiber Network Node (FNN)">
          <p>
            Follow <DocExternalLink href={r.runNode}>Run a Fiber Node</DocExternalLink>. Download{" "}
            <code className="text-xs">fnn</code> from{" "}
            <DocExternalLink href={r.fiberReleases}>GitHub Releases</DocExternalLink> for your machine
            (VPS or home server is fine).
          </p>
        </GuideStep>
        <GuideStep step={3} title="Create a data folder and copy network config">
          <p>
            Copy <code className="text-xs">config/testnet/config.yml</code> or{" "}
            <code className="text-xs">config/mainnet/config.yml</code> into your node folder—matching
            step 1.
          </p>
        </GuideStep>
        <GuideStep step={4} title="Set a trusted CKB RPC in config.yml">
          <p>
            Set <code className="text-xs">rpc_url</code> in <code className="text-xs">config.yml</code>{" "}
            to a CKB endpoint you trust. See{" "}
            <DocExternalLink href={r.ckbPublicRpc}>public CKB RPC nodes</DocExternalLink>.
          </p>
        </GuideStep>
        <GuideStep step={5} title="Add your wallet key under the data directory">
          <p>
            Export a key with <code className="text-xs">ckb-cli</code> and save it as{" "}
            <code className="text-xs">ckb/key</code> under your <code className="text-xs">-d</code> data
            directory—one line, 64 hex characters, no <code className="text-xs">0x</code>.
          </p>
        </GuideStep>
        <GuideStep step={6} title="Start FNN with a strong password">
          <p>
            Example:
          </p>
          <pre className="bg-muted text-foreground overflow-x-auto rounded-lg p-3 text-xs leading-relaxed">
            {`FIBER_SECRET_KEY_PASSWORD='your-strong-password' RUST_LOG=info ./fnn -c /path/to/config.yml -d /path/to/data-dir`}
          </pre>
        </GuideStep>
        <GuideStep step={7} title="Fund your wallet and open outbound channels">
          <p>
            You must be able to <strong className="text-foreground">send</strong> payments. Fund on-chain,
            then follow{" "}
            <DocExternalLink href={r.basicTransfer}>
              Basic transfer — connect peers &amp; open a channel
            </DocExternalLink>
            . Leave enough{" "}
            <strong className="text-foreground">outbound</strong> capacity for the subscription price plus
            routing fees. Testnet bootstrap:{" "}
            <DocExternalLink href={r.connectPublic}>Connect public nodes</DocExternalLink>.
          </p>
        </GuideStep>
        <GuideStep step={8} title="Prove you can pay someone outside Backr">
          <p>
            Finish <DocExternalLink href={r.basicTransfer}>Basic transfer</DocExternalLink> (or the
            stablecoin guide if you use that). If you cannot pay manually, fix liquidity and routing
            before subscribing on Backr.
          </p>
        </GuideStep>
        <GuideStep step={9} title="Plan for two payments if there is a platform contribution">
          <p>
            Some communities add a small platform contribution on top of the creator&apos;s price. When
            that is on, Backr sends <strong className="text-foreground">two</strong> payments from your
            node when you subscribe—first to the creator, then the contribution. Keep extra balance and
            channel capacity for both.
          </p>
        </GuideStep>
        <GuideStep step={10} title="Expose JSON-RPC on a URL Backr can call">
          <p>
            Use HTTPS (or a shared VPN) so this website—not only your own PC—can reach your node. Test{" "}
            <code className="text-xs">node_info</code> with curl against the exact URL you will paste. A
            URL that only works as <code className="text-xs">127.0.0.1</code> on your laptop will usually
            fail.
          </p>
        </GuideStep>
        <GuideStep step={11} title="Save your URL in Backr">
          <p>
            Sign in, open{" "}
            <Link
              href="/dashboard/settings/basic"
              className="text-foreground font-medium underline underline-offset-4"
            >
              Dashboard → Settings → Basic
            </Link>
            , and paste your Fiber JSON-RPC base URL (no path). Save.
          </p>
        </GuideStep>
        <GuideStep step={12} title="Subscribe and keep your node online">
          <p>
            Visit the creator, choose a tier, and use Support. For renewals, Backr will try again on a
            regular schedule—keep FNN running with working channels so your membership can renew.
          </p>
        </GuideStep>
      </GuideSteps>

      <p className="text-muted-foreground mt-12 border-t border-border pt-8 text-sm leading-relaxed">
        Stuck? See{" "}
        <Link href="/fiber-setup#troubleshooting" className="text-foreground underline underline-offset-4">
          Troubleshooting
        </Link>{" "}
        in the full guide, or{" "}
        <Link href="/docs" className="text-foreground underline underline-offset-4">
          back to Help &amp; docs
        </Link>
        .
      </p>

      <footer className="text-muted-foreground mt-12 border-t border-border pt-8 text-center text-sm">
        <p>Creator membership on Nervos CKB</p>
      </footer>
    </main>
  );
}
