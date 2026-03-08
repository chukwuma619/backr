"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const SETTINGS_TABS = [
  { value: "basic", label: "Basic", href: "/dashboard/settings/basic" },
  { value: "membership", label: "Membership", href: "/dashboard/settings/membership" },
  { value: "billing-history", label: "Billing History", href: "/dashboard/settings/billing-history" },
] as const;

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const segment = pathname.split("/").pop() ?? "";
  const tab =
    SETTINGS_TABS.find((t) => t.value === segment)?.value ?? "basic";

  return (
    <div className="max-w-2xl mx-auto w-full space-y-6">
      <Tabs value={tab} className="w-full">
        <TabsList>
          {SETTINGS_TABS.map((t) => (
            <TabsTrigger key={t.value} value={t.value} asChild>
              <Link href={t.href}>{t.label}</Link>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
      {children}
    </div>
  );
}