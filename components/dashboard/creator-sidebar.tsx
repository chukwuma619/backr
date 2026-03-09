"use client";

import Link from "next/link";
import {
  LayoutDashboard,
  FileText,
  MessageCircle,
  Settings,
Bell,
Users,
Banknote,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavMain } from "@/components/dashboard/nav-main";
import { NavUser } from "@/components/dashboard/nav-user";

const creatorNavItems = [
  { title: "Overview", url: "/creator", icon: LayoutDashboard },
  { title: "Posts", url: "/creator/post", icon: FileText },
  { title: "Audience", url: "/creator/audience", icon: Users },
  { title: "Payouts", url: "/creator/payouts", icon: Banknote },
  { title: "Chats", url: "/creator/chats", icon: MessageCircle },
  { title: "Notifications", url: "/creator/notifications", icon: Bell },
  { title: "Settings", url: "/creator/settings", icon: Settings },
];

export function CreatorSidebar({
  user,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: {
    ckbAddress: string;
    userType: string;
  };
}) {
  return (
    <Sidebar collapsible="icon" side="left" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Backr">
              <Link href="/" className="flex items-center gap-2">
                <span className="text-base font-semibold">Backr</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={creatorNavItems} />
       
      </SidebarContent>
      <SidebarFooter className="mt-10">
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
