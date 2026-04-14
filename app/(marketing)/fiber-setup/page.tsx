import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Fiber node setup for Backr · Creators & supporters",
  description:
    "Complete guide: run a Nervos Fiber Network Node, fund channels, expose JSON-RPC safely, and connect it to Backr for memberships and renewals.",
};

const DOC_RUN_NODE = "https://docs.fiber.world/docs/quick-start/run-a-node";
const DOC_CONNECT = "https://docs.fiber.world/docs/quick-start/connect-peers";
const DOC_OPEN_CHANNEL = "https://docs.fiber.world/docs/quick-start/open-channel";
const DOC_TRANSFER = "https://docs.fiber.world/docs/quick-start/basic-transfer";
const DOC_CONNECT_PUBLIC = "https://docs.fiber.world/docs/quick-start/connect-nodes";
const DOC_STABLECOIN = "https://docs.fiber.world/docs/quick-start/transfer-stablecoin";
const FIBER_RELEASES = "https://github.com/nervosnetwork/fiber/releases";
const FIBER_RPC_README =
  "https://github.com/nervosnetwork/fiber/blob/develop/crates/fiber-lib/src/rpc/README.md";

function ExternalLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-foreground font-medium underline underline-offset-4 hover:text-foreground/80"
    >
      {children}
    </a>
  );
}

const navItems = [
  { href: "#how-backr-uses-fiber", label: "How Backr uses Fiber" },
  { href: "#install-fnn", label: "Install FNN" },
  { href: "#keys-and-data", label: "Keys & data directory" },
  { href: "#liquidity", label: "Peers & channels" },
  { href: "#expose-rpc", label: "Expose RPC to Backr" },
  { href: "#creators", label: "Creators" },
  { href: "#supporters", label: "Supporters" },
  { href: "#checkout-flow", label: "Checkout & renewals" },
  { href: "#fiber-tuning", label: "Server trust & payment tuning" },
  { href: "#troubleshooting", label: "Troubleshooting" },
  { href: "#reference", label: "Reference" },
];

