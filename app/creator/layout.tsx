import { redirect } from "next/navigation";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { CreatorSidebar } from "@/components/dashboard/creator-sidebar";
import { getCreatorForDashboard } from "@/lib/creators/get-creator-for-dashboard";

export default async function CreatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, creator } = await getCreatorForDashboard();

  if (!user) {
    redirect("/");
  }

  if (!creator) {
    redirect("/create");
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <CreatorSidebar
        user={{
          ckbAddress: user.ckbAddress,
          userType: user.userType,
        }}
        variant="inset"
      />
      <SidebarInset>
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 h-full">
              <div className="px-4 lg:px-6 h-full">{children}</div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
