import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import {
  getCreatorByUserId,
  getTiersAndPerksByCreatorId,
} from "@/lib/db/queries";
import { Button } from "@/components/ui/button";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { DashboardTiersSection } from "@/components/dashboard/dashboard-tiers-section";
import { EarningsSection } from "@/components/dashboard/earnings-section";
import { DashboardPostsSection } from "@/components/dashboard/dashboard-posts-section";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/");
  }

  const { data, error } = await getCreatorByUserId(user.id);

  if (error) {
    console.error(error);
    return <div>Error: {error.message}</div>;
  }

  if (!data) {
    redirect("/onboarding");
  }

  const { data: tiersAndPerks, error: tiersAndPerksError } =
     await getTiersAndPerksByCreatorId(data.id);
  if (tiersAndPerksError) {
    console.error(tiersAndPerksError);
    return <div>Error: {tiersAndPerksError.message}</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="border-b border-border px-4 py-3 flex items-center justify-between">
        <Link
          href="/"
          className="text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          Backr
        </Link>
        <div className="flex gap-4">
          <Link href="/feed" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Feed
          </Link>
          <Link href="/supports" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            My supports
          </Link>
          <Link href="/discover" className="text-sm font-medium text-muted-foreground hover:text-foreground">
            Discover
          </Link>
          <Link href="/dashboard" className="text-sm font-medium">
            Dashboard
          </Link>
        </div>
      </header>
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-8">
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
            <Link href={`/c/${data.slug}`}>
              <Button variant="outline">View your hub</Button>
            </Link>
          </div>

          <ProfileForm data={data} />

          <DashboardTiersSection creator={data} tiersAndPerks={tiersAndPerks} />

          <EarningsSection creatorId={data.id} />

          <DashboardPostsSection creator={data} tiers={tiersAndPerks} />
        </div>
      </main>
    </div>
  );
}
