"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const SETTINGS_TABS = [
  { value: "basic", label: "Basic", href: "/creator/settings/basic" },
  {
    value: "membership-plan",
    label: "Membership plan",
    href: "/creator/settings/membership-plan",
  },
] as const;

function getActiveTab(pathname: string): string {
  if (pathname === "/creator/settings" || pathname === "/creator/settings/") {
    return "basic";
  }
  const segment = pathname.replace("/creator/settings/", "").split("/")[0];
  return SETTINGS_TABS.some((t) => t.value === segment) ? segment : "basic";
}

export default function CreatorSettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const tab = getActiveTab(pathname ?? "");

  return (
    <div className="w-full space-y-6">
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
