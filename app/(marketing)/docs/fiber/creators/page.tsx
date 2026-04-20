import type { Metadata } from "next";
import Link from "next/link";

import { DocsBreadcrumb } from "@/components/docs/docs-breadcrumb";
import { DocExternalLink } from "@/components/docs/doc-external-link";
import { GuideStep, GuideSteps } from "@/components/docs/guide-steps";
import { fiberResources as r } from "@/lib/docs/fiber-resources";

export const metadata: Metadata = {
  title: "Fiber setup for creators (steps) · Backr",
  description:
    "Step-by-step: run a Fiber node, fund channels for inbound payments, connect Backr, sell memberships.",
};

export default function DocsFiberCreatorsPage() {
  return (
    <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
      <DocsBreadcrumb
        items={[
          { href: "/", label: "Home" },
          { href: "/docs", label: "Help & docs" },
          { href: "/docs/fiber/creators", label: "Creators" },
        ]}
      />
      <h1 className="text-foreground mb-3 text-2xl font-semibold tracking-tight md:text-3xl">
        Fiber setup for creators
      </h1>
      <p className="text-muted-foreground mb-10 text-sm leading-relaxed">
        Do these steps <strong className="text-foreground">in order</strong>. Skip nothing before you
        ask people to pay you. Members need their own guide—share{" "}
        <Link
          href="/docs/fiber/members"
          className="text-foreground font-medium underline underline-offset-4"
        >
          Fiber setup for members
        </Link>
        .
      </p>

      <GuideSteps>
        <GuideStep step={1} title="Confirm everyone uses the same network">
          <p>
            Pick <strong className="text-foreground">testnet</strong> or{" "}
            <strong className="text-foreground">mainnet</strong> and stick to it. You and every member
            who pays you must use the same Fiber environment. If you mix networks, payments will fail.
          </p>
        </GuideStep>
        <GuideStep step={2} title="Install Fiber Network Node (FNN)">
          <p>
            Follow <DocExternalLink href={r.runNode}>Run a Fiber Node</DocExternalLink>. Download{" "}
            <code className="text-xs">fnn</code> for your computer from{" "}
            <DocExternalLink href={r.fiberReleases}>GitHub Releases</DocExternalLink> or build from the{" "}
            <DocExternalLink href={r.fiberRepo}>fiber</DocExternalLink> repository.
          </p>
        </GuideStep>
        <GuideStep step={3} title="Create a data folder and copy network config">
          <p>
            Make a directory for your node. Copy{" "}
            <code className="text-xs">config/testnet/config.yml</code> or{" "}
            <code className="text-xs">config/mainnet/config.yml</code> from the Fiber package into
            that folder—whichever matches the network you chose in step 1.
          </p>
        </GuideStep>
        <GuideStep step={4} title="Set a trusted CKB RPC in config.yml">
          <p>
            Open <code className="text-xs">config.yml</code> and set <code className="text-xs">rpc_url</code>{" "}
            to a CKB JSON-RPC endpoint you trust. You can start from the{" "}
            <DocExternalLink href={r.ckbPublicRpc}>public CKB RPC list</DocExternalLink>.
          </p>
        </GuideStep>
        <GuideStep step={5} title="Add your wallet key under the data directory">
          <p>
            Use <code className="text-xs">ckb-cli</code> as described in the official guide. Place your
            key at <code className="text-xs">ckb/key</code>{" "}
            <strong className="text-foreground">inside</strong> the same folder you pass to{" "}
            <code className="text-xs">fnn -d</code> (the data directory). The file must be one line: 64
            hex characters, no <code className="text-xs">0x</code> prefix.
          </p>
        </GuideStep>
        <GuideStep step={6} title="Start FNN with a strong password">
          <p>
            Set <code className="text-xs">FIBER_SECRET_KEY_PASSWORD</code> and start the binary with your{" "}
            <code className="text-xs">config.yml</code> and data path. Example:
          </p>
          <pre className="bg-muted text-foreground overflow-x-auto rounded-lg p-3 text-xs leading-relaxed">
            {`FIBER_SECRET_KEY_PASSWORD='your-strong-password' RUST_LOG=info ./fnn -c /path/to/config.yml -d /path/to/data-dir`}
          </pre>
        </GuideStep>
        <GuideStep step={7} title="Fund your wallet on-chain">
          <p>
            Send CKB to your node&apos;s address (testnet faucet or mainnet deposit, per Fiber docs).
            You need enough funds to open channels and pay on-chain fees.
          </p>
        </GuideStep>
        <GuideStep step={8} title="Connect peers and open channels (inbound liquidity)">
          <p>
            You must be able to <strong className="text-foreground">receive</strong> payments. Follow{" "}
            <DocExternalLink href={r.basicTransfer}>
              Basic transfer — connect peers &amp; open a channel
            </DocExternalLink>
            . On testnet, also see{" "}
            <DocExternalLink href={r.connectPublic}>Connect public nodes</DocExternalLink>. Mainnet relay
            examples: <DocExternalLink href={r.fiberPublicNodes}>Public nodes manual</DocExternalLink>.
          </p>
        </GuideStep>
        <GuideStep step={9} title="Prove a payment works outside Backr">
          <p>
            Complete <DocExternalLink href={r.basicTransfer}>Basic transfer</DocExternalLink> (or the
            stablecoin walkthrough if that matches your setup). If you cannot receive a manual Fiber
            payment, Backr will not fix it—you still need routing or more inbound capacity.
          </p>
        </GuideStep>
        <GuideStep step={10} title="Expose JSON-RPC on a URL this site can reach">
          <p>
            By default RPC listens on <code className="text-xs">127.0.0.1</code>. Put HTTPS (nginx or
            Caddy) in front, or use a VPN both you and this Backr site share. This URL can move
            funds—use TLS and tight access controls. Test with:
          </p>
          <pre className="bg-muted text-foreground overflow-x-auto rounded-lg p-3 text-xs leading-relaxed">
            {`curl -s -X POST -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","id":1,"method":"node_info","params":[]}' \\
  https://your-fiber-url.example/`}
          </pre>
          <p>
            Run that test from <strong className="text-foreground">another device or network</strong>, not
            only your laptop, so you know the address is really public.
          </p>
        </GuideStep>
        <GuideStep step={11} title="Paste the URL into Backr">
          <p>
            Open{" "}
            <Link
              href="/creator/settings/basic"
              className="text-foreground font-medium underline underline-offset-4"
            >
              Creator → Settings → Basic
            </Link>
            . Paste your Fiber JSON-RPC <strong className="text-foreground">base URL</strong> only (no
            path after the host). Save.
          </p>
        </GuideStep>
        <GuideStep step={12} title="Create a tier and test with a second account">
          <p>
            Add a membership tier, then sign in as another user who completed the member guide and try a
            small subscription. Fix any errors before you promote your page.
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
