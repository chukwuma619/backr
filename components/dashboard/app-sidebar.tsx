"use client";

import Link from "next/link";
import {
  Home,
  Compass,
  MessageCircle,
  Bell,
  Settings,
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
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { NavMain } from "@/components/dashboard/nav-main";
import { NavUser } from "@/components/dashboard/nav-user";
import { BecomeACreatorForm } from "@/components/dashboard/become-a-creator-form";

const navMainItems = [
  { title: "Home", url: "/dashboard", icon: Home },
  { title: "Explore", url: "/dashboard/discover", icon: Compass },
  { title: "Chats", url: "/dashboard/chats", icon: MessageCircle },
  { title: "Notifications", url: "/dashboard/notifications", icon: Bell },
  { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

export function AppSidebar({
  user,
  isCreator,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: {
    ckbAddress: string;
    userType: string;
  };
  isCreator?: boolean;
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
        <NavMain items={navMainItems} />
        <BecomeACreatorForm isCreator={isCreator} />
      </SidebarContent>
      <SidebarFooter className="mt-10">
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail/>
    </Sidebar>
  );
}

export function DashboardSidebarTrigger() {
  return <SidebarTrigger />;
}