export default function FiberSetupPage() {
  return (
    <>
      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        <p className="text-muted-foreground mb-2 text-sm">
          <Link href="/" className="underline underline-offset-4">
            Home
          </Link>
          <span aria-hidden> · </span>
          Fiber setup
        </p>
        <h1 className="text-foreground mb-4 text-2xl font-semibold tracking-tight md:text-3xl">
          Fiber node setup for Backr
        </h1>
        <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
          Backr does not hold your CKB. Memberships use the{" "}
          <ExternalLink href="https://docs.fiber.world/">Fiber Network</ExternalLink> on Nervos: your
          app account stores a <strong className="text-foreground">JSON-RPC base URL</strong> for
          your Fiber Network Node (FNN). The <strong className="text-foreground">Backr server</strong>{" "}
          calls that URL—your browser does not talk to Fiber directly for checkout.
        </p>

        <nav
          aria-label="On this page"
          className="bg-muted/50 mb-10 rounded-lg border border-border px-4 py-3 text-sm"
        >
          <p className="text-foreground mb-2 font-medium">On this page</p>
          <ul className="text-muted-foreground flex flex-col gap-1.5 sm:grid sm:grid-cols-2">
            {navItems.map(({ href, label }) => (
              <li key={href}>
                <a href={href} className="underline underline-offset-4 hover:text-foreground">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <section id="how-backr-uses-fiber" className="space-y-4 border-b border-border pb-10 scroll-mt-20">
          <h2 className="text-foreground text-lg font-semibold">
            How Backr uses Fiber
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            When someone subscribes or a renewal runs, Backr orchestrates JSON-RPC on{" "}
            <strong className="text-foreground">each party&apos;s</strong> node:
          </p>
          <ul className="text-muted-foreground list-disc space-y-2 pl-5 text-sm leading-relaxed">
            <li>
              <strong className="text-foreground">Creator&apos;s FNN</strong> —{" "}
              <code className="text-xs">new_invoice</code> for the tier amount (membership invoice).
            </li>
            <li>
              <strong className="text-foreground">Supporter&apos;s FNN</strong> —{" "}
              <code className="text-xs">send_payment</code> to pay the creator&apos;s invoice.
            </li>
          </ul>
          <p className="text-muted-foreground text-sm leading-relaxed">
            You must run FNN somewhere reachable from the Backr host (VPS, home server, etc.), fund
            it, and open channels so payments can route—same idea as other channel networks. Official
            walkthroughs:{" "}
            <ExternalLink href={DOC_RUN_NODE}>Run a Fiber Node</ExternalLink>,{" "}
            <ExternalLink href={DOC_TRANSFER}>Basic transfer</ExternalLink>,{" "}
            <ExternalLink href={DOC_CONNECT_PUBLIC}>Connect public nodes (testnet)</ExternalLink>.
          </p>
        </section>

        <section id="install-fnn" className="space-y-4 border-b border-border py-10 scroll-mt-20">
          <h2 className="text-foreground text-lg font-semibold">
            1. Install and run FNN
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Follow <ExternalLink href={DOC_RUN_NODE}>Run a Fiber Node</ExternalLink>. Typical path:
          </p>
          <ol className="text-muted-foreground list-decimal space-y-2 pl-5 text-sm leading-relaxed">
            <li>
              Download <code className="text-xs">fnn</code>,{" "}
              <code className="text-xs">fnn-cli</code>, and{" "}
              <code className="text-xs">fnn-migrate</code> from{" "}
              <ExternalLink href={FIBER_RELEASES}>GitHub Releases</ExternalLink> (match your OS/arch,
              e.g. <code className="text-xs">fnn_v0.8.0-x86_64-linux-portable.tar.gz</code> on many
              VPS), or build from the{" "}
              <ExternalLink href="https://github.com/nervosnetwork/fiber">fiber</ExternalLink> repo.
            </li>
            <li>
              Copy <code className="text-xs">config/testnet/config.yml</code> (or mainnet when you
              operate there) into your node directory.
            </li>
            <li>
              Start with a strong password in{" "}
              <code className="text-xs">FIBER_SECRET_KEY_PASSWORD</code>:
            </li>
          </ol>
          <pre className="bg-muted text-foreground overflow-x-auto rounded-lg p-4 text-xs leading-relaxed">
            {`FIBER_SECRET_KEY_PASSWORD='your-strong-password' RUST_LOG=info ./fnn -c /path/to/config.yml -d /path/to/data-dir`}
          </pre>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Quick health check (local RPC):
          </p>
          <pre className="bg-muted text-foreground overflow-x-auto rounded-lg p-4 text-xs leading-relaxed">
            {`curl -s -X POST -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","id":1,"method":"node_info","params":[]}' \\
  http://127.0.0.1:8227/`}
          </pre>
          <p className="text-muted-foreground text-sm leading-relaxed">
            For production, run FNN under <code className="text-xs">systemd</code> so it survives
            reboots. Default RPC in docs is often{" "}
            <code className="text-xs">http://127.0.0.1:8227</code> — keep it local and put{" "}
            <strong className="text-foreground">nginx/Caddy + TLS</strong> in front for the public
            URL you paste into Backr.
          </p>
          <p className="text-muted-foreground text-xs leading-relaxed">
            Proxy tip: if <code className="text-xs">fnn-cli</code> or curl fails with 503 locally, try{" "}
            <code className="text-xs">export NO_PROXY=127.0.0.1,localhost</code>.
          </p>
        </section>

        <section id="keys-and-data" className="space-y-4 border-b border-border py-10 scroll-mt-20">
          <h2 className="text-foreground text-lg font-semibold">
            2. Keys and the <code className="text-xs font-normal">-d</code> data directory
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Export a CKB private key with <code className="text-xs">ckb-cli</code> per the official
            guide. FNN expects <code className="text-xs">ckb/key</code>{" "}
            <strong className="text-foreground">inside the data directory</strong> you pass to{" "}
            <code className="text-xs">-d</code> (e.g. <code className="text-xs">/var/lib/fnn/ckb/key</code>
            ), not only next to the binary. The file must be{" "}
            <strong className="text-foreground">one line</strong>: 64 hex characters, no{" "}
            <code className="text-xs">0x</code> prefix.
          </p>
          <pre className="bg-muted text-foreground overflow-x-auto rounded-lg p-4 text-xs leading-relaxed">
            {`# Example: after export, copy first line only into ckb/key under your -d tree
mkdir -p /var/lib/fnn/ckb
head -n 1 ./exported-key > /var/lib/fnn/ckb/key
chmod 600 /var/lib/fnn/ckb/key`}
          </pre>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Fund the corresponding testnet address (faucet in Fiber docs), then proceed to peers and
            channels.
          </p>
        </section>

        <section id="liquidity" className="space-y-4 border-b border-border py-10 scroll-mt-20">
          <h2 className="text-foreground text-lg font-semibold">
            3. Peers, channels, and liquidity
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Invoices and <code className="text-xs">send_payment</code> only work when your node has a
            viable path on the channel graph. Use:
          </p>
          <ul className="text-muted-foreground list-disc space-y-2 pl-5 text-sm leading-relaxed">
            <li>
              <ExternalLink href={DOC_CONNECT}>Connect to peers</ExternalLink>
            </li>
            <li>
              <ExternalLink href={DOC_OPEN_CHANNEL}>Open a channel</ExternalLink>
            </li>
            <li>
              <ExternalLink href={DOC_TRANSFER}>Basic transfer</ExternalLink> (prove end-to-end)
            </li>
            <li>
              Testnet bootstrap:{" "}
              <ExternalLink href={DOC_CONNECT_PUBLIC}>Connect public nodes</ExternalLink>
            </li>
            <li>
              Stablecoins on testnet:{" "}
              <ExternalLink href={DOC_STABLECOIN}>Transfer stablecoins</ExternalLink>
            </li>
          </ul>
          <ul className="text-muted-foreground list-disc space-y-2 pl-5 text-sm leading-relaxed">
            <li>
              <strong className="text-foreground">Creators</strong> need enough{" "}
              <strong className="text-foreground">inbound</strong> capacity so supporters can pay your
              invoices.
            </li>
            <li>
              <strong className="text-foreground">Supporters</strong> need{" "}
              <strong className="text-foreground">outbound</strong> capacity so your node can honor{" "}
              <code className="text-xs">send_payment</code> when Backr triggers checkout or renewal.
            </li>
          </ul>
          <p className="text-muted-foreground text-sm leading-relaxed">
            If you see routing errors right after opening a channel, wait for gossip to catch up (Fiber
            docs note this for <code className="text-xs">Failed to build route</code>).
          </p>
        </section>

        <section id="expose-rpc" className="space-y-4 border-b border-border py-10 scroll-mt-20">
          <h2 className="text-foreground text-lg font-semibold">
            4. Expose JSON-RPC so Backr can call your node
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Backr&apos;s server <code className="text-xs">POST</code>s JSON-RPC to the{" "}
            <strong className="text-foreground">base URL</strong> you save (no path after host/port).
            Examples: <code className="text-xs">https://fiber.example.com</code>, or{" "}
            <code className="text-xs">http://127.0.0.1:8227</code> only when Backr runs on the same
            machine as FNN (local dev).
          </p>
          <p className="text-muted-foreground text-sm leading-relaxed">
            <strong className="text-foreground">Production pattern:</strong> bind RPC to loopback on
            the VPS, run <strong className="text-foreground">nginx</strong> (or Caddy) with HTTPS on
            a hostname, proxy to <code className="text-xs">127.0.0.1:8227</code>, and add firewall +
            rate limits / allowlists where you can. RPC can move funds—treat it like a signing
            endpoint; do not leave it wide open without controls.
          </p>
          <p className="text-muted-foreground text-sm leading-relaxed">
            <strong className="text-foreground">Optional:</strong> same Tailnet as a self-hosted
            Backr → private URL (e.g. <code className="text-xs">http://100.x.y.z:8227</code>). Hosted
            Backr (e.g. Vercel) needs a URL reachable from the public internet unless you add a
            tunnel/proxy you control.
          </p>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Method reference:{" "}
            <ExternalLink href={FIBER_RPC_README}>Fiber RPC README</ExternalLink>.
          </p>
        </section>

        <section id="creators" className="space-y-4 border-b border-border py-10 scroll-mt-20">
          <h2 className="text-foreground text-lg font-semibold">
            5. Creators — checklist
          </h2>
          <ol className="text-muted-foreground list-decimal space-y-2 pl-5 text-sm leading-relaxed">
            <li>Run FNN with funded wallet and testnet/mainnet config you intend to use.</li>
            <li>Connect peers and open channels; confirm you can receive (inbound liquidity).</li>
            <li>
              Expose a <strong className="text-foreground">stable HTTPS base URL</strong> to your RPC
              (recommended) or a controlled internal URL if your hosting allows it.
            </li>
            <li>
              In Backr, open{" "}
              <Link
                href="/creator/settings/basic"
                className="text-foreground font-medium underline underline-offset-4"
              >
                Creator → Settings → Basic
              </Link>{" "}
              and paste <strong className="text-foreground">Your Fiber node JSON-RPC URL</strong>.
              Without it, supporters cannot complete checkout for your tiers.
            </li>
            <li>Create tiers and test a small subscription with a second account that has its own FNN.</li>
          </ol>
        </section>

        <section id="supporters" className="space-y-4 border-b border-border py-10 scroll-mt-20">
          <h2 className="text-foreground text-lg font-semibold">
            6. Supporters — checklist
          </h2>
          <ol className="text-muted-foreground list-decimal space-y-2 pl-5 text-sm leading-relaxed">
            <li>Run your own FNN (or one you fully control) with keys and data dir set correctly.</li>
            <li>Fund the wallet; connect peers; open channels with outbound capacity for payments.</li>
            <li>Expose RPC the same way as creators (HTTPS + reverse proxy is typical).</li>
            <li>
              In Backr, open{" "}
              <Link
                href="/dashboard/settings/basic"
                className="text-foreground font-medium underline underline-offset-4"
              >
                Dashboard → Settings → Basic
              </Link>{" "}
              and save <strong className="text-foreground">Your Fiber node JSON-RPC URL</strong>.
              Backr requires this for paying creators; there is no shared custodial patron node in the
              product model.
            </li>
            <li>Visit a creator, choose a tier, and use Support — your node will execute send_payment.</li>
          </ol>
        </section>

        <section id="checkout-flow" className="space-y-4 border-b border-border py-10 scroll-mt-20">
          <h2 className="text-foreground text-lg font-semibold">
            7. What happens on subscribe and renewal
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            <strong className="text-foreground">First checkout:</strong> Backr (server) asks the
            creator&apos;s FNN for a tier invoice via <code className="text-xs">new_invoice</code>,
            then asks your FNN to <code className="text-xs">send_payment</code>. Your browser only
            triggers the request; it does not sign Fiber calls.
          </p>
          <p className="text-muted-foreground text-sm leading-relaxed">
            If the node returns <code className="text-xs">Created</code> or{" "}
            <code className="text-xs">Inflight</code>, the Backr server keeps calling{" "}
            <code className="text-xs">get_payment</code> until the payment reaches{" "}
            <code className="text-xs">Success</code> or <code className="text-xs">Failed</code> (or
            until a configurable timeout — see below).
          </p>
          <p className="text-muted-foreground text-sm leading-relaxed">
            <strong className="text-foreground">Renewals:</strong> the app&apos;s cron job repeats a
            similar flow on the schedule your host configures. If your Fiber URL is missing or your
            node cannot pay, that renewal may be skipped until you fix liquidity or settings.
          </p>
        </section>

        <section id="fiber-tuning" className="space-y-4 border-b border-border py-10 scroll-mt-20">
          <h2 className="text-foreground text-lg font-semibold">
            8. Server trust, RPC safety, and optional payment tuning
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Treat your JSON-RPC URL like a signing surface: use HTTPS, firewalls, and allowlists where
            you can (see section 4). Backr only stores the URL you provide and calls it from the server.
          </p>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Private last hops: set <code className="text-xs">hop_hints</code> via{" "}
            <code className="text-xs">FIBER_SEND_PAYMENT_HOP_HINTS</code> or{" "}
            <code className="text-xs">sendPaymentOptions</code> on{" "}
            <code className="text-xs">POST /api/fiber/pay</code> (
            <ExternalLink href={FIBER_RPC_README}>Fiber RPC README</ExternalLink>).
          </p>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Tuning env vars are listed in <code className="text-xs">.env.example</code> (poll interval,
            max wait, fee caps). <code className="text-xs">FIBER_INVOICE_API_ENABLED</code> gates the
            invoice-only debug route (off by default; requires sign-in when on).
          </p>
        </section>

        <section id="troubleshooting" className="space-y-4 border-b border-border py-10 scroll-mt-20">
          <h2 className="text-foreground text-lg font-semibold">
            9. Troubleshooting
          </h2>
          <ul className="text-muted-foreground list-disc space-y-3 pl-5 text-sm leading-relaxed">
            <li>
              <strong className="text-foreground">Creator not set up / payment failed</strong> — ensure
              the creator saved a reachable URL and FNN is running; check nginx/TLS and firewall.
            </li>
            <li>
              <strong className="text-foreground">Supporter must add Fiber URL</strong> — save the
              URL in Dashboard → Basic; verify{" "}
              <code className="text-xs">node_info</code> via curl from another machine hits your
              public URL.
            </li>
            <li>
              <strong className="text-foreground">Route / payment errors</strong> — wait for channel
              graph sync; confirm channel is <code className="text-xs">ChannelReady</code>; check
              balances and peer connectivity (Fiber docs). For private last hops, configure{" "}
              <code className="text-xs">hop_hints</code> (env or <code className="text-xs">sendPaymentOptions</code>).
            </li>
            <li>
              <strong className="text-foreground">Checkout times out while Fiber still settling</strong>{" "}
              — increase <code className="text-xs">FIBER_PAYMENT_MAX_WAIT_MS</code> and/or{" "}
              <code className="text-xs">FIBER_SEND_PAYMENT_TIMEOUT_SECONDS</code>; ensure your host allows
              long enough function duration for <code className="text-xs">/api/fiber/pay</code> (Backr sets a
              high <code className="text-xs">maxDuration</code> for this route).
            </li>
            <li>
              <strong className="text-foreground">Wrong key path</strong> — key file must live under
              the same <code className="text-xs">-d</code> directory as{" "}
              <code className="text-xs">ckb/key</code>, be a single hex line, and match the password
              you set for FNN.
            </li>
          </ul>
        </section>

        <section id="reference" className="space-y-4 pt-10 scroll-mt-20">
          <h2 className="text-foreground text-lg font-semibold">10. Reference</h2>
          <ul className="text-muted-foreground list-disc space-y-2 pl-5 text-sm leading-relaxed">
            <li>
              <ExternalLink href={DOC_RUN_NODE}>Run a Fiber Node</ExternalLink>
            </li>
            <li>
              <ExternalLink href={DOC_TRANSFER}>Basic transfer example</ExternalLink>
            </li>
            <li>
              <ExternalLink href={DOC_CONNECT_PUBLIC}>Connect public nodes (testnet)</ExternalLink>
            </li>
            <li>
              <ExternalLink href={DOC_STABLECOIN}>Transfer stablecoins</ExternalLink>
            </li>
            <li>
              <ExternalLink href="https://docs.fiber.world/">docs.fiber.world</ExternalLink> — full
              index
            </li>
            <li>
              <ExternalLink href={FIBER_RPC_README}>Fiber RPC README</ExternalLink>
            </li>
          </ul>
        </section>
      </main>

      <footer className="border-border text-muted-foreground border-t px-4 py-6 text-center text-sm">
        <p>Creator membership on Nervos CKB</p>
      </footer>
    </>
  );
}
