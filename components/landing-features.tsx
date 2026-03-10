import {
  FileText,
  Users,
  Wallet,
  MessageCircle,
  Sparkles,
  Shield,
} from "lucide-react";

const features = [
  {
    icon: FileText,
    title: "Exclusive posts",
    description:
      "Create free or paid posts. Draft and publish on your schedule. Share to Nostr.",
  },
  {
    icon: Users,
    title: "Membership tiers",
    description:
      "Set up tiers with CKB pricing. Control who sees your content with audience settings.",
  },
  {
    icon: MessageCircle,
    title: "Community chats",
    description:
      "Connect with your supporters through direct and group chats.",
  },
  {
    icon: Wallet,
    title: "CKB payments",
    description:
      "Accept payments on Nervos CKB. No middlemen. Direct creator-to-supporter.",
  },
  {
    icon: Sparkles,
    title: "Nostr integration",
    description:
      "Publish posts to Nostr for broader reach. Your content, your audience.",
  },
  {
    icon: Shield,
    title: "On-chain identity",
    description:
      "Connect with your CKB wallet. Your keys, your account. No email required.",
  },
];

export function LandingFeatures() {
  return (
    <section className="border-t border-border px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <h2 className="text-center text-2xl font-semibold tracking-tight sm:text-3xl">
          Built for creators and supporters
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
          Everything you need to monetize your work or support creators you
          believe in.
        </p>
        <div className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="rounded-lg border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-5" />
              </div>
              <h3 className="mt-4 font-semibold">{title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
