import type { Metadata } from "next";
import Link from "next/link";
import { WalletConnect } from "@/components/wallet-connect";
import { DashboardLink } from "@/components/dashboard-link";

export const metadata: Metadata = {
  title: "Run your own Fiber node · Backr",
  description:
    "Host a Fiber Network Node, expose JSON-RPC safely, and connect it to Backr for creator payouts and supporter payments.",
};

const DOC_RUN_NODE = "https://docs.fiber.world/docs/quick-start/run-a-node";
const DOC_CONNECT = "https://docs.fiber.world/docs/quick-start/connect-peers";
const DOC_OPEN_CHANNEL = "https://docs.fiber.world/docs/quick-start/open-channel";
const DOC_TRANSFER = "https://docs.fiber.world/docs/quick-start/basic-transfer";
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

export default function FiberSetupPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-border flex items-center justify-between border-b px-4 py-3">
        <Link
          href="/"
          className="text-foreground text-lg font-semibold tracking-tight"
        >
          Backr
        </Link>
        <nav className="flex items-center gap-4">
          <DashboardLink />
          <WalletConnect />
        </nav>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10">
        <p className="text-muted-foreground mb-2 text-sm">
          <Link href="/" className="underline underline-offset-4">
            Home
          </Link>
          <span aria-hidden> · </span>
          Fiber setup
        </p>
        <h1 className="text-foreground mb-4 text-2xl font-semibold tracking-tight md:text-3xl">
          Run your own Fiber node for Backr
        </h1>
        <p className="text-muted-foreground mb-10 text-sm leading-relaxed">
          Backr does not custody CKB for you. The app sends JSON-RPC to{" "}
          <strong className="text-foreground font-medium">your</strong> Fiber Network Node (FNN):
          creators need <code className="text-xs">new_invoice</code>, supporters need{" "}
          <code className="text-xs">send_payment</code>. This page walks through installing FNN,
          funding channels, exposing RPC to the Backr server, and pasting the base URL into
          settings.
        </p>

        <section className="space-y-4 border-b border-border pb-10">
          <h2 className="text-foreground text-lg font-semibold">
            1. Install and start FNN
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Follow the official guide:{" "}
            <ExternalLink href={DOC_RUN_NODE}>Run a Fiber Node</ExternalLink>. In short:
          </p>
          <ol className="text-muted-foreground list-decimal space-y-2 pl-5 text-sm leading-relaxed">
            <li>
              Download a release from{" "}
              <ExternalLink href={FIBER_RELEASES}>GitHub Releases</ExternalLink> or build from
              source (<code className="text-xs">cargo build --release</code> in the{" "}
              <ExternalLink href="https://github.com/nervosnetwork/fiber">fiber</ExternalLink>{" "}
              repo).
            </li>
            <li>
              Create a working directory, copy <code className="text-xs">config.yml</code> (e.g.
              from <code className="text-xs">config/testnet/config.yml</code> in the repo), and set
              up keys with <code className="text-xs">ckb-cli</code> as described in the docs.
            </li>
            <li>
              Start the node with a strong{" "}
              <code className="text-xs">FIBER_SECRET_KEY_PASSWORD</code>, for example:
            </li>
          </ol>
          <pre className="bg-muted text-foreground overflow-x-auto rounded-lg p-4 text-xs leading-relaxed">
            {`FIBER_SECRET_KEY_PASSWORD='your-strong-password' RUST_LOG=info ./fnn -c config.yml -d .`}
          </pre>
          <p className="text-muted-foreground text-sm leading-relaxed">
            The default JSON-RPC listen address in the docs is{" "}
            <code className="text-xs">http://127.0.0.1:8227</code>. Confirm with a quick check:
          </p>
          <pre className="bg-muted text-foreground overflow-x-auto rounded-lg p-4 text-xs leading-relaxed">
            {`curl -s -X POST -H "Content-Type: application/json" \\
  -d '{"jsonrpc":"2.0","id":1,"method":"node_info","params":[]}' \\
  http://127.0.0.1:8227/`}
          </pre>
          <p className="text-muted-foreground text-xs leading-relaxed">
            If you get HTTP proxy errors locally, try{" "}
            <code className="text-xs">export NO_PROXY=127.0.0.1,localhost</code> (see the official
            run-a-node page).
          </p>
        </section>

        <section className="space-y-4 border-b border-border py-10">
          <h2 className="text-foreground text-lg font-semibold">
            2. Connect peers and open channels
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            You need liquidity on the network before invoices and payments work. Use the official
            flows:{" "}
            <ExternalLink href={DOC_CONNECT}>Connect to peers</ExternalLink>,{" "}
            <ExternalLink href={DOC_OPEN_CHANNEL}>Open a channel</ExternalLink>, and{" "}
            <ExternalLink href={DOC_TRANSFER}>Basic transfer</ExternalLink>. The CLI{" "}
            <code className="text-xs">fnn-cli</code> (bundled with recent releases) talks to the same
            RPC port by default.
          </p>
          <ul className="text-muted-foreground list-disc space-y-2 pl-5 text-sm leading-relaxed">
            <li>
              <strong className="text-foreground">Creators</strong> need inbound capacity so
              supporters can pay your invoices.
            </li>
            <li>
              <strong className="text-foreground">Supporters</strong> need outbound capacity so your
              node can call <code className="text-xs">send_payment</code> when Backr triggers
              checkout or renewal.
            </li>
          </ul>
        </section>

        <section className="space-y-4 border-b border-border py-10">
          <h2 className="text-foreground text-lg font-semibold">
            3. Deploy so Backr can reach your RPC
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Your <strong className="text-foreground">domain</strong> is only the website: fans load
            Backr in the browser over HTTPS. Checkout and renewals are triggered from that UI, but{" "}
            <strong className="text-foreground">JSON-RPC calls are made from the Backr server</strong>{" "}
            to the Fiber URL you saved—not from each supporter&apos;s browser directly. So
            transacting on a hosted Backr is still possible: your node must be reachable{" "}
            <em>from wherever Backr runs</em> (your host&apos;s outbound requests), and you lock the
            RPC down so <em>only</em> those backends (or your tailnet) can call it, not the whole
            internet.
          </p>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Backr runs on a server: it will <code className="text-xs">POST</code> JSON-RPC to the
            URL you save. A URL that only exists on your laptop (
            <code className="text-xs">127.0.0.1</code>) works only if the Next.js server runs on
            the <em>same machine</em> as your node (typical local development).
          </p>
          <p className="text-muted-foreground text-sm leading-relaxed">
            For production, run FNN on a VPS or home server you control, then pick one of these
            patterns:
          </p>
          <ul className="text-muted-foreground list-disc space-y-2 pl-5 text-sm leading-relaxed">
            <li>
              <strong className="text-foreground">Private network:</strong> Tailscale/WireGuard;
              use the node&apos;s VPN IP and port (e.g.{" "}
              <code className="text-xs">http://100.x.y.z:8227</code>) if your Backr host is on the
              same network.
            </li>
            <li>
              <strong className="text-foreground">Reverse proxy:</strong> Put nginx or Caddy in
              front with TLS; restrict who can hit the RPC port (firewall allowlist, mutual TLS, or
              IP allowlist for your Backr deployment&apos;s egress IPs).
            </li>
          </ul>
          <p className="text-destructive text-sm leading-relaxed">
            Do not leave Fiber JSON-RPC <strong className="font-semibold">wide open</strong> to
            arbitrary IPs: the API can move funds on your node. Treat it like a signing endpoint:
            TLS, firewall or reverse-proxy allowlists (e.g. only your hosting provider&apos;s egress
            IPs, if they are stable), or mutual TLS. Many teams self-host Backr on a small VPS on the
            same Tailscale network as their FNN so the saved URL stays private.
          </p>
          <p className="text-muted-foreground text-sm leading-relaxed">
            RPC methods are documented in the{" "}
            <ExternalLink href={FIBER_RPC_README}>Fiber RPC README</ExternalLink>.
          </p>
        </section>

        <section className="space-y-4 border-b border-border py-10">
          <h2 className="text-foreground text-lg font-semibold">
            4. Copy the URL into Backr
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Use the <strong className="text-foreground">base</strong> URL your node listens on—no
            path after the host and port. Examples:{" "}
            <code className="text-xs">http://127.0.0.1:8227</code>,{" "}
            <code className="text-xs">https://fnn.example.com</code> (if your proxy terminates TLS
            and forwards to FNN).
          </p>
          <ul className="text-muted-foreground list-disc space-y-2 pl-5 text-sm leading-relaxed">
            <li id="creators">
              <strong className="text-foreground">Creators:</strong>{" "}
              <Link
                href="/creator/settings/basic"
                className="text-foreground font-medium underline underline-offset-4"
              >
                Creator → Settings → Basic
              </Link>
              — paste <strong className="text-foreground">Your Fiber node JSON-RPC URL</strong>.
              Without it, supporters see that Fiber payments are not set up.
            </li>
            <li id="supporters">
              <strong className="text-foreground">Supporters:</strong>{" "}
              <Link
                href="/dashboard/settings/basic"
                className="text-foreground font-medium underline underline-offset-4"
              >
                Dashboard → Settings → Basic
              </Link>
              — same field. Your node signs <code className="text-xs">send_payment</code>; you stay
              custodian of your keys.
            </li>
          </ul>
        </section>

        <section className="space-y-4 pt-10">
          <h2 className="text-foreground text-lg font-semibold">Reference</h2>
          <ul className="text-muted-foreground list-disc space-y-2 pl-5 text-sm leading-relaxed">
            <li>
              <ExternalLink href={DOC_RUN_NODE}>Run a Fiber Node</ExternalLink> (authoritative install
              &amp; config)
            </li>
            <li>
              <ExternalLink href="https://docs.fiber.world/">docs.fiber.world</ExternalLink> — full
              documentation index
            </li>
          </ul>
        </section>
      </main>

      <footer className="border-border text-muted-foreground border-t px-4 py-6 text-center text-sm">
        <p>Creator membership on Nervos CKB</p>
      </footer>
    </div>
  );
}
