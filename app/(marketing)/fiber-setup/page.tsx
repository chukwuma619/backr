import type { Metadata } from "next";
import Link from "next/link";

import { fiberResources as fr } from "@/lib/docs/fiber-resources";

export const metadata: Metadata = {
  title: "Fiber setup for creators & members · Backr",
  description:
    "For creators and members: run a Fiber node, fund channels, connect safely to Backr, and pay or receive memberships.",
};

const DOC_RUN_NODE = fr.runNode;
const DOC_BASIC_TRANSFER = fr.basicTransfer;
const DOC_CONNECT_PUBLIC = fr.connectPublic;
const DOC_STABLECOIN = fr.stablecoin;
const FIBER_RELEASES = fr.fiberReleases;
const FIBER_REPO_README = fr.fiberReadme;
const FIBER_PUBLIC_NODES = fr.fiberPublicNodes;
const CKB_PUBLIC_RPC = fr.ckbPublicRpc;
const FIBER_RPC_README = fr.fiberRpcReadme;

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
  { href: "#before-backr", label: "Before it works with Backr" },
  { href: "#install-fnn", label: "Install FNN" },
  { href: "#keys-and-data", label: "Keys & data directory" },
  { href: "#liquidity", label: "Peers & channels" },
  { href: "#expose-rpc", label: "Expose RPC to Backr" },
  { href: "#creators", label: "Creators" },
  { href: "#supporters", label: "Supporters" },
  { href: "#checkout-flow", label: "Checkout & renewals" },
  { href: "#rpc-security", label: "Keep your node URL safe" },
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
          Fiber setup for creators &amp; members
        </h1>
        <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
          <strong className="text-foreground">Prefer numbered steps first?</strong>{" "}
          <Link href="/docs" className="text-foreground font-medium underline underline-offset-4">
            Open Help &amp; docs
          </Link>{" "}
          — choose <Link href="/docs/fiber/creators" className="underline underline-offset-4">creators</Link>{" "}
          or <Link href="/docs/fiber/members" className="underline underline-offset-4">members</Link>. This
          page is the longer reference.
        </p>
        <p className="text-muted-foreground mb-6 text-sm leading-relaxed">
          This page is for <strong className="text-foreground">you</strong> if you sell memberships
          on Backr or support someone who does. Backr never holds your CKB. Payments use the{" "}
          <ExternalLink href={fr.fiberDocs}>Fiber Network</ExternalLink> on Nervos. You run
          a Fiber Network Node (FNN), then paste its <strong className="text-foreground">JSON-RPC base URL</strong>{" "}
          in your Backr settings. When you subscribe or a renewal runs, Backr&apos;s systems call that
          URL on your behalf—your browser does not send the Fiber payment itself.
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
            What happens when someone pays
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Each side uses their own node. In short:
          </p>
          <ul className="text-muted-foreground list-disc space-y-2 pl-5 text-sm leading-relaxed">
            <li>
              <strong className="text-foreground">Creators</strong> — Backr asks your node to create
              the membership invoice (<code className="text-xs">new_invoice</code>).
            </li>
            <li>
              <strong className="text-foreground">Members (supporters)</strong> — Backr asks your node
              to pay that invoice (<code className="text-xs">send_payment</code>).
            </li>
          </ul>
          <p className="text-muted-foreground text-sm leading-relaxed">
            You need a running node (home server, VPS, etc.), funded wallets, and open channels so the
            payment can find a route—similar to other channel networks. Official walkthroughs:{" "}
            <ExternalLink href={DOC_RUN_NODE}>Run a Fiber Node</ExternalLink>,{" "}
            <ExternalLink href={DOC_BASIC_TRANSFER}>Basic transfer</ExternalLink>,{" "}
            <ExternalLink href={DOC_CONNECT_PUBLIC}>Connect public nodes (testnet)</ExternalLink>.
          </p>
        </section>

        <section id="before-backr" className="space-y-4 border-b border-border pb-10 scroll-mt-20">
          <h2 className="text-foreground text-lg font-semibold">
            Before memberships work
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Backr only calls your saved URL to create or pay invoices. It does{" "}
            <strong className="text-foreground">not</strong> open channels or pick peers for you—
            you set that up on your node. Follow these steps so checkout and renewals succeed (see
            also the{" "}
            <ExternalLink href={FIBER_REPO_README}>Fiber README</ExternalLink> and{" "}
            <ExternalLink href={FIBER_RPC_README}>RPC reference</ExternalLink> on GitHub):
          </p>
          <ol className="text-muted-foreground list-decimal space-y-3 pl-5 text-sm leading-relaxed">
            <li>
              <strong className="text-foreground">Same network for you and your audience.</strong>{" "}
              Creators and members must all use the <strong className="text-foreground">same</strong>{" "}
              Fiber environment (e.g. everyone on testnet, or everyone on mainnet). If one person is
              on testnet and another on mainnet, payments will not work.
            </li>
            <li>
              <strong className="text-foreground">Trusted CKB RPC in config.</strong> In your{" "}
              <code className="text-xs">config.yml</code>, set <code className="text-xs">rpc_url</code>{" "}
              to a CKB JSON-RPC endpoint you trust (see{" "}
              <ExternalLink href={CKB_PUBLIC_RPC}>Nervos public RPC list</ExternalLink>). FNN needs this
              for chain sync and on-chain funding flows.
            </li>
            <li>
              <strong className="text-foreground">Prove a manual Fiber payment first.</strong> Follow
              the official <ExternalLink href={DOC_BASIC_TRANSFER}>Basic transfer</ExternalLink> (includes
              connect peers and open channel) until a payment succeeds outside Backr. If that fails, Backr cannot fix
              it—you need routing, liquidity, or peers adjusted (see{" "}
              <ExternalLink href={FIBER_PUBLIC_NODES}>public relay topology</ExternalLink> on GitHub
              for how local nodes use relays on mainnet/testnet).
            </li>
            <li>
              <strong className="text-foreground">Use a URL this website can reach.</strong> After you
              set up HTTPS (or a VPN both you and this site share), test{" "}
              <code className="text-xs">node_info</code> against the{" "}
              <strong className="text-foreground">exact base URL</strong> you will paste—ideally from
              another device or network. A URL that only works on your own computer (like{" "}
              <code className="text-xs">127.0.0.1</code>) will not work for most people, because
              Backr&apos;s servers are not on your laptop.
            </li>
            <li>
              <strong className="text-foreground">Liquidity direction and headroom.</strong> Creators
              need enough <strong className="text-foreground">inbound</strong> for the full tier price.
              Supporters need enough <strong className="text-foreground">outbound</strong> for the
              payment plus routing fees. Channel balances reserve on-chain CKB for closes (see{" "}
              <ExternalLink href={FIBER_PUBLIC_NODES}>channel capacity notes</ExternalLink> in the Fiber
              repo)—size channels larger than the subscription amount alone.
            </li>
            <li>
              <strong className="text-foreground">Members: two payments in a row when a platform fee applies.</strong>{" "}
              Some communities charge a small platform contribution on top of the creator&apos;s price.
              When that is enabled, your node sends <strong className="text-foreground">two</strong>{" "}
              payments when you subscribe—first to the creator, then the contribution. Leave enough
              balance and channel capacity for both, and keep your node online.
            </li>
            <li>
              <strong className="text-foreground">Wait after opening channels.</strong> If you see
              routing errors immediately after <code className="text-xs">open_channel</code>, wait for
              graph gossip to catch up before testing Backr (Fiber documents this pattern).
            </li>
            <li>
              <strong className="text-foreground">Keep your node running for renewals.</strong>{" "}
              Memberships try to renew on a regular schedule. If your node is off or unreachable,
              that renewal may fail until you are back online with working channels.
            </li>
            <li>
              <strong className="text-foreground">Plan FNN upgrades carefully.</strong> The Fiber
              project warns that protocol and storage can change between releases—often you should close
              channels or migrate before upgrading <code className="text-xs">fnn</code>. Read{" "}
              <ExternalLink href={FIBER_REPO_README}>Compatibility / upgrade notes</ExternalLink> on
              GitHub before replacing binaries on a funded node.
            </li>
          </ol>
        </section>

        <section id="install-fnn" className="space-y-4 border-b border-border py-10 scroll-mt-20">
          <h2 className="text-foreground text-lg font-semibold">
            2. Install and run FNN
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
              <ExternalLink href={fr.fiberRepo}>fiber</ExternalLink> repo.
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
            3. Keys and the <code className="text-xs font-normal">-d</code> data directory
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
            4. Peers, channels, and liquidity
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Invoices and <code className="text-xs">send_payment</code> only work when your node has a
            viable path on the channel graph. Use:
          </p>
          <ul className="text-muted-foreground list-disc space-y-2 pl-5 text-sm leading-relaxed">
            <li>
              <ExternalLink href={DOC_BASIC_TRANSFER}>
                Basic transfer — connect peers, open a channel, pay an invoice
              </ExternalLink>{" "}
              (single official walkthrough; there are no separate peer/channel pages)
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
          <p className="text-muted-foreground text-sm leading-relaxed">
            Mainnet relay pubkeys and multi-hop examples live in the Fiber repo:{" "}
            <ExternalLink href={FIBER_PUBLIC_NODES}>Public nodes user manual</ExternalLink>.
          </p>
        </section>

        <section id="expose-rpc" className="space-y-4 border-b border-border py-10 scroll-mt-20">
          <h2 className="text-foreground text-lg font-semibold">
            5. Expose JSON-RPC so Backr can call your node
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Backr sends JSON-RPC to the <strong className="text-foreground">base URL</strong> you
            save—just the origin, no path after the host (example:{" "}
            <code className="text-xs">https://fiber.example.com</code>).
          </p>
          <p className="text-muted-foreground text-sm leading-relaxed">
            <strong className="text-foreground">Typical setup:</strong> run the node on a VPS or home
            server, keep the Fiber RPC port bound to localhost, and put{" "}
            <strong className="text-foreground">nginx</strong> or Caddy in front with HTTPS. Point
            your domain at that proxy, which forwards to <code className="text-xs">127.0.0.1:8227</code>.
            Use a firewall and tight access rules where you can—this endpoint can move funds.
          </p>
          <p className="text-muted-foreground text-sm leading-relaxed">
            <strong className="text-foreground">Reachability:</strong> this site needs to reach your
            URL from the internet, unless you use a private network (for example Tailscale) that both
            you and this Backr instance share. If you are not sure, ask whoever runs this community.
          </p>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Technical method list:{" "}
            <ExternalLink href={FIBER_RPC_README}>Fiber RPC README</ExternalLink>.
          </p>
        </section>

        <section id="creators" className="space-y-4 border-b border-border py-10 scroll-mt-20">
          <h2 className="text-foreground text-lg font-semibold">
            6. Creators — checklist
          </h2>
          <ol className="text-muted-foreground list-decimal space-y-2 pl-5 text-sm leading-relaxed">
            <li>Run FNN with funded wallet and testnet/mainnet config you intend to use.</li>
            <li>Connect peers and open channels; confirm you can receive (inbound liquidity).</li>
            <li>
              Expose a <strong className="text-foreground">stable HTTPS URL</strong> (or a shared
              private network URL) that this site can call.
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
            <li>
              Run <code className="text-xs">node_info</code> against the <strong className="text-foreground">same URL</strong>{" "}
              you will paste (see &quot;Before memberships work&quot; above).
            </li>
            <li>Create tiers and test a small subscription with a second account that has its own FNN.</li>
          </ol>
        </section>

        <section id="supporters" className="space-y-4 border-b border-border py-10 scroll-mt-20">
          <h2 className="text-foreground text-lg font-semibold">
            7. Supporters — checklist
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
              Each member needs their own node and URL so payments come from their wallet.
            </li>
            <li>
              If this community uses a platform contribution on top of the creator price, expect{" "}
              <strong className="text-foreground">two</strong> payments from your node when you
              subscribe—keep extra outbound capacity.
            </li>
            <li>Visit a creator, choose a tier, and use Support — your node will execute send_payment.</li>
          </ol>
        </section>

        <section id="checkout-flow" className="space-y-4 border-b border-border py-10 scroll-mt-20">
          <h2 className="text-foreground text-lg font-semibold">
            8. What happens on subscribe and renewal
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            <strong className="text-foreground">First checkout:</strong> Backr (server) asks the
            creator&apos;s FNN for a tier invoice via <code className="text-xs">new_invoice</code>,
            then asks your FNN to <code className="text-xs">send_payment</code>. Your browser only
            triggers the request; it does not sign Fiber calls.
          </p>
          <p className="text-muted-foreground text-sm leading-relaxed">
            If the node returns <code className="text-xs">Created</code> or{" "}
            <code className="text-xs">Inflight</code>, Backr keeps checking until the payment finishes
            successfully or fails (or until a time limit is reached).
          </p>
          <p className="text-muted-foreground text-sm leading-relaxed">
            <strong className="text-foreground">Renewals:</strong> Backr tries to charge again on a
            regular schedule (often about once per day). Keep your node online, your URL saved in
            settings, and enough liquidity—otherwise a renewal may fail until you fix it.
          </p>
        </section>

        <section id="rpc-security" className="space-y-4 border-b border-border py-10 scroll-mt-20">
          <h2 className="text-foreground text-lg font-semibold">
            9. Keep your node URL safe
          </h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Anyone who can call your JSON-RPC URL can ask your node to move funds. Use HTTPS, lock
            down who can reach the port (firewall, VPN, or allowlist), and do not share the URL in
            public places. Backr stores only the URL you enter and uses it to complete memberships you
            start or renewals you are due for—same idea as section 5.
          </p>
          <p className="text-muted-foreground text-sm leading-relaxed">
            If payments fail with routing errors and you rely on private or unusual channel setups,
            Fiber&apos;s docs discuss <strong className="text-foreground">routing hints</strong>—
            your node logs and the{" "}
            <ExternalLink href={FIBER_RPC_README}>RPC README</ExternalLink> are the place to dig in.
          </p>
        </section>

        <section id="troubleshooting" className="space-y-4 border-b border-border py-10 scroll-mt-20">
          <h2 className="text-foreground text-lg font-semibold">
            10. Troubleshooting
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
              <strong className="text-foreground">Route / payment errors</strong> — wait for the
              channel graph to catch up; confirm your channel is ready; check balances and peers
              (Fiber docs). Unusual private paths may need routing hints—see the RPC README.
            </li>
            <li>
              <strong className="text-foreground">Checkout hangs then errors</strong> — the network
              may still be catching up; retry after a few minutes. If it keeps failing, check
              liquidity and that your URL is reachable from the internet (or your shared VPN).
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
          <h2 className="text-foreground text-lg font-semibold">11. Reference</h2>
          <ul className="text-muted-foreground list-disc space-y-2 pl-5 text-sm leading-relaxed">
            <li>
              <ExternalLink href={DOC_RUN_NODE}>Run a Fiber Node</ExternalLink>
            </li>
            <li>
              <ExternalLink href={DOC_BASIC_TRANSFER}>Basic transfer example</ExternalLink>
            </li>
            <li>
              <ExternalLink href={DOC_CONNECT_PUBLIC}>Connect public nodes (testnet)</ExternalLink>
            </li>
            <li>
              <ExternalLink href={DOC_STABLECOIN}>Transfer stablecoins</ExternalLink>
            </li>
            <li>
              <ExternalLink href={fr.fiberDocs}>docs.fiber.world</ExternalLink> — full
              index
            </li>
            <li>
              <ExternalLink href={FIBER_RPC_README}>Fiber RPC README</ExternalLink>
            </li>
            <li>
              <ExternalLink href={FIBER_REPO_README}>Fiber README (build, keys, upgrades)</ExternalLink>
            </li>
            <li>
              <ExternalLink href={FIBER_PUBLIC_NODES}>Fiber public nodes (mainnet/testnet relays)</ExternalLink>
            </li>
            <li>
              <ExternalLink href={CKB_PUBLIC_RPC}>CKB public JSON-RPC nodes</ExternalLink>
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
