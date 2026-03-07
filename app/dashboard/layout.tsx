import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import {
  AppSidebar,
  DashboardSidebarTrigger,
} from "@/components/dashboard/app-sidebar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/");
  }



  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
          <DashboardSidebarTrigger />
         
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
