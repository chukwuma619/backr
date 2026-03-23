"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Check, ChevronsUpDown, Home, LayoutDashboard, LogOut } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn, truncateAddress } from "@/lib/utils";
import multiavatar from "@multiavatar/multiavatar";

export function NavUser({
  user,
}: {
  user: {
    ckbAddress: string;
    isCreator: boolean;
  };
}) {
  const { isMobile } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();
  const { refetch } = useAuth();

  const onMemberDashboard = pathname.startsWith("/dashboard");
  const onCreatorDashboard = pathname.startsWith("/creator");

  const handleSignOut = async () => {
    await fetch("/api/auth/session", { method: "DELETE" });
    await refetch();
    router.push("/");
  };

  const avatar = multiavatar(user.ckbAddress);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div
                className="h-8 w-8 rounded-lg"
                dangerouslySetInnerHTML={{ __html: avatar }}
              ></div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {truncateAddress(user.ckbAddress)}
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  {onCreatorDashboard ? "Creator" : "Member"}
                </span>
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuLabel className="p-0 font-normal">
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <div
                  className="h-8 w-8 rounded-lg"
                  dangerouslySetInnerHTML={{ __html: avatar }}
                ></div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {truncateAddress(user.ckbAddress, 4, 4)}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {onCreatorDashboard ? "Creator" : "Member"}
                  </span>
                </div>
              </div>
            </DropdownMenuLabel>
            {user.isCreator ? (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/dashboard"
                      className={cn(
                        "flex cursor-pointer items-center gap-2",
                        onMemberDashboard && "bg-accent",
                      )}
                    >
                      <Home className="size-4" />
                      Member dashboard
                      {onMemberDashboard ? (
                        <Check className="ml-auto size-4" />
                      ) : null}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link
                      href="/creator"
                      className={cn(
                        "flex cursor-pointer items-center gap-2",
                        onCreatorDashboard && "bg-accent",
                      )}
                    >
                      <LayoutDashboard className="size-4" />
                      Creator dashboard
                      {onCreatorDashboard ? (
                        <Check className="ml-auto size-4" />
                      ) : null}
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </>
            ) : null}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="cursor-pointer"
            >
              <LogOut className="size-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
