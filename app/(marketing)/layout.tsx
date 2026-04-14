import { MarketingNav } from "@/components/marketing-nav";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <MarketingNav />
      {children}
    </div>
  );
}
